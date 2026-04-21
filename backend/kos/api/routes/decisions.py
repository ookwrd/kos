"""Context graph routes — decision traces, replay, and precedents."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from ...context_graph.service import ContextGraphService
from ...models.context import DecisionTrace, Precedent

router = APIRouter()
_svc = ContextGraphService()


@router.post("", response_model=DecisionTrace)
async def record_decision(decision: DecisionTrace) -> DecisionTrace:
    """Record a decision trace on the write path."""
    return await _svc.record_decision(decision)


@router.get("/{decision_id}/replay")
async def replay_decision(decision_id: str) -> dict[str, Any]:
    """
    Reconstruct a decision with its full justification chain.

    Returns ordered replay steps: question → evidence → policy →
    precedent → actor → outcome.
    """
    result = await _svc.replay_decision(decision_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id!r} not found")
    return result


@router.get("/{decision_id}/precedents")
async def get_precedents_for_decision(
    decision_id: str,
    limit: int = Query(default=10, le=50),
) -> list[dict[str, Any]]:
    """Find precedents invoked by or analogous to this decision."""
    # Get the decision to extract domain and actor
    replay = await _svc.replay_decision(decision_id)
    if not replay:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id!r} not found")
    domain = replay["decision"].get("domain")
    actor_ids = [a["id"] for a in replay.get("actors", []) if a]
    actor_id = actor_ids[0] if actor_ids else None
    return await _svc.find_precedents(domain=domain, actor_id=actor_id, limit=limit)


@router.get("/precedents/search")
async def search_precedents(
    q: str = Query(..., description="Search query"),
    limit: int = Query(default=5, le=20),
) -> list[dict[str, Any]]:
    """Semantic search across decisions and precedents."""
    return await _svc.find_analogous_by_text(q, n=limit)


@router.post("/precedents", response_model=Precedent)
async def create_precedent(
    precedent: Precedent,
    derived_from: str | None = Query(default=None, description="Source decision ID"),
) -> Precedent:
    """Create a new precedent, optionally linking it to its source decision."""
    return await _svc.create_precedent(precedent, derived_from_decision_id=derived_from)


@router.get("/exceptions")
async def list_exceptions(
    domain: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
) -> list[dict[str, Any]]:
    """Return recent exception decisions for audit and policy review."""
    return await _svc.get_exception_history(domain=domain, limit=limit)


@router.get("/precedents/{precedent_id}/usage")
async def precedent_usage(
    precedent_id: str,
    limit: int = Query(default=20, le=100),
) -> list[dict[str, Any]]:
    """Show which decisions have invoked a given precedent."""
    return await _svc.get_precedent_usage(precedent_id=precedent_id, limit=limit)
