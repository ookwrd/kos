import { useState } from "react";

interface AgentAssay {
  id: string;
  name: string;
  agent_type: "human" | "ai" | "institution";
  domain: string;
  calibration: number;
  confidence: number;
  reasoning: string;
  evidence_cited: string[];
  dissents_from?: string[];
}

interface AssayResult {
  question: string;
  agents: AgentAssay[];
  collective_confidence: number;
  collective_reasoning: string;
  unresolved_disagreements: string[];
  constraint_blocked: boolean;
  constraint_reason?: string;
}

const PRESET_ASSAYS: AssayResult[] = [
  {
    question: "Should Phase II expansion include CNS-metastatic NSCLC patients?",
    agents: [
      {
        id: "agent-oncologist-01",
        name: "Dr. Sarah Chen",
        agent_type: "human",
        domain: "drug_discovery",
        calibration: 0.84,
        confidence: 0.28,
        reasoning: "BBB penetration assay returned uncertainty 0.60, exceeding our hard constraint threshold of 0.40. Clinical risk of inadequate CNS exposure in this cohort is unacceptable without stronger pharmacokinetic evidence. Precedent: AMG-224 CNS deferral (2022) set this template.",
        evidence_cited: ["ev-bbb-assay-results", "ev-codebreak100-trial"],
        dissents_from: [],
      },
      {
        id: "agent-chemist-01",
        name: "Dr. Marcus Webb",
        agent_type: "human",
        domain: "drug_discovery",
        calibration: 0.79,
        confidence: 0.35,
        reasoning: "Structural analysis suggests moderate CNS penetration potential. ClogP 2.8 is within the CNS-permissive range. I support deferral but not indefinite — we need a follow-on assay with the P-gp knockout model within 90 days.",
        evidence_cited: ["ev-kras-structure-2019"],
        dissents_from: [],
      },
      {
        id: "agent-ai-screen-01",
        name: "MolScreen-v2",
        agent_type: "ai",
        domain: "drug_discovery",
        calibration: 0.71,
        confidence: 0.55,
        reasoning: "QSAR model predicts BBB+ probability of 0.41. This marginally exceeds our threshold. The model is trained on 2.3M compounds. Confidence interval at 95%: 0.34–0.48. I dissent from indefinite deferral — conditional approval with mandatory CNS-specific monitoring is defensible.",
        evidence_cited: ["ev-bbb-assay-results"],
        dissents_from: ["agent-oncologist-01"],
      },
    ],
    collective_confidence: 0.31,
    collective_reasoning: "Calibration-weighted synthesis of three agents. Dr. Chen (cal 0.84) carries highest weight. MolScreen-v2 dissents — its BBB+ prediction is preserved in the record. Collective confidence below the 0.40 constraint gate.",
    unresolved_disagreements: ["MolScreen-v2 predicts borderline BBB+ penetration; clinical experts weight the assay uncertainty more conservatively."],
    constraint_blocked: true,
    constraint_reason: "Hard constraint: CNS expansion requires BBB uncertainty < 0.40. Current: 0.60. Progression blocked.",
  },
  {
    question: "Should the Fukushima Daiichi seawall be upgraded in response to the 2008 15.7m estimate?",
    agents: [
      {
        id: "agent-tepco-civil",
        name: "TEPCO Civil Engineering",
        agent_type: "institution",
        domain: "fukushima_governance",
        calibration: 0.76,
        confidence: 0.82,
        reasoning: "The Jogan earthquake 869 AD geological record confirms that waves exceeding 10m reached 3–4km inland at this latitude. Our 2008 assessment using the BOSO peninsula model gives 15.7m. The existing 5.7m wall provides a 10m deficit against the credible upper bound. We recommend immediate upgrade.",
        evidence_cited: ["ev-tepco-2008-assessment", "ev-jogan-geological-record"],
        dissents_from: [],
      },
      {
        id: "agent-tepco-mgmt",
        name: "TEPCO Corporate Management",
        agent_type: "institution",
        domain: "fukushima_governance",
        calibration: 0.31,
        confidence: 0.25,
        reasoning: "The 15.7m estimate is based on a single geological model with significant uncertainty. JSCE subcommittee review is appropriate before committing to infrastructure cost. We recommend further study via JSCE, expected to conclude in 2010–2011.",
        evidence_cited: [],
        dissents_from: ["agent-tepco-civil"],
      },
      {
        id: "agent-nisa",
        name: "NISA (Nuclear Safety Agency)",
        agent_type: "institution",
        domain: "fukushima_governance",
        calibration: 0.29,
        confidence: 0.2,
        reasoning: "No NRC-equivalent station blackout guidance applicable in Japanese regulatory framework. Defer to TEPCO's engineering judgment.",
        evidence_cited: [],
        dissents_from: ["agent-tepco-civil"],
      },
    ],
    collective_confidence: 0.39,
    collective_reasoning: "Calibration-weighted synthesis. TEPCO Civil Engineering (cal 0.76) gives highest weight. Corporate Management (cal 0.31) and NISA (cal 0.29) are significantly downweighted. Collective confidence: 0.39. The constraint requires uncertainty < 0.40 before deferral is permitted. This constraint is VIOLATED by proceeding with deferral.",
    unresolved_disagreements: [
      "TEPCO Management weights regulatory stability over technical risk — this conflict is not resolvable without governance escalation.",
      "NISA's absence from the evidence chain is itself a governance failure — the regulatory body had no independent assessment.",
    ],
    constraint_blocked: true,
    constraint_reason: "SYSTEM ALERT: Governance constraint violated. Deferral decision conflicts with risk threshold. The actual decision to defer was taken in 2008. The 2011 disaster followed.",
  },
];

const TYPE_COLORS: Record<string, string> = {
  human: "#14b8a6",
  ai: "#22c55e",
  institution: "#f97316",
};

export function CollectiveAssayView({ className = "" }: { className?: string }) {
  const [activeAssay, setActiveAssay] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const assay = PRESET_ASSAYS[activeAssay];

  const calibrationWeightedConfidence = assay.agents.reduce((sum, a) => sum + a.confidence * a.calibration, 0)
    / assay.agents.reduce((sum, a) => sum + a.calibration, 0);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,12,24,0.8)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Collective Assay</div>
            <div className="text-xs font-semibold text-slate-200">Multi-Agent Belief Synthesis</div>
          </div>
          <div className="flex gap-1">
            {PRESET_ASSAYS.map((a, i) => (
              <button
                key={i}
                onClick={() => { setActiveAssay(i); setRevealed(false); }}
                className="px-2 py-0.5 rounded text-[9px] font-medium transition-all"
                style={{
                  backgroundColor: i === activeAssay ? "rgba(99,102,241,0.2)" : "rgba(30,41,59,0.5)",
                  color: i === activeAssay ? "#818cf8" : "#475569",
                  border: `1px solid ${i === activeAssay ? "rgba(99,102,241,0.4)" : "transparent"}`,
                }}
              >
                {["Drug Trial", "Fukushima"][i]}
              </button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div
          className="rounded-lg p-3 mt-1"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Question posed to council</div>
          <div className="text-xs text-slate-200 leading-relaxed">{assay.question}</div>
        </div>
      </div>

      {/* Agent responses */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {assay.agents.map((agent, idx) => {
          const hasDissent = agent.dissents_from && agent.dissents_from.length > 0;
          const color = TYPE_COLORS[agent.agent_type] ?? "#64748b";
          return (
            <div
              key={agent.id}
              className="rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${hasDissent ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)"}`,
                backgroundColor: hasDissent ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)",
              }}
            >
              {/* Agent header */}
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold text-slate-200">{agent.name}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded uppercase"
                    style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
                  >
                    {agent.agent_type}
                  </span>
                  {hasDissent && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                      style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
                    >
                      ⚠ Dissents
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[9px] text-slate-500">
                    cal <span className="font-mono" style={{ color: agent.calibration >= 0.75 ? "#22c55e" : agent.calibration >= 0.5 ? "#6366f1" : "#ef4444" }}>
                      {agent.calibration.toFixed(2)}
                    </span>
                  </div>
                  <ConfBar value={agent.confidence} />
                </div>
              </div>

              {/* Reasoning */}
              <div className="px-3 py-2.5">
                <p className="text-[10px] text-slate-400 leading-relaxed">{agent.reasoning}</p>
                {agent.evidence_cited.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {agent.evidence_cited.map(ev => (
                      <span key={ev} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                        {ev.replace(/-/g, " ").slice(3, 24)}…
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Collective verdict */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-center"
            style={{
              backgroundColor: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
            }}
          >
            Synthesize Collective Verdict →
          </button>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: assay.constraint_blocked ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(34,197,94,0.3)",
              backgroundColor: assay.constraint_blocked ? "rgba(239,68,68,0.04)" : "rgba(34,197,94,0.04)",
            }}
          >
            <div
              className="px-3 py-2 flex items-center justify-between"
              style={{ borderBottom: assay.constraint_blocked ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(34,197,94,0.1)" }}
            >
              <div className="text-xs font-bold" style={{ color: assay.constraint_blocked ? "#f87171" : "#4ade80" }}>
                {assay.constraint_blocked ? "⊗ Constraint Blocked" : "✓ Collective Verdict"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500">weighted confidence</span>
                <span className="text-xs font-mono font-bold" style={{ color: calibrationWeightedConfidence < 0.4 ? "#f87171" : "#4ade80" }}>
                  {calibrationWeightedConfidence.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="px-3 py-3">
              <p className="text-[10px] text-slate-300 leading-relaxed mb-3">{assay.collective_reasoning}</p>

              {assay.constraint_reason && (
                <div
                  className="rounded-lg p-2.5 mb-3"
                  style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <div className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-1">System Gate Triggered</div>
                  <div className="text-[10px] text-red-300 leading-relaxed">{assay.constraint_reason}</div>
                </div>
              )}

              {assay.unresolved_disagreements.length > 0 && (
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">Unresolved Disagreements</div>
                  {assay.unresolved_disagreements.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5">
                      <span style={{ color: "#f59e0b" }}>⊘</span>
                      <p className="text-[10px] text-amber-200/70 leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Calibration breakdown */}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Calibration-weighted positions</div>
                <div className="space-y-1.5">
                  {assay.agents.map(a => (
                    <div key={a.id} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 w-28 truncate">{a.name}</span>
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <div
                          style={{
                            width: `${a.confidence * 100}%`,
                            height: "100%",
                            backgroundColor: TYPE_COLORS[a.agent_type] ?? "#64748b",
                            opacity: a.calibration,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{(a.confidence * a.calibration).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfBar({ value }: { value: number }) {
  const color = value >= 0.7 ? "#22c55e" : value >= 0.4 ? "#6366f1" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="rounded-full overflow-hidden" style={{ width: 48, height: 4, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  );
}
