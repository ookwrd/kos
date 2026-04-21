"""Alignment routes — ontology alignment and functor bridge computation."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from ...alignment.service import AlignmentService

router = APIRouter()
_svc = AlignmentService()


@router.post("/compute")
async def compute_alignment(
    source_domain: str = Query(...),
    target_domain: str = Query(...),
    source_ontology_id: str = Query(default="auto"),
    target_ontology_id: str = Query(default="auto"),
) -> dict[str, Any]:
    """
    Compute a partial alignment (functor map) between two domain ontologies.

    Returns an AlignmentMap with:
    - mappings: list of {source_node_id, target_node_id, confidence, score}
    - gaps_source: concepts in source with no counterpart in target
    - gaps_target: concepts in target with no counterpart in source
    - coverage: fraction of source concepts that mapped
    - structural_notes: narrative description of alignment and failures

    Answers: "Where do these two ontologies align and where do they fail to translate?"
    """
    alignment = await _svc.compute(
        source_domain=source_domain,
        target_domain=target_domain,
        source_ontology_id=source_ontology_id,
        target_ontology_id=target_ontology_id,
    )
    return alignment.model_dump()


@router.get("")
async def list_alignments() -> list[dict[str, Any]]:
    return await _svc.list_alignments()


@router.get("/{alignment_id}")
async def get_alignment(alignment_id: str) -> dict[str, Any]:
    result = await _svc.get_alignment(alignment_id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Alignment {alignment_id!r} not found")
    return result
