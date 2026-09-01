---
role: 'Sole author. Signal model, component library, fibre solver, coherent DSP, the validation suite and the interface design.'
team: 'Solo'
context: 'Personal project, developed and released in the open.'
tools: 'Python 3.11+, NumPy/SciPy, optional CuPy GPU backend, pytest in CI'
licence: 'Apache-2.0'
status: in-progress
specs:
  - label: 'Signal model'
    value: 'Multi-band complex field, Ex/Ey, plus separate noise bins'
  - label: 'Fibre'
    value: 'Adaptive-step split-step Fourier; loss, CD, SPM/XPM/FWM, PMD'
  - label: 'Coherent chain'
    value: '32 GBd, BPSK to 256-QAM, dual polarization, 256 Gb/s'
  - label: 'Reach demonstrated'
    value: '1000 km compensated to back-to-back quality'
  - label: 'Validation'
    value: '50+ closed-form physics assertions, run in CI'
links:
  - label: 'Source on GitHub'
    href: 'https://github.com/ehsun-sh/maiman-studio'
draft: false
---

## Problem

Designing an optical link means answering questions that only the whole link can
answer. How far does 10 Gb/s NRZ reach before dispersion, not loss, closes the
eye? What received power does 64-QAM need for a BER of 1e-3? How much does a
neighbouring channel on a 100 GHz grid cost the one beside it? Each of those is
an interaction between a transmitter, a span and a receiver, and none of them is
a datasheet lookup.

The tools that answer them well are commercial and closed. The constraint that
made this non-trivial is not writing the physics — it is arranging it so that
every number the tool prints can be checked against something known. A simulator
whose output nobody can falsify is a plotting library with opinions.

## Architecture

A link is a directed graph of typed components evaluated by a scheduler. Ports
carry declared types — optical band, electrical waveform, binary sequence,
symbol stream, scalar metric — and invalid wiring is refused at edit time rather
than discovered as a shape error halfway through a run.

The decision everything else rests on is the signal model. A carrier is not a
single sampled waveform at one centre frequency; it is a set of independent
bands, each with its own centre frequency and its own samples, plus a separate
population of noise bins that carry amplifier ASE as spectral density rather
than as samples. Two lasers 6 THz apart cost exactly what two lasers 125 GHz
apart cost, because channel spacing never enters the sample rate. A
single-carrier model cannot represent that at any price.

Projects serialise to versioned JSON, so a schematic is diffable, reviewable and
runnable headless, and parameter sweeps are a first-class call rather than a
hand-written loop that mutates the graph in place.

## Design decisions

**Noise as bins, not as samples.** Adding ASE to the sampled field would tie its
bandwidth to the simulation's, which is wrong by orders of magnitude — an EDFA
emits across four terahertz. Keeping it as spectral density lets OSNR be quoted
in a real 12.5 GHz reference bandwidth and lets a demultiplexer remove ASE that
was never sampled. It also makes the beat terms explicit: a photodiode squares
the field, so ASE beats against the signal, and on any amplified link that beat
term *is* the noise floor. Modelling ASE as mean power alone produced a link
whose OSNR collapsed by 10 dB while its Q barely moved.

**Chromatic dispersion as a static block ahead of the adaptive one.** Both the
CD compensator and the butterfly equaliser are linear filters, so one adaptive
filter could in principle do both jobs. It does not work: growing the butterfly
from 7 taps to 65 over an 80 km span leaves the link just as dead, because a
blind modulus criterion has no gradient to follow once the constellation is a
Gaussian blob. Dispersion is static and long; polarization mixing is fast and
short. One filter serving both would have to be both.

**Blind everything.** Carrier recovery is blind phase search, the butterfly
equaliser converges with no training sequence, and the quarter-turn ambiguity
both of them leave behind is closed by differential quadrant encoding rather
than by a pilot. That is what a real receiver has to do, and building it any
other way would have hidden the problem instead of solving it.

**Coupled propagation.** Bands used to travel through the fibre independently,
which made this a good model of one channel and an optimistic model of a comb.
The split-step now propagates them together, so cross-phase modulation and
four-wave mixing appear, and walk-off is derived from the dispersion rather than
configured as its own parameter.

## Validation

Nothing here is tuned to come out right; the results are checked against closed
forms, and the checks run in CI.

- **Direct detection.** Sensitivity of −16 dBm at Q = 6, the textbook figure for
  a PIN into a plain 50 Ω load, and a reach of about 62 km set by dispersion
  rather than loss — with dispersion off, the same 60 km span gives Q = 15.4
  instead of 6.5.
- **A cross-check between two independent sweeps.** 120 km of 0.2 dB/km is
  24 dB, and launching 0 dBm through it gives the same Q as launching −24 dBm
  back to back. Modulator, fibre, detector, filter and analyser all have to
  agree for that to hold.
- **Coherent required SNR.** 9.9 / 17.4 / 23.2 / 28.7 dB for QPSK through
  256-QAM at BER 1e-3, with the BPSK-to-QPSK step landing on exactly 3 dB.
- **OSNR over a chain.** Sixteen amplified 80 km spans track 10·log10(N) to a
  hundredth of a dB, and nothing in the model is written in those terms — the
  noise bins simply accumulate.
- **Cross-phase modulation's factor of two.** One, two, three and four
  co-propagating channels give nonlinear phase in the ratio 1 : 3 : 5 : 7,
  which is the closed form exactly.
- **The soliton, with its own caveat asserted.** At N = 1 the Kerr chirp cancels
  the dispersive one and a sech pulse survives four soliton periods unchanged.
  Self-phase modulation alone also preserves the envelope, so shape invariance
  proves nothing on its own; it is invariance with both effects active that is
  the result, and the ablation is part of the test.

The dispersion compensator's sensitivity is the clearest single demonstration
that the physics is real rather than fitted: being one kilometre out on an 80 km
setting costs 7 dB, and the two flanks of the curve match to three digits, which
is also the sign check.

## Status

Pre-alpha. The engine runs end to end and the numbers hold up; the GUI does not
exist yet. The interface in the repository is a build of the planned one — the
schematic, the component palette and every figure in the results dock come from
a real engine run, and what is missing is the session server that would let you
press Run and get a new one.

That ordering is deliberate. The expensive decisions in a simulator are the
signal model and the validation discipline, and both are much harder to change
once a front end depends on them.
