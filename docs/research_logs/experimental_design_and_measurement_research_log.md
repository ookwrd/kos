# Research Log — experimental_design_and_measurement

*April 2026 — Federation C: Discovery Science*

## Fixture Grounding

**Classification: hybrid**

The foundational content (Fisher's ANOVA and randomization, Bradford Hill criteria, reproducibility crisis documentation, metrology standards) is well-grounded in published statistical and scientific methodology literature. The more recent material on registered reports, pre-registration, and replication programs draws on ongoing scientific reform debates where empirical outcomes are documented but contested. No AutoResearchClaw run was performed. Synthesis draws on training knowledge of statistics, philosophy of science, and meta-science research.

---

## Domain Overview

Experimental design and measurement is the methodological science of structuring observations to reliably infer causal relationships and quantify phenomena accurately. It encompasses: study design (randomization, controls, blinding, sample size); measurement theory (validity, reliability, operationalization); statistical analysis (hypothesis testing, effect sizes, confidence intervals); and meta-science (reproducibility, replication, publication bias). The KOS relevance: experimental design knowledge is among the most explicitly transferable methodological knowledge across disciplines — Fisher's ANOVA was developed in agriculture and is now fundamental to genomics; randomized controlled trials from medicine have been applied to economics and policy.

---

## Key Named Cases and Grounding Examples

### Ronald Fisher — ANOVA and Randomized Experiments (1920s–1935)

Ronald Fisher's development of analysis of variance (ANOVA) at Rothamsted Agricultural Research Station in the 1920s, and his formalization in "The Design of Experiments" (1935), is the founding case of formal experimental methodology. Fisher's contributions — randomization as the basis for causal inference, factorial designs for detecting interaction effects, the F-statistic — were developed for agricultural field trials and transferred to virtually every quantitative empirical science. The transfer is one of the clearest cases of methodological knowledge migration in science history.

Real literature: Fisher, R.A. (1935), "The Design of Experiments," Oliver and Boyd; Fisher, R.A. (1925), "Statistical Methods for Research Workers."

### Bradford Hill Criteria — Causal Inference from Observational Data (1965)

Austin Bradford Hill's 1965 presidential address to the Royal Society of Medicine, "The Environment and Disease: Association or Causation?", proposed nine criteria for inferring causation from epidemiological association (strength, consistency, specificity, temporality, biological gradient, plausibility, coherence, experiment, analogy). The criteria were developed in the context of smoking-lung cancer research and have been widely applied — and widely criticized for being ambiguous or insufficient — across epidemiology and medicine. They remain the most cited framework for causal inference from observational data in medicine.

Real literature: Hill, A.B. (1965), "The Environment and Disease: Association or Causation?" Proceedings of the Royal Society of Medicine.

### Reproducibility Crisis — Psychology and Biomedical Science (2011–2015)

The Open Science Collaboration's "Estimating the Reproducibility of Psychological Science" (Science, 2015) attempted to replicate 100 published psychological studies; approximately 36–39% replicated at original effect sizes. This is a documented empirical event: a systematic replication exercise with quantified outcomes. In biomedical science, Glenn Begley and Lee Ellis (Nature, 2012) reported that only 6 of 53 landmark cancer biology papers could be replicated internally at Amgen. These are specific, named, published studies with specific quantitative results.

Real literature: Open Science Collaboration (2015), Science; Begley, C.G. & Ellis, L.M. (2012), Nature.

### Metrology — SI System and Measurement Standards

The International System of Units (SI) revision of 2019, which redefined four base units (kilogram, ampere, kelvin, mole) in terms of fixed physical constants, is a documented historical event in measurement science. The redefinition of the kilogram (previously defined by a physical platinum-iridium artifact) in terms of the Planck constant is philosophically significant: it demonstrates that measurement standards can be grounded in invariant physical law rather than contingent physical objects.

Real literature: Bureau International des Poids et Mesures (BIPM) documentation; Mills, I. et al. (2011), Metrologia, on the new SI.

---

## What Was Synthesized vs. What Could Be Extracted

**Synthesized from training knowledge:**
- Fisher's methodological contributions characterization (accurate; standard statistics history)
- Bradford Hill criteria content (accurate; the nine criteria are well-documented)
- Reproducibility crisis statistics (Amgen 6/53 and OSC ~36–39% are real published numbers)
- SI revision characterization (accurate; 2019 redefinition is documented)

**Could be extracted from specific sources:**
- Open Science Collaboration (2015) Science paper — full replication dataset available
- Begley & Ellis (2012) Nature — primary report of Amgen replication attempt
- Fisher (1935) — original text, available
- BIPM documentation for 2019 SI revision — fully public

---

## Notable Gaps

1. No fixture file — V6 new domain stub needed.
2. The Fisher agricultural → genomics transfer story is the strongest KOS narrative for this domain — it should be a primary fixture arc.
3. The reproducibility crisis content is particularly strong for KOS: it is explicitly about systematic failure of knowledge transfer (published results that don't replicate are knowledge that fails to transfer).
4. Bridge to causality_and_complex_systems: Bradford Hill criteria are a pre-formal causal inference framework; Pearl's do-calculus is a response to precisely the ambiguities Hill left unresolved.
5. Bridge to drug_discovery and translational_biomedicine: clinical trial design is the primary domain where experimental design expertise is most rigorously applied; RCT methodology is central to both.
6. Bridge to mathematics_category_theory: the formalization of statistical inference in measure-theoretic probability, and the categorical treatment of statistical models, are active areas.
7. The Bayesian vs. frequentist debate is relevant but risks being too abstract for fixture nodes — should be represented through specific applied consequences rather than philosophical debate.
8. No decisions array; no district data; no bridges defined.
