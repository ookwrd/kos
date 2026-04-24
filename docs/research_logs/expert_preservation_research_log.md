# Research Log — expert_preservation

*April 2026 — Federation C: Discovery Science*

## Fixture Grounding

**Classification: hybrid**

Content is grounded in documented cases of expert knowledge loss (NASA Apollo institutional memory, Japanese traditional craft industries, semiconductor process engineers, Japanese sword-making), established knowledge management literature (Polanyi tacit knowledge, Nonaka/Takeuchi SECI model), and specific programs designed to capture retiring expert knowledge. No AutoResearchClaw run was performed. Synthesis draws on training knowledge of organizational knowledge management, NASA institutional history, and industrial craft documentation programs. The tacit knowledge framing is well-established; specific elicitation protocol effectiveness data is approximate.

---

## Domain Overview

Expert preservation is the domain of capturing, encoding, and transmitting knowledge that is embedded in experienced practitioners before it is lost through retirement, death, or organizational dissolution. It is perhaps the most direct application of the KOS mission: the system exists partly to answer "how do you preserve what an expert knows?" The domain covers tacit knowledge theory, knowledge elicitation methods, apprenticeship structures, cognitive task analysis, and failure modes of preservation attempts.

---

## Key Named Cases and Grounding Examples

### NASA Apollo — The Knowledge Gap (1972–2000s)

After Apollo 17 (December 1972), NASA did not send humans beyond low Earth orbit for more than half a century. The engineers who designed, built, and operated the Saturn V, the Lunar Module, the Apollo guidance computer, and the mission operations procedures gradually retired. By the 2000s, NASA had identified that significant institutional knowledge had been lost: specific manufacturing processes for the F-1 engine turbopump were documented inadequately; the exact alloy compositions and heat treatment schedules were in some cases recorded only in personal notebooks or verbal tradition.

When NASA undertook the development of the Space Launch System (SLS) and studied the Apollo record for the J-2X engine, teams found that "rediscovering" processes took years of experimental work — confirming that the original documentation was insufficient. This is a documented case of expert knowledge loss with real engineering consequences.

Real literature: NASA Inspector General reports on institutional knowledge management; Bizony, P. and others who documented Apollo engineering specifically; internal NASA knowledge management initiative documentation.

### Japanese Traditional Craft Industries — Ningen Kokuhō

Japan's Living National Treasures (Ningen Kokuhō) program, established in 1950, formally designates master practitioners of traditional arts and crafts — Nishijin textile weaving, Bizen pottery, Kutani porcelain, sword-making (nihontō) — as national cultural assets with government support for transmission. The program acknowledges that certain skills cannot be extracted from the practitioner and encoded in a manual: apprenticeship is the transmission medium. The documented failure modes (apprentice shortage, modernization pressure, practitioner death before transmission completes) are specific and on record.

Real literature: Japanese Agency for Cultural Affairs documentation; Singleton, J. (ed.) (1998), "Learning in Likely Places: Varieties of Apprenticeship in Japan," Cambridge University Press.

### Semiconductor Process Engineering — Retiring Expertise

The tacit knowledge embedded in experienced process engineers at legacy semiconductor fabs is a documented industry concern. Process engineers who ran 200mm wafer lines in the 1990s and 2000s carry knowledge of specific equipment behaviors, failure modes, and "recipe" adjustments that are not fully captured in process documentation. As fabs transitioned to 300mm or newer processes, this knowledge became difficult to transfer. SEMATECH research programs in the 1990s specifically addressed this problem.

Real literature: Scarbrough, H. & Swan, J. (2001) on knowledge management in technology-intensive industries; SEMATECH technical reports.

### Nonaka & Takeuchi — SECI Model (1995)

Ikujiro Nonaka and Hirotaka Takeuchi's "The Knowledge-Creating Company" (1995) formalized the conversion between tacit and explicit knowledge in four modes: Socialization (tacit-to-tacit, apprenticeship), Externalization (tacit-to-explicit, documentation), Combination (explicit-to-explicit, synthesis), Internalization (explicit-to-tacit, learning from documents). This is the most widely cited framework for tacit knowledge management. It is the conceptual foundation for the TacitTraceViewer in the current Omega prototype.

Real literature: Nonaka, I. & Takeuchi, H. (1995), "The Knowledge-Creating Company," Oxford University Press.

### Cognitive Task Analysis — Klein's Recognition-Primed Decision (1993)

Gary Klein's recognition-primed decision (RPD) model describes how experienced practitioners (fireground commanders, intensive care nurses, chess players) make rapid decisions without explicit comparison of alternatives — they pattern-match to a prototypical situation and simulate the first option that comes to mind. This is a foundational model for understanding what tacit expertise actually consists of, and for designing elicitation methods (critical decision method interviews) that can surface it.

Real literature: Klein, G. (1993), "A Recognition-Primed Decision (RPD) Model of Rapid Decision Making," in Decision Making in Action.

---

## What Was Synthesized vs. What Could Be Extracted

**Synthesized from training knowledge:**
- NASA Apollo knowledge loss characterization (general character accurate; specific documentation gaps are approximate)
- Living National Treasures program characterization (accurate; this is well-documented)
- Semiconductor process engineering tacit knowledge gap (accurate in general; no specific firm or program cited)
- Nonaka/Takeuchi SECI model (accurate; standard knowledge management)

**Could be extracted from specific sources:**
- NASA OIG reports on institutional knowledge management programs
- Japanese Agency for Cultural Affairs official Living National Treasures registry
- Klein (1993) — original RPD paper
- Nonaka & Takeuchi (1995) — primary text, widely available

---

## Notable Gaps

1. No fixture file — V6 new domain stub needed.
2. The NASA Apollo case is the highest-quality grounding for this domain — it is specific, verifiable, and has real engineering consequences. It should be a primary fixture arc.
3. Bridge to disaster_response_operations: contact tracing expertise transfer (COVID) is a direct expert_preservation case.
4. Bridge to robotics_extreme_environments: EOD operator skill (Singer 2009) is an expert_preservation case.
5. Bridge to euv_lithography: ASML droplet calibration trace in TacitTraceViewer is already framed as expert preservation — this bridge should be formalized.
6. The codifiability spectrum in TacitTraceViewer is already the primary visual representation of this domain's core concept — the fixture should map to that visualization.
7. What is missing: specific effectiveness data on knowledge elicitation programs (how much is actually captured, at what fidelity). This would require primary source research beyond training knowledge.
8. No decisions array; no district data; no bridges defined.
