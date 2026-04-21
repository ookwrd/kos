"""Governance graph service — permissions, provenance, and access control."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.serialise import neo4j_props
from ..models.governance import Permission, ProvenanceRecord, AccessType, ProvenanceAction


_UPSERT_PERMISSION = "MERGE (p:Permission {id: $id}) SET p += $props RETURN p"
_UPSERT_PROVENANCE = "MERGE (p:ProvenanceRecord {id: $id}) SET p += $props RETURN p"

_LINK_PERMISSION_ACTOR = """
MATCH (p:Permission {id: $perm_id})
MATCH (a:AgentProfile {id: $actor_id})
MERGE (p)-[:GRANTS_TO]->(a)
RETURN p
"""

_LINK_PROVENANCE_SOURCE = """
MATCH (pr:ProvenanceRecord {id: $prov_id})
MATCH (src {id: $source_id})
MERGE (pr)-[:RECORDS_ACTION_ON]->(src)
RETURN pr
"""

_CHECK_PERMISSION = """
MATCH (a:AgentProfile {id: $actor_id})<-[:GRANTS_TO]-(p:Permission)
WHERE p.target_id = $target_id
  AND p.access_type = $access_type
  AND (p.expiry IS NULL OR p.expiry > $now)
RETURN p
LIMIT 1
"""

_REQUIRED_REVIEWS = """
MATCH (a:AgentProfile {id: $actor_id})<-[:GRANTS_TO]-(p:Permission)
WHERE p.target_id = $target_id
  AND p.access_type = $access_type
  AND p.requires_review = true
RETURN p
"""

_PROVENANCE_CHAIN = """
MATCH (pr:ProvenanceRecord)-[:RECORDS_ACTION_ON]->(target {id: $target_id})
RETURN pr { .id, .actor_id, .action, .timestamp, .data_hash, .source_id, .downstream_ids } AS record
ORDER BY pr.timestamp ASC
LIMIT 20
"""


class GovernanceGraphService:

    async def grant_permission(self, permission: Permission) -> Permission:
        props = _ser(permission)
        await run_write(_UPSERT_PERMISSION, {"id": permission.id, "props": props})
        await run_write(_LINK_PERMISSION_ACTOR, {
            "perm_id": permission.id,
            "actor_id": permission.actor_id,
        })
        return permission

    async def record_provenance(
        self,
        record: ProvenanceRecord,
        target_node_data: dict[str, Any] | None = None,
    ) -> ProvenanceRecord:
        """
        Record a provenance event and compute a content hash.

        The data_hash field is set here (not by the caller) to ensure it
        reflects the actual node state at record time.
        """
        if target_node_data and not record.data_hash:
            canonical = json.dumps(target_node_data, sort_keys=True, default=str)
            record = record.model_copy(update={"data_hash": hashlib.sha256(canonical.encode()).hexdigest()})

        props = _ser(record)
        await run_write(_UPSERT_PROVENANCE, {"id": record.id, "props": props})
        await run_write(_LINK_PROVENANCE_SOURCE, {
            "prov_id": record.id,
            "source_id": record.source_id,
        })
        return record

    async def may_access(
        self,
        actor_id: str,
        target_id: str,
        access_type: AccessType,
    ) -> dict[str, Any]:
        """
        Check whether an actor has permission to perform an action on a target.

        Returns a dict with:
        - allowed: bool
        - requires_review: bool — if True, a human reviewer must confirm
        - permissions: list of matching Permission nodes
        """
        now = datetime.now(timezone.utc).isoformat()
        rows = await run_query(_CHECK_PERMISSION, {
            "actor_id": actor_id,
            "target_id": target_id,
            "access_type": access_type,
            "now": now,
        })
        if not rows:
            return {"allowed": False, "requires_review": False, "permissions": []}

        review_rows = await run_query(_REQUIRED_REVIEWS, {
            "actor_id": actor_id,
            "target_id": target_id,
            "access_type": access_type,
        })
        return {
            "allowed": True,
            "requires_review": len(review_rows) > 0,
            "permissions": [dict(r["p"]) for r in rows],
        }

    async def get_provenance_chain(self, target_id: str) -> list[dict[str, Any]]:
        """Return the full custody chain for a node."""
        rows = await run_query(_PROVENANCE_CHAIN, {"target_id": target_id})
        return [dict(r["record"]) for r in rows]


def _ser(obj: Any) -> dict[str, Any]:
    return neo4j_props(obj)
