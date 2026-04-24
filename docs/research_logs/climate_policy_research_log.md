# Climate Policy — Research Log

**Domain ID:** `climate_policy`
**Grounding:** source_grounded
**Last verified:** 2026-04-24
**Primary KOS role:** Flagship case for goal-constraint conflict under multi-stakeholder governance, political discount rates, and tipping point uncertainty

---

## Summary

Climate policy provides KOS with its clearest example of goal-constraint conflict at civilizational scale: the scientific goal (limit warming to 1.5°C above pre-industrial) is in direct conflict with the economic constraint (no nation will accept a carbon price that prices fossil fuel assets at zero). This conflict is not resolvable by more information — it is a deontic conflict encoded in UNFCCC treaty structure.

Three KOS-critical mechanisms:

1. **GHG forcing → tipping cascade:** The causal chain from CO₂ concentration → radiative forcing → GMST → ice sheet dynamics → sea level is source-grounded across IPCC AR6. Several tipping elements (Greenland ice sheet, AMOC, Amazon dieback) have identified thresholds with quantified uncertainty ranges.
2. **Political discount rate:** Governments apply implicit discount rates of 7–10% to future climate harms when making policy decisions, compared to the ~1-2% rate that pure time preference + uncertainty would justify (Stern Review). The discount rate conflict is a KOS Constraint node (deontic type: "soft") — it is a preference, not a hard physical limit.
3. **Carbon budget:** The IPCC AR6 remaining carbon budget for 1.5°C (50% probability) is 500 GtCO₂ from Jan 2020. This is a measurable, source-grounded constraint that creates a hard deadline for the Goal nodes.

---

## Primary Sources Integrated

| ID | Source | Type | Confidence |
|----|--------|------|------------|
| ev-ipcc-ar6-wg1-2021 | IPCC AR6 WG1: The Physical Science Basis (2021) | authoritative assessment | 0.99 |
| ev-ipcc-ar6-carbon-budget | IPCC AR6 WG1, Chapter 5: Global Carbon Budget (2021) | authoritative assessment | 0.98 |
| ev-stern-review-2006 | Stern Review on the Economics of Climate Change (2006) | government report | 0.95 |
| ev-lenton-tipping-2019 | Lenton et al., "Climate tipping points — too risky to bet against" (Nature 2019) | perspective | 0.94 |
| ev-cop26-glasgow-pact-2021 | COP26 Glasgow Climate Pact (2021) | treaty | 0.97 |
| ev-cop28-uae-consensus-2023 | COP28 UAE Consensus: Transitioning away from fossil fuels (2023) | treaty | 0.97 |

---

## Key Mechanisms Modeled

**mech-ghg-forcing** (CO₂ concentration → radiative forcing → global mean surface temperature)
- ECS (Equilibrium Climate Sensitivity) = 2.5–4.0°C per doubling CO₂ (IPCC AR6 "likely" range)
- The mechanism is causal and direction: emissions → atmospheric concentration → temperature → tipping
- Confidence: 0.97 (physical mechanism); 0.82 (ECS range uncertainty)

**mech-tipping-cascade** (crossing GMST threshold → irreversible tipping element activation)
- Greenland: 1.5–2.0°C threshold; 7m sea level contribution over centuries
- AMOC: weakening confirmed by paleo-evidence; collapse threshold uncertain (1.4–4.0°C GMST)
- KOS: Hypothesis node `hyp-tipping-cascade-imminent` with uncertainty 0.72
- Confidence: 0.88 (mechanism confirmed); 0.55 (timing of thresholds)

**mech-political-discount** (short-term electoral cycle → systematic underweighting of long-term climate costs)
- Observable in every national carbon pricing scheme: social cost of carbon in policy = 15–50% of Stern-optimal
- This is a deontic constraint in KOS (constraint_type: "soft") — not a law of physics but a revealed preference
- Bridge to fukushima: political discount on seawall investment = same mechanism
- Confidence: 0.94

---

## Transfer Bridges

| Bridge ID | Target Domain | Transfer Type | Notes |
|-----------|--------------|---------------|-------|
| bridge-climate-political-discount | fukushima_governance | mechanism | Political discount on safety ↔ climate investment |
| (implicit) tipping-nonlinearity | causality_and_complex_systems | mathematical | Tipping points as bifurcations in dynamical systems |
| (implicit) uncertainty-governance | experimental_design_and_measurement | epistemic | How to act under deep uncertainty (GMST ranges) |

---

## Gaps and Open Questions

1. **Carbon budget vs. NDC gap:** IPCC AR6 shows current NDCs put us on a 2.7°C trajectory. The gap between committed policy and 1.5°C target is not represented as a KOS goal-constraint conflict node — this is a high-priority addition.
2. **Tipping threshold uncertainty:** AMOC collapse threshold is deeply uncertain (1.4–4.0°C range). KOS records this as UncertaintyAnnotation on the mechanism node.
3. **Loss and damage:** COP28 established a Loss and Damage fund. This is a new governance layer not yet represented in KOS goal_graph.

---

## Data Collection Method

IPCC AR6 reports are fully open access (ipcc.ch). COP final decisions are public international treaty documents. Stern Review is available as UK Treasury publication. Lenton 2019 available open access (Nature Comment).
