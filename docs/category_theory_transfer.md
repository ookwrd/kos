# Category Theory as Knowledge Transfer Infrastructure

*How the formal structures of category theory become the operational machinery of cross-domain knowledge translation in KOS*

---

## Why Category Theory

Category theory is the mathematics of structure-preserving maps. When we ask "is the TEPCO authority-override pattern structurally similar to the clinical trial committee override pattern?", we are asking whether there exists a structure-preserving map (functor) from one graph to the other.

The key insight: in category theory, *what you lose* in a mapping is as important as *what you preserve*. A functor that forgets some structure is a valid functor — but it is documented as lossy. This matches epistemological reality: cross-domain analogies are never perfect. Encoding the loss explicitly is what separates KOS from naive knowledge graph merging.

---

## Local Ontologies as Categories

Each knowledge domain in KOS is a **small category**:

- **Objects**: Entities, Mechanisms, DecisionTraces, Goals, Constraints — anything that can be a node in the graph
- **Morphisms**: The typed edges between nodes — `causes`, `supports`, `contradicts`, `requires`, `governs`, `instantiates`
- **Composition**: Following a chain of morphisms gives another morphism (A causes B, B enables C → A transitively enables C)
- **Identity**: Every object has a trivial self-relation (exists)

This is not metaphor — it is a construction. Given any KOS domain subgraph, you can read off its objects and morphisms and verify that the categorical axioms hold (composition is associative, identities exist). The `AlignmentMap` is then a *partial functor* from the source category to the target category.

---

## Functors as Cross-Domain Translators

A `FunctorCandidate` in KOS represents a proposed mapping between two local ontologies before it has been validated. It contains:

- `domain_map: dict[str, str]` — how source entity types map to target entity types
- `morphism_map: dict[str, str]` — how source relation types map to target relation types
- `preservation_claims: list[str]` — what structural properties are claimed to be preserved
- `candidate_score: float` — algorithmic confidence before human review

Validation of a FunctorCandidate checks:
1. **Object coverage**: what fraction of source objects map to something in the target?
2. **Morphism coherence**: does the mapping commute? (If A→B in source and A maps to A', B maps to B', does A'→B' exist in target?)
3. **Composition preservation**: does following a path in the source give the same result as mapping each step individually?

When validation passes, the FunctorCandidate becomes an active `AlignmentMap`. When it fails, a `TransferFailure` is recorded with the specific incoherence.

---

## Natural Transformations as Upgrade Paths

When two different functors F and G both map domain A to domain B (perhaps discovered independently by different research groups), the question becomes: are these two translations compatible? Can we systematically move from one translation to another?

This is what `NaturalTransformationCandidate` captures: a proposed family of morphisms `{η_X : F(X) → G(X)}` for each object X, such that the naturality square commutes:

```
F(A) --F(f)--> F(B)
 |              |
η_A           η_B
 |              |
G(A) --G(f)--> G(B)
```

In practice, a `NaturalTransformationCandidate` in KOS means: "We have two different ways of aligning drug_discovery to fukushima_governance. This candidate claims they are systematically related — the disagreement between them is itself structured."

Natural transformations are rare in the current implementation — they require at least two active alignment maps between the same pair of domains. But they become the mechanism for *upgrading* alignments when better translations are discovered.

---

## Limits and Colimits as Knowledge Synthesis

The universal constructions of category theory — limits and colimits — have direct knowledge-graph interpretations:

**Pullback (a type of limit)**: Given two domains that both have evidence about the same phenomenon (say, authority-override patterns), the pullback is the "common core" — the aspects that both domains agree on. In KOS, this is the intersection of two AlignmentMaps: the nodes and morphisms that appear in both mappings.

**Pushout (a type of colimit)**: The pushout is the "minimal merge" — a new combined domain that includes both original domains and glues them together at their shared structures. The `GlobalGluingGap` records what could not be glued — the places where the two domains are genuinely incommensurable.

These constructions are not implemented computationally in v3, but they are named explicitly so that the data model is forward-compatible with formal compositional analysis.

---

## The Transfer Operator

The `TransferOperator` is the operational unit of cross-domain knowledge transfer. It is:

1. **Backed by a BridgeMap**: a specific subset of an AlignmentMap that covers a particular claim to be transferred
2. **Paired with a StructuralLossReport**: what is definitively lost in this transfer
3. **Subject to LocalConsistencyCondition**: the target domain must still be locally consistent after the transfer is applied
4. **Governance-gated**: a human or committee must approve before activation

The `TransferOperator` is directional (source → target), explicit about loss, and reversible (governance can revoke it). This matches the institutional reality of cross-disciplinary science: importing a result carries epistemic risk, and that risk must be documented.

---

## What the V3 Objects Add

| New Object | Role |
|---|---|
| `BridgeMap` | A specific, scoped subset of an AlignmentMap covering one transfer claim |
| `TransferOperator` | Activated transfer: BridgeMap + StructuralLossReport + governance approval |
| `FunctorCandidate` | Proposed functor awaiting validation |
| `NaturalTransformationCandidate` | Proposed compatibility between two existing translations |
| `TransferFailure` | Record of why a FunctorCandidate or TransferOperator was rejected |
| `StructuralLossReport` | Enumeration of what a transfer loses |
| `LocalConsistencyCondition` | A condition that the target domain must satisfy for the transfer to be coherent |
| `GlobalGluingGap` | A pair of domains that cannot be fully reconciled — an irreducible ontological difference |

Together these objects make the transfer process **auditable from proposal to approval to loss accounting**. Each step is a graph node. The full history is queryable.

---

## The Reflexive Case: math_category_theory as a Domain

The `math_category_theory` domain is a deliberate reflexivity exercise. It contains entities like `Object`, `Morphism`, `Functor`, `NaturalTransformation`, `Adjunction` — the formal objects that KOS uses as its transfer infrastructure.

Asking whether a `FunctorCandidate` from `math_category_theory` to `alignment` exists is asking whether the formal theory that KOS is built on can be represented within KOS itself. This is the Godelian self-reference of knowledge infrastructure: can a knowledge system model the structures it uses to know?

In v3, this domain exists as a fixture — it seeds the graph with the core category-theoretic objects and a set of morphisms between them. The cross-domain bridge to `alignment` then demonstrates that KOS's own conceptual foundations are represented in its knowledge base, making the system genuinely reflexive.

---

## Implementation Notes

- All new v3 objects live in `backend/kos/models/alignment.py`
- The `AlignmentService` in `backend/kos/alignment/service.py` will need `compute_bridge_map()`, `validate_functor()`, and `apply_transfer()` methods
- Frontend: `OntologyBridgeView.tsx` should be extended to show `TransferOperator` status and `StructuralLossReport`
- The `SerendipityPanel.tsx` will query for high-novelty `FunctorCandidate` proposals and surface them as discoveries

---

## Further Reading

- Spivak & Kent, "Ologs: A Categorical Framework for Knowledge Representation" (2012)
- Lawvere & Schanuel, "Conceptual Mathematics" — accessible introduction to categories
- Fong & Spivak, "Seven Sketches in Compositionality" (2018) — applied category theory for scientists
- Baas et al., "Topological Data Analysis and Knowledge Graphs" — sheaf-theoretic interpretation
