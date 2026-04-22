# Domain Packs

## What a Domain Pack Is

A domain pack is the unit of deployable knowledge configuration in Omega. It is not a database dump or a static document set. It is a structured, governed, semantically rich slice of a knowledge domain — complete with agents, evidence, decisions, precedents, goals, constraints, tacit traces, and provenance records.

Each domain pack demonstrates that the same substrate can support radically different knowledge domains without modification to the underlying architecture. The ontology adapts; the architecture is invariant.

---

## Pack Structure

```json
{
  "domain": "string — unique identifier",
  "name": "string — human-readable title",
  "version": "string",
  "thesis": "string — what this domain demonstrates about collective intelligence",
  
  "agents": [...],           // Expert twins, AI tools, institutions
  "evidence": [...],         // Documents, assays, transcripts, sensor windows
  "entities": [...],         // Domain-specific objects (proteins, reactors, statutes...)
  "mechanisms": [...],       // Causal relationships, procedures, pathways
  "hypotheses": [...],       // Open claims with evidence for/against
  "tacit_traces": [...],     // Situated skill episodes (NEW)
  "goals": [...],            // What is being optimized or protected
  "constraints": [...],      // Hard and soft bounds
  "precedents": [...],       // Prior decisions relevant to current domain
  "decisions": [...],        // Consequential reasoning events
  "dissent_records": [...],  // Permanent record of disagreements
  "uncertainty_annotations": [...],
  "provenance_records": [...],
  "demo_queries": [...]      // Pre-built queries for live demonstration
}
```

---

## Flagship Domain Packs

### Pack 1: Drug Discovery / Translational Biomedicine

**Domain ID:** `drug_discovery`

**Thesis:** Collective intelligence in drug discovery is not about a smarter model — it is about maintaining a governed, traceable reasoning chain from molecular mechanism to clinical decision, with explicit uncertainty, expert dissent, and institutional accountability at every step.

**Core scenario:** The KRAS G12C inhibitor Sotorasib (AMG510) — from target identification through clinical trial design to a deferred enrollment decision for CNS-metastatic patients. Demonstrates how a single high-uncertainty data point (BBB penetration assay) can and should block a major trial expansion, and how the system preserves the dissent record of the AI screening tool that disagreed.

**Key demonstration moments:**
- Trace the causal chain: KRAS → RAF → MEK → ERK → tumor growth → therapeutic target
- Replay the BBB deferral decision: see which evidence justified it, which uncertainty drove it, which agent dissented
- Show goal conflict: patient safety constraint vs. research acceleration goal
- Show precedent invocation: prior AMG-224 CNS deferral sets the template

**What it demonstrates about ACI:**
- Evidence hierarchy (paper vs. assay vs. trial data have different epistemic weights)
- AI tool dissent preserved even when overruled by clinical expert
- Hard constraint blocking goal progress as intended system behavior
- Uncertainty as a first-class decision input, not a footnote

---

### Pack 2: Institutional Governance — Fukushima Nuclear Safety Failure

**Domain ID:** `fukushima_governance`

**Thesis:** Institutional failures are not random — they are the predictable output of organizations that suppress dissent, defer inconvenient evidence, and misalign incentives between safety and cost. A governed collective intelligence substrate would have made the 2008 TEPCO seawall decision visible, traceable, and contestable — potentially preventing the 2011 disaster.

**Core scenario:** TEPCO's 2008 internal tsunami risk assessment found that a wave exceeding 15.7m was plausible at Fukushima Daiichi (the existing seawall was 5.7m). The decision to defer seawall upgrades pending "further research" — effectively indefinitely — is the central traceable failure. On March 11, 2011, the tsunami reached 14.1–15.5m. The plant's backup diesel generators, located at low elevation, flooded within 40 minutes.

**Key agents:**
- TEPCO Corporate Management: decided to defer, prioritized cost and regulatory stability
- TEPCO Civil Engineering Division: produced the 15.7m estimate, some members pushed for action internally
- NISA (Nuclear and Industrial Safety Agency): regulatory body subject to industry capture
- NSC (Nuclear Safety Commission): advisory body that failed to escalate
- Onagawa Plant Management (comparative): a nearby plant survived the same tsunami because a single engineer had insisted on a higher seawall in 1967

**Key evidence:**
- 2008 TEPCO internal assessment: "tsunami height could reach 15.7m based on Jogan earthquake model"
- Jogan earthquake geological record (869 AD): tsunami deposits found 3–4km inland, documented by Japanese geologists
- NRC Station Blackout studies: US nuclear regulator had warned about extended SBO scenarios
- Onagawa seawall precedent: Yanosuke Hirai insisted on 14.8m wall in 1967, plant survived intact

**Key decision:**
- `dec-seawall-deferral-2008`: Decision to defer seawall upgrade, citing need for further study by JSCE subcommittee. Effectively indefinite deferral.

**Key dissent:**
- Internal TEPCO engineers who raised concerns about the 15.7m assessment were not given governance standing
- External seismologists who published Jogan tsunami research were not consulted

**What it demonstrates about ACI:**
- How institutional capture suppresses dissent records that should be first-class
- How evidence with high uncertainty gets used to defer rather than act
- How precedent (Onagawa) can and should be part of the decision substrate
- How a well-designed system would have made the 2008 deferral decision visible and contestable, not buried in internal memos

---

### Pack 3: Industrial Operations — ASML EUV Lithography

**Domain ID:** `euv_lithography`

**Thesis:** The development of extreme ultraviolet lithography is the most concentrated example of cross-institutional tacit knowledge coordination in the history of manufacturing. It took 40 years, 5 countries, hundreds of organizations, and the near-impossibility of codifying what was learned to get to production. It is a proof case for why tacit knowledge infrastructure matters.

**Core scenario:** ASML's development of EUV (Extreme Ultraviolet) lithography — a technology that uses 13.5nm wavelength light to print transistors smaller than possible with conventional optics. The central technical challenge: generating enough 13.5nm photons to be commercially viable required creating a plasma light source by firing a CO2 laser at 50,000 tin droplets per second in vacuum, at precise timing. The knowledge required to achieve this was distributed across ASML (Netherlands), Carl Zeiss SMT (Germany), Cymer/TRUMPF (USA/Germany), IMEC (Belgium), and the major chipmakers.

**Key agents:**
- ASML Systems Engineering: integration of light source, optics, stage, and control systems
- Carl Zeiss SMT: EUV mirror fabrication (40+ alternating Mo/Si layers, each 3nm thick)
- Cymer (acquired 2012): tin-plasma EUV light source development
- IMEC: process research — how to use EUV exposures to pattern actual chips
- Martin van den Brink (ASML CTO): key decisions on 13.5nm wavelength commitment and tin plasma approach

**Key technical mechanisms:**
- EUV wavelength selection: 13.5nm was chosen because it is the brightest natural emission line of tin plasma and falls in the 2–4% reflectivity window of Mo/Si mirrors
- Pre-pulse technique: a low-energy laser pre-pulse flattens the tin droplet into a disk, increasing the surface area hit by the main laser pulse — critical for achieving sufficient EUV power
- Mirror contamination: tin deposits on collector mirrors at 1–2nm/hour; hydrogen plasma cleaning extends mirror lifetime from days to months (a tacit knowledge-intensive procedure)
- Overlay control: achieving <0.1nm overlay accuracy requires real-time feedback from sensors that measure wafer position to sub-angstrom precision

**Key decisions:**
- `dec-wavelength-selection-1999`: Commitment to 13.5nm over alternative EUV wavelengths (11nm was also considered). Based on mirror reflectivity analysis and plasma emission data.
- `dec-tin-over-xenon-2007`: Decision to abandon xenon plasma in favor of tin plasma for light source. Tin is more efficient but introduces severe contamination challenges. Tacit engineering knowledge about contamination management was critical to making this feasible.
- `dec-cymer-acquisition-2012`: ASML acquires Cymer for $2.5B, bringing the light source supply chain in-house. Driven by the recognition that EUV source knowledge was so tacit and so critical that it could not be maintained at arm's length.

**Key tacit traces:**
- Mirror cleaning procedure: the specific sequence of hydrogen plasma exposure parameters, vacuum conditions, and mirror temperature management required to extend collector mirror lifetime
- Droplet generation calibration: the adjustment procedure for tin droplet size, shape, timing, and trajectory — a skilled process that cannot be fully described by parameter settings alone
- Overlay calibration walk: the sequence of test exposures and feedback adjustments required at system startup after any major maintenance event

**What it demonstrates about ACI:**
- Tacit knowledge is real and consequential — the 40-year development timeline is mostly accounted for by the difficulty of making implicit knowledge explicit enough to transfer
- Cross-institutional coordination requires governed knowledge interfaces — ASML, Zeiss, Cymer, and IMEC each held partial knowledge that the others needed
- Acquisition of knowledge-dense organizations (Cymer) reflects the limits of document-based knowledge transfer
- Scale-dependent cognition: individual engineer skill → team procedure → institutional process → cross-institutional specification

---

## Secondary Domain Packs (Scaffolded)

These packs exist as structural templates with partial data. They demonstrate the range of the substrate without requiring deep implementation.

### Policy Simulation — Paris Agreement Carbon Budget Allocation

**Domain ID:** `climate_policy`
**Scenario:** The IPCC AR6 Working Group III process for allocating remaining carbon budgets across national commitments. Demonstrates multi-stakeholder governance, deep uncertainty, and the collision between scientific and political authority.

### Biomedical Robotics — Robotic-Assisted Surgery Knowledge Transfer

**Domain ID:** `surgical_robotics`
**Scenario:** How procedural knowledge for da Vinci robotic surgery is captured, validated, and transferred across training programs. Demonstrates the tacit knowledge challenge in high-stakes embodied skill domains.

### Expert Preservation — Semiconductor Process Engineering

**Domain ID:** `expert_preservation`
**Scenario:** A senior process engineer retiring from a semiconductor fab, and the structured knowledge capture process required to preserve their 30 years of troubleshooting expertise. Demonstrates the institutional continuity use case.

### Sovereign AI — Indigenous Knowledge Protection

**Domain ID:** `sovereign_knowledge`
**Scenario:** A First Nations community implementing governed access to traditional ecological knowledge, with community-controlled permissions, consent records, and sovereignty over data use. Demonstrates the political and ethical dimensions of knowledge governance.

---

## Composing Domain Packs

When multiple domain packs are loaded, the alignment layer handles ontology translation. This is demonstrated through the `OntologyBridgeView`:

- A "signaling pathway" in drug_discovery maps approximately (but not exactly) to a "process dependency chain" in euv_lithography
- Both have source entities, target entities, mechanism nodes, confidence values, and evidence references
- The structural similarity is a genuine insight: causal chains in biology and causal chains in engineering share deep structural properties
- The residual difference is also an insight: biological mechanisms have probabilistic activation that manufacturing mechanisms do not

Cross-domain bridges in Omega are not just visual connections. They are governed claims that require evidence, carry uncertainty, and can be contested.
