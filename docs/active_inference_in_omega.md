# Active Inference in Omega KOS

*How the active inference framework motivates KOS's epistemic routing, uncertainty accounting, and next-best-question generation*

---

## The Core Idea

Active inference (Friston et al.) holds that intelligent agents minimize *free energy*: the divergence between their internal generative model and the sensory signals they receive. Perception updates the model. Action reduces the divergence by changing the world to match predictions.

For a knowledge system, this framework produces a concrete design principle: **the system should recommend the query that most reduces its uncertainty**. Not the query that confirms what is already known — the query that has the highest *epistemic value* given the current state of the graph.

KOS operationalizes this through:
1. **Uncertainty annotation**: every claim in the graph has an `UncertaintyAnnotation` expressing how confident the system is
2. **Expected Information Gain (EIG)**: expert routing scores agents by how much their answer would reduce uncertainty on a question
3. **Next-best-question**: given a goal, which query should be asked next to most efficiently reach the goal?

---

## Beliefs as Graph Annotations

In KOS, beliefs are not stored in a separate belief network. They are annotations on graph nodes.

Each `UncertaintyAnnotation` records:
- `target_id`: the node being annotated
- `dimension`: what kind of uncertainty this is (aleatory, epistemic, model_uncertainty)
- `value`: 0–1 uncertainty score
- `method`: how this was computed (human_estimate, calibrated_from_history, propagated)
- `annotator_id`: which agent produced this annotation

This design makes uncertainty explicit, auditable, and version-controlled. Unlike a hidden Bayesian network, the belief state is visible in the graph and can be contested by agents.

**Aleatory uncertainty**: irreducible randomness in the world (quantum fluctuations, measurement noise). This cannot be reduced by gathering more information.

**Epistemic uncertainty**: uncertainty due to lack of knowledge. This *can* be reduced by the right query. This is what EIG measures.

**Model uncertainty**: uncertainty about whether the model structure (the graph topology itself) is correct. This is what `GraphChangeProposal` addresses — it proposes changes to the model, not just updates to parameter values.

---

## Expected Information Gain Routing

The `InferencePanel` routes questions to experts based on Expected Information Gain:

```
EIG(agent, question) = 
  competence_similarity(agent, question) 
  × calibration_score(agent) 
  × (1 - current_uncertainty(question))
```

This rewards agents who:
- Have demonstrated competence in the question's domain
- Have a track record of calibrated confidence (their stated certainty matches their accuracy)
- Are being asked about something still uncertain (low utility in asking about already-settled questions)

The `calibration_score` is the critical differentiator. TEPCO Management (0.31 calibration) is deprioritized even if they have domain authority. Dr. Sarah Chen (0.84 calibration) is surfaced even when her formal authority is limited. **Epistemic quality beats institutional rank.**

The dissent count is surfaced as a secondary signal: high-dissent agents are flagged not as unreliable but as *epistemically interesting* — they hold minority views that may contain information the consensus missed.

---

## Next-Best-Question Generation

The `next_best_question(goal_id)` API (in `collective_inference/service.py`) returns the query that would most reduce uncertainty across the goal's constraint set:

1. Load the goal's `Constraint` nodes — what conditions must be satisfied?
2. For each constraint, look up its `UncertaintyAnnotation` — how uncertain is this constraint currently?
3. For each uncertain constraint, find which `EvidenceFragment` or `Mechanism` nodes link to it
4. Score potential questions by: `epistemic_value = Σ uncertainty(node) × reachability(question, node)`
5. Return the question with highest `epistemic_value`

In practice, this means: if you are uncertain about whether a drug crosses the blood-brain barrier, and that uncertainty is the binding constraint on a goal, the system recommends "What is the CNS penetration of AMG510?" before recommending a question about a well-established mechanism.

This is active inference's precision-weighting applied to query selection: the system attends to the most informative next step, not just the most convenient one.

---

## Epistemic vs. Pragmatic Value

Active inference distinguishes two sources of action value:
- **Epistemic value**: reduces uncertainty (even if it doesn't immediately change action)
- **Pragmatic value**: directly achieves a goal

KOS reflects this in goal-scoring. A query can have high epistemic value (it would resolve a long-standing uncertainty) with low pragmatic value (the resolution doesn't change any current decision). These should not be conflated.

The `InferencePanel` currently shows only epistemic routing (EIG for expert selection). A full implementation would also show pragmatic value — queries that directly advance a specific goal. The v3 interface should expose this as a toggle: "epistemic mode" vs. "goal-directed mode."

---

## Calibration as Earned Trust

Calibration in KOS is not a fixed attribute. It is a *track record* computed from the history of agent predictions vs. outcomes.

An agent's calibration score starts at 0.5 (unknown), updates upward when their predictions match outcomes, and updates downward when they are confidently wrong. An agent who says "70% confident" and is right 70% of the time has perfect calibration. An agent who says "90% confident" and is right 60% of the time is overconfident — their calibration score falls.

This creates a long-term incentive structure: agents who consistently provide calibrated uncertainty estimates gain routing priority. Agents who are overconfident lose routing priority — not because they are malicious but because their confidence signals carry less information.

TEPCO Management's 0.31 calibration score in the demo is the result of this computation applied to the historical record: they repeatedly stated high confidence in the adequacy of their seawall, and they were wrong.

---

## Free Energy Gradient in the Graph

A full active inference implementation would maintain a *free energy gradient* across the entire graph — a scalar field where high values indicate high surprise (beliefs far from evidence). The system would preferentially route queries toward high-free-energy regions.

In KOS v3, this is approximated by the uncertainty heatmap overlay: nodes with high `UncertaintyAnnotation.value` are visually highlighted in GraphCanvas. The InferencePanel query presets are ordered by estimated epistemic value for the current state.

A proper free energy computation would require a generative model over the entire graph — future work. But the scaffolding (uncertainty annotations, EIG routing, next-best-question) is the right architectural foundation.

---

## Connection to ACI Theory

The ACI manuscript (Witkowski et al.) identifies three requirements for Artificial Collective Intelligence:
1. **Epistemic diversity**: preserve minority views and dissent
2. **Dynamic integration**: beliefs should update based on evidence, not authority
3. **Collective action under uncertainty**: coordinate without requiring consensus

Active inference in KOS addresses all three:
- EIG routing surfaces minority-view agents (high dissent) as epistemically valuable
- Calibration scores replace authority rank with evidence-based trust
- Next-best-question enables collective epistemic action: the system recommends what to investigate *together*, not what to believe *in common*

---

## Implementation Status

| Feature | Status |
|---|---|
| UncertaintyAnnotation model | Implemented |
| EIG routing formula | Implemented (InferencePanel) |
| Calibration score per agent | Implemented (AgentProfile) |
| Visual calibration rings | Implemented (AgentCouncilView) |
| next_best_question() API | Stub (returns placeholder) |
| Uncertainty heatmap in GraphCanvas | Not implemented |
| Free energy gradient | Not implemented |
| Epistemic vs. pragmatic mode toggle | Not implemented |
