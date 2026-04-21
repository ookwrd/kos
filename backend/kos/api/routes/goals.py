"""Goal graph routes — goals, constraints, obligations, conflict detection."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from ...goal_graph.service import GoalGraphService
from ...models.goal import Goal, Constraint, Obligation

router = APIRouter()
_svc = GoalGraphService()


@router.post("", response_model=Goal)
async def create_goal(goal: Goal) -> Goal:
    return await _svc.create_goal(goal)


@router.get("")
async def list_active_goals(
    domain: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
) -> list[dict[str, Any]]:
    return await _svc.list_active(domain=domain, limit=limit)


@router.get("/{goal_id}/hierarchy")
async def get_goal_hierarchy(goal_id: str) -> list[dict[str, Any]]:
    """Return the full subgoal tree rooted at this goal."""
    return await _svc.get_hierarchy(goal_id)


@router.get("/conflicts")
async def find_conflicts(
    ids: list[str] = Query(..., description="List of Goal IDs to check"),
) -> list[dict[str, Any]]:
    """
    Detect structural conflicts between a set of active goals.

    Returns ConflictPair objects where two goals share a hard/deontic
    constraint or target the same metric with incompatible values.
    """
    return await _svc.find_conflicts(ids)


@router.post("/constraints", response_model=Constraint)
async def create_constraint(constraint: Constraint) -> Constraint:
    return await _svc.create_constraint(constraint)


@router.post("/obligations", response_model=Obligation)
async def create_obligation(obligation: Obligation) -> Obligation:
    return await _svc.create_obligation(obligation)
