# KOS — Concept v2: The Knowledge Operating System

## Thesis

**KOS is a governed, multi-layer, open-ended substrate that turns decision traces, tacit knowledge, mechanistic understanding, and collective agency into durable organisational and scientific intelligence.**

This is not a knowledge base. It is not enterprise search. It is not a plain knowledge graph. It is not GraphRAG. Each of those systems treats knowledge as something you store and retrieve. KOS treats knowledge as something that acts — that is provenance-tracked, uncertainty-annotated, goal-directed, and collectively produced.

---

## The core problem

Current AI systems are very good at retrieving information and generating text. They are very poor at:

1. **Why** a decision was made — not just what was decided, but what evidence mattered, which precedent was invoked, who approved, what was still uncertain.
2. **Who knows what** — which expert, institution, or agent carries which competence, and what they disagree about.
3. **What should be pursued** — goals, constraints, obligations, rights, and protected values that govern action beyond "give the best answer."
4. **How knowledge grows** — detecting missing structures, proposing new connections, and evolving the graph in a governed, open-ended way.

These four gaps correspond to the four layers that KOS adds beyond a plain knowledge graph.

---

## The six-layer model

KOS is not a single graph. It is six interacting layers:

| Layer | What it represents | Core question answered |
|---|---|---|
| Evidence | Documents, sensor windows, tool calls, simulation states | What is the raw record? |
| Context | Decision traces, exceptions, precedents, approvals, policies | Why did this happen? |
| Knowledge / Mechanism | Entities, causal mechanisms, procedures, hypotheses | What is known and how does it connect? |
| Goal / Agency | Goals, constraints, obligations, rights, values, risks | What should be pursued and protected? |
| Governance | Permissions, provenance, roles, review gates, data-use | Who may do what, and who is accountable? |
| Collective Agent Ecology | Human experts, AI agents, tools, institutions, delegations | Who knows what, and what do they disagree about? |

The layers interact. A decision trace (context) is justified by evidence and governed by constraints (goal/governance). A mechanism (knowledge) is uncertain (evidence + agent ecology). A goal (goal) is owned by an agent (ecology) and constrained by law (governance). The architecture is not flat — it is stratified and cross-referenced.

---

## What KOS is not

These distinctions are design non-negotiables:

- **Context graph ≠ chain-of-thought.** A chain-of-thought is ephemeral reasoning produced by an LLM during inference. A context graph is a durable institutional record of a real decision by a real actor.
- **Tacit knowledge ≠ transcript archives.** Transcripts are raw material. Tacit knowledge is what you extract from them: atomic, curated, addressable knowledge fragments with provenance and uncertainty.
- **Ontology alignment ≠ universal schema.** Forcing a single ontology destroys the local coherence of expert subgraphs. KOS supports partial alignment — where concepts can be mapped, they are; where they cannot, the gap is made explicit.
- **Autonomy ≠ agency preservation.** A system that automates everything destroys the human agency it was meant to support. KOS explicitly represents delegation as reversible and keeps humans in the loop at governance checkpoints.
- **Open-ended growth ≠ uncontrolled self-modification.** Every structural change is a proposal that must pass governance review before being applied.
- **Collective intelligence ≠ many agents talking.** Multi-agent chatter produces coordination overhead. KOS accumulates: precedent, validated procedures, uncertainty maps, and durable expert routing policies.

---

## What KOS accumulates

The deepest design goal of KOS is compounding. Each interaction deposits something durable:

- A decision deposits a trace — replayable, searchable, precedent-forming.
- An expert consultation deposits a belief update — aggregable across agents.
- A mechanism validation deposits confidence — traceable to evidence.
- A governance approval deposits a provenance record — auditable and tamper-evident.
- A graph evolution proposal deposits a change candidate — reviewable and versioned.

Over time, the graph densifies. Uncertainty reduces. Precedents compound. Bridges form between domains. The system becomes more capable not just because models improve, but because knowledge accumulates.

---

## Demo domains

KOS is demonstrated across three domains chosen to stress-test different layers:

1. **Drug discovery** — stresses the knowledge/mechanism layer (causal chains across proteins and compounds), the evidence layer (clinical trial data, assay results), and the active inference layer (uncertainty about CNS penetration drives expert routing).
2. **Governance under uncertainty** — stresses the context layer (board-level decision with dissent and precedent), the governance layer (GDPR constraints, permissions, provenance), and the goal layer (conflicting stakeholder priorities).
3. **AI hardware tacit knowledge** — stresses the evidence layer (tacit knowledge fragments from expert interviews), the agent ecology layer (delegation to digital twin), and the open-endedness layer (cross-domain bridge proposals between process engineering and QC ontologies).
