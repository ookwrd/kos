# Omega — Architecture

## Overview

Omega is a seven-layer graph substrate backed by Neo4j (property graph) with a vector sidecar (ChromaDB) for semantic search, a FastAPI REST + WebSocket backend, and a React/TypeScript frontend. The architecture is designed around the principle that **knowledge layers have different epistemic properties** and must be structurally distinct, not collapsed into one flat store.

```
┌─────────────────────────────────────────────────────────┐
│                    Omega Frontend                        │
│  React + Vite + TypeScript + Cytoscape.js + Three.js    │
│  Panels: Overview · Graph · City · Replay · Provenance  │
│          Tacit · ExpertTwin · Council · Goals · Bridge  │
└────────────────────┬────────────────────────────────────┘
                     │ REST + WebSocket
┌────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend                        │
│  Routes: graph · decisions · knowledge · goals · agents │
│          alignment · inference · governance · openended │
│  Services: per-layer, domain-aware, provenance-attached │
└──────────┬──────────────────────────────────┬───────────┘
           │ Bolt                              │ HTTP
┌──────────▼──────────┐             ┌──────────▼──────────┐
│       Neo4j 5       │             │      ChromaDB        │
│  Property Graph     │             │  Vector Sidecar      │
│  Seven typed layers │             │  Semantic search     │
│  Typed relationships│             │  Agent routing       │
└─────────────────────┘             └─────────────────────┘
```

---

## The Seven Layers

Each layer is a distinct epistemic category. Mixing them erases information that is architecturally load-bearing.

### Layer 1: Evidence
**What it is:** The raw substrate of grounded claims. Documents, sensor windows, experimental results, transcripts, images, procedure logs, field observations.

**Why separate:** Evidence has source type, validation status, media type, uncertainty, and contributor attribution. These properties are meaningless if evidence is flattened into the knowledge layer. A scientific paper and a lab assay and a sensor reading are epistemically different even if they support the same claim.

**Key node types:** `EvidenceFragment`, `MultimodalTrace`, `SensorWindow`, `ExpertAnnotation`

**Key relationships:** `VALIDATES →`, `CITED_BY →`, `CONTRADICTS →`, `ANNOTATED_BY →`

### Layer 2: Context
**What it is:** The record of consequential reasoning events. Decisions, approvals, precedents, exceptions, escalations, workflow traces, institutional memory.

**Why separate:** Context is not knowledge — it is the history of what was *done with* knowledge. A decision is an event with actors, evidence references, and outcomes. Collapsing it into knowledge erases accountability.

**Key node types:** `DecisionTrace`, `Precedent`, `Exception`, `ApprovalRecord`, `WorkflowTrace`

**Key relationships:** `JUSTIFIED_BY →`, `INVOKED_PRECEDENT →`, `DECIDED_BY →`, `OVERRODE →`

### Layer 3: Knowledge / Mechanism
**What it is:** Structured causal and conceptual knowledge. Entities, mechanisms, procedures, pathways, causal relations, hypotheses, domain ontology.

**Why separate:** This is the layer most tools conflate with everything. In Omega, it is specifically the layer of *how things work* — not what happened (context), not what was observed (evidence), but what relationships and mechanisms are believed to hold in the domain.

**Key node types:** `Entity`, `Mechanism`, `Hypothesis`, `Procedure`, `CausalPath`

**Key relationships:** `ACTIVATES →`, `INHIBITS →`, `REQUIRES →`, `TARGETS →`, `HAS_MECHANISM →`

### Layer 4: Goal / Agency
**What it is:** The structured representation of what is being optimized, protected, or pursued — by which actors, under what constraints, with what priorities.

**Why separate:** Goals are not knowledge. They are normative commitments with authority boundaries. Who owns a goal matters. What constraints bind it matters. Goal conflicts are architecturally important, not bugs to suppress.

**Key node types:** `Goal`, `Constraint`, `Obligation`, `Tradeoff`, `AuthorityBoundary`

**Key relationships:** `CONSTRAINS →`, `CONFLICTS_WITH →`, `REQUIRES →`, `DELEGATES_TO →`, `OWNED_BY →`

### Layer 5: Governance / Trust
**What it is:** The machinery of accountability. Provenance records, permissions, consent records, revocation events, audit logs, contributor rights, policy constraints.

**Why separate:** Governance is not a feature. It is an architectural invariant. Every output in the system should be traceable to its governance state. Permissions and provenance are not metadata attached to nodes — they are first-class objects with their own lifecycle.

**Key node types:** `ProvenanceRecord`, `Permission`, `ConsentRecord`, `RevocationEvent`, `AuditLog`, `PolicyConstraint`

**Key relationships:** `RECORDS_ACTION_ON →`, `GRANTS_TO →`, `REVOKES →`, `DOWNSTREAM_OF →`

### Layer 6: Agent Ecology
**What it is:** The structured representation of epistemic actors — experts, AI tools, institutions, councils — with their authority scopes, calibrated uncertainty, beliefs, delegation relationships, and dissent records.

**Why separate:** Agents are not just "users" or "models." They are epistemic actors with domain-specific competence, institutional affiliation, calibration history, and bounded authority. The quality of collective reasoning depends on the structure of the agent ecology, not just the agents individually.

**Key node types:** `AgentProfile`, `ExpertTwin`, `InstitutionNode`, `AgentCouncil`, `Delegation`, `DissentRecord`

**Key relationships:** `DELEGATES_TO →`, `DISSENTS_FROM →`, `DEFERS_TO →`, `AFFILIATED_WITH →`, `COORDINATES_WITH →`

### Layer 7: Open-Endedness / Evolution
**What it is:** The living growth surface of the graph. Proposed new edges, emerging motifs, novelty hotspots, deprecated structures, version history, bridge proposals across domains.

**Why separate:** A static knowledge graph is an oxymoron. Knowledge systems must evolve. But evolution without governance is corruption. The open-endedness layer makes graph evolution explicit, governed, and auditable.

**Key node types:** `GraphChangeProposal`, `VersionTag`, `NoveltyScore`, `DeprecationRecord`, `DomainBridgeProposal`

**Key relationships:** `PROPOSES →`, `SUPERSEDES →`, `BRIDGES →`, `VERSIONED_FROM →`

---

## Domain Pack Architecture

A domain pack is the unit of deployable knowledge configuration. Each domain pack contains:

```
DomainPack {
  id: string                  // e.g., "drug_discovery"
  name: string                // Human-readable
  version: string
  description: string
  ontology_slice: OntologySlice    // Node/edge types used in this domain
  seed_entities: Entity[]
  seed_evidence: EvidenceFragment[]
  tacit_traces: TacitTrace[]       // Situated skill/procedure episodes
  sample_decisions: DecisionTrace[]
  goals: Goal[]
  constraints: Constraint[]
  provenance_records: ProvenanceRecord[]
  agents: AgentProfile[]           // Expert twins, councils, tools
  demo_queries: DemoQuery[]        // Pre-built queries for demo narration
  ui_narratives: UINarrative[]     // What to say when showing each panel
}
```

Domain packs are independently loadable, composable, and versionable. The alignment layer handles translation between domain ontologies when packs are combined.

---

## Data Flow

### Write path (knowledge capture)
```
Expert input / sensor / document
  → EvidenceFragment ingestion
    → ChromaDB vector embedding
    → Neo4j node creation
      → ProvenanceRecord created
        → Downstream notifications via WebSocket
```

### Read path (governed query)
```
Query arrives
  → Permission check (GovernanceService)
    → Domain-aware routing (CollectiveInferenceService)
      → Multi-layer graph traversal (Neo4j)
        → Provenance chain attached
          → Response with uncertainty annotation
```

### Evolution path (graph update)
```
OpenEndednessService.scan_novelty()
  → Sparse neighbourhood detection
    → Cross-domain bridge identification
      → GraphChangeProposal created
        → Human/council review
          → Accepted: VERSIONED graph update
          → Rejected: archived with rationale
```

---

## Key Architectural Invariants

1. **Every output carries provenance.** No result is returned without a traceable chain back to its source nodes, actors, and validation events.

2. **Domain locality is preserved.** Agents, evidence, and reasoning are scoped to domains. Cross-domain synthesis is explicit and goes through the alignment layer, not implicit merge.

3. **Governance is executable.** Permissions and constraints are checked at query time, not just documented. A revocation event has cascading effects that are computably traceable.

4. **Evolution is governed.** The graph never changes silently. Every structural change is a `GraphChangeProposal` with a review state, rationale, and version tag.

5. **Uncertainty is first-class.** Every node and edge carries an optional `uncertainty` field. Aggregate uncertainty propagates through reasoning chains.

6. **Dissent is persistent.** `DissentRecord` nodes are never deleted. Disagreement is the memory of the system's intellectual integrity.

---

## Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| Property graph | Neo4j 5 Community | Native graph traversal, Cypher queries, ACID transactions |
| Vector sidecar | ChromaDB (embedded) | Semantic search, agent routing, evidence similarity |
| Backend | FastAPI + Python 3.11 | Async, typed, fast iteration |
| Data models | Pydantic v2 | Runtime validation, schema export |
| Frontend | React 18 + TypeScript | Component composability, typed API client |
| Graph viz | Cytoscape.js + dagre | Layer-aware layout, performant for 100–2000 nodes |
| 3D ecology | Three.js / @react-three/fiber | City/ecology overview, district-level cognition |
| Build | Vite + Bun | Fast iteration, production builds |
| State | Zustand | Minimal, typed, slice-based |
| Styles | Tailwind CSS | Utility-first, design token compatible |

---

## Scalability Notes

The current implementation is a prototype targeting 100–2000 nodes per domain pack. The architecture scales to production via:

- Neo4j clustering for graph layer
- ChromaDB HTTP server (already supported via `CHROMA_MODE=http`)
- Redis pub/sub replacing in-memory WebSocket event bus
- Domain packs as separate Neo4j databases or labeled subgraphs
- Governance layer as separate service with its own audit store
- Agent ecology as streaming inference service
