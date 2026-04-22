# Demo User Journeys

## How to Narrate Omega

The platform supports multiple narration paths depending on audience. The overarching thesis to communicate in every demonstration:

> "This is what it looks like when intelligence is governed, traceable, distributed, and compounding — rather than monolithic, opaque, and static."

Each journey takes 3–8 minutes. They can be run sequentially for a comprehensive 20-minute demo or independently for targeted conversations.

---

## Journey 1: The Decision That Prevented a Disaster (4 min)
**Audience:** Institutional leaders, risk managers, regulators
**Domain:** Fukushima Governance
**Entry point:** Graph Canvas, Context layer

**Narration:**

"Start with a question: how does an institution make a consequential decision — correctly or incorrectly — and how do you trace it afterward?"

*Show the Context layer — the orange diamond nodes representing decisions.*

"This is the 2008 TEPCO seawall deferral decision. A TEPCO civil engineering team calculated that a tsunami exceeding 15.7 meters was plausible at Fukushima Daiichi. The seawall was 5.7 meters high. They decided to defer the upgrade pending further study."

*Select the decision node. Show the inspector.*

"In Omega, every decision carries its full evidence chain, the agents involved, the precedents invoked, and crucially — the dissent records. Here you can see that at least one internal engineer flagged concerns that were not given governance standing."

*Open the Provenance Inspector.*

"And you can trace exactly: who touched this evidence, when, and what permissions governed their access. If this had been in a governed collective intelligence substrate, the 2008 decision would have been auditable, contestable, and reviewable by external parties — not buried in internal memos."

*Show the goal conflict panel.*

"This is the conflict the system would have surfaced: a hard constraint requiring uncertainty below 0.4 before proceeding with risk. The assay uncertainty was 0.6. The system should have blocked progression — and in Omega, it does."

**Closing:** "This is not historical analysis. This is the architecture that prevents future versions of this failure."

---

## Journey 2: Why This Drug Decision Was Made (3 min)
**Audience:** Life sciences, clinical researchers, pharma R&D
**Domain:** Drug Discovery
**Entry point:** Graph Canvas, all layers

**Narration:**

"We're looking at a real clinical decision: whether to include brain-cancer patients in a Phase II trial for Sotorasib, an FDA-approved drug that treats lung cancer by blocking the KRAS G12C mutation."

*Show the knowledge layer — the KRAS → RAF → MEK → ERK chain.*

"This is the mechanism. KRAS is the broken 'go' signal in the cancer cell. Sotorasib permanently locks it off. The question is whether the drug can cross the blood-brain barrier to reach tumors in the brain."

*Click the decision node (dec-trial-approval-2024).*

"Here's the decision: deferred. Three pieces of evidence drove it — and you can see each one, with its uncertainty score."

*Step through the Decision Replay panel.*

"The BBB penetration assay — the most direct evidence — came back with 0.6 uncertainty. That's high. There's a hard constraint in this domain: CNS expansion cannot proceed if uncertainty exceeds 0.4."

*Show the dissent record.*

"Now here's something important: MolScreen-v2, the AI screening tool, disagreed. It gave BBB+ probability at 0.41 — just above the threshold. Its dissent is permanently recorded here, with its full rationale."

**Closing:** "This is what provenance-aware clinical reasoning looks like. Not a black box — a full, replayable, contestable audit trail."

---

## Journey 3: The Tacit Knowledge Problem (5 min)
**Audience:** Manufacturing, industrial operations, engineering leaders
**Domain:** EUV Lithography
**Entry point:** Tacit Trace Viewer

**Narration:**

"There's a problem in every knowledge-intensive industry that almost nobody has solved: the knowledge you most need to preserve is often the knowledge that can't be written down."

*Open the Tacit Trace Viewer.*

"This is a structured trace of an expert procedure: calibrating the tin droplet generator on an EUV lithography system. This is the machine that prints the transistors in every modern chip. The droplet calibration is done by a person with 10+ years of experience, and the knowledge of how to do it correctly is not fully captured in any manual."

*Show the trace episode — action sequence, decision points, annotations.*

"In Omega, tacit traces are first-class evidence. They're not just transcribed instructions. They include: the situational context, the decision points the expert navigated, the anomalies they noticed, the adjustments they made, and crucially — the things they couldn't fully explain but knew from experience."

*Show the agent who produced the trace.*

"The expert twin for this trace is a 23-year ASML process engineer. Their calibration score is 0.87. When this trace is linked to an outcome — successful EUV source stabilization — it becomes validated evidence that future procedures can reference."

*Show the provenance chain.*

"And when this engineer retires, the knowledge doesn't retire with them. It's in the substrate — governed, versioned, traceable, and available to the next engineer who inherits the system."

**Closing:** "This is the missing layer between expert brains and institutional memory."

---

## Journey 4: What the Collective Knows (3 min)
**Audience:** AI researchers, institutions considering AI adoption
**Entry point:** Collective Council / Inference Panel

**Narration:**

"One of the hardest questions in AI is: what does the system know, and how confident should it be?"

*Open the Inference Panel with a question about KRAS G12C druggability.*

"I'm asking the collective: 'Is KRAS G12C a viable drug target?' Three agents respond."

*Show the routing results — Dr. Sarah Chen, Dr. Marcus Webb, MolScreen-v2.*

"Each agent has a different competence profile, a different calibration score, and different beliefs. Dr. Chen gives 0.92 confidence based on clinical experience. Dr. Webb gives 0.97 based on structural chemistry. MolScreen-v2 gives 0.88 based on virtual screening data."

*Show the belief aggregation.*

"The collective assessment is not an average — it's a calibration-weighted synthesis. And it explicitly surfaces where they disagree: on the BBB question, the spread is 0.35 to 0.41, which is exactly why it's flagged as uncertain."

**Closing:** "This is not one AI answering a question. This is a governed council of specialized reasoners producing a calibrated, attributable, contestable collective view."

---

## Journey 5: The Living Graph (2 min)
**Audience:** Technical audience, graph and AI researchers
**Entry point:** Graph Evolution / Open-Endedness Panel

**Narration:**

"The hardest thing to build in AI is a system that gets smarter over time without getting more wrong."

*Open the Evolution Timeline.*

"Omega's open-endedness layer continuously scans the graph for: sparse neighborhoods that might represent knowledge gaps, entities in different domains with structurally similar mechanisms, and high-uncertainty nodes that are generating no new proposals."

*Show the bridge proposals.*

"Here's an interesting proposal: the EUV tin plasma contamination dynamics and the KRAS feedback suppression mechanism share a structural similarity — a positive feedback loop that amplifies a small signal into a large cascading effect. The system proposed this bridge. It was reviewed by both the process engineering expert and the oncology expert — and accepted."

*Show the version timeline.*

"Every time the graph evolves, it creates a version record. You can see exactly when this bridge was added, who proposed it, who reviewed it, and why it was accepted. The graph's history is as important as its current state."

**Closing:** "This is what it looks like when a knowledge system compounds over time through governed evolution — rather than being replaced every time the model is retrained."

---

## Journey 6: The Governance Overview (2 min)
**Audience:** Legal, compliance, risk, enterprise
**Entry point:** Provenance Inspector

**Narration:**

"Every sophisticated organization has the same question about AI: can we trust the output, and can we explain it?"

*Select any knowledge node and open the Provenance Inspector.*

"Omega's answer is not 'trust me.' It's 'here is the full chain.' Every node in the graph carries: who created it, when, from what source, with what validation, under what permissions. If you're told 'the drug's mechanism is covalent inhibition of KRAS G12C,' you can trace that claim to the 2019 Nature paper, to the chemist who validated it, to the time stamp, and to the hash of the data at the time."

*Show the impact tracer — revoke a piece of evidence.*

"And if evidence is later found to be invalid — say, the assay data was compromised — you can trace the downstream impact. Which decisions relied on it. Which agent beliefs need to be revised. Which proposals should be reconsidered."

**Closing:** "This is auditable, explainable AI — not as a checkbox, but as a first-class architectural property."

---

## Practical Demo Tips

1. **Start with the city view** before any panel. Let the audience form a spatial intuition of the knowledge landscape before diving into individual nodes.

2. **Always show dissent** in every domain. The existence of governed disagreement is one of the most powerful differentiators from conventional AI tools.

3. **Let the uncertainty values tell the story.** Don't explain what 0.72 uncertainty means — let the visual (the half-filled bar, the pulsing node) do the work first.

4. **Use the replay panel** for at least one decision in every demo. The step-by-step replay of a consequential decision is the single most compelling demo surface.

5. **Name the agents** when showing collective inference. "Dr. Sarah Chen, the oncologist, gives 0.92 confidence. MolScreen-v2, the AI tool, gives 0.88. Here's where they disagree." This makes the multi-agent architecture intuitive immediately.

6. **Zoom out to city view to close.** Ending with the knowledge ecology overview — showing domains, bridges, and growth areas — leaves the right impression: this is a landscape, not a chatbot.
