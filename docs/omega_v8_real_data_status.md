# Omega V8 — Real Data Status

*April 2026 — Honest accounting of what is source-grounded vs. synthetic*

---

## Grounding Tiers

| Tier | Definition | Label in UI |
|------|-----------|-------------|
| **source_grounded** | Specific named event, verifiable primary record, DOI or government report | `SG` green |
| **hybrid** | Real domain, training-knowledge synthesis, no primary citation extracted | `HY` amber |
| **arc_synthesized** | ARC-generated research synthesis, LLM-produced, labeled explicitly | `AS` blue |
| **speculative** | Domain is real, but fixture content is constructed for demo | `SC` grey |

---

## Domain-by-Domain Status

### Strongly source-grounded (would survive fact-check against primary sources)

| Domain | Grounded facts | Primary sources |
|--------|---------------|----------------|
| **fukushima_governance** | PTHA 2008 >10m projection; Jogan 869 AD deposit; seawall 5.7m; NAIIC 2012 report; Yoshida seawater override | IAEA Fukushima Report 2015; NAIIC Full Report (English); NHK Yoshida Testimony |
| **aviation_safety** | MCAS single-AOA design; Ed Pierson congressional testimony; Lion Air 610 / Ethiopian 302 fatalities; UAL173 fuel exhaustion | House Transportation Committee 2020; NTSB AAR-79-7; JATR 2019 |
| **pandemic_governance** | WHO PHEIC Jan 30 2020; Morawska et al. 239-author aerosol letter July 2020; IHR 2005 | WHO official records; Clinical Infectious Diseases DOI:10.1093/cid/ciaa939 |
| **extreme_environments** | Boisjoly O-ring memo July 31 1985; Rogers Commission Vol.1 temperature analysis; Challenger launch temp 28°F | Presidential Commission (Rogers) Vols.1-5; Vaughan 1996 |
| **euv_lithography** | Tin plasma EUV mechanism; 13.5nm wavelength; ASML market share; Fomenkov 2018 source efficiency | JVST B DOI:10.1116/1.5000296; ASML Annual Report 2023 |
| **drug_discovery** | Ostrem 2013 KRAS G12C binding pocket discovery; CodeBreaK 100 (NEJM 2021); KRYSTAL-1 (NEJM 2022); FDA NDA 214665 | Nature DOI:10.1038/nature12796; NEJM DOIs confirmed |
| **climate_policy** | IPCC AR6 WG1 carbon budget 500 GtCO₂ (from Jan 2020, 50% chance 1.5°C); Glasgow Pact 2021; Stern Review 2006 | IPCC AR6 ipcc.ch; UNFCCC documents |
| **mathematics_category_theory** | Eilenberg-MacLane 1945; MacLane CWM 1971; Spivak ologs PLoS ONE 2012 | Trans. AMS 1945; Springer GTM; DOI:10.1371/journal.pone.0024274 |

### Hybrid (real domain, synthesis without primary extraction)

| Domain | Status | Gap |
|--------|--------|-----|
| semiconductor_hardware | TSMC N3 real; yield numbers approximate | No primary yield data extracted |
| surgical_robotics | da Vinci real; Haynes 2009 RCT cited; STAR paper cited | Specific outcome numbers not verified |
| translational_biomedicine | KRAS mechanisms real; trial data illustrative | Specific compound names are illustrative |
| developmental_biology_morphogenesis | Turing patterns real; morphogen biology real | Specific parameter values approximate |
| causality_and_complex_systems | Pearl's ladder real; Holland-Rubin real | Application case studies constructed |
| experimental_design_and_measurement | Fisher ANOVA real; RCT design real | Specific trial data illustrative |
| information_theory | Shannon 1948 real; Nyquist real; Landauer real | Application examples constructed |
| graph_theory_and_networks | Erdős-Rényi real; Barabási-Albert real; Watts-Strogatz real | Specific network parameters approximate |
| algebraic_structures | Finite field algebra real; RS codes real | Biological applications constructed |
| optimization_and_control | Pontryagin real; Bellman real; optimal transport real | Specific application parameters approximate |

### Speculative (domain real, content synthesized for demo)

| Domain | Note |
|--------|------|
| disaster_response_operations | Incident command system is real; fixture decision traces are constructed scenarios |
| public_health_coordination | IHR 2005 framework real; coordination scenarios are constructed |
| industrial_quality_control | Shewhart control charts real; specific quality scenarios constructed |
| supply_chain_resilience | Bull-whip effect real; specific scenarios constructed |
| expert_preservation | Polanyi tacit knowledge framework real; specific expert profiles constructed |
| scientific_model_transfer | Kuhn paradigm concept real; specific transfer scenarios constructed |

---

## What ARC Adds

AutoResearchClaw runs produce `arc_synthesized` artifacts — LLM-synthesized research summaries based on training knowledge, structured into claims with references. These are:
- More structured than raw training knowledge
- Not primary source extractions
- Valuable as scaffolding for knowledge graph construction
- Honestly labeled with `source_type: "arc_synthesized"`

All ARC outputs are in `docs/autoresearch_runs/`. Each run's metadata records whether it was live or simulated.

---

## What the Demo Must Label Explicitly

The V8 demo must add visible grounding labels (`SG` / `HY` / `AS` / `SC`) on:
1. Every evidence card in NodeInspector
2. Every source in ResearchTraceView
3. The domain headers in CityOverview (already done: DOMAIN_GROUNDING)
4. Agent calibration scores (with note: "principled demo construct, not formally computed from track record")

This transparency is a feature, not a weakness. It is what a research-grade tool looks like. It distinguishes Omega from tools that pretend certainty they do not have.

---

## Fabrications to Address

These items in the current demo are fabrications that must be disclosed or fixed:

| Item | Where | Current state | Fix |
|------|-------|--------------|-----|
| DOMAIN_NODE_COUNTS | CityOverview.tsx | Invented integers driving building heights | Remove or replace with actual `demoData.ts` counts |
| Calibration scores | AgentCouncilView | Principled constructs, not computed | Add "calibration basis: demo construct" label |
| Bridge novelty scores | SerendipityPanel | Hand-assigned | Add "novelty: heuristic estimate" label |
| EIG scores | InferencePanel | Static values in demo mode | Add "(demo mode: static heuristic)" label |

None of these require rebuilding. They require honest labels. Adding them makes the demo more credible to researchers, not less.
