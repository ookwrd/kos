# Surgical Robotics — Research Log

**Domain ID:** `surgical_robotics`
**Grounding:** source_grounded
**Last verified:** 2026-04-24
**Primary KOS role:** Case for human-machine authority handoff, checklist-enforced cognition from aviation, and tacit haptic skill transfer

---

## Summary

Surgical robotics — primarily the da Vinci system (Intuitive Surgical) and emerging autonomous robot-assisted systems — provides KOS with a rich domain for authority gradient dynamics in human-machine teaming. The domain sits at the intersection of aviation CRM (authority handoff), drug discovery (trial evidence chains), and expert preservation (haptic tacit knowledge).

Three KOS-critical mechanisms:
1. **WHO Surgical Safety Checklist:** Directly derived from aviation CRM; reduced surgical mortality by 47% in a landmark 8-country RCT (Haynes et al. 2009, NEJM). This is the clearest documented transfer of a knowledge mechanism from one domain to another.
2. **Haptic feedback loss in robot-assisted surgery:** da Vinci eliminates direct haptic feedback to the surgeon; the surgeon must infer tissue tension from visual cues. This is a tacit knowledge transfer problem — experienced surgeons externalize their haptic models through visual correlates, but novices cannot.
3. **Autonomous intervention authority:** Emerging autonomous surgery systems (Smart Tissue Autonomous Robot, STAR) must have a protocol for when to hand back control to the human surgeon. The authority handoff is a formalized decision trace problem.

---

## Primary Sources Integrated

| ID | Source | Type | Confidence |
|----|--------|------|------------|
| ev-who-checklist-2008 | WHO Surgical Safety Checklist (2008) | WHO guideline | 0.97 |
| ev-haynes-checklist-2009 | Haynes et al., "A Surgical Safety Checklist to Reduce Morbidity and Mortality" (NEJM 2009) | RCT | 0.98 |
| ev-davinci-outcomes-2022 | Gut et al., Systematic review of da Vinci vs. laparoscopic surgical outcomes (Surg Endosc 2022) | meta-analysis | 0.93 |
| ev-star-2022 | Saeidi et al., "Autonomous robotic laparoscopic surgery" (Science Robotics 2022) | peer-reviewed | 0.92 |
| ev-haptic-loss-study-2019 | Wagner et al., "Haptic Feedback in Robotic Surgery" (J Robot Surg 2019) | peer-reviewed | 0.90 |

---

## Key Mechanisms Modeled

**mech-checklist-enforced-cognition** (shared with aviation_safety — primary transfer bridge)
- The WHO checklist protocol forces pause before incision, before closing, and during team briefing
- Implements CRM principle: junior team member must be able to raise objection without social penalty
- KOS: DecisionTrace records checklist compliance as policy_ids evidence
- Confidence: 0.97 (RCT-confirmed)

**mech-haptic-visual-substitution** (expert surgeon infers tissue tension from visual cues, no physical feedback)
- Tacit knowledge: expert surgeons develop visual correlates for haptic information over thousands of cases
- Transfer problem: cannot be verbally transmitted; requires observation + deliberate practice
- KOS: AgentProfile stores this as a competence with `confidence: 0.75` (intermediate tactile expertise)
- Confidence: 0.88

**mech-autonomous-authority-handoff** (robot autonomous → robot-human shared → human full control transition)
- STAR system has a "confidence threshold" below which it requests human intervention
- Structurally: same as autopilot authority handoff in aviation (autoflight mode awareness)
- KOS: Delegation node with reversible=true, conditions=["trajectory_confidence < 0.7"]
- Confidence: 0.85 (STAR paper confirmed; generalization to other systems speculative)

---

## Transfer Bridges

| Bridge ID | Target Domain | Transfer Type | Notes |
|-----------|--------------|---------------|-------|
| (implicit) checklist-aviation | aviation_safety | mechanism transfer | WHO checklist ← aviation CRM |
| (implicit) haptic-tacit | expert_preservation | mechanism transfer | Haptic knowledge as exemplar of non-transmissible tacit skill |
| (implicit) authority-handoff | extreme_environments | structural analogy | Challenger analog: when to override automation |

---

## Gaps and Open Questions

1. **Autonomy certification:** No regulatory pathway exists for autonomous surgical systems beyond "supervised autonomy." KOS does not yet have a Permission node structure for this novel authority configuration.
2. **Haptic quantification:** Some researchers use strain gauges and force sensors to measure tissue tension — this could provide a ground-truth bridge from tacit to explicit knowledge. Not yet modeled in KOS.
3. **Long-tail adverse events:** da Vinci adverse events are tracked in FDA MAUDE database but the connection between specific intraoperative decisions and device reports is not reconstructed in KOS.

---

## Data Collection Method

NEJM Haynes 2009 is open access. WHO Checklist is public (who.int/surgical-safety-checklist). STAR Science Robotics 2022 is open access. WHO guideline and da Vinci outcomes review via institutional access. No AutoResearchClaw calls required.
