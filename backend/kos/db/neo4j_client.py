"""Neo4j driver and session management for KOS."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession


_driver: AsyncDriver | None = None


def _get_config() -> tuple[str, str, str]:
    uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
    user = os.environ.get("NEO4J_USER", "neo4j")
    password = os.environ.get("NEO4J_PASSWORD", "kospassword")
    return uri, user, password


async def get_driver() -> AsyncDriver:
    global _driver
    if _driver is None:
        uri, user, password = _get_config()
        _driver = AsyncGraphDatabase.driver(uri, auth=(user, password))
    return _driver


async def close_driver() -> None:
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None


@asynccontextmanager
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    driver = await get_driver()
    async with driver.session() as session:
        yield session


async def run_query(
    cypher: str,
    parameters: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Execute a Cypher query and return all records as dicts."""
    async with get_session() as session:
        result = await session.run(cypher, parameters or {})
        records = await result.data()
        return records


async def run_write(
    cypher: str,
    parameters: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Execute a write Cypher query inside an explicit write transaction."""
    async with get_session() as session:
        async def _tx(tx):
            result = await tx.run(cypher, parameters or {})
            return await result.data()

        records: list[dict[str, Any]] = await session.execute_write(_tx)
        return records


async def ensure_constraints() -> None:
    """
    Create uniqueness constraints and indexes for all KOS node types.
    Safe to call on startup — Neo4j ignores constraints that already exist.
    """
    constraints = [
        "CREATE CONSTRAINT kos_evidence_id IF NOT EXISTS FOR (n:EvidenceFragment) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_decision_id IF NOT EXISTS FOR (n:DecisionTrace) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_precedent_id IF NOT EXISTS FOR (n:Precedent) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_entity_id IF NOT EXISTS FOR (n:Entity) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_mechanism_id IF NOT EXISTS FOR (n:Mechanism) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_hypothesis_id IF NOT EXISTS FOR (n:Hypothesis) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_goal_id IF NOT EXISTS FOR (n:Goal) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_constraint_id IF NOT EXISTS FOR (n:Constraint) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_obligation_id IF NOT EXISTS FOR (n:Obligation) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_permission_id IF NOT EXISTS FOR (n:Permission) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_provenance_id IF NOT EXISTS FOR (n:ProvenanceRecord) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_agent_id IF NOT EXISTS FOR (n:AgentProfile) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_delegation_id IF NOT EXISTS FOR (n:Delegation) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_dissent_id IF NOT EXISTS FOR (n:DissentRecord) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_uncertainty_id IF NOT EXISTS FOR (n:UncertaintyAnnotation) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_alignment_id IF NOT EXISTS FOR (n:AlignmentMap) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT kos_proposal_id IF NOT EXISTS FOR (n:GraphChangeProposal) REQUIRE n.id IS UNIQUE",
    ]
    indexes = [
        "CREATE INDEX kos_decision_domain IF NOT EXISTS FOR (n:DecisionTrace) ON (n.domain)",
        "CREATE INDEX kos_entity_type IF NOT EXISTS FOR (n:Entity) ON (n.entity_type)",
        "CREATE INDEX kos_entity_domain IF NOT EXISTS FOR (n:Entity) ON (n.domain)",
        "CREATE INDEX kos_mechanism_type IF NOT EXISTS FOR (n:Mechanism) ON (n.mechanism_type)",
        "CREATE INDEX kos_goal_status IF NOT EXISTS FOR (n:Goal) ON (n.status)",
        "CREATE INDEX kos_agent_type IF NOT EXISTS FOR (n:AgentProfile) ON (n.agent_type)",
        "CREATE INDEX kos_proposal_status IF NOT EXISTS FOR (n:GraphChangeProposal) ON (n.status)",
    ]
    async with get_session() as session:
        for stmt in constraints + indexes:
            await session.run(stmt)
