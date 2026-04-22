"""
Seed script — loads all fixture files into Neo4j and ChromaDB.

Usage:
  python -m kos.db.seed                  # loads all fixtures
  python -m kos.db.seed drug_discovery   # loads a single fixture
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

from ..models.agents import AgentProfile, Delegation, DissentRecord, UncertaintyAnnotation
from ..models.context import DecisionTrace, Precedent
from ..models.evidence import EvidenceFragment
from ..models.goal import Goal, Constraint
from ..models.governance import ProvenanceRecord
from ..models.knowledge import Entity, Mechanism, Hypothesis, TacitTrace, TacitStep
from ..context_graph.service import ContextGraphService
from ..evidence_graph.service import EvidenceGraphService
from ..knowledge_graph.service import KnowledgeGraphService
from ..goal_graph.service import GoalGraphService
from ..agent_ecology.service import AgentEcologyService
from ..governance_graph.service import GovernanceGraphService
from .neo4j_client import ensure_constraints

FIXTURES_DIR = Path(__file__).parent.parent.parent / "fixtures"


async def seed_fixture(path: Path) -> None:
    data = json.loads(path.read_text())
    domain = data["domain"]
    print(f"  Seeding domain: {domain}")

    ctx_svc = ContextGraphService()
    ev_svc = EvidenceGraphService()
    kg_svc = KnowledgeGraphService()
    goal_svc = GoalGraphService()
    agent_svc = AgentEcologyService()
    gov_svc = GovernanceGraphService()

    # 1. Agents (must be first — other nodes reference them)
    for a in data.get("agents", []):
        await agent_svc.register_agent(AgentProfile(**a))

    # 2. Evidence
    for e in data.get("evidence", []):
        await ev_svc.ingest(EvidenceFragment(**e))

    # 3. Entities + Mechanisms + Hypotheses
    for e in data.get("entities", []):
        await kg_svc.create_entity(Entity(**e))
    for m in data.get("mechanisms", []):
        await kg_svc.create_mechanism(Mechanism(**m))
    for h in data.get("hypotheses", []):
        await kg_svc.create_hypothesis(Hypothesis(**h))

    # 3b. Tacit traces
    for raw in data.get("tacit_traces", []):
        steps_raw = raw.pop("steps", [])
        steps = [TacitStep(**s) for s in steps_raw]
        trace = TacitTrace(steps=steps, **raw)
        await kg_svc.create_tacit_trace(trace)

    # 4. Goals + Constraints
    for g in data.get("goals", []):
        await goal_svc.create_goal(Goal(**g))
    for c in data.get("constraints", []):
        await goal_svc.create_constraint(Constraint(**c))

    # 5. Decisions + Precedents (context layer)
    for p in data.get("precedents", []):
        await ctx_svc.create_precedent(Precedent(**p))
    for d in data.get("decisions", []):
        await ctx_svc.record_decision(DecisionTrace(**d))

    # 6. Delegations
    for d in data.get("delegations", []):
        await agent_svc.create_delegation(Delegation(**d))

    # 7. Uncertainty annotations
    for u in data.get("uncertainty_annotations", []):
        await agent_svc.annotate_uncertainty(UncertaintyAnnotation(**u))

    # 8. Dissent records (last — reference decisions)
    for dr in data.get("dissent_records", []):
        await agent_svc.record_dissent(DissentRecord(**dr))

    # 9. Provenance records (governance layer)
    for pr in data.get("provenance_records", []):
        await gov_svc.record_provenance(ProvenanceRecord(**pr))

    print(f"  ✓ {domain} seeded")


async def main(targets: list[str] | None = None) -> None:
    print("KOS seed: initialising constraints...")
    await ensure_constraints()

    fixtures = list(FIXTURES_DIR.glob("*.json"))
    if targets:
        fixtures = [f for f in fixtures if f.stem in targets]

    if not fixtures:
        print("No fixtures found.")
        return

    for fixture_path in sorted(fixtures):
        await seed_fixture(fixture_path)

    print("Seed complete.")


if __name__ == "__main__":
    targets = sys.argv[1:] or None
    asyncio.run(main(targets))
