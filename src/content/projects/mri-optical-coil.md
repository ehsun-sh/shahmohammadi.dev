---
role: 'System architecture, the analog and digital circuit design, the PCB, board assembly and bring-up, and the C# host application.'
team: 'Solo.'
context: 'MS thesis.'
tools: 'Altium Designer, C#, USB device interfacing, signal-integrity analysis.'
status: prototype
gallery:
  - src: ../../assets/projects/mri-optical-coil-block-diagram.webp
    alt: 'Block diagram: RF antenna into an LNA, then an SDR containing an RF tuner, an A/D converter, a digital downconverter built from a digital mixer, a digital local oscillator and a lowpass filter, then a digital processor; its output drives an optical transmitter with a laser diode, over fibre, into an optical receiver that returns an electrical signal.'
    caption: 'The signal path end to end. Everything left of the laser diode is electrical and sits in the bore; everything between the two dotted boxes is glass.'
specs:
  - label: 'Coil signal'
    value: '63.875 MHz (1.5 T proton Larmor)'
  - label: 'Host interface'
    value: 'USB'
---

## Problem

Intravascular MRI coils have always been wired with coaxial cable, and the
cable is the part that fights back. It is conductive, so it carries current —
and current in the bore does three unwelcome things at once. The transmit pulse
induces common-mode currents along the shield, which have to be broken up with
baluns and cable traps that add loss exactly where the signal is weakest. Those
same currents dissipate heat, on a catheter, inside a patient. And the cable
loads the coil, so the Q-factor and the noise figure of the receive chain are
set partly by a piece of wire.

The signal being protected is measured in microvolts, which is what makes all
three worth removing rather than managing.

Optical fibre removes the mechanism instead of compensating for it: glass
carries no induced current, so there is nothing to trap, nothing to heat, and
no conductive path between the bore and the equipment room. The difficulty is
that a coil produces an RF voltage, not light, and the conversion has to happen
at the coil end — which is exactly where there is no room, no power and a very
strong magnetic field.

## Architecture

The coil signal sits at 63.875 MHz, because at 1.5 T that is where protons
precess. Every option for getting it onto fibre was weighed against that one
number, and the answer was to stop treating it as RF as early as possible: a
software-defined radio digitises the signal at the coil, and what travels down
the fibre is data rather than a modulated optical carrier.

The chain is RF antenna → LNA → SDR → optical transmitter → fibre → optical
receiver → host. Inside the SDR, an RF tuner feeds an A/D converter, and a
digital downconverter — a digital mixer driven by a digital local oscillator,
followed by a lowpass filter — brings the digitised band down to baseband
before a digital processor hands it to the optical transmitter's laser diode.
At the far end a photodiode turns it back into an electrical signal, and a C#
host application pulls it over USB and displays it.

The consequence worth stating plainly: after the A/D converter, nothing in the
link has an analogue quantity left to degrade. Fibre length, routing and
proximity to the bore stop being part of the noise budget, which is the whole
argument for digitising in the bore rather than in the equipment room.

## Design decisions

**A software-defined radio rather than an analogue optical link.** The
straightforward way to put 63.875 MHz on fibre is to modulate a laser with it
directly, and it needs no converter at the coil. It also makes the laser's
linearity, its bias stability and the photodiode's response part of the receive
chain — an analogue link degrades gracefully and continuously, which on a
microvolt signal is the wrong kind of graceful. Digitising first spends power
and board area at the coil in exchange for a link that either delivers the
samples or does not.

**The downconversion is digital, not analogue.** A mixer and a local oscillator
in hardware at the coil end would be two more analogue parts sitting in a
strong field, each with its own drift and its own spurs. Doing the mix
arithmetically after the ADC moves that behaviour into something that is
identical on every unit and every day, and leaves the analogue front end as
just an LNA and a tuner.

**Board work was treated as an RF problem, not a layout problem.** At 63.875 MHz
with a microvolt input next to a switching digital section, the schematic is the
easy half. Signal-integrity analysis, the grounding scheme and the separation of
the analogue front end from the digital processor were where the design effort
actually went, and they are what decides whether the ADC sees the coil or sees
the board.

## What the build involved

The hardware side spanned the analogue and digital circuit design, the PCB in
Altium Designer, the signal-integrity analysis behind it, the electromagnetic
and RF engineering that set the front end, integrating the fibre-optic devices,
and then assembling, soldering and verifying the boards by hand.

The software side is a C# host application: it talks to the receiver over USB,
handles the acquisition on its own threads so the interface stays responsive
while data is streaming, and visualises the result.

## Status

A working bench prototype, built and brought up as an MS thesis. The
architecture is proven end to end — a coil signal digitised at the coil,
carried over fibre, and reconstructed at a host — and the case for it rests on
the mechanism rather than on a clinical trial: there is no conductor in the
link, so there is no induced current to trap and no cable to heat.

What that stops short of is an in-bore comparison against a coaxial baseline
with SNR and coil-end temperature measured the same way for both. That is the
measurement the approach deserves, and it is not one a bench can produce.
