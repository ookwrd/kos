# Open-Ended Graph Evolution in KOS

## The ALife principle

Artificial Life research shows that truly powerful adaptive systems require open-endedness: the capacity to generate genuine novelty, not just optimise within a fixed fitness landscape. Applied to knowledge graphs, this means:

- The graph should not just accumulate facts; it should discover missing structures
- Useful motifs should be identifiable and replicable
- Maladaptive or outdated structures should be deprecated
- Cross-domain bridges should emerge from structural analysis, not just human curation

KOS implements **controlled open-ended growth**: variation is generated algorithmically, but selection is governed.

---

## The ecology metaphor

Instead of a monolithic graph, KOS treats the graph as an ecology:

| Ecological concept | KOS equivalent |
|---|---|
| Niches | Domain subgraphs (drug_discovery, governance, ai_hardware) |
| Species | Expert agents (each with a distinct competence profile) |
| Trophic pathways | Mechanism chains (causal flows through entities) |
| Selection pressure | Invocation count on Precedents; confidence scores on Mechanisms |
| Mutation | New EvidenceFragments, new Mechanisms proposed by agents |
| Developmental constraint | Governance review pipeline for GraphChangeProposals |
| Ecological boundary conditions | Permission and Constraint nodes |
| Cross-species interaction | AlignmentMap bridges between domain ontologies |

---

## What is actually coded

### Novelty scanning (`OpenEndednessService.scan_novelty()`)

Three types of proposals are generated automatically:

**1. DENSIFY — sparse neighbourhood detection**

```cypher
MATCH (e:Entity)
OPTIONAL MATCH (e)-[:HAS_MECHANISM]->(m:Mechanism)
WITH e, count(m) AS mechanism_count
WHERE mechanism_count < $threshold
```

Entities with fewer than `sparse_threshold` (default 2) mechanisms are nominated for densification. Novelty score = 1 - (mechanism_count / threshold). These represent under-explored niches in the knowledge graph.

**2. BRIDGE — cross-domain entities with shared mechanism type**

```cypher
MATCH (e1:Entity)-[:HAS_MECHANISM]->(m1:Mechanism)
MATCH (e2:Entity)-[:HAS_MECHANISM]->(m2:Mechanism)
WHERE e1.domain <> e2.domain
  AND m1.mechanism_type = m2.mechanism_type
  AND NOT (e1)-[:HAS_MECHANISM*1..3]-(e2)
```

Entities in different domains that share a mechanism type but have no connecting path are candidates for bridge proposals. In biological terms: if KRAS inhibition (drug_discovery) and photoresist chemical amplification (ai_hardware) are both CAUSAL mechanisms with similar cascade structure, a structural bridge proposal notes this and invites expert review.

Bridge proposals have a fixed novelty score of 0.8 — cross-domain connections are inherently novel.

**3. NEW_EDGE — high-uncertainty nodes without active proposals**

Nodes with `UncertaintyAnnotation.value > threshold` (default 0.75) that have no pending or accepted GraphChangeProposal are flagged. These are the "blank spaces on the map" — the system knows it doesn't know, but no one has proposed how to fill the gap.

### GraphChangeProposal lifecycle

```
Generated (scan_novelty or propose_bridge)
        │
        ▼
status: PENDING
        │
        ▼
Governance review (review_proposal)
        │
   ┌────┴────┐
   ▼         ▼
ACCEPTED   REJECTED
        │
        ▼
(Manual application by engineer or future auto-apply pipeline)
```

**Important:** Proposals are never applied automatically. The `review_proposal()` function changes the status but does not modify the underlying graph. This is intentional: in v1, all structural changes are made by humans informed by proposals. Automated application requires a more mature governance infrastructure.

### Versioned evolution

AlignmentMap has a `version` field. When domains are updated, recomputing the alignment creates a new version while preserving the old one. The `GraphEvolutionTimeline` frontend component visualises these version transitions.

GraphChangeProposals record `created_at` and `updated_at`, enabling a timeline view of when the system proposed structural changes and when they were accepted or rejected.

---

## What is conceptual framing (not yet production-ready)

### ALife novelty search

Formal novelty search (Lehman & Stanley 2011) maintains an archive of behavioural characterisations and selects for novel behaviours relative to the archive. Applied to knowledge graphs, this would mean:
- Representing each subgraph by a behavioural descriptor (e.g., its motif fingerprint)
- Maintaining an archive of encountered motifs
- Proposing new subgraph structures that differ maximally from the archive

This is more powerful than the current sparse-neighbourhood and bridge heuristics but requires:
- A formal subgraph motif representation
- A distance metric over motifs
- An archive data structure (could be Chroma)

### Quality-Diversity (QD) for graph growth

QD algorithms (MAP-Elites, etc.) could fill a "map" of knowledge structures: for each (domain, mechanism_type) pair, find the best-supported mechanism of that type. Gaps in the map = proposals. This is elegant but requires domain-specific fitness functions.

### Automated motif extraction

Frequent subgraph mining (e.g., gSpan algorithm) could identify recurring structural patterns (motifs) in the existing graph and propose their replication in under-populated domains. This is production-ready in graph databases but not yet integrated.

### Graph grammar operators

Formal graph grammars define rewrite rules: if you see pattern X, you may apply rule R to produce pattern X'. A KOS graph grammar would express rules like:
- "If entity A CAUSES entity B and entity B CAUSES entity C, propose entity A CAUSES entity C as a transitive mechanism"
- "If two domains share a CAUSAL mechanism type, propose an analogical bridge"

This is the most principled form of controlled open-endedness — deterministic variation under governance selection.

---

## Governance of proposals

The open-endedness layer generates variation; the governance layer selects. This separation is critical:

1. Proposals are flagged with `proposed_by` (agent ID or "system")
2. Proposals enter a review queue (status: PENDING)
3. A reviewer (human or governed AI) applies `review_proposal(accepted=True/False, note="...")`
4. Accepted proposals are actioned manually (v1) or via auto-apply pipeline (future)
5. Rejected proposals remain in the graph for audit — patterns of rejection inform scanning heuristics

This mirrors the ALife concept of developmental constraints: variation is generated freely, but selection operates through a constrained channel.
