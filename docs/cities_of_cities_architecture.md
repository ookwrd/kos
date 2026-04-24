# Cities of Cities Architecture

*V5 design document, April 2026*

---

## The Core Metaphor

A knowledge city is more than a collection of nodes. It is a living epistemic territory with its own governance, its own internal structure, and its own relationships to neighboring cities. The challenge for Omega is to make scale legible — to let you navigate from the room-level (a single evidence fragment) to the civilizational level (a federation of knowledge domains) without losing orientation.

The city metaphor is not decorative. It is structural. Cities have:
- **Districts** — neighborhoods of tightly coupled knowledge
- **Infrastructure** — roads (decision pathways), utilities (shared evidence), governance zones (authority boundaries)
- **External relations** — trade routes (transfer pathways), diplomatic links (alignment maps), bridges (serendipitous cross-domain connections)
- **Ecology** — some districts grow, some decay, some are frontier territory

---

## Scale Hierarchy

```
Room / Fragment                 — a single evidence fragment, tacit trace, or multimodal record
    └── Building                — an entity, mechanism, hypothesis, or decision node
        └── Block               — a tightly coupled cluster (e.g., "KRAS pathway" within drug_discovery)
            └── District        — a named subdomain (e.g., "Clinical Trial Governance" within drug_discovery)
                └── City        — a knowledge domain pack (e.g., drug_discovery)
                    └── Region  — a metro area of related cities (e.g., "Governance & Safety")
                        └── Federation — a domain-of-domains (e.g., "High-Stakes Institutional Knowledge")
                            └── MetaCity — the full Omega substrate (all knowledge, all cities)
```

### Level definitions

| Level | Omega Concept | Visual Representation | Example |
|---|---|---|---|
| Room/Fragment | EvidenceFragment, TacitStep | A point or icon within a building | "BBB permeability assay result" |
| Building | Entity, Mechanism, Hypothesis, DecisionTrace | A 3D building in CityOverview | "KRAS G12C binding mechanism" |
| Block | Subgraph cluster within a domain | A named cluster within a city district | "RAS/MAPK signalling pathway" |
| District | Subdomain with named focus | A zone within a city's boundary | "Clinical Trial Governance" in drug_discovery |
| City | Domain pack | Full city in CityOverview | `drug_discovery` |
| Region | Metro region — closely related domains | Soft halo around city group | "Governance & Safety" region |
| Federation | Domain-of-domains | Bridge density between city groups | Governance domains + Safety domains |
| MetaCity | The complete Omega substrate | Full CityOverview at maximum zoom-out | All 10+ knowledge cities together |

---

## Metro Regions

The current 10 knowledge cities naturally cluster into four metro regions:

### Region 1 — Governance & Safety
*Color: soft orange/amber*
- `fukushima_governance` (large)
- `aviation_safety` (small)
- `pandemic_governance` (medium)
- `extreme_environments` (medium)

**Internal character:** All four cities share the structural pattern of authority-vs-calibrated-expertise tension. The cross-city bridges in this region are the densest. This region is the emotional core of the Omega narrative.

### Region 2 — Advanced Manufacturing
*Color: soft green*
- `euv_lithography` (large)
- `semiconductor_hardware` (medium)
- `surgical_robotics` (medium)

**Internal character:** Tacit knowledge-intensive domains. Deep process expertise, hardware-software co-design, haptic and embodied skill that resists codification. The EUV → Semiconductor bridge is the most technically detailed transfer in the system.

### Region 3 — Discovery Science
*Color: soft blue/cyan*
- `drug_discovery` (large)
- `climate_policy` (large)

**Internal character:** Evidence uncertainty, expert consensus vs. political authority, long time horizons. The drug_discovery → climate_policy bridge is underexplored (evidence uncertainty handling; regulatory vs. scientific authority structures are structurally similar).

### Region 4 — Mathematical Sciences
*Color: soft purple*
- `math_category_theory` (small)

**Internal character:** Currently a singleton region. If `algebraic_structures` and `causality_complex_systems` cities are added, this region grows into a methodological domain that provides formal transfer tools for all other regions.

---

## District Model (Within a City)

Each large city should eventually have named districts. Here are the proposed district structures for the flagship cities:

### drug_discovery districts
- **Molecular Sciences** — entities: KRAS G12C, AMG510, BBB barrier; mechanisms: RAS activation, P-gp efflux
- **Clinical Trial Governance** — decision traces: Phase II approval, CNS deferral; agents: oncologists, regulators
- **Evidence Synthesis** — hypotheses: CNS penetration, off-target effects; uncertainty annotations
- **AI Tool Integration** — MolScreen-v2, virtual screening, ADMET prediction

### fukushima_governance districts
- **Hazard Assessment** — geological evidence, Jogan record, PTHA
- **Regulatory Authority** — TEPCO management decisions, NRA mandate, JSCE subcommittee
- **Technical Dissent** — civil engineering assessments, suppressed objections
- **Post-Event Analysis** — 2011 reconstruction, accountability records, IAEA reports

### euv_lithography districts
- **Light Source Engineering** — tin droplet generator, pre-pulse technique, CO₂ laser
- **Optics Train** — Carl Zeiss mirrors, aberration correction, overlay metrology
- **Process Integration** — wafer stage, dose control, yield optimization
- **Knowledge Custody** — tacit calibration traces, engineer certification, succession protocols

---

## Zoom Behavior (Target Design)

The intended zoom behavior (currently planned, not yet implemented):

| Camera Distance | What User Sees |
|---|---|
| Very far (z > 80) | All cities as colored dots with labels; region halos visible |
| Far (z 40–80) | City shapes, building clusters; bridge arcs visible |
| Medium (z 20–40) | **Current default** — individual buildings, streets, labels |
| Close (z 8–20) | Districts become visible; building labels appear; internal roads detailed |
| Very close (z < 8) | Individual building floors (rooms); evidence fragments as icons |

---

## Implementation Status

| Feature | Status |
|---|---|
| City scale taxonomy (large/medium/small) | ✅ Implemented in CityOverview.tsx |
| Internal streets for large cities | ✅ Implemented |
| Bridge arcs between cities | ✅ Implemented (8 bridges) |
| Metro region halos | 🔲 Planned — architecture defined here, code pending |
| District boundaries within cities | 🔲 Planned — data model needed first |
| District zoom-reveal | 🔲 Planned — requires LOD (level-of-detail) system |
| Room-level fragment view | 🔲 Planned — very deep future work |
| Region labels at far zoom | 🔲 Planned — pending metro region implementation |
| Federation-level view | 🔲 Planned — MetaCity concept only |

---

## Implementation Plan for Metro Region Halos

The most tractable next step is to add metro region halos to CityOverview.tsx. This requires:

1. Define `METRO_REGIONS` data structure mapping region name → list of domain IDs + color
2. Compute the centroid of each region from `DOMAIN_POSITIONS`
3. Render a large transparent ellipse (Three.js `CircleGeometry` with low opacity) centered on the region centroid
4. Show region label at the centroid, fading out on close zoom
5. The halo should have no hard border — use `MeshBasicMaterial` with `transparent: true, opacity: 0.04`

Estimated implementation: 60–80 lines of React Three Fiber code.

---

## Knowledge Guardian Nodes

In each city, there are nodes that represent not just information but stewardship — agents responsible for maintaining the integrity of a district. These are **Knowledge Guardians**.

Examples:
- In `euv_lithography`: the ASML process engineer who holds the step-6 calibration judgment. When they retire, the guardian node transfers to their designated successor (a Delegation in the agent layer).
- In `fukushima_governance`: the civil engineering division as a whole is a guardian of the seismic hazard assessment. Their suppressed dissent is a guardian failure mode.
- In `drug_discovery`: Dr. Sarah Chen is the guardian of the CNS safety gate — the knowledge that the BBB constraint threshold is 0.40 and why.

Guardian nodes are visualized as slightly pulsing, more saturated versions of their domain color. A guardian node that has no active successor shows a faint amber warning glow.

This concept is implemented in documentation only for V5. Code scaffold needed.
