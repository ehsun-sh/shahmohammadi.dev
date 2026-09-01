---
role: 'TODO — confirm your scope. Seeded as: hardware design and firmware.'
team: 'TODO — solo, or how many and who did what.'
context: 'TODO — which employer or client, or say it was your own.'
tools: 'TODO — schematic/layout tool, PIC toolchain, and the instruments used to bring it up.'
licence: 'TODO — usually "Client-owned, unpublished" for work like this. Delete the line if there is nothing to say.'
status: shipped
specs:
  - label: 'Controller'
    value: 'PIC18F67K22'
  - label: 'Metering front end'
    value: 'ADE7758, three-phase'
  - label: 'Sensing'
    value: 'TODO — CT ratio, burden, voltage divider or PT'
  - label: 'Protection functions'
    value: 'TODO — which ones: thermal overload, phase loss, imbalance, locked rotor, earth fault'
  - label: 'Interface'
    value: 'TODO — display, keypad, relay outputs, comms'
  - label: 'Logging'
    value: 'TODO — storage medium and depth'
links: []
draft: true
---

<!-- Seeded from Docs/Resume.MD and cv.json. TODO markers block publication. -->

## Problem

A three-phase induction motor fails in a small number of well-understood ways —
it overheats under sustained overload, it loses a phase, it stalls, its supply
goes out of balance — and every one of them is cheap to detect and expensive to
miss. The device that watches for them has to be more reliable than the thing
it is protecting, and it has to decide fast enough to matter without tripping
on a normal start.

That last clause is the whole design. A motor draws several times its rated
current for the first seconds of every start, so a protection relay that simply
compares current to a threshold is either useless or it never lets the motor
run.

## Architecture

<!-- TODO: block diagram into src/assets/projects/. CTs and voltage sensing →
     ADE7758 → SPI → PIC18F67K22 → trip relay, display, and log storage, with
     the supply and isolation boundary marked. -->

The ADE7758 does the measurement and the PIC does the judgement. Handing RMS
current, voltage and power computation to a dedicated three-phase metering part
leaves the microcontroller free to run the protection curves and the interface,
and it makes the accuracy of the measurement a property of a characterised IC
rather than of firmware.

TODO — a paragraph on the sensing front end: what the CTs were, what the burden
resistors were sized for, and where the isolation boundary sits between the
mains side and the logic.

## Design decisions

**A metering IC rather than sampling into the MCU.** TODO — expand: the
PIC18F67K22 has an ADC and could have sampled three currents and three voltages
directly. What made the dedicated part the right answer — accuracy over
temperature, firmware effort, or the headroom it left the MCU?

**TODO — the trip curve.** Which standard class, and how the thermal model was
implemented: an I²t accumulator, a lookup, or something else. Include how it
distinguishes a start from a fault, because that is the interesting part.

**TODO — fault logging.** What was recorded, where it was stored, and how it
survived the loss of supply that a trip usually accompanies.

## Validation

TODO — what proved it:

- Measurement accuracy against a reference source, per phase.
- Trip timing against the published curve, at several overload multiples.
- Behaviour on a real motor start — no nuisance trip, with margin.
- Phase-loss and imbalance detection thresholds and response time.

## What shipped

TODO — where it was deployed and for how long. A protection relay that ran in
an industrial installation without a false trip is the claim worth making, and
it is not one a bench test can support on its own.
