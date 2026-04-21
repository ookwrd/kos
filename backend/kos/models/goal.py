"""Layer 4 — Goal / agency graph models."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import Field

from .base import KOSBase


class GoalStatus(StrEnum):
    ACTIVE = "active"
    ACHIEVED = "achieved"
    SUSPENDED = "suspended"
    ABANDONED = "abandoned"
    CONTESTED = "contested"


class ConstraintType(StrEnum):
    HARD = "hard"        # Must not be violated; blocks action
    SOFT = "soft"        # Should be respected; can be traded off
    DEONTIC = "deontic"  # Obligation or permission from governance


class DeonticType(StrEnum):
    OBLIGATORY = "obligatory"   # Must happen
    PERMITTED = "permitted"     # May happen
    FORBIDDEN = "forbidden"     # Must not happen
    WAIVABLE = "waivable"       # Normally obligatory but can be waived


class GoalHorizon(StrEnum):
    IMMEDIATE = "immediate"   # < 1 day
    SHORT = "short"           # 1 day – 1 month
    MEDIUM = "medium"         # 1 month – 1 year
    LONG = "long"             # > 1 year


class Goal(KOSBase):
    """
    A desired state or outcome that an actor is committed to pursuing.

    Goals are explicit first-class objects in KOS. This design choice
    prevents the system from collapsing to a scalar reward function:
    goals can conflict, be traded off, be delegated, be contested, and
    be revised. The hierarchy (parent_goal_id) supports both strategic
    decomposition and accountability tracing.
    """

    title: str
    description: str = ""
    status: GoalStatus = GoalStatus.ACTIVE
    horizon: GoalHorizon = GoalHorizon.MEDIUM
    priority: float = Field(default=0.5, ge=0.0, le=1.0)
    # ID of the AgentProfile that owns this goal
    owner_id: str | None = None
    # Parent goal in a decomposition hierarchy
    parent_goal_id: str | None = None
    # How progress toward this goal is measured
    metric: str | None = None
    # Current measured value of the metric
    metric_value: float | None = None
    # Target value to consider the goal achieved
    metric_target: float | None = None
    domain: str | None = None
    attributes: dict[str, Any] = Field(default_factory=dict)


class Constraint(KOSBase):
    """
    A restriction on the actions or states permitted in a workflow.

    Constraints are explicitly typed as hard, soft, or deontic to
    preserve distinctions that matter for governance: a hard engineering
    constraint (temperature < 200°C) is different from a soft business
    preference (minimise cost) which is different from a deontic
    prohibition (must not share patient data with insurers).
    """

    description: str
    constraint_type: ConstraintType
    deontic_type: DeonticType | None = None
    # IDs of Goal, Entity, Mechanism, or workflow nodes this applies to
    governed_entity_ids: list[str] = Field(default_factory=list)
    # ID of the Permission or Obligation node that grants/mandates this
    authority_id: str | None = None
    domain: str | None = None
    # Whether this constraint can be contested and by whom
    contestable: bool = True
    # ID of the AgentProfile that may contest this constraint
    contestable_by: list[str] = Field(default_factory=list)


class Obligation(KOSBase):
    """
    A deontic requirement that an actor must perform some action.

    Obligations are the actionable counterpart to Constraints.
    They bind specific actors to specific actions under specific
    conditions, and they support reversible delegation.
    """

    actor_id: str
    action: str
    deontic_type: DeonticType = DeonticType.OBLIGATORY
    trigger_condition: str | None = None
    deadline: str | None = None  # ISO 8601 or natural language
    domain: str | None = None
    # True if this obligation can be delegated to another actor
    delegatable: bool = True
    # ID of the Delegation node if currently delegated
    delegation_id: str | None = None
    fulfilled: bool = False
