"""
Collective inference service — active-inference-inspired expert routing.

Active inference framing (conceptual layer):
  In formal active inference (Friston et al.), an agent maintains a
  generative model and selects actions that minimise expected free energy
  (EFE = epistemic value + pragmatic value). KOS does not implement a full
  variational Bayes engine — that is flagged as future work in
  docs/active_inference_layer.md. Instead, this service implements a
  credible approximation:

  - Epistemic value  ≈ expected information gain (EIG) from consulting
    a given agent, estimated as: agent calibration × agent competence
    overlap × target uncertainty
  - Pragmatic value  ≈ how strongly the agent's preferred outcomes
    align with active goals
  - Next-best-question ≈ the UncertaintyAnnotation with the highest
    value on goal-relevant nodes

What is actually coded vs. conceptual:
  - CODED: EIG heuristic, expert ranking, next-best-question selection,
    belief aggregation across agents, dissent detection.
  - CONCEPTUAL: full variational free energy minimisation, predictive
    coding across agent layers. These require dedicated AIF libraries.
"""

from __future__ import annotations

import json
from typing import Any

from ..db.neo4j_client import run_query
from ..db.chroma_client import query_similar


_AGENTS_WITH_CALIBRATION = """
MATCH (a:AgentProfile)
WHERE a.calibration_score IS NOT NULL
RETURN a
ORDER BY a.calibration_score DESC
"""

_UNCERTAINTIES_BY_GOAL = """
MATCH (g:Goal {id: $goal_id})<-[:CONSTRAINS|SUPPORTS|GOVERNS*0..2]-(related)
MATCH (u:UncertaintyAnnotation)-[:ANNOTATES]->(related)
RETURN u ORDER BY u.value DESC LIMIT $limit
"""

_HIGH_UNCERTAINTY_NODES = """
MATCH (u:UncertaintyAnnotation)
WHERE ($domain IS NULL OR u.domain = $domain)
RETURN u, u.target_id AS target_id
ORDER BY u.value DESC
LIMIT $limit
"""

_AGENT_BELIEFS = """
MATCH (a:AgentProfile)
WHERE a.id IN $agent_ids
RETURN a.id AS id, a.name AS name, a.beliefs AS beliefs
"""

_OPEN_DISSENTS = """
MATCH (d:DissentRecord)
WHERE d.resolution_status = 'open'
  AND ($domain IS NULL OR d.domain = $domain)
RETURN d ORDER BY d.created_at DESC LIMIT $limit
"""


class CollectiveInferenceService:
    """
    Coordinates expert routing and next-best-question selection.

    This is where multi-agent reasoning becomes ACI: instead of routing to
    the first available agent, we route to the agent whose consultation would
    most reduce uncertainty about goal-relevant propositions.
    """

    async def route_expert(
        self,
        question: str,
        goal_id: str | None = None,
        domain: str | None = None,
        uncertainty_threshold: float = 0.6,
        top_k: int = 3,
    ) -> list[dict[str, Any]]:
        """
        Recommend the top-k agents to consult for a given question.

        Ranking: score(a) = calibration(a) × competence_sim(a, question)
        Domain-gated: when domain is provided, restrict to agents in that domain
        before falling back to global search. This prevents cross-domain routing
        (e.g. a hardware engineer being recommended for a pharmacology question).
        """
        where_filter = {"domain": {"$eq": domain}} if domain else None
        similar_agents = await query_similar("agents", question, n_results=top_k * 3, where=where_filter)

        # Domain-filtered search returned nothing — widen to global but note mismatch
        cross_domain = False
        if not similar_agents and domain:
            similar_agents = await query_similar("agents", question, n_results=top_k * 3)
            cross_domain = True

        if not similar_agents:
            return []

        agent_ids = [a["id"] for a in similar_agents]

        # Fetch full agent records
        rows = await run_query(
            "MATCH (a:AgentProfile) WHERE a.id IN $ids RETURN a",
            {"ids": agent_ids},
        )
        agents = [dict(r["a"]) for r in rows]

        # Score each agent
        scored = []
        for agent_data in agents:
            calibration = float(agent_data.get("calibration_score") or 0.5)

            # Cosine distance from Chroma is in [0, 2]; convert to similarity [0, 1]
            sim_entry = next((x for x in similar_agents if x["id"] == agent_data["id"]), None)
            competence_sim = 1.0 - (float(sim_entry["distance"]) / 2.0) if sim_entry else 0.3

            # Uncertainty proxy: how often has this agent annotated uncertain nodes?
            # Use calibration × competence as a stand-in when no annotation data
            eig_score = calibration * competence_sim

            # Dissent bonus
            dissent_rows = await run_query(
                "MATCH (d:DissentRecord {actor_id: $id}) RETURN count(d) AS n",
                {"id": agent_data["id"]},
            )
            n_dissents = dissent_rows[0]["n"] if dissent_rows else 0
            if n_dissents > 0:
                eig_score = min(1.0, eig_score + 0.1)

            scored.append({
                "agent": agent_data,
                "eig_score": round(eig_score, 4),
                "calibration": calibration,
                "competence_similarity": round(competence_sim, 4),
                "n_dissents": n_dissents,
                "routing_reason": _routing_reason(calibration, competence_sim, n_dissents, cross_domain),
            })

        scored.sort(key=lambda x: x["eig_score"], reverse=True)
        return scored[:top_k]

    async def next_best_question(
        self,
        goal_id: str | None = None,
        domain: str | None = None,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """
        Identify the nodes with the highest uncertainty relevant to a goal.

        Returns UncertaintyAnnotation nodes ranked by value. Each entry
        is a candidate for the 'next question to resolve' in a directed
        inquiry process.

        Epistemic vs. pragmatic split:
        - Epistemic value: high-uncertainty nodes (resolving them would most
          reduce surprise / free energy)
        - Pragmatic value: nodes linked to active high-priority goals
        The combined score gives pragmatically relevant epistemic questions.
        """
        if goal_id:
            rows = await run_query(_UNCERTAINTIES_BY_GOAL, {"goal_id": goal_id, "limit": limit})
            annotations = [dict(r["u"]) for r in rows]
        else:
            rows = await run_query(_HIGH_UNCERTAINTY_NODES, {"domain": domain, "limit": limit})
            annotations = [dict(r["u"]) for r in rows]

        return [
            {
                "annotation": ann,
                "suggested_question": f"What is the evidence for '{ann.get('dimension', 'this')}' on node {ann.get('target_id', '')}?",
                "uncertainty_value": ann.get("value", 0.0),
                "epistemic_priority": "high" if float(ann.get("value", 0)) > 0.7 else "medium",
            }
            for ann in annotations
        ]

    async def aggregate_beliefs(
        self,
        agent_ids: list[str],
        proposition: str,
    ) -> dict[str, Any]:
        """
        Aggregate beliefs about a proposition across multiple agents.

        Returns mean, variance, min, max, and a list of individual estimates.
        Agents that have not expressed a belief on this proposition are
        excluded (not treated as uncertain — absence of belief ≠ uncertainty).
        """
        rows = await run_query(_AGENT_BELIEFS, {"agent_ids": agent_ids})

        estimates = []
        for r in rows:
            raw = r["beliefs"] or {}
            if isinstance(raw, str):
                try:
                    beliefs: dict[str, float] = json.loads(raw)
                except (json.JSONDecodeError, ValueError):
                    beliefs = {}
            else:
                beliefs = raw
            if proposition in beliefs:
                estimates.append({
                    "agent_id": r["id"],
                    "agent_name": r["name"],
                    "estimate": beliefs[proposition],
                })

        if not estimates:
            return {"proposition": proposition, "n_agents": 0, "estimates": []}

        values = [e["estimate"] for e in estimates]
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)

        return {
            "proposition": proposition,
            "n_agents": len(estimates),
            "mean": round(mean, 4),
            "variance": round(variance, 4),
            "min": min(values),
            "max": max(values),
            "range": round(max(values) - min(values), 4),
            "consensus": "high" if variance < 0.05 else "low" if variance > 0.2 else "medium",
            "estimates": estimates,
        }

    async def get_open_dissents(
        self,
        domain: str | None = None,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Return unresolved disagreements — the epistemic pressure points of the system."""
        rows = await run_query(_OPEN_DISSENTS, {"domain": domain, "limit": limit})
        return [dict(r["d"]) for r in rows]


def _routing_reason(calibration: float, competence_sim: float, n_dissents: int, cross_domain: bool = False) -> str:
    parts = []
    if cross_domain:
        parts.append("⚠ cross-domain fallback")
    if calibration >= 0.8:
        parts.append("highly calibrated")
    if competence_sim >= 0.7:
        parts.append("strong competence match")
    if n_dissents > 0:
        parts.append(f"has recorded {n_dissents} relevant dissent(s)")
    return "; ".join(parts) if parts else "moderate competence overlap"
