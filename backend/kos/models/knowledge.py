"""Layer 3 — Knowledge / mechanism graph models."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import Field

from .base import KOSBase


class EntityType(StrEnum):
    COMPOUND = "compound"
    PROTEIN = "protein"
    GENE = "gene"
    PATHWAY = "pathway"
    DISEASE = "disease"
    MATERIAL = "material"
    PROCESS = "process"
    TECHNOLOGY = "technology"
    INSTITUTION = "institution"
    CONCEPT = "concept"
    EVENT = "event"
    OTHER = "other"


class MechanismType(StrEnum):
    CAUSAL = "causal"
    INHIBITORY = "inhibitory"
    ENABLING = "enabling"
    REGULATORY = "regulatory"
    COMPOSITIONAL = "compositional"
    ANALOGICAL = "analogical"


class HypothesisStatus(StrEnum):
    PROPOSED = "proposed"
    SUPPORTED = "supported"
    CONTESTED = "contested"
    REFUTED = "refuted"
    VALIDATED = "validated"


class Entity(KOSBase):
    """
    A named thing in the knowledge / mechanism layer.

    Entities are the nodes around which mechanistic explanations are built.
    They are typed but not over-specified — the EntityType is a coarse
    category; richer semantics live in the `attributes` dict and in the
    Mechanism edges connecting entities.
    """

    label: str
    entity_type: EntityType
    domain: str | None = None
    # Alternative names / synonyms
    aliases: list[str] = Field(default_factory=list)
    # Structured properties (e.g. molecular weight, CAS number)
    attributes: dict[str, Any] = Field(default_factory=dict)
    # IDs of EvidenceFragment nodes that mention this entity
    evidence_ids: list[str] = Field(default_factory=list)


class Mechanism(KOSBase):
    """
    A directed causal or functional relationship between two entities.

    This is the primary edge type of the knowledge layer. Mechanisms are
    first-class objects (not mere graph edges) because they carry uncertainty,
    provenance, and evidence of their own.
    """

    name: str
    mechanism_type: MechanismType
    source_entity_id: str
    target_entity_id: str
    # Human-readable description of what happens
    description: str = ""
    # Named inputs beyond the source entity (e.g., cofactors)
    inputs: list[str] = Field(default_factory=list)
    # Named outputs beyond the target entity
    outputs: list[str] = Field(default_factory=list)
    # IDs of EvidenceFragment nodes supporting this mechanism
    evidence_ids: list[str] = Field(default_factory=list)
    # Confidence in the direction (0 = no evidence, 1 = definitive)
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    domain: str | None = None


class Hypothesis(KOSBase):
    """
    A falsifiable claim about the world, anchored to entities and evidence.

    Hypotheses are the generative interface of the knowledge layer: they
    express what we suspect but haven't confirmed, and they drive the
    active-inference layer's next-best-question logic.
    """

    statement: str
    domain: str | None = None
    status: HypothesisStatus = HypothesisStatus.PROPOSED
    # IDs of EvidenceFragment or Mechanism nodes that support this hypothesis
    evidence_for: list[str] = Field(default_factory=list)
    # IDs of EvidenceFragment or Mechanism nodes that contradict it
    evidence_against: list[str] = Field(default_factory=list)
    # IDs of Entity nodes this hypothesis concerns
    entity_ids: list[str] = Field(default_factory=list)
    # IDs of Goal nodes this hypothesis is relevant to
    goal_ids: list[str] = Field(default_factory=list)
    # Probability estimate (subjective, from annotating agent)
    prior: float = Field(default=0.5, ge=0.0, le=1.0)
    posterior: float | None = Field(default=None, ge=0.0, le=1.0)
