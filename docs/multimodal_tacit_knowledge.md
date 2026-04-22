# Multimodal and Tacit Knowledge in KOS

*Why tacit knowledge cannot be represented as declarative propositions, and how KOS provides a principled alternative*

---

## The Problem of Tacit Knowledge

Michael Polanyi: "We know more than we can tell."

A surgeon who can perform a cholecystectomy cannot fully articulate the knowledge she uses. An EUV lithography engineer who knows when the pre-pulse is "off" cannot write down that knowledge in a specification document. A deep-sea diver who knows how the chamber feels before a pressure problem develops cannot reduce that knowledge to a checklist.

This is not a failure of articulation. It is a property of a certain class of knowledge: **situated skill** that is encoded in the sensorimotor system, not in propositional memory. The body knows things the mind cannot say.

Standard knowledge management systems ignore this entirely. They import declarative knowledge (papers, specifications, protocols) and call it "organizational knowledge." They miss the most epistemically valuable content: the hard-won, domain-specific, person-specific practical wisdom that makes the difference between a novice and a master.

---

## Types of Knowledge in KOS

KOS distinguishes four knowledge types, each requiring different representation:

**1. Declarative knowledge**: Propositions that can be stated explicitly and verified independently. "The KRAS G12C mutation affects RAS GTPase activity." These are `EvidenceFragment` nodes with `source_type: primary_literature`. Full provenance, uncertainty scoring, citation chain.

**2. Procedural knowledge**: Step-by-step instructions that can be written down. "Add 10μL buffer, incubate at 37°C for 20 minutes, centrifuge." These are sequences of `Mechanism` nodes with causal links. They can be audited and replicated from the specification.

**3. Tacit knowledge (situated)**: Knowing how a process *feels* when it is going right or wrong. "The pre-pulse looks right" — a judgment based on visual pattern recognition trained over hundreds of sessions. These cannot be fully captured in text. KOS stores them as `TacitKnowledgeFragment` nodes (a subtype of Entity) with a `knowledge_type: situated` attribute, linked to the agent who holds them and the conditions under which they apply.

**4. Embodied knowledge**: Physical skill encoded in motor memory. "The entry angle for the trocar feels right in my hand." This is even harder to externalize. KOS currently stores links to video demonstration fragments and annotates them with the agent's verbal commentary — an incomplete but honest representation.

---

## The TacitKnowledgeCluster

A `TacitKnowledgeCluster` is a proposed new entity type for v3 (introduced as a `GraphChangeProposal` in GraphEvolutionTimeline). It represents a cluster of related tacit knowledge fragments that share:

- A **domain context**: the specific operational environment where this knowledge applies
- A **skill holder**: the agent (or class of agents) who holds this knowledge
- A **transfer difficulty rating**: how hard is this knowledge to transmit? (apprenticeship required? decades of practice? machine-demonstrable?)
- A set of **transfer attempt records**: documented attempts to formalize or transfer this knowledge, with outcomes

The cluster is the right unit (not individual fragments) because tacit knowledge is holistic: the EUV engineer's sense of pre-pulse quality cannot be decomposed into independently learnable fragments. It is learned as a gestalt, practiced as a gestalt, lost when the practitioner retires.

---

## Multimodal Evidence Types

The `EvidenceFragment` model supports multiple media types:

| media_type | Description |
|---|---|
| `text` | Papers, reports, written accounts |
| `image` | Microscopy, radiography, process photos |
| `video` | Procedure recordings, demonstration footage |
| `sensor_stream` | Time-series data from instruments |
| `haptic_trace` | Force/torque profiles recorded from robotic systems |
| `verbal_protocol` | Think-aloud recordings with expert commentary |
| `calibration_result` | Structured output of calibration tests |

The `haptic_trace` and `verbal_protocol` types are particularly important for tacit knowledge. A surgeon's robotic force feedback profile during a procedure contains information that cannot be written. A verbal protocol from an EUV engineer while tuning a pre-pulse captures the tacit judgment in real-time narration.

These media types are stored as content references (`content_ref`: a pointer to external storage) rather than inline. The graph stores the structure and metadata; the content is in a media store.

---

## Why Tacit Knowledge Matters for Transfer

Cross-domain knowledge transfer is most valuable and most dangerous precisely where tacit knowledge is involved.

**Valuable**: The surgical robotics engineer who understands haptic feedback has something to teach the semiconductor equipment engineer. Both work with force-feedback systems that require human calibration. The insight that "the machine learns the human's hand, not just the procedure" transfers across domains — but only if you know where the tacit knowledge lives.

**Dangerous**: The checklist that worked perfectly in one surgical context may transfer false confidence to another. The EUV pre-pulse recipe from one fab transfers poorly to a slightly different machine configuration. Tacit knowledge is the missing term that explains why the procedure works in one context and fails in another.

KOS handles this by making the `TacitKnowledgeCluster` a required element of any `BridgeMap` that bridges domains with tacit knowledge components. You cannot propose a transfer without explicitly accounting for the tacit knowledge that may not travel with the declarative procedure.

---

## Expert Twin Model

The `ExpertTwinView` implements a specific knowledge preservation strategy: maintaining a *digital twin* of an expert's epistemic state.

An expert twin is not a chatbot. It is a structured representation of:
- The expert's declarative knowledge (as linked EvidenceFragment and Mechanism nodes)
- The expert's calibration history (which predictions matched outcomes)
- The expert's dissent record (where they disagreed with consensus and why)
- Documented fragments of their tacit knowledge (video, haptic traces, verbal protocols)
- Their authority scope (which questions are they an authoritative source on?)

The twin is used for routing: when the expert is unavailable, the system can route queries to the twin's representation, with an explicit caveat that this is a preserved representation, not a live consultation. The quality of the twin degrades over time (increasing uncertainty) as the domain evolves beyond what the twin was trained on.

This is particularly important for tacit knowledge: when the last EUV pre-pulse engineer retires, their twin may be the only remaining access to their embodied expertise — but the system is honest about the uncertainty of consulting a frozen representation.

---

## The Surgical Robotics Domain as a Case Study

The `surgical_robotics.json` fixture demonstrates multimodal tacit knowledge:

- `TacitKnowledgeCluster`: "Tissue resistance feel during trocar entry"
  - Skill holder: Attending Surgeon Dr. Maria Santos
  - Transfer difficulty: high (requires supervised practice, estimated 50 cases)
  - Media: haptic trace from da Vinci telesurgery session + verbal protocol

- `EvidenceFragment` with `media_type: haptic_trace`: Force-torque profile from 20 successful vs. 3 failed entries
  - The trace shows a characteristic "give" at the moment of correct fascial plane entry
  - This pattern cannot be written — it must be experienced and recognized

- `BridgeMap` to `euv_lithography`: The trocar entry "give" is structurally parallel to the EUV pre-pulse "snap" — both are tactile pattern recognition events that signal correct operational state

The bridge is high-value (both domains benefit from sharing the calibration technique) but lossy (the physical substrate is entirely different). The `StructuralLossReport` documents this explicitly.

---

## Long-term: Knowledge Preservation as Research Infrastructure

The tacit knowledge problem is an existential one for high-skill domains. When the master retires, the knowledge may be lost — not because no one tried to capture it, but because the capturing methods were inadequate.

KOS provides infrastructure for a long-term knowledge preservation program:
- Structured `TacitKnowledgeCluster` nodes that signal "this knowledge is at risk"
- `TransferAttempt` records that document what has been tried and what was captured
- Calibration testing to assess whether a junior practitioner has absorbed the tacit knowledge (not just the procedure)
- Connection to the governance layer: organizations can set `Obligation` nodes requiring tacit knowledge capture before an expert retires

This is a research program, not a complete solution. But naming the problem explicitly and providing scaffolding for systematic preservation is a meaningful contribution.
