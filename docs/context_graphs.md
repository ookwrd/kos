# Context Graphs in KOS

## The core idea

Foundation Capital's "context graph" thesis identifies a missing data layer for AI agents: not just objects and records, but decision traces — the exceptions, approvals, precedents, rationale, and policy interpretations that explain *why* actions happened.

KOS absorbs this idea and deepens it. The context layer is the write-path memory of an organisation.

## What a DecisionTrace is

A `DecisionTrace` records a real decision by a real actor in a real workflow. It has:

- **question** — the dilemma that needed resolution
- **outcome** — approved / rejected / deferred / escalated / overridden
- **rationale** — plain-language explanation from the deciding actor
- **evidence_ids** — which EvidenceFragments were consulted
- **actor_id** — who decided (human or AI agent)
- **policy_ids** — which Constraints or Obligations governed the decision
- **precedent_ids** — which Precedents were explicitly invoked
- **is_exception** — whether this deviates from standing policy

DecisionTrace is **not** chain-of-thought. Chain-of-thought is ephemeral: it is generated during inference, not recorded to durable storage, and it represents internal reasoning steps of a model, not a real institutional decision. A DecisionTrace is:
- Written at decision time by a governed agent
- Stored permanently
- Linked to the real evidence, policies, and actors that shaped it
- Queryable and replayable years later

## The write path

Every governed workflow event that involves a decision should call `ContextGraphService.record_decision()`. This is the primary write path for the context layer. It:

1. Persists the DecisionTrace node in Neo4j
2. Creates `DECIDED_BY` edges to the actor's AgentProfile
3. Creates `JUSTIFIED_BY` edges to each EvidenceFragment
4. Creates `GOVERNED_BY` edges to each Constraint/Obligation
5. Creates `INVOKED_PRECEDENT` edges to each cited Precedent
6. Indexes the decision in ChromaDB for semantic search

## Decision replay

`ContextGraphService.replay_decision(decision_id)` reconstructs the full justification chain. It returns:

```json
{
  "decision": { ... },
  "actors": [ { ... } ],
  "evidence": [ { ... }, { ... } ],
  "policies": [ { ... } ],
  "precedents": [ { ... } ],
  "replay_steps": [
    {"step": 1, "type": "question", "label": "Question posed", "content": "..."},
    {"step": 2, "type": "evidence", "label": "Evidence consulted: ...", "content": {...}},
    {"step": 3, "type": "policy", "label": "Policy applied: ...", "content": {...}},
    {"step": 4, "type": "precedent", "label": "Precedent invoked: ...", "content": {...}},
    {"step": 5, "type": "actor", "label": "Decided by: ...", "content": {...}},
    {"step": 6, "type": "outcome", "label": "Outcome: deferred", "content": {...}}
  ]
}
```

The `replay_steps` list is consumed by the `DecisionReplay` frontend component, which renders a step-through timeline.

## Precedents

Precedents are the memory of the context layer. They differ from policies:

| | Policy | Precedent |
|---|---|---|
| Origin | Written in advance by governance actors | Inferred from actual decisions after the fact |
| Scope | General rule | Pattern from specific case(s) |
| Authority | Prescriptive | Descriptive |
| Revision | Explicit governance process | Updated by invocation count and override count |

A Precedent is created by calling `ContextGraphService.create_precedent()` and optionally linking it to the source DecisionTrace via `derived_from_decision_id`. Once created, it can be retrieved by:

- Domain: `find_precedents(domain="governance")`
- Actor: `find_precedents(actor_id="agent-board-chair")`
- Semantic search: `find_analogous_by_text("data sharing agreement")`

## Exception handling

When `is_exception=True` on a DecisionTrace, the decision deviates from standing policy. The `get_exception_history()` method returns these cases — useful for:
- Policy revision (patterns of exceptions suggest policy gaps)
- Audit (regulators can see where and why rules were broken)
- Precedent creation (exceptions sometimes create new precedents)

## Example: the governance fixture

The board data-sharing decision (`dec-board-data-sharing-2024`) demonstrates the full write path:
- Evidence: DPIA report, partner audit, 2021 outcome report
- Policies: GDPR Art. 9 constraint, secondary-use prohibition
- Precedent: 2021 Genomics Alliance pattern invoked
- Actor: Board Chair
- Outcome: approved
- Dissent: Data Steward's normative objection recorded as a DissentRecord

Replaying this decision answers: "Why did the board approve this agreement?"
