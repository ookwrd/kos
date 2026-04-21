# KOS Ontology v2 — Complete Node and Edge Type Reference

## Node types by layer

### Layer 1 — Evidence

| Label | Key fields | Description |
|---|---|---|
| `EvidenceFragment` | source_type, title, content_ref, domain, validated_by | Atomic piece of evidence. See `SourceType` enum. |

**SourceType:** document, transcript_span, image, clip, sensor_window, workflow_event, tool_call, simulation_state, code

### Layer 2 — Context

| Label | Key fields | Description |
|---|---|---|
| `DecisionTrace` | question, outcome, rationale, evidence_ids, actor_id, is_exception | Write-path record of a governed decision |
| `Precedent` | statement, applicability_conditions, invocation_count, confidence | Reified pattern from past decisions |

**DecisionOutcome:** approved, rejected, deferred, escalated, overridden

### Layer 3 — Knowledge / Mechanism

| Label | Key fields | Description |
|---|---|---|
| `Entity` | label, entity_type, domain, aliases, attributes | Named thing in the knowledge layer |
| `Mechanism` | name, mechanism_type, source_entity_id, target_entity_id, confidence | Directed causal/functional relationship |
| `Hypothesis` | statement, status, evidence_for, evidence_against, prior, posterior | Falsifiable claim anchored to entities |

**EntityType:** compound, protein, gene, pathway, disease, material, process, technology, institution, concept, event, other

**MechanismType:** causal, inhibitory, enabling, regulatory, compositional, analogical

**HypothesisStatus:** proposed, supported, contested, refuted, validated

### Layer 4 — Goal / Agency

| Label | Key fields | Description |
|---|---|---|
| `Goal` | title, status, priority, horizon, owner_id, parent_goal_id, metric | Desired state with accountability chain |
| `Constraint` | description, constraint_type, governed_entity_ids, contestable | Restriction on permitted actions/states |
| `Obligation` | actor_id, action, deontic_type, trigger_condition, delegatable | Actor-bound deontic requirement |

**GoalStatus:** active, achieved, suspended, abandoned, contested

**ConstraintType:** hard, soft, deontic

**DeonticType:** obligatory, permitted, forbidden, waivable

**GoalHorizon:** immediate, short, medium, long

### Layer 5 — Governance

| Label | Key fields | Description |
|---|---|---|
| `Permission` | actor_id, target_id, access_type, expiry, requires_review | Access grant with audit trail |
| `ProvenanceRecord` | source_id, actor_id, action, data_hash, downstream_ids | Immutable custody record |

**AccessType:** read, write, approve, contest, delegate, audit, administer

**ProvenanceAction:** created, modified, validated, delegated, contested, deprecated, merged, split

### Layer 6 — Collective Agent Ecology

| Label | Key fields | Description |
|---|---|---|
| `AgentProfile` | name, agent_type, competences, beliefs, preferred_outcomes, calibration_score | Participant in the collective |
| `Delegation` | delegator_id, delegatee_id, scope, reversible, expires_at | Reversible authority transfer |
| `DissentRecord` | actor_id, target_id, dissent_type, rationale, resolution_status | Formal disagreement record |
| `UncertaintyAnnotation` | target_id, dimension, value, method, annotator_id | First-class uncertainty assessment |

**AgentType:** human, ai, tool, institution, committee, simulation

**DissentType:** factual, methodological, normative, procedural

**ResolutionStatus:** open, deferred, resolved_by_evidence, resolved_by_authority, unresolved

### Cross-layer

| Label | Key fields | Description |
|---|---|---|
| `AlignmentMap` | source_domain, target_domain, mappings, gaps_source, gaps_target, coverage | Partial functor between ontologies |
| `GraphChangeProposal` | proposal_type, rationale, novelty_score, status, change_spec | Governed evolution proposal |

**ProposalType:** new_node, new_edge, deprecate, bridge, densify, split, merge

**ProposalStatus:** pending, accepted, rejected, under_review, deferred

---

## Edge types

### Layer 1 — Evidence
| Edge | From → To | Meaning |
|---|---|---|
| `VALIDATED_BY` | EvidenceFragment → AgentProfile | Agent validated this evidence |
| `DERIVED_FROM` | EvidenceFragment → EvidenceFragment | Derived or extracted from another fragment |

### Layer 2 — Context
| Edge | From → To | Meaning |
|---|---|---|
| `DECIDED_BY` | DecisionTrace → AgentProfile | Actor who made the decision |
| `JUSTIFIED_BY` | DecisionTrace → EvidenceFragment | Evidence consulted |
| `GOVERNED_BY` | DecisionTrace → Constraint\|Obligation | Policy that governed the decision |
| `INVOKED_PRECEDENT` | DecisionTrace → Precedent | Precedent explicitly cited |
| `CREATED_PRECEDENT` | DecisionTrace → Precedent | Decision that generated this precedent |

### Layer 3 — Knowledge
| Edge | From → To | Meaning |
|---|---|---|
| `HAS_MECHANISM` | Entity → Mechanism | Entity participates in this mechanism |
| `TARGETS` | Mechanism → Entity | Mechanism affects this target entity |

### Layer 4 — Goal
| Edge | From → To | Meaning |
|---|---|---|
| `HAS_SUBGOAL` | Goal → Goal | Goal decomposition |
| `CONSTRAINS` | Constraint → Goal\|Entity | Constraint applies to this node |

### Layer 5 — Governance
| Edge | From → To | Meaning |
|---|---|---|
| `GRANTS_TO` | Permission → AgentProfile | Permission held by this agent |
| `RECORDS_ACTION_ON` | ProvenanceRecord → any node | Provenance recorded for this node |

### Layer 6 — Agent Ecology
| Edge | From → To | Meaning |
|---|---|---|
| `DELEGATES_TO` | AgentProfile → AgentProfile | Via Delegation node |
| `CONTESTS` | DissentRecord → any node | Dissent lodged against this node |
| `ANNOTATES` | UncertaintyAnnotation → any node | Uncertainty assessed on this node |

---

## Shared base fields (all nodes)

| Field | Type | Default |
|---|---|---|
| `id` | string (UUID) | auto-generated |
| `created_at` | datetime | now() |
| `updated_at` | datetime | now() |
| `provenance` | list[string] | [] |
| `uncertainty` | float\|null | null |
| `tags` | list[string] | [] |
