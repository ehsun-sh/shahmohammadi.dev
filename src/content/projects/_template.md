---
role: 'What you personally owned — be honest about scope on team projects.'
team: 'Solo, or how many and who did what. Delete the line if it adds nothing.'
context: 'Who it was for: an employer, a named client, a university, or yourself.'
tools: 'Languages, toolchains and instruments — the things you would be asked to prove you can drive.'
licence: 'Apache-2.0, or "Client-owned, unpublished". Delete the line if there is nothing to say.'
status: prototype
# Optional. Delete the block if one cover says it. Every entry needs alt text;
# `caption` is what most of these actually want, because on an engineering page
# the picture is the claim and the caption is the number.
# No Gerbers, no schematics, no legible silkscreen on a client's board.
gallery:
  - src: ../../assets/projects/example-board-top.webp
    alt: 'What the picture shows, for someone who cannot see it.'
    caption: 'Rev B, top side. The 5 V rail moved off the switcher return.'
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

  Two tables, and the difference between them matters.

  `role`, `team`, `context`, `tools`, `licence` and `links` — plus year and
  status, which come from cv.json and the field below — are the FIXED table.
  The layout builds it, in the same order, on every project page, so a reader
  who has seen one project knows where to look on the next. You cannot reorder
  or rename those rows from here, and that is the point.

  `specs` is the SECOND table and it is optional: free-form label/value for the
  engineering numbers, because a transceiver and a relay are not described by
  the same fields. Numbers belong here; adjectives do not, and anything needing
  a sentence belongs in the write-up below. Leave it empty and the section does
  not render.

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
