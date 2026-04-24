# Research Log — Advanced Manufacturing Domain Family

*April 2026 — Metro Region 2: euv_lithography, semiconductor_hardware, surgical_robotics*

## Source Method

All three domains were synthesized from training knowledge. Web search subagents were used for EUV lithography specifics. No AutoResearchClaw run performed.

Labels: **training-knowledge-grounded synthetic fixture** (semiconductor_hardware, surgical_robotics) and **training-knowledge-grounded with web search** (euv_lithography)

---

## euv_lithography

This is the most technically precise domain in the system. EUV lithography is a real, documented, commercially operational technology — facts are not illustrative composites.

### Primary technical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| ASML is the sole manufacturer of EUV lithography machines | Public business record | High |
| EUV wavelength: 13.5 nm (from tin plasma source) | Technical literature | High |
| Tin droplet generator produces ~50,000 droplets/second at 30kHz | ASML published specifications | High |
| Pre-pulse technique: small laser pulse deforms droplet before main CO₂ laser pulse | ASML research publications | High |
| Pre-pulse significantly increases conversion efficiency (target: 5%+) | Published research | High |
| Carl Zeiss SMT manufactures the optical mirrors for EUV systems | Public business record | High |
| Mirror roughness requirement: sub-atomic level (< 0.1 nm RMS) | Technical literature | High |
| EUV sources require tin cleanup system to prevent mirror degradation | Technical literature | High |
| Volume production began: ~2019-2020 (TSMC, Samsung, Intel) | Business records | High |
| ASML EUV machine price: ~$150-180M per unit | Public reporting | High |

### Key tacit knowledge elements (partially documented)

| Element | Status | Notes |
|---|---|---|
| Step-6 pre-pulse calibration judgment | ✅ In TacitTraceViewer | ASML trace, step 6, codifiability=0.05 |
| Mirror cleaning cycle timing | Partially documented in fixture | Specific thresholds are illustrative |
| Droplet generator maintenance window | In fixture as TacitStep | Character is accurate; specific parameters are composite |

### Demo constructs

| Item | Status | Notes |
|---|---|---|
| Specific engineer dialogue ("1.73ms pulse width") | Illustrative | Plausible numbers based on published approximate parameters |
| ASML systems engineer's calibration score: 0.82 | Demo construct | No formal calibration track record available |
| Internal ASML training materials | Composite | ASML does not publish internal training curriculum |

### Key gaps

- No decisions in fixture — V5 target: add 3 decisions: (1) pre-pulse technique adoption decision, (2) mirror lifetime extension protocol approval, (3) volume production qualification decision
- The Knowledge Guardian concept is most concretely applicable here — the step-6 calibration node is explicitly a guardian situation

---

## semiconductor_hardware

### Primary technical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| APC (Advanced Process Control) is standard in semiconductor fabs | Industry standard | High |
| Plasma etch uniformity is a critical yield factor | Technical literature | High |
| Process window: the range of process parameters within which yield is acceptable | Standard industry term | High |
| Run-to-run control is used to compensate for tool drift | Technical literature | High |
| TSMC's concentration risk (most advanced logic at single fab) | Business analysis | High |
| Node progression: 7nm → 5nm → 3nm → 2nm (TSMC N3, N2) | Public roadmaps | High |

### Demo constructs

| Item | Status | Notes |
|---|---|---|
| Specific plasma etch parameters | Illustrative | General character is accurate; specific values are composite |
| Named engineers | Illustrative | No named individuals identified |
| Calibration scores | Demo constructs | Not formally computed |

### Key gaps

- Fixture exists (semiconductor_hardware.json) but decisions empty
- The TSMC supply chain concentration risk is a strong bridge to supply_chain_resilience domain (planned)
- V5 target: add decisions around process qualification and APC parameter updates

---

## surgical_robotics

### Primary technical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| da Vinci Surgical System is manufactured by Intuitive Surgical | Public record | High |
| da Vinci uses master-slave teleoperation with tremor filtering | Technical literature | High |
| Trocar: a cannula through which instruments pass into the body cavity | Standard medical term | High |
| Trocar entry carries perforation risk; technique is highly operator-dependent | Medical literature | High |
| da Vinci haptic feedback: limited force feedback to surgeon (mainly visual feedback) | Technical literature | High |
| OR Safety Committee and credentialing requirements exist for robotic surgery | Medical practice standard | High |

### Demo constructs

| Item | Status | Notes |
|---|---|---|
| Dr. Park's credentials dispute | Illustrative composite | Pattern (authority overriding safety committee dissent) is documented in credentialing literature; specific case is fictional |
| Dr. Santos calibration score | Demo construct | No formal credentialing calibration data available |
| Specific haptic calibration thresholds | Illustrative | General character (haptics are limited) is accurate |

### Key gaps

- The "tacit skill transfer" bridge between surgical robotics and EUV lithography is one of the strongest meta-level insights in the system — both are about irreducible situated skill
- No decisions in fixture
- V5 target: add decisions: (1) OR credentialing procedure, (2) haptic feedback parameter adjustment approval, (3) training protocol update

---

## Region Characteristics

Advanced Manufacturing is the tacit-knowledge-intensive region. The defining property: all three cities have knowledge that resists codification because it involves physical skill, sensory judgment, or process intuition that emerges from embodied practice.

The cross-city bridge (bridge-tacit-skill: surgical robotics ↔ EUV lithography) is the most conceptually interesting bridge in the system: two completely different physical domains share the same meta-problem of tacit skill transfer. This is a discovery-type bridge — it would not be visible to an analyst working only within one domain.

The EUV → Semiconductor bridge (not yet fully fleshed out) would be the most technically detailed transfer: EUV lithography process variables directly constrain semiconductor process windows. This is a tight technical dependency, not an analogy.
