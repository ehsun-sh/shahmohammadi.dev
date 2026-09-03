---
role: 'The analog and digital hardware, the three boards and the enclosure, and the embedded firmware — including the protection curves, the calibration and the EMC and immunity testing.'
context: 'Mobtaker Sanat Pazhuh.'
tools: 'Altium Designer, PIC embedded firmware, I²C, SPI, RS-485 (Modbus), industrial EMC and immunity test equipment.'
licence: 'Employer-owned, unpublished.'
status: shipped
gallery:
  - src: ../../assets/projects/motor-protection-relay.webp
    credit: 'Concept mockup'
    alt: 'Render of the DMP-2 wired into a three-phase installation: the relay on the left with per-phase currents, average voltage, frequency and power on its display, connected through a terminal block by red, yellow and blue cables to an industrial motor.'
    caption: 'What the box is for. Everything the relay knows about the motor arrives through those three cables, and the only thing it sends back is the decision to open the contactor.'
  - src: ../../assets/projects/motor-protection-relay-ct-board.webp
    alt: 'Render of the current-transformer board, three-quarter view: four toroidal current transformers stand over the lower half of the board beside a row of wide spade terminals, with a common-mode choke, X-class capacitors and a bridge rectifier along the mains edge and a pin header carrying the conditioned signals off the board.'
    caption: 'The board that touches the mains: transformers, terminals and the supply filter on one plate, with only a header leaving it.'
  - src: ../../assets/projects/motor-protection-relay-mainboard.webp
    alt: 'Render of the mainboard, three-quarter view: the PIC18F67K22 in a square quad-flat package near the centre, the ADE7758 in a wide SOIC below it, two crystals, a coin-cell holder for the real-time clock, a row of relay-drive transistors down the left edge next to gold contact pads, and a tall two-row header on the right.'
    caption: 'Everything that judges sits here — metering IC, microcontroller, clock and log — one connector away from anything at line potential.'
  - src: ../../assets/projects/motor-protection-relay-hmi-board.webp
    alt: 'Render of the front-panel board, face on: a backlit character LCD module across the top half, four indicator LEDs, a buzzer, and eight tactile keys laid out as a navigation pad below it.'
    caption: 'The panel board carries no protection logic at all. It is a display, four lamps and eight keys, and that is the whole reason it is its own board.'
  - src: ../../assets/projects/motor-protection-relay-boards-assembled.webp
    alt: 'Render of the three boards assembled into a stack: the front-panel board at the front, the mainboard standing perpendicular behind it, and the current-transformer board behind that, joined by board-to-board headers and a ribbon cable.'
    caption: 'Stacked, the split becomes a shape: the boards meet only at headers, and the depth between them is the isolation.'
diagrams:
  - src: ../../assets/projects/motor-protection-relay-block-diagram.webp
    alt: 'Block diagram: a three-phase supply runs through a contactor to the motor, with current-transformer and voltage taps dropping into a signal-conditioning board. Across an isolation boundary, an ADE7758 metering IC feeds a PIC18F67K22 over SPI; the microcontroller drives a trip back up to the contactor, and also drives the front panel and an RS-485 Modbus port.'
    caption: 'The measurement is a loop, not a chain: everything the relay senses comes back out as one decision at the contactor.'
specs:
  - label: 'Motors protected'
    value: 'Three-phase, up to 440 V, 1–600 kW'
  - label: 'Controller'
    value: 'PIC18F67K22'
  - label: 'Metering front end'
    value: 'ADE7758, three-phase'
  - label: 'Measurement'
    value: 'True-RMS current and voltage, active and reactive power'
  - label: 'Boards'
    value: 'CT signal conditioning, MCU mainboard, front-panel HMI'
  - label: 'Interface'
    value: 'LCD and keypad; RS-485 (Modbus), I²C, SPI'
  - label: 'Enclosure'
    value: 'DIN / panel mount, model DMP-2'
  - label: 'Standards'
    value: 'NEMA, IEC 62053-22'
---

## Problem

A three-phase induction motor fails in a small number of well-understood ways.
It overheats under sustained overload. It loses a phase. Its rotor stalls. Its
supply goes out of balance, or the phases arrive in the wrong order. Every one
of those is cheap to detect and expensive to miss, and the device that watches
for them has to be more reliable than the motor it is protecting.

The whole design sits in one clause of that: it has to decide fast enough to
matter without tripping on a normal start. A motor draws several times its
rated current for the first seconds of every start, so a relay that simply
compares current against a threshold is either useless or it never lets the
motor run. The difference between a fault and a healthy start is not the
magnitude of the current — it is how long the current stays there, which means
the relay has to hold a model of the motor's heating rather than a number.

Doing that across a range from 1 kW to 600 kW, on supplies up to 440 V, in a
panel next to contactors that switch hundreds of amps, is what makes it an
industrial product rather than a comparator.

## Architecture

Three boards, split along the boundaries that matter.

A current-transformer signal-conditioning board takes the CT and voltage inputs
and presents them to an ADE7758, a dedicated three-phase energy-measurement IC
that computes true-RMS current and voltage, active power and reactive power. A
mainboard carries a PIC18F67K22, which reads those measurements and runs the
protection logic, the trip decision and the event log. A front-panel board
carries the LCD and keypad. The whole thing lives in a DIN- or panel-mount
industrial enclosure as the DMP-2.

The split is deliberate: the board handling mains-referenced signals is
physically separate from the board doing the judging, and the board a human
touches is separate from both.

## Design decisions

**A metering IC rather than sampling into the microcontroller.** The
PIC18F67K22 has an ADC and could have sampled three currents and three voltages
itself. Handing that to the ADE7758 makes the accuracy of the measurement a
characterised property of a part rather than an emergent property of firmware
and an interrupt schedule — and it frees the microcontroller to run the
protection curves, the interface and the logging without any of those competing
with a sampling deadline.

**True RMS, not average-responding.** A motor's current is not a clean sine
wave, and an average-responding measurement scaled to read RMS is wrong by an
amount that depends on the waveform — which is to say, wrong by more exactly
when the motor is misbehaving. Protection thresholds are only meaningful if the
quantity underneath them is the real heating current.

**Configurable trip zones and curves rather than fixed thresholds.** A 1 kW
motor and a 600 kW motor do not share a thermal model, and neither do two
installations of the same motor doing different work. Making the curve a
setting rather than a constant is what lets one product cover the range, and it
moves the decision to the person who knows the load.

**Protection breadth as a design target.** The device detects overload, startup
overtime, current imbalance, stalled rotor, undercurrent, short circuit, phase
failure, phase reversal, undervoltage and overvoltage. Several of those cost
almost nothing once true three-phase voltage and current are already being
measured accurately — phase reversal and imbalance in particular — which is a
second argument for the metering front end: it made most of the protection list
a firmware question.

**Event and fault logging.** A relay that trips and says nothing leaves the
plant guessing, and the guess usually resolves as "the relay is faulty". Logging
what was measured at the moment of the trip is what turns a trip into
information.

## Validation

Calibration against the measurement chain, then the part that separates
industrial equipment from bench equipment: EMC and immunity testing. A
protection relay sits in a panel with contactors and motor drives, and it has
to keep measuring correctly while they switch — a relay that nuisance-trips on
its neighbour's inrush will be removed from the panel by the first electrician
who works out what is happening.

The design was carried out to NEMA and IEC 62053-22, the latter being the
accuracy class standard for the measurement it bases every decision on.

## What shipped

It shipped as a product, the DMP-2, in an industrial DIN- and panel-mount
enclosure. For a protection relay the claim worth making is a negative one —
years in a panel with no false trip — and it is the claim only field service
can support, never a bench.
