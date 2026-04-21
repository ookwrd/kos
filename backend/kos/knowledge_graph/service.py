"""
Knowledge / mechanism graph service.

Provides entity CRUD, mechanism path traversal, and hypothesis management.
The mechanism path traversal is the primary inference primitive of this layer:
given two entities, it finds the shortest causal/functional chain connecting
them and returns it as an ordered explanation.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.serialise import neo4j_props
from ..db.chroma_client import upsert_embedding, query_similar
from ..models.knowledge import Entity, Mechanism, Hypothesis


_UPSERT_ENTITY = """
MERGE (e:Entity {id: $id})
SET e += $props
RETURN e
"""

_UPSERT_MECHANISM = """
MERGE (m:Mechanism {id: $id})
SET m += $props
RETURN m
"""

_LINK_MECHANISM = """
MATCH (src:Entity {id: $src_id})
MATCH (tgt:Entity {id: $tgt_id})
MATCH (m:Mechanism {id: $mech_id})
MERGE (src)-[r1:HAS_MECHANISM]->(m)
MERGE (m)-[r2:TARGETS]->(tgt)
SET r1.created_at = $created_at, r2.created_at = $created_at
RETURN m
"""

_UPSERT_HYPOTHESIS = """
MERGE (h:Hypothesis {id: $id})
SET h += $props
RETURN h
"""

# Shortest causal path between two entities through Mechanism nodes
_MECHANISM_PATH = """
MATCH (src:Entity), (tgt:Entity)
WHERE (src.label = $from_label OR src.id = $from_label)
  AND (tgt.label = $to_label  OR tgt.id = $to_label)
  AND src <> tgt
MATCH path = shortestPath((src)-[*1..10]->(tgt))
RETURN [n IN nodes(path) | {id: n.id, label: coalesce(n.label, n.name), type: labels(n)[0]}] AS chain,
       length(path) AS depth
ORDER BY depth ASC
LIMIT 5
"""

_GET_ENTITY = "MATCH (e:Entity {id: $id}) RETURN e"

_ENTITIES_BY_DOMAIN = """
MATCH (e:Entity)
WHERE $domain IS NULL OR e.domain = $domain
RETURN e ORDER BY e.label LIMIT $limit
"""

_HYPOTHESES_BY_DOMAIN = """
MATCH (h:Hypothesis)
WHERE $domain IS NULL OR h.domain = $domain
RETURN h ORDER BY h.prior DESC LIMIT $limit
"""

_HYPOTHESIS_EVIDENCE = """
MATCH (h:Hypothesis {id: $id})
OPTIONAL MATCH (e_for {id: h.evidence_for[0]})
RETURN h, collect(DISTINCT e_for) AS supporting
"""


class KnowledgeGraphService:

    async def create_entity(self, entity: Entity) -> Entity:
        props = _ser(entity)
        await run_write(_UPSERT_ENTITY, {"id": entity.id, "props": props})
        await upsert_embedding("knowledge", entity.id, f"{entity.label} {entity.entity_type} {' '.join(entity.aliases)}",
                               {"domain": entity.domain or "", "type": entity.entity_type})
        return entity

    async def create_mechanism(self, mechanism: Mechanism) -> Mechanism:
        props = _ser(mechanism)
        await run_write(_UPSERT_MECHANISM, {"id": mechanism.id, "props": props})
        await run_write(_LINK_MECHANISM, {
            "src_id": mechanism.source_entity_id,
            "tgt_id": mechanism.target_entity_id,
            "mech_id": mechanism.id,
            "created_at": datetime.utcnow().isoformat(),
        })
        await upsert_embedding("knowledge", mechanism.id, f"{mechanism.name} {mechanism.description}",
                               {"domain": mechanism.domain or "", "type": mechanism.mechanism_type})
        return mechanism

    async def create_hypothesis(self, hypothesis: Hypothesis) -> Hypothesis:
        props = _ser(hypothesis)
        await run_write(_UPSERT_HYPOTHESIS, {"id": hypothesis.id, "props": props})
        await upsert_embedding("knowledge", hypothesis.id, hypothesis.statement,
                               {"domain": hypothesis.domain or "", "status": hypothesis.status})
        return hypothesis

    async def explain_path(self, from_label: str, to_label: str) -> list[dict[str, Any]]:
        """
        Find the shortest causal chain between two entities.

        Returns a list of explanation paths, each as an ordered list of
        {id, label, type} dicts. Empty list means no path found.
        """
        rows = await run_query(_MECHANISM_PATH, {"from_label": from_label, "to_label": to_label})
        return [{"chain": r["chain"], "depth": r["depth"]} for r in rows]

    async def get_entity(self, entity_id: str) -> dict[str, Any] | None:
        rows = await run_query(_GET_ENTITY, {"id": entity_id})
        return dict(rows[0]["e"]) if rows else None

    async def list_entities(self, domain: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        rows = await run_query(_ENTITIES_BY_DOMAIN, {"domain": domain, "limit": limit})
        return [dict(r["e"]) for r in rows]

    async def list_hypotheses(self, domain: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
        rows = await run_query(_HYPOTHESES_BY_DOMAIN, {"domain": domain, "limit": limit})
        return [dict(r["h"]) for r in rows]

    async def semantic_search(self, query: str, n: int = 10) -> list[dict[str, Any]]:
        return await query_similar("knowledge", query, n)


def _ser(obj: Any) -> dict[str, Any]:
    return neo4j_props(obj)
