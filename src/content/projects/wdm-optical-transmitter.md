---
role: 'Led the system design and built the boards it stands on: the multi-slot backplane, the SFP+ 10 G transponder card, the fan-control board, and the embedded Linux control plane on the core board.'
team: 'Led a team of five, covering transponders, mux/demux, power and thermal.'
context: 'Danial Moj.'
tools: 'Altium Designer, embedded Linux (OS porting and driver development), SNMP, I²C, SPI, serial, Ethernet, USB.'
licence: 'Employer-owned, unpublished.'
status: shipped
gallery:
  - src: ../../assets/projects/wdm-optical-transmitter-block-diagram.webp
    alt: 'Block diagram: three unlike client services enter a chassis, each into a transponder card split between a pluggable SFP/XFP client side and a fixed-wavelength line optic; the three line optics feed a passive multiplexer onto one fibre, and a passive demultiplexer at the far end reverses it. Below the transponders, a backplane carries control, power and fan-control cards, and the control card reaches an operator NMS over Ethernet.'
    caption: 'Several unlike services in, one strand out. The dashed split inside each card is the decision the product rests on: pluggable where the customer is, fixed where the grid is.'
specs:
  - label: 'Chassis'
    value: 'Multi-slot backplane; power, control, service and transponder cards'
  - label: 'Transponder card'
    value: 'SFP+ 10 G, with SFP and XFP client interfaces'
  - label: 'Control plane'
    value: 'Core board running embedded Linux'
  - label: 'Management'
    value: 'SNMP, web and socket over Ethernet'
  - label: 'Board interfaces'
    value: 'USB, I²C, SPI, serial'
  - label: 'Interoperability'
    value: 'OTN equipment'
---

## Problem

An operator with one fibre pair between two sites and several services to carry
has two options: lay more fibre, or put more than one wavelength on the pair
already in the ground. The second is arithmetic; the first is civil works,
permits and years.

What makes that a product rather than a pair of transceivers is that the
services are not alike. They arrive at different bit rates, framed by different
protocols, from customers who bought them at different times — and none of them
may be allowed to notice the others. The box has to be indifferent to what it
is carrying, and it has to still be indifferent to whatever turns up in three
years.

## Architecture

A chassis of independent cards on a shared backplane, so a new service is a new
card rather than a new system.

Each transponder takes a client signal on a pluggable SFP or XFP, and re-emits
it on a fixed wavelength; a passive multiplexer combines those onto the single
outgoing fibre, and an identical demultiplexer separates them at the far end.
Because the client side is pluggable and the line side is not, one card design
serves whatever rate and reach the customer arrives with, while the part that
has to sit on a defined grid wavelength stays fixed and known.

Around the transponders sit the cards that make a chassis a system rather than
a shelf: power, control, fan control, and the backplane that carries signalling
between all of them. Management runs on a core board with an embedded Linux
system, reachable over Ethernet by SNMP, a web interface or a socket — so the
device drops into the monitoring an operator already runs instead of demanding
its own.

Because the line side is on grid wavelengths and the framing is left alone, the
system interoperates with OTN equipment rather than forming an island.

## Design decisions

**Modular cards, reused rather than redesigned.** The power, control and
service cards came from earlier projects in the same family. That is a decision
about the roadmap, not about this box: the parts of a transport system that do
not differentiate it are also the parts most expensive to re-qualify, and
carrying them forward put the engineering effort onto the transponder and the
optics, which are what the product is actually for.

**Pluggable client optics, fixed line optics.** The client side has to absorb
whatever a customer brings and cannot be committed to at design time. The line
side has the opposite requirement — it must sit on its assigned wavelength and
stay there, because its neighbours on the fibre depend on it doing so. Making
one side a socket and the other a fixed part is what lets a single card serve
both requirements.

**A passive mux rather than an active one.** Passive multiplexing costs
insertion loss and nothing else: no power, no failure mode, no card slot, no
heat in a chassis that is already thermally constrained. That loss comes
straight out of the link budget, which makes the budget the thing to design
against — but a component that cannot fail is worth paying decibels for in
equipment expected to run unattended.

**Thermal design treated as a subsystem.** A fully populated chassis of
transponders is a box of laser drivers, and an optical transmitter's wavelength
is a function of its temperature. The fan-control board monitors and drives fan
speed rather than running them flat out, because the alternative is a system
that is either too hot at full load or too loud to deploy.

## What the build involved

The electronic and optical circuit design, the PCBs in Altium Designer — the
multi-slot high-speed backplane, the SFP+ 10 G transponder card and the
fan-control board — and the selection and interfacing of the active and passive
optical components around them.

On the software side, porting embedded Linux to the core board and writing the
drivers underneath it, then the management interfaces on top: SNMP, web and
socket over Ethernet, with I²C, SPI, serial and USB carrying the traffic inside
the chassis. The mechanical enclosure and its thermal design were part of the
same job, as was the debugging, verification and testing that closed it out.

## What shipped

The system went into service and the optical equipment built around it was
deployed nationwide. That is the claim worth making about a transport product,
and it is the one thing no bench measurement can stand in for: a chassis that
runs unattended in the field, through summers, on someone else's network, is
being tested continuously by conditions nobody wrote a test plan for.
