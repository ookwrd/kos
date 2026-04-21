# KOS — Knowledge Operating System

**A governed, multi-layer, open-ended substrate for Artificial Collective Intelligence.**

KOS turns decision traces, tacit knowledge, mechanistic understanding, and collective agency into durable organisational and scientific intelligence. It goes well beyond GraphRAG, enterprise search, or a plain knowledge graph.

## Six graph layers

| Layer | What it stores | Core question |
|---|---|---|
| Evidence | Documents, sensor windows, tool calls, simulations | What is the raw record? |
| Context | Decision traces, exceptions, precedents, approvals | Why did this happen? |
| Knowledge | Entities, mechanisms, hypotheses, causal structure | What is known and how does it connect? |
| Goal | Goals, constraints, obligations, rights, values | What should be pursued and protected? |
| Governance | Permissions, provenance, roles, review gates | Who may do what, and who is accountable? |
| Agent Ecology | Human experts, AI agents, delegations, dissent | Who knows what, and what do they disagree about? |

## Quick start

### Prerequisites
- Docker + Docker Compose
- Python 3.11+
- Node 20+ or Bun

### Run the backend

```bash
cd backend
cp .env.example .env
docker compose up -d neo4j chromadb
pip install -e ".[dev]"
uvicorn kos.api.app:create_app --factory --reload

# Seed the 3 demo domains
python -m kos.db.seed
```

API docs available at http://localhost:8000/docs

### Run the frontend

```bash
cd frontend
npm install   # or: bun install
npm run dev
```

UI available at http://localhost:5173

## Demo domains

- **Drug discovery** — RAS/MAPK signalling, Sotorasib trial approval, CNS penetration uncertainty
- **Governance** — Board data-sharing decision with GDPR constraints, dissent, and precedent
- **AI hardware** — EUV lithography tacit knowledge, digital twin delegation, cross-domain alignment

## Key interactions

```
# Replay a decision
GET /api/decisions/dec-trial-approval-2024/replay

# Find the causal chain from KRAS to ERK
GET /api/knowledge/path?from=KRAS&to=ERK

# Route an expert for a question
GET /api/inference/route?question=What+is+the+CNS+penetration+of+AMG510

# Find the next most uncertain question
GET /api/inference/next-question?domain=drug_discovery

# Compute ontology alignment
POST /api/alignment/compute?source_domain=drug_discovery&target_domain=ai_hardware

# Scan for graph evolution proposals
POST /api/openendedness/scan

# Detect goal conflicts
GET /api/goals/conflicts?ids=goal-institutional-trust&ids=goal-research-acceleration
```

## Architecture

```
backend/kos/
├── models/          17 Pydantic v2 data models (all 6 layers)
├── db/              Neo4j async driver + ChromaDB client + seed script
├── context_graph/   Write-path, decision replay, precedent search
├── knowledge_graph/ Entity CRUD, mechanism path traversal
├── goal_graph/      Goal hierarchy, conflict detection
├── governance_graph/ Permissions, provenance chains
├── agent_ecology/   Profiles, delegations, dissent, uncertainty
├── alignment/       Partial functor between ontologies
├── collective_inference/  EIG-based expert routing, next-best-question
├── open_endedness/  Novelty scan, GraphChangeProposal lifecycle
└── api/             FastAPI app + 10 route modules + WebSocket

frontend/src/
├── api/client.ts    Typed API client + WebSocket
├── store/           Zustand state (graph, layers, replay, alignment, inference)
├── hooks/           useGraphData, useDecisionReplay
└── components/      GraphCanvas · CityOverview · DecisionReplay
                     ProvenanceInspector · UncertaintyOverlay
                     AgentCouncilView · InferencePanel
                     MechanismPathExplorer · OntologyBridgeView
                     GraphEvolutionTimeline
```

## Documentation

| Doc | Content |
|---|---|
| `docs/concept_v2.md` | KOS thesis and six-layer model |
| `docs/architecture_v2.md` | Stack, data flow, layer interactions |
| `docs/context_graphs.md` | Write-path design, replay algorithm, precedent search |
| `docs/category_theory_alignment.md` | Ologs, functors, sheaf semantics — coded vs. conceptual |
| `docs/active_inference_layer.md` | EIG heuristic, belief representation — coded vs. conceptual |
| `docs/agency_and_goals.md` | Goal plurality, deontic constraints, human agency preservation |
| `docs/open_ended_graphs.md` | Graph ecology metaphor, novelty scan, governed evolution |
| `docs/ontology_v2.md` | Complete node/edge type reference |
| `docs/research_program_v2.md` | 10 open research questions with experimental approaches |
| `docs/evaluation_v2.md` | Per-layer metrics + end-to-end scenario test matrix |
