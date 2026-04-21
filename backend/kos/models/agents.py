"""Layer 6 — Collective agent ecology models."""

from __future__ import annotations

from enum import StrEnum
from datetime import datetime
from typing import Any

from pydantic import Field

from .base import KOSBase


class AgentType(StrEnum):
    HUMAN = "human"
    AI = "ai"
    TOOL = "tool"
    INSTITUTION = "institution"
    COMMITTEE = "committee"
    SIMULATION = "simulation"


class DissentType(StrEnum):
    FACTUAL = "factual"         # Disagrees about what is true
    METHODOLOGICAL = "methodological"  # Disagrees about how to proceed
    NORMATIVE = "normative"     # Disagrees about what should be valued
    PROCEDURAL = "procedural"   # Disagrees about who has authority


class ResolutionStatus(StrEnum):
    OPEN = "open"
    DEFERRED = "deferred"
    RESOLVED_BY_EVIDENCE = "resolved_by_evidence"
    RESOLVED_BY_AUTHORITY = "resolved_by_authority"
    UNRESOLVED = "unresolved"


class AgentProfile(KOSBase):
    """
    Profile of a participant in the collective agent ecology.

    Human experts, AI models, tools, institutions, and committees are all
    represented as AgentProfiles. This allows the governance and inference
    layers to query: who can answer this? who should approve that? where
    do these two agents disagree?

    The beliefs dict is a flat key→probability map representing the agent's
    current epistemic state on named propositions (active inference layer).
    It is intentionally shallow — deep belief representations belong in a
    dedicated inference engine, not in a graph node.
    """

    name: str
    agent_type: AgentType
    domain: str | None = None
    # Natural-language description of what this agent specialises in
    competences: list[str] = Field(default_factory=list)
    # Proposition → probability (0–1) representing epistemic state
    beliefs: dict[str, float] = Field(default_factory=dict)
    # Preferred outcomes: goal_id → weight (relative importance)
    preferred_outcomes: dict[str, float] = Field(default_factory=dict)
    # IDs of domains or topic areas where this agent has delegated authority
    authority_scope: list[str] = Field(default_factory=list)
    # Confidence calibration score (0 = perfectly miscalibrated, 1 = perfect)
    calibration_score: float | None = Field(default=None, ge=0.0, le=1.0)
    attributes: dict[str, Any] = Field(default_factory=dict)


class Delegation(KOSBase):
    """
    A reversible transfer of authority from one agent to another.

    Delegations are explicit nodes so that the governance graph can track
    chains of delegation, enforce expiry, and support contested revocation.
    Reversibility is a design non-negotiable: KOS must not silently route
    authority in ways that erode human oversight.
    """

    delegator_id: str
    delegatee_id: str
    # What specific actions or domains are delegated
    scope: str
    # True means the delegator can revoke at any time without conditions
    reversible: bool = True
    # Conditions that must be met for delegation to take effect
    conditions: list[str] = Field(default_factory=list)
    expires_at: datetime | None = None
    # ID of the Permission node that authorises this delegation
    authorising_permission_id: str | None = None
    active: bool = True


class DissentRecord(KOSBase):
    """
    A formal record that an agent disagrees with a decision, claim, or policy.

    Dissent records are not just notes — they are first-class graph objects
    that can trigger review, block escalation, and accumulate into patterns
    of systematic disagreement. They prevent the system from silently
    papering over expert disagreement with a majority vote.
    """

    # ID of the AgentProfile registering dissent
    actor_id: str
    # ID of the node being contested (DecisionTrace, Precedent, Mechanism, Goal, etc.)
    target_id: str
    dissent_type: DissentType
    rationale: str
    resolution_status: ResolutionStatus = ResolutionStatus.OPEN
    # IDs of EvidenceFragment nodes offered in support of the dissent
    supporting_evidence_ids: list[str] = Field(default_factory=list)
    # ID of the AgentProfile responsible for resolving this dissent
    resolver_id: str | None = None
    resolution_note: str = ""
    domain: str | None = None


class UncertaintyAnnotation(KOSBase):
    """
    An explicit annotation of uncertainty on any KOS node.

    Uncertainty is represented as a first-class annotation rather than
    an attribute so that multiple agents can independently annotate the
    same node and their assessments can be compared, aggregated, or
    left in tension.

    The active-inference layer uses UncertaintyAnnotations to compute
    expected information gain and drive expert routing.
    """

    # ID of the node being annotated
    target_id: str
    # What dimension of uncertainty is being assessed (e.g., "mechanism_direction", "effect_size")
    dimension: str
    # Uncertainty value in [0, 1]; 0 = certain, 1 = maximally uncertain
    value: float = Field(ge=0.0, le=1.0)
    # Method used to assess uncertainty (e.g., "expert_elicitation", "model_confidence", "literature_gap")
    method: str = "expert_elicitation"
    # ID of the AgentProfile that produced this annotation
    annotator_id: str | None = None
    # Justification for this assessment
    rationale: str = ""
    domain: str | None = None
