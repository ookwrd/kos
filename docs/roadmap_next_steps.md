# Roadmap and Next Steps

## Current State (v2 — this release)

- Seven-layer graph substrate (Evidence, Context, Knowledge, Goal, Governance, Agents, Evolution)
- Three domain packs: drug_discovery, fukushima_governance, euv_lithography
- Full backend: FastAPI + Neo4j + ChromaDB
- Frontend: Omega-branded, dark scientific aesthetic
- Key surfaces: GraphCanvas, CityOverview, DecisionReplay, ProvenanceInspector, AgentCouncilView, OntologyBridgeView, InferencePanel, GraphEvolutionTimeline
- New in v2: TacitTraceViewer, ExpertTwinView, demo fallback mode
- Deployed: Frontend on Vercel (kos-omega.vercel.app), Backend config ready for Railway/Fly.io

---

## V3 Priorities

### P0 — Architecture

**Persistent backend deployment**
The demo currently shows static fixture data without a live backend. V3 requires:
- Neo4j AuraDB or self-hosted Neo4j in production
- FastAPI backend deployed on Railway/Fly.io with auto-seed
- WebSocket live events working end-to-end
- Domain pack hot-loading without restart

**Multi-domain simultaneous view**
Currently only one domain is active at a time. V3 should support:
- Side-by-side domain comparison
- Cross-domain alignment view as default bridge surface
- Unified city view showing all three domains simultaneously with bridge arcs

**Belief propagation**
When a piece of evidence is modified or revoked, V3 should propagate uncertainty changes downstream through the graph automatically, flagging affected nodes for review.

### P1 — Domain Packs

**Complete the secondary packs**
Scaffold the remaining packs with at least one compelling scenario each:
- `climate_policy`: IPCC AR6 carbon budget allocation
- `surgical_robotics`: da Vinci procedure knowledge transfer
- `expert_preservation`: retiring process engineer knowledge capture
- `sovereign_knowledge`: indigenous knowledge governance with community-controlled permissions

**Domain pack versioning**
Allow domain packs to have explicit versions with diff views — what changed between pack v1.0 and v1.1, who approved the change, what evidence supported it.

**Cross-domain bridge implementation**
The alignment service currently computes structural similarity. V3 should:
- Surface proposed bridges as first-class UI elements
- Allow experts to review and annotate bridge proposals
- Show bridge confidence and evidence

### P2 — New UI Surfaces

**Impact Tracer**
Given a revoked or modified evidence node, compute and visualize the full downstream impact:
- Which decisions were justified by this evidence
- Which agent beliefs relied on it
- What confidence values change and by how much
- Which precedents are now weakened

**Permission Explorer**
A visual map of who can access what, with what constraints. Currently permissions are in the data model but not prominently surfaced in the UI.

**Tacit Knowledge Annotation Interface**
An interactive interface for domain experts to record tacit traces:
- Structured step-by-step capture
- Video/audio attachment support
- Uncertainty annotation at each step
- Real-time linking to existing knowledge nodes

**Collective Assay View**
A comparison view showing:
- Single reasoner answer vs. council answer vs. federated pack answer
- Where collective synthesis exceeds individual components
- Where genuine disagreement remains unresolved

**Temporal Graph Evolution**
An animated timeline of how the graph grew — which nodes were added when, which bridges emerged, which hypotheses were confirmed or rejected.

### P3 — Backend Improvements

**Streaming inference**
Currently inference routes return synchronously. V3 should support:
- Streaming multi-agent responses via WebSocket
- Progressive confidence accumulation as more agents respond
- Live council deliberation view

**Formal belief aggregation**
Replace the current heuristic calibration-weighted average with a proper epistemic aggregation model:
- Weighted by calibration score and domain competence
- Handling of dependent vs. independent evidence
- Variance and higher-order moments, not just mean

**Policy-as-code**
Make constraints and obligations machine-executable, not just stored:
- A constraint on CNS expansion should actually block the progression action
- An obligation should generate a scheduled task
- Policy violations should surface as alerts

**Multimodal evidence ingestion**
Currently evidence is text/document-centric. V3 should support:
- PDF extraction with citation-level attribution
- Video/transcript ingestion for tacit traces
- Sensor data import for real-time evidence windows
- Image annotation for visual evidence (histology, engineering drawings)

---

## Research Questions for V3

These are genuine open research questions that the platform is designed to help answer:

1. **Calibration at collective scale**: does an ensemble of calibrated individual agents produce a well-calibrated collective? Under what conditions does it fail?

2. **Optimal dissent structures**: how much disagreement is healthy in an agent ecology? Is there a detectable optimal diversity for a given task?

3. **Precedent distance metrics**: what is the right similarity function for finding relevant precedents? Semantic similarity? Structural graph similarity? Domain-aware hybrid?

4. **Tacit knowledge completeness**: how do you know when a tacit trace is "complete enough"? What are the minimum sufficient conditions for a trace to be useful for knowledge transfer?

5. **Governance overhead vs. knowledge quality**: is there a measurable relationship between governance strictness and knowledge quality over time? Does more governance always lead to better knowledge, or is there an optimal governance intensity?

6. **Cross-domain bridge validity**: when the alignment layer proposes a structural isomorphism between domains, under what conditions is it a genuine insight vs. a superficial analogy?

7. **Evolution stability**: how do you prevent open-ended graph evolution from introducing contradictions or degrading existing knowledge quality? What are the minimal constraints for stable open-ended growth?

8. **Collective confidence calibration**: if individual agents are well-calibrated at 0.8 and they all agree on a claim, what should the collective confidence be? 0.95? 0.99? Is this domain-dependent?

---

## What V3 Should Feel Like

If V2 demonstrates that the architecture is real and the thesis is coherent, V3 should demonstrate that the system is actually useful for a real organization.

The V3 demo target is: a senior researcher or institutional leader sits down with the platform, loads their domain pack, and within 30 minutes has a meaningful artifact — a traced decision, a structured uncertainty map, a provenance-verified knowledge summary — that they couldn't have produced otherwise.

That is the acceptance criterion for V3.

---

## What Remains a Research Problem

Some things in Omega are genuinely unsolved:

- **Formal account of collective epistemic rationality**: what does it mean for a collective to be rational? The system implements heuristics; the formal theory is open.
- **Consent and sovereignty at scale**: how do you handle knowledge with heterogeneous governance requirements in a unified substrate without complexity that defeats usability?
- **Temporal reasoning**: how does knowledge validity change over time in a way that can be automatically flagged without constant human review?
- **Adversarial robustness**: how does the governance layer respond to deliberate injection of false evidence by a malicious agent with legitimate credentials?

These are not failure modes of Omega — they are the research agenda that Omega makes legible.
