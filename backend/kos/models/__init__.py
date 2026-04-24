"""KOS data models — all object types across 6 graph layers + transfer layer."""

from .base import KOSBase, EdgeBase, GraphLayer
from .evidence import EvidenceFragment, SourceType
from .context import DecisionTrace, Precedent, DecisionOutcome
from .knowledge import Entity, Mechanism, Hypothesis, TacitTrace, TacitStep, EntityType, MechanismType, HypothesisStatus
from .goal import Goal, Constraint, Obligation, GoalStatus, ConstraintType, DeonticType, GoalHorizon
from .governance import Permission, ProvenanceRecord, AccessType, ProvenanceAction
from .agents import AgentProfile, Delegation, DissentRecord, UncertaintyAnnotation, AgentType
from .alignment import AlignmentMap, GraphChangeProposal, OntologyMapping, ProposalType, ProposalStatus
from .transfer import (
    ConceptNode, ConceptType, ValidationStatus,
    StructuralLossRecord, LossType,
    TranslatorStep, TranslatorConfidence,
    TransferCandidate, TransferStatus,
    NaturalTransformationCandidate,
)

__all__ = [
    "KOSBase", "EdgeBase", "GraphLayer",
    "EvidenceFragment", "SourceType",
    "DecisionTrace", "Precedent", "DecisionOutcome",
    "Entity", "Mechanism", "Hypothesis", "TacitTrace", "TacitStep", "EntityType", "MechanismType", "HypothesisStatus",
    "Goal", "Constraint", "Obligation", "GoalStatus", "ConstraintType", "DeonticType", "GoalHorizon",
    "Permission", "ProvenanceRecord", "AccessType", "ProvenanceAction",
    "AgentProfile", "Delegation", "DissentRecord", "UncertaintyAnnotation", "AgentType",
    "AlignmentMap", "GraphChangeProposal", "OntologyMapping", "ProposalType", "ProposalStatus",
    # Transfer layer
    "ConceptNode", "ConceptType", "ValidationStatus",
    "StructuralLossRecord", "LossType",
    "TranslatorStep", "TranslatorConfidence",
    "TransferCandidate", "TransferStatus",
    "NaturalTransformationCandidate",
]
