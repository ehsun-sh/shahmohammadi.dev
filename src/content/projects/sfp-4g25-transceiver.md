---
role: 'Led the design: the analog, digital and optical subsystems, the schematic and the four-layer layout, then the prototype bring-up and the electrical and optical characterisation.'
context: 'Danial Moj.'
tools: 'Altium Designer, high-speed signal-integrity and impedance analysis, optical and electrical bench characterisation.'
licence: 'Employer-owned, unpublished.'
status: prototype
gallery:
  - src: ../../assets/projects/sfp-4g25-transceiver-block-diagram.webp
    alt: 'Block diagram of the module: the host reaches the board through gold edge fingers, where the transmit differential pair drives a laser driver into a TOSA and the receive path runs from a ROSA through a limiting amplifier back out to the host; both optics meet a duplex LC receptacle and the fibre beyond it, and a separate path carries supply and heat from the host cage.'
    caption: 'The two differential pairs are the design at 4.25 Gbps, and they are the one thing a photograph of the finished module cannot show.'
specs:
  - label: 'Line rate'
    value: '4.25 Gbps'
  - label: 'Board'
    value: '4-layer, high-density, to the SFP MSA outline'
  - label: 'Optics'
    value: 'TOSA and ROSA sub-assemblies'
  - label: 'Transmit path'
    value: 'Laser driver into the TOSA laser diode'
  - label: 'Receive path'
    value: 'ROSA into a limiting amplifier'
---

## Problem

An SFP module is a hard problem disguised as a small one. It has to carry
4.25 Gbps of differential signalling across a four-layer board the size of a
thumb, convert it to light and back, and do all of it inside a mechanical
envelope somebody else defined — the SFP MSA — that leaves no room to move a
part because the layout would prefer it elsewhere.

Everything that makes the problem hard follows from that. The form factor fixes
the outline, the connector position and the optical port, so the board area is
not a design variable. The line rate makes every trace a transmission line at a
length where a via stub or a reference-plane discontinuity is a measurable
penalty. And the module is powered from the host cage, so the laser driver, the
limiting amplifier and the optics all share a supply and a thermal path with
each other inside a sealed metal shell.

## Architecture

Two signal paths that never meet, plus the mechanics that hold them.

On transmit, the host's differential pair enters through the edge fingers, runs
to a laser driver, and the driver modulates the laser diode inside the TOSA,
which couples the light into the fibre. On receive, the ROSA turns incoming
light back into a small electrical signal, and a limiting amplifier squares it
up to a fixed amplitude before it goes back out to the host — limiting rather
than linear, because at the far end of a link the received power varies over a
wide range and the host wants a constant swing regardless.

The board is four layers, laid out at high density to fit the MSA outline, and
the stack-up exists to give both differential pairs a continuous reference the
whole way from the fingers to the optical sub-assemblies.

## Design decisions

**Impedance control treated as the layout's first constraint, not its last
check.** At 4.25 Gbps the pairs are the design. Trace geometry, the reference
plane under them and the transitions at either end were fixed before component
placement was finalised, because the opposite order produces a board that routes
cleanly and does not work.

**A limiting amplifier on the receive side.** A linear amplifier preserves the
shape of the received signal, which matters if something downstream is going to
measure it. Nothing downstream is: the host wants recovered data at a
predictable amplitude, so limiting is the right function, and it also removes
the receive path's dependence on how much optical power happens to be arriving.

**Compact and thermal-aware as one decision.** In an SFP they are the same
constraint seen twice. There is no space for a heatsink and no airflow inside a
host cage, so the only levers are how much power each part draws and how the
board conducts it into the shell — which is a placement and copper-pour
decision made early, not a fix applied afterwards.

## Validation

The prototype was manufactured, assembled and then characterised on both sides:
electrical testing of the high-speed paths and the module's behaviour in a host,
and optical testing of the transmit and receive ends against the specification
the module was designed to.

## What happened next

It was not taken to mass production, and the reason had nothing to do with the
module. Manufacturing SFPs at volume in Iran was not competitive against the
Chinese factories that already dominate that part, so the economics decided it
before the engineering could.

What it produced instead is the part worth stating plainly: the full design and
evaluation cycle for an optical module — MSA-constrained layout, multi-gigabit
signal integrity, laser drive and optical sub-assembly integration, and the
bench work to prove it — carried through to a working prototype rather than a
paper design.
