"""KOS FastAPI application factory."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..db.neo4j_client import ensure_constraints, close_driver, run_query
from .routes import decisions, evidence, knowledge, goals, agents, alignment, inference, openendedness, graph, governance

log = logging.getLogger("kos")


async def _auto_seed() -> None:
    """Seed fixtures if the database is empty."""
    try:
        rows = await run_query("MATCH (n) RETURN count(n) AS c", {})
        if rows and rows[0]["c"] == 0:
            log.info("Empty database — running seed fixtures...")
            from ...db.seed import main as seed_main
            await seed_main()
            log.info("Seed complete.")
    except Exception as exc:
        log.warning(f"Auto-seed skipped: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await ensure_constraints()
    except Exception as e:
        log.warning(f"Could not initialise Neo4j constraints: {e}")

    if os.environ.get("SEED_ON_STARTUP", "").lower() in ("1", "true", "yes"):
        await _auto_seed()

    yield
    await close_driver()


def create_app() -> FastAPI:
    app = FastAPI(
        title="KOS — Knowledge Operating System",
        description=(
            "Multi-layer graph substrate for Artificial Collective Intelligence. "
            "Six layers: Evidence, Context, Knowledge, Goal, Governance, Agent Ecology."
        ),
        version="0.1.0",
        lifespan=lifespan,
    )

    raw_origins = os.environ.get("ALLOWED_ORIGINS", "*")
    origins = [o.strip() for o in raw_origins.split(",")] if raw_origins != "*" else ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(evidence.router, prefix="/api/evidence", tags=["Evidence Graph"])
    app.include_router(decisions.router, prefix="/api/decisions", tags=["Context Graph"])
    app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Graph"])
    app.include_router(goals.router, prefix="/api/goals", tags=["Goal Graph"])
    app.include_router(agents.router, prefix="/api/agents", tags=["Agent Ecology"])
    app.include_router(alignment.router, prefix="/api/alignment", tags=["Alignment"])
    app.include_router(inference.router, prefix="/api/inference", tags=["Collective Inference"])
    app.include_router(openendedness.router, prefix="/api/openendedness", tags=["Open-Endedness"])
    app.include_router(graph.router, prefix="/api/graph", tags=["Graph Overview"])
    app.include_router(governance.router, prefix="/api/governance", tags=["Governance"])

    @app.get("/health", tags=["System"])
    async def health() -> dict:
        return {"status": "ok", "version": "0.1.0"}

    return app
