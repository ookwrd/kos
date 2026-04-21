# Category Theory and Ontology Alignment in KOS

## Why category theory

Category theory provides a language for compositionality, translation, and structure-preservation. In KOS, the most immediately useful ideas are:

1. **Ologs / structured schemas** — treating an ontology as a database schema with composable structure
2. **Functors** — structure-preserving maps between ontologies
3. **Path semantics** — treating graph paths as compositional morphisms
4. **Sheaf semantics** — local-to-global consistency for partially compatible expert subgraphs

This document explains what is conceptual framing vs. what is actually coded in the current implementation.

---

## What is actually coded

### AlignmentMap

The `AlignmentMap` model and `AlignmentService.compute()` implement a **structural heuristic** inspired by functor ideas:

1. Fetch entities from two domains (source and target)
2. Match by normalised label similarity (Jaccard bigram) and shared entity_type
3. Classify each mapping by confidence: EXACT / CLOSE / PARTIAL / ANALOGICAL / FAILED
4. Collect gaps: source concepts with no target counterpart, and vice versa
5. Compute coverage = mapped / total source nodes
6. Write structural notes narrating where alignment fails

The result is an `AlignmentMap` with:
- `mappings`: list of `OntologyMapping(source_node_id, target_node_id, confidence, score, structural_loss)`
- `gaps_source`: source concepts with no counterpart
- `gaps_target`: target concepts with no counterpart
- `coverage`: 0–1 fraction
- `structural_notes`: narrative

This is a real, structured object stored in Neo4j — not just a description. It is browsable in the `OntologyBridgeView` frontend component.

### The functor analogy

In category-theoretic terms, each domain ontology is a small category:
- **Objects** = entity types (PROTEIN, COMPOUND, GENE, etc.)
- **Morphisms** = relation types (CAUSES, INHIBITS, PART_OF, etc.)
- **Composition** = path concatenation through the graph

An `AlignmentMap` is a partial functor F: C_source → C_target that:
- Sends objects to objects where they exist (e.g., PROTEIN→PROTEIN is usually exact)
- Sends morphisms to morphisms where they exist (e.g., INHIBITORY→INHIBITORY matches; REGULATORY may not)
- Leaves gaps explicit (e.g., COMPOUND exists in drug_discovery but not in ai_hardware)

**What is coded:** the mapping table, gap detection, and coverage metric.

**What is not coded:** automated composition verification (does F(g ∘ f) = F(g) ∘ F(f)?), pullback/pushout for computing a "universal" alignment, or formal proof of functor properties. These require a formal ontology representation (e.g., OWL with DL reasoner) and are flagged as future work.

---

## What is conceptual framing

### Sheaf semantics for local-to-global consistency

The "knowledge cities" metaphor in the KOS brief reflects sheaf semantics:
- Local ontologies (neighbourhoods) have their own coherence
- Bridges (restrictions) connect them
- Global consistency is partial: some facts are only locally valid
- Contradictory local views are permitted without forcing global resolution

This framing is architecturally expressed in KOS by:
- One domain per entity (domain field on all nodes)
- AlignmentMap nodes making cross-domain mappings explicit
- Gaps in the alignment representing unsatisfied gluing conditions
- No forced universal ontology

What is **not coded:** a formal sheaf data structure, gluing morphisms computed by a Čech cohomology-style algorithm, or topological consistency checks. These are active research problems in applied category theory (see: David Spivak's work on database schemas as categories, and Abramsky/Coecke on sheaf semantics for contextuality).

### Free categories over graphs

A graph naturally induces a free category: objects are nodes, morphisms are paths, composition is path concatenation. KOS mechanism paths (the Cypher `shortestPath` query in `KnowledgeGraphService.explain_path()`) implement path semantics operationally:

```
KRAS → (HAS_MECHANISM) → mech-KRAS-activates-RAF → (TARGETS) → RAF
     → (HAS_MECHANISM) → mech-RAF-activates-MEK  → (TARGETS) → MEK
     → (HAS_MECHANISM) → mech-MEK-activates-ERK  → (TARGETS) → ERK
```

This path is a composed morphism from KRAS to ERK. Its confidence is the product of mechanism confidences along the path (or the minimum — the choice of composition rule is a domain decision).

**What is coded:** the shortestPath query returns the chain.

**What is not coded:** formal composition of confidence scores along paths, type-checking that morphism composition is well-typed across the ontology, or functorial lifting of paths across the alignment map.

---

## Practical design implications

### Design principle 1: explicit gaps beat forced alignment

When `AlignmentService.compute()` detects that a source concept has no counterpart in the target, it adds the source ID to `gaps_source` and generates a structural note. The UI renders these gaps in red in the `OntologyBridgeView`. This is more useful than silently ignoring the gap or forcing a FAILED mapping.

### Design principle 2: alignment is versioned

`AlignmentMap` has a `version` field (default 1). When a domain ontology is updated (new entity types added, new mechanism types deployed), the alignment should be recomputed and a new version stored. The graph preserves the history.

### Design principle 3: partial alignment is the target, not a failure mode

Total alignment (all source concepts map to target) is usually a sign that the ontologies are too coarse — they have lost the domain-specific precision that makes expert knowledge valuable. KOS treats 40–80% coverage as typical and expected, and treats the gaps as research signals.

---

## The OntologyBridgeView UI

The `OntologyBridgeView` React component renders an `AlignmentMap` as:
- Left column: source ontology nodes (coloured by entity_type)
- Right column: target ontology nodes
- Connecting lines: alignment mappings (green = EXACT, yellow = CLOSE/PARTIAL, grey = ANALOGICAL)
- Red orphan nodes: gaps (no mapping)
- Structural notes panel below: narrative of what alignment fails mean

This makes the alignment interactive: clicking a gap node shows which entity it is and why it has no counterpart. This is the visual answer to: "Where do these two ontologies align, and where do they fail to translate?"

---

## Next steps (future work)

1. Implement composition verification: check that aligned mechanism paths compose correctly across the functor
2. Integrate with an OWL reasoner (e.g., OWL API + HermiT) for formal concept subsumption
3. Implement a pushout-based "canonical alignment" that constructs a minimal shared vocabulary
4. Study sheaf-based consistency metrics for multi-domain graphs
5. Explore Spivak's ologs as a formal schema language for KOS ontologies
