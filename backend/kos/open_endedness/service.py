"""
Open-endedness service — controlled graph evolution.

This layer makes KOS a living system rather than a static database.
It detects novelty, proposes new structure, and manages a governed
pipeline for applying graph changes.

Key design principle (from ALife):
  Open-endedness ≠ uncontrolled self-modification.
  Every structural change is a GraphChangeProposal that must pass through
  the governance layer before being applied. The system generates variation;
  humans (and governed agents) select.

Ecological metaphor:
  - Sparse neighbourhoods = under-populated niches
  - Cross-domain bridges = inter-specific interactions
  - Motif replication = natural selection of useful patterns
  - Deprecated nodes = extinction of maladaptive structures

What is coded vs. conceptual:
  - CODED: sparse neighbourhood detection, cross-domain bridge proposals,
    high-uncertainty node flagging, proposal persistence, versioned evolution.
  - CONCEPTUAL: full ALife novelty scoring (e.g., novelty search / QD),
    automated motif extraction, graph grammar operators. These require
    dedicated ALife tooling.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from ..db.neo4j_client import run_query, run_write
from ..db.serialise import neo4j_props
from ..models.alignment import GraphChangeProposal, ProposalType, ProposalStatus


_UPSERT_PROPOSAL = "MERGE (p:GraphChangeProposal {id: $id}) SET p += $props RETURN p"

_UPDATE_PROPOSAL_STATUS = """
MATCH (p:GraphChangeProposal {id: $id})
SET p.status = $status, p.review_note = $note, p.updated_at = $updated_at
RETURN p
"""

_PENDING_PROPOSALS = """
MATCH (p:GraphChangeProposal)
WHERE p.status = 'pending' OR p.status = 'under_review'
RETURN p ORDER BY p.novelty_score DESC, p.created_at ASC
LIMIT $limit
"""

# Sparse neighbourhoods: entities with fewer than $threshold mechanisms
_SPARSE_ENTITIES = """
MATCH (e:Entity)
OPTIONAL MATCH (e)-[:HAS_MECHANISM]->(m:Mechanism)
WITH e, count(m) AS mechanism_count
WHERE mechanism_count < $threshold
RETURN e, mechanism_count
ORDER BY mechanism_count ASC
LIMIT $limit
"""

# Entities in different domains that share a mechanism_type but have no bridge
_BRIDGE_CANDIDATES = """
MATCH (e1:Entity)-[:HAS_MECHANISM]->(m1:Mechanism)
MATCH (e2:Entity)-[:HAS_MECHANISM]->(m2:Mechanism)
WHERE e1.domain <> e2.domain
  AND m1.mechanism_type = m2.mechanism_type
  AND NOT (e1)-[:HAS_MECHANISM*1..3]-(e2)
RETURN e1.domain AS domain_a, e2.domain AS domain_b,
       m1.mechanism_type AS shared_type,
       e1.id AS entity_a, e2.id AS entity_b
LIMIT $limit
"""

# Highly uncertain nodes with no recent GraphChangeProposal
_UNCERTAIN_UNPROPOSED = """
MATCH (u:UncertaintyAnnotation)
WHERE u.value > $threshold
  AND NOT EXISTS {
    MATCH (p:GraphChangeProposal)
    WHERE p.target_id = u.target_id AND p.status IN ['pending', 'under_review', 'accepted']
  }
RETURN u
ORDER BY u.value DESC
LIMIT $limit
"""


class OpenEndednessService:

    async def scan_novelty(
        self,
        sparse_threshold: int = 2,
        uncertainty_threshold: float = 0.75,
        limit_per_type: int = 5,
    ) -> list[GraphChangeProposal]:
        """
        Scan the graph and generate proposals for structural evolution.

        Generates three types of proposals:
        1. DENSIFY — for entities in sparse neighbourhoods (few mechanisms)
        2. BRIDGE  — for cross-domain entities sharing mechanism types
        3. NEW_EDGE — for highly uncertain nodes that have no active proposal

        All proposals are persisted and await governance review.
        """
        proposals: list[GraphChangeProposal] = []

        # 1. Densify sparse neighbourhoods
        sparse_rows = await run_query(_SPARSE_ENTITIES, {
            "threshold": sparse_threshold, "limit": limit_per_type
        })
        for r in sparse_rows:
            entity = dict(r["e"])
            mcount = r["mechanism_count"]
            novelty = max(0.3, 1.0 - (mcount / sparse_threshold))
            proposal = GraphChangeProposal(
                proposal_type=ProposalType.DENSIFY,
                rationale=(
                    f"Entity '{entity.get('label', entity['id'])}' has only {mcount} "
                    f"mechanism(s). This neighbourhood is sparse — additional mechanisms "
                    f"or evidence links would increase explanatory coverage."
                ),
                novelty_score=round(novelty, 3),
                affected_node_ids=[entity["id"]],
                change_spec={"entity_id": entity["id"], "mechanism_count": mcount},
                domain=entity.get("domain"),
            )
            proposals.append(proposal)
            await self._persist(proposal)

        # 2. Cross-domain bridge proposals
        bridge_rows = await run_query(_BRIDGE_CANDIDATES, {"limit": limit_per_type})
        seen_pairs: set[frozenset] = set()
        for r in bridge_rows:
            pair = frozenset([r["entity_a"], r["entity_b"]])
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)
            proposal = GraphChangeProposal(
                proposal_type=ProposalType.BRIDGE,
                rationale=(
                    f"Entities in '{r['domain_a']}' and '{r['domain_b']}' share "
                    f"mechanism type '{r['shared_type']}' but have no connecting path. "
                    f"A cross-domain bridge here could generate novel hypotheses."
                ),
                novelty_score=0.8,
                affected_node_ids=[r["entity_a"], r["entity_b"]],
                change_spec={
                    "domain_a": r["domain_a"],
                    "domain_b": r["domain_b"],
                    "shared_mechanism_type": r["shared_type"],
                },
            )
            proposals.append(proposal)
            await self._persist(proposal)

        # 3. High-uncertainty nodes with no active proposal
        uncertain_rows = await run_query(_UNCERTAIN_UNPROPOSED, {
            "threshold": uncertainty_threshold, "limit": limit_per_type
        })
        for r in uncertain_rows:
            ann = dict(r["u"])
            proposal = GraphChangeProposal(
                proposal_type=ProposalType.NEW_EDGE,
                rationale=(
                    f"Node {ann.get('target_id', 'unknown')} has high uncertainty "
                    f"(value={ann.get('value', 0):.2f}) on dimension "
                    f"'{ann.get('dimension', 'unknown')}'. New evidence or expert "
                    f"annotation is needed."
                ),
                novelty_score=float(ann.get("value", 0.5)),
                affected_node_ids=[ann.get("target_id", "")],
                change_spec={"uncertainty_annotation_id": ann.get("id"), "dimension": ann.get("dimension")},
                domain=ann.get("domain"),
            )
            proposals.append(proposal)
            await self._persist(proposal)

        return proposals

    async def get_pending(self, limit: int = 20) -> list[dict[str, Any]]:
        rows = await run_query(_PENDING_PROPOSALS, {"limit": limit})
        return [dict(r["p"]) for r in rows]

    async def review_proposal(
        self,
        proposal_id: str,
        accepted: bool,
        note: str = "",
    ) -> dict[str, Any]:
        """Apply a governance decision to a pending proposal."""
        status = ProposalStatus.ACCEPTED if accepted else ProposalStatus.REJECTED
        rows = await run_write(_UPDATE_PROPOSAL_STATUS, {
            "id": proposal_id,
            "status": status,
            "note": note,
            "updated_at": datetime.utcnow().isoformat(),
        })
        return dict(rows[0]["p"]) if rows else {}

    async def propose_bridge(
        self,
        domain_a: str,
        domain_b: str,
        rationale: str,
        proposed_by: str | None = None,
    ) -> GraphChangeProposal:
        """Manually propose a cross-domain bridge (e.g., from an agent)."""
        proposal = GraphChangeProposal(
            proposal_type=ProposalType.BRIDGE,
            rationale=rationale,
            novelty_score=0.7,
            change_spec={"domain_a": domain_a, "domain_b": domain_b},
            proposed_by=proposed_by,
        )
        await self._persist(proposal)
        return proposal

    async def _persist(self, proposal: GraphChangeProposal) -> None:
        await run_write(_UPSERT_PROPOSAL, {"id": proposal.id, "props": neo4j_props(proposal)})
