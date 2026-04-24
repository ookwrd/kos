# Aviation Safety — Research Log

**Domain ID:** `aviation_safety`
**Grounding:** source_grounded
**Last verified:** 2026-04-24
**Primary KOS role:** Flagship case for authority gradient management, checklist protocol, and crew resource management (CRM) as formalized collective cognition

---

## Summary

Aviation safety is the most mature institutional field for transforming catastrophic organizational failure into actionable procedure. The domain provides KOS with three foundational mechanisms:

1. **CRM (Crew Resource Management):** Emerged after United Airlines Flight 173 (1978), where a captain's authority gradient prevented the first officer from overriding his fixation on a landing gear issue until fuel exhaustion. CRM systematically inverts the authority gradient in safety-critical contexts.
2. **NTSB accident investigation model:** Reconstructs decision traces from FDR/CVR data with 6-level causal tree (immediate → contributing → systemic → latent organizational factors). This is the prototype for KOS DecisionReplay.
3. **737 MAX MCAS failures (2018-2019):** Lion Air 610 and Ethiopian 302 demonstrate how a regulatory-authority link (FAA-Boeing ODA) can suppress the propagation of evidence about a known mechanism failure. 346 fatalities. The decision chains are forensically reconstructed in the JATR report and the House Transportation Committee report.

---

## Primary Sources Integrated

| ID | Source | Type | Confidence |
|----|--------|------|------------|
| ev-ual173-ntsb-1979 | NTSB Report AAR-79-7: United Airlines 173 | accident report | 0.97 |
| ev-crm-helmreich-1999 | Helmreich et al., "The Evolution of Crew Resource Management Training in Commercial Aviation" (IJAP 1999) | peer-reviewed | 0.96 |
| ev-737max-house-2020 | House Transportation Committee: "The Design, Development and Certification of the Boeing 737 MAX" (2020) | congressional report | 0.95 |
| ev-737max-jatr-2019 | Joint Authorities Technical Review: Boeing 737 MAX MCAS (2019) | regulatory review | 0.94 |
| ev-sullenberger-aba-2019 | Sullenberger Congressional Testimony on 737 MAX (June 2019) | testimony | 0.93 |

---

## Key Mechanisms Modeled

**mech-authority-gradient** (social hierarchy suppresses safety-critical information flow)
- First officer hesitation to override captain = authority gradient blocking dissent
- CRM intervention: explicit protocol that junior crew members must be heard, captain must acknowledge
- KOS: DissentRecord.resolution_status tracks whether dissent was incorporated
- Confidence: 0.96

**mech-checklist-enforced-cognition** (formalized procedure as distributed cognitive prosthetic)
- Atul Gawande's Checklist Manifesto draws directly from aviation; surgical application is a key bridge
- KOS: DecisionTrace.policy_ids links to checklist procedures as governance constraints
- Bridge to surgical_robotics: same mechanism, different substrate
- Confidence: 0.94

**mech-fda-boeing-regulatory-capture** (ODA delegation creates safety authority loop between regulator and regulated)
- Boeing's Organization Designation Authorization meant Boeing engineers certified Boeing aircraft
- Structurally identical to: TEPCO self-certification in Japan, pharmaceutical sponsor-CRO relationships
- KOS governance graph: Permission.requires_review captures this vulnerability
- Confidence: 0.91

---

## Transfer Bridges

| Bridge ID | Target Domain | Transfer Type | Notes |
|-----------|--------------|---------------|-------|
| bridge-auth-override | fukushima_governance | mechanism transfer | CRM authority inversion ↔ Yoshida override |
| bridge-737max-challenger | extreme_environments | structural analogy | MCAS suppression ↔ O-ring suppression |
| (implicit) checklist-surgical | surgical_robotics | mechanism transfer | WHO surgical checklist explicitly derived from aviation CRM |

---

## Gaps and Open Questions

1. **Automation complacency:** MCAS failure involved pilots over-trusting automation. KOS does not yet have a mechanism for "automation over-reliance" as distinct from "authority gradient suppression" — these are related but different.
2. **Near-miss underreporting:** Aviation's ASRS (Aviation Safety Reporting System) is a confidential near-miss database with ~1.8M reports. KOS does not have access to this data; the EvidenceFragment nodes use published NTSB reports only.
3. **Precursor detection:** NTSB found Lion Air JT 610 had MCAS activation on prior flights. The mechanism for "anomaly detected but not escalated" deserves its own node distinct from deliberate suppression.

---

## Data Collection Method

NTSB reports are public domain (ntsb.gov). House Transportation Committee report is public. JATR report available through FAA website. Peer-reviewed sources available through institutional access (Helmreich 1999). No AutoResearchClaw calls required.
