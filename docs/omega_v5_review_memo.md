# Omega V5 — Honest Review Memo

*April 2026 — Internal. Not for external distribution.*

This memo is a frank assessment of what the current Omega/KOS prototype actually does versus what it claims to do. It is written to inform V5 work, not to market the system.

---

## A. What Is Genuinely Strong

### Visual language and cinematic framing
The dark-mode scientific-instrument aesthetic is genuinely distinctive. The landing view (star field, animated thesis lines, radial indigo glow) creates an appropriate sense of scale. The component color palette (evidence=blue, context=orange, knowledge=green, goal=yellow, governance=purple, agents=teal) is consistently applied across GraphCanvas, ProvenanceInspector, and legends. This is real craft work, not placeholder.

### DecisionReplay — the signature experience
After the v4/v5 rebuild, DecisionReplay is a genuinely differentiated interface. Three scenarios (Drug Trial, Fukushima, 737 MAX) with real historical grounding. The suppressed dissent alarm card — pulsing red, "If Omega existed" counterfactual, calibration differential — is the best moment in the prototype. The dual-thread layout (narrative + structural) is principled and corresponds to real lessons from aviation accident investigation and legal audit interfaces. This is the best thing in the repo.

### TacitTraceViewer
The ASML droplet calibration trace and the Onagawa/Hirai seawall story are high-quality. The distinction between tacit and explicit steps is genuine. The codifiability spectrum visualization is a real contribution. The content is historically accurate.

### The Fukushima / 737 MAX / Challenger narrative architecture
The pattern "authority overruling calibrated objection + dissent suppressed + catastrophic outcome" is a real and well-documented phenomenon across these three cases. The calibration scores (TEPCO Civil 0.76, TEPCO Management 0.31; Ed Pierson 0.91, Boeing Management 0.38) are demo constructs but are grounded in the actual track records of these entities. The framing is honest about this.

### Multi-panel layout and cross-component communication
The resizable sidebar architecture, Zustand store, and the SerendipityPanel → CityOverview bridge highlighting via `requestedView` / `highlightedBridgeId` — these work correctly. The implementation is clean.

### Conceptual architecture documents
`docs/concept_v2.md`, `docs/architecture_v2.md`, `docs/context_graphs.md`, `docs/category_theory_alignment.md` — these are substantive, not placeholder. They make genuinely interesting architectural claims about six epistemic layers.

---

## B. What Is Overclaimed, Ambiguous, or Still Scaffolded

### 1. DOMAIN_NODE_COUNTS in CityOverview.tsx — hardcoded, not computed

```tsx
const DOMAIN_NODE_COUNTS: Record<string, number> = {
  drug_discovery: 47,
  fukushima_governance: 38,
  euv_lithography: 29,
  ...
};
```

These numbers were invented to drive visual scaling (building heights, city prominence). They have no relationship to actual backend node counts. In demo mode (no backend), the actual graph has zero nodes. **This is a silent fabrication that should be labeled or removed.**

### 2. Fixture `decisions` field is nearly empty

Of 12 fixture files, only `drug_discovery.json` has a `decisions` array with content (1 decision). The other 11 fixtures have empty `decisions: []`. The claim that these are "10 knowledge cities with decision traces" is misleading — only one city actually has a structured decision trace in the fixture.

### 3. Active inference / EIG is a heuristic label

The InferencePanel shows EIG scores (e.g., 0.847, 0.612) that are hardcoded in `DEMO_ROUTING`. When the backend is unavailable (always in demo mode), these numbers are static. The label "EIG" is used but the implementation is: `sort agents by calibration_score × competence_similarity`. This is a reasonable heuristic but it is **not** Expected Information Gain in the formal sense (which requires a probability distribution over world states and a Bayesian update). The demo should be labeled "EIG-inspired heuristic routing" not "EIG routing."

### 4. OntologyBridgeView always uses DEMO_MAP in practice

The "≡ Bridge" button tries to call `api.alignment.compute(src, tgt)` but in demo mode (no backend) it catches the error silently and the `OntologyBridgeView` falls back to its embedded `DEMO_MAP`. The user sees the bridge view without realizing it's always the same demo alignment. **The UI should label this "Demo alignment — not computed live."**

### 5. Serendipity bridges are hardcoded, not algorithmically detected

`DEMO_BRIDGES` in SerendipityPanel.tsx is a static list of 7 pre-written bridges with hardcoded novelty scores. The copy says "Omega finds structural parallels across domains without being explicitly prompted." This is accurate as a *design intent* but **the current implementation does not detect these parallels algorithmically** — they were written by hand. The UI should say "Pre-identified structural parallels" or similar.

### 6. City zoom navigation — partially broken in some conditions

The OrbitControls + CameraController camera conflict was patched (using `controlsRef.current.target.lerp()` instead of `camera.lookAt()`), but:
- The initial camera position `[0, 58, 48]` shows the full map at z-out, but small cities (`math_category_theory` at [-28,-16], `aviation_safety` at [28,20]) are near the edges and may be partially clipped at some viewport sizes.
- Clicking a domain chip zooms correctly to that city but then smooth-zooms the OrbitControls target, and the transition animation may fight user input if the user tries to pan before the animation completes.

### 7. Cities of cities hierarchy — does not exist in code

The V5 brief asks for metro regions, federations, cities-of-cities. This is purely conceptual in the current repo. CityOverview.tsx has three size tiers (large/medium/small) but:
- No district boundaries within cities
- No metro region groupings
- No zoom-reveal-districts behavior
- The label says "cities" but the visual is "dot clusters"

### 8. Research logs do not exist

`docs/research_logs/` directory was missing before this iteration. The domain fixture data was written from training knowledge (this is appropriate for a prototype) but it was labeled as "real data" in some iteration logs. It should be labeled "training-knowledge-grounded synthetic fixture" or "hybrid fixture."

### 9. AutoResearchClaw was not used

AutoResearchClaw requires `OPENAI_API_KEY` which is not configured. None of the domain additions used it. This is documented in `docs/autoresearchclaw_setup.md`. Research was conducted via Claude training knowledge and web search subagents — this is stated explicitly.

### 10. Category theory is language, not infrastructure

The OntologyBridgeView uses category theory terminology (functors, ologs, natural transformations) but the actual alignment algorithm — when the backend is called — computes node label overlap between two domain graphs. This is a valid heuristic but it is **not** a formal functor computation. Competing functor candidates, natural transformations between competing translators, pushout synthesis — these are described in docs but not implemented.

### 11. Active inference layer — design intent only

`docs/active_inference_layer.md` describes the architecture correctly as conceptual/aspirational. The implementation (`next_best_question` in the backend) uses expected information gain as `current_uncertainty - expected_posterior_uncertainty` based on simple uncertainty values in the graph. This is a very simplified proxy for EIG, not formal active inference.

---

## C. What Must Be Corrected in This V5 Iteration

### Immediate corrections (code changes)

1. **Label node counts as approximate in CityOverview** — either remove hardcoded counts or add "(approx)" to tooltips
2. **Add demo/fallback labels to OntologyBridgeView** — when DEMO_MAP is active, show "Demo alignment · click ≡ Bridge to compute live"
3. **Update SerendipityPanel copy** — "Pre-identified structural parallels" not "Omega finds without being asked"
4. **Branding update** — add "A Cross Labs × Cognisee research prototype" to LandingView footer
5. **Add decisions to flagship fixture files** — drug_discovery, fukushima, euv_lithography should each have 3+ decisions

### Architecture/docs to create

6. **docs/implementation_reality_check.md** — explicit per-feature labeling
7. **docs/cities_of_cities_architecture.md** — conceptual + minimal code hook
8. **docs/autoresearchclaw_setup.md** — honest status, what was done instead
9. **docs/research_logs/** — source tables for each domain family
10. **docs/active_inference_v2.md** — honest accounting of heuristic vs formal

### Research to conduct (via subagents, not AutoResearchClaw)

11. ALife / open-endedness sources for `docs/alife_v2.md`
12. Category theory practical applications for `docs/category_theory_transfer_v2.md`
13. Expert preservation / tacit knowledge transfer literature
14. Supply chain resilience and new domain packs

### Domains to add (research-grounded)

15. `expert_preservation` — retiring master knowledge (NASA Apollo, craft industries)
16. `supply_chain_resilience` — TSMC concentration risk, COVID supply chains
17. `causality_complex_systems` — Pearl causality, complex adaptive systems
18. `developmental_biology` — Levin morphogenesis (clearly labeled speculative/frontier)

---

## Summary Assessment

**What this prototype is:** A high-quality demo shell with one genuinely strong signature experience (DecisionReplay Fukushima/737 MAX), compelling visual language, and a principled architectural vision. The conceptual foundations are sound.

**What this prototype is not:** A system with working algorithmic novelty detection, formal active inference, live category theory alignment, or real-time cross-domain bridge discovery. These are design intents, not implementations.

**The honest bar for V5:** Label everything correctly. Add research logs. Deepen the fixture data. Add metro region groupings to the city view. Make the reality check document a feature, not a confession.
