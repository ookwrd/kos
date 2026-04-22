import { useState } from "react";
import type { ExpertRouting } from "../api/client";
import { useGraphStore } from "../store/graphStore";

interface AgentDemo {
  id: string;
  label: string;
  agent_type: "human" | "ai" | "institution";
  domain: string;
  calibration_score: number;
  competences: string[];
  beliefs: Record<string, number>;
  authority_scope: string[];
  dissent_count: number;
  color: string;
}

const DEMO_AGENTS: AgentDemo[] = [
  {
    id: "ag-chen",
    label: "Dr. Sarah Chen",
    agent_type: "human",
    domain: "drug_discovery",
    calibration_score: 0.84,
    competences: ["oncology", "CNS pharmacology", "clinical trials", "BBB permeability"],
    beliefs: { "KRAS_G12C_target_validity": 0.87, "CNS_penetration_viable": 0.61, "phase2_ready": 0.72 },
    authority_scope: ["evidence:validate", "hypothesis:propose", "decision:dissent"],
    dissent_count: 2,
    color: "#3b82f6",
  },
  {
    id: "ag-molscreen",
    label: "MolScreen-v2",
    agent_type: "ai",
    domain: "drug_discovery",
    calibration_score: 0.71,
    competences: ["molecular docking", "ADMET prediction", "BBB screening", "binding affinity"],
    beliefs: { "KRAS_G12C_target_validity": 0.79, "CNS_penetration_viable": 0.54, "phase2_ready": 0.68 },
    authority_scope: ["evidence:create", "hypothesis:score"],
    dissent_count: 0,
    color: "#6366f1",
  },
  {
    id: "ag-tepco-eng",
    label: "TEPCO Civil Eng.",
    agent_type: "human",
    domain: "fukushima_governance",
    calibration_score: 0.76,
    competences: ["seismic risk", "structural assessment", "tsunami modeling", "facility safety"],
    beliefs: { "15m_seawall_adequate": 0.82, "jogan_recurrence_risk": 0.71, "management_override_justified": 0.18 },
    authority_scope: ["evidence:validate", "proposal:submit"],
    dissent_count: 3,
    color: "#f97316",
  },
  {
    id: "ag-tepco-mgmt",
    label: "TEPCO Management",
    agent_type: "institution",
    domain: "fukushima_governance",
    calibration_score: 0.31,
    competences: ["cost management", "regulatory relations", "operations"],
    beliefs: { "15m_seawall_adequate": 0.19, "jogan_recurrence_risk": 0.22, "management_override_justified": 0.85 },
    authority_scope: ["decision:approve", "budget:authorize"],
    dissent_count: 0,
    color: "#ef4444",
  },
  {
    id: "ag-asml-eng",
    label: "ASML Systems Eng.",
    agent_type: "human",
    domain: "euv_lithography",
    calibration_score: 0.82,
    competences: ["EUV optics", "pre-pulse laser", "plasma dynamics", "yield optimization"],
    beliefs: { "pre_pulse_critical": 0.91, "tin_droplet_stability": 0.78, "yield_target_achievable": 0.65 },
    authority_scope: ["tacit:record", "evidence:validate", "decision:dissent"],
    dissent_count: 1,
    color: "#14b8a6",
  },
  {
    id: "ag-zeiss-optical",
    label: "Carl Zeiss Optical",
    agent_type: "institution",
    domain: "euv_lithography",
    calibration_score: 0.83,
    competences: ["mirror fabrication", "aberration correction", "EUV optics"],
    beliefs: { "pre_pulse_critical": 0.88, "tin_droplet_stability": 0.82, "yield_target_achievable": 0.73 },
    authority_scope: ["evidence:validate", "proposal:submit"],
    dissent_count: 0,
    color: "#a855f7",
  },
];

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  human:       { icon: "◎", label: "Human Expert",   color: "#22c55e" },
  ai:          { icon: "⊛", label: "AI Agent",        color: "#6366f1" },
  institution: { icon: "⬡", label: "Institution",     color: "#f59e0b" },
};

const DOMAIN_COLORS: Record<string, string> = {
  drug_discovery:       "#3b82f6",
  fukushima_governance: "#f97316",
  euv_lithography:      "#a855f7",
};

export function AgentCouncilView({ className = "" }: { className?: string }) {
  const { expertRouting, overview } = useGraphStore();
  const [selectedAgent, setSelectedAgent] = useState<AgentDemo | null>(null);
  const [filterDomain, setFilterDomain] = useState<string | null>(null);

  const liveAgents = overview?.layers?.agents?.nodes ?? [];
  const agentsToShow = liveAgents.length > 0
    ? liveAgents.map(n => {
        const d = n.data as Record<string, unknown>;
        return {
          id: n.id,
          label: n.label,
          agent_type: (d.agent_type as AgentDemo["agent_type"]) ?? "human",
          domain: (d.domain as string) ?? "unknown",
          calibration_score: (d.calibration_score as number) ?? 0.5,
          competences: (d.competences as string[]) ?? [],
          beliefs: (d.beliefs as Record<string, number>) ?? {},
          authority_scope: (d.authority_scope as string[]) ?? [],
          dissent_count: 0,
          color: DOMAIN_COLORS[(d.domain as string)] ?? "#6366f1",
        } satisfies AgentDemo;
      })
    : DEMO_AGENTS;

  const domains = [...new Set(agentsToShow.map(a => a.domain))];
  const filtered = filterDomain ? agentsToShow.filter(a => a.domain === filterDomain) : agentsToShow;

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Agent Council</div>
        <div className="text-xs font-semibold text-slate-200">
          {agentsToShow.length} agents across {domains.length} domains
        </div>
        {/* Domain filter chips */}
        <div className="flex gap-1 mt-2 flex-wrap">
          <button
            onClick={() => setFilterDomain(null)}
            className="px-2 py-0.5 rounded text-[9px] font-medium transition-all"
            style={{
              backgroundColor: !filterDomain ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
              color: !filterDomain ? "#818cf8" : "#475569",
              border: `1px solid ${!filterDomain ? "rgba(99,102,241,0.3)" : "transparent"}`,
            }}
          >
            All
          </button>
          {domains.map(d => {
            const c = DOMAIN_COLORS[d] ?? "#6366f1";
            const active = filterDomain === d;
            return (
              <button
                key={d}
                onClick={() => setFilterDomain(active ? null : d)}
                className="px-2 py-0.5 rounded text-[9px] font-medium transition-all"
                style={{
                  backgroundColor: active ? `${c}18` : "rgba(255,255,255,0.03)",
                  color: active ? c : "#475569",
                  border: `1px solid ${active ? `${c}35` : "transparent"}`,
                }}
              >
                {d.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expert routing banner */}
      {expertRouting.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2.5 flex gap-2"
          style={{ borderBottom: "1px solid rgba(20,184,166,0.15)", backgroundColor: "rgba(20,184,166,0.05)" }}>
          <span className="text-teal-400 text-[10px] font-bold uppercase tracking-widest">Routing →</span>
          <div className="flex gap-2 flex-wrap">
            {expertRouting.slice(0, 3).map((r, i) => {
              const agent = r.agent as Record<string, unknown>;
              return (
                <div key={i} className="flex items-center gap-1.5 rounded-full px-2 py-0.5"
                  style={{ backgroundColor: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.25)" }}>
                  <span className="w-3 h-3 rounded-full bg-teal-500 text-[7px] text-white flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[9px] text-teal-300">{String(agent?.name ?? agent?.id ?? "")}</span>
                  <span className="text-[9px] font-mono text-teal-400">{r.eig_score.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto">
        {selectedAgent ? (
          <AgentDetail
            agent={selectedAgent}
            routing={expertRouting.find(r => (r.agent as Record<string, unknown>)?.id === selectedAgent.id)}
            onBack={() => setSelectedAgent(null)}
          />
        ) : (
          <div className="px-3 py-2 space-y-1.5">
            {filtered.map(agent => (
              <AgentRow
                key={agent.id}
                agent={agent}
                routing={expertRouting.find(r => (r.agent as Record<string, unknown>)?.id === agent.id)}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentRow({ agent, routing, onClick }: { agent: AgentDemo; routing?: ExpertRouting; onClick: () => void }) {
  const typeConf = TYPE_CONFIG[agent.agent_type];
  const isRouted = !!routing;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl px-3 py-2.5 transition-all duration-150"
      style={{
        backgroundColor: isRouted ? `${agent.color}08` : "rgba(255,255,255,0.02)",
        border: `1px solid ${isRouted ? `${agent.color}30` : "rgba(255,255,255,0.05)"}`,
        boxShadow: isRouted ? `0 0 12px ${agent.color}12` : "none",
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
          style={{ backgroundColor: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}30` }}>
          {typeConf.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-200 truncate">{agent.label}</span>
            {agent.dissent_count > 0 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                {agent.dissent_count} dissent
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] text-slate-600"
              style={{ color: DOMAIN_COLORS[agent.domain] ?? "#64748b" }}>
              {agent.domain.replace(/_/g, " ")}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-[9px] text-slate-600">{typeConf.label}</span>
          </div>
        </div>

        {/* Calibration ring */}
        <CalibRing score={agent.calibration_score} />
      </div>

      {/* Belief preview */}
      {Object.keys(agent.beliefs).length > 0 && (
        <div className="mt-2 flex gap-2 overflow-hidden">
          {Object.entries(agent.beliefs).slice(0, 3).map(([k, v]) => {
            const bColor = v > 0.7 ? "#22c55e" : v > 0.4 ? "#eab308" : "#ef4444";
            return (
              <div key={k} className="flex-1 min-w-0">
                <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div style={{ width: `${v * 100}%`, height: "100%", backgroundColor: bColor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </button>
  );
}

function AgentDetail({ agent, routing, onBack }: { agent: AgentDemo; routing?: ExpertRouting; onBack: () => void }) {
  return (
    <div className="px-4 py-3 space-y-3">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[9px] text-slate-500 hover:text-slate-400 transition-colors">
        ← Back to council
      </button>

      {/* Header */}
      <div className="rounded-xl p-3" style={{ backgroundColor: `${agent.color}08`, border: `1px solid ${agent.color}25` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}35` }}>
            {TYPE_CONFIG[agent.agent_type].icon}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-100">{agent.label}</div>
            <div className="text-[9px] mt-0.5" style={{ color: DOMAIN_COLORS[agent.domain] }}>
              {agent.domain.replace(/_/g, " ")}
            </div>
          </div>
          <CalibRing score={agent.calibration_score} large />
        </div>
      </div>

      {/* Beliefs */}
      {Object.keys(agent.beliefs).length > 0 && (
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Belief State</div>
          <div className="space-y-2">
            {Object.entries(agent.beliefs).map(([prop, prob]) => {
              const bColor = prob > 0.7 ? "#22c55e" : prob > 0.4 ? "#eab308" : "#ef4444";
              return (
                <div key={prop}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 truncate max-w-[75%]">
                      {prop.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-bold font-mono" style={{ color: bColor }}>
                      {Math.round(prob * 100)}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${prob * 100}%`, backgroundColor: bColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Competences */}
      {agent.competences.length > 0 && (
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Competences</div>
          <div className="flex flex-wrap gap-1">
            {agent.competences.map(c => (
              <span key={c} className="text-[9px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${agent.color}12`, color: agent.color, border: `1px solid ${agent.color}25` }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Authority scope */}
      {agent.authority_scope.length > 0 && (
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Authority Scope</div>
          <div className="flex flex-wrap gap-1">
            {agent.authority_scope.map(s => (
              <span key={s} className="text-[9px] px-2 py-0.5 rounded font-mono"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.06)" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dissent */}
      {agent.dissent_count > 0 && (
        <div className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-1">Dissent Record</div>
          <p className="text-[10px] text-slate-400">
            {agent.dissent_count} formal dissent{agent.dissent_count !== 1 ? "s" : ""} on record.
            All preserved in the context graph for institutional memory.
          </p>
        </div>
      )}

      {/* EIG routing */}
      {routing && (
        <div className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.2)" }}>
          <div className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1">Routing Score</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-mono font-bold text-teal-300">{routing.eig_score.toFixed(3)}</span>
            <span className="text-[9px] text-teal-500">expected information gain</span>
          </div>
          <p className="text-[10px] text-slate-400">{routing.routing_reason}</p>
        </div>
      )}
    </div>
  );
}

function CalibRing({ score, large = false }: { score: number; large?: boolean }) {
  const size = large ? 44 : 32;
  const r = large ? 18 : 12;
  const stroke = large ? 2.5 : 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * score;
  const color = score >= 0.75 ? "#22c55e" : score >= 0.5 ? "#eab308" : "#ef4444";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono font-bold" style={{ fontSize: large ? 10 : 7, color }}>
          {Math.round(score * 100)}
        </span>
      </div>
    </div>
  );
}
