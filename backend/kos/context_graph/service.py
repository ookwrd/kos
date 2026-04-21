"""
Context graph service — write-path, replay, and precedent retrieval.

This is the most important service in KOS. The context layer is the
"write-path memory" of the organisation: every decision that passes
through a governed workflow is recorded here as a DecisionTrace with
links to the evidence, actors, policies, and precedents that shaped it.

Key design distinctions:
- DecisionTrace ≠ chain-of-thought: traces record real decisions by real
  actors; they are durable institutional records, not ephemeral reasoning.
- Precedent ≠ policy: policies are rules written in advance; precedents are
  patterns inferred from actual decisions after the fact.
- Replay ≠ audit log: replay reconstructs the reasoning path, not just the
  event sequence. It answers "why" not just "what".
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.chroma_client import upsert_embedding, query_similar
from ..db.serialise import neo4j_props
from ..models.context import DecisionTrace, Precedent, DecisionOutcome
from . import cypher as q


def _props(obj: DecisionTrace | Precedent) -> dict[str, Any]:
    return neo4j_props(obj)


class ContextGraphService:
    """All write-path and read-path operations on the context layer."""

    # ── Write path ────────────────────────────────────────────────────────

    async def record_decision(self, decision: DecisionTrace) -> DecisionTrace:
        """
        Persist a decision trace and wire it to its related nodes.

        This is the main write-path entry point. Call this whenever a
        governed decision is made — approval, rejection, escalation, or
        exception.
        """
        props = _props(decision)
        await run_write(q.UPSERT_DECISION, {"id": decision.id, "props": props})

        now = datetime.now(timezone.utc).isoformat()

        # Wire to actor
        if decision.actor_id:
            await run_write(q.LINK_DECISION_ACTOR, {
                "decision_id": decision.id,
                "actor_id": decision.actor_id,
                "created_at": now,
            })

        # Wire to evidence
        for ev_id in decision.evidence_ids:
            await run_write(q.LINK_DECISION_EVIDENCE, {
                "decision_id": decision.id,
                "evidence_id": ev_id,
                "created_at": now,
            })

        # Wire to policies
        for pol_id in decision.policy_ids:
            await run_write(q.LINK_DECISION_POLICY, {
                "decision_id": decision.id,
                "policy_id": pol_id,
                "created_at": now,
            })

        # Wire to precedents that were explicitly invoked
        for prec_id in decision.precedent_ids:
            await run_write(q.LINK_DECISION_PRECEDENT, {
                "decision_id": decision.id,
                "precedent_id": prec_id,
                "created_at": now,
            })

        # Index for semantic search
        search_text = f"{decision.question} {decision.rationale} {decision.outcome}"
        await upsert_embedding(
            layer="context",
            node_id=decision.id,
            text=search_text,
            metadata={
                "domain": decision.domain or "",
                "outcome": decision.outcome,
                "is_exception": str(decision.is_exception),
                "actor_id": decision.actor_id,
            },
        )

        return decision

    async def create_precedent(
        self,
        precedent: Precedent,
        derived_from_decision_id: str | None = None,
    ) -> Precedent:
        """Persist a precedent and optionally link it to its source decision."""
        props = _props(precedent)
        await run_write(q.UPSERT_PRECEDENT, {"id": precedent.id, "props": props})

        if derived_from_decision_id:
            await run_write(q.LINK_PRECEDENT_FROM_DECISION, {
                "decision_id": derived_from_decision_id,
                "precedent_id": precedent.id,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

        await upsert_embedding(
            layer="context",
            node_id=precedent.id,
            text=f"{precedent.statement} {' '.join(precedent.applicability_conditions)}",
            metadata={
                "type": "Precedent",
                "domains": ",".join(precedent.domains),
                "confidence": str(precedent.confidence),
            },
        )

        return precedent

    # ── Replay ────────────────────────────────────────────────────────────

    async def replay_decision(self, decision_id: str) -> dict[str, Any]:
        """
        Reconstruct a decision with its full justification chain.

        Returns a structured replay object with:
        - The decision itself
        - The actor who made it
        - The evidence consulted
        - The policies that governed it
        - The precedents invoked
        - The context path (ancestor decisions that led here)

        This answers: "Why was this decision made?"
        """
        rows = await run_query(q.REPLAY_DECISION, {"decision_id": decision_id})
        if not rows:
            return {}

        row = rows[0]
        decision_node = dict(row["d"])

        # Reconstruct the context path (predecessor decisions)
        path_rows = await run_query(q.REPLAY_CONTEXT_PATH, {"decision_id": decision_id})

        return {
            "decision": decision_node,
            "actors": [dict(a) for a in row["actors"] if a],
            "evidence": [dict(e) for e in row["evidence"] if e],
            "policies": [dict(p) for p in row["policies"] if p],
            "precedents": [dict(p) for p in row["precedents"] if p],
            "context_paths": len(path_rows),
            "replay_steps": _build_replay_steps(decision_node, row),
        }

    # ── Precedent search ─────────────────────────────────────────────────

    async def find_precedents(
        self,
        domain: str | None = None,
        actor_id: str | None = None,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Return relevant precedents, ranked by usage and confidence."""
        if actor_id:
            rows = await run_query(q.FIND_PRECEDENTS_BY_ACTOR, {
                "actor_id": actor_id,
                "limit": limit,
            })
        else:
            rows = await run_query(q.FIND_PRECEDENTS_BY_DOMAIN, {
                "domain": domain,
                "limit": limit,
            })
        return [dict(r["p"]) for r in rows]

    async def find_analogous_by_text(
        self,
        query: str,
        layer: str = "context",
        n: int = 5,
    ) -> list[dict[str, Any]]:
        """Semantic search across decisions and precedents."""
        return await query_similar(layer=layer, query_text=query, n_results=n)

    async def get_exception_history(
        self,
        domain: str | None = None,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Return recent exception decisions — useful for audits and policy refinement."""
        rows = await run_query(q.FIND_EXCEPTIONS, {"domain": domain, "limit": limit})
        return [
            {
                "decision": dict(r["d"]),
                "precedents": [dict(p) for p in r["precedents"] if p],
            }
            for r in rows
        ]

    async def get_precedent_usage(
        self,
        precedent_id: str,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Which decisions have invoked this precedent, and who made them?"""
        rows = await run_query(q.DECISIONS_USING_PRECEDENT, {
            "precedent_id": precedent_id,
            "limit": limit,
        })
        return [{"decision": dict(r["d"]), "actor": dict(r["actor"]) if r["actor"] else None} for r in rows]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_replay_steps(
    decision: dict[str, Any],
    row: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Build an ordered step list for the DecisionReplay UI component.

    Each step has a type, a label, and associated node data. The order
    reflects the logical flow of the decision: context → evidence →
    policy → precedent → outcome.
    """
    steps: list[dict[str, Any]] = []

    steps.append({
        "step": 1,
        "type": "question",
        "label": "Question posed",
        "content": decision.get("question", ""),
    })

    for i, ev in enumerate(row.get("evidence", []) or []):
        if ev:
            steps.append({
                "step": len(steps) + 1,
                "type": "evidence",
                "label": f"Evidence consulted: {dict(ev).get('title', ev.get('id', ''))}",
                "content": dict(ev),
            })

    for pol in row.get("policies", []) or []:
        if pol:
            steps.append({
                "step": len(steps) + 1,
                "type": "policy",
                "label": f"Policy applied: {dict(pol).get('description', dict(pol).get('id', ''))}",
                "content": dict(pol),
            })

    for prec in row.get("precedents", []) or []:
        if prec:
            steps.append({
                "step": len(steps) + 1,
                "type": "precedent",
                "label": f"Precedent invoked: {dict(prec).get('statement', dict(prec).get('id', ''))}",
                "content": dict(prec),
            })

    for actor in row.get("actors", []) or []:
        if actor:
            steps.append({
                "step": len(steps) + 1,
                "type": "actor",
                "label": f"Decided by: {dict(actor).get('name', dict(actor).get('id', ''))}",
                "content": dict(actor),
            })

    steps.append({
        "step": len(steps) + 1,
        "type": "outcome",
        "label": f"Outcome: {decision.get('outcome', 'unknown')}",
        "content": {
            "outcome": decision.get("outcome"),
            "rationale": decision.get("rationale"),
            "is_exception": decision.get("is_exception", False),
        },
    })

    return steps
