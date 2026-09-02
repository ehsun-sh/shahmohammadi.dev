---
role: 'Both halves: the analog and digital hardware, the multi-layer RF/digital PCB, the embedded firmware, and the C# desktop application with its GIS visualisation.'
context: 'Kharazmi Festival award winner.'
tools: 'Altium Designer, embedded firmware, C# (Windows GUI), USB serial / CDC, GIS mapping.'
status: prototype
gallery:
  - src: ../../assets/projects/cellular-drive-test-block-diagram.webp
    alt: 'Block diagram: an RF antenna feeds a multi-band GSM engine and a GPS antenna feeds a GPS receiver, both entering a microcontroller that pairs each radio reading with its own fix; a power-management block supplies them. Over USB serial the paired records reach a C# desktop application, which logs them and drives operator recognition, a GIS map with a coloured trajectory, and playback.'
    caption: 'The pairing happens in the handheld, not on the host — which is why a record is either complete or absent, and never carries the wrong coordinates.'
  - src: ../../assets/projects/cellular-drive-test-software.webp
    alt: 'The analysis application: serving-cell fields with RxLev and power bars, a dedicated-channel block, a six-row neighbour table carrying MCC, MNC, LAC, cell, BSIC, ARFCN and RxLev per neighbour, a live GPS panel, and the handset and operator identification down the right.'
    caption: 'The neighbour table is the reason the tool exists — the serving cell says what the subscriber got, and those six rows say what they nearly got.'
specs:
  - label: 'Radio'
    value: 'Multi-band GSM engine'
  - label: 'Positioning'
    value: 'High-precision GPS receiver, active antenna'
  - label: 'Host link'
    value: 'USB serial (CDC)'
  - label: 'Logged, serving cell'
    value: 'ARFCN, RSSI, RxLev, RxQual, BSIC, LAC, CI, MNC, MCC'
  - label: 'Logged, position'
    value: 'Latitude, longitude, altitude, speed'
  - label: 'Boards'
    value: 'Multi-layer RF and digital, plus power management'
---

## Problem

A cellular network is designed on a map and experienced on a street, and the
two disagree. Coverage predictions come from terrain models and antenna
patterns; what a subscriber actually gets depends on a building that went up
last year. The only way to close that gap is to drive the network and measure
it — which means an engineer needs a device that records what the radio sees,
continuously, tagged with where it was standing when it saw it.

The measurement itself is not the hard part. The hard part is that a radio
reading is worthless without a position, a position is worthless without a
timestamp that matches the reading, and thousands of triples of those are
worthless without something that turns them back into a map an engineer can
reason about. A drive test is a data problem wearing a hardware costume.

## Architecture

Two pieces that only meet over a USB cable.

The handheld unit carries a multi-band GSM engine and a high-precision GPS
receiver, each with its own active antenna, on a multi-layer board that keeps
the RF sections away from the digital ones, plus a power-management board to
run all of it. Firmware polls the radio for the serving cell and its
neighbours, reads the GPS fix, pairs them, and streams the result to the host
as USB serial.

The desktop side is a C# Windows application. It logs the stream in real time —
serving cell as ARFCN, RSSI, RxLev, RxQual, BSIC, LAC, CI, MNC and MCC, and up
to several neighbours alongside it — synchronised against GPS speed, altitude,
latitude and longitude. It recognises which operator each reading belongs to,
draws the route inside a GIS map as a coloured trajectory, and replays a
recorded run with playback controls so a stretch of bad coverage can be watched
rather than read out of a table.

## Design decisions

**Pair the radio reading and the GPS fix in firmware, not on the host.** The
alternative is two timestamped streams that the application correlates after
the fact, and it only works while nothing hiccups. Doing the pairing at the
point of measurement means a record is either complete or absent — and a
missing record is honest, where a record with somebody else's coordinates on it
is worse than no measurement at all.

**Neighbours logged, not just the serving cell.** The serving cell tells you
what you got. The neighbour list tells you what you nearly got, which is the
information an optimisation engineer actually acts on: handover problems,
missing neighbour definitions and cells that should have been serving are all
invisible if only the serving cell is recorded.

**A GIS map rather than a chart.** Every quantity here is a function of
position, so the natural axis is the street. Plotting RX level against time
gives a graph that has to be mentally re-projected onto a route; plotting it
onto the route removes that step, and it is why the trajectory is coloured
rather than merely traced.

**USB serial, not a proprietary link.** CDC makes the unit a serial port on any
Windows machine of the era with no driver to install, which for a tool carried
between vehicles and engineers is worth more than any efficiency a custom
protocol would have bought.

## What it produced

The system won a special honour at the Kharazmi Festival, on the strength of
its innovation and efficiency and of formal approvals it received from
telecommunications institutions.

The engineering claim underneath that is the integration rather than any one
part: a multi-layer RF and digital board, cellular and GNSS receivers with
their own antennas, embedded firmware, a USB host link, and a desktop
application with GIS visualisation — designed as one instrument, and verified
and calibrated in the field it was built to measure.
