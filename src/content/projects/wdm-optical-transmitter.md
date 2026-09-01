---
role: 'TODO — confirm your scope. Resume.MD says you led a five-person team on the modular DWDM system (transponders, mux/demux, power, fans).'
team: 'TODO — confirm. Seeded from Resume.MD as: led a five-person team.'
context: 'TODO — which employer or client, or say it was your own.'
tools: 'TODO — schematic/layout tool, firmware toolchain, and the instruments used to bring it up.'
licence: 'TODO — usually "Client-owned, unpublished" for work like this. Delete the line if there is nothing to say.'
status: shipped
specs:
  - label: 'Architecture'
    value: 'TODO — chassis, slot count, card types'
  - label: 'Optical'
    value: 'TODO — CWDM or DWDM, channel spacing, channel count, reach'
  - label: 'Line cards'
    value: 'TODO — SFP/XFP rates supported per card'
  - label: 'Control plane'
    value: 'Embedded Linux, SNMP'
  - label: 'Deployment'
    value: 'TODO — where and at what scale'
links: []
draft: true
---

<!-- Seeded from Docs/Resume.MD and cv.json. TODO markers block publication —
     the build fails if a non-draft page still contains one. -->

## Problem

An operator with one fibre pair between two sites and several services to carry
has two options: lay more fibre, or put more than one wavelength on the pair
already in the ground. The second is arithmetic; the first is civil works.

The constraint that makes it a product rather than a pair of transceivers is
that the services are not alike. TODO — name them: different bit rates,
different protocols, some of which are not framed the same way and none of
which may be allowed to notice the others.

## Architecture

A chassis of independent cards on a shared backplane, so a service is added by
adding a card rather than by replacing the system.

<!-- TODO: block diagram into src/assets/projects/. Client optics → transponder
     → fixed-wavelength line optic → mux → fibre → demux → the same in
     reverse, with the control card reachable from all of it. -->

Each transponder takes a client signal on a pluggable SFP or XFP, retimes it,
and re-emits it on a fixed ITU wavelength; the passive mux combines those onto
one fibre. Because the client side is pluggable, the same card serves whatever
rate and reach the customer turns up with.

The control plane runs embedded Linux and speaks SNMP, which is what an
operator's existing NMS already understands — TODO — one line on why SNMP was
the right interface rather than a proprietary one, given the deployment.

## Design decisions

**Pluggable client optics, fixed line optics.** TODO — the reasoning: the
client side has to absorb whatever the customer brings, the line side has to be
on a grid wavelength and stay there.

**TODO — passive mux/demux versus an active alternative,** and what decided it:
insertion loss budget, cost per channel, or power.

**TODO — the modular chassis decision.** Slot count, and the common cards
(power, fan, controller) you had to build to make the rest of it work. This is
where system design shows, and it is missing from a card-level story.

**TODO — the memory work.** Resume.MD records a 70 % memory reduction in the
SNMP monitoring system covering 2 000+ nodes. What was the constraint, and what
changed? A number that large has a story behind it worth a paragraph.

## Validation

TODO — what was measured before it shipped:

- Optical power budget per channel, worst-case link.
- BER at the receiver, and the margin left.
- Crosstalk between adjacent channels.
- Thermal behaviour of a fully populated chassis.
- Whether it ran unattended, and for how long.

## What shipped

TODO — deployment scale and how long it stayed in service. A system that ran in
the field for years is a stronger claim than any bench measurement, and it is
the one thing a bench prototype cannot say.
