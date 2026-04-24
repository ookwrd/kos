# Pandemic Governance — Research Log

**Domain ID:** `pandemic_governance`
**Grounding:** source_grounded
**Last verified:** 2026-04-24
**Primary KOS role:** Flagship case for belief propagation under dissent, aerosol science delayed translation, and R₀ as a network eigenvalue

---

## Summary

COVID-19 provides the largest real-time stress test of institutional knowledge management in modern history. Three KOS-critical mechanisms are cleanly documentable:

1. **Aerosol transmission delay:** The WHO's guidance position on COVID-19 transmission (droplet-only until mid-2020) lagged peer-reviewed evidence by 4–6 months. The decision chain is reconstructible from WHO technical briefs, Lancet correspondence, and SAGE meeting minutes. The aerosol consensus was not delayed by lack of evidence — the NAIIC-equivalent is the Morawska et al. open letter (July 2020, signed by 239 scientists).
2. **R₀ as network eigenvalue:** COVID spread differently in dense urban networks (NYC, Mumbai) vs. rural ones. The spectral graph theory connection — R₀ = largest eigenvalue of the contact network adjacency matrix — is established in Keeling & Rohani 2007 and confirmed computationally in several COVID-specific papers. This grounds the bridge to graph_theory_and_networks.
3. **WHO PHEIC decision delay:** The PHEIC was declared January 30, 2020 — after multiple WHO emergency committee meetings that reached no consensus. IHR expert dissent records are partially available through WHO document releases.

---

## Primary Sources Integrated

| ID | Source | Type | Confidence |
|----|--------|------|------------|
| ev-morawska-239-letter-2020 | Morawska & Milton: "It is Time to Address Airborne Transmission of COVID-19" (Clinical Infectious Diseases, 2020) | peer-reviewed | 0.97 |
| ev-who-aerosol-guidance-2021 | WHO Technical Brief: Coronavirus disease (COVID-19): How is it transmitted? (Updated April 2021) | WHO guidance | 0.96 |
| ev-who-pheic-jan2020 | WHO IHR Emergency Committee Statement, January 30 2020 | official statement | 0.95 |
| ev-sage-minutes-2020 | UK SAGE Meeting Minutes (released under FOI, 2020) | meeting records | 0.93 |
| ev-keeling-rohani-2007 | Modeling Infectious Diseases in Humans and Animals, Ch. 7 (Network models) | textbook | 0.97 |
| ev-covid-contact-network-2021 | Chang et al., "Mobility network models of COVID-19 explain inequities" (Nature 2021) | peer-reviewed | 0.94 |

---

## Key Mechanisms Modeled

**mech-aerosol-transmission** (physical mechanism: respiratory particle size determines transmission route)
- Key evidence: Morawska 2020, Wells-Riley equation, Buonanno et al. infectivity models
- Modeled as: EvidenceFragment with validated_by=['ev-morawska-239-letter-2020']
- Transfer: WHO's respiratory hygiene guidance was calibrated for droplet-only scenario → missed aerosol-dominant environments
- Confidence: 0.96

**mech-reporting-delay-spread** (institutional mechanism: delay in guidance despite available evidence)
- Input: 239-author open letter (July 2020) → WHO response: qualified acknowledgment (September 2020)
- Decision trace: dec-who-aerosol-guidance with actor=who-technical, policy=IHR-2005-guidelines
- Bridge to fukushima: bridge-aerosol-seawall-reporting-gap — identical delay structure despite different timescales
- Confidence: 0.92

**mech-r0-eigenvalue** (network mechanism: epidemic growth rate = dominant eigenvalue of contact graph)
- Mathematical grounding in Keeling & Rohani 2007 Chapter 7; confirmed by empirical COVID papers
- Bridge to graph_theory_and_networks: bridge-graph-epidemiology-network-topology
- Implication for KOS: interventions that reduce the largest eigenvalue (targeted node removal, quarantine of high-degree nodes) are mathematically equivalent to spectral graph sparsification
- Confidence: 0.93

---

## Transfer Bridges

| Bridge ID | Target Domain | Transfer Type | Notes |
|-----------|--------------|---------------|-------|
| bridge-aerosol-seawall-reporting-gap | fukushima_governance | causal template | Institutional delay structure identical |
| bridge-graph-epidemiology-network-topology | graph_theory_and_networks | mathematical isomorphism | R₀ = spectral radius |
| (implicit) IHR-who-governance | public_health_coordination | hierarchy | IHR 2005 is the constitutional document for WHO emergency authority |

---

## Gaps and Open Questions

1. **Counterfactual:** How much earlier could aerosol guidance have been issued? The aerosol scientists argue 4–6 months; WHO argues the evidence wasn't conclusive. KOS records both as competing decision frames in the DissentRecord.
2. **R₀ heterogeneity:** Network-based R₀ is not a single number but a distribution over contact structure. KOS currently models it as a scalar `confidence: 0.93` on the mechanism node — this is a deliberate simplification.
3. **IHR reform:** Post-COVID IHR amendments (2024) are not yet reflected in governance graph data.

---

## Data Collection Method

WHO technical briefs are public. SAGE minutes available through UK gov FOI. Peer-reviewed sources available open access (Morawska 2020, Chang 2021). Keeling & Rohani via Princeton UP. No AutoResearchClaw calls required for initial encoding.
