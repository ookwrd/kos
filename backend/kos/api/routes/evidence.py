"""Evidence graph routes — ingest and search EvidenceFragments."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from ...evidence_graph.service import EvidenceGraphService
from ...models.evidence import EvidenceFragment

router = APIRouter()
_svc = EvidenceGraphService()


@router.post("", response_model=EvidenceFragment)
async def ingest(fragment: EvidenceFragment) -> EvidenceFragment:
    return await _svc.ingest(fragment)


@router.get("/{fragment_id}")
async def get_fragment(fragment_id: str) -> dict[str, Any]:
    result = await _svc.get(fragment_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"EvidenceFragment {fragment_id!r} not found")
    return result


@router.get("")
async def list_fragments(
    domain: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
) -> list[dict[str, Any]]:
    return await _svc.search(domain=domain, limit=limit)


@router.get("/search/semantic")
async def semantic_search(
    q: str = Query(...),
    n: int = Query(default=10, le=50),
) -> list[dict[str, Any]]:
    return await _svc.semantic_search(q, n=n)
