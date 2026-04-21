"""Open-endedness routes — graph evolution proposals and review."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Query
from pydantic import BaseModel

from ...open_endedness.service import OpenEndednessService


class ReviewRequest(BaseModel):
    accepted: bool
    note: str = ""

router = APIRouter()
_svc = OpenEndednessService()


@router.post("/scan")
async def scan_novelty(
    sparse_threshold: int = Query(default=2, ge=1),
    uncertainty_threshold: float = Query(default=0.75, ge=0.0, le=1.0),
) -> list[dict[str, Any]]:
    """
    Scan the graph and generate proposals for structural evolution.

    Produces three proposal types:
    - DENSIFY: sparse entity neighbourhoods
    - BRIDGE: cross-domain entities sharing mechanism types
    - NEW_EDGE: highly uncertain nodes lacking active proposals

    Answers: "What new bridge or neighbourhood should be explored next?"
    """
    proposals = await _svc.scan_novelty(
        sparse_threshold=sparse_threshold,
        uncertainty_threshold=uncertainty_threshold,
    )
    return [p.model_dump() for p in proposals]


@router.get("/proposals")
async def get_pending_proposals(
    limit: int = Query(default=20, le=100),
) -> list[dict[str, Any]]:
    """Return pending and under-review graph change proposals."""
    return await _svc.get_pending(limit=limit)


@router.post("/proposals/{proposal_id}/review")
async def review_proposal(
    proposal_id: str,
    body: ReviewRequest,
) -> dict[str, Any]:
    """Apply a governance decision (accept/reject) to a proposal."""
    return await _svc.review_proposal(proposal_id, accepted=body.accepted, note=body.note)


@router.post("/proposals/bridge")
async def propose_bridge(
    domain_a: str = Query(...),
    domain_b: str = Query(...),
    rationale: str = Body(...),
    proposed_by: str | None = Query(default=None),
) -> dict[str, Any]:
    """Manually propose a cross-domain bridge."""
    proposal = await _svc.propose_bridge(domain_a, domain_b, rationale, proposed_by)
    return proposal.model_dump()
