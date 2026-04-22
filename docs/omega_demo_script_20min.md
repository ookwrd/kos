# Omega — 20-Minute Demo Script

> **Format:** Deep technical walkthrough with time for genuine exploration. Suitable for co-design sessions, research presentations, and lab meetings. Presenter should be comfortable with improvisation — this script provides structure and talking points, not a teleprompter.
> **Audience:** ACI/AGI researchers, ML engineers building agent systems, institutional knowledge experts.
> **Goal:** End with a concrete collaboration discussion. The audience should be able to point at something specific they want to help build.

---

## 0:00 — Framing the Problem Space (3 minutes)

### The Core Tension

> "The dominant approach to AI for knowledge work right now is: build a bigger model, fine-tune it, give it tools, wrap it in an agent loop. And that works — up to a point."

> "The point where it breaks: accountability. When the model makes a decision, who decided? When it's wrong, what was the reasoning? When it conflicts with another model, which one do you trust?"

> "These aren't engineering problems. They're epistemological problems. And they're much older than AI."

*[Pause. Let it breathe.]*

> "Collective intelligence researchers have studied these questions for decades — in the context of scientific communities, expert panels, juries, corporate boards, nuclear regulatory bodies. The finding is consistent: the quality of collective intelligence is not a function of individual intelligence. It's a function of *how information flows between agents*, and specifically how dissent, uncertainty, and provenance are handled."

> "Omega is an attempt to operationalize those findings as software infrastructure."

### What Omega Is Not

> "Three things Omega deliberately is not:"

> "Not a monolithic AGI. Omega has no 'brain.' The intelligence is distributed — between the agents, in the patterns of past decisions, in the calibration histories."

> "Not a chat interface with a graph. The graph is not a retrieval index. It's the primary representation. Queries are graph traversals, not similarity searches."

> "Not a RAG system. Retrieval-augmented generation retrieves evidence *for* a model. Omega records the decision *about* evidence — who evaluated it, under what constraints, with what dissent."

---

## 3:00 — The Seven-Layer Architecture (4 minutes)

*[Open GraphCanvas. Start with all layers visible in dagre layout.]*

### Layer 1: Evidence

> "Everything starts here. An EvidenceFragment is the atomic unit of the knowledge substrate. KRAS G12C binding data from a molecular docking run. A BBB permeability assay at 0.60. The tsunami deposit record from the Jogan earthquake in 869 AD."

> "Each fragment carries: source type, media type, uncertainty value, validation status, and provenance chain. It's not a document. It's a data type."

*[Toggle to evidence layer only. Show the blue nodes.]*

### Layer 2: Context Graph

*[Toggle on context layer. Orange diamond nodes.]*

> "This is the most novel layer. Every decision that uses evidence produces a DecisionTrace node. Every DecisionTrace links to: the question it answered, the evidence it cited, the policies it invoked, every actor who participated, and any dissents that were raised."

> "The result is a persistent, queryable record of *reasoning* — not just conclusions. You can replay any past decision exactly as it happened, with the uncertainty values that existed at that time."

### Layer 3: Knowledge

*[Toggle on knowledge layer. Green hexagons.]*

> "Entities, mechanisms, hypotheses. The KRAS → MEK → ERK activation cascade. The hypothesis that EUV pre-pulse timing is the primary determinant of plasma stability. Causal graphs. Confidence scores. Evidence for and against."

> "This is the 'what we believe' layer. Unlike a traditional ontology, every claim here has a provenance chain and uncertainty annotation."

### Layers 4–7: Goal, Governance, Agents, Evolution

*[Toggle layers in sequence as you describe each.]*

> "Goal graph: who wants what, at what priority, with what metric. Goals can conflict — the system detects that."

> "Governance graph: permissions, obligations, provenance records. Who has authority over what, with what expiry conditions."

> "Agent ecology: AgentProfile nodes with calibration histories, belief states, competence vectors, delegation chains, and dissent records. Both human and AI agents."

> "Evolution layer: GraphChangeProposal nodes — proposed new node types, edge schemas, cross-domain bridges. The system can propose its own evolution, subject to governance review."

### Layout Modes

*[Switch dagre → concentric → grid. Let each layout render.]*

> "Three layout modes. Dagre is a hierarchical left-to-right — good for understanding causality. Concentric shows layer membership — good for understanding which epistemic type owns a node. Grid is a flat audit view."

---

## 7:00 — Decision Replay: The Signature Feature (4 minutes)

*[Open Replay tab. Drug Trial loaded.]*

### The Write Path

> "Let me explain how a decision gets into the system before we replay it."

> "When a decision is made, the actor — human or AI — calls record_decision(). This creates a DecisionTrace node and a sequence of replay steps. Each step is typed: question, evidence, policy, actor, dissent, precedent, outcome."

> "Every evidence step links to specific EvidenceFragment nodes. Every policy step links to Constraint or Obligation nodes. Every actor step records the agent's belief state at the time of the decision."

> "This isn't logging. It's structured epistemological bookkeeping."

### Replay — Drug Trial

*[Hit play. Walk through each step, narrating.]*

**Step 1 — Question:**
> "The question, as posed. Timestamped. Actor-attributed. The context of the decision."

**Step 2 — Evidence (KRAS binding):**
> "Evidence retrieved. Uncertainty 0.12 — low. Validated by Dr. Chen. Note the provenance link — you can click through to the full chain."

**Step 3 — Policy Gate:**
> "BBB permeability constraint check. Current value 0.54, threshold 0.60. Violated. The system doesn't soft-fail here — this is a hard gate."

**Step 4 — Dissent:**
> "Dr. Chen's dissent is recorded. Calibration 0.84. Reasoning preserved verbatim. Dissent status: preserved — it will appear in future analogous decisions."

**Steps 5–7 — Precedent, Actor, Outcome:**
> "The Gleevec precedent invoked. Committee deliberation. Conditional approval with monitoring mandate."

### Replay — Fukushima

*[Switch to Fukushima tab.]*

> "Different domain. The 2008 seawall height decision. Walk through it — notice the TEPCO management override in step 3. The civil engineering team's estimate of 15.7m was dismissed as 'economically unfeasible.'"

*[Pause at the policy violation.]*

> "The constraint at the time required 5m height minimum. It was satisfied. So the decision was recorded as compliant. But the *dissent* from the engineering team — recommending 15.7m — is also in the record."

> "In 2011, when the 14.1m tsunami hit, the system would have surfaced that dissent immediately. The question 'who knew, and when' has a traceable answer."

---

## 11:00 — The Agent Ecology (3 minutes)

*[Switch to Council tab.]*

### Calibration as Earned Authority

> "Six agents. Three domains. Let me explain calibration first."

*[Click TEPCO Management.]*

> "Calibration score: 0.31. This isn't an assessment of intelligence. It's a retrospective score: across past decisions analogous to this one, how often did this agent's confidence match the eventual outcome?"

> "TEPCO management was highly confident that Jogan-scale events were rare. They were wrong. Their calibration decayed accordingly."

*[Click TEPCO Civil Engineering.]*

> "Calibration: 0.76. The engineering team was uncertain but directionally correct. Their calibration is higher — not because they have better titles, but because they had better epistemic practices."

> "This is the key idea: authority in Omega is *earned* by track record, not assigned by position."

### Belief State as Structured Disagreement

> "Each agent has a belief state — a dictionary of propositions and confidence values. When agents disagree, the system doesn't average. It records the disagreement as a signal."

*[Compare Dr. Chen and MolScreen-v2 belief bars for CNS penetration.]*

> "Chen at 61%, MolScreen at 54%. Both uncertain. The *gap* between them — 7 points — is an epistemic opportunity. What evidence would resolve it? That's the next-best-question query."

### Collective Assay

*[Switch to Assay tab. Run Fukushima assay.]*

> "Calibration-weighted synthesis. The math is simple — confidence * calibration, normalized — but the semantics are significant. A 95% confident uncalibrated agent contributes less than a 70% confident highly calibrated one."

*[Show constraint gate.]*

> "And the constraint is enforced. No matter what the agents believe, if the governance constraint says 'cost must not exceed allocation,' that's a gate."

---

## 14:00 — Cross-Domain Bridges and Open-Endedness (2 minutes)

*[Switch to Alignment tab. OntologyBridgeView.]*

> "Three domains in Omega now. Drug discovery, Fukushima governance, EUV lithography. They're not isolated — the system proposes bridges."

> "A 'bridge' is an AlignmentMap node. It says: this entity type in domain A has a functor-compatible mapping to this entity type in domain B. With gaps marked explicitly."

*[Show the red gap nodes.]*

> "The gaps are as important as the mappings. A gap means: there's a structural difference between how these two domains represent something. That difference is either an opportunity to learn, or a genuine ontological boundary."

*[Switch to Agency tab briefly.]*

> "The ALife framing: think of domains as ecosystems. The alignment layer is the 'atmospheric layer' through which they interact. Evolution happens at the domain level — new entity types, new schemas — but governed by the substrate."

---

## 16:00 — Open Research Questions (2 minutes)

> "Where Omega is genuinely underdeveloped, and where collaboration would be most valuable:"

**1. Formal Active Inference**
> "Right now, 'next best question' is an EIG heuristic — expected information gain estimated from uncertainty annotations. The right formalism is active inference under a Markov blanket. We've sketched it in docs/research/02_alife_multiscale_cognition.md. It needs someone who actually works in predictive processing."

**2. Categorical Functor Alignment**
> "The bridge layer is conceptually grounded in olog theory — Spivak and Kent's work. The automated learning of functors between domain ontologies is unsolved. There's work in category theory applied to knowledge representation that may apply."

**3. Calibration Dynamics**
> "How should calibration decay over time? How does it transfer across domains? The current model is naive — exponential decay with manual domain weighting. There's a formal theory of epistemic calibration waiting to be properly integrated."

**4. Dissent Topology**
> "Which patterns of dissent correlate with better long-term outcomes? We have the data structure to study this — but no empirical framework yet. This is an interdisciplinary question: epistemology + ML + organizational theory."

---

## 18:00 — What We're Building Next (1 minute)

> "Three immediate priorities:"

> "Multi-domain alignment: automated bridge proposal between any two domain packs, with human review gating. The architecture is ready — the algorithm needs work."

> "Temporal reasoning: right now all beliefs are point-in-time snapshots. We need belief evolution over decision sequences — how did confidence in this hypothesis change as evidence accumulated?"

> "Deployment path: Neo4j + ChromaDB + FastAPI backend is running. The frontend demo is standalone. The integration layer — connecting live agent activity to the graph write path — is the next engineering sprint."

---

## 19:00 — Discussion Prompt (1 minute)

> "I want to end with a question, not a pitch."

> "What is the hardest problem in your field that is fundamentally a problem of collective knowledge — where the answer exists, distributed across people and documents and past decisions, but cannot be assembled?"

*[Let them respond.]*

> "Because that's the problem Omega is designed to solve. The question for us is whether the architecture we've built is the right one for your specific version of it."

---

## Notes for Presenter

**If they ask about the backend:** It's FastAPI + Neo4j + ChromaDB. The frontend demo runs on static fixture data so it works offline. The live backend connects via WebSocket for real-time graph updates.

**If they ask about the agent loop:** Omega doesn't prescribe an agent architecture. It provides the *record-keeping infrastructure* that any agent can write to. You can use LangChain agents, AutoGen, or custom code — as long as they call the KOS write path.

**If they ask about cost:** We haven't run production load tests. Neo4j Community handles the demo comfortably. At institutional scale (10k decisions/day), we'd need Neo4j Enterprise or migration to a distributed graph store.

**If they ask about privacy:** Every node has a governance layer. Permissions are first-class. A `sovereign` sensitivity tier exists for data that should never cross domain boundaries. The architecture supports data residency.

**If they push on the ALife framing:** It's a conceptual map, not an implementation claim. The nested agency visualization is illustrative — we're not running ALife simulations. The claim is that the *design principles* from ALife research (nested identity, emergent individuality, open-ended evolution) are the right ones for building collective intelligence infrastructure.
