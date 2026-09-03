---
role: 'Sole author. The specification, the data model, the supplier adapter layer, the costing engine, and the interface.'
team: 'Solo.'
context: 'My own tool, built to run my own production and used at Teqware.'
tools: 'Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma 7, Auth.js, BullMQ and Redis, Tailwind v4, Docker.'
licence: 'Proprietary; source not public.'
status: in-progress
diagrams:
  - src: ../../assets/projects/pcba-manager-block-diagram.webp
    alt: 'Block diagram: design files and a BOM export enter a two-phase import, then a shared Part Master. A group of supplier adapters behind one interface — Digi-Key .com/.ca over OAuth2, Mouser.ca, LCSC, and a manual RFQ supplier — feeds an async Redis and BullMQ worker. BOM rows and supplier prices meet in a costing run, which passes through landed cost, sourcing optimisation, and out to a purchase list per supplier.'
    caption: 'Unit price is not the answer. Everything to the right of the costing run exists because the cheapest part per unit routinely loses once shipping, minimum order value and import tax are in.'
specs:
  - label: 'Application'
    value: 'Next.js 16 App Router, TypeScript, Tailwind v4'
  - label: 'Data'
    value: 'PostgreSQL via Prisma 7; money as Decimal, never float'
  - label: 'Pricing'
    value: 'Async BullMQ worker on Redis, cached and rate-limited per supplier'
  - label: 'Suppliers'
    value: 'Digi-Key .com and .ca (OAuth2), Mouser.ca, LCSC, manual/RFQ'
  - label: 'Landed cost'
    value: 'Canadian import tax by province, all 13 regions in the database'
  - label: 'BOM size'
    value: 'Up to 1,000 rows without UI degradation'
  - label: 'Pricing run'
    value: '200 rows across 3 suppliers in under 3 minutes'
---

## Problem

Getting a board built means turning a design file into a purchase list, and the
distance between those two things is larger than it looks. A BOM comes out of
Altium or KiCad as a few hundred rows of reference designators. What has to come
out the other end is a separate order for each supplier, with the right
quantities, at prices that were real on the day you decided.

Everything in between is arithmetic that a spreadsheet does badly and silently.
Quantities are not the BOM quantity: they are the BOM quantity times the build,
plus attrition, minus what is already on the shelf, rounded up to the supplier's
order multiple. Prices are not one number: they are a break table, in a currency
that is not yours, from a supplier who may have a minimum order value that makes
their cheap part expensive.

And the answer everyone reaches for first is wrong. **The cheapest unit price is
almost never the cheapest way to buy the board.** A part that is cheaper at LCSC
loses to Digi-Key.ca on a small order once shipping, the minimum order value and
Canadian import tax are counted. A tool that compares unit prices does not
merely fail to help — it recommends the wrong supplier, confidently, with a
number next to it.

## Architecture

A single Next.js application with a separate worker, over PostgreSQL.

Design files and a BOM export enter through a two-phase import: the file is
staged and shown as a preview with its validation errors, and nothing reaches
the BOM until the mapping is confirmed. Rows resolve against a **Part Master** —
one global part per normalised MPN and manufacturer — so a match confirmed once
is reused on every later project, and price history has something to hang on.

Every supplier sits behind one interface. Price breaks, stock, lifecycle status,
packaging, MOQ and compliance all come through the same adapter shape, so
adding a supplier means writing an adapter rather than touching the core. Those
lookups run on a BullMQ worker rather than in the request, cached with a TTL per
data type and rate-limited per supplier.

The two streams meet in a **costing run** — one snapshot, one identifier, with
the FX rate and its source recorded on it. From there the numbers pass through
landed cost, then sourcing optimisation, and out as one purchase list per
supplier.

## Design decisions

**Two rows in the database, one adapter in the code.** Digi-Key .com and .ca are
separate `Supplier` records because their orders, shipping and customs genuinely
are separate, and their currencies differ. But they are one adapter with a
locale parameter, because writing them twice would mean fixing every future bug
twice. Getting that split right at the start is cheaper than discovering it at
the fourth supplier.

**A manual supplier is a first-class supplier.** A real share of buying never
comes through an API: Würth, local representatives, anything priced by email and
negotiation. If those quotes live in a side table, they are absent from the
comparison, absent from the optimiser and absent from the purchase order — which
means the tool's recommendation is drawn from a subset of reality and presented
as the whole of it. A manual quote is just another adapter whose data source is
a person.

**Landed cost, not unit price.** This is the decision the tool is really for.
Import tax, clearance fees, the minimum order value, the free-shipping threshold
and the country of origin all sit on the supplier record and enter the
comparison. It is also why the destination is a first-class concept: every rate
lives in a `tax_regions` table rather than as a constant in the calculation, and
the calculation returns the reason alongside the number so the interface never
shows a bare percentage.

**Order quantity is an ordered calculation, not a multiplication.** The sequence
is: quantity per board × build quantity, plus yield loss, plus attrition
weighted by package size, minus stock on hand, then rounded up to the order
multiple with the MOQ as a floor. Doing those in the wrong order gives a
plausible number that is wrong. Needing 1,200 of a part sold in reels of 4,000
costs three times the naive estimate, and that is the kind of surprise that
arrives after the purchase order.

**Nothing is silently corrected.** A part with no price is never counted as
zero — it is marked unknown and raised as a warning, because a total that
quietly omits the unpriced rows is the most expensive bug this class of tool
has. A manual quote past its validity date still counts, labelled expired rather
than dropped. A bad import row imports as-is and stays flagged. In each case the
alternative is a number that looks complete and is not.

**Money is `Decimal` and the exchange rate is pinned to the record.** Component
prices go below a cent, so floating point is out. The FX rate is stored on the
quote with its source and timestamp, which is what lets a costing run from three
months ago be reproduced instead of re-derived at today's rate.

## Validation

The cost rules are a pure module with no dependency on the web layer, which is
what makes them testable — quantity arithmetic, price-break selection, landed
cost, sourcing optimisation and purchase-list generation each have their own
unit tests. The supplier adapters are tested against recorded responses, so a
change to the normalisation can be caught without calling a live API or spending
rate limit.

## Status

In use, and still being built out. What runs today covers projects and immutable
versions, BOM import with saved column mappings and a validated preview, the
part catalogue, live Digi-Key and Mouser adapters, manual and RFQ quotes,
asynchronous costing runs, landed cost for Canada, sourcing optimisation,
per-supplier purchase lists, and simple inventory and equipment tracking.

The design decision behind that ordering: the tool became worth using well
before it was finished, because each milestone ends at something you can
actually buy parts with rather than at a layer of infrastructure.
