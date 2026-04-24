# Research Log — causality_and_complex_systems

*April 2026 — Federation C: Discovery Science*

## Fixture Grounding

**Classification: hybrid**

The causal inference content (Pearl's do-calculus, directed acyclic graphs, Rubin potential outcomes framework) is well-grounded in published mathematical and statistical literature. The complex systems content (emergence, phase transitions, feedback loops, self-organized criticality) is real and documented but spans diverse research communities with varying levels of formalization. The bridge between formal causal inference and complex systems science is an active research area — some connections are established, others are speculative or domain-specific. Content synthesized from training knowledge of statistics, systems science, and philosophy of causation literature.

---

## Domain Overview

This domain covers two related intellectual traditions: (1) formal causal inference — the mathematical theory of causal reasoning, counterfactuals, and intervention effects; and (2) complex systems science — the study of emergent behavior, nonlinearity, feedback, and collective dynamics in systems with many interacting components. The KOS relevance: both traditions are about extracting causal structure from observational patterns, and both face the challenge of transferring analytic methods across radically different empirical domains (Pearl's DAG framework was developed for AI and applied to epidemiology and economics; complex systems methods from physics were applied to ecology, economics, and social science).

---

## Key Named Cases and Grounding Examples

### Judea Pearl — do-Calculus and the Causal Revolution (2000–2018)

Judea Pearl's development of directed acyclic graphs (DAGs) for causal reasoning, formalized in "Causality" (2000) and popularized in "The Book of Why" (Pearl & Mackenzie, 2018), is the most systematic attempt to formalize causal inference in the 20th-21st century. The do-calculus — a notation for interventional distributions that distinguishes P(Y|do(X)) from P(Y|X) — is a genuine conceptual advance that resolved confusion between association and causation in a formally tractable way. The framework has been applied to epidemiology, economics, AI, and policy analysis.

Real literature: Pearl, J. (2000), "Causality: Models, Reasoning, and Inference," Cambridge University Press; Pearl, J. & Mackenzie, D. (2018), "The Book of Why," Basic Books.

### Rubin Potential Outcomes Framework — Counterfactual Causality (1974–)

Donald Rubin's potential outcomes framework (building on Jerzy Neyman's 1923 work) provides an alternative mathematical foundation for causal inference, grounding causation in counterfactual comparisons: the causal effect of treatment T on unit i is Y_i(1) - Y_i(0), where only one of the potential outcomes is observed. The framework is foundational in econometrics (Angrist & Pischke) and epidemiology (Hernán & Robins). The tension and partial reconciliation between Pearl's graphical approach and Rubin's potential outcomes is an active methodological debate.

Real literature: Rubin, D.B. (1974), "Estimating Causal Effects of Treatments in Randomized and Nonrandomized Studies," Journal of Educational Psychology; Hernán, M. & Robins, J. (2020), "Causal Inference: What If" (free online).

### Self-Organized Criticality — Bak, Tang & Wiesenfeld (1987)

Per Bak's work on self-organized criticality (SOC) — the tendency of certain driven dissipative systems to evolve toward a critical state characterized by power-law distributions of event sizes — is a foundational complex systems result. The sandpile model, earthquakes (Gutenberg-Richter law), and forest fires are canonical examples. SOC is relevant to KOS because it describes how systems can maintain sensitivity to perturbations without external tuning — an emergent property with implications for resilience and cascade analysis.

Real literature: Bak, P., Tang, C. & Wiesenfeld, K. (1987), "Self-organized criticality: An explanation of the 1/f noise," Physical Review Letters.

### Complex Adaptive Systems — Santa Fe Institute (1984–present)

The Santa Fe Institute program in complex adaptive systems (Holland, Gell-Mann, Kauffman, Arthur) developed a broad framework for understanding emergent behavior in economies, ecosystems, and immune systems. Stuart Kauffman's NK fitness landscape model and Brian Arthur's work on increasing returns and lock-in are specific results that have transferred across disciplines. The degree of transfer and the formal precision of these transfers varies considerably.

Real literature: Holland, J.H. (1995), "Hidden Order: How Adaptation Builds Complexity"; Kauffman, S. (1993), "The Origins of Order."

---

## What Was Synthesized vs. What Could Be Extracted

**Synthesized from training knowledge:**
- Pearl do-calculus characterization (accurate; the mathematical content is well-established)
- Rubin potential outcomes characterization (accurate; standard econometrics/epidemiology)
- SOC general description (accurate; Bak et al. 1987 is real and well-known)
- Santa Fe program characterization (accurate in general; specific transfer examples are paraphrased)

**Could be extracted from specific sources:**
- Pearl (2000) — primary mathematical text, extensive
- Hernán & Robins (2020) — freely available online; primary methodological reference for epidemiological causal inference
- Bak et al. (1987) Physical Review Letters — primary SOC paper, retrievable
- Arthur, W.B. (1989) "Competing Technologies, Increasing Returns, and Lock-In by Historical Events" — Economic Journal; primary increasing returns paper

---

## Notable Gaps

1. No fixture file — V6 new domain stub needed.
2. The tension between Pearl and Rubin frameworks is analytically interesting for KOS — it is itself a case of parallel formalizations of the same phenomenon, relevant to the scientific_model_transfer domain.
3. Bridge to developmental_biology_morphogenesis: reaction-diffusion systems are complex systems with emergent pattern formation; causality questions in development ("does Hox gene expression cause digit formation or correlate with it?") are directly addressed by Pearl's framework.
4. Bridge to industrial_quality_control: Shewhart common-cause/special-cause distinction is a pre-formal version of the Pearl/Rubin causal decomposition.
5. Bridge to graph_theory_and_networks: DAGs are graphs; the causal inference literature and network science literature overlap substantially.
6. The "complex systems" framing risks being too broad — the fixture should distinguish formal results from hand-waving. Specific results (SOC power laws, NK landscapes) should be nodes; vague claims about "emergence" should not be.
7. No decisions array; no district data; no bridges defined.
