"""Layer 2 — Context graph models (decision traces, precedents)."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import Field

from .base import KOSBase


class DecisionOutcome(StrEnum):
    APPROVED = "approved"
    REJECTED = "rejected"
    DEFERRED = "deferred"
    ESCALATED = "escalated"
    OVERRIDDEN = "overridden"


class DecisionTrace(KOSBase):
    """
    The write-path record of a decision event.

    This is the core of the context graph layer and the most important
    distinction from a plain knowledge graph: it captures *why* an action
    happened, not just *that* it happened. Each trace is permanent and
    queryable — it forms organizational memory.

    Not to be confused with chain-of-thought: a DecisionTrace records a
    real decision by a real actor (human or AI) in a real workflow, with
    links to the evidence and policies that justified it. Chain-of-thought
    is ephemeral reasoning; a DecisionTrace is a durable institutional record.
    """

    # The question or dilemma the decision resolved
    question: str
    outcome: DecisionOutcome
    # Plain-language rationale written by the deciding actor
    rationale: str
    # IDs of EvidenceFragment nodes that were consulted
    evidence_ids: list[str] = Field(default_factory=list)
    # ID of the AgentProfile that made the decision
    actor_id: str
    # IDs of Constraint / Obligation nodes (formal rules) that applied
    policy_ids: list[str] = Field(default_factory=list)
    # IDs of Precedent nodes explicitly invoked
    precedent_ids: list[str] = Field(default_factory=list)
    # True when this decision deviates from standing policy
    is_exception: bool = False
    # Domain context
    domain: str | None = None
    # Workflow or system context in which this decision was made
    context_system: str | None = None
    # Structured metadata: ticket IDs, workflow run IDs, etc.
    metadata: dict[str, Any] = Field(default_factory=dict)


class Precedent(KOSBase):
    """
    A reified pattern extracted from one or more DecisionTrace nodes.

    Precedents make past decisions searchable and retrievable. They differ
    from policies: a policy is a rule written in advance; a precedent is a
    pattern recognised after the fact from actual decisions.
    """

    # The decision from which this precedent was derived
    decision_trace_id: str
    # Short statement of the precedent (e.g. "Exceptions granted when X and Y")
    statement: str
    # Conditions under which this precedent applies
    applicability_conditions: list[str] = Field(default_factory=list)
    # Domains where this precedent has been observed
    domains: list[str] = Field(default_factory=list)
    # How many times this precedent has been successfully invoked
    invocation_count: int = 0
    # How many times it was invoked and then overridden
    override_count: int = 0
    # Confidence that this precedent generalises correctly
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    # Optional ID of a parent Precedent this refines
    parent_precedent_id: str | None = None
