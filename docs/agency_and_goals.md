# Agency, Goals, and Governance in KOS

## The problem with "best answer"

Most AI systems optimise for a single criterion: give the best answer, complete the task fastest, maximise user satisfaction. This is instrumentally useful but deeply insufficient for high-stakes collective decision-making. Reducing all action to "execute best answer" destroys:

1. **Goal plurality**: real decisions involve multiple, often conflicting objectives
2. **Constraint respect**: hard, soft, and deontic constraints must be distinguished and enforced
3. **Human agency**: the right of humans to understand, contest, and override AI recommendations
4. **Accountability**: actions must be attributable to agents with defined authority and scope

KOS makes goals, constraints, and agency first-class graph objects to prevent these collapses.

---

## Goal representation

`Goal` nodes have:
- `priority` (0–1): relative importance, but not a scalar utility to be maximised
- `horizon` (immediate/short/medium/long): time scale matters for tradeoffs
- `status` (active/achieved/suspended/abandoned/contested)
- `owner_id`: who is accountable for this goal
- `parent_goal_id`: hierarchical decomposition (strategic → tactical → operational)
- `metric` + `metric_target`: how progress is measured

Crucially, goals are **not collapsed to a weighted sum**. Conflict detection (`GoalGraphService.find_conflicts()`) surfaces pairs of goals that share a hard/deontic constraint or target the same metric with incompatible values. Resolving these conflicts requires human or institutional deliberation — it cannot be automated away.

### How the system avoids scalar-reward collapse

1. Goals remain plural in the graph. No utility aggregation is performed anywhere in the codebase.
2. Conflicts are surfaced explicitly, not silently resolved.
3. Goal priorities are owner-assigned, not system-computed.
4. The system never recommends which of two conflicting goals to sacrifice — it flags the conflict and defers to the governance layer.

---

## Constraint types

KOS distinguishes three constraint types (not interchangeable):

| Type | Meaning | Example |
|---|---|---|
| `hard` | Must not be violated. Blocks action. | Temperature < 200°C (engineering limit) |
| `soft` | Should be respected; can be traded off with justification. | Minimise cost (business preference) |
| `deontic` | Obligation or prohibition from a normative source. | Must not share patient data with insurers |

`Obligation` nodes add the actor dimension: a specific actor must perform a specific action under specific conditions. Obligations are delegatable (see Delegation) and fulfillment-tracked.

`DeonticType` distinguishes:
- `OBLIGATORY`: must happen
- `PERMITTED`: may happen
- `FORBIDDEN`: must not happen
- `WAIVABLE`: normally obligatory but can be waived by a defined authority

---

## How the system avoids eroding human agency

### Reversible delegation

Every `Delegation` node has `reversible: bool`. When `reversible=True` (the default), the delegating actor can revoke at any time without conditions. Delegation chains are graph-queryable — you can always trace back to the ultimate human authority for any automated action.

The system never creates delegations automatically. Delegations must be explicitly created by the delegating actor via `AgentEcologyService.create_delegation()`.

### Contestability

`Constraint` nodes have `contestable: bool` and `contestable_by: list[str]`. When a constraint is contestable, named actors can file a `DissentRecord` against it. Open dissent records:
- Block automatic escalation (governance checkpoints require dissent resolution or explicit deferral)
- Surface in the `AgentCouncilView` UI
- Are available to `CollectiveInferenceService.get_open_dissents()` for audit and review

Non-contestable constraints (e.g., legal obligations) have `contestable=False`. The system will not route a DissentRecord against them — it will raise a validation error and direct the actor to the legal authority.

### Hiding governance decisions inside prompts

A common failure mode: governance rules are embedded in system prompts and become invisible. KOS prevents this by:
- Making every Constraint a graph node with full provenance
- Making every governance decision a DecisionTrace with actor, evidence, and rationale
- Making every permission an explicit Permission node with expiry and review requirements
- Exposing all governance structure via `/api/goals/conflicts`, `/api/decisions/exceptions`, and the Governance layer in `GraphCanvas`

Governance is visible, queryable, and auditable — not hidden in a prompt.

---

## The agency preservation principle

The goal hierarchy is not just decomposition — it is an accountability structure. For every goal, there is an owner (an AgentProfile). For every constraint, there is a governing authority. For every delegation, there is a reversibility guarantee.

This design means the system can always answer:
- "Who is accountable for this goal?" → `goal.owner_id` → AgentProfile
- "What constraints govern this action?" → governance layer query
- "Can this constraint be contested?" → `constraint.contestable` + `contestable_by`
- "Who delegated this authority?" → Delegation chain
- "What happens if I revoke this delegation?" → `delegation.reversible=True` → revoke via API

Agency is not preserved by accident. It is preserved by architecture.

---

## Deontic rules

KOS supports a minimal deontic logic: OBLIGATORY, PERMITTED, FORBIDDEN, WAIVABLE. This is sufficient for most governance scenarios without requiring a full deontic logic engine (which would be conceptual overkill in v1).

The combination of Constraint (what is required/forbidden) + Obligation (who must do what) + Permission (who may do what) + Delegation (who has transferred authority) gives KOS a governance representation rich enough for:
- Regulatory compliance (GDPR, clinical trial rules)
- Corporate governance (board approvals, fiduciary duty)
- Multi-stakeholder coordination (conflicting obligations across institutions)

---

## Long-horizon agency impacts

KOS does not currently model long-horizon impacts of automation on human agency (e.g., skill atrophy, disempowerment of specialists). This is flagged as a research question:

- How do you measure whether a KOS workflow is deskilling its human participants?
- How do you represent "preserved human agency" as a measurable goal?
- What are the right reversibility thresholds for different types of delegation?

These are listed in `research_program_v2.md` as open problems.
