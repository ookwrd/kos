# Omega V8 — AutoResearch Plan

*April 2026*

---

## ARC Status

AutoResearchClaw is **fully operational** locally at `/Users/okw/Code/codex/universal/AutoResearchClaw/`.

- Python 3.12 ✓
- API key active ✓
- Models available: gpt-5, gpt-4.1, gpt-4o ✓
- Mode: sandbox (no Docker, no LaTeX compilation)
- Launcher: `./run-topic.sh "<topic>"`

All outputs saved to `docs/autoresearch_runs/`.

---

## Research Batch Plan

### Batch 1 — Drug Discovery: KRAS/CNS/BBB
**Topic:** "KRAS G12C inhibitor CNS penetration: blood-brain barrier challenge in metastatic NSCLC"
**Goal:** Enrich drug discovery evidence nodes with real mechanistic content on BBB/CNS uncertainty. Ground the Phase II decision trace in real literature.
**Target artifacts:**
- BBB penetration mechanism node with real assay data
- CNS metastasis prevalence evidence fragment
- Updated `dec-trial-approval-2024` decision trace rationale
- Transfer opportunity: process window ≡ therapeutic window (EUV → drug_discovery)

**Run command:**
```bash
cd /Users/okw/Code/codex/universal/AutoResearchClaw
./run-topic.sh "KRAS G12C inhibitor CNS penetration blood-brain barrier challenge sotorasib adagrasib metastatic NSCLC clinical trial decision"
```

---

### Batch 2 — Governance Failure Schema: Normalization of Deviance
**Topic:** "Normalization of deviance as institutional failure mechanism: Challenger, Fukushima, 737 MAX structural comparison"
**Goal:** Ground the cross-domain governance transfer claim. Generate source citations for the shared mechanism. Strengthen the comparative replay evidence base.
**Target artifacts:**
- Shared mechanism node: `mech-deviance-normalization-schema`
- Evidence citations for all three cases
- Structural comparison table
- Transfer claim grounding for `bridge-deviance-normalization`

**Run command:**
```bash
./run-topic.sh "normalization of deviance Challenger Fukushima 737 MAX organizational silence structural comparison governance failure mechanism Diane Vaughan"
```

---

### Batch 3 — Transfer Science: Structural Invariants and Lawful Analogy
**Topic:** "Category-theoretic transfer and lawful analogy: structural invariants that survive domain change"
**Goal:** Ground the Transfer Workbench architecture in real literature on analogical transfer, structure mapping, and formal invariants.
**Target artifacts:**
- Structural mapping theory (Gentner 1983) reference node
- Category theory as transfer substrate (Spivak ologs) evidence fragment
- Validation protocol for transfer claims
- What constitutes a "lawful" vs. "merely plausible" analogy

**Run command:**
```bash
./run-topic.sh "structural invariants lawful analogy category theory transfer learning Gentner structure mapping ologs Spivak formal transfer framework"
```

---

### Batch 4 — Expert Calibration: Epistemic Credentials vs. Institutional Authority
**Topic:** "Expert calibration and dissent vindication: when institutional authority overrides epistemic credentials and the outcome"
**Goal:** Ground the agent calibration model in real literature. Support the claim that track-record-based calibration is different from self-reported confidence.
**Target artifacts:**
- Epistemic calibration literature (Tetlock superforecasters) evidence node
- Historical cases where dissent was vindicated post-hoc
- Calibration scoring framework grounding

**Run command:**
```bash
./run-topic.sh "expert calibration epistemic credentials institutional authority dissent vindication Tetlock superforecasters track record prediction accuracy overconfidence"
```

---

## Output Structure

Each ARC run produces output at:
```
docs/autoresearch_runs/<topic-slug>/
  run_metadata.json         — topic, config, model, real/simulated flag
  sources.md                — source list with trust scores
  claims.md                 — extracted claims with confidence
  contradictions.md         — disagreements and ambiguities
  abstractions.md           — candidate abstractions
  omega_artifacts.json      — knowledge objects ready for import
  transfer_opportunities.md — bridges identified
```

---

## Import Protocol

ARC artifacts feed into Omega through:

1. **Evidence nodes**: Each source with DOI/reference → new `EvidenceFragment` in `demoData.ts` with `source_type`, `source_title`, `year`, `extracted_claim`, `confidence`, `contestability`
2. **Mechanism nodes**: Key mechanisms identified → added to the relevant domain fixture
3. **Bridge candidates**: Transfer opportunities → added to `SerendipityPanel` DEMO_BRIDGES
4. **Research trace**: Each batch becomes one entry in `ResearchTraceView` DEMO_TRACES

---

## Honest constraint

ARC runs in sandbox mode (no Docker). Output is LLM-synthesized research, not primary-source extraction. All ARC-produced claims are labeled `source_type: "arc_synthesized"` and treated as `hybrid` grounding. They are valuable as structured research scaffolding, not as primary citations. Primary citations (Ostrem 2013, NAIIC 2012, etc.) remain manually verified.
