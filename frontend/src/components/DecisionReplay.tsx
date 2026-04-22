import { useState, useEffect } from "react";
import { useGraphStore } from "../store/graphStore";

/* eslint-disable @typescript-eslint/no-explicit-any */
const DEMO_REPLAY: { decision: Record<string, unknown>; replay_steps: any[] } = {
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
      step: 1,
      type: "question",
      label: "Decision triggered",
      actor: null,
      content: {
        context: "Trial oversight committee convened to review Phase II expansion eligibility. The question: extend Sotorasib (AMG510) trial to CNS-metastatic NSCLC cohort.",
        urgency: "High — 47 patients on hold pending enrollment decision.",
      },
    },
    {
      step: 2,
      type: "evidence",
      label: "BBB permeability assay data reviewed",
      actor: { id: "agent-chemist-01", name: "Dr. Marcus Webb", calibration: 0.79 },
      content: {
        evidence_id: "ev-bbb-assay-results",
        finding: "AMG510 analogue series — BBB permeability assay. Uncertainty: 0.60.",
        detail: "PAMPA-BBB assay using 12 structural analogues of Sotorasib. Pe values range 1.2–3.8 × 10⁻⁶ cm/s. Efflux ratio 3.4 suggests moderate P-gp substrate behavior.",
        uncertainty: 0.60,
      },
    },
    {
      step: 3,
      type: "policy",
      label: "Hard constraint gate evaluated",
      actor: null,
      content: {
        constraint_id: "constraint-cns-safety-gate",
        rule: "CNS expansion requires BBB uncertainty < 0.40",
        current_value: 0.60,
        threshold: 0.40,
        status: "VIOLATED",
        implication: "Progression to CNS cohort is architecturally blocked. Exception requires explicit override with escalated review.",
      },
    },
    {
      step: 4,
      type: "actor",
      label: "Dr. Sarah Chen — Clinical assessment",
      actor: { id: "agent-oncologist-01", name: "Dr. Sarah Chen", calibration: 0.84, role: "Thoracic Oncologist, PI" },
      content: {
        position: "Support deferral",
        confidence: 0.28,
        reasoning: "The BBB assay uncertainty of 0.60 is clinically unacceptable for this cohort. CNS-metastatic NSCLC patients have median OS of 8 months — inadequate CNS penetration could mean weeks of futile treatment. Precedent: AMG-224 CNS deferral 2022 sets the template.",
        evidence_weight: "High — clinical outcome data weighted over computational model",
      },
    },
    {
      step: 5,
      type: "dissent",
      label: "MolScreen-v2 — AI dissent recorded",
      actor: { id: "agent-ai-screen-01", name: "MolScreen-v2", calibration: 0.71, role: "Virtual Screening Tool" },
      content: {
        position: "Partial dissent",
        confidence: 0.55,
        reasoning: "QSAR model predicts BBB+ probability 0.41 — marginally above threshold. 95% CI: 0.34–0.48. Conditional approval with mandatory CNS monitoring is within the defensible range.",
        resolution: "OVERRULED by clinical expert consensus. Dissent permanently recorded.",
        dissent_preserved: true,
      },
    },
    {
      step: 6,
      type: "precedent",
      label: "AMG-224 CNS deferral precedent invoked",
      actor: { id: "agent-oncologist-01", name: "Dr. Sarah Chen", calibration: 0.84 },
      content: {
        precedent_id: "prec-cns-deferral-2022",
        description: "AMG-224 CNS expansion deferred in 2022 pending improved BBB data. Follow-on assay with P-gp knockout model produced uncertainty 0.31. Expansion approved Q3 2023.",
        applicability: 0.82,
        lesson: "The correct path is a targeted follow-on assay, not indefinite deferral.",
      },
    },
    {
      step: 7,
      type: "outcome",
      label: "Decision: DEFERRED",
      actor: { id: "agent-oncologist-01", name: "Dr. Sarah Chen", calibration: 0.84 },
      content: {
        outcome: "deferred",
        rationale: "BBB uncertainty 0.60 exceeds hard constraint 0.40. MolScreen-v2 dissent preserved. Follow-on assay with P-gp knockout model required within 90 days.",
        next_action: "P-gp knockout BBB assay. If uncertainty ≤ 0.35, auto-approve CNS expansion.",
        is_exception: true,
        exception_reason: "Constraint gate triggered. Exception logged with required review chain.",
      },
    },
  ],
};

const DOMAIN_REPLAY: Record<string, { decision: Record<string, unknown>; replay_steps: any[] }> = {
  fukushima: {
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
        content: { context: "TEPCO internal review of 2008 tsunami assessment. Jogan geological model estimates maximum plausible tsunami: 15.7m. Current seawall height: 5.7m.", urgency: "High — 10-meter deficit against credible worst-case." },
      },
      {
        step: 2, type: "evidence", label: "2008 tsunami assessment reviewed",
        actor: { id: "agent-tepco-civil", name: "TEPCO Civil Engineering", calibration: 0.76 },
        content: { evidence_id: "ev-tepco-2008-assessment", finding: "Probabilistic tsunami hazard analysis using Jogan earthquake 869 AD geological record. Maximum plausible height: 15.7m.", uncertainty: 0.38 },
      },
      {
        step: 3, type: "evidence", label: "Jogan geological record — 869 AD",
        actor: { id: "agent-tepco-civil", name: "TEPCO Civil Engineering", calibration: 0.76 },
        content: { evidence_id: "ev-jogan-geological-record", finding: "Tsunami deposit layers found 3–4km inland at this latitude. Consistent with waves exceeding 10m MSL.", uncertainty: 0.19 },
      },
      {
        step: 4, type: "actor", label: "TEPCO Management — response",
        actor: { id: "agent-tepco-mgmt", name: "TEPCO Corporate Management", calibration: 0.31, role: "Corporate decision authority" },
        content: { position: "Defer to JSCE subcommittee", confidence: 0.25, reasoning: "Single geological model with high uncertainty. Cost of premature upgrade: ¥billion scale. Defer pending JSCE review expected 2010–2011.", evidence_weight: "Low — no independent validation" },
      },
      {
        step: 5, type: "dissent", label: "TEPCO Civil Engineers — dissent overruled",
        actor: { id: "agent-tepco-civil", name: "TEPCO Civil Engineering", calibration: 0.76, role: "Technical group" },
        content: { position: "Upgrade immediately", confidence: 0.82, reasoning: "The 10-meter deficit is not a modeling uncertainty — it is a physical fact. Even at the lower 10m estimate, current seawall is inadequate.", resolution: "OVERRULED by corporate management. Dissent suppressed — not recorded in governance substrate.", dissent_preserved: false },
      },
      {
        step: 6, type: "outcome", label: "Decision: DEFERRED — March 11, 2011 outcome",
        actor: { id: "agent-tepco-mgmt", name: "TEPCO Corporate Management", calibration: 0.31 },
        content: { outcome: "deferred", rationale: "Pending JSCE subcommittee review. No timeline constraint specified.", next_action: "JSCE review. In 2011: tsunami reached 14.1–15.5m. Backup generators flooded within 40 minutes. Three reactors melted down.", is_exception: false, exception_reason: undefined },
      },
    ],
  },
};

const STEP_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  question:  { color: "#94a3b8", bg: "rgba(148,163,184,0.08)",  icon: "?",  label: "Trigger" },
  evidence:  { color: "#3b82f6", bg: "rgba(59,130,246,0.08)",   icon: "E",  label: "Evidence" },
  policy:    { color: "#a855f7", bg: "rgba(168,85,247,0.08)",   icon: "P",  label: "Policy" },
  actor:     { color: "#14b8a6", bg: "rgba(20,184,166,0.08)",   icon: "A",  label: "Actor" },
  dissent:   { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   icon: "⚠", label: "Dissent" },
  precedent: { color: "#eab308", bg: "rgba(234,179,8,0.08)",    icon: "⊞",  label: "Precedent" },
  outcome:   { color: "#f97316", bg: "rgba(249,115,22,0.08)",   icon: "→",  label: "Outcome" },
};

const OUTCOME_COLORS: Record<string, string> = {
  approved: "#22c55e",
  rejected: "#ef4444",
  deferred: "#f59e0b",
  escalated: "#3b82f6",
};

interface Props { className?: string }

export function DecisionReplay({ className = "" }: Props) {
  const { replayResult, replayStep, setReplayStep } = useGraphStore();
  const [domain, setDomain] = useState<"drug_discovery" | "fukushima">("drug_discovery");
  const [autoPlay, setAutoPlay] = useState(false);

  const rawData = replayResult ?? (domain === "fukushima" ? DOMAIN_REPLAY.fukushima : DEMO_REPLAY);
  const steps = (rawData.replay_steps as unknown as Record<string, unknown>[]) ?? [];
  const decision = rawData.decision as Record<string, unknown>;
  const current = steps[replayStep] ?? steps[0];

  useEffect(() => {
    if (!autoPlay) return;
    if (replayStep >= steps.length - 1) { setAutoPlay(false); return; }
    const t = setTimeout(() => setReplayStep(replayStep + 1), 2200);
    return () => clearTimeout(t);
  }, [autoPlay, replayStep, steps.length, setReplayStep]);

  const outcomeColor = OUTCOME_COLORS[decision?.outcome as string ?? ""] ?? "#475569";
  const cfg = STEP_CONFIG[(current?.type as string) ?? "question"] ?? STEP_CONFIG.question;

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Decision header */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,12,24,0.9)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Decision Replay</span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ml-auto"
            style={{ backgroundColor: `${outcomeColor}15`, color: outcomeColor, border: `1px solid ${outcomeColor}40` }}
          >
            {String(decision?.outcome ?? "")}
          </span>
          {!!decision?.is_exception && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
              ⊗ exception
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-200 leading-snug">
          {String(decision?.question ?? "")}
        </p>

        {/* Domain selector */}
        <div className="flex gap-1 mt-2">
          {[
            { id: "drug_discovery" as const, label: "Drug Trial" },
            { id: "fukushima" as const, label: "Fukushima" },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => { setDomain(d.id); setReplayStep(0); setAutoPlay(false); }}
              className="px-2 py-0.5 rounded text-[9px] font-medium transition-all"
              style={{
                backgroundColor: domain === d.id ? "rgba(99,102,241,0.2)" : "rgba(30,41,59,0.5)",
                color: domain === d.id ? "#818cf8" : "#475569",
                border: `1px solid ${domain === d.id ? "rgba(99,102,241,0.4)" : "transparent"}`,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0" style={{ height: 2, backgroundColor: "rgba(255,255,255,0.04)" }}>
        <div
          style={{
            height: "100%",
            width: `${((replayStep + 1) / steps.length) * 100}%`,
            backgroundColor: outcomeColor,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Current step — featured */}
      {current && (
        <div
          className="flex-shrink-0 px-4 py-3 transition-all duration-300"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: cfg.bg }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
            >
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-xs text-slate-300 font-semibold">{String(current?.label ?? "")}</span>
              </div>

              {(current?.actor as Record<string, unknown> | null) && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span className="text-[9px] text-teal-300">{String((current?.actor as Record<string, unknown>)?.name ?? "")}</span>
                    {!!(current?.actor as Record<string, unknown>)?.calibration && (
                      <span className="text-[9px] font-mono text-teal-400 ml-1">
                        {((current?.actor as Record<string, unknown>)?.calibration as number).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <StepDetail step={current as Record<string, unknown>} />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          className="w-7 h-7 flex items-center justify-center rounded transition-all text-sm"
          style={{ color: replayStep === 0 ? "#334155" : "#94a3b8", backgroundColor: "rgba(255,255,255,0.03)" }}
          onClick={() => { setReplayStep(Math.max(0, replayStep - 1)); setAutoPlay(false); }}
          disabled={replayStep === 0}
        >
          ←
        </button>

        <button
          className="w-7 h-7 flex items-center justify-center rounded transition-all text-sm"
          style={{
            color: autoPlay ? "#f97316" : "#818cf8",
            backgroundColor: autoPlay ? "rgba(249,115,22,0.1)" : "rgba(99,102,241,0.1)",
            border: `1px solid ${autoPlay ? "rgba(249,115,22,0.3)" : "rgba(99,102,241,0.2)"}`,
          }}
          onClick={() => setAutoPlay(!autoPlay)}
        >
          {autoPlay ? "■" : "▶"}
        </button>

        <button
          className="w-7 h-7 flex items-center justify-center rounded transition-all text-sm"
          style={{ color: replayStep >= steps.length - 1 ? "#334155" : "#94a3b8", backgroundColor: "rgba(255,255,255,0.03)" }}
          onClick={() => { setReplayStep(Math.min(steps.length - 1, replayStep + 1)); setAutoPlay(false); }}
          disabled={replayStep >= steps.length - 1}
        >
          →
        </button>

        <span className="text-[10px] text-slate-600 ml-1">
          {replayStep + 1} / {steps.length}
        </span>

        <button
          className="ml-auto text-[9px] text-slate-600 hover:text-slate-400"
          onClick={() => { setReplayStep(0); setAutoPlay(false); }}
        >
          reset
        </button>
      </div>

      {/* Step timeline */}
      <div className="flex-1 overflow-y-auto py-2">
        {steps.map((step, i) => {
          const s = step as Record<string, unknown>;
          const sc = STEP_CONFIG[(s.type as string) ?? "question"] ?? STEP_CONFIG.question;
          const isActive = i === replayStep;
          const isPast = i < replayStep;
          const actor = s.actor as Record<string, unknown> | null;
          return (
            <button
              key={s.step as number}
              className="w-full flex items-center gap-3 px-4 py-2 transition-all duration-150 text-left"
              style={{
                backgroundColor: isActive ? sc.bg : "transparent",
                borderLeft: `2px solid ${isActive ? sc.color : isPast ? `${sc.color}40` : "transparent"}`,
              }}
              onClick={() => { setReplayStep(i); setAutoPlay(false); }}
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: isActive ? `${sc.color}20` : isPast ? `${sc.color}08` : "rgba(255,255,255,0.03)",
                  color: isActive ? sc.color : isPast ? `${sc.color}80` : "#334155",
                }}
              >
                {sc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] font-medium truncate"
                  style={{ color: isActive ? "#e2e8f0" : isPast ? "#64748b" : "#475569" }}
                >
                  {s.label as string}
                </div>
                {actor && (
                  <div className="text-[9px] text-slate-600 truncate">{actor.name as string}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDetail({ step }: { step: Record<string, unknown> }) {
  const c = (step.content ?? {}) as Record<string, unknown>;

  if (step.type as string === "evidence") {
    const unc = c.uncertainty as number | undefined;
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-300 leading-relaxed">{c.finding as string}</p>
        {!!c.detail && <p className="text-[10px] text-slate-500 leading-relaxed">{String(c.detail)}</p>}
        {unc !== undefined && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[9px] text-slate-500">uncertainty</span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, backgroundColor: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: `${unc * 100}%`, height: "100%", backgroundColor: unc > 0.5 ? "#f59e0b" : unc > 0.3 ? "#6366f1" : "#22c55e" }} />
            </div>
            <span className="text-[9px] font-mono font-bold" style={{ color: unc > 0.5 ? "#f59e0b" : "#22c55e" }}>{unc.toFixed(2)}</span>
          </div>
        )}
      </div>
    );
  }

  if (step.type as string === "policy") {
    const violated = c.status === "VIOLATED";
    return (
      <div className="rounded-lg p-2.5"
        style={{ backgroundColor: violated ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${violated ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}` }}>
        <div className="text-[10px] font-bold mb-1" style={{ color: violated ? "#f87171" : "#4ade80" }}>
          {violated ? "⊗ Constraint VIOLATED" : "✓ Constraint satisfied"}
        </div>
        <p className="text-[10px] text-slate-400 mb-1">{c.rule as string}</p>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="text-slate-500">current</span>
          <span className="font-mono font-bold" style={{ color: violated ? "#f87171" : "#4ade80" }}>
            {(c.current_value as number).toFixed(2)}
          </span>
          <span className="text-slate-600">threshold</span>
          <span className="font-mono text-slate-400">{(c.threshold as number).toFixed(2)}</span>
        </div>
      </div>
    );
  }

  if (step.type as string === "dissent") {
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-300 leading-relaxed">{c.reasoning as string}</p>
        <div className="flex items-center gap-2">
          <div
            className="rounded px-2 py-1 text-[9px] font-bold"
            style={{ backgroundColor: (c.dissent_preserved as boolean) ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                     color: (c.dissent_preserved as boolean) ? "#f59e0b" : "#f87171" }}
          >
            {(c.dissent_preserved as boolean) ? "⊕ Dissent preserved" : "⊗ Dissent suppressed"}
          </div>
        </div>
        {!!c.resolution && <p className="text-[9px] text-slate-500">{String(c.resolution)}</p>}
      </div>
    );
  }

  if (step.type as string === "outcome") {
    const outcome = c.outcome as string;
    const outColor = OUTCOME_COLORS[outcome] ?? "#475569";
    return (
      <div className="space-y-2">
        <div className="rounded-lg p-3"
          style={{ backgroundColor: `${outColor}10`, border: `1px solid ${outColor}40` }}>
          <div className="text-xs font-bold mb-1" style={{ color: outColor }}>
            {outcome.toUpperCase()}
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">{c.rationale as string}</p>
        </div>
        {!!c.next_action && (
          <div className="text-[9px] text-slate-500">
            <span className="text-slate-600 uppercase tracking-widest mr-1">Next →</span>
            {String(c.next_action)}
          </div>
        )}
      </div>
    );
  }

  // Default: question, actor, precedent
  const mainText = (c.context ?? c.reasoning ?? c.description ?? c.urgency) as string | undefined;
  const conf = c.confidence as number | undefined;
  return (
    <div className="space-y-1.5">
      {mainText && (
        <p className="text-[10px] text-slate-300 leading-relaxed">{mainText}</p>
      )}
      {conf !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500">confidence</span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div style={{ width: `${conf * 100}%`, height: "100%", backgroundColor: "#6366f1" }} />
          </div>
          <span className="text-[9px] font-mono text-indigo-400">{conf.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
