# Research Log — supply_chain_resilience

*April 2026 — Federation B: Advanced Manufacturing*

## Fixture Grounding

**Classification: hybrid**

Content is grounded in well-documented supply chain events (2011 Tōhoku disruption, COVID PPE shortage, TSMC geographic concentration risk, 2021 Ever Given Suez blockage) and an established academic literature on supply chain risk management and resilience. No AutoResearchClaw run was performed. Synthesis draws on training knowledge of operations research, published industry analyses, and government policy reports. Named events and companies are real; specific internal decision timelines and quantitative estimates are approximate or training-knowledge-derived.

---

## Domain Overview

Supply chain resilience is the capacity of supply networks to anticipate, absorb, and recover from disruptions while maintaining service continuity. The KOS transfer questions: How is operational knowledge about supplier risk embedded in individual procurement relationships rather than formal risk registries? What organizational structures allow rapid supply chain reconfiguration that cannot be encoded in standard sourcing policy? How does geographic concentration of production create systemic brittleness that is individually rational but collectively catastrophic?

---

## Key Named Cases and Grounding Examples

### 2011 Tōhoku Earthquake and Automotive Supply Chains

The March 11, 2011 earthquake and tsunami disrupted automotive production globally — not just in Japan. The geographic concentration of specialty automotive parts production (Renesas semiconductor chips for automotive ECUs in Hitachinaka; specialty pigments from Merck's Onahama plant; specific resin compounds) created cascading failures across Toyota, Honda, GM, and Ford production lines that lasted months. Toyota's production dropped by approximately 150,000 vehicles per month during peak disruption. The event revealed that tier-2 and tier-3 supplier concentration was unknown to many final assemblers — a documented case of supply chain opacity.

Real literature: Sheffi, Y. (2005), "The Resilient Enterprise"; Lund, S. et al. (2020), McKinsey Global Institute report on supply chain risk.

### TSMC Geographic Concentration (2020–present)

Taiwan Semiconductor Manufacturing Company produces approximately 90% of the world's most advanced chips (below 10nm node) and approximately 54% of total global foundry revenue. The concentration of this capability in a geographically small area with documented cross-strait geopolitical risk is the clearest current example of systemic supply chain brittleness. The U.S. CHIPS Act (2022), EU Chips Act (2023), and Japanese government subsidies for TSMC fab construction in Kumamoto are direct policy responses to this recognized risk.

Real literature: U.S. CHIPS and Science Act (Public Law 117-167, 2022); Semiconductor Industry Association analysis; Miller, C. (2022), "Chip War."

### COVID-19 PPE Supply Chain Collapse (2020)

The global shortage of N95 respirators, surgical masks, and nitrile gloves in early 2020 demonstrated the fragility of just-in-time medical supply chains. The U.S. Strategic National Stockpile had allowed its N95 inventory to expire and not be replaced after the 2009 H1N1 response; China manufactured approximately 50% of global mask supply and restricted exports in late January 2020. The resulting scramble — state governments competing against each other and federal agencies in spot markets — is a documented coordination failure overlapping with public_health_coordination.

Real literature: U.S. HHS Office of Inspector General reports (2020); CDC stockpile documentation.

### Ever Given — Suez Canal Blockage (March 2021)

The six-day blockage of the Suez Canal by the container ship Ever Given (March 23–29, 2021) disrupted approximately $9.6 billion of trade per day. As a supply chain event it illustrates chokepoint fragility: approximately 12% of global trade transits the Suez Canal; the alternative Cape of Good Hope route adds approximately 9,000km and 1–2 weeks. The event renewed attention to maritime route concentration risk that had been documented but not acted upon.

Real literature: Lloyd's List analysis; UNCTAD maritime trade statistics.

---

## What Was Synthesized vs. What Could Be Extracted

**Synthesized from training knowledge:**
- TSMC concentration figures (approximate; sourced from training knowledge of industry analyses)
- COVID PPE shortage characterization and SNS depletion narrative
- Automotive supply chain disruption pattern from 2011 Tōhoku event
- Just-in-time vs. just-in-case supply strategy tradeoffs

**Could be extracted from specific sources:**
- McKinsey Global Institute (2020) "Risk, Resilience, and Rebalancing in Global Value Chains" — specific sector-by-sector concentration analysis
- U.S. CHIPS Act text (Public Law 117-167) — legislative findings on semiconductor supply concentration
- Miller (2022) "Chip War" — historical account of semiconductor supply chain development
- U.S. HHS OIG report on SNS N95 stockpile depletion — specific depletion timeline and replacement decisions
- SIA annual semiconductor industry report — TSMC market share data by node

---

## Notable Gaps

1. No fixture file exists — V6 new domain stub needed.
2. TSMC concentration is the strongest single case for fixture grounding — it is real, well-documented, numerically specific, and directly adjacent to semiconductor_hardware city.
3. Bridge to semiconductor_hardware should be one of the highest-priority V6 bridges.
4. Bridge to pandemic_governance and public_health_coordination via PPE supply failure is strong.
5. The "systemic brittleness from individually rational decisions" pattern (every tier-1 supplier rationally outsources to lowest-cost tier-2; collectively this creates geographic concentration no one chose) is a strong bridge to causality_and_complex_systems.
6. Quantitative resilience metrics (days-to-recover, redundancy ratio) would require sourced data rather than synthesis to be credible.
7. No decisions array; no district data; no bridges defined.
