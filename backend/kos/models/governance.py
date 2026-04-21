"""Layer 5 — Governance graph models."""

from __future__ import annotations

from enum import StrEnum
from datetime import datetime
from typing import Any

from pydantic import Field

from .base import KOSBase


class AccessType(StrEnum):
    READ = "read"
    WRITE = "write"
    APPROVE = "approve"
    CONTEST = "contest"
    DELEGATE = "delegate"
    AUDIT = "audit"
    ADMINISTER = "administer"


class ProvenanceAction(StrEnum):
    CREATED = "created"
    MODIFIED = "modified"
    VALIDATED = "validated"
    DELEGATED = "delegated"
    CONTESTED = "contested"
    DEPRECATED = "deprecated"
    MERGED = "merged"
    SPLIT = "split"


class Permission(KOSBase):
    """
    A grant of access that allows an actor to perform an action on a target.

    Permissions are explicit graph nodes (not just attributes) so that the
    governance graph can represent who granted what, when, under what
    conditions, and with what expiry. This makes access control auditable
    and queryable.
    """

    # ID of the AgentProfile receiving this permission
    actor_id: str
    # ID of the KOS node or domain this permission covers
    target_id: str
    access_type: AccessType
    # ISO 8601 expiry, or None for indefinite
    expiry: datetime | None = None
    # If True, a human reviewer must confirm before access is exercised
    requires_review: bool = False
    # ID of the AgentProfile that granted this permission
    granted_by: str | None = None
    domain: str | None = None
    conditions: list[str] = Field(default_factory=list)


class ProvenanceRecord(KOSBase):
    """
    An immutable record of an action performed on a KOS node.

    Provenance records form a directed acyclic graph of custody.
    They answer: who did what to which node, when, and what changed.
    They are never deleted — deprecation is a new record, not a deletion.

    Design note: data_hash is a content hash of the target node's
    serialised state at the time of this action, enabling tamper detection.
    """

    # ID of the KOS node that was acted upon
    source_id: str
    # ID of the acting AgentProfile
    actor_id: str
    action: ProvenanceAction
    # SHA-256 of the target node's JSON at the time of this action
    data_hash: str | None = None
    # IDs of nodes that were produced or affected downstream
    downstream_ids: list[str] = Field(default_factory=list)
    # Human-readable note about why this action was taken
    note: str = ""
    domain: str | None = None
    attributes: dict[str, Any] = Field(default_factory=dict)
