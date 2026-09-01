---
role: 'TODO — confirm your scope. Seeded as: system architecture, SDR hardware design, and optical link bring-up.'
team: 'TODO — solo, or how many and who did what.'
context: 'TODO — employer, client, or a university/research project. Name the institution if it was academic.'
tools: 'TODO — schematic/layout tool, HDL or firmware toolchain, and the instruments used to bring it up.'
licence: 'TODO — usually "Client-owned, unpublished" for work like this. Delete the line if there is nothing to say.'
status: prototype
specs:
  - label: 'Signal'
    value: 'TODO — e.g. 63.875 MHz centre, TODO MHz bandwidth'
  - label: 'Digitiser'
    value: 'TODO — ADC part, resolution, sample rate'
  - label: 'Optical link'
    value: 'TODO — wavelength, fibre type, reach, line rate'
  - label: 'Board'
    value: 'TODO — layer count, stack-up, dimensions'
  - label: 'Power'
    value: 'TODO — supply and budget at the coil end'
links: []
draft: true
---

<!-- Seeded from Docs/Resume.MD and cv.json. Everything marked TODO needs a
     number or a part from you — a published page may not contain the word, so
     the build will stop before this reaches anyone. Rewrite the prose freely;
     it is a starting point, not a transcript. -->

## Problem

An MRI receive coil sits inside the bore, a few centimetres from a transmit
field strong enough to be the whole point of the machine. The signal it picks
up is measured in microvolts. Getting that signal out to the receiver without
losing it — and without the cable itself becoming part of the experiment — is
the hard part.

Coaxial cable does the job badly in three ways at once. It is conductive, so
the transmit pulse induces common-mode currents along the shield, which have to
be broken up with baluns and cable traps that add loss exactly where the signal
is weakest. Those same currents dissipate heat next to the patient. And the
cable loads the coil, so the noise figure of the whole receive chain is set
partly by a piece of wire.

Replacing the copper with fibre removes the mechanism rather than managing it.
Glass carries no induced current, so there is nothing to trap, nothing to heat,
and no conductive path between the bore and the equipment room.

## Architecture

The signal is digitised at the coil and leaves as light, so everything after
the ADC is immune to the field it was standing in.

<!-- TODO: block diagram. Export it as an image into src/assets/projects/ and
     reference it here. Coil → LNA → filter → ADC → serialiser → optical
     transmitter → fibre → receiver → host. -->

At 1.5 T the proton Larmor frequency is 63.87 MHz, which is why the digitiser
is specified around 63.875 MHz — the software-defined radio is tuned to the
physics, not to a convenient IF.

TODO — one paragraph on the receive chain ahead of the ADC (gain distribution,
where the anti-alias filtering sits, and whether the ADC samples directly or
after a downconversion), and one on how the coil end is powered given that a
copper supply pair would reintroduce the problem the fibre just solved.

## Design decisions

**Digitise at the coil rather than at the receiver.** TODO — the trade you
made: moving the ADC into the bore means putting active silicon in a strong
field and finding power for it, in exchange for a link whose noise floor no
longer depends on cable length or routing.

**TODO — the ADC choice.** Which part, and what set the requirement: dynamic
range, sample rate, power at the coil end, or availability.

**TODO — the optical link choice.** Analogue optical link or digital serial
over fibre, and why. Wavelength and fibre type, and what fixed them.

## Validation

TODO — this section is what separates the page from a brochure. The claim in
the summary is improved SNR and reduced thermal effects, so the numbers that
back it belong here:

- SNR, coax baseline versus optical link, measured the same way.
- Temperature at the coil under a worst-case transmit sequence.
- Noise figure or spurious-free dynamic range of the digitised chain.

## Status

TODO — where the work stopped: bench prototype, in-bore trial, or handed over.
Say plainly what was and was not proven. An honest boundary reads better than
an implied product.
