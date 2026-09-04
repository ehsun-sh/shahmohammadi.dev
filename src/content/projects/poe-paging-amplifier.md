---
role: 'The device end to end: the carrier board, the embedded Linux bring-up and the device tree that binds it to the hardware, the audio path from SIP to the amplifier, the local application stack, and the update mechanism.'
context: 'Teqware.'
tools: 'Altium Designer, NXP i.MX8M Mini, embedded Linux, device tree (DTS/DTSO), ALSA, SIP/VoIP, Class-D audio, .NET with Blazor Server, containers, UL and FCC compliance work.'
licence: 'Employer-owned, unpublished.'
status: prototype
diagrams:
  - src: ../../assets/projects/poe-paging-block-diagram.webp
    alt: 'Block diagram of the endpoint with an isolation boundary drawn as a dashed vertical line. One PoE Ethernet cable enters on the left and splits: the network side runs to a processor module running embedded Linux on an i.MX8M Mini, then to an audio pipeline carrying SIP and VoIP, then to a highlighted Class-D output stage that drives a 25 V speaker line without an output transformer. The power side runs to an isolated PoE front end spanning the width of the board, which supplies both the processor and the amplifier. Opto-isolated inputs, relay outputs and an M.2 slot for an optional BLE radio sit above the processor module.'
    caption: 'Two things arrive on one cable and everything downstream lives inside what that cable can deliver. The isolation boundary is where the building''s wiring stops and the device begins.'
specs:
  - label: 'Processor'
    value: 'NXP i.MX8M Mini, embedded Linux'
  - label: 'Board'
    value: '4-layer carrier board, plenum-rated product'
  - label: 'Power and network'
    value: 'Power over Ethernet on one cable, isolated front end, or a local supply'
  - label: 'Audio output'
    value: '20 W into a 25 V constant-voltage speaker line, direct-drive Class-D'
  - label: 'Voice'
    value: 'SIP / VoIP, standard telephony and wideband codecs'
  - label: 'Field I/O'
    value: 'Opto-isolated inputs, relay outputs, M.2 slot for an optional BLE radio'
  - label: 'Local application'
    value: '.NET with a Blazor Server web UI, containerised'
  - label: 'Updates'
    value: 'OTA with dual-partition (A/B) failsafe recovery'
  - label: 'Compliance'
    value: 'Designed to UL 62368-1, UL 2043 (air-handling spaces), UL 294, FCC Part 15, ICES-003'
---

## Problem

A paging endpoint has to be heard across a hallway full of people, and it has
to be installed by one person pulling one cable.

Those two requirements pull against each other, and that tension is the whole
design. Being heard is a power question: the speakers are daisy-chained along a
25 V constant-voltage line, each with its own tap, and covering a corridor or a
cafeteria takes 20 W of audio at the end of it. One-cable installation means
Power over Ethernet, and PoE does not deliver watts on request — it delivers
what the standard guarantees at the far end of the run, which is a fixed number
decided by the class the installation provides. Everything the device does has
to fit inside it: the amplifier, a processor running a full Linux userland, and
a containerised application on top of that.

It is also a mains-adjacent product that lives in a ceiling, so it is not
finished when it works. It is designed against the safety standard for
equipment of this class, the fire standard that applies to anything installed
in an air-handling space, the access-control standard because it can release a
door, and the emissions limits for the market it ships into — with a switching
amplifier and an Ethernet PHY sharing one four-layer board.

## Architecture

One carrier board around an NXP i.MX8M Mini module running embedded Linux.
Power and network arrive together and are split at an isolated front end, which
is also the safety boundary: everything downstream of it is at low voltage with
respect to the building's cable plant.

Audio runs as a pipeline rather than a passthrough. A SIP call terminates on
the processor, the stream is decoded and equalised, and a direct-drive Class-D
stage takes it to the 25 V speaker line. Direct drive is what removes the
output transformer between the amplifier and the line, along with its loss, its
weight and its cost.

Around that sit the things a device in a building needs: opto-isolated inputs
and relay outputs for door contacts, triggers and interlocks, and an M.2 slot
for an optional BLE radio, which is how the access-control product reads a tag
at a door. The local application is .NET with a Blazor Server front end running
in containers, so a technician on site gets a real interface and live telemetry
rather than a serial console.

The board's own peripherals are bound to the kernel through device tree
overlays rather than patched drivers.

## Design decisions

**One cable, and therefore a power budget rather than a power supply.** The
amplifier is the largest load on the board and the supply is fixed by whatever
class of PoE the building provides, so output is managed against the power
actually available rather than left to whoever last moved the volume control.
The point is that the device behaves correctly on an under-provisioned
installation instead of failing in the middle of an announcement — a paging
system's worst failure is silence at the moment it is needed.

**Direct-drive Class-D rather than a transformer-coupled output.** Class-D
because efficiency is not optional on a power budget, and direct drive because
a transformer at this power is loss, weight and cost for a job the supply rail
can do instead.

**Embedded Linux with the application in containers.** A paging endpoint is
part of a building system with a long service life, and the software on it will
outlive the first release. A full Linux userland with a containerised
application and a web UI means features and fixes ship as images rather than as
firmware flashes, and a technician gets diagnostics on site without special
tools.

**Device tree overlays rather than driver patches.** Board-specific bindings
live in DTS/DTSO, so the difference between this hardware and the reference
platform is data the kernel reads rather than source someone has to re-apply at
every kernel bump. It is the difference between a board that can take a
security update and one that cannot.

**A/B partitions for updates.** An endpoint in a ceiling is expensive to reach,
so an update that can brick one is not an update mechanism. Two partitions mean
a failed image falls back to the one that was working.

**Compliance as an input to the first schematic.** Safety clearance and
creepage set physical geometry, and geometry is not something a layout can be
talked into afterwards. The standards the product is designed against were
chosen before the board was, which is the cheap end of the problem to solve
them at.

## Validation

Bring-up on the first boards covered the parts that had to be proven together:
the audio path end to end from a SIP call to a live speaker line, the device's
behaviour across the range of PoE classes it can be installed on, the field I/O
and the local application on real hardware.

Two honest qualifications. The compliance standards above are design targets on
this revision, not certifications — none is claimed. And the bench figures
behind the power and audio results are my employer's, so this page describes
what was measured and not the numbers themselves.

## Where it stands

This is the first prototype, and it does what it was built to do: it is powered
and networked over one cable, it takes a SIP call and puts it on a 25 V speaker
line at full output, and it runs its application stack on top of that.

A second revision is in progress. That is the normal shape of a hardware
programme rather than a caveat — a first spin exists to be measured, and what
it teaches goes into the next board. What is worth stating about this one is
the span: a product this size is usually a board designer, a Linux integrator
and an application team, and here it was one scope from the schematic through
the kernel bindings to the web UI a technician sees.
