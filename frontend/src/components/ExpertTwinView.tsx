import { useGraphStore } from "../store/graphStore";

interface ExpertBelief {
  claim: string;
  confidence: number;
  domain?: string;
}

interface ExpertTwin {
  id: string;
  name: string;
  agent_type: "human" | "ai" | "institution";
  domain: string;
  title?: string;
  calibration_score: number;
  competences: string[];
  authority_scope?: string[];
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
    competences: ["oncology", "clinical trial design", "RAS pathway", "CNS metastasis"],
    authority_scope: ["trial enrollment decisions", "patient safety gates", "protocol amendments"],
    beliefs: [
      { claim: "KRAS G12C is a validated therapeutic target in NSCLC", confidence: 0.96, domain: "drug_discovery" },
      { claim: "Sotorasib CNS penetration is insufficient for brain-metastatic cohort", confidence: 0.78, domain: "drug_discovery" },
      { claim: "BBB uncertainty threshold of 0.4 is correct for CNS expansion gate", confidence: 0.91, domain: "drug_discovery" },
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
    competences: ["coastal engineering", "tsunami risk assessment", "seawall design", "probabilistic hazard analysis"],
    authority_scope: ["technical recommendations only — no decision authority"],
    beliefs: [
      { claim: "Tsunami exceeding 15.7m is plausible at Fukushima Daiichi based on Jogan model", confidence: 0.71, domain: "fukushima_governance" },
      { claim: "Seawall upgrade should not be deferred pending JSCE review", confidence: 0.82, domain: "fukushima_governance" },
      { claim: "Current 5.7m seawall provides inadequate margin against modeled risk", confidence: 0.88, domain: "fukushima_governance" },
    ],
    dissent_count: 1,
    dissent_vindicated: 1,
    bio: "Internal technical division. Produced the 2008 tsunami assessment. Dissent was overruled by corporate management. Assessment was vindicated on March 11, 2011.",
  },
  {
    id: "agent-asml-systems",
    name: "ASML Systems Engineering",
    agent_type: "institution",
    domain: "euv_lithography",
    title: "Integration lead, EUV platform development",
    calibration_score: 0.82,
    competences: ["EUV systems integration", "optics-source-stage co-design", "yield optimization", "overlay metrology"],
    authority_scope: ["platform architecture decisions", "light source specification", "optical performance gates"],
    beliefs: [
      { claim: "Pre-pulse technique is necessary for commercial EUV source power", confidence: 0.97, domain: "euv_lithography" },
      { claim: "Hydrogen plasma cleaning can extend mirror lifetime to >1 year", confidence: 0.83, domain: "euv_lithography" },
      { claim: "Overlay <2nm is achievable at 5nm node with current wafer stage", confidence: 0.75, domain: "euv_lithography" },
    ],
    dissent_count: 0,
    dissent_vindicated: 0,
    tacit_traces: ["tacit-droplet-calibration", "tacit-mirror-cleaning"],
    bio: "ASML systems team responsible for integrating light source, optics train, and wafer stage. Held cross-institutional knowledge coordination role during Cymer acquisition.",
  },
  {
    id: "agent-ai-screen-01",
    name: "MolScreen-v2",
    agent_type: "ai",
    domain: "drug_discovery",
    title: "Virtual screening and ADMET prediction tool",
    calibration_score: 0.71,
    competences: ["virtual screening", "molecular docking", "ADMET prediction", "BBB permeability modeling"],
    authority_scope: ["computational recommendation only — no clinical decision authority"],
    beliefs: [
      { claim: "Sotorasib analogue shows BBB+ probability of 0.41 in QSAR model", confidence: 0.68, domain: "drug_discovery" },
      { claim: "Clog P value suggests moderate CNS penetration potential", confidence: 0.72, domain: "drug_discovery" },
    ],
    dissent_count: 1,
    dissent_vindicated: 0,
    bio: "ML-based virtual screening tool. Trained on 2.3M compounds. BBB model trained on P-gp substrate data. Dissent on CNS deferral decision recorded and preserved.",
  },
];

function CalibrationArc({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const color = score >= 0.8 ? "#22c55e" : score >= 0.6 ? "#6366f1" : "#f59e0b";
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" className="flex-shrink-0">
      <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle
        cx={24} cy={24} r={r} fill="none"
        stroke={color} strokeWidth={3}
        strokeDasharray={`${score * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: "stroke-dasharray 0.6s" }}
      />
      <text x={24} y={27} textAnchor="middle" fontSize={10} fontWeight={700} fill={color} fontFamily="monospace">
        {score.toFixed(2)}
      </text>
    </svg>
  );
}

function AgentTypeBadge({ type }: { type: ExpertTwin["agent_type"] }) {
  const cfg = {
    human:       { bg: "#6366f115", color: "#818cf8", label: "human" },
    ai:          { bg: "#22c55e15", color: "#4ade80", label: "ai" },
    institution: { bg: "#f59e0b15", color: "#fbbf24", label: "institution" },
  }[type];
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  );
}

export function ExpertTwinView({ className = "" }: { className?: string }) {
  const { selectedNode } = useGraphStore();

  const twin = selectedNode?.layer === "agents"
    ? (DEMO_TWINS.find(t => t.id === selectedNode.id) ?? DEMO_TWINS[0])
    : DEMO_TWINS[0];

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* Header card */}
      <div className="flex-shrink-0 px-3 pt-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start gap-3">
          <CalibrationArc score={twin.calibration_score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-200">{twin.name}</span>
              <AgentTypeBadge type={twin.agent_type} />
            </div>
            {twin.title && (
              <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{twin.title}</div>
            )}
            <div className="text-[9px] text-slate-600 mt-0.5">{twin.domain.replace(/_/g, " ")}</div>
          </div>
        </div>

        {twin.bio && (
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{twin.bio}</p>
        )}

        {twin.dissent_count !== undefined && (
          <div className="flex items-center gap-3 mt-2">
            <div className="text-[10px]">
              <span className="text-slate-600">dissents </span>
              <span className="font-mono text-slate-300">{twin.dissent_count}</span>
            </div>
            {twin.dissent_vindicated !== undefined && twin.dissent_vindicated > 0 && (
              <div className="text-[10px]">
                <span className="text-slate-600">vindicated </span>
                <span className="font-mono" style={{ color: "#22c55e" }}>{twin.dissent_vindicated}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Competences */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Competences</div>
          <div className="flex flex-wrap gap-1">
            {twin.competences.map(c => (
              <span key={c} className="text-[9px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Authority scope */}
        {twin.authority_scope && twin.authority_scope.length > 0 && (
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Authority scope</div>
            <div className="space-y-1">
              {twin.authority_scope.map((s, i) => (
                <div key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                  <span style={{ color: "#6366f1" }}>›</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current beliefs */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Current beliefs</div>
          <div className="space-y-2">
            {twin.beliefs.map((b, i) => {
              const barColor = b.confidence >= 0.85 ? "#22c55e" : b.confidence >= 0.65 ? "#6366f1" : "#f59e0b";
              return (
                <div key={i} className="rounded p-2" style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="text-[10px] text-slate-300 leading-snug">{b.claim}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <div style={{ width: `${b.confidence * 100}%`, height: "100%", backgroundColor: barColor, borderRadius: 9999 }} />
                    </div>
                    <span className="text-[9px] font-mono flex-shrink-0" style={{ color: barColor }}>
                      {b.confidence.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tacit traces link */}
        {twin.tacit_traces && twin.tacit_traces.length > 0 && (
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Tacit traces</div>
            <div className="space-y-1">
              {twin.tacit_traces.map(tid => (
                <div key={tid} className="text-[10px] flex items-center gap-1.5 rounded px-2 py-1.5"
                  style={{ backgroundColor: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)", color: "#fbbf24" }}>
                  <span>◎</span>
                  <span>{tid.replace(/-/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selector strip */}
      <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1.5">All experts</div>
        <div className="flex flex-col gap-1">
          {DEMO_TWINS.map(t => (
            <div key={t.id}
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer"
              style={{
                backgroundColor: t.id === twin.id ? "rgba(99,102,241,0.1)" : "transparent",
                border: `1px solid ${t.id === twin.id ? "rgba(99,102,241,0.2)" : "transparent"}`,
              }}>
              <span className="text-[10px] font-mono" style={{ color: t.calibration_score >= 0.8 ? "#22c55e" : "#6366f1" }}>
                {t.calibration_score.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 truncate">{t.name}</span>
              <span className="text-[9px] text-slate-600 flex-shrink-0">{t.domain.split("_")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
