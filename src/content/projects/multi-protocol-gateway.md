---
role: 'The gateway firmware across both platforms: the protocol routing, the update path over CAN, the concurrent BLE and Wi-Fi radio work, the telemetry pipeline, and the memory audit that made it fit.'
context: 'Client under NDA, freelance.'
tools: 'ESP-IDF, FreeRTOS, Particle Boron and Tracker T404, ESP32, CAN bus, BLE, MQTT, Protobuf and JSON, cellular and Wi-Fi.'
licence: 'Client-owned, unpublished.'
status: shipped
diagrams:
  - src: ../../assets/projects/multi-protocol-gateway-block-diagram.webp
    alt: 'Block diagram with the scanner node on the left and the gateway on the right, joined by two labelled flows across the CAN bus. Inside the node, the BLE scanner feeds a scan state machine, which reaches the bus through the TWAI CAN interface; that same interface feeds an OTA handler, which writes each chunk to flash and on into the OTA partition. Inside the gateway, a CAN master feeds a telemetry queue, an MQTT client and a cellular or Wi-Fi uplink, and a firmware server takes an image from that uplink back out onto the bus. Scan results travel to the gateway staggered by one second times the node ID; the firmware image travels the other way as chunks carrying an offset and an acknowledgement.'
    caption: 'Two flows on one bus, in opposite directions: results up, firmware down. The staggering and the acknowledgement per chunk exist for the same reason — CAN arbitrates frames and not conversations, so the schedule has to be built into the protocol on top of it.'
specs:
  - label: 'Hardware'
    value: 'Particle Boron / Tracker T404, ESP32 on native ESP-IDF'
  - label: 'Buses and radios'
    value: 'CAN bus, BLE, cellular, Wi-Fi'
  - label: 'Nodes per bus'
    value: 'Eight addressable by DIP switch; five per vehicle in the largest installation'
  - label: 'Beacons tracked'
    value: 'About twenty per vehicle'
  - label: 'Field update'
    value: 'FOTA over CAN — chunked image, ACK per chunk, whole-image checksum, boot partition switched only on a match'
  - label: 'Update time'
    value: 'About five minutes a node, scheduled into the window when the fleet is parked'
  - label: 'Update success rate'
    value: 'Better than 99%, measured in that window with every other service stopped'
  - label: 'Telemetry'
    value: 'Asynchronous MQTT, JSON and Protobuf payloads'
  - label: 'Memory'
    value: 'SRAM use cut by more than 30%, to inside Particle''s recommended 85% ceiling'
draft: false
---

## Problem

A gateway sits between networks that were never designed to meet, and this one
had to bridge three at once: a CAN bus with nodes on it, BLE devices in
range, and a cellular or Wi-Fi link to the cloud.

Bridging them is routing, and routing is the easy half. The hard half is that
the nodes on the CAN bus also need their firmware updated, and CAN was not
designed to carry a firmware image. It is a short-frame, priority-arbitrated
control bus — eight data bytes per frame, no sessions, no acknowledged
transport, and no notion of a file. Every alternative to sending the image over
it is worse in the field: a technician with a programmer at each node, or a
second wire to every node that exists only for updates.

So the constraint is: deliver a firmware image, intact and verifiable, over a
bus with no transport layer, to a node that will be unreachable if it goes
wrong — on a processor that spends the rest of its life keeping two radios up
and the telemetry flowing.

The number that sets the shape of the answer is five minutes: that is what one
node takes to receive an image over the bus. A vehicle carries up to five of
them, so updating one is most of half an hour with that vehicle out of service,
and a fleet is a night's work. It does not get to interleave with the day job.
Updates are scheduled into the window when the fleet is parked, and the design
question stops being "how do we update without disturbing anything" and becomes
"how do we make an unattended transfer safe to leave running".

## Architecture

The application is a vehicle fleet: each vehicle carries a gateway, the CAN
nodes that scan for beacons around it, and the beacons themselves, and it
reports over cellular from wherever it happens to be.

The hardware was not mine. The boards arrived as they were, and everything
described here is the firmware on them — which is also why the platform
constraints below are treated as given rather than argued with.

Two hardware platforms carry the same architecture. Particle Boron and Tracker
T404 bring managed cellular; the ESP32 runs on native ESP-IDF rather than a
wrapper, which is what makes the radio scheduling and the heap behaviour
described below reachable at all.

A node on the bus is an ESP32 doing one job and answering to one address. It
scans for BLE beacons, collects what it finds — identifier, address, signal
strength, battery — and hands the result to a small state machine that runs the
scan cycle. Everything that leaves the node leaves through its CAN interface,
and the node's address on the bus is read off a DIP switch at boot, which is
also what decides when it is allowed to speak.

The gateway is the far end of both flows. Results come up into a telemetry
queue and out over MQTT; firmware goes the other way, from the uplink to a
server that packetises an image and feeds it onto the bus a chunk at a time.

That update path is a protocol built on top of CAN rather than a use of CAN:
each chunk carries its offset and is acknowledged before the next one is sent,
and the node writes it into the OTA partition it is not running from while
keeping a running checksum. Only when that checksum matches the one the
transfer opened with does the node make the new partition bootable and restart
into it.

Telemetry runs the other way and asynchronously, so a slow uplink never stalls
the bus work: MQTT out, with payloads serialised as JSON or Protobuf depending
on how much the link costs.

## Design decisions

**Firmware over CAN rather than around it.** Covered above — the alternatives
put a person or a second wire at every node.

**A failed transfer restarts from zero, and that was a decision rather than an
oversight.** Resuming from the last acknowledged offset is not hard to build:
the node already knows where it got to, and the protocol already carries the
offset it would need. It was left out because the client needed the smallest
thing that worked in the field, and because the maintenance window is what
makes it affordable — a restart costs five minutes inside a window that was
booked anyway, so the feature would have bought less than it cost. It is the
first thing to add if a node is ever updated outside that window.

**The image being written is never the image being run.** Two guards, and they
fail differently. The offset check and the acknowledgement per chunk catch a
transfer that went wrong in flight; the whole-image checksum catches an image
that arrived complete and is still not the one that was sent. Neither of them
touches the running firmware, because the write goes to the inactive OTA
partition and the boot partition is switched last — so a node that loses power
at any point before that switch comes back up on the firmware it already had.

**Native ESP-IDF rather than an abstraction over it.** Running BLE scanning
and Wi-Fi concurrently on the same silicon is a scheduling problem before it is
an API problem: both radios want the same core, and a naive port starves one.
The background scanner is a separate task with its own budget so neither radio
holds the other off.

**The nodes take turns without being told to.** CAN arbitrates frames, not
conversations: every node finishing a scan on the same edge and reporting at
once is a bus that spends its time backing off. Each node instead waits a
multiple of its own address before it reports, so the schedule falls out of an
address the node already has and nothing has to poll it. That address does a
second job at power-up, staggering the boots so the nodes do not all draw
inrush current at the same moment.

**A heap audit instead of a bigger part.** On the Particle platform the
application does not get the whole of the RAM: Device OS runs underneath it,
keeps the cellular connection alive and does its own work in the background,
and what it needs is not a fixed number the application can plan around. Past
about 95% total usage the device stopped being reliable — it did not fail on
the line that allocated, it failed later, whenever a background task happened
to need memory that was no longer there. Particle's own guidance is to stay
under 85%, and that number is the specification the audit was written against,
which is the useful thing about it: the target came from the platform vendor
rather than from a guess about how much headroom feels safe.

Getting there took more than 30% off SRAM use — buffer pooling in place of
per-message allocation, less fragmentation, and RTOS task stacks sized to what
the tasks actually use rather than to a comfortable guess. A crash of this kind
is the argument for measuring rather than for buying a bigger part, because a
bigger part moves the threshold and does not remove it.

**JSON or Protobuf, chosen per link.** JSON is readable and expensive;
Protobuf is compact and opaque. On a metered cellular link the bytes are the
bill, so the compact encoding goes on the link that charges for bytes and the
readable one stays where a human might have to look at a message. The saving
was never measured on real payloads, so there is no ratio quoted here.

## Validation

The memory work is validated by the threshold it was written against: usage
under Particle's recommended 85% ceiling, and the crashes that came of sitting
near 95% did not come back.

Updates over CAN complete on better than 99% of attempts. That number deserves
its context rather than a victory lap: it is measured in the maintenance
window, where every other service on the device is stopped and the OTA transfer
is the only thing on the bus. Removing the contention is most of why the figure
is what it is — which is the point of scheduling the work there, but it also
means it is not a claim about updating a node that is busy.

The system then ran under load for several weeks without a failure. That is
also the only evidence offered for the concurrent BLE and Wi-Fi behaviour:
weeks of field uptime with both radios working, rather than a bench measurement
of what each one gets. A throughput number would be the stronger claim and
there is not one.

## What shipped

It went into production on a transport fleet. A vehicle carries one gateway,
up to five CAN scanner nodes, and around twenty BLE beacons for them to find;
telemetry leaves over cellular and firmware arrives the same way, then crosses
the last few metres over the bus. It ran for weeks under load without a
failure, and updates go out at night while the fleet is parked.

My part was the firmware, on both platforms, and nothing else: the boards, the
module choice and the enclosure were somebody else's. How many vehicles it
ended up on is not something I was told — the work was delivered to the client
and the client deployed it, which is the ordinary shape of contract firmware
and is worth saying rather than rounding up.

What is still missing is written into the page above: an update that resumes
instead of restarting, and a measured figure for the payload saving that
decided the encoding. Neither was needed to ship. Both are what I would do
first if it came back.
