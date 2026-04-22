# NEXT_STEPS — KOS Roadmap

*Single source of truth for forward work. Updated at the end of each iteration.*

**Last updated:** 2026-04-22 (end of iteration 3)

---

## Immediate (Iteration 4)

### 1. Backend: Transfer Object Models
Add to `backend/kos/models/alignment.py`:
- `BridgeMap` — scoped subset of AlignmentMap covering one transfer claim
- `TransferOperator` — activated transfer with governance approval + StructuralLossReport
- `FunctorCandidate` — proposed functor awaiting validation
- `NaturalTransformationCandidate` — compatibility between two existing translations
- `TransferFailure` — record of rejected transfer attempts
- `StructuralLossReport` — enumeration of what a transfer loses
- `LocalConsistencyCondition` — target domain coherence requirement
- `GlobalGluingGap` — irreducible ontological difference between two domains

### 2. Fixtures: Four New Domains
Create `backend/fixtures/`:
- `math_category_theory.json` — formal category theory objects, functors, natural transformations
- `surgical_robotics.json` — da Vinci system, haptic tacit knowledge, authority override dissent
- `semiconductor_hardware.json` — CMOS etch process, yield governance, process engineer dissent
- `extreme_environments.json` — Challenger O-ring, deep-sea operations, normalization of deviance

Target: ~40 nodes per domain, 5 cross-domain `BridgeMap` stubs.

### 3. Frontend: SerendipityPanel
`frontend/src/components/SerendipityPanel.tsx`
- Shows top-5 cross-domain discoveries by novelty_score
- Each card shows source domain, target domain, structural pattern, novelty bar
- Click → bridges highlight in CityOverview
- "Why?" button → opens OntologyBridgeView filtered to this bridge
- This is the signature v3 demo moment

### 4. Frontend: Extend InferencePanel
- Add "Next best question" section below routing results
- Takes current selected node or goal as context
- Returns top-3 questions ranked by epistemic value
- Shows the uncertainty reduction estimate for each question

### 5. Frontend: Update CityOverview for 7 Domains
- Add domain rings for math_category_theory, surgical_robotics, semiconductor_hardware, extreme_environments
- Add bridge arcs for the 5 active cross-domain connections
- Position cities by structural similarity (close = more bridges)
- Toggle: AgentEcologyMode / NestedAgencyMode / OpenEndedGrowthMode

---

## Short-Term (Iteration 5)

### 6. Backend: Full Neo4j Integration
- Write-path ingestion for all 17 node types (currently stub)
- `record_decision()` → persists DecisionTrace + ProvenanceRecord + links
- `replay_decision(id)` → returns ordered trace from graph
- WebSocket push on graph mutation events
- Test: end-to-end fixture seed → frontend graph load

### 7. Backend: Active Inference Service
- Implement `next_best_question(goal_id)` properly
  - Load goal constraints, query UncertaintyAnnotations, score potential questions by EIG
- Implement `update_calibration(agent_id, decision_id, outcome)`
  - Called after an outcome is recorded, updates calibration_score
- Implement `propagate_uncertainty(node_id, depth=2)`
  - When a source EvidenceFragment's uncertainty changes, propagate to linked Mechanisms/Hypotheses

### 8. Frontend: Uncertainty Heatmap Overlay
- GraphCanvas layer toggle: "Uncertainty Heatmap"
- Node glow intensity ∝ uncertainty value
- Color: teal (low uncertainty) → amber → red (high uncertainty)
- Pulse animation for nodes above 0.7 uncertainty

### 9. Bundle Optimization
- Dynamic import for CityOverview (Three.js)
- Dynamic import for GraphCanvas (Cytoscape.js)
- Target: initial bundle < 400KB, Three.js loads on demand

---

## Medium-Term (Iteration 6+)

### 10. Secondary Domain Fixtures
Complete remaining planned domains:
- climate_policy (already partially designed)
- expert_preservation (tacit knowledge capture program)
- sovereign_knowledge (cross-organizational governance)

### 11. Natural Language Query Interface
- Text input → graph query (semantic search via ChromaDB)
- "What decisions have been overridden by institutional authority?" → returns filtered DecisionTrace nodes
- "What experts are calibrated for KRAS pathway questions?" → returns AgentProfile routing

### 12. Knowledge Insurance Model
- `KnowledgeInsuranceClaim`: when deprecated knowledge was used in a decision, link the claim
- `DeprecationNotice`: formal record that a knowledge claim is no longer reliable
- Governance obligation: organizations must notify downstream decision-makers when knowledge they relied on is deprecated

### 13. Multi-Organization Deployment
- Tenant isolation in Neo4j
- Cross-tenant AlignmentMap: organizations can share structural mappings without sharing raw data
- Federated agent calibration: calibration scores pooled across organizations with privacy preservation

### 14. Mobile / Lightweight View
- Current frontend requires desktop (Cytoscape, Three.js)
- Mobile view: text-based decision replay, calibration cards, routing results
- No 3D; optimized for review on phone

---

## Research Questions (Open)

1. **What is the minimum fixture size** for a domain to generate interesting cross-domain bridges? Is 40 nodes enough, or do we need 200?

2. **Can calibration be computed without outcome data?** Current formula requires recorded outcomes. For new agents or new domains, calibration bootstraps from peer assessment. Is this valid?

3. **What is the right granularity for TacitKnowledgeCluster?** Individual skills, skill families, or practitioner profiles?

4. **How do we evaluate open-endedness?** Current metrics (structural novelty rate, bridge density, calibration entropy) are proxies. Is there a principled OEE metric for knowledge graphs?

5. **Can NaturalTransformationCandidate be detected algorithmically?** It requires two existing AlignmentMaps between the same pair of domains. We need at least 2 domains with multiple independent alignment attempts.

6. **What is the right user interface for the free energy gradient?** Uncertainty heatmap is one option. Are there better visual encodings for epistemic risk?

7. **How do expert twins degrade gracefully?** Current design: uncertainty increases over time without corroboration. What is the right decay function? Exponential? Domain-specific?

8. **Can KOS be used as its own research substrate?** Using KOS to represent the research literature on KOS — capturing debates about knowledge representation, disagreements about category theory as transfer infrastructure, evidence for and against specific design choices. This would make the system genuinely reflexive.

---

## Known Technical Debt

- **CityOverview bundle size**: Three.js adds ~1.4MB. Needs dynamic import.
- **MechanismPathExplorer**: Still shallow — needs path traversal visualization upgrade
- **UncertaintyOverlay**: Concept only — needs implementation
- **AlignmentService.compute()**: Returns mock data — needs real functor validation logic
- **next_best_question()**: Stub — needs EIG computation over graph
- **WebSocket graph events**: Interface defined, not connected to frontend
- **Seed script**: Works for existing fixtures, needs extension for new domains

---

## Completed in Iteration 1–3

- ✓ All 17 frontend components at cinematic standard
- ✓ Three demo scripts (90s, 7min, 20min)
- ✓ Five fixture domains (drug_discovery, fukushima_governance, euv_lithography, ai_hardware, governance)
- ✓ All 17 Pydantic models
- ✓ Full FastAPI route layer (stub backend)
- ✓ All 18 architectural documentation files
- ✓ Zero TypeScript errors, clean build
- ✓ Deployed to Vercel (frontend only)
