# Iteration 2 — Complete Visual System Convergence

**Date:** 2026-04-22
**Scope:** Cinematic upgrade of remaining components, demo scripts, iteration log 1

---

## What Changed

### Components Upgraded (5)

**ProvenanceInspector.tsx** — Complete rewrite
Deep space aesthetic. SHA-256 hash display per record. Chain integrity summary ("5 records · hash verified"). Expandable entries with click-to-expand showing full hash, notes, and record ID. Domain-aware demo fallback: drug_discovery or fukushima_governance chains depending on selected node. Footer explaining the provenance model. No backend required.

**AgentCouncilView.tsx** — Complete rewrite
Six agents across three domains with rich calibration histories. Circular calibration ring SVG component (CSS arc, color-coded green/yellow/red by score). Domain filter chips. Two-panel design: list view → detail view on click. Detail view shows full belief state bars, competence chips, authority scope, dissent history, routing score. Distinguishes human/AI/institution with distinct icons and colors. Falls back to demo agents when no backend.

**GraphEvolutionTimeline.tsx** — Upgraded
Five demo proposals across all three domains, including cross-domain bridge proposals. Deep space card styling. Expandable cards with novelty bars, affected node chips, accept/reject review buttons. Footer note explaining the open-endedness governance model.

**OntologyBridgeView.tsx** — Upgraded
Drug_discovery ↔ Fukushima_governance alignment as demo data. Six mappings covering decisions, dissents, constraints, goals, and evidence — from exact to analogical confidence levels. Coverage bar (62%). Gap nodes in red for unmappable concepts. Structural notes explaining the real architectural insight (epistemic accountability asymmetry between trial committee and TEPCO management).

**InferencePanel.tsx** — Upgraded
Deep space styling. Demo routing for drug_discovery when backend unavailable. EIG score displayed with per-agent calibration and competence bars. Four preset queries across all three domains. Dissent count surfaced as epistemic signal. Footer explaining the EIG routing model.

### Bug Fixes
- `DecisionReplay.tsx`: All TypeScript ReactNode errors fixed — `unknown &&` conditions changed to `!!c.field &&`, `as string` casts in JSX replaced with `String()` wrappers
- `OntologyBridgeView.tsx`: OntologyMapping `score` field added to all demo instances; `structural_loss` set to `""` instead of `undefined` to satisfy required type
- `GraphEvolutionTimeline.tsx`: Removed `created_at` from demo proposals (not in `GraphChangeProposal` type)

### Documentation
- `docs/omega_demo_script_90s.md` — 90-second hallway demo with three gestures
- `docs/omega_demo_script_7min.md` — 7-minute structured walkthrough with presenter notes
- `docs/omega_demo_script_20min.md` — 20-minute deep technical session with Q&A guidance
- `docs/iteration_logs/iteration_1.md` — Full iteration 1 retrospective

---

## Visual System Status

| Component | Status |
|---|---|
| LandingView | ✓ Cinematic |
| GraphCanvas | ✓ Cinematic (star field, glow, layer toggles) |
| CityOverview | ✓ Cinematic (domain rings, bridge arcs, particles) |
| DecisionReplay | ✓ Cinematic (auto-play, policy gates, domain switch) |
| ProvenanceInspector | ✓ Cinematic |
| AgentCouncilView | ✓ Cinematic |
| CollectiveAssayView | ✓ Cinematic |
| PermissionExplorer | ✓ Cinematic |
| NestedAgencyView | ✓ Cinematic |
| GraphEvolutionTimeline | ✓ Cinematic |
| OntologyBridgeView | ✓ Cinematic |
| InferencePanel | ✓ Cinematic |
| ExpertTwinView | ✓ Cinematic (pre-existing) |
| TacitTraceViewer | ✓ Cinematic (pre-existing) |
| NodeInspector | ✓ Cinematic (glass panel) |

**All 15 components are now at the cinematic visual standard.** Zero old-style `bg-slate-700`, `bg-slate-800` patterns remaining in the active render paths.

---

## Build Status

Clean. Zero TypeScript errors. Build produces 1.8MB JS bundle (warning: large, due to Three.js/React Three Fiber inclusion from CityOverview).

---

## Demo Readiness Assessment

**90-second demo:** Ready. Drug Trial Replay + Fukushima Replay tab switch demonstrates the core thesis in under 2 minutes. No backend required — all demo data is embedded.

**7-minute demo:** Ready. Replay → Council → Assay → Agency trinity works cleanly as a tour. The Fukushima assay constraint violation is the signature moment.

**20-minute demo:** Ready for technical audiences but requires familiarity with the codebase for the backend/architecture discussion segments.

---

## What Still Needs Work

### Architecture
1. **Cross-domain discovery moment** — The iteration log from round 1 identified this as the core thesis. Currently a user can *see* that three domains exist but cannot yet *discover* an unexpected connection. A "serendipity mode" in the graph that highlights cross-domain edges would create this moment.

2. **Backend integration** — The full loop (agent action → KOS write path → graph update → frontend refresh via WebSocket) has not been tested end-to-end.

3. **Bundle code-splitting** — CityOverview / Three.js should be dynamically imported.

### Content
4. **Secondary domain packs** — climate_policy, surgical_robotics, expert_preservation, sovereign_knowledge fixture data not yet seeded.

5. **Live calibration updates** — The calibration ring should update when a decision is recorded that affects an agent's calibration history.

---

## Key Design Decisions Made in This Iteration

**Demo-first architecture:** Every component now has embedded fallback data. The frontend works as a fully functional demo without a running backend. This was the right call — it allows demo at any time, in any environment.

**Dissent as first-class signal:** The amber dissent badge appears in AgentCouncilView, AgentCouncilView detail, DecisionReplay dissent steps, CollectiveAssayView agent cards, and InferencePanel routing results. This repetition is intentional — dissent is the key differentiator of Omega vs. a standard knowledge graph.

**Calibration as earned authority:** The circular arc visualization (green/yellow/red by score) makes calibration legible at a glance without explanation. TEPCO Management at 0.31 immediately signals "this agent's confidence should be discounted" — no text required.
