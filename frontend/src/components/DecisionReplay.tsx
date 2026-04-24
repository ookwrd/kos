import { useState, useEffect } from "react";
import { useGraphStore } from "../store/graphStore";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Step config ────────────────────────────────────────────────────────────────

const STEP_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  question:  { color: "#94a3b8", bg: "rgba(148,163,184,0.06)",  icon: "?",  label: "Trigger"   },
  evidence:  { color: "#3b82f6", bg: "rgba(59,130,246,0.07)",   icon: "E",  label: "Evidence"  },
  policy:    { color: "#a855f7", bg: "rgba(168,85,247,0.07)",   icon: "P",  label: "Policy"    },
  actor:     { color: "#14b8a6", bg: "rgba(20,184,166,0.07)",   icon: "A",  label: "Actor"     },
  dissent:   { color: "#ef4444", bg: "rgba(239,68,68,0.10)",    icon: "⚡", label: "Dissent"   },
  precedent: { color: "#eab308", bg: "rgba(234,179,8,0.07)",    icon: "⊞", label: "Precedent" },
  outcome:   { color: "#f97316", bg: "rgba(249,115,22,0.07)",   icon: "◈",  label: "Outcome"   },
};

const OUTCOME_COLORS: Record<string, string> = {
  approved:  "#22c55e",
  rejected:  "#ef4444",
  deferred:  "#f59e0b",
  escalated: "#3b82f6",
};

// ── Drug Trial scenario ────────────────────────────────────────────────────────

const DRUG_TRIAL: { decision: Record<string, unknown>; replay_steps: any[] } = {
  decision: {
    id: "dec-trial-approval-2024",
    question: "Should the Phase II expansion cohort include CNS-metastatic NSCLC patients?",
    outcome: "deferred",
    is_exception: true,
    domain: "drug_discovery",
    timestamp: "2024-07-15T14:30:00Z",
  },
  replay_steps: [
    {
      step: 1, type: "question", label: "Decision triggered",
      actor: null,
      content: {
        context: "Trial oversight committee convened. Should Sotorasib (AMG510) Phase II expand to CNS-metastatic NSCLC cohort?",
        urgency: "High — 47 patients on hold pending enrollment decision.",
        structural: { decision_id: "dec-trial-approval-2024", committee: "Trial Oversight Committee", session: "TOS-2024-07-15" },
      },
    },
    {
      step: 2, type: "evidence", label: "BBB permeability assay reviewed",
      actor: { id: "agent-chemist-01", name: "Dr. Marcus Webb", calibration: 0.79, role: "Medicinal Chemist" },
      content: {
        narrative: "PAMPA-BBB assay using 12 structural analogues. Efflux ratio 3.4 — moderate P-gp substrate. Webb: 'The CNS penetration numbers are not where we need them to be for this patient population.'",
        finding: "BBB permeability: Pe 1.2–3.8 × 10⁻⁶ cm/s. Efflux ratio 3.4 suggests P-gp efflux.",
        uncertainty: 0.60,
        structural: { evidence_id: "ev-bbb-assay-results", source: "PAMPA-BBB assay", validated_by: "agent-chemist-01", n: 12 },
      },
    },
    {
      step: 3, type: "policy", label: "Hard constraint gate evaluated",
      actor: null,
      content: {
        narrative: "CNS expansion is architecturally blocked. The protocol requires BBB uncertainty below 0.40 before enrolling patients whose median OS is 8 months.",
        rule: "CNS expansion requires BBB uncertainty < 0.40",
        current_value: 0.60,
        threshold: 0.40,
        status: "VIOLATED",
        structural: { constraint_id: "constraint-cns-safety-gate", constraint_type: "hard", governed: "CNS cohort enrollment" },
      },
    },
    {
      step: 4, type: "actor", label: "Dr. Sarah Chen — Clinical assessment",
      actor: { id: "agent-oncologist-01", name: "Dr. Sarah Chen", calibration: 0.84, role: "Thoracic Oncologist, PI" },
      content: {
        narrative: "'The BBB assay uncertainty of 0.60 is clinically unacceptable. CNS-metastatic NSCLC patients have median OS of 8 months — inadequate CNS penetration means weeks of futile treatment. The AMG-224 precedent from 2022 tells us exactly what to do.'",
        position: "Support deferral",
        confidence: 0.28,
        structural: { agent_id: "agent-oncologist-01", calibration: 0.84, vote: "defer", evidence_weight: "HIGH" },
      },
    },
    {
      step: 5, type: "dissent", label: "MolScreen-v2 — AI dissent recorded",
      actor: { id: "agent-ai-screen-01", name: "MolScreen-v2", calibration: 0.71, role: "Virtual Screening Tool" },
      content: {
        narrative: "MolScreen-v2 disagrees with the deferral. QSAR model places BBB+ probability at 0.41, marginally above threshold. The AI argues conditional approval with mandatory CNS monitoring is defensible.",
        reasoning: "QSAR prediction: BBB+ probability 0.41 (95% CI: 0.34–0.48). Conditional approval with mandatory CNS monitoring is within defensible range.",
        resolution: "OVERRULED by clinical expert consensus.",
        dissent_preserved: true,
        structural: { dissent_id: "diss-molscreen-bbb", calibration: 0.71, resolution_status: "overruled", preserved: true },
      },
    },
    {
      step: 6, type: "precedent", label: "AMG-224 CNS deferral invoked",
      actor: { id: "agent-oncologist-01", name: "Dr. Sarah Chen", calibration: 0.84 },
      content: {
        narrative: "The AMG-224 2022 deferral is the right template. Follow-on P-gp knockout assay produced uncertainty 0.31 — expansion was approved Q3 2023. The correct path is a targeted assay, not indefinite deferral.",
        description: "AMG-224 CNS deferral 2022 → P-gp knockout model → uncertainty 0.31 → approved Q3 2023.",
        applicability: 0.82,
        structural: { precedent_id: "prec-cns-deferral-2022", applicability: 0.82, outcome_at_application: "approved" },
      },
    },
    {
      step: 7, type: "outcome", label: "Decision: DEFERRED",
      actor: { id: "agent-oncologist-01", name: "Dr. Sarah Chen", calibration: 0.84 },
      content: {
        narrative: "BBB uncertainty 0.60 exceeds hard constraint 0.40. MolScreen-v2 dissent preserved in substrate — visible to future reviewers. P-gp knockout assay ordered within 90 days.",
        outcome: "deferred",
        rationale: "BBB uncertainty 0.60 exceeds constraint 0.40. MolScreen-v2 dissent preserved. P-gp knockout assay required within 90 days.",
        next_action: "P-gp knockout BBB assay. If uncertainty ≤ 0.35, auto-approve CNS expansion.",
        is_exception: true,
        structural: { outcome: "deferred", is_exception: true, constraint_gate: "violated", dissent_count: 1, dissent_preserved: true },
      },
    },
  ],
};

// ── Fukushima scenario ─────────────────────────────────────────────────────────

const FUKUSHIMA: { decision: Record<string, unknown>; replay_steps: any[] } = {
  decision: {
    id: "dec-seawall-deferral-2008",
    question: "Should the Fukushima Daiichi seawall be upgraded in response to the 2008 15.7m tsunami estimate?",
    outcome: "deferred",
    is_exception: false,
    domain: "fukushima_governance",
    timestamp: "2008-03-01T00:00:00Z",
  },
  replay_steps: [
    {
      step: 1, type: "question", label: "Decision triggered",
      actor: null,
      content: {
        context: "TEPCO internal review of 2008 tsunami assessment. Jogan geological model estimates maximum plausible tsunami: 15.7m. Current seawall height: 5.7m.",
        urgency: "HIGH — 10-meter physical deficit against credible worst-case.",
        structural: { decision_id: "dec-seawall-deferral-2008", facility: "Fukushima Daiichi", seawall_height: "5.7m", estimate: "15.7m" },
      },
    },
    {
      step: 2, type: "evidence", label: "2008 probabilistic tsunami hazard analysis",
      actor: { id: "agent-tepco-civil", name: "TEPCO Civil Engineering", calibration: 0.76, role: "Technical group" },
      content: {
        narrative: "The engineers ran a probabilistic hazard analysis using the Jogan 869 AD geological record. The number came back 15.7m. The team flagged it internally. 'We knew this was a problem.'",
        finding: "Jogan earthquake model: maximum plausible tsunami 15.7m. Deposit layers found 3–4km inland.",
        uncertainty: 0.38,
        structural: { evidence_id: "ev-tepco-2008-assessment", method: "PTHA-Jogan", model: "869 AD Jogan record", uncertainty: 0.38 },
      },
    },
    {
      step: 3, type: "evidence", label: "Jogan geological record — 869 AD",
      actor: { id: "agent-tepco-civil", name: "TEPCO Civil Engineering", calibration: 0.76 },
      content: {
        narrative: "Sediment cores from the Sendai Plain. The 869 AD tsunami left deposit layers 3–4km inland at this latitude. The physical record is unambiguous. This is not a model artifact.",
        finding: "Tsunami deposit layers found 3–4km inland. Consistent with waves exceeding 10m MSL.",
        uncertainty: 0.19,
        structural: { evidence_id: "ev-jogan-geological-record", source_type: "primary geological", uncertainty: 0.19, distance_inland: "3–4km" },
      },
    },
    {
      step: 4, type: "actor", label: "TEPCO Management — cost-schedule response",
      actor: { id: "agent-tepco-mgmt", name: "TEPCO Corporate Management", calibration: 0.31, role: "Corporate decision authority" },
      content: {
        narrative: "'Single geological model with high uncertainty. Premature upgrade cost is ¥billion scale. We defer pending the JSCE review expected 2010–2011.' The decision was made 5 floors above the engineers.",
        position: "Defer to JSCE subcommittee",
        confidence: 0.25,
        structural: { agent_id: "agent-tepco-mgmt", calibration: 0.31, vote: "defer", authority: "corporate", evidence_weight: "LOW" },
      },
    },
    {
      step: 5, type: "dissent", label: "TEPCO Civil Engineers — dissent SUPPRESSED",
      actor: { id: "agent-tepco-civil", name: "TEPCO Civil Engineering", calibration: 0.76, role: "Technical group" },
      content: {
        narrative: "'The 10-meter deficit is not a modeling uncertainty — it is a physical fact. Even at the lower 10m estimate, the current seawall is inadequate.' The engineers were overruled. The objection was not recorded.",
        reasoning: "The 10-meter deficit is not a modeling uncertainty — it is a physical fact. Even at the lower 10m estimate, current seawall is inadequate.",
        resolution: "OVERRULED by corporate management.",
        dissent_preserved: false,
        suppression_consequence: "No governance record of this objection. Future reviews in 2010–2011 had no substrate to surface it. March 11, 2011: tsunami reached 14.1–15.5m.",
        structural: { dissent_id: "diss-tepco-civil-seawall", calibration: 0.76, vs_management_calibration: 0.31, resolution_status: "suppressed", preserved: false },
      },
    },
    {
      step: 6, type: "outcome", label: "DEFERRED — March 11, 2011 outcome",
      actor: { id: "agent-tepco-mgmt", name: "TEPCO Corporate Management", calibration: 0.31 },
      content: {
        narrative: "The JSCE review never happened before the earthquake. On March 11, 2011, the tsunami reached 15.5m. Backup generators flooded within 40 minutes. Three reactors melted down. The engineers' warning — unrecorded — was correct.",
        outcome: "deferred",
        rationale: "Pending JSCE subcommittee review. No timeline constraint specified.",
        next_action: "2011: tsunami 14.1–15.5m. Generators flooded in 40 min. Three reactors melted down. 154,000 evacuated.",
        is_exception: false,
        structural: { outcome: "deferred", dissent_preserved: false, actual_tsunami: "15.5m", generator_failure: "40min", reactors_failed: 3 },
      },
    },
  ],
};

// ── 737 MAX MCAS scenario ──────────────────────────────────────────────────────

const AVIATION_737: { decision: Record<string, unknown>; replay_steps: any[] } = {
  decision: {
    id: "dec-mcas-single-sensor-2016",
    question: "Should MCAS be certified with a single AoA sensor and no flight crew awareness?",
    outcome: "approved",
    is_exception: false,
    domain: "aviation_safety",
    timestamp: "2016-10-29T00:00:00Z",
  },
  replay_steps: [
    {
      step: 1, type: "question", label: "Certification review triggered",
      actor: null,
      content: {
        context: "Boeing 737 MAX MCAS certification. MCAS installed to compensate for nose-up pitch from CFM LEAP engine placement. Requires new certification as novel flight control system under FAA ODA self-certification authority.",
        urgency: "EXTREME — Airbus A320neo delivering. Boeing MAX launch 18 months behind competitor schedule.",
        structural: { decision_id: "dec-mcas-single-sensor-2016", system: "MCAS", authority: "FAA ODA (self-cert)", schedule_pressure: "18mo behind A320neo" },
      },
    },
    {
      step: 2, type: "evidence", label: "Boeing FMEA — AoA sensor failure analysis",
      actor: { id: "agent-boeing-oda", name: "Boeing Safety Analysis (ODA)", calibration: 0.44, role: "FAA Organization Designation Authorization" },
      content: {
        narrative: "Boeing's own safety team — operating under FAA's self-certification authority — classified AoA sensor failure as 'major', not 'catastrophic'. The failure mode where MCAS activates repeatedly against pilot control input was not modeled. The analysts were certifying their employer's product.",
        finding: "AoA sensor failure: 'major' not 'catastrophic'. Single-sensor design acceptable under AC 25.1309.",
        uncertainty: 0.71,
        structural: { evidence_id: "ev-mcas-fmea-2016", source: "Boeing ODA FMEA", conflict_of_interest: true, cascade_mode_modeled: false, uncertainty: 0.71 },
      },
    },
    {
      step: 3, type: "evidence", label: "Ed Pierson — production floor safety report",
      actor: { id: "agent-ed-pierson", name: "Ed Pierson", calibration: 0.91, role: "Senior VP, Boeing Commercial Aircraft" },
      content: {
        narrative: "'I've never been as concerned about safety as I am now. I see the same conditions that led to the Space Shuttle Challenger and Columbia disasters.' Pierson filed directly with the FAA. His report was classified as a labor issue and never reached the certification team.",
        finding: "Production line quality failures: FOD in fuel tanks, schedule pressure overriding quality checks, workers pressured to pass inspections.",
        uncertainty: 0.09,
        structural: { evidence_id: "ev-pierson-safety-2018", filed_with: "FAA", classification: "labor issue", reached_cert_team: false, filed_months_before: "JT610 +3mo" },
      },
    },
    {
      step: 4, type: "actor", label: "Boeing Management — cost-schedule analysis",
      actor: { id: "agent-boeing-mgmt", name: "Boeing Program Management", calibration: 0.38, role: "Commercial Aircraft Division" },
      content: {
        narrative: "The decision memo reads like a financial analysis. Weight saving: 60lb. Display upgrade cost avoided: ~$2M/aircraft. Type rating avoided: $1M+ per pilot in simulator training. The MAX maintains 737NG certification derivative status. No mention of single-point failure modes.",
        position: "Approve single-sensor MCAS",
        confidence: 0.88,
        structural: { agent_id: "agent-boeing-mgmt", calibration: 0.38, weight_saving: "60lb", cost_avoided: "$2M/aircraft", type_rating_avoided: true, vote: "approve" },
      },
    },
    {
      step: 5, type: "dissent", label: "Ed Pierson — safety objection SUPPRESSED",
      actor: { id: "agent-ed-pierson", name: "Ed Pierson", calibration: 0.91, role: "Senior VP, Boeing Commercial Aircraft" },
      content: {
        narrative: "'I am not comfortable with these airplanes flying.' Pierson filed with Boeing leadership and the FAA. The objection was classified as a labor dispute. It never reached the certification review. There was no channel for a manufacturing safety concern to reach a systems certification decision.",
        reasoning: "The production process cannot produce a safe airplane. I see the same conditions that led to the Space Shuttle Challenger and Columbia disasters. I am not comfortable with these airplanes flying.",
        resolution: "Classified as labor dispute. Not forwarded to FAA certification. Not entered into governance substrate.",
        dissent_preserved: false,
        suppression_consequence: "No record in certification substrate. JT610: Oct 29, 2018 — 189 fatalities. ET302: Mar 10, 2019 — 157 fatalities.",
        structural: { dissent_id: "diss-pierson-mcas", calibration: 0.91, vs_mgmt_calibration: 0.38, channel_existed: false, reached_cert: false, preserved: false },
      },
    },
    {
      step: 6, type: "policy", label: "FAA ODA self-certification — conflict accepted",
      actor: null,
      content: {
        narrative: "The FAA had delegated its certification authority to Boeing. Boeing's own analysts certified Boeing's own aircraft. The institutional epistemic conflict — certifier has financial interest in approval — was never formally evaluated.",
        rule: "Independent safety analysis required when certifier has financial interest in outcome",
        current_value: 0.44,
        threshold: 0.75,
        status: "VIOLATED",
        structural: { constraint_id: "policy-independent-cert", certifier_is_manufacturer: true, conflict_of_interest: "unresolved", oda_delegation: "accepted without review" },
      },
    },
    {
      step: 7, type: "outcome", label: "APPROVED — 346 fatalities follow",
      actor: { id: "agent-boeing-mgmt", name: "Boeing Program Management", calibration: 0.38 },
      content: {
        narrative: "Single-sensor MCAS certified. No flight crew MCAS awareness training required. No AOA disagree alert on most aircraft. Pierson's warning — unrecorded — was correct. The two crashes were causally connected to this decision.",
        outcome: "approved",
        rationale: "Single-sensor MCAS certified. No crew awareness training. AOA disagree alert deactivated on most aircraft.",
        next_action: "JT610: Oct 29, 2018 — 189 fatalities. ET302: Mar 10, 2019 — 157 fatalities. 737 MAX grounded worldwide: Mar 13, 2019.",
        is_exception: false,
        structural: { outcome: "approved", dissent_preserved: false, subsequent_crashes: 2, fatalities: 346, grounding: "2019-03-13" },
      },
    },
  ],
};

// ── Scenarios registry ─────────────────────────────────────────────────────────

const SCENARIOS = [
  { id: "drug_discovery", label: "Drug Trial",  color: "#3b82f6", data: DRUG_TRIAL  },
  { id: "fukushima",      label: "Fukushima",   color: "#f97316", data: FUKUSHIMA   },
  { id: "aviation",       label: "737 MAX",     color: "#94a3b8", data: AVIATION_737 },
];

// ── Component ──────────────────────────────────────────────────────────────────

interface Props { className?: string }

export function DecisionReplay({ className = "" }: Props) {
  const { replayResult, replayStep, setReplayStep } = useGraphStore();
  const [scenario, setScenario] = useState<string>("drug_discovery");
  const [autoPlay, setAutoPlay] = useState(false);

  const activeScenario = SCENARIOS.find(s => s.id === scenario)!;
  const rawData = replayResult ?? activeScenario.data;
  const steps = (rawData.replay_steps as any[]) ?? [];
  const decision = rawData.decision as Record<string, unknown>;
  const current = steps[replayStep] ?? steps[0];

  useEffect(() => {
    if (!autoPlay) return;
    if (replayStep >= steps.length - 1) { setAutoPlay(false); return; }
    const t = setTimeout(() => setReplayStep(replayStep + 1), 2800);
    return () => clearTimeout(t);
  }, [autoPlay, replayStep, steps.length, setReplayStep]);

  const handleScenarioChange = (id: string) => {
    setScenario(id);
    setReplayStep(0);
    setAutoPlay(false);
  };

  const outcomeColor = OUTCOME_COLORS[decision?.outcome as string ?? ""] ?? "#475569";
  const cfg = STEP_CONFIG[(current?.type as string) ?? "question"] ?? STEP_CONFIG.question;

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`} style={{ background: "rgba(2,6,16,0.98)" }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Title row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-600">Decision Replay</span>
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ml-auto"
            style={{ backgroundColor: `${outcomeColor}18`, color: outcomeColor, border: `1px solid ${outcomeColor}35` }}
          >
            {String(decision?.outcome ?? "")}
          </span>
          {!!decision?.is_exception && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              ⊗ exception
            </span>
          )}
        </div>

        {/* Question */}
        <p className="text-[11px] font-semibold text-slate-200 leading-snug mb-2" style={{ lineHeight: 1.4 }}>
          {String(decision?.question ?? "")}
        </p>

        {/* Scenario tabs */}
        <div className="flex gap-1">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => handleScenarioChange(s.id)}
              className="px-2.5 py-1 rounded text-[9px] font-semibold transition-all"
              style={{
                backgroundColor: scenario === s.id ? `${s.color}18` : "rgba(255,255,255,0.02)",
                color: scenario === s.id ? s.color : "#334155",
                border: `1px solid ${scenario === s.id ? `${s.color}40` : "rgba(255,255,255,0.04)"}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step rail (horizontal) ── */}
      <div className="flex-shrink-0 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-0">
          {steps.map((step, i) => {
            const s = step as Record<string, unknown>;
            const sc = STEP_CONFIG[(s.type as string) ?? "question"] ?? STEP_CONFIG.question;
            const isActive = i === replayStep;
            const isPast = i < replayStep;
            const isSuppressedDissent = s.type === "dissent" && !(s.content as any)?.dissent_preserved;
            return (
              <div key={i} className="flex items-center flex-1">
                <button
                  onClick={() => { setReplayStep(i); setAutoPlay(false); }}
                  title={s.label as string}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    flexShrink: 0,
                    cursor: "pointer",
                    border: `1.5px solid ${isActive ? sc.color : isPast ? `${sc.color}50` : "rgba(255,255,255,0.08)"}`,
                    backgroundColor: isActive
                      ? `${sc.color}25`
                      : isPast ? `${sc.color}12` : "rgba(255,255,255,0.02)",
                    color: isActive ? sc.color : isPast ? `${sc.color}90` : "#334155",
                    boxShadow: isActive ? `0 0 8px ${sc.color}40` : isSuppressedDissent && !isActive ? "0 0 6px rgba(239,68,68,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {sc.icon}
                </button>
                {i < steps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: isPast ? `${sc.color}40` : "rgba(255,255,255,0.06)",
                    transition: "background-color 0.4s",
                  }} />
                )}
              </div>
            );
          })}
        </div>
        {/* Step label */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
          <span className="text-[9px] text-slate-500">·</span>
          <span className="text-[9px] text-slate-400">{String(current?.label ?? "")}</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex-shrink-0" style={{ height: 1.5, backgroundColor: "rgba(255,255,255,0.03)" }}>
        <div style={{
          height: "100%",
          width: `${((replayStep + 1) / steps.length) * 100}%`,
          backgroundColor: outcomeColor,
          transition: "width 0.5s ease",
        }} />
      </div>

      {/* ── Main detail panel ── */}
      <div className="flex-1 overflow-y-auto">
        {current && <StepFeaturePanel step={current as Record<string, unknown>} scenarioId={scenario} />}
      </div>

      {/* ── Controls ── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(2,6,16,0.95)" }}
      >
        <button
          onClick={() => { setReplayStep(Math.max(0, replayStep - 1)); setAutoPlay(false); }}
          disabled={replayStep === 0}
          className="w-7 h-7 flex items-center justify-center rounded transition-all text-xs"
          style={{ color: replayStep === 0 ? "#1e293b" : "#94a3b8", backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          ←
        </button>

        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="w-7 h-7 flex items-center justify-center rounded transition-all text-xs"
          style={{
            color: autoPlay ? "#f97316" : "#818cf8",
            backgroundColor: autoPlay ? "rgba(249,115,22,0.10)" : "rgba(99,102,241,0.10)",
            border: `1px solid ${autoPlay ? "rgba(249,115,22,0.25)" : "rgba(99,102,241,0.20)"}`,
          }}
        >
          {autoPlay ? "■" : "▶"}
        </button>

        <button
          onClick={() => { setReplayStep(Math.min(steps.length - 1, replayStep + 1)); setAutoPlay(false); }}
          disabled={replayStep >= steps.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded transition-all text-xs"
          style={{ color: replayStep >= steps.length - 1 ? "#1e293b" : "#94a3b8", backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          →
        </button>

        <span className="text-[9px] font-mono text-slate-700 ml-1">{replayStep + 1} / {steps.length}</span>

        <button
          onClick={() => { setReplayStep(0); setAutoPlay(false); }}
          className="ml-auto text-[9px] text-slate-700 hover:text-slate-500 transition-colors"
        >
          reset
        </button>
      </div>
    </div>
  );
}

// ── Feature panel — the immersive step view ────────────────────────────────────

function StepFeaturePanel({ step, scenarioId }: { step: Record<string, unknown>; scenarioId: string }) {
  const c = (step.content ?? {}) as Record<string, unknown>;
  const actor = step.actor as Record<string, unknown> | null;
  const stepType = step.type as string;
  const cfg = STEP_CONFIG[stepType] ?? STEP_CONFIG.question;

  const isSuppressedDissent = stepType === "dissent" && !(c.dissent_preserved as boolean);
  const isPreservedDissent = stepType === "dissent" && !!(c.dissent_preserved as boolean);
  const isCatastrophicOutcome = stepType === "outcome" && (step.content as any)?.structural?.dissent_preserved === false;

  return (
    <div className="p-3 space-y-2.5">

      {/* Actor chip */}
      {actor && (
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-full px-2.5 py-1"
            style={{ backgroundColor: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.18)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#14b8a6" }} />
            <span className="text-[10px] text-teal-300 font-medium">{String(actor.name ?? "")}</span>
            {actor.calibration != null && (
              <span className="text-[9px] font-mono font-bold" style={{
                color: (actor.calibration as number) >= 0.75 ? "#4ade80" :
                       (actor.calibration as number) >= 0.55 ? "#f59e0b" : "#f87171",
              }}>
                {(actor.calibration as number).toFixed(2)}
              </span>
            )}
          </div>
          {!!actor.role && (
            <span className="text-[9px] text-slate-600">{String(actor.role)}</span>
          )}
        </div>
      )}

      {/* ── Suppressed dissent — alarming treatment ── */}
      {isSuppressedDissent && (
        <div className="rounded-xl overflow-hidden"
          style={{ border: "1.5px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.06)" }}>
          {/* Alarm header */}
          <div className="flex items-center gap-2 px-3 py-2"
            style={{ backgroundColor: "rgba(239,68,68,0.15)", borderBottom: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#ef4444" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#f87171" }}>
              ⊗ Dissent suppressed — not recorded in substrate
            </span>
          </div>

          {/* Quote */}
          <div className="px-3 py-3">
            <p className="text-[11px] text-slate-200 leading-relaxed italic mb-2"
              style={{ borderLeft: "2px solid rgba(239,68,68,0.6)", paddingLeft: 10 }}>
              "{String(c.reasoning ?? c.narrative ?? "")}"
            </p>
            {!!c.resolution && (
              <p className="text-[9px] text-red-400/70 font-medium">{String(c.resolution)}</p>
            )}
          </div>

          {/* IF OMEGA counterfactual */}
          <div className="mx-3 mb-3 rounded-lg p-2.5"
            style={{ backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: "#818cf8" }}>
                ↗ If Omega existed
              </span>
            </div>
            <OmegaCounterfactual step={step} scenarioId={scenarioId} />
          </div>

          {/* Structural */}
          {!!c.structural && <StructuralBlock data={c.structural as Record<string, unknown>} color={cfg.color} />}

          {/* Consequence */}
          {!!c.suppression_consequence && (
            <div className="px-3 pb-3">
              <p className="text-[9px] leading-relaxed" style={{ color: "#f87171", opacity: 0.8 }}>
                {String(c.suppression_consequence)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Preserved dissent ── */}
      {isPreservedDissent && (
        <div className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.05)" }}>
          <div className="flex items-center gap-2 px-3 py-2"
            style={{ backgroundColor: "rgba(245,158,11,0.10)", borderBottom: "1px solid rgba(245,158,11,0.2)" }}>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#f59e0b" }}>
              ⊕ Dissent preserved in substrate
            </span>
          </div>
          <div className="px-3 py-2.5 space-y-2">
            <NarrativeBlock content={c} cfg={cfg} />
            {!!c.structural && <StructuralBlock data={c.structural as Record<string, unknown>} color={cfg.color} />}
          </div>
        </div>
      )}

      {/* ── Catastrophic outcome ── */}
      {isCatastrophicOutcome && (
        <div className="rounded-xl overflow-hidden"
          style={{ border: "1.5px solid rgba(239,68,68,0.45)", background: "rgba(239,68,68,0.04)" }}>
          <div className="px-3 py-3 space-y-2">
            <NarrativeBlock content={c} cfg={{ ...cfg, color: "#ef4444" }} />
            {!!c.next_action && (
              <div className="rounded-lg px-2.5 py-2"
                style={{ backgroundColor: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <p className="text-[9px] font-semibold" style={{ color: "#f87171" }}>{String(c.next_action)}</p>
              </div>
            )}
            {!!c.structural && <StructuralBlock data={c.structural as Record<string, unknown>} color="#ef4444" />}
          </div>
        </div>
      )}

      {/* ── Normal steps ── */}
      {!isSuppressedDissent && !isPreservedDissent && !isCatastrophicOutcome && (
        <div className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${cfg.color}22`, background: cfg.bg }}>
          <div className="px-3 py-3 space-y-2.5">
            {stepType === "policy" ? (
              <PolicyBlock content={c} cfg={cfg} />
            ) : stepType === "evidence" ? (
              <EvidenceBlock content={c} cfg={cfg} />
            ) : (
              <NarrativeBlock content={c} cfg={cfg} />
            )}
            {!!c.structural && <StructuralBlock data={c.structural as Record<string, unknown>} color={cfg.color} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── IF OMEGA counterfactual ────────────────────────────────────────────────────

function OmegaCounterfactual({ step, scenarioId }: { step: Record<string, unknown>; scenarioId: string }) {
  const c = (step.content ?? {}) as Record<string, unknown>;
  const actor = step.actor as Record<string, unknown> | null;
  const actorCal = actor?.calibration as number | undefined;
  const structural = c.structural as Record<string, unknown> | undefined;
  const mgmtCal = structural?.vs_management_calibration as number | undefined ?? structural?.vs_mgmt_calibration as number | undefined;

  const items: string[] = [];
  if (actorCal && mgmtCal) {
    items.push(`Calibration ${actorCal.toFixed(2)} vs ${mgmtCal.toFixed(2)} — this dissent would receive ${(actorCal / mgmtCal).toFixed(1)}× the epistemic weight.`);
  }
  items.push("This objection would be permanently recorded — surfaced in every future review citing this decision.");
  if (scenarioId === "fukushima") {
    items.push("The 2010–2011 JSCE review would have inherited this dissent as prior evidence. The seawall decision chain would be traceable.");
  }
  if (scenarioId === "aviation") {
    items.push("No dissent channel connected manufacturing safety to certification review. Omega's delegation graph would have made that path mandatory.");
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="text-[9px] mt-0.5" style={{ color: "#818cf8", flexShrink: 0 }}>·</span>
          <p className="text-[9px] leading-relaxed" style={{ color: "#94a3b8" }}>{item}</p>
        </div>
      ))}
    </div>
  );
}

// ── Narrative block ────────────────────────────────────────────────────────────

function NarrativeBlock({ content, cfg }: { content: Record<string, unknown>; cfg: { color: string } }) {
  const text = (content.narrative ?? content.context ?? content.reasoning ?? content.description ?? content.rationale) as string | undefined;
  const conf = content.confidence as number | undefined;
  const applicability = content.applicability as number | undefined;

  return (
    <div>
      {text && (
        <div style={{ borderLeft: `2px solid ${cfg.color}50`, paddingLeft: 10 }}>
          <p className="text-[10px] text-slate-300 leading-relaxed">{text}</p>
        </div>
      )}
      {conf !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[9px] text-slate-600 w-14">confidence</span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div style={{ width: `${conf * 100}%`, height: "100%", backgroundColor: cfg.color, transition: "width 0.4s" }} />
          </div>
          <span className="text-[9px] font-mono font-bold" style={{ color: cfg.color }}>{conf.toFixed(2)}</span>
        </div>
      )}
      {applicability !== undefined && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-slate-600 w-14">applies</span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div style={{ width: `${applicability * 100}%`, height: "100%", backgroundColor: cfg.color }} />
          </div>
          <span className="text-[9px] font-mono font-bold" style={{ color: cfg.color }}>{applicability.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

// ── Evidence block ─────────────────────────────────────────────────────────────

function EvidenceBlock({ content, cfg }: { content: Record<string, unknown>; cfg: { color: string } }) {
  const unc = content.uncertainty as number | undefined;
  const narrative = (content.narrative ?? content.detail) as string | undefined;
  const finding = content.finding as string | undefined;

  return (
    <div className="space-y-2">
      {narrative && (
        <div style={{ borderLeft: `2px solid ${cfg.color}50`, paddingLeft: 10 }}>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">{narrative}</p>
        </div>
      )}
      {finding && !narrative && (
        <p className="text-[10px] text-slate-300 leading-relaxed">{finding}</p>
      )}
      {finding && narrative && (
        <p className="text-[9px] text-slate-500 leading-relaxed">{finding}</p>
      )}
      {unc !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-600 w-14">uncertainty</span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div style={{
              width: `${unc * 100}%`, height: "100%",
              backgroundColor: unc > 0.6 ? "#ef4444" : unc > 0.4 ? "#f59e0b" : unc > 0.2 ? "#6366f1" : "#22c55e",
              transition: "width 0.4s",
            }} />
          </div>
          <span className="text-[9px] font-mono font-bold" style={{
            color: unc > 0.6 ? "#ef4444" : unc > 0.4 ? "#f59e0b" : "#22c55e",
          }}>
            {unc.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Policy block ───────────────────────────────────────────────────────────────

function PolicyBlock({ content, cfg }: { content: Record<string, unknown>; cfg: { color: string } }) {
  const violated = content.status === "VIOLATED";
  const cur = content.current_value as number | undefined;
  const threshold = content.threshold as number | undefined;
  const narrative = content.narrative as string | undefined;

  return (
    <div className="space-y-2">
      {narrative && (
        <p className="text-[10px] text-slate-400 leading-relaxed italic"
          style={{ borderLeft: `2px solid ${violated ? "#ef444450" : "#22c55e50"}`, paddingLeft: 10 }}>
          {narrative}
        </p>
      )}
      <div className="rounded-lg p-2.5"
        style={{
          backgroundColor: violated ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
          border: `1px solid ${violated ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
        }}>
        <div className="text-[10px] font-bold mb-1.5" style={{ color: violated ? "#f87171" : "#4ade80" }}>
          {violated ? "⊗ Constraint VIOLATED" : "✓ Constraint satisfied"}
        </div>
        <p className="text-[9px] text-slate-400 mb-2 leading-relaxed">{content.rule as string}</p>
        {cur !== undefined && threshold !== undefined && (
          <div className="flex items-center gap-3 text-[9px]">
            <span className="text-slate-600">current</span>
            <span className="font-mono font-bold" style={{ color: violated ? "#f87171" : "#4ade80" }}>{cur.toFixed(2)}</span>
            <span className="text-slate-700">vs threshold</span>
            <span className="font-mono text-slate-500">{threshold.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Structural block ───────────────────────────────────────────────────────────

function StructuralBlock({ data, color }: { data: Record<string, unknown>; color: string }) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg p-2.5"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `2px solid ${color}30`,
      }}>
      <div className="text-[8px] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: `${color}80` }}>
        Structural
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <span className="text-[8px] text-slate-700 uppercase tracking-wide">{k.replace(/_/g, " ")}</span>
            <span className="text-[9px] font-mono text-slate-500 truncate" title={String(v)}>
              {typeof v === "boolean" ? (v ? "true" : "false") : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
