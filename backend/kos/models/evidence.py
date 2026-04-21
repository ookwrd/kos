"""Layer 1 — Evidence graph models."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import Field

from .base import KOSBase


class SourceType(StrEnum):
    DOCUMENT = "document"
    TRANSCRIPT_SPAN = "transcript_span"
    IMAGE = "image"
    CLIP = "clip"
    SENSOR_WINDOW = "sensor_window"
    WORKFLOW_EVENT = "workflow_event"
    TOOL_CALL = "tool_call"
    SIMULATION_STATE = "simulation_state"
    CODE = "code"


class EvidenceFragment(KOSBase):
    """
    A discrete piece of evidence that can support claims in any other layer.

    Crucially distinct from a transcript archive: each fragment is an atomic,
    addressable unit with its own provenance and uncertainty. Transcripts are
    raw material; EvidenceFragments are curated, bounded claims extracted from
    that material.
    """

    source_type: SourceType
    # Human-readable title or short description
    title: str
    # Pointer to the actual content — URI, file path, or inline text
    content_ref: str
    # MIME type or format identifier
    media_type: str = "text/plain"
    # Domain this evidence belongs to (e.g. "drug_discovery", "governance")
    domain: str | None = None
    # IDs of AgentProfile nodes that validated this fragment
    validated_by: list[str] = Field(default_factory=list)
    # Structured metadata: page ranges, timestamps, sensor specs, etc.
    metadata: dict[str, Any] = Field(default_factory=dict)
