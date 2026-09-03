---
role: 'Led the pilot end to end: the four subsystems — bus tag, station gateway, station display, backend — their boards and firmware, the solar power budget, and the multi-threaded C# socket server.'
context: 'Municipality of Tehran.'
tools: 'Altium Designer, PIC18F embedded firmware, Zigbee (IEEE 802.15.4), GSM/GPRS, C# multi-threaded socket server.'
status: shipped
gallery:
  - src: ../../assets/projects/city-bus-arrival-display-installed.webp
    alt: 'A pilot display installed on a wall at a bus stop, showing the route as a vertical chain of named stops linked by arrows, with the approaching bus marked partway down the list.'
    caption: 'A pilot unit in service. The route is drawn as the sequence of stops rather than as a countdown, so a passenger reads position rather than having to trust an estimate.'
diagrams:
  - src: ../../assets/projects/city-bus-arrival-display-block-diagram.webp
    alt: 'Block diagram: a bus transponder tag reaches the stop over a Zigbee mesh. At the stop, a solar panel and charge controller power a station gateway and a station monitor driving an outdoor LED display; the gateway alone carries a 2G GPRS link up to a multi-threaded C# socket server and back down.'
    caption: 'The tags talk for free and only the stop pays for airtime. That single boundary is what puts a tag under $30 and a complete station under $300.'
specs:
  - label: 'Bus tag'
    value: 'Under $30 each'
  - label: 'Station unit'
    value: 'Under $300 complete — solar panel, charge controller, modem, outdoor LED display'
  - label: 'Controller'
    value: 'Microchip PIC18F'
  - label: 'Cellular'
    value: 'SIM800, 2G GSM/GPRS'
  - label: 'Local radio'
    value: 'Zigbee mesh, Microchip MRF24J40'
  - label: 'Station power'
    value: 'Solar, no grid connection'
  - label: 'Backend'
    value: 'Multi-threaded C# TCP/IP socket server, hundreds of concurrent nodes'
---

## Problem

Telling a passenger when the next bus arrives is easy if the stop has power, a
network connection and a budget. In Tehran in 2012 it had none of the three.

There was no electrical grid infrastructure at the bus stops, so every station
unit had to make its own power and survive nights and cloudy weeks on what it
banked. Commercial 3G had not launched in Iran, so the only wide-area data
available was 2G GPRS. And this was a municipal pilot that had to prove itself
on cost before anyone would fund a rollout, which put a hard ceiling on what
each of the hundreds of nodes could be allowed to cost.

The last constraint is the one that shaped everything. A design that works but
costs $2,000 a stop answers the wrong question.

## Architecture

Four subsystems, each doing the least it can.

A **bus-mounted transponder tag** rides on the vehicle as a tracking and beacon
unit. A **station gateway board** is the solar-powered node at the stop: it
receives telemetry locally and carries the uplink. A **station monitor board**
drives the outdoor LED display showing route status and arrival progress, on an
ultra-low-power budget because it is running on the same solar panel. A
**central telemetry backend** — a multi-threaded C# TCP/IP socket server —
talks to hundreds of station gateways and bus tags at once and computes what
each display should be showing.

The hardware is deliberately ordinary: a Microchip PIC18F microcontroller and a
SIM800 GSM module, which is roughly the cheapest combination that can do the
job at all.

## Design decisions

**A Zigbee mesh under a cellular uplink, rather than cellular everywhere.**
This is the decision the whole cost target rests on. Putting a modem and a SIM
on every bus tag would have made each tag a recurring bill as well as a
hardware cost. Instead the tags speak Zigbee — Microchip MRF24J40 transceivers
in a wireless mesh — and the station gateways carry the cellular link. It is a
hybrid built years before an off-the-shelf IoT stack existed to make it
routine.

**Arrival estimated from RF signal characteristics and station beacons, not
from GPS.** A GPS receiver on every bus tag is more accurate and more
expensive, and the accuracy is not what the display needs — a passenger wants
"four minutes", not a coordinate. Deriving proximity from the radio the tags
already carry made the position estimate free.

**2G GPRS as a design assumption, not a limitation to work around.** There was
no faster network to plan for, so the protocol between gateway and server was
sized for what GPRS reliably delivers: small, infrequent, tolerant of latency
and of a link that drops. A system designed for a fatter pipe and then squeezed
would have been fragile in exactly the conditions it had to run in.

**Solar treated as a budget, not a feature.** Every choice at the station —
which microcontroller, how often the modem wakes, how the LED display is
driven — comes out of the same energy account, sized against the worst week
rather than the average one. An "ultra-low-power" display is not a
specification here; it is what the panel size the budget allowed happened to
permit.

**A multi-threaded socket server.** Hundreds of gateways and tags connecting
concurrently, each holding a long-lived link that is mostly idle, is a
concurrency problem rather than a throughput one — and one that has to keep
running unattended, because nobody is going to restart a server for a bus stop.

## What was proven

The pilot was built and deployed as the first public intelligent transportation
system of its kind in Tehran, and it hit its numbers: bus tags under $30 each,
and complete station units — solar panel, charge controller, cellular modem and
outdoor LED display together — under $300.

Those two figures are the result. A smart transit system that works is a
solved problem; one that a municipality can afford to install at every stop in
a city, with no grid connection and on a 2G network, is a different problem,
and it is the one this was built to answer.
