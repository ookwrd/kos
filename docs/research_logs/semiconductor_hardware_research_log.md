# Semiconductor Hardware — Research Log

**Domain ID:** `semiconductor_hardware`
**Grounding:** hybrid
**Last verified:** 2026-04-24
**Primary KOS role:** Case for supply chain concentration risk, tacit process knowledge in chip fabs, and process-window transfer to clinical domains

---

## Summary

Semiconductor hardware (broader than EUV lithography specifically — includes chip design, packaging, and fab process integration) provides KOS with a hybrid-grounded domain: the physics is source-grounded; the supply chain and geopolitical dynamics are partially public with significant uncertainty.

Key KOS use cases:
1. **Advanced packaging (CoWoS, HBM):** TSMC's chip-on-wafer-on-substrate technology and HBM memory integration involve tacit knowledge in wafer bonding, thermal management, and yield optimization that is not fully published.
2. **Process integration for logic:** N3 (3nm-class) process integration involves 100+ optimization loops between gate stack, BEOL, and lithography that are trade secrets. The outline is reconstructed from IEDM papers.
3. **Geopolitical supply chain:** TSMC fabs in Taiwan produce ~90% of leading-edge logic chips globally. The concentration risk is quantified in RAND and CSIS reports.

---

## Primary Sources Integrated

| ID | Source | Type | Confidence |
|----|--------|------|------------|
| ev-tsmc-n3-iedm-2022 | TSMC N3 Technology Highlights (IEDM 2022) | conference paper | 0.88 |
| ev-hbm3-jedec-2022 | JEDEC HBM3 Standard (JESD238) | standard | 0.97 |
| ev-csis-chip-report-2021 | CSIS: "Winning the Tech Race" — Semiconductor Supply Chain (2021) | policy report | 0.87 |
| ev-semiconductors-act-2022 | US CHIPS and Science Act (2022) | legislation | 0.97 |
| ev-amd-3d-v-cache-2022 | AMD 3D V-Cache Technology (Hot Chips 2022) | industry presentation | 0.85 |

---

## Key Mechanisms Modeled

**mech-yield-learning-curve** (defect density reduces with cumulative wafer starts following Wright's law)
- Process yield follows approximately Wright's Law: yield improves ~15–20% per doubling of production volume
- Mechanism inputs: process maturity, defect density, cumulative production
- KOS: Mechanism node with confidence 0.87 (partially speculative parameter estimates)
- Confidence: 0.87

**mech-process-window-integration** (each process module has an independent window; integration constrains the intersection)
- The combined process window is the intersection of all individual module windows
- As node count increases (more modules, more layers), window shrinks — constraint intensifies
- Bridge to drug_discovery: analogous to ADMET constraints narrowing the therapeutic window
- Confidence: 0.85

**mech-concentration-supply-chain-risk** (geographic concentration → single point of failure in global production)
- TSMC: >90% leading-edge; ASML: 100% EUV scanners; TOKYO ELECTRON: >80% etch/deposition tools
- Concentration is quantifiable; failure scenarios are modeled in CSIS reports
- KOS: Constraint nodes with constraint_type="hard" on geopolitical dependency
- Confidence: 0.82 (numbers are estimates; actual failure mode dynamics uncertain)

---

## Transfer Bridges

| Bridge ID | Target Domain | Transfer Type | Notes |
|-----------|--------------|---------------|-------|
| align-semi-drug | drug_discovery | analogical | Process window ≡ therapeutic window |
| (implicit) supply-chain-disaster | supply_chain_resilience | structural | Single-point-of-failure structure identical |
| (implicit) tacit-fab-expert | expert_preservation | mechanism | Fab process engineers as irreplaceable knowledge holders |

---

## Grounding Notes

This domain is marked **hybrid** because:
- Physics mechanisms (yield, photonics, materials) are source-grounded
- Supply chain concentration numbers are from policy reports with estimation uncertainty
- Process-specific details (N3 gate architecture, HBM thermal interface) are reconstructed from IEDM/Hot Chips, which disclose architectures but not full process specifications

---

## Data Collection Method

IEDM proceedings via IEEE Xplore. JEDEC standards available for purchase (HBM3 available as preview). CSIS and RAND reports are public. CHIPS Act text is public law. Industry presentations (AMD, TSMC) are partially available from conference websites.
