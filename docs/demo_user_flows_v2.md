# Demo User Flows V2

*Updated user journeys for the v3 Omega demo, including new domains and transfer demonstrations*

---

## Audience Segments

| Segment | Time | Signature Moment |
|---|---|---|
| Hallway demo | 2 min | Cross-domain serendipity: "The graph found a connection you didn't search for" |
| Research seminar | 15 min | Active inference routing: TEPCO calibration signal |
| Technical deep-dive | 40 min | Transfer machinery: functor validation + structural loss |
| Investor/funder | 8 min | Knowledge cities: the 7-domain map with live bridges |

---

## Flow 1: The 2-Minute Serendipity Demo

**Opening state**: CityOverview showing all 7 domain cities. Nothing highlighted.

**Step 1** (30s): Gesture toward the SerendipityPanel. "The graph runs continuous novelty detection. These are structural parallels it found without being asked."

**Step 2** (30s): Click "bridge-deviance-normalization" — highest novelty score 0.91. The bridge arc between `extreme_environments` (O-ring data) and `fukushima_governance` (seawall decision) lights up. "NASA's 1986 launch decision and TEPCO's 2008 seawall decision have the same decision-graph structure — authority overriding calibrated expert dissent under schedule pressure."

**Step 3** (45s): Click through to the bridge detail. Show the structural parallel: `Roger Boisjoly → dissent → Launch Director` matches `TEPCO Civil Engineer → dissent → TEPCO Management`. Same node types, same morphisms, different domains.

**Closing** (15s): "KOS didn't know about NASA when we put in the Fukushima data. It found the parallel. That's what a knowledge operating system can do that a document retrieval system cannot."

---

## Flow 2: The 15-Minute Research Seminar

### Part A: The Knowledge Cities (3 min)

Start in CityOverview. Walk through the 7 cities:
- drug_discovery: KRAS pathway, trial committee
- fukushima_governance: TEPCO, seawall decision
- euv_lithography: ASML, pre-pulse tacit knowledge
- math_category_theory: formal infrastructure (meta-level)
- surgical_robotics: da Vinci, trocar entry tacit knowledge
- semiconductor_hardware: etch process, yield governance
- extreme_environments: Challenger, normalization of deviance

Point out the bridge arcs — 5 active cross-domain connections. "Each arc is a proposed structural parallel, reviewed and approved by the governance layer."

### Part B: The Calibration Signal (4 min)

Navigate to DecisionReplay. Select "Fukushima: 2008 Seawall Decision." Play through:
- Step 1: TEPCO Civil Engineer recommends 15m seawall. Calibration score: 0.76.
- Step 2: TEPCO Management approves 5.7m. Calibration score: 0.31.
- Step 3: Dissent record preserved.

"TEPCO Management's calibration score is 0.31. That's not a moral judgment — that's a measurement. They were overconfident and wrong, repeatedly. The graph tracks this. Future queries in nuclear safety will deprioritize this agent."

Navigate to AgentCouncilView. Click TEPCO Management. Show the calibration ring — deep red at 0.31. Click the calibration history. "Every decision where they stated high confidence and were wrong is recorded here. This is what earned authority looks like when it fails."

### Part C: The Cross-Domain Bridge (5 min)

Navigate to OntologyBridgeView. Select the `extreme_environments → fukushima_governance` bridge.

Walk through the 4 structural mappings:
- O-ring (failed component) ↔ seawall (failed infrastructure): exact match
- NASA Launch Director decision ↔ TEPCO Management decision: exact match
- Roger Boisjoly dissent ↔ TEPCO Civil Engineer dissent: exact match
- Cold weather protocol threshold ↔ seawall height constraint: partial match (different physics, same governance structure)

"62% structural coverage. The 38% gap is real: extreme environments have no equivalent to nuclear liability law. The ontological gap is a research finding, not an implementation artifact."

### Part D: Transfer with Loss Accounting (3 min)

Navigate to the `TransferOperator` panel (new in v3). Select the `bridge-tacit-skill` transfer: surgical_robotics haptic calibration → euv_lithography pre-pulse calibration.

Show the `StructuralLossReport`: "The physical substrate is entirely different. The 'feel' of correct trocar entry cannot be directly trained for pre-pulse calibration. What transfers is the *meta-skill*: how to recognize a pattern that cannot be fully described in words. The loss is logged, the transfer is approved with caveats."

"KOS doesn't pretend transfers are lossless. It makes the losses explicit. That's the scientific integrity argument."

---

## Flow 3: The 40-Minute Technical Deep-Dive

### Module 1: Architecture (10 min)

Walk through the six layers: evidence, context, knowledge, goal, governance, agents.

Show `backend/kos/models/` — all Pydantic models. Demonstrate how a `DecisionTrace` links to `ProvenanceRecord` links to `EvidenceFragment`.

Show the AlignmentMap model — `OntologyMapping` with `score` and `structural_loss`. "This is a partial functor in code. The mappings are the functor assignments. The gaps are where the functor fails."

### Module 2: Category Theory Layer (10 min)

Navigate to `math_category_theory` domain in CityOverview. Explain the reflexive structure: "KOS uses functors as its transfer model. This domain represents functors as knowledge objects. KOS models its own foundations."

Show `FunctorCandidate` validation: the checklist of coherence conditions. "We're not just naming this a functor — we're checking the categorical axioms: does composition preserve structure? Are the mappings coherent? Where does it fail?"

Show `NaturalTransformationCandidate`: "We found two different ways to align drug_discovery to fukushima_governance. This object asks: are those two translations systematically related? Can we move between them?"

### Module 3: Active Inference Layer (10 min)

Navigate to InferencePanel. Query: "Was the 2008 seawall decision defensible given available evidence?"

Show the routing result: Dr. Sarah Chen gets low routing priority (wrong domain). Identify what should be the top-routed agent: a historical risk analyst with high calibration in nuclear safety governance.

Explain EIG formula. Show calibration × competence × uncertainty. "TEPCO Management has high domain familiarity but low calibration. The routing formula penalizes overconfidence."

Show next_best_question output for the fukushima goal set. "To most efficiently resolve the key constraint — was the evidence sufficient for the 15m recommendation? — the system recommends asking: what were the confidence intervals on the tsunami probability estimates in the 2008 TEPCO safety review?"

### Module 4: Open-Endedness Layer (10 min)

Navigate to GraphEvolutionTimeline. Show the 5 active proposals.

Click "Scan novelty." Show how the open_endedness layer generates new proposals by detecting sparse neighborhoods and structural holes.

Show a `GraphChangeProposal` being created live: "The graph just proposed adding a `TacitKnowledgeCluster` entity for the pre-pulse calibration knowledge. It noticed that the EUV lithography domain has agents with high tacit knowledge flags but no structured capture nodes."

Show governance review: accept the proposal. Watch the new node appear in GraphCanvas.

"The graph extended itself. We didn't write code for this specific proposal. The system's own novelty detection found a gap and proposed a fix."

---

## Flow 4: The 8-Minute Funder/Investor Demo

### Opening: The Problem (1 min)

"Organizations have massive knowledge assets they can't access. Not because the knowledge isn't recorded — it's because it's recorded in incompatible systems, in incompatible formats, with incompatible vocabularies. And when experts retire, the tacit knowledge just... disappears."

### The System (2 min)

CityOverview: 7 knowledge cities, 5 bridge arcs. "Each city is a domain with its own vocabulary and governance. The arcs are validated structural connections discovered by the system."

"This is not a search engine. The bridges were found, not searched. The graph tells you what you didn't know to look for."

### The Business Case (2 min)

"A surgical robotics company loses a senior surgeon's 20 years of tacit knowledge when they retire. KOS can capture that knowledge structurally — not as text, but as linked nodes with uncertainty scores, connected to the equipment they used, the decisions they made, the cases where their judgment was decisive."

"An EUV fab loses a process engineer's intuition when they leave. KOS maintains an expert twin — a structured representation of their epistemic state, with explicit degradation as the domain evolves."

### The Differentiator (2 min)

Navigate to AgentCouncilView. Show TEPCO Management (0.31 calibration) vs. TEPCO Civil Engineer (0.76).

"Standard knowledge systems treat institutional authority as epistemic authority. KOS doesn't. The calibration score is computed from track records, not from org charts. In this demo, the junior engineer's judgment is worth more than the institutional authority's judgment — because the evidence says so."

### The Roadmap (1 min)

Navigate to NEXT_STEPS (or describe): "Live calibration updates, full backend integration with Neo4j, natural language query interface, multi-organization deployment, knowledge insurance (who is responsible for deprecated knowledge claims). This is a research prototype, but the infrastructure is real."

---

## V3 Component Requirements for These Flows

| Flow Step | Component Needed | Status |
|---|---|---|
| Serendipity moment | SerendipityPanel.tsx | To build (v3) |
| Transfer machinery | TransferOperatorView.tsx (or extend OntologyBridgeView) | To build (v3) |
| 7-domain city view | CityOverview.tsx with new domains | To update (v3) |
| Next-best-question | Extend InferencePanel.tsx | To update (v3) |
| Novelty scan live | GraphEvolutionTimeline (already has scan button) | Done |
| Calibration detail | AgentCouncilView (already has detail view) | Done |
