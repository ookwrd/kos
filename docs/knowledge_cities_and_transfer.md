# Knowledge Cities and Transfer

*How KOS represents multi-domain knowledge as inhabited, governed, connected cities*

---

## The City Metaphor

A single knowledge graph is a map. Multiple knowledge graphs are cities — each with its own streets, zoning laws, and spoken dialect. The challenge of cross-domain transfer is the challenge of building bridges between cities that were not designed to connect.

KOS makes this literal. Each domain is a **knowledge city**: a subgraph with its own ontological vocabulary, its own agent ecology, and its own governance constraints. Cities are not isolated — they share infrastructure (the same graph database, the same governance layer, the same agent council). But their *schemas* differ, and that difference is the scientifically interesting fact.

---

## What Makes a City

A knowledge city in KOS consists of:

**1. Local ontology** — the vocabulary of that domain. In `drug_discovery`, the vocabulary includes `KRAS`, `MEK`, `clinical trial`, `ADMET profile`. In `fukushima_governance`, the vocabulary includes `seawall`, `TEPCO`, `10m tsunami scenario`, `NRA mandate`. These vocabularies are incommensurable — there is no direct translation of `BBB threshold` into nuclear safety terminology.

**2. Local agent ecology** — the experts, institutions, AI systems, and committees that act within the domain. Dr. Sarah Chen is a drug discovery agent. The TEPCO Civil Engineering team operates in fukushima_governance. ASML Systems Engineers live in euv_lithography. Agents can *visit* other cities (through delegation or consultation) but they have home domains.

**3. Local governance** — the permission structures, constraint sets, and obligation graphs specific to the domain. Clinical trial governance (FDA approval chains, IRB oversight) is structurally different from nuclear safety governance (NRA mandate, operator self-reporting).

**4. Local evidence base** — the EvidenceFragments specific to the domain: papers, lab measurements, regulatory filings, sensor readings. Evidence is typed (primary_literature, measurement, regulatory, tacit) and linked to mechanisms and decisions.

---

## What Transfer Means

Transfer is not replication. Copying a fact from one domain to another ignores the structural context that gave the fact its meaning.

Transfer in KOS means applying a **functor** (in the category-theoretic sense) between two local ontologies. The functor maps:

- Objects (entities/concepts) to objects
- Morphisms (relations/mechanisms) to morphisms
- In a structure-preserving way — so that a causal chain in the source domain maps to a causal chain in the target domain

This is captured in the `AlignmentMap` and extended by the `TransferOperator`. The transfer is:
- **Exact** when both the objects and the structural relationships are preserved
- **Partial** when some relations have no target correspondence
- **Analogical** when the structural role (position in the causal graph) matches but the surface content differs
- **Failed** when no structure-preserving map exists

The gaps are as scientifically valuable as the mappings. A gap means: this domain has a concept that the other domain has no word for. That asymmetry is a research question.

---

## Governed Transfer

Transfer in KOS is not automatic. It is **governed**. Any cross-domain bridge must pass through governance review before it modifies the knowledge state of the target domain.

This reflects a real institutional reality: in science, importing a result from another field is not trivial. The epistemological standards, the measurement conventions, the interpretive frameworks may differ. A result that is well-established in pharmacology may be a weak analogy in nuclear safety.

KOS enforces this by requiring that every `TransferOperator` has:
- A **BridgeMap** describing the structural mapping
- A **StructuralLossReport** documenting what is lost in translation
- A **governance review** before activation
- A `TransferFailure` record if the review rejects the transfer

---

## The Discovery Moment

The most important capability KOS adds over a plain knowledge graph is **serendipitous discovery** — surfacing unexpected structural parallels that a domain expert would not have known to search for.

The mechanism:
1. When a new `GraphChangeProposal` of type `bridge` is generated, it proposes connecting nodes across domains.
2. The proposal includes a `novelty_score` (how unexpected is this connection?) and a structural rationale.
3. The SerendipityPanel surfaces the highest-novelty proposals as "cross-domain discoveries."
4. The user can accept, reject, or ask for more context on any discovery.

This is not search. The user didn't ask for this. The graph found it. That's the demonstration of open-ended knowledge growth.

---

## The Five Active Bridges (V3 Demo Set)

| ID | Source | Target | Pattern | Novelty |
|---|---|---|---|---|
| bridge-auth-override | fukushima_governance | surgical_robotics | Expert dissent overridden by authority | 0.87 |
| bridge-calibration-decay | drug_discovery | semiconductor_hardware | Calibration drift across time | 0.79 |
| bridge-deviance-normalization | extreme_environments | fukushima_governance | Normalization of small failures | 0.91 |
| bridge-adjunction-alignment | math_category_theory | alignment | Formal correspondence with loss | 0.76 |
| bridge-tacit-skill | surgical_robotics | euv_lithography | Irreducible situated skill | 0.82 |

---

## City Topology

In the CityOverview 3D visualization, each city occupies a spatial region. The height of each building (node cluster) represents knowledge density — how many mechanisms and evidence fragments link through that node. Bridges appear as glowing arcs connecting city districts.

The topology is not arbitrary. Cities with more structural parallels (more bridges) appear closer together. Cities with few connections are visually isolated. This makes the knowledge geography legible at a glance: drug_discovery and surgical_robotics are close; math_category_theory is distant but has rare, high-value bridges.

---

## Long-term Vision: Knowledge Metabolism

A mature KOS would not just store knowledge — it would metabolize it. Old evidence would decay (uncertainty increases over time without corroboration). New connections would grow through the open_endedness layer. Agents would migrate between cities as their competence evolves.

This is the ALife framing: knowledge as a living ecology, not a static archive. The current implementation plants the seeds — AlignmentMap, GraphChangeProposal, agent calibration decay — but the metabolic dynamics are future work.
