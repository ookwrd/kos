"""Shared serialisation helper for Neo4j property maps.

Neo4j properties must be primitives or arrays of primitives — not nested maps.
Any dict value is serialised to a JSON string; lists of dicts likewise.
Datetimes are converted to ISO strings.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any


def neo4j_props(obj: Any) -> dict[str, Any]:
    """Dump a Pydantic model to a dict safe for Neo4j SET a += $props."""
    raw: dict[str, Any] = obj.model_dump() if hasattr(obj, "model_dump") else dict(obj)
    out: dict[str, Any] = {}
    for k, v in raw.items():
        out[k] = _flatten(v)
    return out


def _flatten(v: Any) -> Any:
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float, str)):
        return v
    if isinstance(v, datetime):
        return v.isoformat()
    if isinstance(v, dict):
        # Neo4j can't store maps — serialise to JSON string
        return json.dumps(v)
    if isinstance(v, (list, tuple)):
        items = [_flatten(i) for i in v]
        # If any item is a non-primitive, serialise the whole list as JSON
        if any(isinstance(i, (dict, list)) for i in v):
            return json.dumps(items)
        return items
    # Fallback: str()
    return str(v)
