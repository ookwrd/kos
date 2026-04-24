import { useState } from "react";
import type { ExpertRouting } from "../api/client";
import { useGraphStore } from "../store/graphStore";

interface CalibrationDecision {
  id: string;
  year: number;
  claim: string;
  outcome: "vindicated" | "overridden_correct" | "overridden_wrong" | "pending" | "refuted";
  outcome_note: string;
  domain: string;
}

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
  vindication_rate?: number;
  calibration_history?: CalibrationDecision[];
  domain_envelope?: { in_scope: string[]; out_of_scope: string[] };
  override_note?: string;
}

const DEMO_AGENTS: AgentDemo[] = [
  {
    id: "ag-tepco-eng",
    label: "TEPCO Civil Eng.",
    agent_type: "human",
    domain: "fukushima_governance",
    calibration_score: 0.76,
    vindication_rate: 0.83,
    competences: ["seismic risk", "structural assessment", "tsunami modeling", "facility safety"],
    beliefs: { "15m_seawall_required": 0.82, "jogan_recurrence_risk": 0.71, "management_override_justified": 0.18 },
    authority_scope: ["evidence:validate", "proposal:submit"],
    dissent_count: 3,
    color: "#f97316",
    calibration_history: [
      { id: "cd-tepco-1", year: 2002, claim: "Jogan 869 tsunami scenario requires seawall reassessment above 5.7m", outcome: "vindicated", outcome_note: "2011 tsunami reached 14.1m — NAIIC confirmed warning was specific and accurate", domain: "fukushima_governance" },
      { id: "cd-tepco-2", year: 2006, claim: "Cabinet Office probabilistic tsunami model is inadequate for Tohoku coast", outcome: "overridden_correct", outcome_note: "Ministry dismissed — probabilistic modeling used until 2011. Warning was correct.", domain: "fukushima_governance" },
      { id: "cd-tepco-3", year: 2008, claim: "15.7m maximum credible tsunami — 10m deficit in current seawall", outcome: "overridden_correct", outcome_note: "TEPCO Management overruled — dissent record not created. This was the suppressed dissent. March 2011 tsunami: 14.1m.", domain: "fukushima_governance" },
    ],
    domain_envelope: {
      in_scope: ["coastal seismic risk", "structural load calculations", "tsunami run-up modeling", "facility vulnerability assessment"],
      out_of_scope: ["regulatory strategy", "cost-benefit tradeoffs at corporate level", "grid reliability policy"],
    },
    override_note: "This agent has been overridden 3 times by lower-calibration authorities. In all 3 cases, the agent's technical position was subsequently vindicated by physical events. Override decisions had catastrophic consequences.",
  },
  {
    id: "ag-tepco-mgmt",
    label: "TEPCO Management",
    agent_type: "institution",
    domain: "fukushima_governance",
    calibration_score: 0.31,
    vindication_rate: 0.18,
    competences: ["cost management", "regulatory relations", "operations"],
    beliefs: { "15m_seawall_required": 0.19, "jogan_recurrence_risk": 0.22, "management_override_justified": 0.85 },
    authority_scope: ["decision:approve", "budget:authorize"],
    dissent_count: 0,
    color: "#ef4444",
    calibration_history: [
      { id: "cd-mgmt-1", year: 2002, claim: "Jogan scenario is non-credible for operational planning purposes", outcome: "refuted", outcome_note: "2011 event vindicated the scenario they dismissed — NAIIC finding", domain: "fukushima_governance" },
      { id: "cd-mgmt-2", year: 2008, claim: "Current seawall adequate based on existing probabilistic models", outcome: "refuted", outcome_note: "Seawall overtopped by >8m. Direct contradiction of the adequacy claim.", domain: "fukushima_governance" },
      { id: "cd-mgmt-3", year: 2010, claim: "Regulatory compliance sufficient — no additional engineering review required", outcome: "refuted", outcome_note: "NAIIC found regulatory capture: TEPCO wrote portions of its own safety guidelines. Compliance was structured to avoid disclosure.", domain: "fukushima_governance" },
    ],
    domain_envelope: {
      in_scope: ["operational cost decisions", "stakeholder relations", "regulatory compliance strategy"],
      out_of_scope: ["tsunami physics", "seismic risk assessment", "engineering probability estimation — calibration score: 0.31 in technical domains"],
    },
    override_note: "This institution exercised decision authority in domains where its calibration score is 0.31. A vector database stores documents. Omega stores track records. The difference is this table.",
  },
  {
    id: "agent-ed-pierson",
    label: "Ed Pierson",
    agent_type: "human",
    domain: "aviation_safety",
    calibration_score: 0.91,
    vindication_rate: 0.89,
    competences: ["aerospace manufacturing", "production quality", "safety culture", "systems integration"],
    beliefs: { "mcas_single_sensor_safe": 0.06, "production_quality_adequate": 0.08, "schedule_overriding_safety": 0.94 },
    authority_scope: ["manufacturing:authority", "safety:dissent — no cert authority"],
    dissent_count: 2,
    color: "#94a3b8",
    calibration_history: [
      { id: "cd-ep-1", year: 2018, claim: "787 production quality deterioration creates unacceptable defect rate risk before 737 MAX rollout", outcome: "vindicated", outcome_note: "2019 FAA audit confirmed quality escapes at Renton facility. Pierson's concern was production-environment, not aircraft-specific — but the warning class was accurate.", domain: "aviation_safety" },
      { id: "cd-ep-2", year: 2018, claim: "Workforce pressure and schedule intensity constitute safety risk — requires stand-down", outcome: "overridden_correct", outcome_note: "Boeing management denied stand-down. 737 MAX MCAS failures in Oct 2018 and Mar 2019. 346 fatalities. Pierson testified to Congress.", domain: "aviation_safety" },
    ],
    domain_envelope: {
      in_scope: ["manufacturing quality signals", "production environment risk", "safety culture assessment", "worker pressure indicators"],
      out_of_scope: ["flight dynamics certification", "MCAS algorithm design — Pierson raised systemic pressure risk, not specific MCAS fault"],
    },
    override_note: "Calibration score 0.91 derived from track record of quality and safety concerns that were subsequently confirmed. Boeing program management (calibration: 0.38) overruled — same governance failure schema as Fukushima.",
  },
  {
    id: "agent-boeing-mgmt",
    label: "Boeing Program Mgmt",
    agent_type: "institution",
    domain: "aviation_safety",
    calibration_score: 0.38,
    vindication_rate: 0.22,
    competences: ["program management", "schedule management", "cost optimization"],
    beliefs: { "mcas_single_sensor_safe": 0.85, "production_quality_adequate": 0.76, "schedule_overriding_safety": 0.15 },
    authority_scope: ["design:approve", "certification:strategy", "production:schedule"],
    dissent_count: 0,
    color: "#64748b",
    calibration_history: [
      { id: "cd-bm-1", year: 2017, claim: "MCAS single-sensor design is acceptable risk for certification", outcome: "refuted", outcome_note: "MCAS single-sensor failure caused Lion Air 610 (Oct 2018) and Ethiopian 302 (Mar 2019). 346 fatalities.", domain: "aviation_safety" },
      { id: "cd-bm-2", year: 2018, claim: "Production schedule does not compromise quality or safety", outcome: "refuted", outcome_note: "2019 Congressional investigation found Boeing suppressed safety concerns for schedule. FAA found defects.", domain: "aviation_safety" },
    ],
    domain_envelope: {
      in_scope: ["program timelines", "cost accounting", "supplier management"],
      out_of_scope: ["flight-critical system safety — calibration 0.38 in technical safety domain; made safety decisions anyway"],
    },
    override_note: "Institution with 0.38 calibration made binding safety decisions that affected 346 lives. Same decision-authority-without-epistemic-standing pattern as TEPCO Management.",
  },
  {
    id: "ag-chen",
    label: "Dr. Sarah Chen",
    agent_type: "human",
    domain: "drug_discovery",
    calibration_score: 0.84,
    vindication_rate: 0.79,
    competences: ["oncology", "CNS pharmacology", "clinical trials", "BBB permeability"],
    beliefs: { "KRAS_G12C_target_validity": 0.87, "CNS_penetration_viable": 0.61, "phase2_ready": 0.72 },
    authority_scope: ["evidence:validate", "hypothesis:propose", "decision:dissent"],
    dissent_count: 2,
    color: "#3b82f6",
    calibration_history: [
      { id: "cd-chen-1", year: 2021, claim: "KRASG12C covalent inhibition viable for solid tumors — CodeBreaK100 will show ORR >35%", outcome: "vindicated", outcome_note: "Sotorasib Phase II: 37.1% ORR in NSCLC. FDA approval 2021.", domain: "drug_discovery" },
      { id: "cd-chen-2", year: 2022, claim: "CNS penetration insufficient for KRAS-mutant GBM without structural modification", outcome: "pending", outcome_note: "Still under investigation — no Phase II GBM data yet. Chen's concern is about BBB permeability of current KRASG12C inhibitors.", domain: "drug_discovery" },
      { id: "cd-chen-3", year: 2023, claim: "Combination MEK inhibitor resistance is primary challenge, not target selectivity", outcome: "pending", outcome_note: "KRYSTAL-1 combination data expected Q3 2025. Chen predicts resistance before 12 months.", domain: "drug_discovery" },
    ],
    domain_envelope: {
      in_scope: ["KRAS pathway biology", "clinical trial endpoint design", "BBB pharmacology", "oncology combination strategy"],
      out_of_scope: ["manufacturing scale-up", "commercial strategy", "regulatory pathway navigation"],
    },
  },
  {
    id: "ag-molscreen",
    label: "MolScreen-v2",
    agent_type: "ai",
    domain: "drug_discovery",
    calibration_score: 0.71,
    vindication_rate: 0.68,
    competences: ["molecular docking", "ADMET prediction", "BBB screening", "binding affinity"],
    beliefs: { "KRAS_G12C_target_validity": 0.79, "CNS_penetration_viable": 0.54, "phase2_ready": 0.68 },
    authority_scope: ["evidence:create", "hypothesis:score"],
    dissent_count: 0,
    color: "#6366f1",
    calibration_history: [
      { id: "cd-mol-1", year: 2022, claim: "Predicted BBB permeability of AMG-510 analogs below CNS-viable threshold", outcome: "vindicated", outcome_note: "Experimental LogBB confirmed — analogs excluded from CNS program.", domain: "drug_discovery" },
      { id: "cd-mol-2", year: 2023, claim: "ADMET profile of MRTX849 superior to AMG-510 for oral bioavailability", outcome: "pending", outcome_note: "Head-to-head clinical comparison not yet complete.", domain: "drug_discovery" },
    ],
    domain_envelope: {
      in_scope: ["in silico screening", "ADMET profiling", "docking score prediction"],
      out_of_scope: ["clinical outcome prediction — in vitro-to-clinical gap exceeds model training distribution"],
    },
  },
  {
    id: "ag-asml-eng",
    label: "ASML Systems Eng.",
    agent_type: "human",
    domain: "euv_lithography",
    calibration_score: 0.82,
    vindication_rate: 0.85,
    competences: ["EUV optics", "pre-pulse laser", "plasma dynamics", "yield optimization"],
    beliefs: { "pre_pulse_critical": 0.91, "tin_droplet_stability": 0.78, "yield_target_achievable": 0.65 },
    authority_scope: ["tacit:record", "evidence:validate", "decision:dissent"],
    dissent_count: 1,
    color: "#22c55e",
    calibration_history: [
      { id: "cd-asml-1", year: 2019, claim: "Pre-pulse timing drift under extended operation exceeds spec — source requires re-alignment protocol", outcome: "vindicated", outcome_note: "Process engineering confirmed drift pattern. Re-alignment protocol adopted. Yield improvement verified.", domain: "euv_lithography" },
      { id: "cd-asml-2", year: 2021, claim: "Tin droplet velocity variation at high repetition rate causes unrecoverable LER in <7nm node", outcome: "pending", outcome_note: "Under active investigation in 2nm node development. Partially supported by metrology data.", domain: "euv_lithography" },
    ],
    domain_envelope: {
      in_scope: ["EUV source calibration", "plasma behavior", "pre-pulse timing", "tin droplet dynamics"],
      out_of_scope: ["resist chemistry", "scanner optical aberrations — separate expertise domain"],
    },
  },
  {
    id: "ag-zeiss-optical",
    label: "Carl Zeiss Optical",
    agent_type: "institution",
    domain: "euv_lithography",
    calibration_score: 0.83,
    vindication_rate: 0.81,
    competences: ["mirror fabrication", "aberration correction", "EUV optics"],
    beliefs: { "pre_pulse_critical": 0.88, "tin_droplet_stability": 0.82, "yield_target_achievable": 0.73 },
    authority_scope: ["evidence:validate", "proposal:submit"],
    dissent_count: 0,
    color: "#a855f7",
    calibration_history: [
      { id: "cd-zeiss-1", year: 2020, claim: "High-NA EUV mirrors require new collector design — current fabrication approach won't meet 0.55NA spec", outcome: "vindicated", outcome_note: "ASML EXE-5000 design confirmed new collector architecture. Zeiss manufacturing roadmap validated.", domain: "euv_lithography" },
    ],
    domain_envelope: {
      in_scope: ["EUV mirror design", "aberration control", "optical coating", "collector lifetime"],
      out_of_scope: ["laser source dynamics", "photoresist interactions — downstream of optical subsystem"],
    },
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
  euv_lithography:      "#22c55e",
  aviation_safety:      "#94a3b8",
};

const OUTCOME_CONFIG: Record<CalibrationDecision["outcome"], { label: string; color: string; icon: string }> = {
  vindicated:        { label: "Vindicated",        color: "#22c55e", icon: "✓" },
  overridden_correct: { label: "Overridden — correct", color: "#f59e0b", icon: "⊗" },
  overridden_wrong:  { label: "Overridden — wrong",   color: "#ef4444", icon: "✕" },
  pending:           { label: "Pending",           color: "#64748b", icon: "◌" },
  refuted:           { label: "Refuted",           color: "#ef4444", icon: "✕" },
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
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Expert Council</div>
        <div className="text-xs font-semibold text-slate-200">
          {agentsToShow.length} agents · calibration-weighted epistemic authority
        </div>
        <div className="text-[9px] text-slate-600 mt-0.5">
          Scores are track records, not model confidence — each comes from vindication history
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
  const vindicatedCount = agent.calibration_history?.filter(d => d.outcome === "vindicated" || d.outcome === "overridden_correct").length ?? 0;
  const totalCount = agent.calibration_history?.length ?? 0;

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
                {agent.dissent_count}✗
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px]" style={{ color: DOMAIN_COLORS[agent.domain] ?? "#64748b" }}>
              {agent.domain.replace(/_/g, " ")}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-[9px] text-slate-600">{typeConf.label}</span>
            {totalCount > 0 && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-[8px] text-slate-600">{vindicatedCount}/{totalCount} vindicated</span>
              </>
            )}
          </div>
        </div>

        {/* Calibration ring */}
        <CalibRing score={agent.calibration_score} />
      </div>

      {/* Calibration history mini-timeline */}
      {agent.calibration_history && agent.calibration_history.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[7px] text-slate-700 uppercase tracking-widest mr-0.5">track</span>
          {agent.calibration_history.map(d => {
            const cfg = OUTCOME_CONFIG[d.outcome];
            return (
              <div key={d.id}
                className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                style={{ backgroundColor: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                title={`${d.year}: ${d.claim.slice(0, 60)}... → ${cfg.label}`}>
                {cfg.icon}
              </div>
            );
          })}
        </div>
      )}
    </button>
  );
}

function AgentDetail({ agent, routing, onBack }: { agent: AgentDemo; routing?: ExpertRouting; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"beliefs" | "track_record" | "envelope">("track_record");

  const TABS = [
    { id: "track_record" as const, label: "Track Record" },
    { id: "beliefs" as const,      label: "Belief State" },
    { id: "envelope" as const,     label: "Domain Envelope" },
  ];

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
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] text-slate-600">Calibration:</span>
              <span className="text-[9px] font-mono font-bold" style={{ color: agent.calibration_score >= 0.7 ? "#22c55e" : agent.calibration_score >= 0.45 ? "#eab308" : "#ef4444" }}>
                {agent.calibration_score.toFixed(2)}
              </span>
              {agent.vindication_rate !== undefined && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-[8px] text-slate-600">Vindication rate:</span>
                  <span className="text-[9px] font-mono font-bold text-green-400">{Math.round(agent.vindication_rate * 100)}%</span>
                </>
              )}
            </div>
          </div>
          <CalibRing score={agent.calibration_score} large />
        </div>
      </div>

      {/* Override note — highest priority if present */}
      {agent.override_note && (
        <div className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="text-[8px] font-bold uppercase tracking-widest text-red-400 mb-1">⊗ Override Context</div>
          <p className="text-[9px] text-slate-400 leading-relaxed">{agent.override_note}</p>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-2.5 py-1 rounded text-[9px] font-medium transition-all"
            style={{
              backgroundColor: activeTab === t.id ? "rgba(255,255,255,0.07)" : "transparent",
              color: activeTab === t.id ? "#e2e8f0" : "#475569",
              border: `1px solid ${activeTab === t.id ? "rgba(255,255,255,0.10)" : "transparent"}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Track record tab */}
      {activeTab === "track_record" && agent.calibration_history && (
        <div className="space-y-2">
          <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Calibration decisions — {agent.calibration_history.filter(d => d.outcome === "vindicated" || d.outcome === "overridden_correct").length} of {agent.calibration_history.length} positions confirmed
          </div>
          {agent.calibration_history.map(d => {
            const cfg = OUTCOME_CONFIG[d.outcome];
            return (
              <div key={d.id} className="rounded-lg overflow-hidden"
                style={{ border: `1px solid ${cfg.color}25`, backgroundColor: `${cfg.color}06` }}>
                <div className="flex items-start gap-2 px-3 py-2">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 mt-0.5">
                    <span className="text-[9px] font-bold" style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span className="text-[7px] text-slate-700">{d.year}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-slate-300 leading-relaxed font-medium mb-1">
                      "{d.claim}"
                    </div>
                    <div className="text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>
                      {cfg.label}
                    </div>
                    <div className="text-[8px] text-slate-600 italic leading-relaxed">{d.outcome_note}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {agent.calibration_history.length === 0 && (
            <div className="text-[9px] text-slate-600 italic">No calibration history recorded.</div>
          )}
        </div>
      )}

      {/* Beliefs tab */}
      {activeTab === "beliefs" && (
        <div>
          {Object.keys(agent.beliefs).length > 0 ? (
            <div className="space-y-2">
              <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Current belief state</div>
              {Object.entries(agent.beliefs).map(([prop, prob]) => {
                const bColor = prob > 0.7 ? "#22c55e" : prob > 0.4 ? "#eab308" : "#ef4444";
                return (
                  <div key={prop}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 truncate max-w-[75%]">{prop.replace(/_/g, " ")}</span>
                      <span className="text-[10px] font-bold font-mono" style={{ color: bColor }}>{Math.round(prob * 100)}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${prob * 100}%`, backgroundColor: bColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[9px] text-slate-600 italic">No belief state recorded.</div>
          )}

          {/* Competences */}
          {agent.competences.length > 0 && (
            <div className="mt-3">
              <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Competences</div>
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
            <div className="mt-3">
              <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Authority Scope</div>
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
            <div className="mt-3 rounded-lg px-3 py-2.5"
              style={{ backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-1">Dissent Record</div>
              <p className="text-[10px] text-slate-400">
                {agent.dissent_count} formal dissent{agent.dissent_count !== 1 ? "s" : ""} on record — permanently preserved in context graph.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Domain envelope tab */}
      {activeTab === "envelope" && agent.domain_envelope && (
        <div className="space-y-3">
          <div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-green-500 mb-1.5">In scope — calibration valid</div>
            <div className="space-y-1">
              {agent.domain_envelope.in_scope.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[9px] text-slate-400">
                  <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-red-400 mb-1.5">Out of scope — defer to other experts</div>
            <div className="space-y-1">
              {agent.domain_envelope.out_of_scope.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[9px] text-slate-500">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === "envelope" && !agent.domain_envelope && (
        <div className="text-[9px] text-slate-600 italic">Domain envelope not mapped.</div>
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
