# Iteration 1 — Omega v2 Platform Upgrade

**Date:** 2026-04-22
**Scope:** Complete visual system overhaul, new components, 3-domain data expansion, demo infrastructure

---

## What Changed

### Frontend — New Components (5)

**LandingView.tsx**
The first impression. Animated thesis lines cycling through 5 phrases. 4 architectural pillars in a 2×2 grid. Explicit "not-list" of what Omega isn't (monolithic AGI, chat UI with graph, prettier RAG). Star field SVG background. Fade-out transition on Enter. This component does the hardest job — it has to make a researcher think "I haven't seen this before" in the first 5 seconds.

**CollectiveAssayView.tsx**
Two preset assays (drug trial CNS cohort, Fukushima seawall). Each assay shows 4–5 agent response cards with calibration bars, confidence values, reasoning text, evidence cited, dissent markers. "Synthesize Collective Verdict" button computes calibration-weighted consensus. The Fukushima assay has a violated constraint gate that blocks synthesis — this is the key demo moment for the governance layer.

**PermissionExplorer.tsx**
6 actors × 6 resources grid. Access cells show R/W/V/⊗/— with color coding. Click a row → actor detail with full permission list and calibration. Click a column header → resource detail + simulated revocation cascade (which actors lose access downstream). Demonstrates that governance isn't just policy text — it's a live queryable structure.

**NestedAgencyView.tsx**
SVG concentric rings: Atomic, Expert, Institution, Domain Pack, Substrate. Each ring is clickable — shows entity list, description, and ALife analogy (organisms/superorganisms/biosphere). The center Omega glyph is a triple-circle. This is the architectural thesis visualized in one image.

**ExpertTwinView.tsx** (pre-existing, verified present)
Individual expert twin deep-dive panel.

### Frontend — Upgraded Components (4)

**DecisionReplay.tsx** — Complete rewrite
From a placeholder to the signature experience. Auto-play mode (2200ms intervals). Progress bar. Seven-step typed replay structure: question, evidence, policy, actor, dissent, precedent, outcome. Each step type has distinct color, icon, and rendering logic. Policy gates show VIOLATED/satisfied with constraint text and threshold values. Dissent steps show preserved/suppressed distinction with reasoning. Domain switching: Drug Trial | Fukushima tabs. The Fukushima replay surfaces the 2008 seawall override — the most consequential dissent in the dataset.

**GraphCanvas.tsx** — Visual upgrade
Deep space SVG background: radial glow gradient + 20×20 grid lines + 80-point star field. Three layout modes (dagre/concentric/grid) with toggle buttons. Node count badges in layer toggle bar. Selected node: shadow/glow effect at 40×40px. Dissent nodes get amber border. Monospace font on labels. Animated loading spinner.

**AgentCouncilView.tsx** — Cinematic rewrite
Six agents across three domains with rich demo data. Domain filter chips. Calibration ring SVG component (circular progress, color-coded by score). Click any agent → full detail view with belief bars, competence chips, authority scope, dissent count, routing score. Domain-colored agent cards. Distinguishes human/AI/institution with distinct icons. Falls back to demo data if no backend.

**ProvenanceInspector.tsx** — Cinematic rewrite
Two demo chains (drug discovery and Fukushima). SHA-256 hash display per record. Chain integrity summary ("5 records · hash verified"). Click any chain entry → expands to show full hash and note. Expandable/collapsible entries. Footer explaining the provenance model. Falls back to demo data if no backend.

**CityOverview.tsx** — Major upgrade (done in earlier session)
Domain rings with rotating outer ring animation. Bridge arcs as parabolic Bezier curves. 80-particle instanced mesh. Camera rig with smooth lerp. Domain selector chips.

### Frontend — demoData.ts Expansion
From 22 nodes (drug_discovery only) to 47 nodes across all three domains:
- fukushima_governance: 2 evidence, 3 context, 3 knowledge, 2 goal, 1 governance nodes
- euv_lithography: 2 evidence, 2 context, 2 knowledge, 2 goal nodes
- Added 2 more agents (TEPCO Civil Eng., ASML Systems Eng.)

### Backend — TacitTrace models
Added `TacitStep` and `TacitTrace` Pydantic v2 models to `backend/kos/models/knowledge.py`.
Added `create_tacit_trace()` and `list_tacit_traces()` to knowledge_graph service.
Added tacit trace seeding block to `backend/kos/db/seed.py`.

### Docs
- `docs/research/01_interface_patterns.md` — UI patterns for provenance-rich systems
- `docs/research/02_alife_multiscale_cognition.md` — ALife concepts and references
- `docs/research/03_frontier_demo_principles.md` — Demo principles and Omega's answers to hard questions
- `docs/omega_demo_script_90s.md` — 90-second hallway demo
- `docs/omega_demo_script_7min.md` — 7-minute structured walkthrough
- `docs/omega_demo_script_20min.md` — 20-minute deep technical session

---

## What Was Hard

**TypeScript discriminated union resolution in DecisionReplay.tsx**
The DEMO_REPLAY object has heterogeneous content shapes per step type. TypeScript inferred precise union types from the literal content objects, then rejected any code that didn't match the exact inferred shape. Solution: type the entire replay object as `{ decision: Record<string, unknown>; replay_steps: any[] }` and cast content access as needed at render time. The `unknown &&` pattern — where `unknown` on the left of `&&` produces `unknown | JSX.Element`, not `false | JSX.Element` — required switching all JSX conditionals to `!!c.field &&` form.

**Three.js / React Three Fiber bundle size**
CityOverview with R3F adds significant bundle weight. The build warns at 1.78MB unminified. This is acceptable for a prototype but would need code-splitting for production.

---

## What Still Needs Work

### High Priority
1. **GraphEvolutionTimeline** — currently a placeholder stub. Needs actual timeline visualization of GraphChangeProposal nodes.
2. **InferencePanel** — needs visual upgrade to match the cinematic standard.
3. **OntologyBridgeView** — needs the gap-node visualization improved (currently shows raw JSON).
4. **NodeInspector** — the right-side node detail panel; needs upgrade.

### Medium Priority
5. **ExpertTwinView** — the dedicated expert twin deep-dive; needs to match AgentCouncilView's cinematic level.
6. **TacitTraceViewer** — the situated skill trace viewer; needs to show tacit warning indicators prominently.
7. **Secondary domain packs** — climate_policy, surgical_robotics, expert_preservation domain fixture data.

### Low Priority
8. Bundle code-splitting — dynamic imports for CityOverview/Three.js.
9. Backend integration testing — end-to-end with Neo4j running.
10. Auth middleware stub — currently CORS-only, no real auth.

---

## Metrics

| Metric | Before | After |
|---|---|---|
| Total component files | 12 | 17 |
| Demo nodes (demoData.ts) | 22 | 47 |
| Domains with full data | 1 | 3 |
| Right sidebar tabs | 3 | 7 |
| Build status | Failing (TS errors) | Clean |
| Demo scripts | 0 | 3 |

---

## Critique of Current State

The interface now has the right *structure* — seven right tabs, four left tabs, landing gate, domain switching in DecisionReplay. The visual quality is high in 6 of 17 components. The remaining 11 range from functional-but-plain to placeholder stubs.

The demo narrative works for the 90-second format. The 7-minute format requires the Replay + Council + Assay trio to all be compelling — they are. The 20-minute format assumes the backend is running and live graph data is flowing — that's not ready yet.

The biggest gap: cross-domain exploration. There's no moment in the demo where a user can *discover* a connection between the drug trial and the Fukushima governance data. That emergent discovery moment is the core thesis of the product. Iteration 2 should make that discoverable.
