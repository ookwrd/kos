# Trust and Governance in Omega

## Governance as Architecture, Not Policy

Most AI systems treat governance as a policy layer: a set of rules applied on top of a system that was built without governance in mind. Omega inverts this. Governance is an architectural invariant — not added on, but woven into the data model, the query layer, the rendering layer, and the evolution layer.

The practical difference: in a policy-layer system, governance can be bypassed, forgotten, or degraded over time. In Omega, a query without provenance cannot be answered. A node without a governance state cannot be created. An evolution without a review trail cannot be committed. Governance is not enforced by rules; it is enforced by the structure of what the system can do.

---

## The Five Governance Invariants

These are not aspirational principles. They are implemented constraints.

### 1. Every output carries provenance

No query response in Omega is returned without a traceable chain back to its constituent source nodes, the actors who created or validated them, and the timestamps at which each step occurred.

Implementation: `ProvenanceRecord` nodes are created at every significant write event. The `get_provenance_chain(target_id)` query traverses the `RECORDS_ACTION_ON` relationship to return the full custody chain.

UI surface: the Provenance Inspector panel. When any node is selected, its provenance chain is displayed as a timestamped custody trail.

### 2. Authority is bounded and explicit

Every agent in the system has an `authority_scope` — a list of domains and action types within which they may act. Recommendations outside scope are flagged. Permissions are stored as `Permission` nodes with explicit `target_id`, `access_type`, `expiry`, and `requires_review` fields.

The `may_access(actor_id, target_id, access_type)` check is a first-class query, not a middleware afterthought.

### 3. Dissent is permanent

`DissentRecord` nodes are never deleted. A dissenting expert's registered objection persists in the graph regardless of what the consensus eventually resolves to. This reflects the epistemic reality that minority views often carry important information that the majority missed, and that the history of genuine disagreement is valuable.

In the UI, dissent records are shown as amber markers on nodes and decisions, with the dissenter, their rationale, and the resolution status always accessible.

### 4. Revocation has traceable consequences

When evidence is revoked — because it was found to be fraudulent, procedurally invalid, or superseded — the downstream effects are computable. Any decision that was `JUSTIFIED_BY` that evidence is flagged for review. Any agent belief that relied on it is marked uncertain. Any precedent that was grounded in it is downgraded.

This is not implemented as cascading deletes. The original evidence node is preserved with a `RevocationEvent` attached, and downstream nodes receive a `DOWNSTREAM_OF_REVOKED` relationship. The full impact is visible, not silently corrected.

### 5. Evolution is versioned

The graph does not change without a version record. Every accepted `GraphChangeProposal` creates a `VersionTag` that records what changed, who proposed it, who reviewed it, and when. Rejected proposals are archived rather than deleted, because "what we considered but didn't do" is governance-relevant information.

---

## The Permission Model

Permissions in Omega are structured around five access types:

```
AccessType:
  read        — may query and view
  write       — may create or modify nodes
  annotate    — may add annotations and uncertainty estimates
  review      — may approve or reject proposals
  govern      — may issue permissions and revocations
```

Permissions are not hierarchical by default — an actor with `govern` rights on evidence does not automatically have `write` rights on the knowledge layer. Permissions are issued per-target, per-access-type, with optional expiry and review requirements.

This supports patterns like:
- An external expert who may annotate evidence but not modify the knowledge layer
- A junior researcher whose writes require senior review before taking effect
- An AI tool that may read any domain but may only write to the `proposals` layer
- A regulatory body that has `govern` rights over compliance-relevant nodes but no knowledge layer access

---

## Contributor Rights

Omega treats knowledge contribution as a rights-bearing act. When an expert creates or validates an evidence fragment, they are not just adding data — they are making a contributory act with:

- attribution (their `AgentProfile` is linked via `ProvenanceRecord`)
- a right to be cited when the evidence is used downstream
- a right to request revocation if the evidence was misrepresented or misused
- a right to have their dissent preserved even if overruled

This is not a legal framework — it is an epistemic one. The goal is to create a system in which contributing knowledge is a meaningful act with consequences, not a one-way extraction.

---

## Trust Calibration

Omega tracks agent calibration through a `calibration_score` field on `AgentProfile`. This is not a simple accuracy metric — it is a measure of how well an agent's stated confidence tracks actual outcomes over time.

A well-calibrated agent says "70% confident" when they are right about 70% of the time. An overconfident agent says "90% confident" and is right 60% of the time. A well-calibrated AI tool with a score of 0.71 may be more reliable for specific queries than a human expert with 0.84 if the query is in the AI tool's specific competence domain.

Calibration scores are used in:
- expert routing (higher calibration = higher routing weight)
- belief aggregation (calibrated agents' views weighted more heavily)
- uncertainty propagation (low-calibration sources increase downstream uncertainty)

---

## Consent and Sensitive Knowledge

Some knowledge in Omega is subject to consent constraints. This matters particularly for:

- personal health data in clinical domains
- indigenous or community-held traditional knowledge
- proprietary manufacturing processes
- national security-adjacent research

`ConsentRecord` nodes capture:
- who gave consent
- for what purpose
- for which actors
- under what conditions
- with what expiry

A node with a `ConsentRecord` can only be accessed by actors whose query purpose matches the consent scope. This is not just data privacy — it is the architectural recognition that some knowledge belongs to communities or individuals and its use is conditional.

---

## Audit Log

Every significant action in Omega — query, write, annotation, approval, revocation — creates an entry in the audit log. The audit log is immutable and append-only. It is the permanent record of everything the system has done.

For demonstration purposes, the audit log is not currently surfaced as a standalone view, but it is present in the data model and accessible via the governance API routes.

---

## The Governance Surface in the UI

The governance layer is surfaced through three primary UI components:

### Provenance Inspector
Shows the full custody chain for any selected node: who created it, who validated it, when, with what data hash, and what downstream nodes depend on it.

### Permissions View (planned)
Shows what access an actor has to a given target, whether review is required, and what the expiry state is.

### Impact Tracer (planned)
Given a node that has been revoked or modified, shows the full downstream impact: which decisions were justified by it, which beliefs relied on it, which agent recommendations should be reconsidered.

---

## Why This Matters at Scale

The case for governance-as-architecture becomes obvious at scale. As Omega grows to millions of nodes across dozens of domains:

- Without provenance, the origin of any claim becomes untraceable
- Without authority bounds, any agent can make any claim with equal weight
- Without dissent records, minority views that turned out to be correct are lost
- Without revocation tracing, bad evidence continues to influence downstream reasoning silently
- Without versioning, the graph's evolution becomes opaque and ungovernable

Omega is designed to remain governable as it scales. This is not a nice-to-have. It is the primary architectural requirement.
