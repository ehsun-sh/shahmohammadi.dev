---
role: 'What you personally owned — be honest about scope on team projects.'
status: prototype
specs:
  - label: 'Board'
    value: '6-layer, 1.6 mm FR-4, 80 × 45 mm'
  - label: 'Processor'
    value: 'ESP32-S3, FreeRTOS'
  - label: 'Interfaces'
    value: '100BASE-TX, CAN-FD, USB-C'
  - label: 'Power'
    value: '5 V in, 2.1 W typical'
links: []
draft: true
---

<!--
  The collection's glob pattern is `[^_]*.md`, which is what keeps this file
  out of it — the loader does not skip underscore-prefixed files by itself.
  Copy this to `<slug>.md` to start a real write-up.

  The filename IS the slug. It has to match the `"slug"` of an entry in
  src/data/cv.json, or the build fails and tells you so — that pairing is what
  lets the résumé and the site share one set of project facts.

  Which is also why there is no title, summary, year or tag list up there.
  Those live in cv.json because resume.pdf prints them. Never restate them.

  `specs` is free-form label/value, because a transceiver and a relay are not
  described by the same fields. Reuse the labels above where they apply so the
  spec tables across projects still line up. Numbers belong here; adjectives
  do not.

  IP boundary (see CLAUDE.md): no employer or client schematics, Gerbers,
  layouts, or firmware source. Block diagrams, outcomes and reasoning only.

  `draft: true` renders the page in `npm run dev` and keeps it out of the
  build. A published page containing the word TODO fails the build on purpose.
-->

## Problem

What needed to exist, and the one constraint that made it non-trivial. If the
constraint is missing, the reader has no way to judge the solution.

## Architecture

Block diagram, then a short walk through the signal and power paths.

## Design decisions

The part technical readers actually want. For each significant choice: what you
picked, what you rejected, and the measurement or constraint that decided it.

## Validation

Scope captures, thermal images, EMC pre-scan plots, load-step response. Numbers
beat adjectives — this section is the difference between a portfolio and a
brochure.

## Rev A → Rev B

What was wrong on the first spin and what changed. Nobody believes a board that
worked first time, and admitting the fix reads as competence.
