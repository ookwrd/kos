"""Transfer layer — cross-domain concept nodes and functor maps.

Models the ConceptNode family, abstraction geometry, and the structural
artifacts produced by the Transfer Workbench (partial functors, structural
loss records, natural transformation comparisons).
"""

from __future__ import annotations

from enum import StrEnum
from typing import Optional

from pydantic import Field

from .base import KOSBase


# ── Enums ─────────────────────────────────────────────────────────────────────


class ConceptType(StrEnum):
    MECHANISM = "mechanism"
    CONCEPT = "concept"
    INVARIANT = "invariant"
    THEOREM = "theorem"
    SCHEMA = "schema"
    INSTANCE = "instance"
    TRANSLATOR = "translator"
    COUNTEREXAMPLE = "counterexample"
    VALIDATION_PROTOCOL = "validation_protocol"
    PROOF_SKETCH = "proof_sketch"


class ValidationStatus(StrEnum):
    PROPOSED = "proposed"
    VALIDATED = "validated"
    CONTESTED = "contested"
    FALSIFIED = "falsified"


class LossType(StrEnum):
    UNMAPPED = "unmapped"        # no corresponding structure in target
    DISTORTED = "distorted"      # structure exists but with different properties
    APPROXIMATED = "approximated"  # structure exists only approximately
    FORBIDDEN = "forbidden"      # structure contradicts something in target


class TransferStatus(StrEnum):
    PROPOSED = "proposed"
    VALIDATED = "validated"
    FALSIFIED = "falsified"


class TranslatorConfidence(StrEnum):
    EXACT = "exact"
    CLOSE = "close"
    PARTIAL = "partial"
    ANALOGICAL = "analogical"
    BLOCKED = "blocked"


# ── Core concept node ─────────────────────────────────────────────────────────


class ConceptNode(KOSBase):
    """A node in the concept graph, positioned in abstraction space.

    Three geometry axes define where a concept sits in the abstract-concrete
    landscape. These axes determine whether a concept can serve as a transfer
    vessel between domains (high abstraction + high transferability) or is
    domain-locked (low abstraction, low transferability).

    Axis definitions:
      abstraction_level  [0, 1]: 0 = concrete/implementation-specific,
                                  1 = fully abstract/formal/mathematical
      substrate_distance [0, 1]: 0 = near physical reality,
                                  1 = purely symbolic/mathematical
      application_distance [0, 1]: 0 = immediately actionable in one domain,
                                    1 = general-purpose; needs translation first
    """

    label: str
    concept_type: ConceptType
    domain: str | list[str] = Field(
        description="Single domain string or list; use 'cross' for cross-domain concepts"
    )

    # Three abstraction geometry axes
    abstraction_level: float = Field(ge=0.0, le=1.0)
    substrate_distance: float = Field(ge=0.0, le=1.0)
    application_distance: float = Field(ge=0.0, le=1.0)

    # Additional quality dimensions
    formalization_level: float = Field(
        default=0.5, ge=0.0, le=1.0,
        description="0 = tacit intuition only; 1 = formal proof exists"
    )
    codifiability: float = Field(
        default=0.5, ge=0.0, le=1.0,
        description="0 = tacit/embodied only; 1 = fully explicit"
    )
    tacit_dependence: float = Field(
        default=0.5, ge=0.0, le=1.0,
        description="How much embodied expertise is required to use this concept"
    )
    transferability: float = Field(
        default=0.5, ge=0.0, le=1.0,
        description="0 = domain-locked; 1 = freely transferable across domains"
    )

    # Governance and status
    governance_scope: str = Field(
        default="public",
        description="Who governs this concept: 'public', 'domain:<name>', 'private:<actor_id>'"
    )
    validation_status: ValidationStatus = ValidationStatus.PROPOSED

    # Structural properties
    invariants: list[str] = Field(
        default_factory=list,
        description="Properties preserved across all instantiations"
    )

    # Relations (stored as IDs; resolved by graph traversal)
    depends_on: list[str] = Field(default_factory=list)
    instantiated_in: list[str] = Field(default_factory=list)
    explains: list[str] = Field(default_factory=list)
    counterexamples: list[str] = Field(default_factory=list)

    description: str = ""
    proof_sketch: Optional[str] = None


# ── Structural loss ───────────────────────────────────────────────────────────


class StructuralLossRecord(KOSBase):
    """Records what a partial functor forgets during a domain transfer.

    Every non-trivial transfer forgets some structure. These records make
    the forgetting explicit and computable: each record names a specific
    piece of source structure, explains why it has no image in the target,
    and states the consequence if the loss is ignored.
    """

    translator_id: str = Field(description="ID of the TransferCandidate this loss belongs to")
    source_node_id: str = Field(description="ID of the ConceptNode that was lost or distorted")
    loss_type: LossType
    description: str = Field(description="What breaks and why")
    consequence: str = Field(description="What downstream predictions fail if this loss is ignored")


# ── Translator step ───────────────────────────────────────────────────────────


class TranslatorStep(KOSBase):
    """A single step in a partial functor — one object mapped from source to target."""

    translator_id: str
    source_node_id: str
    source_label: str
    target_node_id: str
    target_label: str
    confidence: TranslatorConfidence
    preserved_invariants: list[str] = Field(default_factory=list)
    lost: Optional[str] = None
    notes: Optional[str] = None


# ── Transfer candidate ────────────────────────────────────────────────────────


class TransferCandidate(KOSBase):
    """A proposed partial functor between two domain subgraphs.

    Captures a hypothesis: the structural properties of source_domain,
    as expressed in source_mechanism, can be transferred to target_domain
    via the abstract concept via_concept_id. The transfer is mediated by a
    partial functor that maps morphisms as well as objects.

    Confidence is an aggregate over the step-level confidence values.
    """

    source_domain: str
    target_domain: str
    via_concept_id: str = Field(description="The abstraction that mediates the transfer")
    source_mechanism_id: str
    target_candidate_id: str = Field(description="Proposed instantiation in target domain")

    confidence: float = Field(ge=0.0, le=1.0)
    invariants_preserved: list[str] = Field(default_factory=list)
    structural_losses: list[str] = Field(
        default_factory=list,
        description="IDs of StructuralLossRecord nodes"
    )
    validation_protocols: list[str] = Field(
        default_factory=list,
        description="IDs of ConceptNode objects with concept_type=VALIDATION_PROTOCOL"
    )
    steps: list[str] = Field(
        default_factory=list,
        description="IDs of TranslatorStep nodes, in order"
    )

    status: TransferStatus = TransferStatus.PROPOSED
    transfer_claim: str = ""
    historical_note: Optional[str] = None


# ── Natural transformation candidate ─────────────────────────────────────────


class NaturalTransformationCandidate(KOSBase):
    """Compares two competing transfer functors between the same domain pair.

    Given F: D_source → D_target and G: D_source → D_target (both are
    TransferCandidate objects), a natural transformation η: F ⇒ G is a
    family of morphisms η_A: F(A) → G(A) for each object A.

    The naturality condition requires: G(f) ∘ η_A = η_B ∘ F(f) for every
    morphism f: A → B in D_source.

    When naturality fails, F and G disagree about how source structure maps
    to target structure. The divergence_nodes record where this happens.
    """

    source_translator_id: str = Field(description="F: domain_source → domain_target")
    target_translator_id: str = Field(description="G: domain_source → domain_target")

    agreement_nodes: list[str] = Field(
        default_factory=list,
        description="ConceptNode IDs where F and G produce identical mappings"
    )
    divergence_nodes: list[str] = Field(
        default_factory=list,
        description="ConceptNode IDs where F and G give different target images"
    )

    naturality_holds: Optional[bool] = Field(
        default=None,
        description="None = unchecked; True = naturality square commutes; False = fails"
    )
    divergence_explanation: str = Field(
        default="",
        description="Semantic explanation of why F and G diverge at the divergence_nodes"
    )
    preferred_translator_id: Optional[str] = Field(
        default=None,
        description="Which translator is preferred (if determinable); None if equal or context-dependent"
    )
