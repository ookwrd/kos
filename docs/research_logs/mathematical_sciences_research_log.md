# Research Log — Mathematical Sciences Domain Family

*April 2026 — Metro Region 4: math_category_theory (singleton region)*

## Source Method

Synthesized from training knowledge. Category theory is a well-established mathematical field; no factual claims are speculative. All entities are standard mathematical objects.

Labels: **training-knowledge-grounded synthetic fixture** — but note: unlike other domains, no historical events are claimed. The fixture contains mathematical objects, not events.

---

## math_category_theory

### What the fixture contains

The `math_category_theory` fixture contains standard mathematical objects used in KOS's alignment framework:

| Entity | Status | Notes |
|---|---|---|
| Category | Standard | Saunders Mac Lane & Samuel Eilenberg, 1945 |
| Functor | Standard | Mac Lane & Eilenberg, 1945 |
| Natural transformation | Standard | Mac Lane & Eilenberg, 1945 |
| Adjunction | Standard | Daniel Kan, 1958 |
| Limit / Colimit | Standard | Standard category theory |
| Yoneda Lemma | Standard | Nobuo Yoneda, 1954 |
| Topos | Standard | Grothendieck & Verdier, 1960s |
| Sheaf | Standard | Jean Leray, 1940s |
| Olog | Standard | Spivak & Kent, 2012 |
| Partial functor | Standard | Standard, applied in FunctorDB and related systems |

There are no demo constructs in this fixture. Category theory objects do not require calibration scores — they are mathematical facts.

### Why this domain exists in KOS

The `math_category_theory` city serves a dual purpose:

1. **Self-referential grounding**: KOS uses category theory as its alignment framework. Having a category theory domain in KOS means that KOS can reason about its own alignment machinery — the AlignmentMap between drug_discovery and fukushima_governance is itself a category-theoretic object, and that object lives in the math_category_theory city.

2. **Bridge foundation**: the `bridge-adjunction-alignment` (math_category_theory ↔ fukushima_governance) with 0.91 confidence demonstrates that the KOS AlignmentMap is a concrete instantiation of a partial functor. This bridge grounds the category theory vocabulary in a specific engineering artifact.

### Key facts about referenced sources

| Source | Claim | Accuracy |
|---|---|---|
| Spivak & Kent 2012 ("Ologs") | Ologs are typed graphs that form categories | Correct |
| Spivak 2012 ("Functorial Data Migration") | Database schemas are categories; migrations are functors | Correct |
| Grothendieck 1960s | Topos as generalized space with sheaf structure | Correct in broad terms |
| Mac Lane 1971 ("Categories for the Working Mathematician") | Standard reference for category theory | Correct |

### Relationship to implementation

The math_category_theory domain is the conceptual backbone for:
- `AlignmentMap` (partial functor representation)
- `NaturalTransformationCandidate` (comparison of competing translations)
- `GlobalGluingGap` (sheaf-like consistency failure)
- `FunctorCandidate` (proposed mapping before validation)

See `category_theory_transfer_v2.md` for the full architecture document.

### Key gaps

- No decisions in fixture (appropriate — mathematical objects don't have decision traces in the normal sense)
- The fixture is the smallest city (18 nodes) — appropriate given that it is a singleton methodological region
- V5 potential: add decision traces for mathematical developments (e.g., Eilenberg & Mac Lane's original category paper publication; Yoneda's "decision" to prove his lemma) — this would be historically grounded and thematically interesting

---

## Planned Expansion of Region 4

The V5 and beyond architecture for Region 4 (Mathematical Sciences) adds two cities:

### algebraic_structures (planned)
Would contain: rings, groups, modules, algebras, field extensions, Galois theory — the algebraic infrastructure that underlies much of formal epistemology and causal inference.

Key bridge: algebraic_structures ↔ math_category_theory (algebra as category theory applied to sets with operations).

### causality_complex_systems (planned)
Would contain: Pearl's do-calculus, causal diagrams, counterfactual reasoning, interventional vs. observational distributions.

Key bridges:
- causality_complex_systems ↔ drug_discovery (clinical trial design as causal inference; RCT as intervention; confounding as absent causal node)
- causality_complex_systems ↔ fukushima_governance (the counterfactual "If Omega existed" in DecisionReplay is a causal reasoning claim)

This city would give KOS a formal foundation for the `OmegaCounterfactual` component in DecisionReplay — the "IF OMEGA EXISTED" block would be backed by explicit causal graph queries rather than narrative assertion.

---

## Source Quality Assessment

Math_category_theory is the highest-quality fixture in terms of factual accuracy — there are no fabrications because the entities are mathematical objects with definitions that can be verified against standard references. The tradeoff is that it is the least narratively engaging domain for non-mathematical audiences.

The conceptual bridge to KOS engineering (AlignmentMap as partial functor) is where the domain earns its place in the demo.
