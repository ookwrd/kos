# Research Log — public_health_coordination

*April 2026 — Federation A: Governance & Safety*

## Fixture Grounding

**Classification: hybrid**

Content is grounded in well-documented historical events (WHO PHEIC decisions, contact tracing program rollouts, vaccination logistics operations) and extensive academic public health literature. No AutoResearchClaw run was performed. Synthesis draws on training knowledge of WHO official documentation, peer-reviewed epidemiology, and published government after-action analyses. The domain is adjacent to pandemic_governance (which is an existing city); public_health_coordination focuses specifically on the operational and logistical coordination layer — surveillance systems, contact tracing workforce management, vaccination cold-chain logistics — rather than the policy/governance decision layer.

---

## Domain Overview

Public health coordination is the operational science of deploying health interventions at population scale under uncertainty. The KOS questions: How is tacit expertise in outbreak response transmitted between experienced field epidemiologists and new hires? What organizational structures allow contact tracing operations to scale without losing local contextual knowledge? Where does formal protocol break down at the frontline?

---

## Key Named Cases and Grounding Examples

### West Africa Ebola Response (2014–2016)

The MSF (Médecins Sans Frontières) early warning calls — MSF issued a statement in March 2014 calling the outbreak "unprecedented" and requesting international help — preceded the WHO PHEIC declaration by four months (WHO declared August 8, 2014). This is a documented case of accurate early warning being institutionally delayed, directly parallel to the Pierson/Boeing and TEPCO Civil dissent patterns. The 11,310 deaths in Guinea, Sierra Leone, and Liberia occurred in a period after the warning was available.

Real literature: Farrar & Piot (2014), NEJM; MSF report "Pushed to the Limit and Beyond" (2015); Moon et al. (2015) Lancet report on the Ebola response failures.

### Korea MERS Response (2015)

South Korea's Middle East Respiratory Syndrome outbreak (186 cases, 38 deaths) spread primarily through hospitals — a documented case of nosocomial transmission enabled by large open ward designs, family caregiver culture, and contact tracing that initially failed to identify the super-spreader event at Samsung Medical Center. The government's subsequent investment in public health infrastructure (Korean CDC restructuring, National Emergency Operations Center expansion) is a documented learning response.

Real literature: Kim et al. (2015), "Middle East Respiratory Syndrome in South Korea," Eurosurveillance.

### Contact Tracing Workforce — COVID-19 Scale-up (2020)

The scale-up of contact tracing from a specialist epidemiological skill to a mass-employed workforce during COVID-19 is one of the largest explicit tacit knowledge transfer operations in modern public health. Programs in Massachusetts (Community Tracing Collaborative), Germany (Gesundheitsamt coordination), and South Korea (KCDC) varied dramatically in outcome. The MA program used Partners in Health protocols and reached ~1,000 contact tracers within weeks; German local health offices varied from high-performing to unable to process cases during peak transmission.

Real literature: Nuzzo et al. (2020) commentary on contact tracing scale-up, JAMA; Rajan et al. (2020), BMJ.

### Cold-Chain Logistics — COVID Vaccine Deployment (2020–2021)

Pfizer-BioNTech mRNA vaccine storage requirements (-70°C) created a logistics challenge that exposed massive variation in health system cold-chain capacity. High-income countries adapted; low-income countries faced systemic barriers. This is a clear case of tacit infrastructure knowledge (cold-chain operation at scale) being unavailable where needed.

Real literature: GAVI COVAX reports; WHO guidance on cold-chain management.

---

## What Was Synthesized vs. What Could Be Extracted

**Synthesized from training knowledge:**
- General structure of WHO IHR (International Health Regulations) framework and PHEIC decision criteria
- Character of the Ebola MSF-vs-WHO timeline (accurate; specific dates are training-knowledge derived)
- Contact tracing workforce management general principles
- Cold-chain logistics general framework

**Could be extracted from specific sources:**
- Moon et al. (2015) Lancet: "Will Ebola change the game? Ten essential reforms before the next pandemic" — specific recommendations and failure analysis
- WHO After-Action Review reports for Ebola (2016) and COVID-19 (2021)
- Korean MERS Investigation Report (Ministry of Health and Welfare, 2016)
- Partners in Health Community Tracing Collaborative protocols and outcome data

---

## Notable Gaps

1. No fixture file exists yet — V6 new domain stub needed.
2. Distinction from pandemic_governance must be maintained structurally: this domain covers operational coordination, not policy decisions. Fixture nodes should focus on logistics, surveillance, and workforce management rather than WHO declaration decisions.
3. The MSF/Ebola early warning case is a strong bridge to aviation_safety (Pierson) and fukushima_governance (TEPCO Civil) — suppressed early warning is a cross-federation pattern.
4. Contact tracing tacit knowledge transfer is potentially the strongest bridge from this domain to expert_preservation.
5. No decisions array; no district data; no bridge definitions yet.
