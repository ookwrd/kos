"""Alignment and open-endedness models (cross-layer)."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field

from .base import KOSBase, _uid


class MappingConfidence(StrEnum):
    EXACT = "exact"         # Concepts are definitionally equivalent
    CLOSE = "close"         # Concepts overlap substantially
    PARTIAL = "partial"     # Partial semantic overlap
    ANALOGICAL = "analogical"  # Structurally similar but semantically distinct
    FAILED = "failed"       # No reliable mapping exists


class OntologyMapping(BaseModel):
    """A single concept-to-concept mapping between two ontologies."""

    id: str = Field(default_factory=_uid)
    # Node ID in the source ontology
    source_node_id: str
    # Node ID in the target ontology
    target_node_id: str
    confidence: MappingConfidence
    # 0–1 score for the mapping quality
    score: float = Field(default=0.5, ge=0.0, le=1.0)
    # What structure (if any) is lost in this mapping
    structural_loss: str = ""
    notes: str = ""


class AlignmentMap(KOSBase):
    """
    A partial functor between two local ontologies.

    In category-theoretic terms, this is a (partial) functor from the
    source ontology (as a category of entities and relations) to the
    target ontology. 'Partial' is intentional: forcing a total mapping
    would collapse important distinctions. The `gaps` list makes explicit
    where the functor fails — these are scientifically and organisationally
    meaningful.

    This object is produced by AlignmentService.compute() and stored in
    the graph to make schema translation auditable and versioned.
    """

    # IDs of Entity or domain-subgraph nodes representing each ontology
    source_ontology_id: str
    target_ontology_id: str
    source_domain: str
    target_domain: str
    mappings: list[OntologyMapping] = Field(default_factory=list)
    # Concept IDs in the source that have no counterpart in the target
    gaps_source: list[str] = Field(default_factory=list)
    # Concept IDs in the target that have no counterpart in the source
    gaps_target: list[str] = Field(default_factory=list)
    # Overall alignment coverage (mapped / total source nodes)
    coverage: float = Field(default=0.0, ge=0.0, le=1.0)
    # Human-readable notes on major structural differences
    structural_notes: str = ""
    # Version of this alignment (incremented on update)
    version: int = 1


class ProposalType(StrEnum):
    NEW_NODE = "new_node"
    NEW_EDGE = "new_edge"
    DEPRECATE = "deprecate"
    BRIDGE = "bridge"           # Cross-domain connection
    DENSIFY = "densify"         # Fill sparse neighbourhood
    SPLIT = "split"             # Disaggregate an over-broad node
    MERGE = "merge"             # Consolidate duplicates


class ProposalStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    UNDER_REVIEW = "under_review"
    DEFERRED = "deferred"


class GraphChangeProposal(KOSBase):
    """
    A structured proposal to evolve the graph.

    This is the interface between the open_endedness layer and the rest of
    KOS. Proposals are generated algorithmically (by novelty detection) or
    by agents, but they are *always* subject to governance review before
    being applied. This prevents uncontrolled self-modification while
    enabling open-ended graph growth.
    """

    proposal_type: ProposalType
    # Plain-language description of the proposed change
    rationale: str
    # Score in [0, 1]: how novel/unexpected is this proposal?
    novelty_score: float = Field(default=0.5, ge=0.0, le=1.0)
    status: ProposalStatus = ProposalStatus.PENDING
    # IDs of nodes that would be created, modified, or linked
    affected_node_ids: list[str] = Field(default_factory=list)
    # Structured specification of the proposed change
    change_spec: dict[str, Any] = Field(default_factory=dict)
    # ID of the AgentProfile that proposed this change
    proposed_by: str | None = None
    # ID of the AgentProfile assigned to review
    reviewer_id: str | None = None
    review_note: str = ""
    domain: str | None = None
