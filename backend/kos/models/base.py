"""Shared base types used across all KOS graph layers."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _uid() -> str:
    return str(uuid4())


class KOSBase(BaseModel):
    """Common fields for every KOS node."""

    id: str = Field(default_factory=_uid)
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
    # IDs of ProvenanceRecord nodes that trace this object's origin
    provenance: list[str] = Field(default_factory=list)
    # Scalar uncertainty in [0, 1]; None means "not assessed"
    uncertainty: float | None = Field(default=None, ge=0.0, le=1.0)
    # Freeform tags for UI filtering and search
    tags: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class GraphLayer(StrEnum):
    EVIDENCE = "evidence"
    CONTEXT = "context"
    KNOWLEDGE = "knowledge"
    GOAL = "goal"
    GOVERNANCE = "governance"
    AGENT_ECOLOGY = "agent_ecology"


class EdgeBase(BaseModel):
    """Lightweight directed edge between two KOS nodes."""

    id: str = Field(default_factory=_uid)
    source_id: str
    target_id: str
    relation_type: str
    layer: GraphLayer
    weight: float = 1.0
    created_at: datetime = Field(default_factory=_utcnow)
    attributes: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}
