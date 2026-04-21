"""
Agent ecology service — profiles, delegations, dissent, and uncertainty.

This layer represents the collective of humans, AI agents, tools, and
institutions that participate in KOS workflows. It is the layer where
Artificial Collective Intelligence actually lives: not in any single agent,
but in the structured relationships between agents — who defers to whom,
who disagrees with whom, who can answer what.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.chroma_client import upsert_embedding, query_similar
from ..db.serialise import neo4j_props
from ..models.agents import AgentProfile, Delegation, DissentRecord, UncertaintyAnnotation


_UPSERT_AGENT = "MERGE (a:AgentProfile {id: $id}) SET a += $props RETURN a"
_UPSERT_DELEGATION = "MERGE (d:Delegation {id: $id}) SET d += $props RETURN d"
_UPSERT_DISSENT = "MERGE (d:DissentRecord {id: $id}) SET d += $props RETURN d"
_UPSERT_UNCERTAINTY = "MERGE (u:UncertaintyAnnotation {id: $id}) SET u += $props RETURN u"

_LINK_DELEGATION = """
MATCH (delegator:AgentProfile {id: $delegator_id})
MATCH (delegatee:AgentProfile {id: $delegatee_id})
MATCH (d:Delegation {id: $delegation_id})
MERGE (delegator)-[:DELEGATES_TO {via: $delegation_id}]->(delegatee)
RETURN d
"""

_LINK_DISSENT_TARGET = """
MATCH (dr:DissentRecord {id: $dissent_id})
MATCH (target {id: $target_id})
MERGE (dr)-[:CONTESTS]->(target)
RETURN dr
"""

_LINK_UNCERTAINTY_TARGET = """
MATCH (u:UncertaintyAnnotation {id: $uncertainty_id})
MATCH (target {id: $target_id})
MERGE (u)-[:ANNOTATES]->(target)
RETURN u
"""

_GET_AGENT = "MATCH (a:AgentProfile {id: $id}) RETURN a"

# Find agents whose competences overlap with query terms (simple keyword match)
_AGENTS_BY_COMPETENCE = """
MATCH (a:AgentProfile)
WHERE any(c IN a.competences WHERE toLower(c) CONTAINS toLower($query))
RETURN a
ORDER BY a.calibration_score DESC NULLS LAST
LIMIT $limit
"""

# Uncertainty annotations on a target, sorted by value (highest = most uncertain)
_UNCERTAINTIES_FOR_TARGET = """
MATCH (u:UncertaintyAnnotation)-[:ANNOTATES]->(t {id: $target_id})
RETURN u ORDER BY u.value DESC LIMIT $limit
"""

# Open dissent records on a target
_DISSENTS_FOR_TARGET = """
MATCH (d:DissentRecord)-[:CONTESTS]->(t {id: $target_id})
WHERE d.resolution_status = 'open'
RETURN d ORDER BY d.created_at DESC
"""

# Active delegations from an agent
_DELEGATIONS_FROM = """
MATCH (a:AgentProfile {id: $agent_id})-[:DELEGATES_TO]->(b:AgentProfile)
MATCH (d:Delegation {delegator_id: $agent_id, active: true})
WHERE d.delegatee_id = b.id
RETURN d, b
"""


class AgentEcologyService:

    async def register_agent(self, agent: AgentProfile) -> AgentProfile:
        props = _ser(agent)
        await run_write(_UPSERT_AGENT, {"id": agent.id, "props": props})
        competence_text = " ".join(agent.competences)
        await upsert_embedding("agents", agent.id, f"{agent.name} {competence_text}",
                               {"agent_type": agent.agent_type, "domain": agent.domain or ""})
        return agent

    async def get_agent(self, agent_id: str) -> dict[str, Any] | None:
        rows = await run_query(_GET_AGENT, {"id": agent_id})
        return dict(rows[0]["a"]) if rows else None

    async def create_delegation(self, delegation: Delegation) -> Delegation:
        props = _ser(delegation)
        await run_write(_UPSERT_DELEGATION, {"id": delegation.id, "props": props})
        await run_write(_LINK_DELEGATION, {
            "delegator_id": delegation.delegator_id,
            "delegatee_id": delegation.delegatee_id,
            "delegation_id": delegation.id,
        })
        return delegation

    async def record_dissent(self, dissent: DissentRecord) -> DissentRecord:
        props = _ser(dissent)
        await run_write(_UPSERT_DISSENT, {"id": dissent.id, "props": props})
        await run_write(_LINK_DISSENT_TARGET, {
            "dissent_id": dissent.id,
            "target_id": dissent.target_id,
        })
        return dissent

    async def annotate_uncertainty(self, annotation: UncertaintyAnnotation) -> UncertaintyAnnotation:
        props = _ser(annotation)
        await run_write(_UPSERT_UNCERTAINTY, {"id": annotation.id, "props": props})
        await run_write(_LINK_UNCERTAINTY_TARGET, {
            "uncertainty_id": annotation.id,
            "target_id": annotation.target_id,
        })
        return annotation

    async def find_agents_by_competence(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Keyword search on competence fields."""
        rows = await run_query(_AGENTS_BY_COMPETENCE, {"query": query, "limit": limit})
        return [dict(r["a"]) for r in rows]

    async def find_agents_semantic(self, query: str, n: int = 5) -> list[dict[str, Any]]:
        """Semantic search across agent profiles."""
        return await query_similar("agents", query, n)

    async def get_uncertainties(self, target_id: str, limit: int = 10) -> list[dict[str, Any]]:
        rows = await run_query(_UNCERTAINTIES_FOR_TARGET, {"target_id": target_id, "limit": limit})
        return [dict(r["u"]) for r in rows]

    async def get_dissents(self, target_id: str) -> list[dict[str, Any]]:
        rows = await run_query(_DISSENTS_FOR_TARGET, {"target_id": target_id})
        return [dict(r["d"]) for r in rows]

    async def get_delegations(self, agent_id: str) -> list[dict[str, Any]]:
        rows = await run_query(_DELEGATIONS_FROM, {"agent_id": agent_id})
        return [{"delegation": dict(r["d"]), "delegatee": dict(r["b"])} for r in rows]

    async def update_beliefs(self, agent_id: str, beliefs: dict[str, float]) -> None:
        """
        Update an agent's belief state.

        Beliefs are a flat proposition→probability map. This is intentionally
        shallow: the active inference layer operates on these scalars; a full
        Bayesian brain would require a dedicated inference engine outside the
        graph.
        """
        await run_write(
            "MATCH (a:AgentProfile {id: $id}) SET a.beliefs = $beliefs RETURN a",
            {"id": agent_id, "beliefs": beliefs},
        )


def _ser(obj: Any) -> dict[str, Any]:
    return neo4j_props(obj)
