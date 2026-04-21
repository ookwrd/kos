"""Evidence graph service — ingest and query EvidenceFragment nodes."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.chroma_client import upsert_embedding, query_similar
from ..db.serialise import neo4j_props
from ..models.evidence import EvidenceFragment


_UPSERT = """
MERGE (e:EvidenceFragment {id: $id})
SET e += $props
RETURN e
"""

_LINK_VALIDATOR = """
MATCH (e:EvidenceFragment {id: $evidence_id})
MATCH (a:AgentProfile {id: $agent_id})
MERGE (e)-[r:VALIDATED_BY]->(a)
SET r.created_at = $created_at
RETURN r
"""

_GET_BY_ID = "MATCH (e:EvidenceFragment {id: $id}) RETURN e"

_SEARCH_BY_DOMAIN = """
MATCH (e:EvidenceFragment)
WHERE $domain IS NULL OR e.domain = $domain
RETURN e
ORDER BY e.created_at DESC
LIMIT $limit
"""


class EvidenceGraphService:

    async def ingest(self, fragment: EvidenceFragment) -> EvidenceFragment:
        props = _serialise(fragment)
        await run_write(_UPSERT, {"id": fragment.id, "props": props})

        now = datetime.now(timezone.utc).isoformat()
        for agent_id in fragment.validated_by:
            await run_write(_LINK_VALIDATOR, {
                "evidence_id": fragment.id,
                "agent_id": agent_id,
                "created_at": now,
            })

        await upsert_embedding(
            layer="evidence",
            node_id=fragment.id,
            text=f"{fragment.title} {fragment.content_ref}",
            metadata={"domain": fragment.domain or "", "source_type": fragment.source_type},
        )
        return fragment

    async def get(self, fragment_id: str) -> dict[str, Any] | None:
        rows = await run_query(_GET_BY_ID, {"id": fragment_id})
        return dict(rows[0]["e"]) if rows else None

    async def search(self, domain: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
        rows = await run_query(_SEARCH_BY_DOMAIN, {"domain": domain, "limit": limit})
        return [dict(r["e"]) for r in rows]

    async def semantic_search(self, query: str, n: int = 10) -> list[dict[str, Any]]:
        return await query_similar("evidence", query, n)


def _serialise(obj: Any) -> dict[str, Any]:
    return neo4j_props(obj)
