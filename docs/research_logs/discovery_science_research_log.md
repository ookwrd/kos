# Research Log — Discovery Science Domain Family

*April 2026 — Metro Region 3: drug_discovery, climate_policy*

## Source Method

Both domains synthesized from training knowledge. Drug discovery has the richest fixture data in the system (1 structured decision). Climate policy has detailed historical facts but no structured decisions.

Labels: **training-knowledge-grounded synthetic fixture**

---

## drug_discovery

The most data-rich domain in the system. The KRAS G12C / sotorasib (AMG 510) pathway is a real, published, well-documented drug discovery story.

### Primary technical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| KRAS G12C is a mutant form of the KRAS oncogene, present in ~13% of non-small cell lung cancer | Published oncology literature | High |
| KRAS was considered "undruggable" for ~30 years due to lack of viable binding pockets | Review literature | High |
| AMG 510 (sotorasib) is an irreversible KRAS G12C covalent inhibitor | Hallin et al. 2020, Cancer Cell | High |
| AMG 510 targets a cryptic switch-II pocket (SIIP) that is specific to the G12C mutant | Primary literature | High |
| FDA approved sotorasib (Lumakras): May 28, 2021 | FDA records | High |
| Blood-brain barrier (BBB) penetration is a key challenge for CNS-active drugs | Standard pharmacology | High |
| P-glycoprotein efflux is a major BBB efflux transporter | Standard pharmacology | High |
| BBB penetration typically correlated with molecular weight, lipophilicity (logP), PSA | Standard pharmacology | High |

### The BBB threshold: 0.40

This is the most specific demo construct in the system. The threshold is illustrative — a specific numerical value chosen to drive the Phase II CNS deferral narrative.

| Item | Status | Notes |
|---|---|---|
| BBB P:C ratio threshold = 0.40 | Demo construct | Specific value is illustrative; 0.3-0.5 range is pharmacologically plausible |
| "Dr. Sarah Chen" as CNS safety gate keeper | Composite character | No named individual; role is real (safety physician on trial committee) |
| MolScreen-v2 virtual screening tool | Illustrative | Generic AI-assisted screening is real; specific tool is fictional |
| Specific Phase II approval timeline | Illustrative | Phase structure is accurate; specific dates are demo constructs |

### The one structured decision

The only domain with a structured decision trace: Phase II CNS deferral decision. This is the strongest fixture in the system.

Decision structure:
1. Efficacy evidence reviewed (AMG 510 tumor regression data)
2. CNS penetration testing (P:C ratio 0.23 < threshold 0.40)
3. Dr. Sarah Chen raises CNS safety concern (preserved dissent — dissent_preserved: true)
4. Trial committee approves with CNS restriction
5. MolScreen-v2 BBB prediction agrees with Chen's assessment

This decision has `dissent_preserved: true` — it is the "good outcome" case that contrasts with Fukushima and 737 MAX. The dissent was heard and the safety constraint was respected.

### Key gaps

- Only 1 decision; V5 target: add 2 more decisions:
  - (1) KRAS G12C binding mechanism validation decision (molecular sciences)
  - (2) Phase III expansion decision (whether to proceed to full CNS trial)
- The Dr. Sarah Chen guardian concept needs a Knowledge Guardian wrapper
- The BBB 0.40 threshold rationale should be captured in a TacitTrace

---

## climate_policy

### Primary historical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| James Hansen 1988 Congressional testimony: global warming is already occurring | Congressional record | High |
| IPCC First Assessment Report: 1990 | IPCC records | High |
| Kyoto Protocol: 1997, binding emissions targets for developed countries | Treaty record | High |
| US withdrew from Kyoto: 2001 (Bush administration) | Official record | High |
| IPCC AR5 (2013): >95% certainty anthropogenic warming | IPCC AR5 | High |
| Paris Agreement: December 2015, 1.5°C/2°C targets | Treaty record | High |
| COP26 Glasgow: "phase down" (not "phase out") of unabated coal, India and China | COP26 documents | High |
| Hansen has consistently argued 2°C target is insufficient; 1°C is safer limit | Hansen 2012, PLOS ONE | High |
| Hansen called Paris Agreement "fraud, bullshit, and fairy tales" | Public interview, 2016 | High — notable that specific language is well-documented |

### Demo constructs

| Item | Status | Notes |
|---|---|---|
| Hansen calibration score: 0.78 | Demo construct | Grounded in generally accurate predictions (1988 → 2023) |
| Specific IPCC deliberation details | Composite | General character is documented; internal deliberations are not public |
| Climate negotiator calibration scores | Demo constructs | Not formally computed |

### Key bridge: climate ↔ fukushima

The `bridge-climate-political-discount` is a high-quality bridge: both COP26 "phase down" language and the TEPCO seawall deferral are instances of political time-horizon discounting — governance bodies acknowledge expert evidence then accept weaker action under economic pressure.

This bridge is grounded in documented history for both ends:
- COP26 language dilution: well-documented through official texts and negotiator accounts
- TEPCO deferral: documented in post-accident investigation records

### Key gaps

- No structured decisions in fixture
- V5 target: add 3 decisions: (1) Paris Agreement 1.5°C vs 2°C target compromise, (2) COP26 coal language dilution, (3) specific national emissions target setting
- The dissent pattern (scientists vs. political negotiators) would benefit from an ExpertTwin treatment for Hansen

---

## Region Characteristics

Discovery Science is characterized by evidence uncertainty, expert consensus vs. political authority, and long time horizons. The two cities share a deep structural parallel: in both drug discovery and climate policy, scientific evidence is generated, uncertainty is quantified, and the question is how political/regulatory bodies act on that uncertainty.

The underexplored bridge (drug_discovery ↔ climate_policy, not yet in the bridge list) would be about regulatory epistemics: how do FDA clinical trial standards for evidence quality compare to IPCC confidence language (AR4/AR5 "very likely = 95%+ probability")? Both are attempts to communicate calibrated uncertainty to non-specialist decision-makers.

This bridge would require deeper research to develop — it is listed as a discovery opportunity in `cities_of_cities_architecture.md`.
