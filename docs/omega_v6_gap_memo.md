# Omega V6 — Gap Analysis Memo

*April 2026 — Internal. Not for external distribution.*

This memo is a frank accounting of where Omega/KOS actually stands before the V6 sprint begins. The target is 24 domain cities, 6 metro regions, 2 federations, and 1 MetaCity. The current state is 10 cities, 4 partial metro regions, and no navigable hierarchy. The gap is large. This document does not soften that.

---

## 1. What Is Already Real

### 1.1 Fixture data for all 10 existing cities

Backend fixture files exist and are non-trivial for all ten domains:

| Domain | Fixture | Quality |
|---|---|---|
| drug_discovery | drug_discovery.json | High — ACE2, CRISPR, fragment-based screening |
| fukushima_governance | fukushima_governance.json | High — TEPCO, PTHA 2008, seawall height decision |
| euv_lithography | euv_lithography.json | High — ASML, tin plasma, droplet calibration trace |
| aviation_safety | aviation_safety.json | High — MCAS, Ed Pierson, Lion Air/Ethiopian |
| pandemic_governance | pandemic_governance.json | High — PHEIC timeline, aerosol dispute |
| semiconductor_hardware | semiconductor_hardware.json | Medium — TSMC N3, EDA toolchains |
| surgical_robotics | surgical_robotics.json | Medium — da Vinci, haptic feedback limits |
| math_category_theory | math_category_theory.json | Medium — Eilenberg-MacLane, functors |
| climate_policy | climate_policy.json | Medium — Paris Agreement, carbon markets |
| extreme_environments | extreme_environments.json | Medium — Challenger, normalization of deviance |

"High" here means: historically accurate facts, named real actors, structured nodes and edges, real technical parameters. It does not mean: primary source citations, live-extracted quotes, or verified calibration scores. See Section 4.

### 1.2 Implemented UI surfaces

These components exist, render correctly, and carry real content:

- **CityOverview.tsx** — Three.js 3D city rendering with building height variation, domain chip controls, zoom-to-city camera behavior
- **DecisionReplay** — Three-scenario decision audit tool (Drug Trial, Fukushima, 737 MAX) with narrative/structural dual-thread layout and suppressed-dissent alarm card. This is the strongest piece of the prototype.
- **TacitTraceViewer** — ASML droplet calibration trace; Onagawa seawall story. Codifiability spectrum is a real contribution.
- **SerendipityPanel** — 7 pre-written cross-domain bridges displayed with structural-parallel framing
- **OntologyBridgeView** — Bridge display (always uses DEMO_MAP in practice; see Section 2)
- **InferencePanel** — Agent routing with EIG-labeled heuristic scores
- **ProvenanceInspector** — Evidence/context/governance node metadata display
- **GraphCanvas** — Force-directed knowledge graph renderer

### 1.3 Source-grounded data — the honest list

These specific facts are historically verifiable and were used in the fixtures with high confidence:

| Item | Domain | Source category |
|---|---|---|
| PTHA 2008 study projecting >10m tsunami | fukushima_governance | IAEA Fukushima Daiichi Accident Report 2015 |
| Hirai Katsuhiko / Onagawa 14.8m seawall | fukushima_governance | Post-event engineering analyses |
| Jogan 869 AD tsunami deposit evidence | fukushima_governance | Tohoku geological literature |
| MCAS single-AOA-sensor design | aviation_safety | FAA/NTSB investigation reports |
| Ed Pierson congressional testimony | aviation_safety | U.S. House Transportation Committee, 2019 |
| Lion Air 610 / Ethiopian 302 fatality counts | aviation_safety | KNKT / EAIB accident reports |
| WHO PHEIC declaration January 30, 2020 | pandemic_governance | WHO official documentation |
| Morawska & Milton et al. aerosol letter, July 2020 | pandemic_governance | Published open letter, 239 signatories |
| Roger Boisjoly O-ring memo, July 31, 1985 | extreme_environments | Rogers Commission Appendix F |
| Challenger launch temperature: 28°F | extreme_environments | Rogers Commission report |
| ASML tin plasma EUV source mechanism | euv_lithography | ASML technical documentation |
| Shannon entropy formulation | math_category_theory | Shannon 1948 |
| ACE2 receptor as SARS-CoV-2 entry | drug_discovery | Zhou et al. 2020, Nature |

Everything else in the fixtures is either training-knowledge-grounded synthesis or demo construct. See Section 4.

### 1.4 Architecture and conceptual documents that are substantive

`docs/concept_v2.md`, `docs/architecture_v2.md`, `docs/context_graphs.md`, `docs/category_theory_alignment.md`, `docs/active_inference_v2.md`, `docs/swarm_reservoirs.md` — these contain real architectural thinking. They are not scaffold. They are design intent documents that exceed what is implemented.

---

## 2. What Is Still Scaffolded

### 2.1 Metro region halos — visual only, 4 of 6 regions

Metro region halos exist in CityOverview.tsx for 4 regions. They are decorative groupings, not navigable containers. Clicking a region halo does not:
- Zoom to the region
- Show region-level metadata
- Display bridges within the region as a subgraph
- Reveal districts within cities

The "cities of cities" architecture document (`docs/cities_of_cities_architecture.md`) describes this vision. The implementation is dots on a plane with colored halos. V6 requires 6 regions; currently 4 are defined, and even those 4 are visual-only.

### 2.2 Hierarchy / district-level zoom — does not exist

No zoom-reveal-districts behavior is implemented anywhere in the codebase. City zoom takes the camera to the city center; it does not reveal internal district structure. Districts are not defined in any fixture file. The conceptual framework calls for three zoom levels: Federation → Metro Region → City → District. Currently only City-level is partially navigable.

### 2.3 Decision traces — almost entirely missing

Only `drug_discovery.json` has a non-empty `decisions` array (1 decision). The other 9 fixtures have `decisions: []`. The prototype claims "10 knowledge cities with decision traces" — this is misleading. Nine cities have no structured decision data.

### 2.4 Serendipity bridges — hardcoded, not detected

`DEMO_BRIDGES` in SerendipityPanel.tsx is a static list of 7 pre-written bridge descriptions with hardcoded novelty scores. The system does not detect structural parallels algorithmically. The copy "Omega finds structural parallels across domains" describes design intent, not current behavior. V6 requires 60+ bridges across 24 cities; the current count is 7 pre-written examples for 10 cities.

### 2.5 OntologyBridgeView — always demo

The bridge alignment view always uses DEMO_MAP in practice. The API call `api.alignment.compute(src, tgt)` fails silently in demo mode and the embedded demo data substitutes. No live alignment is ever computed. No user-visible label indicates this.

### 2.6 DOMAIN_NODE_COUNTS — fabricated

```tsx
const DOMAIN_NODE_COUNTS: Record<string, number> = {
  drug_discovery: 47,
  fukushima_governance: 38,
  ...
};
```

These numbers are invented. They drive building height scaling in the 3D view. They have no relationship to actual node counts. In demo mode (no backend) the graph has zero nodes. This is a silent fabrication.

### 2.7 EIG scores — heuristic, not formal

InferencePanel shows EIG scores that are static in demo mode. The backend implementation is `calibration_score × competence_similarity`, not formal Expected Information Gain. The label is misleading.

### 2.8 SwarmReservoirs — documented, not visible

`docs/swarm_reservoirs.md` is a substantive design document. No SwarmReservoir is rendered in the 3D city view or accessible from any UI panel. This is entirely design intent.

### 2.9 Category theory — terminology, not infrastructure

OntologyBridgeView uses functor and natural transformation terminology. The actual alignment algorithm computes node label overlap. Formal functor composition, competing translator candidates, and pushout synthesis are described in design documents but not implemented.

---

## 3. Source-Grounded vs. Synthetic: The Honest Map

### Strong source grounding (specific named events, verifiable primary records)

These domains have content that would survive a fact-check against primary sources:

- **fukushima_governance** — TEPCO decisions, Onagawa comparison, PTHA timeline
- **aviation_safety** — MCAS design, Pierson testimony, accident dates/fatalities
- **pandemic_governance** — WHO PHEIC dates, aerosol letter signatories
- **extreme_environments** — Boisjoly memo, Rogers Commission, launch temperature
- **euv_lithography** — ASML EUV mechanism, tin plasma physics, droplet timing

### Hybrid grounding (real domain, training-knowledge synthesis, no primary citations)

These domains are accurate in character but are synthesized from training knowledge rather than extracted from specific documents:

- **drug_discovery** — Real mechanisms (ACE2, fragment screening), real institutions (FDA, EMA), but specific trial data and compound names are illustrative
- **semiconductor_hardware** — Real technology (TSMC N3, EDA, DRC), but specific yield figures and process parameters are approximate
- **surgical_robotics** — Real system (da Vinci), real limitations (haptic feedback absence, latency), but specific clinical trial data is not source-extracted
- **climate_policy** — Real policy framework (Paris Agreement, carbon markets), but emissions figures and policy decision dates are approximate
- **math_category_theory** — Real mathematics (Eilenberg-MacLane, Yoneda), real application domains, but application case studies are constructed

### Speculative / frontier (real field, but content is extrapolative)

- **extreme_environments (Challenger pattern extrapolation to broader domains)** — The normalization-of-deviance framing is well-grounded (Vaughan 1996); its extension to other domains is analytical extrapolation

---

## 4. What Is Demo-Only

To be explicit: the following aspects of the current prototype would not withstand scrutiny as a research system:

1. **Node counts** — fabricated integers for visual scaling
2. **Calibration scores** (TEPCO Civil 0.76, Pierson 0.91, etc.) — principled demo constructs, not formally computed from track records
3. **EIG scores in InferencePanel** — static values in demo mode; heuristic formula in backend
4. **Bridge novelty scores** — hand-assigned; not algorithmically derived
5. **Internal dialogue in DecisionReplay** — composite/paraphrase of documented events, not primary source quotes
6. **Named engineers** in governance domains — illustrative composites where specific individuals are not publicly identified
7. **Specific compound names and trial data** in drug_discovery — illustrative
8. **District structure** — does not exist in any fixture or rendering
9. **Live bridge computation** — never executes in demo mode
10. **SwarmReservoir visualization** — not rendered anywhere

This is appropriate for a research prototype in its current stage. The corrections required before a research audience sees this are: label all of the above explicitly in the UI, and build the fixture depth for V6's 14 new domains before claiming they are "knowledge cities."

---

## 5. The Scale Gap: V6 Requirements vs. Current State

| Dimension | Current (V5) | V6 Target | Gap |
|---|---|---|---|
| Domain cities | 10 | 24 | 14 new cities needed |
| Metro regions | 4 (visual only) | 6 (navigable) | 2 new regions; all 6 need real navigation |
| Federations | 0 | 2 | New grouping level needed |
| MetaCity | 0 | 1 | New concept; no implementation |
| Cross-domain bridges | 7 (hardcoded) | 60+ (ideally algorithmic) | ~53 new bridges needed |
| Decisions in fixtures | 1 (drug_discovery) | 3+ per city (72+ total) | ~71 decisions needed |
| District-level zoom | 0 | 5-8 districts per city | Requires new data model + rendering |
| SwarmReservoirs in 3D view | 0 | At least 1 per region | Requires new rendering component |
| Source-grounded data | 5 domains (strong) | 10+ domains (strong) | 5 more domains need primary source work |

The 14 new domains (disaster_response_operations, public_health_coordination, industrial_quality_control, supply_chain_resilience, robotics_extreme_environments, translational_biomedicine, developmental_biology_morphogenesis, causality_and_complex_systems, experimental_design_and_measurement, expert_preservation, algebraic_structures, graph_theory_and_networks, information_theory, optimization_and_control, scientific_model_transfer) currently have no fixture files, no research logs, and no UI presence.

---

## 6. Recommended V6 Sequencing

### Phase 1: Fixture foundation (before any UI work)

1. Write research logs and source tables for all 14 new domains (this document set)
2. Create fixture JSON stubs for all 14 new domains, labeled "hybrid fixture" or "speculative"
3. Add 3 decisions to each of the 5 strongest existing fixtures (fukushima, aviation_safety, euv_lithography, pandemic_governance, extreme_environments)

### Phase 2: Hierarchy data model

4. Add district arrays to fixture schema
5. Define 3-5 districts for each existing city (before adding new ones)
6. Define metro region membership in fixture metadata

### Phase 3: UI navigation

7. Add metro region groupings to CityOverview.tsx (beyond decorative halos)
8. Implement district reveal on city zoom
9. Add Federation grouping layer above metro regions

### Phase 4: New cities

10. Add 14 new cities to CityOverview.tsx with correct federation/region placement
11. Write pre-identified bridges for new cross-domain pairs (target: 30+ total)
12. Label all synthetic/speculative content explicitly in the UI

### Phase 5: MetaCity

13. MetaCity is the most speculative component — design first, implement last

---

## Summary

V5 is a strong demo shell with one genuine signature experience (DecisionReplay), compelling visual language, and sound architectural vision. The honest bar for V6 is: 14 new domain fixtures with honest grounding labels, navigable metro regions, and district-level data model — before claiming to be a 24-city knowledge operating system. The visual city metaphor is powerful. The data infrastructure needs to catch up to it.
