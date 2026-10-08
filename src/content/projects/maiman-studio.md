---
role: 'Sole author. Signal model, component library, fibre solver, coherent DSP, photonic circuit solver, the validation suite and the studio.'
team: 'Solo'
context: 'Personal project, developed and released in the open. Published on PyPI as maiman, with a documentation site.'
tools: 'Python 3.11+, NumPy, optional CuPy GPU backend, a dependency-free HTML/JS studio, pytest, mypy and ruff in CI'
licence: 'Apache-2.0'
status: in-progress
cover: ../../assets/projects/maiman-studio-editor.webp
coverAlt: 'The Maiman Studio schematic editor showing a 16-QAM coherent link, with the constellation and its EVM, SNR and BER in the results dock below'
specs:
  - label: 'Signal model'
    value: 'Multi-band complex field, Ex/Ey, plus separate noise bins'
  - label: 'Fibre'
    value: 'Coupled adaptive-step split-step; loss, CD, SPM/XPM/FWM, PMD, Raman'
  - label: 'Coherent chain'
    value: '32 GBd, BPSK to 256-QAM, dual polarization at 256 Gb/s, blind DSP'
  - label: 'Reach demonstrated'
    value: '1000 km compensated to back-to-back quality'
  - label: 'FEC'
    value: 'RS(255,239) per G.709; soft-decision staircase and OFEC'
  - label: 'Photonic circuits'
    value: 'Bidirectional S-matrix solver, matches SAX to 5e-15; PDK import'
  - label: 'Library'
    value: '77 components, 49 example projects with lessons'
  - label: 'Validation'
    value: '2250+ tests; every physics block against a closed form, in CI'
  - label: 'Release'
    value: '0.17.0 on PyPI: pip install maiman, then maiman serve'
links:
  - label: 'maimanstudio.com'
    href: 'https://maimanstudio.com/'
  - label: 'Source on GitHub'
    href: 'https://github.com/ehsun-sh/maiman-studio'
  - label: 'maiman on PyPI'
    href: 'https://pypi.org/project/maiman/'
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

The studio is one more client of that API. `maiman serve` starts a small HTTP
server, with no dependencies beyond the engine's own, that hands the browser its page and runs the
project documents it posts; every route is a thin wrapper over a call a script
can already make. Nothing in the server understands the physics and nothing in
the engine knows the server exists, which is what stops the two drifting apart:
a feature that cannot be reached from Python cannot be reached from the
interface either.

The same engine also solves photonic circuits, as bidirectional S-matrices
rather than as a separate tool: rings, couplers, MMIs and gratings, a foundry
kit read from its fitted numbers and refused past the window they were fitted
in, and a netlist written by a layout tool read as a document.

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

Released, and still 0.x. Version 0.17.0 is on PyPI: `pip install maiman`, then
`maiman serve`, and the studio opens in a browser with a complete link already
on the canvas. Build a link by dragging blocks and wires, press Run, sweep a
parameter, save the project; every number on screen comes from the engine. The
Examples menu carries 49 projects in seven phases, from first light to
real-world systems, each with a lesson beside it, and the documentation is
published at maimanstudio.com.

Phases 0 through 5 of the roadmap are done: the linear link, the nonlinear and
amplified one, the coherent transceiver, the studio and WDM, photonic circuits,
and gratings, sensing and control loops. What remains open are the
approximations each block states in its own docstring. The version number is
meant literally — the API is not frozen, and the core is still small enough that
changing it is cheap.

The order was deliberate. The studio arrived in phase 3, after the signal model
and the validation discipline were settled, because those are the expensive
decisions in a simulator and both are much harder to change once a front end
depends on them.
