# Omega — 20-Minute Deep Demo Script

> **Format:** Full architecture walkthrough + interactive exploration. Two presenters optimal (one drives, one narrates), or one confident solo.
> **Audience:** Technical deep dive — PhD researchers, serious architects, potential collaborators who will probe the foundations.
> **Goal:** Leave them convinced the architecture is principled, the data is real, and the research questions are tractable.

---

## 0:00 — The Thesis (90 seconds)

> "I want to start by naming the failure mode we're building against."

> "Fukushima Daiichi nuclear disaster, 2011. Three reactors melted down. 154,000 people evacuated. The proximate cause: a 15.5-meter tsunami that overwhelmed a 5.7-meter seawall."

> "The actual cause: in 2008, TEPCO's civil engineers ran a probabilistic hazard model and returned an estimate of 15.7 meters. They objected formally to the decision to defer upgrading the seawall. Their objection was overruled by corporate management — calibration score 0.31 versus the engineers' 0.76 — and then it was not recorded. Not overruled with reasoning preserved. Erased."

> "The same month, 40 kilometers away: Onagawa nuclear plant. Same earthquake. Same tsunami. Zero reactor failures. The difference: in 1967, civil engineer Yanosuke Hirai departed from the official evidence set, weighted oral tradition from local fishermen, and built a 14.8-meter seawall — nearly five times the regulatory minimum. His tacit judgment — that non-canonical evidence should override canonical evidence when consequences are asymmetric — is not in any procedure. It lives only in the fact that the wall was tall enough."

*[Pause.]*

> "Intelligence — real collective intelligence — requires social infrastructure. Not just a bigger model. Not just better retrieval. The actual plumbing: who knew what, when, with what confidence, under whose authority, what they disagreed about, and whether the disagreement was preserved."

> "Omega is that plumbing."

*[Open landing view. Let the thesis lines cycle.]*

---

## 1:30 — The Architecture Overview (3 minutes)

*[Click Enter the Substrate. GraphCanvas loads.]*

### Six Epistemic Layers

> "Omega structures knowledge into six typed layers. Each has a distinct epistemic function."

- **Evidence (blue)** — raw fragments: assay results, sensor logs, geological surveys. First-class objects with uncertainty annotation, provenance chain, and validation tier (PSV / peer-reviewed / internal / anecdotal). Not embeddings — typed, queryable objects.
- **Context (orange)** — decision traces and precedents. Every decision is a node: structured question, outcome, rationale, evidence IDs, policy IDs, actors. Precedents are decisions invoked as reference cases for subsequent decisions. This is how institutional memory accumulates.
- **Knowledge (green)** — entities, causal mechanisms, hypotheses. Mechanisms are typed: activates, inhibits, regulates, correlates — with confidence scores. Hypotheses carry evidence-for and evidence-against lists.
- **Goal (yellow)** — objectives, constraints, obligations. Constraints are typed: hard (binary gate), soft (weighted preference), deontic (must/must-not/may). Violating a hard constraint generates an exception record.
- **Governance (purple)** — permissions, provenance records, authority chains. Every node mutation is a provenance record with SHA-256 hash of prior state. Full reconstruction is always possible.
- **Agents (teal)** — human experts, AI tools, institutions. Each has a calibration score, a structured belief state, a competence domain, an authority scope, and a dissent history.

*[Toggle layers.]*

---

## 4:30 — Decision Replay: Three Scenarios (6 minutes)

*[Open Replay tab.]*

### Scenario 1: Drug Trial (1 min)

*[Select Drug Trial.]*

> "Phase II oncology trial. Seven steps. The policy gate at step 3 — BBB permeability uncertainty 0.60 exceeds hard constraint threshold 0.40 — blocks progression architecturally. Not a flag. A gate."

*[Advance to Step 5 — MolScreen-v2 preserved dissent.]*

> "AI agent MolScreen-v2 partially dissents. QSAR model: BBB+ probability 0.41, marginally above threshold. Overruled by clinical consensus. Permanently preserved — queryable. If this trial reappears in Phase III, the dissent is surfaced as prior art."

*[Step to Precedent, then Outcome.]*

> "AMG-224 2022 precedent invoked. Applicability 0.82. The system knows the analogous case and its resolution."

### Scenario 2: Fukushima — The Core Demo (3 min)

*[Select Fukushima.]*

*[Advance through Steps 1–4 efficiently, pausing at Step 2 to note uncertainty 0.19.]*

*[Land on Step 5 — the suppressed dissent.]*
*[Red alarm card. Pulsing dot.]*

> "TEPCO Civil Engineering, calibration 0.76. 'The 10-meter deficit is not a modeling uncertainty — it is a physical fact.'"

*[4-second pause.]*

> "Resolution: overruled. Preserved: false. Not in the governance record."

*[IF OMEGA EXISTED panel.]*

> "Calibration 0.76 versus 0.31 — 2.4× epistemic weight. Every future review citing the 2008 assessment inherits this dissent. The decision chain is traceable."

*[Outcome.]*

> "Deferred. 15.5 meters. 40 minutes."

### Scenario 3: 737 MAX (1.5 min)

*[Select 737 MAX.]*

> "Same structural failure mode: authority overriding calibrated objection, no governance channel, no preserved dissent."

*[Step 2 — Boeing FMEA, note conflict of interest, uncertainty 0.71.]*
*[Step 5 — Ed Pierson dissent suppressed.]*

> "Pierson, calibration 0.91. 'I am not comfortable with these airplanes flying.' Classified as labor dispute. Not forwarded to certification. Not recorded."

*[Step 7 — Outcome.]*

> "Approved. 346 fatalities. Pierson's vindication rate: 100%."

---

## 10:30 — The Tacit Knowledge Layer (3 minutes)

*[Switch to Tacit tab.]*

> "Knowledge that can't be written down is still knowledge. Omega has a dedicated layer."

*[Show ASML EUV calibration trace. Point to the codifiability spectrum.]*

> "Five steps codifiable, one fully tacit — step 6: the judgment of whether the droplet stream looks 'quiet'. 6–18 months to transfer. If the engineer retires, the knowledge is gone."

*[Switch to Onagawa trace. Point to Step 2.]*

> "Hirai's departure from the official evidence set. Codifiability: 0.1. The tacit skill is knowing when to go outside the canonical evidence set. You can't write that rule without destroying the skill."

*[Show counterfactual panel.]*

> "The tacit layer is how Omega encodes the difference between the two engineers — same evidence, different judgment, one outcome prevented."

---

## 13:30 — Expert Calibration Layer (2 minutes)

*[Switch to Expert tab.]*

*[Click through TEPCO Civil Engineering (0.76), TEPCO Management (0.31, declining), Ed Pierson (0.91, 100% vindication).]*

> "The calibration ring. The sparkline. The dissent record. The design principle: calibration is earned visibility — higher-calibrated agents receive more epistemic authority in synthesis, not more screen space."

> "Zero recorded dissents in a high-uncertainty environment is information: the agent is suppressing epistemic signals, not expressing confidence."

---

## 15:30 — Cross-Domain Bridges (2 minutes)

*[Switch to Discover tab.]*

*[Click 737 MAX ↔ Challenger bridge. City view auto-activates. Bridge arc glows.]*

> "Structural parallel: authority overriding calibrated objection, organizational silence, single-point failure normalized. Novelty 0.88. Same pattern, 33 years apart."

*[Click climate_policy ↔ fukushima bridge.]*

> "Political-authority discount of scientific calibration. Hayhoe 0.86 vs. COP26 Presidency 0.52. Glasgow coal phase-down language weakened against expert consensus. Structural match to Fukushima."

> "Ten domains. Eight bridges. A structural atlas of how high-consequence failures work — not as case studies, but as graph patterns."

---

## 16:00 — The Distributed Cognition Fabric (90 seconds)

*[Click ◈ Fabric. The CognitionFabricView loads.]*

> "Let me show you the view that contextualizes Omega in the current landscape of distributed AI."

> "In the last year, there's been significant industry thinking about what comes after individual AI agents — distributed cognition at scale. Cisco Outshift calls this the Internet of Cognition: shared intent, shared context, collective innovation. The insight is right: the bottleneck is not model capability. It's semantic isolation. Agents can process; they can't yet accumulate, transfer, and validate structured knowledge across institutional boundaries."

*[Point to the vault nodes.]*

> "Omega's vaults correspond to IoC's local cognition sites. Each has local sovereignty — full, partial, or federated. The governance model governs what leaves the vault, under what permissions, with what scope."

*[Point to the three channel bands.]*

> "Three channels: Shared Intent — aligned purposes, not consensus. Shared Context — governed knowledge exchange. Collective Innovation — abstractions invented collectively that no single vault had alone. The ratchet effect: once a problem is solved in one vault, the abstraction is available to others — but only through a validated, permission-gated transfer."

*[Point to the moving packets.]*

> "These are live transfer packets. The authority-override-of-dissent schema is moving from Fukushima governance to aviation safety to climate policy. It's moving as a structural object — with invariants, loss accounting, and validation tests. Not as a document. Not as a shared embedding. As a first-class governed artifact."

*[Point to the cognition engines bar.]*

> "Six cognition engines sit above the fabric: Transfer, Audit, Guardrail, Expert Twin, Collective Assay, Novelty. Where IoC talks about guardrails and accelerators, Omega makes them concrete: the Audit Engine computes provenance chains; the Guardrail Engine enforces permission gates; the Transfer Engine applies category-theoretic functor maps to move abstractions across domains."

> "What Omega adds beyond current distributed cognition frameworks: provenance depth, executable permissions, tacit knowledge traces, category-theoretic transfer with structural loss accounting, and the ALife insight that collective intelligence must be ecologically open-ended to avoid monoculture."

---

## 17:30 — Research Frontier and Open Questions (90 seconds)

> "Where the formal foundations are solid and where they're conceptual:"

> "Solid: six-layer architecture, decision trace format, calibration-weighted synthesis mechanism, provenance chain with hash-based audit."

> "Open: formal Bayesian update rule for calibration scores (current prototype uses static scores); sheaf-theoretic treatment of ontology alignment using category-theory functors; active inference layer for agent goal-directedness; formal treatment of open-endedness as an evolutionary process."

> "The empirical case studies — Fukushima, 737 MAX, ASML, Challenger, Onagawa — validate the pattern and motivate the architecture. The formal specification is the research program."

---

## 19:00 — Close (60 seconds)

*[Return to graph. Zoom out.]*

> "Which of the 346 people who died in the 737 MAX crashes would be alive if Ed Pierson's dissent had been in a governed substrate, weighted by his 0.91 calibration score?"

*[Pause.]*

> "We can't know. But the architecture that would have given that question an answer is buildable. That's what Omega is."

*[Leave the graph.]*

---

## Q&A Preparation

**"How is this different from existing knowledge management?"**
> "KMS stores documents. Omega stores decisions — with full epistemic genealogy: who decided, what evidence cited, what policies invoked, who dissented, what the calibration differential was. That's architecturally different from document storage."

**"How do calibration scores get maintained?"**
> "Seed scores from domain track records — clinical trial PI calibration, engineering project outcomes, AI model benchmarks. They update when decisions are reviewed against outcomes. The formal update rule is an open research question."

**"Can this be gamed?"**
> "Yes, and intentionally. Gaming the calibration system is a traceable governance event. The system doesn't prevent bad actors — it makes them legible."

**"What does deployment require from organizations?"**
> "Minimum: a decision logging protocol capturing question, actors, evidence cited, outcome. Less demanding than most compliance systems. Full value — calibration, precedent search, cross-domain bridges — accrues over time."

**"What's the relationship to active inference / free energy principle?"**
> "The agent layer is designed to accommodate an active inference formalization — treating goal-directed agents as free-energy minimizers whose beliefs and policies we track explicitly. The architecture is compatible; the implementation is future work. The AIF framing is most natural for the collective inference service — routing questions to minimize expected information gain."
