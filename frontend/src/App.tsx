import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { GraphCanvas } from "./components/GraphCanvas";
import { CityOverview } from "./components/CityOverview";
import { DecisionReplay } from "./components/DecisionReplay";
import { ProvenanceInspector } from "./components/ProvenanceInspector";
import { InferencePanel } from "./components/InferencePanel";
import { OntologyBridgeView } from "./components/OntologyBridgeView";
import { AgentCouncilView } from "./components/AgentCouncilView";
import { GraphEvolutionTimeline } from "./components/GraphEvolutionTimeline";
import { TacitTraceViewer } from "./components/TacitTraceViewer";
import { ExpertTwinView } from "./components/ExpertTwinView";
import { CollectiveAssayView } from "./components/CollectiveAssayView";
import { PermissionExplorer } from "./components/PermissionExplorer";
import { NestedAgencyView } from "./components/NestedAgencyView";
import { SerendipityPanel } from "./components/SerendipityPanel";
import { LandingView, CogniseeGlyph } from "./components/LandingView";
import { TransferWorkbench } from "./components/TransferWorkbench";
import { ConceptAtlasView } from "./components/ConceptAtlasView";
import { ResearchTraceView } from "./components/ResearchTraceView";
import { CognitionFabricView } from "./components/CognitionFabricView";
import { DecisionTheaterView } from "./components/DecisionTheaterView";
import { useGraphData, useDecisionReplay } from "./hooks/useGraphData";
import { useGraphStore, LAYER_COLORS, type LayerKey } from "./store/graphStore";
import { api } from "./api/client";

type LeftTab = "replay" | "provenance" | "tacit" | "inference";
type RightTab = "council" | "twin" | "assay" | "serendipity" | "alignment" | "evolution" | "permissions" | "agency" | "transfer" | "atlas" | "research";
type CenterView = "graph" | "city" | "fabric" | "theater";

const LEFT_TABS: { id: LeftTab; label: string; icon: string; tip: string; desc: string }[] = [
  { id: "replay",     label: "Replay",     icon: "▶", tip: "Decision Replay",      desc: "Step through any decision trace with actors, evidence, and policy gates" },
  { id: "provenance", label: "Provenance", icon: "⊕", tip: "Provenance Chain",     desc: "SHA-256 custody chain — who did what, when, and why" },
  { id: "tacit",      label: "Tacit",      icon: "◎", tip: "Tacit Knowledge",      desc: "Situated skill traces — knowledge that cannot be fully written down" },
  { id: "inference",  label: "Inference",  icon: "⊛", tip: "Expert Routing",       desc: "EIG-based routing: finds the agent whose answer reduces uncertainty most" },
];

const RIGHT_TABS: { id: RightTab; label: string; icon: string; tip: string; desc: string }[] = [
  { id: "council",     label: "Council",     icon: "◉", tip: "Agent Council",     desc: "All agents with calibration rings, belief bars, and dissent history" },
  { id: "twin",        label: "Expert",      icon: "⊙", tip: "Expert Twin",       desc: "Digital twin of an expert's epistemic state — beliefs, calibration, authority" },
  { id: "assay",       label: "Assay",       icon: "⊗", tip: "Belief Synthesis",  desc: "Collective assay: how do agents disagree? Where do constraint violations occur?" },
  { id: "serendipity", label: "Discover",    icon: "⟺", tip: "Cross-Domain Bridges", desc: "Serendipity: structural parallels found across domains without being asked" },
  { id: "alignment",   label: "Bridge",      icon: "≡", tip: "Ontology Bridge",   desc: "Functor alignment between two ontologies — mappings, gaps, structural loss" },
  { id: "evolution",   label: "Evolution",   icon: "⊞", tip: "Graph Evolution",   desc: "Open-ended proposals: new nodes, bridges, densifications — subject to governance" },
  { id: "permissions", label: "Access",      icon: "⬡", tip: "Permission Matrix", desc: "Who can read, write, or govern which nodes and layers" },
  { id: "agency",      label: "Agency",      icon: "⊘", tip: "Nested Agency",     desc: "Hierarchy of agents and institutions — delegation chains, authority scopes" },
  { id: "transfer",    label: "Transfer",    icon: "⇕", tip: "Transfer Workbench", desc: "Cross-domain transfer via abstraction — functor lab, abstraction elevator, structural loss accounting" },
  { id: "atlas",       label: "Atlas",       icon: "◈", tip: "Concept Atlas",      desc: "2D scatter of all concept nodes by abstraction level and substrate distance — click to inspect" },
  { id: "research",   label: "Research",    icon: "⊛", tip: "ARC Research Engine", desc: "AutoResearchClaw pipeline — sources, claims, contradictions, abstractions, transfer opportunities" },
];

const DOMAIN_META: Record<string, { color: string; label: string; desc: string }> = {
  // Governance & Safety
  fukushima_governance:                { color: "#f97316", label: "Governance",   desc: "TEPCO seawall — authority override, calibration decay, dissent suppression" },
  aviation_safety:                     { color: "#94a3b8", label: "Aviation",     desc: "737 MAX MCAS, ODA regulatory capture, Ed Pierson dissent" },
  pandemic_governance:                 { color: "#a855f7", label: "Pandemic",     desc: "WHO PHEIC delay, mask reversal, aerosol science dissent" },
  climate_policy:                      { color: "#06b6d4", label: "Climate",      desc: "Hansen, IPCC, COP26 — political discount of expert evidence" },
  disaster_response_operations:        { color: "#fb923c", label: "Disaster",     desc: "Incident command, resource routing, multi-agency coordination under uncertainty" },
  public_health_coordination:          { color: "#fbbf24", label: "Public Health",desc: "Surveillance systems, outbreak response, expert-authority tension" },
  // Advanced Manufacturing
  euv_lithography:                     { color: "#22c55e", label: "EUV",          desc: "ASML pre-pulse tacit knowledge, source instability, process engineering" },
  semiconductor_hardware:              { color: "#eab308", label: "Fab",          desc: "Plasma etch process window, yield governance, Kim's dissent" },
  surgical_robotics:                   { color: "#ec4899", label: "Surgery",      desc: "da Vinci haptic calibration, OR Safety Committee override" },
  industrial_quality_control:          { color: "#84cc16", label: "Industrial QC",desc: "SPC, defect detection, process drift under production pressure" },
  supply_chain_resilience:             { color: "#0ea5e9", label: "Supply Chain", desc: "Bottleneck identification, shock absorption, rerouting strategies" },
  extreme_environments:                { color: "#ef4444", label: "Extreme",      desc: "Challenger O-ring, normalization of deviance, robotic autonomy" },
  // Discovery Science
  drug_discovery:                      { color: "#3b82f6", label: "Drug",         desc: "KRAS pathway, BBB penetration, clinical trial calibration" },
  translational_biomedicine:           { color: "#60a5fa", label: "Translational",desc: "Bench-to-bedside, trial design, regulatory evidence standards" },
  developmental_biology_morphogenesis: { color: "#34d399", label: "Morphogenesis",desc: "Turing patterns, Levin multiscale control, morphogen gradients" },
  causality_and_complex_systems:       { color: "#38bdf8", label: "Causality",    desc: "Pearl DAGs, invariant prediction, causal inference under intervention" },
  experimental_design_and_measurement: { color: "#818cf8", label: "Experimental", desc: "RCT design, measurement validity, bias identification" },
  expert_preservation:                 { color: "#d97706", label: "Expert Pres.", desc: "Tacit knowledge capture before expert retirement, succession protocols" },
  // Mathematical Transfer
  mathematics_category_theory:         { color: "#8b5cf6", label: "Category",     desc: "Functors, natural transformations, ologs — cross-domain transfer mathematics" },
  algebraic_structures:                { color: "#a78bfa", label: "Algebra",      desc: "Groups, rings, Galois theory, Reed-Solomon codes — finite field transfer" },
  graph_theory_and_networks:           { color: "#c084fc", label: "Graph Theory", desc: "Spectral methods, network flow, community detection, epidemiological networks" },
  information_theory:                  { color: "#d946ef", label: "Info Theory",  desc: "Shannon entropy, channel capacity, Landauer principle, rate-distortion" },
  optimization_and_control:            { color: "#4ade80", label: "Optimization", desc: "Bellman equations, optimal control, optimal transport, PID theory" },
  scientific_model_transfer:           { color: "#cbd5e1", label: "Model Xfer",   desc: "Abstraction extraction, invariant preservation, domain-to-domain bridge validation" },
};

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipState {
  x: number;
  y: number;
  side: "right" | "left" | "bottom";
  title: string;
  body?: string;
}

function Tooltip({ title, body, anchor, side = "right" }: {
  title: string;
  body?: string;
  anchor: DOMRect | null;
  side?: "right" | "left" | "bottom";
}) {
  if (!anchor) return null;
  let style: React.CSSProperties = { position: "fixed", zIndex: 9999, pointerEvents: "none" };
  if (side === "right")  { style.left = anchor.right + 8; style.top = anchor.top + anchor.height / 2; style.transform = "translateY(-50%)"; }
  if (side === "left")   { style.right = window.innerWidth - anchor.left + 8; style.top = anchor.top + anchor.height / 2; style.transform = "translateY(-50%)"; }
  if (side === "bottom") { style.left = anchor.left + anchor.width / 2; style.top = anchor.bottom + 6; style.transform = "translateX(-50%)"; }
  return createPortal(
    <div style={style}>
      <div style={{
        backgroundColor: "rgba(8,14,30,0.97)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "6px 10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        maxWidth: 220,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap" }}>{title}</div>
        {body && <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{body}</div>}
      </div>
    </div>,
    document.body,
  );
}

function useTooltip() {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const show = useCallback((e: React.MouseEvent) => setAnchor((e.currentTarget as HTMLElement).getBoundingClientRect()), []);
  const hide = useCallback(() => setAnchor(null), []);
  return { anchor, show, hide };
}

// ── Resize handle ─────────────────────────────────────────────────────────────

function useResizable(initial: number, min = 180, max = 520, direction: "right" | "left" = "right") {
  const [width, setWidth] = useState(initial);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(initial);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = direction === "right" ? ev.clientX - startX.current : startX.current - ev.clientX;
      setWidth(Math.max(min, Math.min(max, startW.current + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [width, min, max, direction]);

  return { width, onMouseDown };
}

// ── ResizeHandle ──────────────────────────────────────────────────────────────

function ResizeHandle({ onMouseDown, side }: { onMouseDown: (e: React.MouseEvent) => void; side: "right" | "left" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 4,
        flexShrink: 0,
        cursor: "col-resize",
        background: hovered ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)",
        transition: "background 0.15s",
        alignSelf: "stretch",
        zIndex: 10,
        ...(side === "right" ? { borderRight: "1px solid rgba(255,255,255,0.06)" } : { borderLeft: "1px solid rgba(255,255,255,0.06)" }),
      }}
      title="Drag to resize"
    />
  );
}

// ── Left sidebar tab strip (horizontal) ───────────────────────────────────────

function LeftTabStrip({ active, onChange }: { active: LeftTab; onChange: (t: LeftTab) => void }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(21,20,26,0.85)", display: "flex", flexShrink: 0 }}>
      {LEFT_TABS.map(t => {
        const { anchor, show, hide } = useTooltip();
        return (
          <div key={t.id} style={{ flex: 1 }} onMouseEnter={show} onMouseLeave={hide}>
            <button
              onClick={() => onChange(t.id)}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 4px",
                color: active === t.id ? "#e2e8f0" : "#334155",
                borderBottom: active === t.id ? "2px solid #6366f1" : "2px solid transparent",
                background: active === t.id ? "rgba(99,102,241,0.05)" : "transparent",
                cursor: "pointer",
                border: "none",
                outline: "none",
                transition: "color 0.15s, background 0.15s",
              }}
            >
              <span style={{ fontSize: 12, lineHeight: 1 }}>{t.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3, lineHeight: 1 }}>{t.label}</span>
            </button>
            <Tooltip title={t.tip} body={t.desc} anchor={anchor} side="bottom" />
          </div>
        );
      })}
    </div>
  );
}

// ── Right sidebar tab strip (vertical icons) ──────────────────────────────────

function RightTabStrip({ active, onChange }: { active: RightTab; onChange: (t: RightTab) => void }) {
  return (
    <div style={{
      width: 36,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(21,20,26,0.92)",
      overflowY: "auto",
    }}>
      {RIGHT_TABS.map(t => {
        const isActive = active === t.id;
        const { anchor, show, hide } = useTooltip();
        return (
          <div key={t.id} onMouseEnter={show} onMouseLeave={hide}>
            <button
              onClick={() => onChange(t.id)}
              style={{
                width: 36,
                height: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                cursor: "pointer",
                border: "none",
                outline: "none",
                background: isActive ? "rgba(99,102,241,0.10)" : "transparent",
                borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
                color: isActive ? "#e2e8f0" : "#334155",
                transition: "color 0.15s, background 0.15s",
                flexShrink: 0,
              }}
              title={t.tip}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>{t.icon}</span>
            </button>
            <Tooltip title={t.tip} body={t.desc} anchor={anchor} side="left" />
          </div>
        );
      })}
    </div>
  );
}


// ── AnimatedStat ──────────────────────────────────────────────────────────────

function AnimatedStat({ value, label, color, tip }: { value: number | null; label: string; color?: string; tip?: string }) {
  const prev = useRef(0);
  const display = value ?? prev.current;
  const { anchor, show, hide } = useTooltip();
  useEffect(() => { if (value != null) prev.current = value; }, [value]);
  return (
    <div className="flex items-baseline gap-1" onMouseEnter={show} onMouseLeave={hide}>
      <span className="text-sm font-bold tabular-nums font-mono" style={{ color: value ? (color ?? "#e2e8f0") : "#1e293b" }}>
        {display}
      </span>
      <span className="text-[9px] text-slate-700 uppercase tracking-widest">{label}</span>
      {tip && <Tooltip title={label} body={tip} anchor={anchor} side="bottom" />}
    </div>
  );
}

// ── DomainPip ─────────────────────────────────────────────────────────────────

function DomainPip({ domain, active, onClick }: { domain: string; active: boolean; onClick: () => void }) {
  const meta = domain === "all"
    ? { color: "#6366f1", label: "All", desc: "Show all domains" }
    : (DOMAIN_META[domain] ?? { color: "#6366f1", label: domain.replace(/_/g, " "), desc: "" });
  const { anchor, show, hide } = useTooltip();
  return (
    <div onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-150"
        style={{
          backgroundColor: active ? `${meta.color}18` : "rgba(255,255,255,0.02)",
          color: active ? meta.color : "#334155",
          border: `1px solid ${active ? `${meta.color}35` : "rgba(255,255,255,0.06)"}`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color, opacity: active ? 1 : 0.4 }} />
        {meta.label}
      </button>
      <Tooltip title={domain === "all" ? "All Domains" : domain.replace(/_/g, " ")} body={meta.desc} anchor={anchor} side="bottom" />
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [landed, setLanded] = useState(false);
  const [leftTab, setLeftTab]   = useState<LeftTab>("replay");
  const [rightTab, setRightTab] = useState<RightTab>("transfer");
  const [centerView, setCenterView] = useState<CenterView>("graph");
  const [defaultScenario, setDefaultScenario] = useState<string>("fukushima");
  const [leftOpen, setLeftOpen]   = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const leftResize  = useResizable(296, 200, 520, "right");
  const rightResize = useResizable(300, 200, 540, "left");

  const {
    selectedNode, overview, error, loading,
    domainFilter, setDomainFilter, liveEvents,
    setAlignmentMap, requestedView, requestView,
  } = useGraphStore();

  useGraphData();

  useEffect(() => {
    if (liveEvents.length > 0) setWsConnected(true);
  }, [liveEvents]);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL ?? "";
    fetch(`${base}/health`)
      .then(r => { if (r.ok) setWsConnected(true); else setDemoMode(true); })
      .catch(() => setDemoMode(true));
  }, []);

  const selectedDecisionId =
    selectedNode?.type === "context" || selectedNode?.layer === "context"
      ? selectedNode.id : null;
  useDecisionReplay(selectedDecisionId);

  useEffect(() => { if (selectedDecisionId) setLeftTab("replay"); }, [selectedDecisionId]);
  useEffect(() => { if (selectedNode?.layer === "agents") setRightTab("twin"); }, [selectedNode]);

  // Respond to cross-component view requests (e.g. SerendipityPanel → City)
  useEffect(() => {
    if (requestedView) {
      setCenterView(requestedView);
      requestView(null);
    }
  }, [requestedView, requestView]);

  const alignPairs = [
    ["drug_discovery",       "fukushima_governance"],
    ["extreme_environments", "fukushima_governance"],
    ["climate_policy",       "fukushima_governance"],
    ["aviation_safety",      "extreme_environments"],
    ["pandemic_governance",  "fukushima_governance"],
    ["surgical_robotics",    "euv_lithography"],
    ["mathematics_category_theory", "euv_lithography"],
    ["semiconductor_hardware","drug_discovery"],
  ];
  const alignIdx = useRef(0);

  const handleComputeAlignment = async () => {
    const [src, tgt] = alignPairs[alignIdx.current % alignPairs.length]!;
    alignIdx.current += 1;
    setRightTab("alignment");
    setRightOpen(true);
    try {
      const map = await api.alignment.compute(src, tgt);
      setAlignmentMap(map);
    } catch {
      // demo mode: OntologyBridgeView shows embedded DEMO_MAP by default
    }
  };

  const domains = overview
    ? [...new Set(
        Object.values(overview.layers)
          .flatMap(l => l.nodes)
          .map(n => (n.data as Record<string, unknown>)?.domain as string | undefined)
          .filter(Boolean) as string[]
      )]
    : [];

  const totalNodes = overview?.summary.total_nodes ?? null;
  const totalEdges = overview?.summary.total_edges ?? null;
  const layerBreakdown = overview
    ? Object.entries(overview.layers).map(([k, v]) => ({ layer: k as LayerKey, count: v.nodes.length }))
    : [];

  const { anchor: alignAnchor, show: alignShow, hide: alignHide } = useTooltip();
  const { anchor: centerAnchor, show: centerShow, hide: centerHide } = useTooltip();

  if (!landed) {
    return (
      <LandingView
        onEnter={() => setLanded(true)}
        onEnterDecision={() => {
          setDefaultScenario("fukushima");
          setLeftTab("replay");
          setRightTab("transfer");
          setLanded(true);
        }}
        onEnterTheater={() => {
          setCenterView("theater");
          setLanded(true);
        }}
        demoMode={demoMode}
      />
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: "#15141a", color: "#e8e3dc", userSelect: "none" }}
    >
      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4"
        style={{
          height: 52,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(21,20,26,0.98)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <CogniseeGlyph size={26} />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight" style={{ color: "#e8e3dc" }}>Omega</span>
            <span className="text-[10px]" style={{ color: "#4a4640" }}>Knowledge Operating System</span>
          </div>
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-widest"
            style={{ backgroundColor: "rgba(124,109,248,0.10)", color: "#9d8ff5", border: "1px solid rgba(124,109,248,0.18)" }}>
            v9
          </span>
          {demoMode && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest"
              style={{ backgroundColor: "rgba(249,115,22,0.10)", color: "#c97a42", border: "1px solid rgba(249,115,22,0.18)" }}
              title="No live backend — graph loaded from embedded demo substrate">
              demo mode · embedded substrate
            </span>
          )}
        </div>

        {/* Domain filter — scrollable strip */}
        <div className="flex items-center gap-1 min-w-0" style={{ flex: "1 1 0", overflow: "hidden" }}>
          <span className="text-[8px] text-slate-700 uppercase tracking-widest mr-1 flex-shrink-0">Domain</span>
          <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <DomainPip domain="all" active={domainFilter === null} onClick={() => setDomainFilter(null)} />
            {(domains.length > 0 ? domains : Object.keys(DOMAIN_META)).map(d => (
              <DomainPip key={d} domain={d} active={domainFilter === d}
                onClick={() => setDomainFilter(domainFilter === d ? null : d)} />
            ))}
          </div>
        </div>

        {/* Center view toggle */}
        <div className="flex rounded-lg overflow-hidden flex-shrink-0" onMouseEnter={centerShow} onMouseLeave={centerHide}
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["graph", "city", "fabric", "theater"] as CenterView[]).map(v => {
            const labels: Record<CenterView, string> = { graph: "⬡ Graph", city: "⬛ City", fabric: "◈ Fabric", theater: "⊛ Theater" };
            const isTheater = v === "theater";
            const isActive = centerView === v;
            return (
              <button key={v} onClick={() => setCenterView(v)}
                className="px-3 py-1 text-[10px] font-medium transition-all duration-150"
                style={{
                  backgroundColor: isActive ? (isTheater ? "rgba(34,197,94,0.10)" : "rgba(124,109,248,0.12)") : "transparent",
                  color: isActive ? (isTheater ? "#5ecea0" : "#9d8ff5") : "#4a4640",
                }}>
                {labels[v]}
              </button>
            );
          })}
          <Tooltip
            title={centerView === "graph" ? "Graph View" : centerView === "city" ? "City View" : "Cognition Fabric"}
            body={centerView === "graph" ? "Multi-layer knowledge graph with Cytoscape — click any node to inspect" : centerView === "city" ? "3D city of knowledge domains — buildings are node clusters, arcs are cross-domain bridges" : "Distributed cognition fabric — knowledge vaults, shared intent channels, context fabric, collective innovation, cognition engines"}
            anchor={centerAnchor} side="bottom" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {loading && <div className="w-3 h-3 rounded-full border border-t-indigo-400 border-indigo-900/50 animate-spin" />}
          <AnimatedStat value={totalNodes} label="nodes" tip="Total graph nodes across all six layers" />
          <AnimatedStat value={totalEdges} label="edges" tip="Total typed relations in the knowledge graph" />

          {/* Layer bar chart */}
          <LayerBars breakdown={layerBreakdown} />

          <div onMouseEnter={alignShow} onMouseLeave={alignHide}>
            <button onClick={handleComputeAlignment}
              className="px-2.5 py-1 text-[10px] rounded-lg font-medium transition-all duration-150"
              style={{ border: "1px solid rgba(99,102,241,0.25)", color: "#6366f1", backgroundColor: "rgba(99,102,241,0.06)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(99,102,241,0.15)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(99,102,241,0.06)"; }}>
              ≡ Bridge
            </button>
            <Tooltip title="Ontology Bridge"
              body="Opens the Bridge tab showing functor alignment between two domains — structural parallels, gap nodes, and loss accounting. Click repeatedly to cycle through domain pairs."
              anchor={alignAnchor} side="bottom" />
          </div>

          {error && <span className="text-[10px] text-red-400 max-w-[140px] truncate" title={error}>⚠ {error}</span>}
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left sidebar toggle */}
        <button onClick={() => setLeftOpen(o => !o)}
          className="absolute z-30 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-r transition-all"
          style={{
            left: leftOpen ? leftResize.width : 0,
            width: 10, height: 40,
            background: "rgba(99,102,241,0.12)",
            borderRight: "1px solid rgba(99,102,241,0.2)",
          }}>
          <span style={{ fontSize: 8, color: "#6366f1" }}>{leftOpen ? "‹" : "›"}</span>
        </button>

        {/* Left sidebar */}
        {leftOpen && (
          <aside style={{
            width: leftResize.width,
            flexShrink: 0,
            display: "flex",
            overflow: "hidden",
            borderRight: "none",
            background: "rgba(21,20,26,0.97)",
          }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
              <LeftTabStrip active={leftTab} onChange={setLeftTab} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                {leftTab === "replay"     && <DecisionReplay      className="h-full" initialScenario={defaultScenario} />}
                {leftTab === "provenance" && <ProvenanceInspector  className="h-full" />}
                {leftTab === "tacit"      && <TacitTraceViewer     className="h-full" />}
                {leftTab === "inference"  && <InferencePanel       className="h-full" />}
              </div>
            </div>
            <ResizeHandle onMouseDown={leftResize.onMouseDown} side="right" />
          </aside>
        )}

        {/* Center */}
        <main className="flex-1 overflow-hidden p-2 relative">
          {centerView === "graph"   && <GraphCanvas           className="w-full h-full" />}
          {centerView === "city"    && <CityOverview           className="w-full h-full" />}
          {centerView === "fabric"  && <CognitionFabricView    className="w-full h-full" />}
          {centerView === "theater" && <DecisionTheaterView    className="w-full h-full" />}
        </main>

        {/* Right sidebar */}
        {rightOpen && (
          <aside style={{
            width: rightResize.width,
            flexShrink: 0,
            display: "flex",
            overflow: "hidden",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(21,20,26,0.97)",
          }}>
            <ResizeHandle onMouseDown={rightResize.onMouseDown} side="left" />
            <RightTabStrip active={rightTab} onChange={setRightTab} />
            <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
              {rightTab === "council"     && <AgentCouncilView      className="h-full" />}
              {rightTab === "twin"        && <ExpertTwinView         className="h-full" />}
              {rightTab === "assay"       && <CollectiveAssayView    className="h-full" />}
              {rightTab === "serendipity" && <SerendipityPanel       className="h-full" />}
              {rightTab === "alignment"   && <OntologyBridgeView     className="h-full" />}
              {rightTab === "permissions" && <PermissionExplorer     className="h-full" />}
              {rightTab === "agency"      && <NestedAgencyView       className="h-full" />}
              {rightTab === "evolution"   && <GraphEvolutionTimeline  className="h-full" />}
              {rightTab === "transfer"    && <TransferWorkbench       className="h-full" initialCase={defaultScenario === "fukushima" ? "transfer-dissent-governance" : undefined} />}
              {rightTab === "atlas"       && <ConceptAtlasView        className="h-full" />}
              {rightTab === "research"    && <ResearchTraceView       className="h-full" />}
            </div>
          </aside>
        )}

        {/* Right sidebar toggle */}
        <button onClick={() => setRightOpen(o => !o)}
          className="absolute z-30 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-l transition-all"
          style={{
            right: rightOpen ? rightResize.width : 0,
            width: 10, height: 40,
            background: "rgba(99,102,241,0.12)",
            borderLeft: "1px solid rgba(99,102,241,0.2)",
          }}>
          <span style={{ fontSize: 8, color: "#6366f1" }}>{rightOpen ? "›" : "‹"}</span>
        </button>
      </div>

      {/* ── Status bar ── */}
      <footer
        className="flex-shrink-0 flex items-center justify-between px-4 gap-4 overflow-hidden"
        style={{ height: 26, borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(21,20,26,0.99)" }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "animate-pulse" : ""}`}
              style={{ backgroundColor: wsConnected ? "#22c55e" : "#ef444460" }} />
            <span className="text-[9px] text-slate-700">{wsConnected ? "live" : "demo"}</span>
          </span>
          {liveEvents.length > 0 && (
            <span className="text-[9px] text-slate-700 truncate">
              {String((liveEvents[0] as Record<string, unknown>)?.type ?? "event")}
            </span>
          )}
        </div>

        {selectedNode && (
          <div className="flex items-center gap-1.5 text-[9px] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: LAYER_COLORS[selectedNode.layer as LayerKey] ?? "#94a3b8" }} />
            <span className="text-slate-600">{selectedNode.layer}</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 max-w-[200px] truncate">{selectedNode.label}</span>
          </div>
        )}

        <div className="flex items-center gap-4 flex-shrink-0 text-[9px] text-slate-800">
          <span>24 knowledge cities · 6 metro regions · 50+ bridges</span>
          <span>Omega v8.0</span>
        </div>
      </footer>
    </div>
  );
}

// ── LayerBars (extracted to avoid hook-in-loop issues) ────────────────────────

function LayerBars({ breakdown }: { breakdown: { layer: LayerKey; count: number }[] }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {breakdown.map(({ layer, count }) => (
        <LayerBar key={layer} layer={layer} count={count} />
      ))}
    </div>
  );
}

function LayerBar({ layer, count }: { layer: LayerKey; count: number }) {
  const { anchor, show, hide } = useTooltip();
  return (
    <div onMouseEnter={show} onMouseLeave={hide}>
      <div
        className="rounded-sm"
        style={{
          width: 4,
          height: Math.max(3, Math.min(20, count * 2.2)),
          backgroundColor: LAYER_COLORS[layer],
          opacity: 0.75,
        }}
      />
      <Tooltip title={layer} body={`${count} nodes in the ${layer} layer`} anchor={anchor} side="bottom" />
    </div>
  );
}
