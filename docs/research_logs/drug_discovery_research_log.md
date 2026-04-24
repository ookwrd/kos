# Drug Discovery — Research Log

**Domain ID:** `drug_discovery`
**Grounding:** source_grounded
**Last verified:** 2026-04-24
**Primary KOS role:** Flagship case for hypothesis-evidence cycles, trial decision traces, and KRAS as a paradigm-shifting mechanism target

---

## Summary

Drug discovery — specifically the RAS oncogene pathway and the development of sotorasib (AMG 510, approved 2021) and adagrasib (MRTX849, approved 2022) — provides KOS with a densely documented knowledge graph spanning molecular mechanisms to regulatory decisions.

KRAS was considered "undruggable" for 40 years after its identification as an oncogene (Kirsten 1967; Harvey 1964). The mechanism-level understanding of why KRAS was undruggable (no deep binding pocket in GTP-bound state; fast nucleotide exchange rate) is available in review papers. The breakthrough — exploiting a covalent binding site in KRAS^G12C — was discovered by Ostrem et al. 2013 and commercialized through separate programs at Amgen and Mirati.

This provides KOS with:
1. A 40-year Hypothesis node (KRAS is undruggable) with eventually-falsified status
2. A mechanism path KRAS → KRAS^G12C-binding-pocket → AMG510 covalent binding → GTP-exchange suppression → tumor regression
3. Two competing clinical programs running in parallel (sotorasib vs. adagrasib), producing comparative trial data
4. A regulatory decision trace (FDA accelerated approval) with evidence chain

---

## Primary Sources Integrated

| ID | Source | Type | Confidence |
|----|--------|------|------------|
| ev-ostrem-2013 | Ostrem et al., "K-Ras(G12C) inhibitors allosterically control GTP affinity and effector interactions" (Nature 2013) | peer-reviewed | 0.98 |
| ev-hallin-amg510-2020 | Hallin et al., "The KRAS^G12C Inhibitor MRTX849 Provides Insight toward Therapeutic Susceptibility" (Cancer Discovery 2020) | peer-reviewed | 0.96 |
| ev-adagrasib-phase1 | Fell et al., "Identification of the Clinical Development Candidate MRTX849" (JACS 2020) | peer-reviewed | 0.95 |
| ev-CodeBreaK-100 | Skoulidis et al., "Sotorasib for Lung Cancers with KRAS p.G12C Mutation" (NEJM 2021) | clinical trial | 0.97 |
| ev-KRYSTAL-1 | Jänne et al., "Adagrasib in Non-Small-Cell Lung Cancer Harboring a KRAS^G12C Mutation" (NEJM 2022) | clinical trial | 0.97 |
| ev-fda-sotorasib-2021 | FDA Approval Summary: Sotorasib (Lumakras) NDA 214665 (2021) | regulatory | 0.98 |

---

## Key Mechanisms Modeled

**mech-AMG510-inhibits-KRAS** (covalent allosteric inhibition of KRAS^G12C switch-II pocket)
- Inputs: AMG510 compound, KRAS^G12C protein, GDP-bound state
- Outputs: covalent bond to Cys12, GTP-exchange suppression, MAPK pathway downregulation
- Causal direction: unidirectional (irreversible covalent bond)
- Confidence: 0.97

**mech-ras-raf-mek-activation** (canonical RAS signaling cascade: KRAS → RAF → MEK → ERK)
- Well-established; drives most KRAS-dependent tumor growth
- Resistance mechanisms (KRAS amplification, RTK bypass) are modeled as separate mechanism nodes
- Confidence: 0.99

**mech-acquired-resistance** (tumor evolution under KRAS^G12C inhibitor pressure)
- KRAS amplification, Y96D mutation, bypass via SOS1-mediated activation
- Documented in CodeBreaK 100 and KRYSTAL-1 follow-up studies
- KOS: Hypothesis node `hyp-combination-overcomes-resistance` with evidence_for partially populated
- Confidence: 0.88 (mechanism confirmed; combination resolution pending trials)

---

## Transfer Bridges

| Bridge ID | Target Domain | Transfer Type | Notes |
|-----------|--------------|---------------|-------|
| bridge-optimal-transport-drug-delivery | optimization_and_control | mathematical | Wasserstein distance → ADMET compartment modeling |
| bridge-functor-bench-to-bedside | mathematics_category_theory | structural | In vitro → in vivo as functor with explicit structural loss |
| (implicit) process-window-clinical | semiconductor_hardware | analogy | Lithography process window ≡ therapeutic window |

---

## Gaps and Open Questions

1. **Combination trial data:** AMG510 + MEK inhibitor and adagrasib + cetuximab combinations are in Phase 2. KOS records these as `hypothesis: status = "testing"` with evidence_for arrays to be populated when results emerge.
2. **KRAS^G12D/G12V:** The G12C-specific covalent approach does not generalize directly to other KRAS mutations that affect 50%+ of KRAS-mutant tumors. Separate mechanism node needed.
3. **Biomarker predictors of response:** Co-mutation burden (STK11, KEAP1) affects sotorasib efficacy. KOS does not yet have the genomic context layer needed to model this.

---

## Data Collection Method

NEJM trial publications are open access for key results. FDA approval summary available at fda.gov. Mechanistic papers available through institutional access (Ostrem 2013, Hallin 2020). No AutoResearchClaw calls required for initial encoding.
