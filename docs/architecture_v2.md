# KOS Architecture v2

## Stack overview

```
┌─────────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite)        │
│  Cytoscape.js · Three.js · Zustand · Tailwind│
└──────────────────┬──────────────────────────┘
                   │ REST + WebSocket
┌──────────────────▼──────────────────────────┐
│  FastAPI application (Python 3.11)           │
│  /api/decisions · /api/knowledge · /api/goals│
│  /api/agents · /api/alignment                │
│  /api/inference · /api/openendedness         │
│  /api/graph (overview + WebSocket)           │
└──────┬────────────────────┬─────────────────┘
       │                    │
┌──────▼──────┐    ┌────────▼────────┐
│  Neo4j 5    │    │  ChromaDB       │
│  (property  │    │  (vector store) │
│   graph)    │    │  6 collections  │
└─────────────┘    └─────────────────┘
```

## Why Neo4j

The six KOS layers are fundamentally relational and path-dependent. Questions like "what evidence chain supports this mechanism?" or "who approved this decision, through which precedent?" are shortest-path or sub-graph queries — they are natural Cypher and painful SQL. Neo4j 5 with APOC gives:
- Native graph storage with ACID transactions
- Cypher shortestPath and pattern matching
- Index-backed property lookups
- Schema-optional (flexible for evolving node types)

## Why ChromaDB

Vector similarity is a secondary but important query mode for KOS:
- "Find decisions analogous to this one" requires semantic search, not just domain filters
- Expert routing requires embedding-based competence matching
- Cross-domain bridge proposals benefit from cross-layer similarity

One Chroma collection per layer keeps semantic spaces separated. Cross-layer queries are explicit API calls, not accidental similarity.

## Data flow: write path (decision trace)

```
Actor makes decision
        │
        ▼
POST /api/decisions
        │
        ▼
DecisionTrace model validated (Pydantic v2)
        │
  ┌─────┴──────────────────────────────┐
  │                                    │
  ▼                                    ▼
Neo4j MERGE (DecisionTrace)     Chroma upsert
+ LINK edges to:                (layer: context)
  - ActorProfile
  - EvidenceFragment
  - Constraint/Obligation
  - Precedent (if invoked)
        │
        ▼
WebSocket broadcast: {type: "node_added", layer: "context"}
```

## Data flow: replay query

```
GET /api/decisions/{id}/replay
        │
        ▼
Cypher: MATCH (d:DecisionTrace {id})
        OPTIONAL MATCH (d)-[:DECIDED_BY]->(actor)
        OPTIONAL MATCH (d)-[:JUSTIFIED_BY]->(evidence)
        OPTIONAL MATCH (d)-[:GOVERNED_BY]->(policy)
        OPTIONAL MATCH (d)-[:INVOKED_PRECEDENT]->(precedent)
        │
        ▼
_build_replay_steps() → ordered list:
  [question, evidence×n, policy×n, precedent×n, actor, outcome]
        │
        ▼
Response: {decision, actors, evidence, policies, precedents, replay_steps}
```

## Service layer

Each graph layer has its own `service.py` with a typed service class. Services are stateless (all state in Neo4j/Chroma). They are instantiated per-request (no singleton required — the DB clients are module-level singletons).

```
kos/
├── context_graph/service.py    ContextGraphService
├── evidence_graph/service.py   EvidenceGraphService
├── knowledge_graph/service.py  KnowledgeGraphService
├── goal_graph/service.py       GoalGraphService
├── governance_graph/service.py GovernanceGraphService
├── agent_ecology/service.py    AgentEcologyService
├── alignment/service.py        AlignmentService
├── collective_inference/service.py  CollectiveInferenceService
└── open_endedness/service.py   OpenEndednessService
```

## Layer interaction patterns

**Context ↔ Evidence:** DecisionTrace nodes carry `evidence_ids` and are linked by `JUSTIFIED_BY` edges. Replay traverses these edges.

**Context ↔ Governance:** DecisionTrace nodes are linked to Constraint/Permission nodes by `GOVERNED_BY`. Provenance records are written for every governance action.

**Knowledge ↔ Evidence:** Mechanism nodes carry `evidence_ids`. Hypothesis confidence is updated as new EvidenceFragments are linked.

**Goal ↔ Knowledge:** Goal nodes reference mechanism paths that they depend on (via metadata). Conflict detection checks constraints that govern both.

**Agent Ecology ↔ All layers:** AgentProfile nodes annotate UncertaintyAnnotation and DissentRecord nodes across all layers. The collective inference layer reads these to compute EIG for expert routing.

**Open-Endedness ↔ All layers:** GraphChangeProposal nodes reference affected nodes across any layer. The governance layer reviews proposals before they are applied.

## Schema evolution

Neo4j's schema-optional property graph means new node properties can be added without migrations. The constraint and index definitions in `ensure_constraints()` are idempotent — safe to call on every startup.

Pydantic v2 models are the authoritative schema. When a model gains a new field, the field must have a default value (so existing Neo4j nodes remain valid on read).

## Configuration

All configuration via environment variables (12-factor):

| Variable | Default | Purpose |
|---|---|---|
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j connection |
| `NEO4J_USER` | `neo4j` | Neo4j auth |
| `NEO4J_PASSWORD` | `kospassword` | Neo4j auth |
| `CHROMA_HOST` | `localhost` | ChromaDB host |
| `CHROMA_PORT` | `8001` | ChromaDB port |

## Production considerations (not yet implemented)

- Replace in-process WebSocket broadcast with Redis pub/sub
- Add rate limiting and token-based auth to API
- Add Alembic-style schema migration log for Pydantic model changes
- Consider Apache Kafka for high-throughput decision trace ingestion
- Add read replicas for Neo4j at scale
