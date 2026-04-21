# Active Inference Layer in KOS

## Why active inference

Active inference (AIF, Friston et al.) provides a principled framework for belief-guided action under uncertainty. Without an AIF-inspired control layer, a graph system mainly stores and retrieves. With it, KOS can:

- Ask what information would most reduce uncertainty
- Choose which expert to consult next
- Rank actions by expected clarification or expected value
- Represent preferences and risks explicitly
- Switch from static retrieval to directed inquiry

---

## What is conceptual framing vs. what is coded

### What is actually coded

#### 1. Belief representation in AgentProfile

Each `AgentProfile` carries a `beliefs` dict: `proposition → probability (0–1)`. This is a flat, first-order belief state. It is updated explicitly by `AgentEcologyService.update_beliefs()`.

```python
agent.beliefs = {
    "KRAS_G12C_is_druggable": 0.92,
    "AMG510_crosses_BBB": 0.35
}
```

This is a credible approximation of the prior distribution P(proposition) in AIF. It is intentionally shallow: deep Bayesian belief representations belong in a dedicated inference engine, not in a graph node property.

#### 2. Uncertainty annotations

`UncertaintyAnnotation` nodes record explicit uncertainty assessments on any KOS node. The `value` field (0–1) represents estimated uncertainty: 0 = certain, 1 = maximally uncertain. Multiple agents can independently annotate the same node, producing an ensemble of uncertainty estimates that can be aggregated.

This represents the epistemic component of expected free energy in AIF: high-uncertainty nodes are candidates for information-seeking actions.

#### 3. EIG heuristic for expert routing

`CollectiveInferenceService.route_expert()` implements an Expected Information Gain (EIG) heuristic:

```
score(agent) = calibration(agent) × competence_overlap(agent, question) × (1 − mean_certainty)
```

- `calibration`: agent's historical accuracy (AgentProfile.calibration_score)
- `competence_overlap`: cosine similarity between question embedding and agent competence embedding (ChromaDB)
- Dissent bonus: +0.1 for agents with relevant open dissent records (their disagreement is informative)

This approximates the AIF principle of minimising expected free energy by selecting the action (= expert consultation) that would most reduce uncertainty (= information gain).

**What is not coded here:** a formal variational Bayes engine, a generative model over observations, or a proper free energy computation. Those require dedicated AIF libraries (e.g., PyMDP, SPM) and are flagged as future work.

#### 4. Next-best-question selection

`CollectiveInferenceService.next_best_question()` returns `UncertaintyAnnotation` nodes ordered by value, filtered by goal relevance. Each result includes:

- The annotation (which dimension, which node)
- A suggested natural-language question
- Epistemic priority (high / medium)

This implements the AIF principle of epistemic foraging: identifying the observations that would most change beliefs about goal-relevant propositions.

#### 5. Belief aggregation

`CollectiveInferenceService.aggregate_beliefs()` computes mean, variance, min, max, and consensus level across agents for a named proposition. Variance is the primary metric: high variance = low consensus = high collective uncertainty = prioritise for directed inquiry.

---

## What is conceptual framing (not yet production-ready)

### Full variational Bayes AIF

In formal AIF, each agent maintains a generative model:
```
P(observations | hidden states) × P(hidden states | parameters) × P(parameters)
```
and selects actions that minimise expected free energy:
```
EFE = DKL[Q(states) || P(states | outcomes)] - E[log P(observations)]
    = epistemic value + pragmatic value
```

Implementing this properly requires:
- A parameterised generative model for each domain
- Variational updates at each observation
- A prior over preferred outcomes (currently approximated by `preferred_outcomes` in AgentProfile)
- A posterior over hidden states (currently approximated by `beliefs`)

This is production-ready in neuroscience applications (PyMDP, SPM) but not yet integrated into KOS. The current approximation is honest about what it is: a heuristic inspired by AIF, not a formal AIF implementation.

### Collective active inference / predictive coding

Recent work on multi-LLM systems models collective belief dynamics as hierarchical predictive coding: agents at higher levels predict the beliefs of agents below, and prediction errors propagate upward. This could drive KOS's collective inference layer in a principled way.

The current `aggregate_beliefs()` function is a flat ensemble average — it does not model belief propagation, epistemic authority hierarchies, or prediction error dynamics. Integrating collective predictive coding would require:
- A belief propagation graph (separate from the primary KOS layers)
- Authority-weighted aggregation (not just equal-weight mean)
- Temporal belief tracking (beliefs change over time as new evidence arrives)

### Epistemic vs. pragmatic value separation

The current EIG heuristic conflates epistemic and pragmatic value. A proper AIF implementation distinguishes:

- **Epistemic value** (information gain): actions that reduce uncertainty, regardless of outcome
- **Pragmatic value** (utility): actions that produce preferred outcomes

In KOS, the separation would look like:
- Epistemic: route to the agent whose consultation most reduces uncertainty on goal-relevant nodes
- Pragmatic: route to the agent whose preferred outcomes most align with the current goal hierarchy

The current `route_expert()` function uses calibration and competence as a proxy for epistemic value, and does not yet include a separate pragmatic score.

---

## Integration with the graph layers

The AIF layer touches all six graph layers:

- **Evidence layer:** New EvidenceFragments reduce uncertainty on Mechanism and Hypothesis nodes
- **Context layer:** Decision outcomes update agent beliefs (the actor should update belief after seeing outcome)
- **Knowledge layer:** Hypothesis posteriors are updated by new evidence (Bayesian belief revision)
- **Goal layer:** Preferred outcomes in AgentProfile are derived from the goal hierarchy
- **Governance layer:** Information-seeking actions (querying an agent) must respect permission constraints
- **Agent ecology layer:** The beliefs and calibration scores in AgentProfile are the primary AIF state

---

## Next steps (future work)

1. Integrate PyMDP for formal generative model specification per domain
2. Implement Bayesian belief revision for Hypothesis nodes when new EvidenceFragments arrive
3. Separate epistemic and pragmatic value in `route_expert()` with configurable weighting
4. Add temporal belief tracking (AgentProfile beliefs as time-series, not point estimate)
5. Prototype collective predictive coding for 2–3 agent panels
6. Evaluate EIG heuristic accuracy against formal AIF on drug discovery case study
