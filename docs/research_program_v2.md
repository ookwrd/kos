# KOS Research Program v2

## Overview

KOS is a research prototype as much as a software system. This document defines the open scientific questions that motivate its design and the experimental approaches for addressing them.

---

## Open research questions

### 1. How should context graphs, semantic graphs, and goal graphs interact?

**Problem:** The context layer captures why decisions happened; the knowledge layer captures what is known; the goal layer captures what should be pursued. These three are logically interdependent (decisions are justified by knowledge, constrained by goals) but architecturally separate. The interaction protocol is currently implicit (evidence_ids in DecisionTrace, governed_entity_ids in Constraint).

**Proposed approach:** Formalise the cross-layer interaction as typed inter-layer edges with semantics (e.g., DECISION_APPEALS_TO_MECHANISM, GOAL_REQUIRES_HYPOTHESIS). Study whether explicit cross-layer edges improve replay quality and conflict detection.

**Metric:** Recall of relevant knowledge/goal nodes when replaying a decision.

---

### 2. What categorical machinery is most practical for ontology alignment in production?

**Problem:** The current AlignmentService uses a bigram-similarity heuristic. This is fast but shallow — it misses synonyms, subsumption relationships, and structural analogies. Formal category-theoretic alignment (functors, pullbacks) is theoretically powerful but computationally expensive.

**Proposed approach:** Benchmark three alignment methods on the drug_discovery ↔ ai_hardware case:
1. Current bigram heuristic
2. Embedding similarity (sentence-transformers, cosine)
3. OWL reasoner-based subsumption (with HermiT)

Measure: coverage, gap precision, and time. Find the Pareto front.

---

### 3. When should local inconsistency be tolerated instead of forcibly reconciled?

**Problem:** The governance layer wants global consistency (who may do what); the knowledge layer benefits from local inconsistency (competing hypotheses). Forcing reconciliation destroys legitimate expert disagreement.

**Proposed approach:** Define a "consistency budget" per layer: governance = zero tolerance for access conflicts; knowledge = tolerance for competing Hypothesis nodes; goal = tolerance for soft conflicts but not hard. Test whether this budget model improves the quality of dissent records and reduces false positives in conflict detection.

---

### 4. How should tacit knowledge fragments be represented so they remain actionable?

**Problem:** Tacit knowledge (Polanyi: "we can know more than we can tell") is captured as EvidenceFragment nodes with source_type=transcript_span. But a transcript of Kenji explaining his EUV recipe is not the same as an actionable knowledge fragment. The gap between raw capture and structured, executable knowledge is the tacit knowledge problem.

**Proposed approach:** Define a `TacitKnowledgeFragment` schema (extending EvidenceFragment) with fields: `procedure_steps: list[str]`, `preconditions: list[str]`, `when_to_apply: str`, `failure_modes: list[str]`. Build a structured extraction pipeline (LLM-assisted) that converts transcript spans into this schema. Evaluate whether AI hardware case study outcomes improve with structured vs. raw fragments.

---

### 5. What does an active-inference layer look like over a graph memory system?

**Problem:** The current EIG heuristic is a credible approximation but not formal AIF. A proper AIF layer would maintain a generative model over graph states and select actions (agent routings, information queries) to minimise expected free energy.

**Proposed approach:** Implement a minimal AIF loop using PyMDP for a 2-agent, 1-domain subgraph (drug_discovery). Compare routing decisions from:
- Current EIG heuristic
- PyMDP EFE minimisation with a 10-state generative model

Measure: uncertainty reduction per consultation, number of consultations to reach consensus.

---

### 6. How should expected information gain guide expert routing?

**Problem:** The current EIG computation uses calibration × competence_similarity × uncertainty_proxy. The uncertainty proxy (agent annotation history) is a weak signal. Better: compute EIG as the expected reduction in `UncertaintyAnnotation.value` if the agent consulted provides an update.

**Proposed approach:** Simulate 50 routing decisions in the drug_discovery domain with ground-truth uncertainty reduction. Evaluate current heuristic vs. a regression model trained on historical routing outcomes. Measure: expected uncertainty reduction achieved vs. predicted.

---

### 7. How should human agency preservation be measured in KOS workflows?

**Problem:** KOS claims to preserve human agency, but there is no metric for this. Is human agency preserved if humans approve 90% of AI recommendations? If they can always contest? If their beliefs actually shift during deliberation?

**Proposed approach:** Define three metrics:
1. **Contestation rate:** fraction of AI recommendations that receive a DissentRecord
2. **Override rate:** fraction of contested decisions that are ultimately reversed
3. **Belief shift:** magnitude of change in AgentProfile.beliefs before and after a consultation

Run a user study with 6 domain experts across the 3 demo domains. Measure all three metrics under KOS vs. baseline (LLM assistant without KOS structure).

---

### 8. What evolutionary operators should govern graph growth?

**Problem:** The current open-endedness layer uses three fixed heuristics (densify, bridge, new_edge). A more principled approach would use formal graph grammar operators or ALife novelty search.

**Proposed approach:** Implement 3 graph grammar rules:
1. Transitivity closure: A CAUSES B, B CAUSES C → propose A CAUSES C
2. Cross-domain analogy: A inhibits B (domain1) and C inhibits D (domain2) with shared mechanism_type → propose analogical bridge
3. Contradiction detection: A CAUSES B and A INHIBITS B → flag for DissentRecord

Evaluate: do these rules produce more useful proposals than the current heuristics (measured by human acceptance rate)?

---

### 9. How should ownership and value-sharing be represented at fragment / subgraph level?

**Problem:** When an expert's tacit knowledge is captured in KOS and later contributes to a discovery, who receives credit? The current ProvenanceRecord tracks custody but not value contribution.

**Proposed approach:** Add a `ContributionRecord` node (analogous to ProvenanceRecord) that tracks: contributor_id, fragment_ids contributed, downstream decisions that used them, and a weight (proportional to how central the fragments were in the replay steps). Design a value-sharing protocol and test it on the governance fixture (who gets credit for the 2021 precedent that enabled the 2024 approval?).

---

### 10. What interface helps users navigate multi-layer cognition without overload?

**Problem:** Six layers × multiple node types × uncertainty annotations × dissent records = a potentially overwhelming UI. The wrong interface design defeats the whole architecture.

**Proposed approach:** User study with 4 interface configurations:
1. All layers visible simultaneously (current GraphCanvas with all toggles on)
2. One layer at a time (layer-switcher)
3. Task-guided: system highlights relevant layers based on the current question
4. Ecological overview only (CityOverview) with drill-down on click

Measure: task completion time, number of layer switches, subjective cognitive load (NASA-TLX).

---

## Next technical steps (immediate)

1. Add `posterior` updating logic for Hypothesis nodes when new EvidenceFragments arrive
2. Implement TransitivityClosure graph grammar rule as first formal operator
3. Add a `TacitKnowledgeFragment` schema and basic extraction API
4. Benchmark AlignmentService: bigram vs. embedding similarity
5. Add time-series belief tracking to AgentProfile (list of `{timestamp, beliefs}` snapshots)
6. Implement automated ProvenanceRecord creation on every write-path operation
7. Add governance review queue UI in the frontend
