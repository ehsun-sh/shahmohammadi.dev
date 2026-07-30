---
title: 'Project title'
summary: 'One sentence a hiring manager can understand without context.'
date: 2026-01-01
status: prototype
role: 'What you personally owned — be honest about scope on team projects.'
featured: false
order: 0
draft: true
hardware:
  mcu: 'ESP32-S3'
  layers: 6
  stackup: 'Sig / GND / Sig / Sig / PWR / Sig, 1.6 mm FR-4'
  dimensions: '80 × 45 mm'
  powerBudget: '5 V in, 2.1 W typical'
  interfaces:
    - Ethernet 100BASE-TX
    - CAN-FD
    - USB-C
  certifications: []
tags:
  - PCB
  - Firmware
links: []
---

<!--
  Files starting with `_` are ignored by the glob loader, so this template
  never becomes a page. Copy it to `my-project.md` to start a real write-up.

  IP boundary (see CLAUDE.md): no employer or client schematics, Gerbers,
  layouts, or firmware source. Block diagrams, outcomes and reasoning only.
-->

## Problem

What needed to exist, and what constraint made it non-trivial.

## Architecture

Block diagram, then a short walk through the signal and power paths.

## Design decisions

The part that technical readers actually want. For each significant choice:
what you picked, what you rejected, and the measurement or constraint that
decided it.

## Validation

Scope captures, thermal images, EMC pre-scan plots, load-step response. Numbers
beat adjectives — this section is the difference between a portfolio and a
brochure.

## Rev A → Rev B

What was wrong on the first spin and what changed. Nobody believes a board that
worked first time, and admitting the fix reads as competence.
