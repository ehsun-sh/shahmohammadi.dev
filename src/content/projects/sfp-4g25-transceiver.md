---
role: 'TODO — confirm your scope. Seeded as: PCB design in Altium, optical sub-assembly selection and characterisation, prototype bring-up.'
team: 'TODO — solo, or how many and who did what.'
context: 'TODO — which employer or client, or say it was your own.'
tools: 'Altium Designer. TODO — add the instruments: BERT, sampling scope, optical power meter?'
licence: 'TODO — usually "Client-owned, unpublished" for work like this. Delete the line if there is nothing to say.'
status: prototype
specs:
  - label: 'Line rate'
    value: '4.25 Gbps'
  - label: 'Board'
    value: '4-layer, TODO — stack-up and dielectric, SFP MSA outline'
  - label: 'Optics'
    value: 'TODO — TOSA and ROSA parts, wavelength, LC receptacle'
  - label: 'Electrical'
    value: 'TODO — laser driver, TIA and limiting amplifier parts'
  - label: 'Management'
    value: 'TODO — digital diagnostics over I²C (SFF-8472)?'
links: []
draft: true
---

<!-- Seeded from Docs/Resume.MD and cv.json. TODO markers block publication. -->

## Problem

An SFP module is a hard exercise in constraints before it is an optical one.
The mechanical outline, the electrical pinout, the cage, and the management
interface are all fixed by the MSA — the only free variables are inside a shell
roughly the size of a USB connector, and one of them is 4.25 Gbps of
differential signalling running past a laser driver.

Four layers is the tight part. At 4.25 Gbps the differential pairs need a
controlled impedance and a continuous reference plane, and a four-layer board
does not leave many ways to give them both while still routing power and the
laser control loop.

## Architecture

<!-- TODO: block diagram into src/assets/projects/. Host edge connector →
     limiting amplifier / laser driver → TOSA, and ROSA → TIA → post-amp →
     host, with the control MCU and its I²C link off to one side. -->

Transmit takes the host's differential pair into a laser driver, which
modulates the TOSA. Receive is the same path inverted: the ROSA's photodiode
into a transimpedance amplifier, then a limiting amplifier that squares the
signal back up for the host.

TODO — a paragraph on the control loop. The optical output power of a laser
diode drifts with temperature and age, which is why the TOSA carries a monitor
photodiode; describe the automatic power control loop you closed around it, and
where it lives.

## Design decisions

**TODO — the stack-up.** With four layers, which pair of layers carried the
high-speed differentials, what referenced them, and what that cost the power
distribution. This is the decision the whole board hangs off.

**TODO — impedance target and how it was hit.** Trace geometry, dielectric, and
whether the fabricator was given a controlled-impedance note.

**TODO — TOSA/ROSA selection.** What set the choice: wavelength, sensitivity,
reach, cost, or lead time.

**TODO — what you rejected.** A six-layer board, a different driver, a
different optical sub-assembly. The rejected option and the reason for
rejecting it is the part a reader learns from.

## Validation

TODO — the measurements that decide whether a transceiver works:

- Eye diagram at 4.25 Gbps, transmit and receive, with mask margin.
- Extinction ratio and average optical output power.
- Receiver sensitivity and overload.
- BER against a PRBS pattern, and the link budget it leaves.
- Behaviour over the temperature range the module was specified for.

## Rev A → Rev B

TODO — what was wrong on the first spin. Nobody believes a 4.25 Gbps board that
worked first time, and naming the fix reads as competence rather than as an
admission.
