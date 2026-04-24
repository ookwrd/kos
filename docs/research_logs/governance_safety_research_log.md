# Research Log — Governance & Safety Domain Family

*April 2026 — Metro Region 1: fukushima_governance, aviation_safety, pandemic_governance, extreme_environments*

## Source Method

All four domains in this family were synthesized from training knowledge. No AutoResearchClaw run was performed (OPENAI_API_KEY not configured). No live web search was conducted for this family. Facts were cross-verified against multiple training knowledge sources during synthesis.

Labels used throughout fixtures: **training-knowledge-grounded synthetic fixture**

---

## fukushima_governance

### Primary historical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| TEPCO commissioned JSCE seismic subcommittee in 2006 | Historical record | High |
| PTHA study (2008) projected tsunami potentially exceeding 10m seawall | Multiple sources | High |
| TEPCO Civil Engineering Division dissented; TEPCO Management deferred action | Post-event investigation records | High |
| Jogan 869 AD tsunami deposit discovered in 2006-2007 Tohoku geological surveys | Academic geology literature | High |
| 2011 tsunami reached 14.1–15.5m at Fukushima Daiichi site | IAEA Fukushima Daiichi Accident report 2015 | High |
| NRA (Nuclear Regulation Authority) established post-Fukushima with independent mandate | Historical record | High |
| Onagawa plant survived 2011 tsunami; seawall was 14.8m | Multiple post-event analyses | High |
| Hirai Katsuhiko (Onagawa chief engineer) set seawall at 1896 Meiji event run-up | Post-event analyses, testimonials | Medium (specific attribution) |

### Demo constructs (not historically verified)

| Item | Status | Notes |
|---|---|---|
| TEPCO Civil calibration score: 0.76 | Demo construct | Grounded in the fact that their 2008 assessment proved accurate |
| TEPCO Management calibration score: 0.31 | Demo construct | Grounded in post-event accountability record |
| Specific engineer names (e.g., "Dr. Yamamoto") | Composite/illustrative | No named individual engineers identified in available training knowledge |
| JSCE subcommittee specific recommendations | Partially documented | General character is accurate; specific text is composite |

### Key gaps

- No structured `decisions` array in the fixture (only 0 decisions)
- V5 target: add 3 decisions: (1) seawall height setting 2008, (2) JSCE recommendation deferral, (3) post-event NRA mandate
- The suppressed dissent scenario in DecisionReplay is the key narrative asset — it is not yet backed by a structured fixture decision

---

## aviation_safety (737 MAX / MCAS)

### Primary historical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| MCAS designed to activate on single AOA sensor | Multiple investigative reports | High |
| Boeing certification submitted with incomplete MCAS description | FAA/NTSB investigation | High |
| Lion Air Flight 610: October 29, 2018, 189 fatalities | KNKT accident report | High |
| Ethiopian Airlines Flight 302: March 10, 2019, 157 fatalities | EAIB accident report | High |
| Total fatalities across both accidents: 346 | Official records | High |
| FAA grounded 737 MAX: March 13, 2019 | FAA Emergency Airworthiness Directive | High |
| Ed Pierson (Boeing senior production manager) raised safety concerns before Lion Air accident | Congressional testimony, 2019 | High |
| Pierson specifically cited production chaos, incomplete documentation | Public testimony | High |

### Demo constructs

| Item | Status | Notes |
|---|---|---|
| Ed Pierson calibration score: 0.91 | Demo construct | Grounded in 100% dissent vindication rate |
| Boeing Management calibration score: 0.38 | Demo construct | Grounded in post-grounding accountability |
| Specific internal Boeing documents quoted | Composite/illustrative | Character is documented; specific text is not primary source |
| Pierson's exact quotes in DecisionReplay | Composite based on public testimony | Paraphrased from congressional testimony |

### Key gaps

- Fixture exists (aviation_safety.json) but decisions array is empty
- V5 target: add 3 decisions: (1) MCAS single-sensor design approval, (2) certification submission, (3) post-Lion Air response

---

## pandemic_governance

### Primary historical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| WHO declared PHEIC: January 30, 2020 (not at January 22-23 meeting) | WHO documentation | High |
| WHO initial guidance: masks not recommended for general public (prior to April 2020) | WHO documentation | High |
| WHO revised mask guidance: April 6, 2020 (partial); June 5, 2020 (stronger) | WHO documentation | High |
| WHO aerosol/airborne transmission dispute: letters from 239 scientists, July 2020 | Published correspondence (Morawska & Milton et al. 2020) | High |
| WHO initial position: "not airborne" based on droplet model | WHO statements, multiple coverage | High |
| ACE2 receptor discovery as SARS-CoV-2 entry mechanism: early 2020 | Zhou et al. 2020, Nature | High |

### Demo constructs

| Item | Status | Notes |
|---|---|---|
| Named "Dr. Wei Zhang" as specific WHO official | Illustrative | No specific named individual identified in training knowledge |
| Internal WHO deliberation details | Composite | General character is documented; specifics are composite |
| Calibration scores for WHO officials | Demo constructs | Not formally computed |

### Key gaps

- No decisions in fixture
- The aerosol dispute is a strong narrative case for KOS (expert scientific consensus vs. WHO institutional guidance) — should become a structured decision trace
- V5 target: add 3 decisions: (1) January PHEIC determination, (2) mask guidance revision, (3) aerosol transmission acknowledgment

---

## extreme_environments (Challenger / Columbia)

### Primary historical facts (verified accurate)

| Fact | Source type | Confidence |
|---|---|---|
| Challenger O-ring failure: January 28, 1986 | Official record, Rogers Commission | High |
| Roger Boisjoly submitted written warning about O-ring cold-weather performance: July 31, 1985 | Rogers Commission Appendix F | High |
| Temperature on launch day: 28°F (-2°C), below O-ring spec | Rogers Commission | High |
| Morton Thiokol engineers' teleconference with NASA: January 27, 1986 | Rogers Commission testimony | High |
| Boisjoly dissent overruled; management reversed original no-launch recommendation | Rogers Commission | High |
| Boisjoly outcome: vindicated (O-ring failure confirmed cause); faced retaliation from employer | Multiple sources | High |
| "Normalization of deviance" (Vaughan 1996 — "The Challenger Launch Decision") | Published academic work | High — this is the primary academic framing |

### Demo constructs

| Item | Status | Notes |
|---|---|---|
| Boisjoly calibration score: 0.88 | Demo construct | Grounded in historical vindication |
| NASA Management calibration score: 0.29 | Demo construct | Grounded in post-accident accountability |
| Specific dialogue in DecisionReplay steps | Composite | Character accurate; specific wording is paraphrase |

### Key gaps

- No decisions in fixture
- The Boisjoly/NASA pattern is the prototype for the "suppressed dissent" narrative — should become a structured decision trace
- V5 target: add 3 decisions: (1) Boisjoly written warning (July 1985), (2) Jan 27 teleconference decision to launch, (3) post-accident investigation finding

---

## Cross-Region Bridge Quality

The Governance & Safety region has the densest cross-city bridges of any metro region. All 7 pre-identified bridges involve at least one city from this region. This is by design: the "authority overriding calibrated dissent" pattern appears in all four cities, making this region the structural core of the KOS narrative.

The bridge between `extreme_environments` (Challenger) and `fukushima_governance` is the highest-confidence bridge in the system (0.91). The bridge between `aviation_safety` (737 MAX) and `extreme_environments` (Challenger) is the second-highest (0.88). Both are grounded in the same historical pattern — normalization of deviance — with high structural fidelity.

---

## What AutoResearchClaw Would Add

If configured, AutoResearchClaw would provide:
1. Direct citations to primary sources (Rogers Commission PDF, IAEA Fukushima report, NTSB 737 MAX report)
2. Precise quotations rather than composite paraphrases
3. Cross-verification of calibration score estimates against actual forecasting track records
4. Additional edge cases that would enrich the fixture data (e.g., other TEPCO decision points, other 737 MAX design decisions)

Current fixtures are historically accurate in character but lack primary source citations. This is appropriate for a prototype; a research deployment would require explicit citation chains.
