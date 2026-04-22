"""Alignment and open-endedness models (cross-layer)."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field

from .base import KOSBase, _uid


# ---------------------------------------------------------------------------
# Transfer operator enums
# ---------------------------------------------------------------------------


class TransferStatus(StrEnum):
    PROPOSED = "proposed"
    VALIDATING = "validating"
    APPROVED = "approved"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REVOKED = "revoked"


class FunctorValidationResult(StrEnum):
    COHERENT = "coherent"             # All categorical axioms satisfied
    PARTIALLY_COHERENT = "partially_coherent"  # Most axioms hold, documented gaps
    INCOHERENT = "incoherent"         # Composition does not commute
    PENDING = "pending"               # Not yet validated


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


# ---------------------------------------------------------------------------
# V3 Transfer machinery
# ---------------------------------------------------------------------------


class StructuralLossItem(BaseModel):
    """One identified item of structural loss in a transfer."""

    loss_type: str  # e.g. "relation_missing", "concept_absent", "direction_reversed"
    description: str
    severity: float = Field(default=0.5, ge=0.0, le=1.0)  # 0 = trivial, 1 = breaks analogy


class StructuralLossReport(KOSBase):
    """
    Explicit accounting of what is lost when a transfer is applied.

    Every TransferOperator must carry one of these. The report is not a
    judgment that the transfer is invalid — it is the documentation that
    makes the transfer epistemically honest. A transfer with a complete
    StructuralLossReport is more trustworthy than one without, even if
    the loss is significant.
    """

    source_domain: str
    target_domain: str
    # The alignment map or transfer operator this report covers
    alignment_map_id: str | None = None
    transfer_operator_id: str | None = None
    items: list[StructuralLossItem] = Field(default_factory=list)
    # 0 = total loss (meaningless transfer), 1 = no loss (exact functor)
    overall_fidelity: float = Field(default=0.5, ge=0.0, le=1.0)
    summary: str = ""


class LocalConsistencyCondition(KOSBase):
    """
    A condition that the target domain must satisfy for a transfer to be coherent.

    Before a TransferOperator is approved, all LocalConsistencyConditions
    on the target domain must be checked. A failing condition blocks the
    transfer until resolved.

    Example: "If surgical_robotics imports the 'authority_override' pattern
    from fukushima_governance, the target domain must have a corresponding
    'OR Safety Committee' role with override authority — otherwise the
    imported pattern has no valid binding."
    """

    description: str
    target_domain: str
    required_node_type: str | None = None  # e.g. "AgentProfile:institution"
    required_relation: str | None = None   # e.g. "governs"
    is_satisfied: bool = False
    checked_by: str | None = None          # AgentProfile ID of reviewer


class GlobalGluingGap(KOSBase):
    """
    An irreducible ontological difference between two domains that prevents
    full alignment.

    Named after the gluing condition in sheaf theory: not all local sections
    can be glued into a global section. Where they cannot, the gap is real.

    A GlobalGluingGap is not a failure — it is a finding. It identifies
    a conceptual asymmetry that is scientifically or organizationally
    meaningful. The gap between 'public_safety_obligation' in
    fukushima_governance and anything in drug_discovery is an example:
    nuclear safety has a category of social obligation that clinical trials
    simply do not have.
    """

    domain_a: str
    domain_b: str
    concept_a: str | None = None      # Node ID or concept name in domain_a that cannot be mapped
    concept_b: str | None = None      # Node ID or concept name in domain_b that cannot be mapped
    description: str
    # Is this gap a genuine structural difference, or just a terminology gap?
    is_structural: bool = True
    evidence: str = ""


class BridgeMap(KOSBase):
    """
    A scoped subset of an AlignmentMap covering exactly one transfer claim.

    While AlignmentMap covers the full structure of two domains, BridgeMap
    focuses on a specific claim: "the authority-override pattern in
    fukushima_governance is structurally identical to the pattern in
    surgical_robotics." The BridgeMap contains only the nodes and morphisms
    necessary to support that claim.

    This scoping is important: a broad AlignmentMap may have low overall
    coverage but contain highly confident narrow bridges. BridgeMap makes
    those bridges independently usable and independently reviewable.
    """

    alignment_map_id: str           # Parent AlignmentMap
    claim: str                      # The specific structural claim this bridge supports
    source_domain: str
    target_domain: str
    # Subset of mappings from the parent AlignmentMap
    included_mapping_ids: list[str] = Field(default_factory=list)
    # Structural loss specific to this claim
    structural_loss_report_id: str | None = None
    # Confidence in this specific bridge (may differ from parent map coverage)
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    # Is this bridge used as the basis for an active TransferOperator?
    is_activated: bool = False


class TransferOperator(KOSBase):
    """
    An activated cross-domain knowledge transfer.

    The TransferOperator is the operational unit: it says "we are
    actively using the knowledge from domain A in domain B, through
    this specific bridge, with these specific loss acknowledgements,
    approved by this governance review."

    Unlike a BridgeMap (which is a structural description), a
    TransferOperator is an action. It can be revoked by governance
    if new evidence breaks the bridge.
    """

    bridge_map_id: str
    status: TransferStatus = TransferStatus.PROPOSED
    # Agent or committee that approved this transfer
    approved_by: str | None = None
    # Governance review note
    approval_note: str = ""
    # The StructuralLossReport acknowledged at approval time
    acknowledged_loss_report_id: str | None = None
    # LocalConsistencyConditions that were checked and satisfied
    satisfied_condition_ids: list[str] = Field(default_factory=list)
    # Is this transfer reversible?
    reversible: bool = True
    # Optional expiry condition (natural language)
    expiry_condition: str = ""


class TransferFailure(KOSBase):
    """
    A record of a failed transfer attempt.

    Failures are stored because they are epistemically valuable: knowing
    that a transfer was attempted and failed — and why — prevents future
    attempts from repeating the mistake. TransferFailures are browsable
    in the governance layer alongside successes.
    """

    attempted_bridge_map_id: str | None = None
    attempted_functor_candidate_id: str | None = None
    failure_reason: str
    # What specific condition failed?
    failed_condition_id: str | None = None
    # Categorical level: object_mapping / morphism_incoherence / composition_failure / coverage_too_low
    failure_type: str = "general"
    reviewed_by: str | None = None


class FunctorCandidate(KOSBase):
    """
    A proposed functor between two ontological categories awaiting validation.

    Generated algorithmically by the AlignmentService or proposed by an agent.
    A FunctorCandidate becomes an active AlignmentMap when validated. If
    validation fails (composition doesn't commute, coverage too low), it
    becomes a TransferFailure.
    """

    source_domain: str
    target_domain: str
    # How the candidate proposes to map object types
    domain_map: dict[str, str] = Field(default_factory=dict)
    # How the candidate proposes to map relation/morphism types
    morphism_map: dict[str, str] = Field(default_factory=dict)
    # Claims about what structure is preserved
    preservation_claims: list[str] = Field(default_factory=list)
    # Algorithmic confidence before human review
    candidate_score: float = Field(default=0.5, ge=0.0, le=1.0)
    validation_result: FunctorValidationResult = FunctorValidationResult.PENDING
    validation_notes: str = ""
    # Validated → AlignmentMap ID if accepted
    resulting_alignment_map_id: str | None = None
    # Rejected → TransferFailure ID
    resulting_failure_id: str | None = None
    proposed_by: str | None = None


class NaturalTransformationCandidate(KOSBase):
    """
    A proposed compatibility between two existing AlignmentMaps.

    When F: A→B and G: A→B are two different ways to align domains A and B,
    a NaturalTransformationCandidate proposes that the difference between
    F and G is systematic: for each object X in A, there is a morphism
    η_X: F(X)→G(X) in B, and these morphisms commute with all the
    structure in B.

    If validated, this means: we have two translations, and we understand
    exactly how they relate to each other. The candidate documents the
    proposed η_X components and whether they check out.
    """

    source_alignment_map_id: str      # F: A → B
    target_alignment_map_id: str      # G: A → B (same source and target domains)
    # Proposed component morphisms: {object_id_in_A: morphism_in_B connecting F(X) to G(X)}
    component_morphisms: dict[str, str] = Field(default_factory=dict)
    # Do the naturality squares commute? (checked per component)
    naturality_checks: dict[str, bool] = Field(default_factory=dict)
    is_validated: bool = False
    validation_notes: str = ""
    proposed_by: str | None = None
