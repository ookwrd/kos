import { useState } from "react";
import { useGraphStore } from "../store/graphStore";

interface TacitStep {
  step: number;
  action: string;
  observation?: string;
  decision_point?: string;
  tacit_warning?: string;
  uncertainty?: number;
  codifiability?: number; // 0 = fully tacit, 1 = fully explicit
  duration_seconds?: number;
}

interface TacitTrace {
  id: string;
  name: string;
  domain?: string;
  expert_id?: string;
  expert_name?: string;
  calibration_score?: number;
  context?: string;
  equipment?: string;
  prerequisite_knowledge?: string[];
  steps: TacitStep[];
  outcome?: string;
  counterfactual?: string;
  transferability_notes?: string;
}

const DEMO_TRACES: TacitTrace[] = [
  {
    id: "tacit-droplet-calibration",
    name: "Tin droplet generator calibration",
    domain: "euv_lithography",
    expert_name: "Senior ASML Process Engineer",
    calibration_score: 0.87,
    context: "EUV source maintenance after collector mirror replacement. Droplet frequency nominal at 50kHz but pulse energy is drifting — experienced engineer troubleshoots live.",
    equipment: "Cymer/TRUMPF LPP EUV source · CO₂ laser timing controller · in-situ droplet camera",
    steps: [
      {
        step: 1,
        action: "Observe droplet plume via in-situ camera at 10k fps",
        observation: "Droplet shape slightly elongated on axis — consistent with nozzle wear pattern.",
        codifiability: 0.7,
        uncertainty: 0.1,
      },
      {
        step: 2,
        action: "Reduce nozzle temperature by 2°C, hold 90 seconds",
        decision_point: "The manual specifies 1–5°C. Experienced engineers read the elongation pattern to calibrate the delta. This one is 2°C — not 1, not 3. The number comes from the shape, not the procedure.",
        codifiability: 0.3,
        uncertainty: 0.25,
      },
      {
        step: 3,
        action: "Run pre-pulse timing sweep ±200ps around nominal",
        observation: "Peak conversion efficiency appears 80ps earlier than nominal — indicates droplet arrival drift.",
        codifiability: 0.75,
        uncertainty: 0.15,
      },
      {
        step: 4,
        action: "Adjust droplet timing offset in control software",
        observation: "Conversion efficiency rises from 3.1% → 4.7%.",
        codifiability: 0.9,
        uncertainty: 0.08,
      },
      {
        step: 5,
        action: "Monitor plasma emission spectrum for Sn II line at 13.5nm",
        observation: "Spectrum shape acceptable. No satellite lines indicating over-ionization.",
        codifiability: 0.8,
        uncertainty: 0.12,
      },
      {
        step: 6,
        action: "Lock parameters and run 10-minute stability burn-in",
        tacit_warning: "The final judgment of whether the calibration is 'settled' is not in any procedure. Engineers describe it as the droplet stream looking 'quiet' — a visual gestalt from 4+ years experience that has never been successfully codified into a threshold or metric. Every attempt to write it down produces rules that pass bad calibrations and reject good ones.",
        codifiability: 0.05,
        uncertainty: 0.4,
      },
    ],
    outcome: "EUV source stabilized at 250W sustained output, within 2% of spec.",
    transferability_notes: "Steps 1–5 can be taught in ~2 weeks. Step 6 requires 6–18 months supervised practice before independent certification. If the step-6 engineer retires without transfer, the calibration judgment is lost.",
  },
  {
    id: "tacit-seawall-decision-1967",
    name: "Onagawa seawall height decision",
    domain: "fukushima_governance",
    expert_name: "Yanosuke Hirai, Lead Civil Engineer",
    calibration_score: 0.91,
    context: "1967 design review, Onagawa Nuclear Power Plant. Standard JAEC guidelines: 3m seawall. Hirai reviewed coastal hazard data independently — and departed from the standard.",
    equipment: "Tide records · coastal charts · fisherman interviews · geological survey",
    steps: [
      {
        step: 1,
        action: "Review historical tide records and coastal charts for Onagawa Bay",
        observation: "Records going back to 1896: three tsunami events. Maximum recorded: 3.1m. A 3m wall would be marginally compliant — technically adequate.",
        codifiability: 0.85,
        uncertainty: 0.3,
      },
      {
        step: 2,
        action: "Interview local fishermen and examine inland debris markers",
        observation: "Oral tradition: a very large wave 'in grandfather's time.' Debris markers found 8m above mean sea level, 2km inland.",
        decision_point: "The oral tradition and debris are not in the regulatory evidence set. Hirai had to decide whether non-documented evidence counted. His answer: yes.",
        tacit_warning: "The decision to weight non-canonical evidence — local knowledge, debris patterns, oral history — over the official record required judgment that no procedure could specify. Hirai described it as 'not wanting to be the engineer who was wrong because he only read the books.' Contrast with Fukushima 2008: the TEPCO Civil Engineering team read the books. Their dissent was overruled. Hirai had no procedure to cite — he had a judgment to make.",
        codifiability: 0.1,
        uncertainty: 0.55,
      },
      {
        step: 3,
        action: "Commission additional geological survey of bay sediment layers",
        observation: "Tsunami deposit layer consistent with a large 9th-century event — later identified as Jogan 869 AD.",
        codifiability: 0.75,
        uncertainty: 0.2,
      },
      {
        step: 4,
        action: "Advocate for 14.8m seawall — nearly 5× the regulatory minimum",
        decision_point: "Against significant cost pressure. Hirai's argument: asymmetry of consequences. A wall that is too high wastes money. A wall that is too low kills people. He held the position.",
        codifiability: 0.4,
        uncertainty: 0.1,
      },
    ],
    outcome: "14.8m seawall built. March 11, 2011: tsunami reached ~13m at Onagawa. Plant survived. All three reactors achieved cold shutdown.",
    counterfactual: "Forty kilometers away, Fukushima Daiichi's 5.7m seawall was overtopped by 15.5m waves. The engineers who issued the 2008 15.7m estimate were overruled. Their dissent was not recorded. Hirai's judgment in 1967 — rooted in evidence that was outside the official record — was the difference between the two outcomes.",
    transferability_notes: "The evidentiary judgment in step 2 — deciding when non-canonical evidence overrides canonical evidence — is the core tacit skill. It cannot be reduced to a rule without losing precisely what makes it valuable. When you write the rule, you codify the current evidence set. The tacit skill is knowing when to go outside it.",
  },
];

// ── Codifiability spectrum ─────────────────────────────────────────────────────

function CodifiabilityBar({ value }: { value: number }) {
  // value = 0 fully tacit, 1 fully explicit
  const tacitColor = "#f59e0b";
  const explicitColor = "#3b82f6";
  const color = value < 0.3 ? tacitColor : value < 0.6 ? "#a855f7" : explicitColor;
  const label = value < 0.2 ? "tacit" : value < 0.45 ? "mostly tacit" : value < 0.7 ? "hybrid" : "codifiable";
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color, transition: "width 0.4s" }} />
      </div>
      <span className="text-[8px] font-medium" style={{ color, minWidth: 60 }}>{label}</span>
    </div>
  );
}

function TraceSpectrumHeader({ trace }: { trace: TacitTrace }) {
  const avgCodif = trace.steps.reduce((s, st) => s + (st.codifiability ?? 0.5), 0) / trace.steps.length;
  const tacitSteps = trace.steps.filter(s => (s.codifiability ?? 0.5) < 0.3).length;

  return (
    <div className="flex items-center gap-3 mt-2 rounded-lg px-2.5 py-2"
      style={{ backgroundColor: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
      {/* Mini spectrum bars */}
      <div className="flex items-end gap-0.5" style={{ height: 20 }}>
        {trace.steps.map((step, i) => {
          const cod = step.codifiability ?? 0.5;
          const color = cod < 0.3 ? "#f59e0b" : cod < 0.6 ? "#a855f7" : "#3b82f6";
          const height = Math.max(4, (1 - cod) * 20);
          return (
            <div key={i} style={{ width: 4, height, backgroundColor: color, borderRadius: 2, opacity: 0.8 }} />
          );
        })}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[9px] font-bold" style={{ color: "#f59e0b" }}>{tacitSteps}</span>
          <span className="text-[9px] text-slate-600">of {trace.steps.length} steps are tacit</span>
        </div>
        <div className="text-[8px] text-slate-700">avg codifiability {(avgCodif * 100).toFixed(0)}%</div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: "#f59e0b" }} />
          <span className="text-[8px] text-slate-700">tacit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />
          <span className="text-[8px] text-slate-700">explicit</span>
        </div>
      </div>
    </div>
  );
}

// ── Uncertainty bar ────────────────────────────────────────────────────────────

function UncertaintyBar({ value }: { value: number }) {
  const color = value > 0.5 ? "#f59e0b" : value > 0.25 ? "#6366f1" : "#22c55e";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] text-slate-700 w-14">uncertainty</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color, borderRadius: 9999, transition: "width 0.4s" }} />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function TacitTraceViewer({ className = "" }: { className?: string }) {
  const { selectedNode, domainFilter } = useGraphStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const relevantTraces = DEMO_TRACES.filter(t => !domainFilter || t.domain === domainFilter);

  const resolvedActiveId = activeId ??
    (selectedNode?.id && DEMO_TRACES.find(t => t.id === selectedNode.id) ? selectedNode.id : null) ??
    relevantTraces[0]?.id;

  const activeTrace = DEMO_TRACES.find(t => t.id === resolvedActiveId) ?? relevantTraces[0];

  const toggleStep = (i: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  if (!activeTrace) {
    return (
      <div className={`flex items-center justify-center text-slate-600 text-xs ${className}`}>
        No tacit traces for selected domain
      </div>
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden ${className}`} style={{ background: "rgba(2,6,16,0.98)" }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Tacit Knowledge</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
                style={{ backgroundColor: "#f59e0b15", color: "#f59e0b", border: "1px solid #f59e0b30" }}>
                tacit
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-200 mt-1 leading-snug">{activeTrace.name}</div>
            {activeTrace.expert_name && (
              <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{activeTrace.expert_name}</span>
                {activeTrace.calibration_score !== undefined && (
                  <span className="font-mono text-xs font-bold" style={{
                    color: activeTrace.calibration_score >= 0.85 ? "#4ade80" : activeTrace.calibration_score >= 0.65 ? "#818cf8" : "#f59e0b"
                  }}>
                    {activeTrace.calibration_score.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {activeTrace.context && (
          <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{activeTrace.context}</p>
        )}

        {activeTrace.equipment && (
          <p className="text-[9px] text-slate-700 mb-2">{activeTrace.equipment}</p>
        )}

        {/* Codifiability spectrum */}
        <TraceSpectrumHeader trace={activeTrace} />

        {/* Trace selector */}
        {relevantTraces.length > 1 && (
          <div className="flex gap-1 mt-2">
            {relevantTraces.map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveId(t.id); setExpandedSteps(new Set()); }}
                className="text-[9px] px-2 py-0.5 rounded transition-all"
                style={{
                  backgroundColor: t.id === resolvedActiveId ? "#6366f125" : "rgba(30,41,59,0.5)",
                  color: t.id === resolvedActiveId ? "#818cf8" : "#475569",
                  border: `1px solid ${t.id === resolvedActiveId ? "#6366f140" : "transparent"}`,
                }}
              >
                {t.domain?.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Steps ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {activeTrace.steps.map((step, i) => {
          const isTacit = (step.codifiability ?? 0.5) < 0.3;
          const isExpanded = expandedSteps.has(i);

          return (
            <div
              key={step.step}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: isTacit ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.025)",
                border: isTacit
                  ? "1px solid rgba(245,158,11,0.25)"
                  : "1px solid rgba(255,255,255,0.05)",
                boxShadow: isTacit ? "0 0 12px rgba(245,158,11,0.08)" : "none",
              }}
            >
              {/* Step header */}
              <button
                className="w-full flex items-start gap-2.5 px-2.5 py-2 text-left"
                onClick={() => toggleStep(i)}
              >
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                  style={{
                    backgroundColor: isTacit ? "#f59e0b20" : "#6366f118",
                    color: isTacit ? "#f59e0b" : "#6366f1",
                    border: `1px solid ${isTacit ? "#f59e0b40" : "#6366f130"}`,
                  }}
                >
                  {step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-slate-300 leading-snug">{step.action}</div>
                  {step.codifiability !== undefined && (
                    <CodifiabilityBar value={step.codifiability} />
                  )}
                </div>
                <span className="text-[9px] text-slate-700 flex-shrink-0 mt-0.5">{isExpanded ? "▾" : "▸"}</span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-2.5 pb-2.5 pt-0 space-y-2 border-t"
                  style={{ borderColor: isTacit ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)" }}>

                  {step.observation && (
                    <div className="text-[10px] text-slate-500 leading-relaxed pt-2">
                      <span className="text-slate-700 uppercase tracking-widest text-[8px] mr-1">obs</span>
                      {step.observation}
                    </div>
                  )}

                  {step.decision_point && (
                    <div className="text-[10px] leading-relaxed" style={{ color: "#818cf8" }}>
                      <span className="uppercase tracking-widest text-[8px] mr-1" style={{ color: "#6366f1" }}>decision</span>
                      {step.decision_point}
                    </div>
                  )}

                  {step.tacit_warning && (
                    <div className="rounded-lg p-2.5 mt-1"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        boxShadow: "0 0 16px rgba(245,158,11,0.10) inset",
                      }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#f59e0b" }} />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: "#f59e0b" }}>
                          Cannot be fully codified
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: "#fbbf24" }}>{step.tacit_warning}</p>
                    </div>
                  )}

                  {step.uncertainty !== undefined && (
                    <UncertaintyBar value={step.uncertainty} />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Outcome */}
        {activeTrace.outcome && (
          <div className="rounded-lg p-2.5"
            style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <div className="text-[8px] font-bold uppercase tracking-widest text-green-500 mb-1">Outcome</div>
            <div className="text-[10px] text-slate-400 leading-relaxed">{activeTrace.outcome}</div>
          </div>
        )}

        {/* Counterfactual (Hirai vs. Fukushima) */}
        {activeTrace.counterfactual && (
          <div className="rounded-lg p-2.5"
            style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <div className="text-[8px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#f87171" }}>
              Counterfactual
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{activeTrace.counterfactual}</p>
          </div>
        )}

        {/* Transferability */}
        {activeTrace.transferability_notes && (
          <div className="rounded-lg p-2.5"
            style={{ backgroundColor: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)" }}>
            <div className="text-[8px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#6366f1" }}>
              Transferability
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{activeTrace.transferability_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
