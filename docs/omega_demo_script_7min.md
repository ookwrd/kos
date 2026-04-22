# Omega — 7-Minute Demo Script

> **Format:** Structured walkthrough with questions planted at each section break. Screen-driven.
> **Audience:** Technical collaborators, research lab directors, serious investors — people who can evaluate an architecture.
> **Goal:** Leave them convinced that (1) the problem is real, (2) the architecture is novel, (3) this team understands both.

---

## 0:00 — The Problem (60 seconds)

> "Let me start with a question. When an oncology trial committee approves a drug, how much of what they knew is preserved?"

*[Wait.]*

> "The approval document. Maybe the minutes. None of the dissents that were overruled. None of the calibration history of the people who voted. None of the evidence uncertainty. None of the precedents they implicitly invoked."

> "And when that drug harms someone in Phase III — or when it succeeds but the mechanism is never understood — the knowledge that produced that decision is gone. It lived in people's heads, in emails, in hallway conversations."

> "This is true for drug trials. It's true for nuclear plant safety decisions. It's true for every knowledge-intensive institution that matters."

> "Omega is what social infrastructure for collective intelligence looks like when you actually build it."

*[Open the landing view. Let the thesis lines cycle once.]*

---

## 1:00 — The Architecture (90 seconds)

*[Click Enter Omega. The GraphCanvas loads.]*

> "Seven layers. Each one is a different epistemic type."

*[Toggle layers on one by one, pointing to the node shapes:]*

**Evidence** (blue, rounded rectangles)
> "Raw evidence fragments — assay results, sensor data, historical records. Each carries uncertainty and media type. These aren't stored as embeddings — they're first-class objects with provenance."

**Context** (orange, diamonds)
> "Decision traces and precedents. Every decision made in this system is a node. Every piece of evidence it cited, every policy it invoked, every actor who participated — all linked."

**Knowledge** (green, hexagons)
> "Entities and mechanisms. Causal relationships. Hypotheses with their evidence for and against. This is the 'what we believe' layer."

**Goal / Governance / Agents**
> "Who wants what, under whose authority, with what calibration history."

*[Switch to dagre layout → concentric layout. Let it rearrange.]*

> "Three layout modes: hierarchical, concentric by layer, and grid. Same data, different epistemic frames."

---

## 2:30 — The Signature Experience: Decision Replay (90 seconds)

*[Open the Replay tab. Drug Trial is loaded.]*

> "This is what makes Omega feel different from a knowledge graph. Decision Replay."

*[Hit play.]*

**Step 1 — Question**
> "The question: does the CNS-targeting compound meet efficacy and safety thresholds for Phase II? Framed, timestamped, actor-attributed."

**Step 2 — Evidence** *(hits automatically)*
> "KRAS G12C binding data retrieved. Uncertainty 0.12 — high confidence. The system knows where this came from and who validated it."

**Step 3 — Policy Gate** *(pause here)*
> "BBB permeability. Current value 0.54. Threshold 0.60. Violated."

*[Let that land.]*

> "This is a hard constraint — not a soft preference. The system flagged it. And yet..."

*[Continue to step 4 — Dissent.]*

> "Dr. Sarah Chen dissented. Calibration 0.84 — she's been right 84% of the time in analogous decisions. Her reasoning: the permeability concern is real but outweighed by mechanism novelty."

*[Step to Outcome.]*

> "Conditional approval. The dissent is preserved. Not overwritten. Not footnoted. A first-class record that will be surfaced in any future analogous case."

*[Switch to Fukushima tab.]*

> "Same replay structure. Different domain. The 2008 TEPCO seawall decision — management overriding engineering estimates. The override is in the record. The calibration of the people who were overruled is in the record."

> "This is how you build institutional memory that actually learns."

---

## 4:00 — The Council and Collective Assay (75 seconds)

*[Switch to Council tab.]*

> "Six agents across three domains. Mix of human experts, AI systems, and institutional agents."

*[Click Dr. Sarah Chen.]*

> "Calibration ring — 84%. Belief state bars: KRAS target validity at 87%, CNS penetration viable at 61%. These beliefs are updated by decision outcomes, not just by assertion."

*[Click TEPCO Management.]*

> "Calibration: 31%. Beliefs almost inverted from the engineering team. This isn't tagged as 'wrong' — it's preserved as a divergence signal. The system asks: why do two well-specified agents disagree? That gap is an epistemic opportunity."

*[Switch to Assay tab. Run the Fukushima assay.]*

> "Collective assay: 'Should the seawall be raised to 15.7m?' Five agents respond. Synthesis is calibration-weighted — TEPCO management's low calibration pulls their 85% confidence down. The engineering team's disagreement at 82% confidence, with 0.76 calibration, dominates."

*[Show the constraint violation.]*

> "Constraint violated: 'Cost exceeds authorized budget allocation.' Blocked. The system doesn't just synthesize opinion — it enforces the governance structure."

---

## 5:15 — The ALife Layer: Nested Agency (60 seconds)

*[Switch to Agency tab. The concentric rings appear.]*

> "This is the architectural thesis visualized. Not my idea — it comes from artificial life research."

*[Click the Expert ring.]*

> "Individual expert twins. Calibration histories, self-models, authority scopes. Analogous to organisms: stable identities, goals, the ability to dissent."

*[Click the Institution ring.]*

> "Institutional agents — collective decision-makers with permission boundaries. Analogous to superorganisms: internal specialization, external boundary."

*[Click the Substrate ring.]*

> "The full Omega substrate. Multiple domains interacting through shared governance. Analogous to a biosphere: open-ended evolution, no fixed fitness target."

> "Intelligence isn't located at one level. It's a pattern across all of them. The substrate is what makes that pattern *composable*."

---

## 6:15 — What's Next / The Open Questions (45 seconds)

> "Three things we're building toward."

> "First — formal active inference integration. Right now calibration is a heuristic. The right formalism is expected information gain under a Markov blanket. The architecture is designed for it."

> "Second — cross-domain alignment. The Fukushima precedent should be able to inform a future nuclear energy governance decision. Today that requires a human bridge. The functor-theoretic alignment layer is sketched — it needs empirical development."

> "Third — open-ended graph evolution. New entity types, new relationship schemas, new domains — all governable. The GraphChangeProposal mechanism exists. Automated novelty detection is next."

> "We're not building general intelligence. We're building the social infrastructure that makes collective intelligence legible, auditable, and evolvable. The model is a component — the substrate is the product."

---

## Notes for Presenter

**Questions to plant during the walk:**
- After architecture: "What's the difference between this and a property graph with metadata?" → "The write path. Every mutation is a decision trace, not just a record update."
- After replay: "How does this scale to real institutions?" → "The graph is append-only. Decisions accumulate. The replay algorithm is O(depth) not O(all decisions)."
- After council: "Isn't calibration just another form of authority?" → "It's earned authority — updated by outcomes, not assigned by position. That's the key difference."

**What NOT to do:**
- Don't show the code.
- Don't explain Neo4j.
- Don't use the word "RAG."
- Don't apologize for any component that looks rough — let them wonder what's behind the next tab.
