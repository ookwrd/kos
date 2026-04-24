# ConceptAtlas Design Document

**Date:** 2026-04-24
**Status:** Design specification — V5 sprint

---

## Purpose

The ConceptAtlas is Omega's primary visualization of the knowledge geometry underlying cross-domain transfer. It answers a specific question: given a large heterogeneous knowledge graph, where are the concepts that are most transferable, and how does transferability relate to abstraction and substrate-independence?

The Atlas is not a knowledge graph browser (that's the standard node-link graph view). It is a purpose-built projection that collapses the full graph dimensionality to a geometry designed to make transfer opportunities visible.

---

## Three Geometry Axes

The Atlas operates on three conceptual axes. In the 2D scatter view, two are used as spatial dimensions; the third is encoded as visual channel (size or color).

### Axis 1: abstraction_level (0 = concrete, 1 = theorem)

This axis measures how far a concept has been lifted from its domain-specific instantiation toward a general, domain-independent formulation. Concrete end (0): a specific experimental result, a data point, a named entity in a single domain. Theorem end (1): a structural claim that holds across all instances of a pattern regardless of substrate.

Examples:
- "the melting point of lead" → abstraction_level ≈ 0.1
- "conservation of energy in thermal systems" → abstraction_level ≈ 0.5
- "entropy as information-theoretic bound on compression" → abstraction_level ≈ 0.85
- "adjoint functors as universal construction" → abstraction_level ≈ 1.0

Scoring is currently heuristic, based on: number of domains where the concept appears, depth in the KOS ontology hierarchy, and whether the concept has formal proof dependencies. A proper operationalization would require a validated scoring rubric, which does not yet exist.

### Axis 2: substrate_distance (0 = physical/embodied, 1 = symbolic/formal)

This axis measures how far a concept has traveled from physical or biological substrate toward pure symbolic manipulation. Physical end (0): measurements of physical quantities, biological processes, embodied skills. Symbolic end (1): formal systems, logical propositions, mathematical structures.

Note: substrate_distance is not equivalent to abstraction_level. A concept can be highly abstract but still physically grounded (e.g., thermodynamic entropy), or relatively low-abstraction but fully symbolic (e.g., a specific data structure).

In the current implementation, substrate_distance is assigned manually for demo nodes and computed heuristically for graph-imported nodes (based on domain tag: physics/biology/chemistry → low; mathematics/logic/computation → high; social/cognitive → middle).

### Axis 3: application_distance (0 = actionable, 1 = purely general)

This axis measures how directly a concept connects to actionable outcomes vs. serving as foundational scaffolding. Actionable end (0): a decision procedure, an algorithm, a clinical protocol. General end (1): a foundational theorem or framework that shapes how problems are formulated but does not directly produce actions.

In the 2D scatter view, application_distance is encoded as point size (small = actionable, large = general) or as a color channel. In the 3D view (experimental, not in main demo), it is the depth axis.

---

## The 2D Scatter: What It Shows

The primary Atlas view plots **substrate_distance × abstraction_level** as spatial axes, with **transferability** encoded as point size.

Transferability is a composite score: transfer_validity × (1 - structural_loss) × cross_domain_citation_count. It is the best single-number answer to "how likely is this concept to successfully transfer to a new domain?"

The resulting scatter reveals several clusters:

- **Lower-left (concrete, physical)**: domain-specific facts and measurements. Dense, low transferability. These nodes are the raw material that gets processed upward.
- **Upper-right (abstract, symbolic)**: mathematical and logical structures. Sparse, high transferability. These are the substrate-independent transfer vehicles.
- **Upper-left (abstract, physical)**: physical theories at high generality — thermodynamics, information theory, statistical mechanics. Medium transferability; often the most scientifically productive transfer zone.
- **Lower-right (concrete, symbolic)**: specific algorithms and data structures. Low in basic science domains, high in computational ones.

The **transfer zone** is operationally defined as the upper-right quadrant (abstraction_level > 0.6, substrate_distance > 0.6). Concepts in this zone are candidates for cross-domain transfer without domain-specific knowledge. The Atlas highlights this zone with a visual overlay.

---

## Connection to LeCun's JEPA

LeCun's Joint Embedding Predictive Architecture (2022) proposes that intelligent prediction should happen in **abstract latent space**, not in raw sensor/token space. Predicting in raw space requires modeling every irrelevant detail; predicting in abstract space allows the system to operate on what matters structurally.

The ConceptAtlas geometry is a visualization of the same insight applied to knowledge transfer rather than sensory prediction. The transfer zone is the analog of LeCun's abstract latent space: the representation level at which prediction (and, by extension, transfer) is most efficient because most irrelevant domain-specific detail has been abstracted away.

The practical connection: if Omega were to implement an automated transfer recommendation engine (currently planned, not built), it would operate by finding the highest-abstraction-level common ancestor of two domain-specific concepts in the Atlas geometry, then projecting back down to the target domain. This is functionally identical to what a JEPA-style system does when it makes predictions via abstract latent codes.

The Atlas makes this visible: the path from a source-domain concrete node upward through the abstraction axis to the transfer zone, and back down to a target-domain concrete node, is the functor composition path.

---

## Connection to IoC's Shared Context

In Cisco IoC's framework, "shared context" is the common representational substrate that allows distributed agents to work toward a common goal without constant re-negotiation. IoC is somewhat vague about what this substrate actually contains.

Omega's answer is: **the ConceptAtlas is what gets shared**. Specifically, the semantic-layer objects plotted in the Atlas — named concepts with typed relations, positioned in the abstraction geometry — are the shared context objects. When two domain agents want to collaborate, they first find their concepts in the Atlas, identify common ancestors in the transfer zone, and negotiate a functor mapping that allows their respective concrete knowledge to be expressed in terms of the shared abstract node.

This is a specific, grounded answer to IoC's otherwise vague "shared context" requirement.

---

## Bridge Visualization

The Atlas overlays cross-domain bridges as edges connecting nodes from different domain clusters. Bridge properties displayed:
- Transfer validity score (color intensity)
- Structural loss (edge dashing — solid = low loss, dashed = high loss)
- Functor type (one-to-one mapping vs. many-to-one vs. approximate)
- Direction of validated transfer (arrowhead)

Clicking a bridge opens the TransferWorkbench for that specific mapping.

---

## Implementation Status

Implemented and functional:
- 2D scatter plot with substrate_distance × abstraction_level axes
- Transferability as point size
- Domain color coding
- Transfer zone quadrant overlay
- Bridge edge visualization with validity and loss encoding
- Click-through to TransferWorkbench
- Node detail panel on hover/select

Using demo data, not live computation:
- abstraction_level and substrate_distance scores (manually assigned for demo nodes)
- Transferability composite score (manually set for demo bridges)
- All Atlas content (approximately 80 demo nodes across 6 domains)

Not yet implemented:
- Live Atlas generation from Neo4j graph
- Automated abstraction_level scoring pipeline
- 3D view with application_distance as depth
- "Find transfer opportunities" search: given a source concept, surface high-potential bridges
- Functor path visualization (upward → transfer zone → downward)

The Atlas is visually compelling in demo. The gap between demo data and a live, auto-populated Atlas is substantial — primarily because scoring the geometry axes reliably at scale is an unsolved problem requiring either manual curation at scale or a validated automated scoring approach.
