"""Collective inference routes — expert routing, next-best-question, belief aggregation."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Query

from ...collective_inference.service import CollectiveInferenceService

router = APIRouter()
_svc = CollectiveInferenceService()


@router.get("/route")
async def route_expert(
    question: str = Query(..., description="Question or topic to route"),
    goal_id: str | None = Query(default=None),
    domain: str | None = Query(default=None, description="Restrict routing to agents in this domain"),
    uncertainty_threshold: float = Query(default=0.6, ge=0.0, le=1.0),
    top_k: int = Query(default=3, le=10),
) -> list[dict[str, Any]]:
    """
    Recommend the top-k agents to consult for a question.

    When `domain` is specified, routing is restricted to agents in that domain
    first, falling back to global search only if no domain-match exists.
    """
    return await _svc.route_expert(
        question=question,
        goal_id=goal_id,
        domain=domain,
        uncertainty_threshold=uncertainty_threshold,
        top_k=top_k,
    )


@router.get("/next-question")
async def next_best_question(
    goal_id: str | None = Query(default=None),
    domain: str | None = Query(default=None),
    limit: int = Query(default=5, le=20),
) -> list[dict[str, Any]]:
    """
    Return the questions that would most reduce uncertainty about a goal.

    Each result includes:
    - annotation: the UncertaintyAnnotation driving this question
    - suggested_question: a natural-language question to ask
    - uncertainty_value: severity (0–1)
    - epistemic_priority: high / medium

    Answers: "Which assumption is most uncertain?"
    """
    return await _svc.next_best_question(goal_id=goal_id, domain=domain, limit=limit)


@router.post("/beliefs/aggregate")
async def aggregate_beliefs(
    agent_ids: list[str],
    proposition: str = Query(...),
) -> dict[str, Any]:
    """
    Aggregate belief estimates across agents for a proposition.

    Returns mean, variance, consensus level, and per-agent breakdowns.
    """
    return await _svc.aggregate_beliefs(agent_ids, proposition)


@router.get("/dissents")
async def open_dissents(
    domain: str | None = Query(default=None),
    limit: int = Query(default=20, le=100),
) -> list[dict[str, Any]]:
    """Return unresolved dissent records — the epistemic pressure points."""
    return await _svc.get_open_dissents(domain=domain, limit=limit)
