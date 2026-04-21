# KOS Evaluation v2

## Evaluation philosophy

KOS is not a benchmark system — it is a substrate. Evaluation must be multi-dimensional: correctness, expressiveness, completeness, and usability. This document defines metrics per layer and end-to-end scenario tests.

---

## Per-layer metrics

### Evidence layer

| Metric | Measurement method | Target |
|---|---|---|
| Ingestion latency | Time from `POST /api/evidence` to Neo4j+Chroma confirmation | < 200ms |
| Semantic search recall | Top-10 recall on a held-out query set | > 0.80 |
| Validation linkage | % of EvidenceFragments with ≥1 validated_by agent | > 90% |

### Context layer

| Metric | Measurement method | Target |
|---|---|---|
| Replay completeness | % of replay steps non-empty for seeded decisions | 100% |
| Replay latency | Time from `GET /replay` to first byte | < 500ms |
| Precedent retrieval precision | Fraction of retrieved precedents rated relevant by domain expert | > 0.70 |
| Exception coverage | % of is_exception=True decisions surfaced in `/exceptions` | 100% |

### Knowledge layer

| Metric | Measurement method | Target |
|---|---|---|
| Path recall | % of known causal chains found by `explain_path` | > 0.85 |
| Path precision | % of returned paths rated correct by domain expert | > 0.80 |
| Hypothesis coverage | % of proposed hypotheses linked to ≥1 evidence_for or evidence_against | > 80% |

### Goal layer

| Metric | Measurement method | Target |
|---|---|---|
| Conflict detection recall | % of ground-truth conflicts found by `find_conflicts` | > 0.85 |
| Conflict false positive rate | % of detected conflicts judged spurious by domain expert | < 0.15 |
| Goal hierarchy depth | Max depth achievable without query timeout (≤5s) | ≥ 8 |

### Governance layer

| Metric | Measurement method | Target |
|---|---|---|
| Permission check latency | `may_access` query time | < 100ms |
| Provenance chain integrity | % of ProvenanceRecord nodes with non-null data_hash | 100% |
| Tamper detection | Does modifying a node and re-checking hash flag a mismatch? | Yes |

### Agent ecology layer

| Metric | Measurement method | Target |
|---|---|---|
| Expert routing precision | % of top-1 routed agents rated appropriate by domain expert | > 0.70 |
| Belief aggregation consistency | Does aggregate_beliefs give consistent results across repeated calls? | Yes |
| Dissent record completeness | % of open dissents surfaced by `get_open_dissents` | 100% |

### Alignment layer

| Metric | Measurement method | Target |
|---|---|---|
| Coverage on drug_discovery ↔ governance | Fraction of source nodes mapped | > 0.50 |
| Coverage on drug_discovery ↔ ai_hardware | Fraction of source nodes mapped | > 0.40 |
| Gap accuracy | % of gaps_source nodes that truly have no counterpart (expert-rated) | > 0.80 |

### Open-endedness layer

| Metric | Measurement method | Target |
|---|---|---|
| Proposal generation rate | Proposals generated per `scan_novelty` call on seeded DB | ≥ 3 |
| Bridge proposal quality | % of BRIDGE proposals rated plausible by domain expert | > 0.60 |
| Proposal lifecycle | % of proposals that transition from PENDING to ACCEPTED or REJECTED | 100% (after review) |

---

## End-to-end scenario tests

### Scenario 1: Drug discovery decision replay

1. Seed `drug_discovery.json`
2. `POST /api/decisions` with the BBB CNS deferral decision
3. `GET /api/decisions/dec-trial-approval-2024/replay`
4. Assert: reply has 6 steps, evidence = [ev-bbb-assay-results, ev-codebreak100-trial], outcome = "deferred", is_exception = true

### Scenario 2: Expert routing under uncertainty

1. Seed all fixtures
2. `GET /api/inference/route?question=What+is+the+CNS+penetration+of+AMG510`
3. Assert: agent-chemist-01 and agent-ai-screen-01 both appear in top-3; agent-litho-engineer does not

### Scenario 3: Ontology alignment gap detection

1. Seed drug_discovery + ai_hardware fixtures
2. `POST /api/alignment/compute?source_domain=drug_discovery&target_domain=ai_hardware`
3. Assert: `gaps_source` includes COMPOUND entity type (no ai_hardware counterpart); `gaps_target` includes EUV_SCANNER; coverage in [0.3, 0.7]

### Scenario 4: Open-endedness scan

1. Seed all fixtures
2. `POST /api/openendedness/scan`
3. Assert: ≥1 BRIDGE proposal with domain_a and domain_b from different fixture domains; ≥1 DENSIFY proposal referencing an entity with mechanism_count < 2

### Scenario 5: Goal conflict detection

1. Seed governance fixture
2. `GET /api/goals/conflicts?ids=goal-institutional-trust&ids=goal-research-acceleration`
3. Assert: conflict detected with shared_constraints containing constraint-gdpr-art9

### Scenario 6: Provenance chain integrity

1. Seed drug_discovery fixture
2. `POST /api/agents` with a new agent
3. Record a ProvenanceRecord for the agent creation
4. `GET /api/graph/overview` — confirm the agent appears in the agents layer
5. Assert: provenance chain for the agent has ≥1 record with action = "created"

### Scenario 7: Mechanism path explanation

1. Seed drug_discovery fixture
2. `GET /api/knowledge/path?from=KRAS&to=ERK`
3. Assert: returned chain is [KRAS, mech-KRAS-activates-RAF, RAF, mech-RAF-activates-MEK, MEK, mech-MEK-activates-ERK, ERK], depth = 6

---

## Qualitative evaluation criteria

Beyond metrics, KOS should be evaluated on:

1. **Explanatory depth**: Can a domain expert reconstruct why a decision was made from the replay alone, without consulting the original actors?
2. **Governance legibility**: Can a non-technical auditor understand the governance structure from the frontend without reading code?
3. **Uncertainty honesty**: Are uncertainty annotations assigned and updated consistently, or do they drift toward false confidence?
4. **Dissent value**: Do DissentRecord nodes contain meaningful rationale that would not otherwise have been captured?
5. **Bridge plausibility**: Do cross-domain bridge proposals suggest genuinely interesting hypotheses, or are they spurious?
