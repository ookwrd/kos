"""
Graph overview route + WebSocket for live events.

The /api/graph/overview endpoint returns a multi-layer snapshot of the graph
suitable for the frontend GraphCanvas and CityOverview components.

The WebSocket /api/graph/ws streams graph change events in real time.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from ...db.neo4j_client import run_query

router = APIRouter()

# ── In-memory event bus for WebSocket broadcasting ───────────────────────────
# In production, replace with Redis pub/sub or a message broker.
_subscribers: list[WebSocket] = []


async def broadcast(event: dict[str, Any]) -> None:
    """Broadcast an event to all connected WebSocket clients."""
    dead: list[WebSocket] = []
    for ws in _subscribers:
        try:
            await ws.send_text(json.dumps(event))
        except Exception:
            dead.append(ws)
    for ws in dead:
        _subscribers.remove(ws)


@router.websocket("/ws")
async def graph_websocket(websocket: WebSocket) -> None:
    """
    WebSocket endpoint for live graph events.

    Clients receive events of the form:
      {"type": "node_added"|"node_updated"|"edge_added"|"proposal_created", "data": {...}}

    The client can also send {"type": "ping"} to check connectivity.
    """
    await websocket.accept()
    _subscribers.append(websocket)
    try:
        while True:
            msg = await websocket.receive_text()
            payload = json.loads(msg)
            if payload.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        _subscribers.remove(websocket)


@router.get("/overview")
async def graph_overview(
    domain: str | None = Query(default=None),
    layer: str | None = Query(default=None, description="Filter to a single layer"),
) -> dict[str, Any]:
    """
    Return a multi-layer graph snapshot for the frontend.

    Each layer is returned as {nodes: [...], edges: [...]} with enough
    metadata for Cytoscape.js to render and colour by type.
    """
    domain_filter = "AND n.domain = $domain" if domain else ""
    params: dict[str, Any] = {"domain": domain}

    layers: dict[str, dict] = {}

    if not layer or layer == "evidence":
        rows = await run_query(
            f"MATCH (n:EvidenceFragment) WHERE 1=1 {domain_filter} RETURN n LIMIT 200",
            params,
        )
        layers["evidence"] = {"nodes": [_node(r["n"], "evidence") for r in rows], "edges": []}

    if not layer or layer == "context":
        rows = await run_query(
            f"MATCH (n:DecisionTrace) WHERE 1=1 {domain_filter} RETURN n LIMIT 200",
            params,
        )
        prec_rows = await run_query(
            f"MATCH (n:Precedent) WHERE 1=1 {domain_filter} RETURN n LIMIT 100",
            params,
        )
        edge_rows = await run_query(
            """
            MATCH (d:DecisionTrace)-[r]->(target)
            WHERE type(r) IN ['JUSTIFIED_BY','INVOKED_PRECEDENT','DECIDED_BY','GOVERNED_BY']
            RETURN d.id AS src, target.id AS tgt, type(r) AS rel
            LIMIT 300
            """,
            {},
        )
        layers["context"] = {
            "nodes": [_node(r["n"], "context") for r in rows]
                    + [_node(r["n"], "context", subtype="Precedent") for r in prec_rows],
            "edges": [_edge(r["src"], r["tgt"], r["rel"]) for r in edge_rows],
        }

    if not layer or layer == "knowledge":
        ent_rows = await run_query(
            f"MATCH (n:Entity) WHERE 1=1 {domain_filter} RETURN n LIMIT 200", params
        )
        mech_rows = await run_query(
            f"MATCH (n:Mechanism) WHERE 1=1 {domain_filter} RETURN n LIMIT 200", params
        )
        path_rows = await run_query(
            """
            MATCH (e:Entity)-[:HAS_MECHANISM]->(m:Mechanism)-[:TARGETS]->(e2:Entity)
            RETURN e.id AS src, m.id AS via, e2.id AS tgt
            LIMIT 300
            """,
            {},
        )
        nodes = [_node(r["n"], "knowledge") for r in ent_rows] + [_node(r["n"], "knowledge", subtype="Mechanism") for r in mech_rows]
        edges = []
        for r in path_rows:
            edges.append(_edge(r["src"], r["via"], "HAS_MECHANISM"))
            edges.append(_edge(r["via"], r["tgt"], "TARGETS"))
        layers["knowledge"] = {"nodes": nodes, "edges": edges}

    if not layer or layer == "goal":
        g_rows = await run_query(
            f"MATCH (n:Goal) WHERE 1=1 {domain_filter} RETURN n LIMIT 100", params
        )
        c_rows = await run_query(
            f"MATCH (n:Constraint) WHERE 1=1 {domain_filter} RETURN n LIMIT 100", params
        )
        layers["goal"] = {
            "nodes": [_node(r["n"], "goal") for r in g_rows]
                    + [_node(r["n"], "goal", subtype="Constraint") for r in c_rows],
            "edges": [],
        }

    if not layer or layer == "governance":
        rows = await run_query(
            "MATCH (n:Permission) RETURN n LIMIT 100", {}
        )
        prov_rows = await run_query(
            f"MATCH (n:ProvenanceRecord) WHERE 1=1 {domain_filter} RETURN n LIMIT 100", params
        )
        layers["governance"] = {
            "nodes": [_node(r["n"], "governance") for r in rows]
                    + [_node(r["n"], "governance", subtype="ProvenanceRecord") for r in prov_rows],
            "edges": [],
        }

    if not layer or layer == "agents":
        rows = await run_query(
            f"MATCH (n:AgentProfile) WHERE 1=1 {domain_filter} RETURN n LIMIT 100", params
        )
        deleg_rows = await run_query(
            """
            MATCH (a:AgentProfile)-[:DELEGATES_TO]->(b:AgentProfile)
            RETURN a.id AS src, b.id AS tgt
            LIMIT 200
            """,
            {},
        )
        layers["agents"] = {
            "nodes": [_node(r["n"], "agents") for r in rows],
            "edges": [_edge(r["src"], r["tgt"], "DELEGATES_TO") for r in deleg_rows],
        }

    total_nodes = sum(len(v["nodes"]) for v in layers.values())
    total_edges = sum(len(v["edges"]) for v in layers.values())

    return {
        "layers": layers,
        "summary": {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "domain": domain,
            "layer_filter": layer,
        },
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _node(neo4j_node: Any, layer: str, subtype: str | None = None) -> dict[str, Any]:
    data = dict(neo4j_node)
    return {
        "id": data.get("id", ""),
        "label": data.get("label") or data.get("name") or data.get("title") or data.get("id", ""),
        "layer": layer,
        "type": subtype or layer,
        "data": data,
    }


def _edge(src: str, tgt: str, rel: str) -> dict[str, Any]:
    return {"source": src, "target": tgt, "relation": rel}
