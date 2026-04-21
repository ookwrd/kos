"""Governance routes — permissions, provenance chains, access checks."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from ...governance_graph.service import GovernanceGraphService
from ...models.governance import Permission, ProvenanceRecord, AccessType

router = APIRouter()
_svc = GovernanceGraphService()


@router.post("/permissions", response_model=Permission)
async def grant_permission(permission: Permission) -> Permission:
    return await _svc.grant_permission(permission)


@router.post("/provenance", response_model=ProvenanceRecord)
async def record_provenance(record: ProvenanceRecord) -> ProvenanceRecord:
    return await _svc.record_provenance(record)


@router.get("/provenance/{target_id}")
async def get_provenance_chain(target_id: str) -> list[dict[str, Any]]:
    """Return the full custody chain for a node."""
    return await _svc.get_provenance_chain(target_id)


@router.get("/access")
async def check_access(
    actor_id: str = Query(...),
    target_id: str = Query(...),
    access_type: AccessType = Query(...),
) -> dict[str, Any]:
    """Check whether an actor may perform an action on a target."""
    return await _svc.may_access(actor_id, target_id, access_type)
