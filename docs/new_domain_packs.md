# New Domain Packs: V3 Expansion

*Research notes and design decisions for the four new knowledge cities added in iteration 3*

---

## Overview

Iteration 3 adds four new knowledge domains to KOS. Each was chosen to maximize cross-domain bridge potential with the existing three domains (drug_discovery, fukushima_governance, euv_lithography) and with each other.

| Domain | Core Knowledge Type | Primary Structural Parallel |
|---|---|---|
| math_category_theory | Formal/abstract | Reflexive: the formal infrastructure KOS itself uses |
| surgical_robotics | Tacit/embodied + institutional | Authority override, tacit skill transfer |
| semiconductor_hardware | Process/tacit + institutional | Calibration drift, authority override |
| extreme_environments | Operational + institutional | Normalization of deviance, risk governance |

---

## Domain 1: math_category_theory

### Research Basis

Category theory is the study of mathematical structures and the maps between them. It was developed in the 1940s by Eilenberg and Mac Lane as a language for describing structural relationships between different mathematical systems. It has since become the foundation for algebraic topology, type theory, functional programming, and — in KOS — cross-domain knowledge transfer.

### Why This Domain Exists in KOS

Using KOS to model the category-theoretic foundations of KOS is a deliberate reflexivity exercise. If KOS claims that functors are the right model for cross-domain transfer, the system should be able to represent functors as knowledge objects and reason about them.

This domain tests the system at its theoretical limits: can a knowledge graph that uses categorical structure also contain categorical structure as a subject of knowledge?

### Key Entities

| Entity | Type | Description |
|---|---|---|
| Object | math_concept | An entity in a category — no internal structure from the outside |
| Morphism | math_relation | A structure-preserving map between objects |
| Functor | math_concept | A structure-preserving map between categories |
| NaturalTransformation | math_concept | A family of morphisms between two functors |
| Adjunction | math_concept | A pair of functors with a natural bijection |
| Limit | math_concept | Universal construction: terminal object of a cone |
| Colimit | math_concept | Dual: initial object of a cocone |
| Pushout | math_concept | A specific colimit (categorical merge) |
| Pullback | math_concept | A specific limit (categorical intersection) |

### Key Mechanisms

- Functor composition: F ∘ G preserves structure when both F and G do
- Yoneda lemma: every object is characterized by its morphisms
- Adjunction as optimality: left adjoint is "freest" construction, right adjoint is "cofree"

### Cross-Domain Bridges

- math_category_theory.Functor → alignment.AlignmentMap (formal grounding)
- math_category_theory.NaturalTransformation → alignment.NaturalTransformationCandidate (instantiation)
- math_category_theory.Adjunction → alignment (optimal transfer with explicit loss)

---

## Domain 2: surgical_robotics

### Research Basis

Robotic-assisted surgery (da Vinci system, Verb Surgical) involves complex knowledge systems: instrument kinematics, tissue mechanics, haptic feedback calibration, stereo vision interpretation, and — critically — the transfer of surgical skill from attending to resident.

Key reference points:
- Marescaux et al., "Transatlantic robot-assisted telesurgery" (Nature, 2001) — demonstrated remote surgery; latency was the key constraint, not just kinematics
- Berguer & Matern, "Surgical robotics: systems, applications, and visions" — overview of knowledge capture challenges
- Tendick et al., "A new information paradigm for surgical robotics" — force feedback and tactile sensing as knowledge infrastructure

### Core Knowledge Gap

Surgical skill exists at multiple levels: the declarative (anatomical knowledge, protocols) is well-captured. The procedural (step sequences) is partially captured. The tacit (tissue feel, entry angle judgment, bleeding pattern recognition) is almost entirely lost during transitions between surgeons.

This is the highest-stakes tacit knowledge preservation problem: a human life may depend on whether a resident has truly absorbed the attending's tacit knowledge, or only their declarative protocols.

### Key Agents

| Agent | Type | Calibration | Domain Authority |
|---|---|---|---|
| Dr. Maria Santos | human | 0.89 | Attending surgeon, 15 years laparoscopic |
| Dr. James Park | human | 0.72 | Chief resident, year 5 |
| da Vinci Xi System | ai | 0.95 | Kinematic precision, not judgment |
| OR Safety Committee | institution | 0.71 | Credentialing, error reporting |
| Haptic Feedback AI | ai | 0.68 | Force pattern classification |

### Key Tacit Knowledge Clusters

1. **Trocar entry feel**: the characteristic resistance and "give" of correct fascial plane entry
2. **Bleeding pattern recognition**: distinguishing arterial from venous bleeding by visual properties
3. **Tissue tension calibration**: knowing how hard to pull without tearing — context-dependent on tissue type, patient age, previous operations

### Cross-Domain Bridges

- surgical_robotics → fukushima_governance: authority override of expert dissent (OR Safety Committee override of attending's judgment vs. TEPCO override of engineer's dissent)
- surgical_robotics → euv_lithography: tacit calibration skill (trocar feel ↔ pre-pulse feel)
- surgical_robotics → extreme_environments: checklist compliance under cognitive load

---

## Domain 3: semiconductor_hardware

### Research Basis

Modern semiconductor fabrication (CMOS, FinFET, GAAFET) involves 300–600 process steps. Knowledge is distributed across specializations: etch, deposition, CMP, lithography, metrology, yield engineering. 

Tacit knowledge is critical: a process engineer with 20 years of etch experience develops an intuition for plasma behavior that cannot be reduced to the chamber recipe. This knowledge is the difference between a 95% and a 92% yield — not a trivial gap at $10,000 per wafer.

Key structural parallel with fukushima_governance: both involve institutional authority structures that can override process engineer warnings, with potentially catastrophic results. The analogy between "management override of seawall recommendation" and "management override of process engineer yield warning" is structurally exact.

### Key Entities

| Entity | Type | Description |
|---|---|---|
| CMOS transistor | device | Core computational unit |
| FinFET geometry | device_concept | 3D gate structure reducing short-channel effects |
| Etch chamber | process_tool | Plasma etch system for patterning |
| CMP process | mechanism | Chemical-mechanical planarization |
| Yield map | measurement | Spatial distribution of functional die |
| Defect cluster | evidence | Spatial correlation of failures |
| Process window | constraint | Parameter range for acceptable yield |

### Key Agents

| Agent | Type | Calibration | Domain Authority |
|---|---|---|---|
| Jae-Won Kim | human | 0.86 | Senior process engineer, etch |
| FAB Yield Committee | institution | 0.62 | Quarterly yield sign-off |
| APC System (Advanced Process Control) | ai | 0.91 | Real-time process adjustment |
| Equipment OEM | institution | 0.74 | Process recipe qualification |

### Cross-Domain Bridges

- semiconductor_hardware → fukushima_governance: institutional authority override (Yield Committee override of process engineer warning ↔ TEPCO management override)
- semiconductor_hardware → drug_discovery: calibration drift over time (process window drift ↔ agent calibration decay)
- semiconductor_hardware → euv_lithography: direct connection (litho is one process step within the full CMOS flow)

---

## Domain 4: extreme_environments

### Research Basis

Extreme environment operations (deep-sea, polar, high-altitude, space) share a common knowledge governance challenge: procedures are developed in controlled conditions and then applied in environments where small deviations can have catastrophic consequences.

The classic case: the Challenger disaster (1986). O-ring performance data existed. The failure mode was understood. Launch was approved by authority despite engineer warnings. The structural pattern is identical to fukushima_governance.

Less famous: Apollo 13, deep-sea rig blowouts (Deepwater Horizon), K2 summit season mass casualties. All involve the same pattern: known risk + institutional pressure + normalization of deviance → catastrophic failure.

Key references:
- Vaughan, "The Challenger Launch Decision" (1996) — sociological analysis of normalization of deviance
- Weick & Sutcliffe, "Managing the Unexpected" (2007) — high-reliability organization theory
- Hollnagel, "Safety-II in Practice" — resilience engineering and non-linear risk

### Key Entities

| Entity | Type | Description |
|---|---|---|
| O-ring seal | component | Temperature-sensitive shuttle seal |
| Pressure chamber | environment | Deep-sea habitat, saturation diving |
| Ascent schedule | protocol | Decompression procedure |
| Cold weather protocol | constraint | Temperature thresholds for operations |
| Normalization event | decision | A deviance that became accepted practice |

### Key Agents

| Agent | Type | Calibration | Domain Authority |
|---|---|---|---|
| Roger Boisjoly | human | 0.94 | Morton Thiokol engineer, O-ring expert |
| NASA Launch Director | institution | 0.41 | Authority over launch decision |
| Dive Medicine Specialist | human | 0.88 | Decompression protocol authority |
| Operations Committee | institution | 0.55 | Risk acceptance authority |

### Cross-Domain Bridges

- extreme_environments → fukushima_governance: normalization of deviance (O-ring tolerance ↔ seawall height acceptance)
- extreme_environments → surgical_robotics: checklist compliance under cognitive load (pre-dive checklist ↔ surgical timeout)
- extreme_environments → semiconductor_hardware: process window deviation acceptance

---

## Fixture File Targets

Each new domain fixture JSON should contain approximately:
- 12–18 Entity nodes
- 6–10 Mechanism nodes
- 3–5 DecisionTrace nodes
- 3–5 AgentProfile nodes
- 2–4 DissentRecord nodes
- 2–3 EvidenceFragment nodes
- 2–3 Constraint nodes
- 1–2 AlignmentMap stubs (with bridge_candidate flag)

Total new nodes per domain: ~30–50. Total v3 addition: ~140–200 new graph objects.
