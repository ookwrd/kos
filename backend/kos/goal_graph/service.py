"""
Goal / agency graph service.

Goals, constraints, and obligations are first-class graph objects here.
The most important query is conflict detection: given a set of active goals,
find pairs that are structurally or semantically in tension.

Design principle: the system never collapses goals to a single scalar.
ConflictPair objects surface tensions explicitly so humans can resolve them.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.serialise import neo4j_props
from ..db.chroma_client import upsert_embedding, query_similar
from ..models.goal import Goal, Constraint, Obligation


_UPSERT_GOAL = "MERGE (g:Goal {id: $id}) SET g += $props RETURN g"
_UPSERT_CONSTRAINT = "MERGE (c:Constraint {id: $id}) SET c += $props RETURN c"
_UPSERT_OBLIGATION = "MERGE (o:Obligation {id: $id}) SET o += $props RETURN o"

_LINK_SUBGOAL = """
MATCH (parent:Goal {id: $parent_id})
MATCH (child:Goal {id: $child_id})
MERGE (parent)-[r:HAS_SUBGOAL]->(child)
SET r.created_at = $created_at
RETURN r
"""

_LINK_GOAL_CONSTRAINT = """
MATCH (g:Goal {id: $goal_id})
MATCH (c:Constraint {id: $constraint_id})
MERGE (c)-[r:CONSTRAINS]->(g)
SET r.created_at = $created_at
RETURN r
"""

# Two goals conflict if they share a Constraint that governs both
# and the constraint type is HARD or DEONTIC, or they target the same metric
# with incompatible directions. This is a structural heuristic — deep semantic
# conflict detection would require an inference engine.
_FIND_CONFLICTS = """
MATCH (g1:Goal), (g2:Goal)
WHERE g1.id IN $goal_ids AND g2.id IN $goal_ids AND g1.id < g2.id
OPTIONAL MATCH (g1)<-[:CONSTRAINS]-(c:Constraint)-[:CONSTRAINS]->(g2)
  WHERE c.constraint_type IN ['hard', 'deontic']
WITH g1, g2, collect(c) AS shared_constraints
WHERE size(shared_constraints) > 0
   OR (g1.metric IS NOT NULL AND g1.metric = g2.metric AND g1.metric_target <> g2.metric_target)
RETURN g1, g2, shared_constraints
"""

_GOAL_HIERARCHY = """
MATCH path = (root:Goal {id: $goal_id})-[:HAS_SUBGOAL*0..5]->(sub:Goal)
RETURN [n IN nodes(path) | {id: n.id, title: n.title, status: n.status, priority: n.priority}] AS hierarchy,
       length(path) AS depth
ORDER BY depth
"""

_ACTIVE_GOALS = """
MATCH (g:Goal)
WHERE g.status = 'active' AND ($domain IS NULL OR g.domain = $domain)
RETURN g ORDER BY g.priority DESC LIMIT $limit
"""


class GoalGraphService:

    async def create_goal(self, goal: Goal) -> Goal:
        props = _ser(goal)
        await run_write(_UPSERT_GOAL, {"id": goal.id, "props": props})
        if goal.parent_goal_id:
            await run_write(_LINK_SUBGOAL, {
                "parent_id": goal.parent_goal_id,
                "child_id": goal.id,
                "created_at": datetime.utcnow().isoformat(),
            })
        await upsert_embedding("goal", goal.id, f"{goal.title} {goal.description}",
                               {"domain": goal.domain or "", "status": goal.status})
        return goal

    async def create_constraint(self, constraint: Constraint) -> Constraint:
        props = _ser(constraint)
        await run_write(_UPSERT_CONSTRAINT, {"id": constraint.id, "props": props})
        for gid in constraint.governed_entity_ids:
            await run_write(_LINK_GOAL_CONSTRAINT, {
                "goal_id": gid,
                "constraint_id": constraint.id,
                "created_at": datetime.utcnow().isoformat(),
            })
        return constraint

    async def create_obligation(self, obligation: Obligation) -> Obligation:
        props = _ser(obligation)
        await run_write(_UPSERT_OBLIGATION, {"id": obligation.id, "props": props})
        return obligation

    async def find_conflicts(self, goal_ids: list[str]) -> list[dict[str, Any]]:
        """
        Return pairs of goals that are structurally in conflict.

        A conflict is detected when:
        1. A hard or deontic constraint governs both goals, or
        2. Two goals share a metric but specify incompatible targets.

        This is a structural heuristic. Semantic conflicts (e.g., "maximise
        profit" vs "minimise environmental impact") require domain-specific
        ontological knowledge and are surfaced separately via semantic search.
        """
        if len(goal_ids) < 2:
            return []
        rows = await run_query(_FIND_CONFLICTS, {"goal_ids": goal_ids})
        return [
            {
                "goal_a": dict(r["g1"]),
                "goal_b": dict(r["g2"]),
                "shared_constraints": [dict(c) for c in r["shared_constraints"] if c],
            }
            for r in rows
        ]

    async def get_hierarchy(self, root_goal_id: str) -> list[dict[str, Any]]:
        rows = await run_query(_GOAL_HIERARCHY, {"goal_id": root_goal_id})
        return [{"hierarchy": r["hierarchy"], "depth": r["depth"]} for r in rows]

    async def list_active(self, domain: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
        rows = await run_query(_ACTIVE_GOALS, {"domain": domain, "limit": limit})
        return [dict(r["g"]) for r in rows]

    async def semantic_search(self, query: str, n: int = 10) -> list[dict[str, Any]]:
        return await query_similar("goal", query, n)


def _ser(obj: Any) -> dict[str, Any]:
    return neo4j_props(obj)
