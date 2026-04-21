"""Agent ecology routes — profiles, delegations, dissent, uncertainty."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from ...agent_ecology.service import AgentEcologyService
from ...models.agents import AgentProfile, Delegation, DissentRecord, UncertaintyAnnotation

router = APIRouter()
_svc = AgentEcologyService()


@router.post("", response_model=AgentProfile)
async def register_agent(agent: AgentProfile) -> AgentProfile:
    return await _svc.register_agent(agent)


@router.get("/{agent_id}")
async def get_agent(agent_id: str) -> dict[str, Any]:
    result = await _svc.get_agent(agent_id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Agent {agent_id!r} not found")
    return result


@router.get("/{agent_id}/delegations")
async def get_delegations(agent_id: str) -> list[dict[str, Any]]:
    return await _svc.get_delegations(agent_id)


@router.post("/delegations", response_model=Delegation)
async def create_delegation(delegation: Delegation) -> Delegation:
    return await _svc.create_delegation(delegation)


@router.post("/dissent", response_model=DissentRecord)
async def record_dissent(dissent: DissentRecord) -> DissentRecord:
    return await _svc.record_dissent(dissent)


@router.get("/dissent/{target_id}")
async def get_dissents(target_id: str) -> list[dict[str, Any]]:
    return await _svc.get_dissents(target_id)


@router.post("/uncertainty", response_model=UncertaintyAnnotation)
async def annotate_uncertainty(annotation: UncertaintyAnnotation) -> UncertaintyAnnotation:
    return await _svc.annotate_uncertainty(annotation)


@router.get("/uncertainty/{target_id}")
async def get_uncertainties(target_id: str) -> list[dict[str, Any]]:
    return await _svc.get_uncertainties(target_id)


@router.put("/{agent_id}/beliefs")
async def update_beliefs(agent_id: str, beliefs: dict[str, float]) -> dict[str, Any]:
    await _svc.update_beliefs(agent_id, beliefs)
    return {"updated": True, "agent_id": agent_id}


@router.get("/search/semantic")
async def search_agents(
    q: str = Query(..., description="Semantic search query"),
    n: int = Query(default=5, le=20),
) -> list[dict[str, Any]]:
    return await _svc.find_agents_semantic(q, n=n)
