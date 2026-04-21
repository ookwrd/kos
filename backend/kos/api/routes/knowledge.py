"""Knowledge graph routes — entities, mechanisms, hypotheses, path explanation."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from ...knowledge_graph.service import KnowledgeGraphService
from ...models.knowledge import Entity, Mechanism, Hypothesis

router = APIRouter()
_svc = KnowledgeGraphService()


@router.post("/entities", response_model=Entity)
async def create_entity(entity: Entity) -> Entity:
    return await _svc.create_entity(entity)


@router.get("/entities/{entity_id}")
async def get_entity(entity_id: str) -> dict[str, Any]:
    result = await _svc.get_entity(entity_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Entity {entity_id!r} not found")
    return result


@router.get("/entities")
async def list_entities(
    domain: str | None = Query(default=None),
    limit: int = Query(default=50, le=200),
) -> list[dict[str, Any]]:
    return await _svc.list_entities(domain=domain, limit=limit)


@router.post("/mechanisms", response_model=Mechanism)
async def create_mechanism(mechanism: Mechanism) -> Mechanism:
    return await _svc.create_mechanism(mechanism)


@router.post("/hypotheses", response_model=Hypothesis)
async def create_hypothesis(hypothesis: Hypothesis) -> Hypothesis:
    return await _svc.create_hypothesis(hypothesis)


@router.get("/hypotheses")
async def list_hypotheses(
    domain: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
) -> list[dict[str, Any]]:
    return await _svc.list_hypotheses(domain=domain, limit=limit)


@router.get("/path")
async def explain_mechanism_path(
    from_entity: str = Query(..., alias="from", description="Source entity label or ID"),
    to_entity: str = Query(..., alias="to", description="Target entity label or ID"),
) -> list[dict[str, Any]]:
    """
    Find the shortest causal chain between two entities.

    Returns up to 5 paths, each as an ordered list of {id, label, type} nodes.
    Answers: "What evidence supports this mechanism path?"
    """
    paths = await _svc.explain_path(from_entity, to_entity)
    if not paths:
        raise HTTPException(
            status_code=404,
            detail=f"No mechanism path found from '{from_entity}' to '{to_entity}'",
        )
    return paths


@router.get("/search")
async def semantic_search(
    q: str = Query(..., description="Semantic search query"),
    n: int = Query(default=10, le=50),
) -> list[dict[str, Any]]:
    return await _svc.semantic_search(q, n=n)
