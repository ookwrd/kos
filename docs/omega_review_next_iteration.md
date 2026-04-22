# Omega KOS — Iteration 3 Review & Research Memo

**Date:** 2026-04-22
**Status:** Pre-implementation review for v3 scope

---

## What Exists

### Frontend (17 components, all cinematic)

| Component | Quality | Notes |
|---|---|---|
| GraphCanvas | Strong | Cytoscape multi-layer, dagre layout, glow effects |
| CityOverview | Strong | Three.js city with domain rings, arc bridges, particles |
| DecisionReplay | Strong | Auto-play, policy gates, dissent steps |
| AgentCouncilView | Strong | CalibRing SVG, belief bars, domain filters |
| CollectiveAssayView | Strong | Constraint violation red cards, belief synthesis |
| ProvenanceInspector | Strong | SHA-256 chain, expandable, domain-aware fallback |
| InferencePanel | Strong | EIG scores, calibration pips, preset queries |
| OntologyBridgeView | Strong | Three-column bridge layout, gap nodes in red |
| GraphEvolutionTimeline | Strong | Novelty bars, accept/reject, proposal types |
| NestedAgencyView | Adequate | Hierarchy, delegation rings |
| PermissionExplorer | Adequate | Permission matrix |
| ExpertTwinView | Adequate | Twin belief states |
| TacitTraceViewer | Adequate | Trace steps |
| NodeInspector | Good | Glass panel, uncertainty bar |
| LandingView | Good | Deep space hero |
| MechanismPathExplorer | Shallow | Shows path but no richness |
| UncertaintyOverlay | Shallow | Heatmap concept only |

### Backend (8 model files, 5 fixture domains)

| Module | Quality | Notes |
|---|---|---|
| models/base.py | Strong | KOSBase with neo4j_props() |
| models/agents.py | Strong | AgentProfile, Delegation, DissentRecord |
| models/alignment.py | Strong | AlignmentMap, OntologyMapping, GraphChangeProposal |
| models/context.py | Strong | DecisionTrace, Precedent |
| models/knowledge.py | Strong | Entity, Mechanism, Hypothesis |
| models/goal.py | Strong | Goal, Constraint, Obligation |
| models/governance.py | Strong | Permission, ProvenanceRecord |
| models/evidence.py | Strong | EvidenceFragment, UncertaintyAnnotation |
| drug_discovery.json | Strong | KRAS pathway, agents, dissents |
| fukushima_governance.json | Strong | TEPCO decisions, seawall chain |
| euv_lithography.json | Adequate | EUV tacit knowledge |
| ai_hardware.json | Adequate | Alignment map, delegations |
| governance.json | Adequate | Board decision trace |

### Documentation (18 files)

Architecture docs are substantive. Demo scripts are production-ready. Iteration logs are detailed.

---

## What Is Strong

**Visual system**: All 15 actively-used components reach cinematic standard. The deep space aesthetic is coherent — `#020610` backgrounds, glow borders, monospace numerics, amber dissent markers.

**Demo-first architecture**: Every component embeds fallback data. The entire frontend runs offline. This is the correct decision for research demos and was validated in iteration 2.

**Dissent as a first-class signal**: AgentCouncilView, DecisionReplay, CollectiveAssayView, InferencePanel all surface dissent visually. This repetition is intentional and creates a coherent thesis.

**TypeScript correctness**: Zero type errors. All 17 components compile cleanly.

**Fixture depth**: drug_discovery and fukushima_governance have rich, narratively coherent data. The TEPCO/trial-committee structural parallel is the strongest demo moment.

---

## What Is Still Shallow

**1. Cross-domain discovery is passive, not active**
A user can *see* that multiple domains exist but cannot *experience* finding an unexpected cross-domain pattern. The bridge proposals in GraphEvolutionTimeline are pre-computed — there's no moment where the system *finds* a new connection in front of the user. This is the core thesis gap.

**2. Active inference is named but not visible**
The EIG routing score in InferencePanel is shown as a number but not as a *surface* — there's no visualization of epistemic uncertainty across the graph, no next-best-question recommendation, no visual showing how answering one query reshapes uncertainty elsewhere.

**3. Category theory is declared but not demonstrated**
AlignmentMap is the best abstraction in the codebase, but the UI only shows a static mapping. The functor interpretation (structure-preserving translation), the failure modes (gap nodes), and the composability (can you bridge A→B→C?) are not exposed.

**4. Four target domains are missing entirely**
math_category_theory, surgical_robotics, semiconductor_hardware, extreme_environments have no fixtures, no demo data, no UI representation.

**5. Transfer operations are absent**
The v3 expansion requires explicit transfer objects: BridgeMap, TransferOperator, FunctorCandidate, NaturalTransformationCandidate, TransferFailure, StructuralLossReport. These don't exist yet.

**6. ALife dynamics are static**
The CityOverview shows a beautiful 3D city, but the city doesn't breathe. No agent population dynamics, no knowledge decay, no ecological pressure. NestedAgencyView shows hierarchy but not agency emergence.

**7. Multimodal tacit knowledge is thin**
TacitTraceViewer exists but shows only text traces. The EUV fixture has tacit knowledge fragments but no visual distinction between declarative vs. situated vs. embodied knowledge types.

---

## What Must Change in V3

### Priority 1 — Transfer machinery
Add `BridgeMap`, `TransferOperator`, `FunctorCandidate`, `NaturalTransformationCandidate`, `TransferFailure`, `StructuralLossReport` to `models/alignment.py`. These are the scaffolding for cross-domain knowledge transfer with explicit loss accounting.

### Priority 2 — Four new domain fixtures
Create `math_category_theory.json`, `surgical_robotics.json`, `semiconductor_hardware.json`, `extreme_environments.json`. The new domains must have cross-domain bridge candidates so the transfer machinery has something to demonstrate.

### Priority 3 — Active discovery moment in the UI
The signature v3 demo moment: the system surfaces an unexpected structural parallel between two domains (say, surgical haptic feedback ↔ semiconductor process control). The user didn't ask for it — the graph found it. This requires a SerendipityPanel or discovery notification surface in the frontend.

### Priority 4 — EIG surface (visible uncertainty)
Add an epistemic uncertainty heatmap overlay to GraphCanvas. Nodes with high uncertainty should pulse or glow differently. The InferencePanel should recommend which question would reduce uncertainty the most.

### Priority 5 — Documentation
9 docs: `knowledge_cities_and_transfer.md`, `category_theory_transfer.md`, `active_inference_in_omega.md`, `alife_open_endedness_and_swarms.md`, `multimodal_tacit_knowledge.md`, `new_domain_packs.md`, `demo_user_flows_v2.md`, `NEXT_STEPS.md`, and this review doc.

---

## Research Notes on New Domains

### math_category_theory
Category theory itself as a domain exercises the meta-level: can KOS represent the formal structures it uses as its own foundation? Key objects: objects, morphisms, functors, natural transformations, limits, colimits, adjunctions. This domain tests reflexive self-modeling.

### surgical_robotics
Rich tacit knowledge domain. Surgeons encode haptic intuition that cannot be written — force feedback calibration, entry-angle feel, tissue resistance interpretation. Mechanisms: da Vinci kinematic chain, force-torque sensing, stereo vision. Agents: attending surgeon, resident, OR nurse, robotic system. Key structural parallel with EUV: situated knowledge that cannot be reduced to specification documents.

### semiconductor_hardware
CMOS fabrication: etch/deposition cycles, CMP, ion implantation, wafer-level test. Tacit knowledge: process engineers with 20 years of "feel" for plasma conditions. Parallel with fukushima_governance: institutional authority structures overriding process engineer warnings. The node EUV lithography already exists — semiconductor_hardware extends this into adjacent process steps.

### extreme_environments
Deep-sea, polar, high-altitude operations. Knowledge transfer across extreme contexts is inherently lossy — procedures developed for one environment may be subtly wrong in another (Challenger O-ring: low-temperature behavior). Structural parallel with fukushima_governance: normalization of deviance, authority overriding evidence.

---

## Bridge Candidates Across Domains

| Source | Target | Structural Parallel |
|---|---|---|
| fukushima_governance → seawall decision | surgical_robotics → entry-angle override | Expert dissent overridden by authority |
| drug_discovery → calibration decay | semiconductor_hardware → process drift | Calibration score vs. yield degradation |
| extreme_environments → O-ring failure | fukushima_governance → TEPCO seawall | Normalization of deviance |
| math_category_theory → adjunction | alignment → functor bridge | Formal correspondence with loss accounting |
| surgical_robotics → haptic calibration | euv_lithography → pre-pulse feel | Tacit knowledge as irreducible situated skill |

These five bridges are the demos for the SerendipityPanel.

---

## Recommended V3 Implementation Order

1. Write 8 architectural docs (this memo is #1)
2. Extend `models/alignment.py` with transfer objects (7 new classes)
3. Create 4 new fixture JSON files (~150 nodes each)
4. Add `SerendipityPanel.tsx` — cross-domain discovery surface
5. Extend InferencePanel to show EIG uncertainty surface
6. Update CityOverview demo data to include new domains
7. Update `NEXT_STEPS.md` as the single source of forward roadmap
8. Commit and push
