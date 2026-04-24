# EUV Lithography — Research Log

**Domain ID:** `euv_lithography`
**Grounding:** source_grounded
**Last verified:** 2026-04-24
**Primary KOS role:** Flagship case for tacit knowledge in high-precision manufacturing, multi-decade technology development, and process window as a formal constraint concept

---

## Summary

Extreme Ultraviolet (EUV) lithography — the technology that enables sub-7nm semiconductor patterning — represents perhaps the most concentrated convergence of tacit expertise, physics precision, and supply chain monopoly in modern manufacturing. ASML holds 100% market share in EUV scanners. The technology required ~30 years of development (SEMATECH/EUV LLC consortium, 1994–2010; ASML production, 2010–present).

KOS uses EUV as its flagship case for:
1. **Process window as a formal constraint:** The usable parameter space (dose × focus) that produces acceptable features is a precisely measured 2D region. Analogous to the therapeutic window in drug discovery — the transfer bridge `process-window-clinical` is mathematically grounded.
2. **Tacit knowledge concentration:** Tin droplet generation (the plasma source mechanism), collector mirror alignment, and resist chemistry optimization require expertise that cannot be fully codified. The majority of this knowledge is held by a small number of engineers globally.
3. **Photon economics:** At 13.5nm wavelength with ~6% source efficiency, EUV scanners require ~500kW of laser power to deliver usable wafer throughput. Every efficiency decision involves cascading tradeoffs documented in SPIE proceedings.

---

## Primary Sources Integrated

| ID | Source | Type | Confidence |
|----|--------|------|------------|
| ev-asml-euv-source-2018 | Fomenkov et al., "Light sources for high-volume manufacturing EUV lithography" (JVST 2018) | peer-reviewed | 0.96 |
| ev-SEMATECH-euv-1997 | SEMATECH EUV LLC Consortium Formation Documents (1997) | industry report | 0.94 |
| ev-asml-annual-report-2023 | ASML Annual Report 2023, EUV Revenue and Units | financial/technical | 0.97 |
| ev-taiwan-asml-dependence-2023 | TSMC-ASML EUV supply chain dependency analysis (Nikkei/Bloomberg, 2023) | industry analysis | 0.90 |
| ev-spie-process-window-2022 | SPIE Advanced Lithography: Process window characterization for 0.33NA EUV | conference proceedings | 0.95 |
| ev-resist-sensitivity-2021 | IMEC EUV resist sensitivity and LWR tradeoff (2021 EUVL Workshop) | workshop proceedings | 0.92 |

---

## Key Mechanisms Modeled

**mech-laser-plasma** (CO₂ laser → tin droplet → 13.5nm EUV plasma generation)
- Inputs: 20kW CO₂ laser pulse, 30μm tin droplet
- Outputs: tin plasma emitting 13.5nm radiation (6.5% conversion efficiency)
- The conversion efficiency number is source-grounded (Fomenkov 2018)
- Confidence: 0.97

**mech-process-window** (dose × focus parameter space → acceptable CD uniformity)
- A 2D constraint set in (dose mJ/cm², focus nm) space
- Failure mode: dose too high → bridging; too low → necking; focus off → CD tilt
- Bridge to drug_discovery: therapeutic window (dose × PK parameter space) is structurally identical
- Confidence: 0.96

**mech-stochastic-defectivity** (photon shot noise → line edge roughness → device failure)
- At EUV doses, photon counting statistics produce significant LWR (line width roughness)
- Signal-to-noise is fundamentally limited by photon statistics — no process improvement can eliminate this
- Models a hard physical constraint in KOS Constraint nodes (constraint_type: "hard")
- Confidence: 0.95

---

## Transfer Bridges

| Bridge ID | Target Domain | Transfer Type | Notes |
|-----------|--------------|---------------|-------|
| align-cat-euv | mathematics_category_theory | formal alignment | Category maps ↔ lithography alignment protocols |
| align-semi-drug | drug_discovery | analogical | Process window ≡ therapeutic window |
| (implicit) tacit-align-expert | expert_preservation | mechanism | EUV process tacit knowledge loss when engineers retire |

---

## Gaps and Open Questions

1. **High-NA EUV (0.55 NA):** ASML's next generation (Hyper-NA) introduces anamorphic optics. The mechanism nodes for process window need to be extended; current nodes assume 0.33 NA.
2. **Resist chemistry:** Chemically-amplified resist (CAR) vs. metal oxide resist (MOR) trade different stochastic/sensitivity profiles. KOS records both under `ent-euv-resist` but does not yet distinguish them as separate entities.
3. **Geopolitical constraint:** ASML export controls (Netherlands gov, US EAR) are governance constraints not yet modeled in the goal/governance graph.

---

## Data Collection Method

SPIE proceedings available through SPIE Digital Library. ASML annual reports are public. SEMATECH historical documents partially available. IMEC workshop proceedings require institutional access. Fomenkov 2018 available open access (JVST).
