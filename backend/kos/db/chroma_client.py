"""ChromaDB client for KOS vector collections (semantic search sidecar).

Uses an embedded persistent client by default (no separate server needed).
Set CHROMA_MODE=http + CHROMA_HOST/PORT to use an HTTP server instead.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import chromadb


COLLECTIONS = {
    "evidence":   "kos_evidence",
    "context":    "kos_context",
    "knowledge":  "kos_knowledge",
    "goal":       "kos_goal",
    "governance": "kos_governance",
    "agents":     "kos_agents",
}

_client: Any | None = None
_collections: dict[str, Any] = {}


async def get_client() -> Any:
    global _client
    if _client is not None:
        return _client

    mode = os.environ.get("CHROMA_MODE", "embedded")
    if mode == "http":
        host = os.environ.get("CHROMA_HOST", "localhost")
        port = int(os.environ.get("CHROMA_PORT", "8001"))
        _client = await chromadb.AsyncHttpClient(host=host, port=port)
    else:
        # Embedded persistent client — data stored in ./chroma_data/
        data_dir = os.environ.get("CHROMA_DATA_DIR", str(Path(__file__).parent.parent.parent / "chroma_data"))
        _client = chromadb.PersistentClient(path=data_dir)
    return _client


async def get_collection(layer: str) -> Any:
    if layer not in COLLECTIONS:
        raise ValueError(f"Unknown layer: {layer}. Must be one of {list(COLLECTIONS)}")
    if layer not in _collections:
        client = await get_client()
        if hasattr(client, "get_or_create_collection"):
            # Both sync PersistentClient and async HttpClient expose this
            result = client.get_or_create_collection(
                name=COLLECTIONS[layer],
                metadata={"hnsw:space": "cosine"},
            )
            # Await if it's a coroutine (async http client)
            if hasattr(result, "__await__"):
                result = await result
            _collections[layer] = result
        else:
            _collections[layer] = client.get_or_create_collection(COLLECTIONS[layer])
    return _collections[layer]


async def upsert_embedding(
    layer: str,
    node_id: str,
    text: str,
    metadata: dict[str, Any] | None = None,
    embedding: list[float] | None = None,
) -> None:
    collection = await get_collection(layer)
    kwargs: dict[str, Any] = {
        "ids": [node_id],
        "documents": [text],
        "metadatas": [metadata or {}],
    }
    if embedding is not None:
        kwargs["embeddings"] = [embedding]
    result = collection.upsert(**kwargs)
    if hasattr(result, "__await__"):
        await result


async def query_similar(
    layer: str,
    query_text: str,
    n_results: int = 10,
    where: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    collection = await get_collection(layer)
    kwargs: dict[str, Any] = {
        "query_texts": [query_text],
        "n_results": n_results,
        "include": ["documents", "metadatas", "distances"],
    }
    if where:
        kwargs["where"] = where
    result = collection.query(**kwargs)
    if hasattr(result, "__await__"):
        result = await result
    out = []
    ids   = result["ids"][0]
    docs  = result["documents"][0]
    metas = result["metadatas"][0]
    dists = result["distances"][0]
    for nid, doc, meta, dist in zip(ids, docs, metas, dists):
        out.append({"id": nid, "text": doc, "metadata": meta, "distance": dist})
    return out


async def delete_node(layer: str, node_id: str) -> None:
    collection = await get_collection(layer)
    result = collection.delete(ids=[node_id])
    if hasattr(result, "__await__"):
        await result
