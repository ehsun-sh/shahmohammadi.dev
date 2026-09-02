---
role: 'The .NET architecture and its implementation: the equipment-integration layer, the distributed services, the topology and shelf views, the FCAPS functions, and the stability and memory work that let it run unattended.'
context: 'Danial Moj.'
tools: 'C# / .NET, SNMP v1/v2c/v3, Docker, RabbitMQ, relational databases.'
licence: 'Employer-owned, unpublished.'
status: shipped
gallery:
  - src: ../../assets/projects/optical-nms-shelf-view.webp
    alt: 'The NE shelf view: sixteen numbered slots drawn as a rack, each populated card rendered with its own port and status indicators and labelled by type — transponder, fan unit, XFP 10G, media converter, OEO regenerator, E1-to-optical — above a status bar giving the system name, IP address, attached power, fan status and temperature.'
    caption: 'One network element, drawn as the shelf an engineer would be standing in front of. Card type, port state, fan status and temperature all come from the same SNMP walk.'
  - src: ../../assets/projects/optical-nms-topology.webp
    alt: 'The management client: a network tree of sites down the left with per-site alarm severity bars, an NE configuration dialog in the centre carrying name, location, IP address, subnet, gateway and four SNMP trap hosts, a geographic map locating the selected element, and an alarm table along the bottom.'
    caption: 'Configuration, location and live alarms in one client. The four trap-host fields are the fault path being configured from the same place it is watched.'
specs:
  - label: 'Scale'
    value: '2,000+ network elements, 24/7 operation'
  - label: 'Protocols'
    value: 'SNMP v1, v2c and v3 with authentication and encryption'
  - label: 'Platform'
    value: '.NET'
  - label: 'Services'
    value: 'Dockerised microservices over a RabbitMQ broker'
  - label: 'Scope'
    value: 'FCAPS — fault, configuration, accounting, performance, security'
  - label: 'Views'
    value: 'Geographic topology, schematic topology, NE shelf and slot'
---

## Problem

An optical transport network is thousands of pieces of equipment in rooms
nobody visits. It works or it does not, and the only way anyone finds out is
the software watching it. That makes a network management system a strange kind
of product: it is not what the operator bought, it is how they find out whether
what they bought is still working.

Three constraints make it hard, and they pull in different directions. It has
to run continuously — an NMS that needs a weekly restart is worse than useless,
because the outage it misses will be during the restart. It has to stay
responsive across thousands of devices, which is a concurrency problem, not a
throughput one. And it has to absorb new equipment types without being
rewritten, because the transport products it manages keep arriving and the NMS
outlives all of them.

## Architecture

A modular .NET system, split into services rather than built as one process.

Equipment is reached over SNMP — v1, v2c and v3 — and the integration layer is
where the modularity lives: a new equipment type is a definition rather than a
change to the core, which is what lets the same NMS manage a product that did
not exist when it was written.

Around that sit the management functions an operator's workflow actually needs:
a topology view in both geographic and schematic form, a network-element view
that draws a device as its real rack and slots, fault management, performance
management, provisioning and inventory. Between them, Dockerised services
coordinated by a RabbitMQ broker, so a slow or failed component degrades one
function instead of freezing the client.

SNMPv3 carries authentication and encryption, and access control sits on top,
because a system that can configure every network element in a carrier's
network is itself a piece of critical infrastructure.

## Design decisions

**Distributed services over a message broker, not one application.** With
thousands of devices, the work is thousands of small, independent,
mostly-waiting conversations. Doing that in one process means one slow device
can stall the interface, and it means scaling is vertical and finite. Putting
the work behind RabbitMQ makes each service independently restartable and
independently scalable, and it is what makes the client stay responsive while
the polling underneath it is saturated.

**SNMP as the integration boundary.** A proprietary protocol would have been
easier to write and would have made every new equipment type a joint project
between two teams. SNMP is what the operator's existing tooling already speaks,
so the NMS drops into the monitoring stack a carrier already runs — and the
equipment side of a new integration becomes a MIB rather than a negotiation.

**A shelf view that looks like the shelf.** Rack, slot, card type, port and LED
state, rendered as the physical object. The alternative is a table, which is
denser and much slower to read under pressure. When someone is on the phone at
three in the morning, the question is "which card, which port" — and a picture
of the shelf answers it in the same terms the engineer at the site is using.

**Memory treated as a correctness property.** This is the part that decided
whether any of the rest worked. A process that runs for months does not get to
leak: a small, steady leak is indistinguishable from a working system right up
until it is an outage, and it is invisible to any test that runs for an hour.
Profiling, refactoring and long-running soak tests cut the memory footprint by
**70 %** and, more to the point, made it flat — which is the property that lets
the system carry 2,000+ nodes continuously rather than merely start with them.

## What shipped

The system went into service managing a live optical transport network of over
2,000 nodes on a 24/7 basis, integrated with the databases and client software
around it so the network could be operated from one place.

For monitoring software the meaningful claim is uptime rather than features,
and it is the one thing that cannot be demonstrated on a bench: a management
system is only proven by the months it spends running while nobody thinks about
it.
