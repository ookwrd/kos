import { useState } from "react";
import { useGraphStore } from "../store/graphStore";

interface ExpertBelief {
  claim: string;
  confidence: number;
  domain?: string;
}

interface CalibrationDecision {
  decision: string;
  outcome: "vindicated" | "overruled" | "vindicated_post_failure" | "inconclusive";
  year: number;
}

interface DomainEnvelope {
  authoritative: string[];
  not_authoritative?: string[];
}

interface ExpertTwin {
  id: string;
  name: string;
  agent_type: "human" | "ai" | "institution";
  domain: string;
  title?: string;
  calibration_score: number;
  calibration_history?: number[];
  calibration_decision_history?: CalibrationDecision[];
  competences: string[];
  authority_scope?: string[];
  domain_envelope?: DomainEnvelope;
  beliefs: ExpertBelief[];
  dissent_count?: number;
  dissent_vindicated?: number;
  tacit_traces?: string[];
  bio?: string;
}

const DEMO_TWINS: ExpertTwin[] = [
  {
    id: "agent-oncologist-01",
    name: "Dr. Sarah Chen",
    agent_type: "human",
    domain: "drug_discovery",
    title: "Thoracic Oncologist, Phase II Trial PI",
    calibration_score: 0.84,
    calibration_history: [0.71, 0.76, 0.79, 0.82, 0.84],
    competences: ["oncology", "clinical trial design", "RAS pathway", "CNS metastasis"],
    authority_scope: ["trial enrollment decisions", "patient safety gates", "protocol amendments"],
    beliefs: [
      { claim: "KRAS G12C is a validated therapeutic target in NSCLC", confidence: 0.96, domain: "drug_discovery" },
      { claim: "Sotorasib CNS penetration is insufficient for brain-metastatic cohort at current data", confidence: 0.78, domain: "drug_discovery" },
      { claim: "BBB uncertainty threshold of 0.40 is correct for CNS expansion gate", confidence: 0.91, domain: "drug_discovery" },
    ],
    dissent_count: 1,
    dissent_vindicated: 0,
    bio: "15 years thoracic oncology. PI on CodeBreaK 100/101. Published extensively on KRAS-mutant NSCLC treatment pathways.",
  },
  {
    id: "agent-tepco-civil",
    name: "TEPCO Civil Engineering Division",
    agent_type: "institution",
    domain: "fukushima_governance",
    title: "Internal technical group, Fukushima Daiichi site",
    calibration_score: 0.76,
    calibration_history: [0.76, 0.76, 0.76, 0.76, 0.76],
    competences: ["coastal engineering", "tsunami risk assessment", "seawall design", "probabilistic hazard analysis"],
    authority_scope: ["technical recommendations only — no decision authority"],
    beliefs: [
      { claim: "Tsunami exceeding 15.7m is plausible at Fukushima Daiichi based on Jogan model", confidence: 0.71, domain: "fukushima_governance" },
      { claim: "Seawall upgrade should not be deferred pending JSCE review", confidence: 0.82, domain: "fukushima_governance" },
      { claim: "5.7m seawall provides inadequate margin against modeled risk", confidence: 0.88, domain: "fukushima_governance" },
    ],
    dissent_count: 1,
    dissent_vindicated: 1,
    calibration_decision_history: [
      { decision: "2008 tsunami risk assessment — seawall upgrade needed", outcome: "vindicated_post_failure", year: 2008 },
      { decision: "Generator relocation to high ground required", outcome: "overruled", year: 2008 },
    ],
    domain_envelope: {
      authoritative: ["coastal engineering", "tsunami risk", "seawall design", "probabilistic hazard analysis"],
      not_authoritative: ["corporate finance", "regulatory strategy", "public relations"],
    },
    bio: "Internal technical division responsible for the 2008 tsunami assessment. Dissent overruled by corporate management. Assessment vindicated March 11, 2011.",
  },
  {
    id: "agent-tepco-mgmt",
    name: "TEPCO Corporate Management",
    agent_type: "institution",
    domain: "fukushima_governance",
    title: "Corporate decision authority, Fukushima Daiichi",
    calibration_score: 0.31,
    calibration_history: [0.45, 0.40, 0.35, 0.33, 0.31],
    competences: ["corporate governance", "cost management", "regulatory liaison"],
    authority_scope: ["final decision authority — overrides technical recommendations"],
    beliefs: [
      { claim: "The Jogan tsunami model has insufficient independent validation to justify upgrade cost", confidence: 0.71, domain: "fukushima_governance" },
      { claim: "JSCE review process will adequately assess the risk before any action is needed", confidence: 0.62, domain: "fukushima_governance" },
    ],
    dissent_count: 0,
    dissent_vindicated: 0,
    bio: "Corporate authority that overruled the 2008 seawall engineering recommendation. Calibration score reflects retrospective assessment of decision quality against outcome.",
  },
  {
    id: "agent-ed-pierson",
    name: "Ed Pierson",
    agent_type: "human",
    domain: "aviation_safety",
    title: "Senior VP, Boeing Commercial Aircraft Manufacturing",
    calibration_score: 0.91,
    calibration_history: [0.85, 0.87, 0.89, 0.90, 0.91],
    competences: ["aerospace manufacturing", "production quality", "safety culture", "systems integration"],
    authority_scope: ["manufacturing decisions — no authority over certification or design"],
    beliefs: [
      { claim: "Boeing 737 MAX production line had systemic quality failures in 2018", confidence: 0.96, domain: "aviation_safety" },
      { claim: "Schedule pressure was overriding safety checks on the production floor", confidence: 0.94, domain: "aviation_safety" },
      { claim: "The conditions present resembled those before the Challenger and Columbia disasters", confidence: 0.88, domain: "aviation_safety" },
    ],
    dissent_count: 2,
    dissent_vindicated: 2,
    calibration_decision_history: [
      { decision: "Production quality sufficient for schedule", outcome: "overruled", year: 2018 },
      { decision: "737 MAX production should halt pending safety audit", outcome: "vindicated_post_failure", year: 2018 },
      { decision: "Workforce chaotic, quality checks inconsistent", outcome: "vindicated", year: 2019 },
    ],
    domain_envelope: {
      authoritative: ["aerospace manufacturing", "production quality", "safety culture"],
      not_authoritative: ["MCAS software design", "FAA certification", "airworthiness standards"],
    },
    bio: "Filed direct safety complaints with Boeing leadership and the FAA in July 2018 — 3 months before JT610. Classified as a labor dispute. Objections were fully vindicated by subsequent crashes. Testified before Congress in 2019.",
  },
  {
    id: "agent-boeing-mgmt",
    name: "Boeing Program Management",
    agent_type: "institution",
    domain: "aviation_safety",
    title: "Commercial Aircraft Division, 737 MAX program",
    calibration_score: 0.38,
    calibration_history: [0.52, 0.48, 0.44, 0.41, 0.38],
    competences: ["program management", "schedule management", "cost optimization", "regulatory liaison"],
    authority_scope: ["design decisions", "certification strategy", "production schedule"],
    beliefs: [
      { claim: "MCAS single-sensor design is adequate under AC 25.1309 failure classification", confidence: 0.85, domain: "aviation_safety" },
      { claim: "Production quality issues are within acceptable tolerance for schedule", confidence: 0.76, domain: "aviation_safety" },
    ],
    dissent_count: 0,
    dissent_vindicated: 0,
    bio: "Program authority for 737 MAX certification and production. Overruled safety objections filed by Ed Pierson. Two crashes (346 fatalities) and $20B+ in costs followed grounding.",
  },
  {
    id: "agent-asml-systems",
    name: "ASML Systems Engineering",
    agent_type: "institution",
    domain: "euv_lithography",
    title: "Integration lead, EUV platform development",
    calibration_score: 0.82,
    calibration_history: [0.74, 0.77, 0.79, 0.81, 0.82],
    competences: ["EUV systems integration", "optics-source-stage co-design", "yield optimization", "overlay metrology"],
    authority_scope: ["platform architecture decisions", "light source specification", "optical performance gates"],
    beliefs: [
      { claim: "Pre-pulse technique is necessary for commercial EUV source power", confidence: 0.97, domain: "euv_lithography" },
      { claim: "Hydrogen plasma cleaning can extend mirror lifetime to >1 year", confidence: 0.83, domain: "euv_lithography" },
      { claim: "Overlay <2nm is achievable at 5nm node with current wafer stage", confidence: 0.75, domain: "euv_lithography" },
    ],
    dissent_count: 0,
    dissent_vindicated: 0,
    tacit_traces: ["tacit-droplet-calibration"],
    bio: "ASML systems team responsible for integrating light source, optics train, and wafer stage.",
  },
  {
    id: "agent-ai-screen-01",
    name: "MolScreen-v2",
    agent_type: "ai",
    domain: "drug_discovery",
    title: "Virtual screening and ADMET prediction tool",
    calibration_score: 0.71,
    calibration_history: [0.63, 0.66, 0.68, 0.70, 0.71],
    competences: ["virtual screening", "molecular docking", "ADMET prediction", "BBB permeability modeling"],
    authority_scope: ["computational recommendation only — no clinical decision authority"],
    beliefs: [
      { claim: "Sotorasib analogue shows BBB+ probability of 0.41 in QSAR model", confidence: 0.68, domain: "drug_discovery" },
      { claim: "Clog P value suggests moderate CNS penetration potential", confidence: 0.72, domain: "drug_discovery" },
    ],
    dissent_count: 1,
    dissent_vindicated: 0,
    bio: "ML-based virtual screening tool. Trained on 2.3M compounds. BBB model trained on P-gp substrate data. Dissent on CNS deferral preserved in substrate.",
  },
];

// ── Calibration arc ────────────────────────────────────────────────────────────

function CalibrationRing({ score, history }: { score: number; history?: number[] }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const color = score >= 0.8 ? "#22c55e" : score >= 0.6 ? "#6366f1" : score >= 0.4 ? "#f59e0b" : "#ef4444";
  const trend = history && history.length >= 2 ? history[history.length - 1] - history[0] : 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
      <svg width={52} height={52} viewBox="0 0 52 52">
        {/* Track */}
        <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3.5} />
        {/* Progress */}
        <circle
          cx={26} cy={26} r={r} fill="none"
          stroke={color} strokeWidth={3.5}
          strokeDasharray={`${score * circ} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
          style={{ transition: "stroke-dasharray 0.6s", filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
        {/* Score text */}
        <text x={26} y={29} textAnchor="middle" fontSize={10} fontWeight={700} fill={color} fontFamily="monospace">
          {score.toFixed(2)}
        </text>
      </svg>
      {/* Trend arrow */}
      {Math.abs(trend) > 0.01 && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
          style={{
            backgroundColor: trend > 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
            border: `1px solid ${trend > 0 ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
            color: trend > 0 ? "#4ade80" : "#f87171",
          }}
          title={`Trend: ${trend > 0 ? "+" : ""}${(trend * 100).toFixed(0)} pts`}
        >
          {trend > 0 ? "↑" : "↓"}
        </div>
      )}
    </div>
  );
}

// ── Agent type badge ───────────────────────────────────────────────────────────

function AgentTypeBadge({ type }: { type: ExpertTwin["agent_type"] }) {
  const cfg = {
    human:       { bg: "#6366f115", color: "#818cf8", label: "human" },
    ai:          { bg: "#22c55e15", color: "#4ade80", label: "ai" },
    institution: { bg: "#f59e0b15", color: "#fbbf24", label: "institution" },
  }[type];
  return (
    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ExpertTwinView({ className = "" }: { className?: string }) {
  const { selectedNode } = useGraphStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const resolvedId = activeId ??
    (selectedNode?.layer === "agents" ? selectedNode.id : null) ??
    DEMO_TWINS[0].id;
  const twin = DEMO_TWINS.find(t => t.id === resolvedId) ?? DEMO_TWINS[0];

  const vindicationRate = (twin.dissent_count ?? 0) > 0
    ? ((twin.dissent_vindicated ?? 0) / twin.dissent_count!)
    : null;

  return (
    <div className={`flex flex-col overflow-hidden ${className}`} style={{ background: "rgba(2,6,16,0.98)" }}>

      {/* ── Header card ── */}
      <div className="flex-shrink-0 px-3 pt-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-start gap-3">
          <CalibrationRing score={twin.calibration_score} history={twin.calibration_history} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="text-[11px] font-semibold text-slate-200">{twin.name}</span>
              <AgentTypeBadge type={twin.agent_type} />
            </div>
            {twin.title && (
              <div className="text-[9px] text-slate-500 leading-snug">{twin.title}</div>
            )}
            <div className="text-[9px] text-slate-700 mt-0.5">{twin.domain.replace(/_/g, " ")}</div>
          </div>
        </div>

        {twin.bio && (
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed"
            style={{ borderLeft: "2px solid rgba(99,102,241,0.3)", paddingLeft: 8 }}>
            {twin.bio}
          </p>
        )}

        {/* Dissent record */}
        {(twin.dissent_count ?? 0) > 0 && (
          <div className="flex items-center gap-3 mt-2.5 px-2.5 py-2 rounded-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex-1">
              <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Dissent record</div>
              <div className="flex items-center gap-3">
                <div className="text-[10px]">
                  <span className="text-slate-600">filed </span>
                  <span className="font-mono font-bold text-slate-300">{twin.dissent_count}</span>
                </div>
                {vindicationRate !== null && (
                  <div className="text-[10px]">
                    <span className="text-slate-600">vindicated </span>
                    <span className="font-mono font-bold" style={{ color: vindicationRate > 0 ? "#4ade80" : "#f59e0b" }}>
                      {twin.dissent_vindicated}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {vindicationRate !== null && vindicationRate > 0 && (
              <div className="flex flex-col items-center">
                <div className="text-[14px] font-bold" style={{ color: "#22c55e" }}>
                  {(vindicationRate * 100).toFixed(0)}%
                </div>
                <div className="text-[8px] text-slate-600">vindication</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">

        {/* Beliefs */}
        <div>
          <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-2">Current beliefs</div>
          <div className="space-y-1.5">
            {twin.beliefs.map((b, i) => {
              const barColor = b.confidence >= 0.85 ? "#22c55e" : b.confidence >= 0.65 ? "#6366f1" : b.confidence >= 0.45 ? "#f59e0b" : "#ef4444";
              return (
                <div key={i} className="rounded-lg p-2"
                  style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="text-[10px] text-slate-300 leading-snug mb-1.5">{b.claim}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <div style={{ width: `${b.confidence * 100}%`, height: "100%", backgroundColor: barColor, borderRadius: 9999 }} />
                    </div>
                    <span className="text-[9px] font-mono flex-shrink-0 font-bold" style={{ color: barColor }}>
                      {b.confidence.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competences */}
        <div>
          <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1.5">Competences</div>
          <div className="flex flex-wrap gap-1">
            {twin.competences.map(c => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "rgba(99,102,241,0.10)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.18)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Authority scope */}
        {twin.authority_scope && twin.authority_scope.length > 0 && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1.5">Authority scope</div>
            <div className="space-y-1">
              {twin.authority_scope.map((s, i) => (
                <div key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                  <span style={{ color: "#6366f1", flexShrink: 0 }}>›</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tacit traces */}
        {twin.tacit_traces && twin.tacit_traces.length > 0 && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1.5">Tacit traces</div>
            {twin.tacit_traces.map(tid => (
              <div key={tid} className="text-[10px] flex items-center gap-1.5 rounded px-2 py-1.5"
                style={{ backgroundColor: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)", color: "#fbbf24" }}>
                <span>◎</span>
                <span>{tid.replace(/-/g, " ")}</span>
              </div>
            ))}
          </div>
        )}

        {/* Calibration decision history */}
        {twin.calibration_decision_history && twin.calibration_decision_history.length > 0 && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1.5">Decision track record</div>
            <div className="space-y-1">
              {twin.calibration_decision_history.map((d, i) => {
                const outcomeStyle = {
                  vindicated:              { color: "#4ade80", label: "vindicated",        bg: "rgba(34,197,94,0.08)"   },
                  vindicated_post_failure: { color: "#f59e0b", label: "vindicated (post-failure)", bg: "rgba(245,158,11,0.08)" },
                  overruled:               { color: "#f87171", label: "overruled",          bg: "rgba(239,68,68,0.08)"   },
                  inconclusive:            { color: "#94a3b8", label: "inconclusive",       bg: "rgba(148,163,184,0.05)" },
                }[d.outcome];
                return (
                  <div key={i} className="flex items-start gap-2 rounded px-2 py-1.5 text-[9px]"
                    style={{ backgroundColor: outcomeStyle.bg, border: `1px solid ${outcomeStyle.color}22` }}>
                    <span className="font-mono text-slate-600 flex-shrink-0">{d.year}</span>
                    <span className="text-slate-400 flex-1 leading-snug">{d.decision}</span>
                    <span className="font-bold flex-shrink-0" style={{ color: outcomeStyle.color }}>{outcomeStyle.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Domain envelope */}
        {twin.domain_envelope && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1.5">Domain envelope</div>
            <div className="space-y-1">
              <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-0.5">Authoritative</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {twin.domain_envelope.authoritative.map(d => (
                  <span key={d} className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.18)" }}>
                    {d}
                  </span>
                ))}
              </div>
              {twin.domain_envelope.not_authoritative && twin.domain_envelope.not_authoritative.length > 0 && (
                <>
                  <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-0.5">Not authoritative</div>
                  <div className="flex flex-wrap gap-1">
                    {twin.domain_envelope.not_authoritative.map(d => (
                      <span key={d} className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(239,68,68,0.06)", color: "#94a3b8", border: "1px solid rgba(239,68,68,0.12)" }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Calibration history sparkline */}
        {twin.calibration_history && twin.calibration_history.length > 1 && (
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1.5">Calibration trajectory</div>
            <CalibrationSparkline history={twin.calibration_history} score={twin.calibration_score} />
          </div>
        )}
      </div>

      {/* ── Selector strip ── */}
      <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="text-[8px] text-slate-600 uppercase tracking-[0.2em] mb-1.5">All experts</div>
        <div className="flex flex-col gap-0.5 max-h-28 overflow-y-auto">
          {DEMO_TWINS.map(t => {
            const color = t.calibration_score >= 0.8 ? "#22c55e" : t.calibration_score >= 0.6 ? "#6366f1" : t.calibration_score >= 0.4 ? "#f59e0b" : "#ef4444";
            const isActive = t.id === twin.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className="flex items-center gap-2 px-2 py-1 rounded text-left transition-all"
                style={{
                  backgroundColor: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(99,102,241,0.18)" : "transparent"}`,
                }}>
                <span className="text-[9px] font-mono font-bold flex-shrink-0" style={{ color, minWidth: 28 }}>
                  {t.calibration_score.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-400 truncate flex-1">{t.name}</span>
                <span className="text-[8px] text-slate-700 flex-shrink-0">{t.domain.split("_")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Calibration history sparkline ─────────────────────────────────────────────

function CalibrationSparkline({ history, score }: { history: number[]; score: number }) {
  const min = Math.min(...history) - 0.05;
  const max = Math.max(...history) + 0.05;
  const range = max - min;
  const w = 100;
  const h = 24;
  const color = score >= 0.8 ? "#22c55e" : score >= 0.6 ? "#6366f1" : score >= 0.4 ? "#f59e0b" : "#ef4444";

  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width="100%" height={h + 4} viewBox={`0 0 ${w} ${h + 4}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#calGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      {history.length > 0 && (
        <circle
          cx={(history.length - 1) / (history.length - 1) * w}
          cy={h - ((history[history.length - 1] - min) / range) * h}
          r={2}
          fill={color}
        />
      )}
    </svg>
  );
}
