"""
Alignment service — partial functor computation between local ontologies.

Category-theoretic framing (conceptual layer):
  Each domain ontology is treated as a small category: objects are entity
  types, morphisms are relation types, and composition is path concatenation.
  An AlignmentMap is a partial functor F: C₁ → C₂ that sends objects and
  morphisms to their counterparts where they exist, and leaves gaps explicit.

What is actually coded vs. conceptual:
  - CODED: structural overlap scoring (shared entity types, shared relation
    types), gap detection, coverage metric, OntologyMapping list.
  - CONCEPTUAL (not yet production-ready): automated functor computation via
    category-theoretic machinery. That would require a formal ontology
    representation (e.g., OWL) and a sheaf-based consistency checker.
    Flagged as future work in docs/category_theory_alignment.md.

The current implementation produces real, structured AlignmentMap objects
that are useful for visualisation and manual review.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.serialise import neo4j_props
from ..models.alignment import (
    AlignmentMap, OntologyMapping, MappingConfidence, ProposalType, ProposalStatus
)


_UPSERT_ALIGNMENT = "MERGE (a:AlignmentMap {id: $id}) SET a += $props RETURN a"

_ENTITIES_IN_DOMAIN = """
MATCH (e:Entity)
WHERE e.domain = $domain
RETURN e.id AS id, e.label AS label, e.entity_type AS entity_type
"""

_MECHANISMS_IN_DOMAIN = """
MATCH (m:Mechanism)
WHERE m.domain = $domain
RETURN m.id AS id, m.name AS name, m.mechanism_type AS mechanism_type
"""


class AlignmentService:

    async def compute(
        self,
        source_domain: str,
        target_domain: str,
        source_ontology_id: str,
        target_ontology_id: str,
    ) -> AlignmentMap:
        """
        Compute a partial alignment between two domain ontologies.

        Algorithm:
        1. Fetch entities from each domain.
        2. Match by normalised label similarity and shared entity_type.
        3. Fetch mechanism types from each domain; match by type.
        4. Identify gaps (nodes with no counterpart).
        5. Compute coverage = matched / total source nodes.
        6. Return an AlignmentMap with all mappings and gaps listed.

        This is a structural heuristic. It will find obvious overlaps
        (both domains have PROTEIN entities) and obvious gaps (only
        drug discovery has COMPOUND entities). Semantic alignment of
        *meaning* requires domain experts — the map surfaces where that
        expert review is needed.
        """
        src_entities = await run_query(_ENTITIES_IN_DOMAIN, {"domain": source_domain})
        tgt_entities = await run_query(_ENTITIES_IN_DOMAIN, {"domain": target_domain})

        src_mechs = await run_query(_MECHANISMS_IN_DOMAIN, {"domain": source_domain})
        tgt_mechs = await run_query(_MECHANISMS_IN_DOMAIN, {"domain": target_domain})

        mappings: list[OntologyMapping] = []
        gaps_source: list[str] = []
        gaps_target: list[str] = []

        # Build lookup by entity_type for the target
        tgt_by_type: dict[str, list[dict]] = {}
        for r in tgt_entities:
            tgt_by_type.setdefault(r["entity_type"], []).append(r)

        matched_target_ids: set[str] = set()

        for src_row in src_entities:
            src_id = src_row["id"]
            src_label = (src_row["label"] or "").lower()
            src_type = src_row["entity_type"]

            best_match = None
            best_score = 0.0

            for tgt_row in tgt_by_type.get(src_type, []):
                tgt_label = (tgt_row["label"] or "").lower()
                score = _label_similarity(src_label, tgt_label)
                # Boost for exact type match
                if tgt_row["entity_type"] == src_type:
                    score = min(1.0, score + 0.2)
                if score > best_score:
                    best_score = score
                    best_match = tgt_row

            if best_match and best_score >= 0.4:
                confidence = _score_to_confidence(best_score)
                mappings.append(OntologyMapping(
                    source_node_id=src_id,
                    target_node_id=best_match["id"],
                    confidence=confidence,
                    score=best_score,
                    structural_loss="" if best_score > 0.8 else "partial semantic overlap only",
                ))
                matched_target_ids.add(best_match["id"])
            else:
                gaps_source.append(src_id)

        # Mechanism type alignment
        src_mech_types = {r["mechanism_type"] for r in src_mechs}
        tgt_mech_types = {r["mechanism_type"] for r in tgt_mechs}
        for tgt_row in tgt_entities:
            if tgt_row["id"] not in matched_target_ids:
                gaps_target.append(tgt_row["id"])

        total_source = len(src_entities) + len(src_mechs)
        coverage = len(mappings) / max(total_source, 1)

        structural_notes = _build_structural_notes(
            source_domain, target_domain, src_mech_types, tgt_mech_types, gaps_source
        )

        alignment = AlignmentMap(
            source_ontology_id=source_ontology_id,
            target_ontology_id=target_ontology_id,
            source_domain=source_domain,
            target_domain=target_domain,
            mappings=mappings,
            gaps_source=gaps_source,
            gaps_target=gaps_target,
            coverage=coverage,
            structural_notes=structural_notes,
        )

        props = _ser(alignment)
        await run_write(_UPSERT_ALIGNMENT, {"id": alignment.id, "props": props})
        return alignment

    async def get_alignment(self, alignment_id: str) -> dict[str, Any] | None:
        rows = await run_query("MATCH (a:AlignmentMap {id: $id}) RETURN a", {"id": alignment_id})
        return dict(rows[0]["a"]) if rows else None

    async def list_alignments(self) -> list[dict[str, Any]]:
        rows = await run_query("MATCH (a:AlignmentMap) RETURN a ORDER BY a.created_at DESC LIMIT 50", {})
        return [dict(r["a"]) for r in rows]


# ── Helpers ──────────────────────────────────────────────────────────────────

def _label_similarity(a: str, b: str) -> float:
    """Jaccard similarity on character bigrams. Fast, no dependencies."""
    def bigrams(s: str) -> set[str]:
        return {s[i:i+2] for i in range(len(s) - 1)}
    bg_a, bg_b = bigrams(a), bigrams(b)
    if not bg_a or not bg_b:
        return 1.0 if a == b else 0.0
    return len(bg_a & bg_b) / len(bg_a | bg_b)


def _score_to_confidence(score: float) -> MappingConfidence:
    if score >= 0.9:
        return MappingConfidence.EXACT
    if score >= 0.7:
        return MappingConfidence.CLOSE
    if score >= 0.5:
        return MappingConfidence.PARTIAL
    return MappingConfidence.ANALOGICAL


def _build_structural_notes(
    src: str, tgt: str,
    src_mech_types: set[str], tgt_mech_types: set[str],
    gaps_source: list[str],
) -> str:
    shared = src_mech_types & tgt_mech_types
    only_src = src_mech_types - tgt_mech_types
    only_tgt = tgt_mech_types - src_mech_types
    parts = [
        f"Aligning '{src}' → '{tgt}'.",
        f"Shared mechanism types: {sorted(shared) or 'none'}.",
    ]
    if only_src:
        parts.append(f"Mechanism types only in source: {sorted(only_src)} — no target counterpart; translation fails here.")
    if only_tgt:
        parts.append(f"Mechanism types only in target: {sorted(only_tgt)} — source has no equivalent.")
    if gaps_source:
        parts.append(f"{len(gaps_source)} source entity/entities have no mapping; require expert review.")
    return " ".join(parts)


def _ser(obj: Any) -> dict[str, Any]:
    return neo4j_props(obj)
