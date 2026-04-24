# Omega V8 — Investor Functionality Review

*April 2026 — Pre-build honest accounting. No marketing language.*

---

## A. What is already genuinely impressive

### 1. DecisionReplay — Fukushima scenario
This is the strongest thing in the prototype. The suppressed-dissent alarm card (step 5) is a real product moment: it shows a named actor (TEPCO Civil Engineering, calibration 0.76) filing a formal objection, being overridden by a lower-calibrated authority (TEPCO Management, 0.31), and the record being erased. The "If Omega existed" counterfactual panel makes the value proposition concrete in a way that no amount of architectural description can match. This is the demo's emotional anchor and it works.

What makes it real: the Jogan 869 AD tsunami study is historically documented. The PTHA 2008 projection of >10m is in the IAEA Fukushima Accident Report. The calibration asymmetry is a principled demo construct, not random. The step structure (trigger → evidence → policy → dissent → outcome) mirrors the actual decision trace data model.

### 2. Transfer Workbench — structure is serious
The TransferWorkbench component has a real architecture: source mechanism → abstraction extraction → invariant identification → competing translators → structural loss accounting → validation protocol. The EUV calibration → surgical robotics case is the cleanest example. Competing translators (sensorimotor vs. PID framing) with explicit divergence note is a genuinely novel product concept. No current tool has this.

### 3. Tacit Trace Viewer — codifiability spectrum
The ASML droplet calibration trace with the "Step 6: the tacit judgment that cannot be written down" annotation is more intellectually honest and precise than anything in the GraphRAG or enterprise knowledge management space. The codifiability spectrum (0.0 → 1.0 on each step) is a useful, original concept.

### 4. The six-layer architecture is coherent
Evidence → Context → Knowledge/Mechanism → Goal/Agency → Governance → Collective Agent Ecology is a defensible and non-trivial decomposition. It correctly identifies the gap between "storing knowledge" and "acting on it under governance." The explanation of why this differs from GraphRAG, chain-of-thought, and multi-agent frameworks is accurate and not obvious.

### 5. The serendipity bridge concept
Structural transfer across independent domains (normalization of deviance in aerospace = normalization of deviance in nuclear = regulatory capture in pharma) as first-class objects is a genuine contribution. The bridge-deviance-normalization entry correctly identifies three empirically independent instances of the same governance failure mechanism. This is the right framing. It is understated in the demo.

---

## B. What still feels like demo theater

### 1. The 3D city view leads the experience
The city view takes 100% of the center canvas on load if selected. It looks impressive — 24 glowing domains, federation regions, bridge arcs. But it teaches nothing about what Omega does. "24 knowledge cities" is a scale claim with no functional payoff. A sophisticated investor sitting through the city view for 90 seconds learns that Omega has a 3D interface. They do not learn that it preserves institutional memory, enables calibration-weighted governance, or transfers validated abstractions. The map is eating the territory.

### 2. Node counts and calibration scores are fabricated
The building height in the city view scales to DOMAIN_NODE_COUNTS which are invented integers. In demo mode the actual graph has zero live nodes. Calibration scores (0.76, 0.31, 0.91) are principled constructs — they were assigned to be plausible given what we know about the historical actors, but they are not formally computed. These fabrications are not dishonest for a prototype, but they must be labeled.

### 3. Research flow is invisible
The demo claims to be "infrastructure for collective intelligence" but shows no active knowledge-building. There is no view that shows: a research question being investigated, sources being evaluated, claims being extracted, contradictions being flagged, abstractions being proposed. The system looks like a static browser of pre-loaded knowledge. This is the biggest gap between what Omega claims to be and what the demo shows.

### 4. The Transfer Workbench is buried
The single most differentiating component is at right sidebar → "⇕ Transfer" tab — sixth from the top, not labeled on first load, not mentioned in the landing screen, not part of the first-click flow. An investor who does not explore systematically will never see it.

### 5. Expert council looks like roleplay
The agent council currently shows agent cards with confidence bars and competence badges. The data is plausible — TEPCO Management at 0.31, Ed Pierson at 0.91 for Boeing safety — but without calibration history, vindication records, and domain envelopes, it looks like generated profiles rather than accumulated institutional intelligence. The phrase "proprietary institutional intelligence" is the right aspiration. The current implementation does not reach it.

### 6. Ontology bridge feels formulaic
The OntologyBridgeView cycles through 7 alignment maps with prev/next buttons. The maps themselves have real content (mathematics_category_theory ↔ euv_lithography is a legitimate connection). But the display is static text grids. The gap nodes are listed but not visually differentiated from mappings. The "functor" label is not connected to anything that behaves like a functor. A researcher in category theory would find it appropriately cautious. An investor would not know what to conclude.

### 7. The opening 90 seconds are diffuse
The current flow: landing screen (beautiful) → graph materializes → you have to discover that Replay exists in the left sidebar. The thesis-to-demo gap is too wide. The strongest moment (Fukushima suppressed dissent) is six clicks away from the homepage.

---

## C. What must be converted now

### Priority 1: Fix the entry path
The landing screen "Enter the Substrate" button should offer two paths: the exploration mode (current) and a "Decision Board" mode that opens directly to the Fukushima replay scenario at step 4 (just before the suppressed dissent). This is a 30-line change with dramatic impact. The red alarm card must be the first substantive thing a new user sees.

### Priority 2: Make Transfer Workbench the center experience
TransferWorkbench should be accessible from the center canvas (not buried in a tab strip). Add a "⇕ Transfer" button in the header next to the view toggle. On first load with the drug discovery domain selected, auto-open the KRAS → EUV process window transfer case. This surfaces the differentiator.

### Priority 3: Build a ResearchTrace view
A component that shows: research topic → sources with trust scores → extracted claims with confidence → contradictions and ambiguities → candidate abstractions → knowledge objects generated → transfer opportunities. This makes Omega look like active infrastructure. Even if the data is batch-precomputed from ARC runs, the view makes the system feel alive.

### Priority 4: Enrich evidence nodes
Source-grounded evidence nodes (the real ones: NAIIC report, Morawska letter, Ostrem 2013) must display their source title, year, DOI/reference, extracted claim, confidence, and contestability. Currently evidence nodes show generic labels. This is a data-enrichment task in demoData.ts plus a display change in NodeInspector.

### Priority 5: Deepen calibration to show history
Each agent in the Expert Council should show: calibration_history (3-5 key past decisions with outcome), vindication_rate, dissent_count, domain_envelope (explicit list of topics where they are vs. are not authoritative). This converts the council from a roleplay view into something that looks like accumulated track record.

---

## D. What should be deferred, not half-faked

### 1. Live bridge detection
Algorithmically detecting structural parallels across domain subgraphs is a real research problem. The current serendipity bridges are pre-written and correct. Claiming the system "detects" them algorithmically would be a lie. Defer until there is a real similarity metric over mechanism graphs.

### 2. Formal functor composition
The AlignmentMap data structure is a functor approximation. It does not compose, does not support naturality checks, does not find pushouts. Defer the formal CT infrastructure until there is a proof-of-concept implementation. Use correct vocabulary but do not claim formal proof machinery.

### 3. Live Neo4j backend
The backend is a full FastAPI + Neo4j architecture that is not connected to the frontend in demo mode. Defer live backend integration. The demo data is honest about being demo data. Do not wire a half-working backend that makes the demo brittle.

### 4. AutoResearchClaw continuous integration
ARC can run research batches. The output is valuable as ingested artifacts. Defer the live loop (ARC → graph update → UI refresh) until the write-path backend is wired. Use ARC in batch mode and import the artifacts as pre-loaded research traces.

### 5. Swarm Reservoirs, JEPA-style latent planning
These are intellectually compelling design directions but they are not product experiences yet. Do not build UI scaffolding for things that have no data model. The conceptual docs are sufficient for investor discussion. Build them when there is something real to show.

---

## E. The actual investor pitch question

The demo currently answers "What does KOS look like?" passably well.

It does not yet answer "Why can't GPT-5 + a vector database do this?" clearly enough.

The answer — which must become visible in the demo — is:

1. **Provenance and governance are first-class.** A vector database stores embeddings. KOS stores who said what, under what authority, with what uncertainty, and under what constraints. That record is durable, auditable, and precedent-forming. GPT-5 cannot produce that record; it can only consume it.

2. **Calibration is track-record, not self-assessment.** Agent calibration in KOS is accumulated from decision outcomes, not from model confidence scores. An LLM has no track record. A human expert with 20 years of dissent vindication history is a fundamentally different epistemic object. KOS makes that difference legible and computable.

3. **Transfer requires loss accounting.** When you ask GPT-5 to "apply the lessons of Fukushima to drug trial governance," it will produce plausible text. It will not tell you what was lost in the mapping, what the alternative translators were, what the validation protocol is, or what the structural gaps are. KOS does.

4. **Institutional memory compounds.** Every dissent record, every precedent citation, every validated bridge makes the substrate richer. LLM fine-tuning degrades over time. A knowledge graph that accumulates governed contributions gets more valuable. This is a fundamentally different compounding dynamic.

These four answers must be demonstrable in the running product, not just statable. That is the work.

---

*End of review. This document should be re-read before any investor demo, not after.*
