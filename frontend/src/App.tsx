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
        background: "var(--bg-panel)",
        border: "1px solid var(--line-strong)",
        padding: "6px 10px",
        boxShadow: "var(--shadow)",
        maxWidth: 240,
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text)", fontFamily: '"IBM Plex Sans", sans-serif', whiteSpace: "nowrap" }}>{title}</div>
        {body && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.45, fontFamily: '"IBM Plex Sans", sans-serif' }}>{body}</div>}
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

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void; side: "right" | "left" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 3,
        flexShrink: 0,
        cursor: "col-resize",
        background: hovered ? "var(--accent)" : "var(--line)",
        transition: "background 0.18s",
        alignSelf: "stretch",
        zIndex: 10,
      }}
    />
  );
}

// ── Left sidebar tab strip (horizontal) ───────────────────────────────────────

function LeftTabStrip({ active, onChange }: { active: LeftTab; onChange: (t: LeftTab) => void }) {
  return (
    <div style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-panel)", display: "flex", flexShrink: 0 }}>
      {LEFT_TABS.map(t => {
        const isActive = active === t.id;
        const { anchor, show, hide } = useTooltip();
        return (
          <div key={t.id} style={{ flex: 1 }} onMouseEnter={show} onMouseLeave={hide}>
            <button
              onClick={() => onChange(t.id)}
              style={{
                width: "100%",
                padding: "10px 6px 8px",
                color: isActive ? "var(--text)" : "var(--text-quiet)",
                boxShadow: isActive ? "inset 0 -1.5px 0 var(--accent)" : "none",
                background: "transparent",
                cursor: "pointer",
                border: "none",
                outline: "none",
                fontSize: 9,
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 500,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                transition: "color 0.15s",
              }}
            >
              {t.label}
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
      width: 40,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid var(--line)",
      background: "var(--bg-panel)",
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
                width: 40,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "none",
                outline: "none",
                background: "transparent",
                borderLeft: isActive ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                color: isActive ? "var(--accent)" : "var(--text-quiet)",
                transition: "color 0.15s",
                flexShrink: 0,
              }}
              title={t.tip}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{t.icon}</span>
            </button>
            <Tooltip title={t.tip} body={t.desc} anchor={anchor} side="left" />
          </div>
        );
      })}
    </div>
  );
}


// ── AnimatedStat ──────────────────────────────────────────────────────────────

function AnimatedStat({ value, label, tip }: { value: number | null; label: string; color?: string; tip?: string }) {
  const prev = useRef(0);
  const display = value ?? prev.current;
  const { anchor, show, hide } = useTooltip();
  useEffect(() => { if (value != null) prev.current = value; }, [value]);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }} onMouseEnter={show} onMouseLeave={hide}>
      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', color: value ? "var(--text)" : "var(--line-strong)", fontVariantNumeric: "tabular-nums" }}>
        {display.toLocaleString()}
      </span>
      <span style={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', color: "var(--text-quiet)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      {tip && <Tooltip title={label} body={tip} anchor={anchor} side="bottom" />}
    </div>
  );
}

// ── DomainPip ─────────────────────────────────────────────────────────────────

function DomainPip({ domain, active, onClick }: { domain: string; active: boolean; onClick: () => void }) {
  const meta = domain === "all"
    ? { color: "#a6d4bd", label: "All", desc: "Show all domains" }
    : (DOMAIN_META[domain] ?? { color: "#a6d4bd", label: domain.replace(/_/g, " "), desc: "" });
  const { anchor, show, hide } = useTooltip();
  return (
    <div onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-150"
        style={{
          backgroundColor: active ? `${meta.color}18` : "rgba(255,255,255,0.02)",
          color: active ? meta.color : "rgba(244,237,225,0.28)",
          border: `1px solid ${active ? `${meta.color}35` : "rgba(244,237,225,0.10)"}`,
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
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (localStorage.getItem("omega-theme") as "dark" | "light") ?? "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("omega-theme", theme);
  }, [theme]);

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
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)", color: "var(--text)", userSelect: "none" }}>

      {/* ── Header ── */}
      <header style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 0,
        borderBottom: "1px solid var(--line)",
        background: "var(--bg-panel)",
        backdropFilter: "blur(20px)",
      }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginRight: 20 }}>
          <CogniseeGlyph size={20} color="var(--accent)" />
          <span style={{ fontSize: 16, fontFamily: '"Newsreader", Georgia, serif', color: "var(--text)", fontWeight: 400, letterSpacing: "-0.02em" }}>
            Omega
          </span>
          <span style={{ width: 1, height: 14, background: "var(--line-strong)", margin: "0 2px" }} />
          <span style={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', color: "var(--text-quiet)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            KOS
          </span>
          {demoMode && (
            <span style={{ fontSize: 8, fontFamily: '"IBM Plex Mono", monospace', color: "var(--accent-strong)", border: "1px solid var(--line-strong)", padding: "1px 6px", letterSpacing: "0.1em", textTransform: "uppercase" }}
              title="No live backend — graph loaded from embedded demo substrate">
              demo
            </span>
          )}
        </div>

        {/* View toggle — spans full header height */}
        <div style={{ display: "flex", alignItems: "stretch", height: "100%", marginRight: "auto" }} onMouseEnter={centerShow} onMouseLeave={centerHide}>
          {(["graph", "city", "fabric", "theater"] as CenterView[]).map(v => {
            const labels: Record<CenterView, string> = { graph: "Graph", city: "City", fabric: "Fabric", theater: "Theater" };
            const isActive = centerView === v;
            return (
              <button key={v} onClick={() => setCenterView(v)} style={{
                padding: "0 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--text)" : "var(--text-quiet)",
                boxShadow: isActive ? "inset 0 -1.5px 0 var(--accent)" : "none",
                fontSize: 11,
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "0.04em",
                transition: "color 0.15s",
                outline: "none",
              }}>
                {labels[v]}
              </button>
            );
          })}
          <Tooltip
            title={centerView === "graph" ? "Graph View" : centerView === "city" ? "City View" : centerView === "fabric" ? "Cognition Fabric" : "Decision Theater"}
            body={centerView === "graph" ? "Multi-layer knowledge graph — click any node to inspect" : centerView === "city" ? "3D city of knowledge domains" : centerView === "fabric" ? "Distributed cognition fabric" : "Structured decision environment with scenario analysis"}
            anchor={centerAnchor} side="bottom" />
        </div>

        {/* Domain dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 20, overflow: "hidden" }}>
          <span style={{ fontSize: 8, fontFamily: '"IBM Plex Mono", monospace', color: "var(--text-quiet)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0, marginRight: 2 }}>
            Domain
          </span>
          <DomainPip domain="all" active={domainFilter === null} onClick={() => setDomainFilter(null)} />
          {(domains.length > 0 ? domains : Object.keys(DOMAIN_META)).slice(0, 16).map(d => (
            <DomainPip key={d} domain={d} active={domainFilter === d}
              onClick={() => setDomainFilter(domainFilter === d ? null : d)} />
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginRight: 16, flexShrink: 0 }}>
          {loading && <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid var(--line-strong)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />}
          <AnimatedStat value={totalNodes} label="nodes" tip="Total graph nodes across all six layers" />
          <AnimatedStat value={totalEdges} label="edges" tip="Total typed relations in the knowledge graph" />
          <LayerBars breakdown={layerBreakdown} />
        </div>

        {/* Bridge */}
        <div onMouseEnter={alignShow} onMouseLeave={alignHide} style={{ marginRight: 10 }}>
          <button onClick={handleComputeAlignment}
            style={{ padding: "5px 12px", background: "transparent", border: "1px solid var(--line-strong)", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: "0.04em", transition: "border-color 0.15s, color 0.15s", outline: "none" }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = "var(--accent)"; b.style.color = "var(--accent)"; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = "var(--line-strong)"; b.style.color = "var(--text-muted)"; }}>
            ≡ Bridge
          </button>
          <Tooltip title="Ontology Bridge" body="Functor alignment between two domains — structural parallels, gap nodes, loss accounting. Click to cycle pairs." anchor={alignAnchor} side="bottom" />
        </div>

        {error && <span style={{ fontSize: 10, color: "#f87171", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 10 }} title={error}>⚠ {error}</span>}

        {/* Theme toggle */}
        <button onClick={() => setTheme((t: "dark" | "light") => t === "dark" ? "light" : "dark")}
          style={{ padding: "5px 10px", background: "transparent", border: "1px solid var(--line)", color: "var(--text-quiet)", cursor: "pointer", fontSize: 13, fontFamily: '"IBM Plex Mono", monospace', transition: "border-color 0.15s, color 0.15s", outline: "none" }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = "var(--line-strong)"; b.style.color = "var(--text)"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = "var(--line)"; b.style.color = "var(--text-quiet)"; }}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? "○" : "●"}
        </button>
      </header>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Left sidebar toggle */}
        <button onClick={() => setLeftOpen(o => !o)}
          style={{
            position: "absolute", zIndex: 30,
            left: leftOpen ? leftResize.width : 0,
            top: "50%", transform: "translateY(-50%)",
            width: 8, height: 36,
            background: "var(--line)",
            border: "none", cursor: "pointer", outline: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--line)"; }}>
          <span style={{ fontSize: 7, color: "var(--bg)", fontWeight: "bold" }}>{leftOpen ? "‹" : "›"}</span>
        </button>

        {/* Left sidebar */}
        {leftOpen && (
          <aside style={{
            width: leftResize.width, flexShrink: 0,
            display: "flex", overflow: "hidden",
            borderRight: "1px solid var(--line)",
            background: "var(--bg-panel)",
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
        <main style={{ flex: 1, overflow: "hidden", padding: 8, position: "relative" }}>
          {centerView === "graph"   && <GraphCanvas           className="w-full h-full" />}
          {centerView === "city"    && <CityOverview           className="w-full h-full" />}
          {centerView === "fabric"  && <CognitionFabricView    className="w-full h-full" />}
          {centerView === "theater" && <DecisionTheaterView    className="w-full h-full" />}
        </main>

        {/* Right sidebar */}
        {rightOpen && (
          <aside style={{
            width: rightResize.width, flexShrink: 0,
            display: "flex", overflow: "hidden",
            borderLeft: "1px solid var(--line)",
            background: "var(--bg-panel)",
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
          style={{
            position: "absolute", zIndex: 30,
            right: rightOpen ? rightResize.width : 0,
            top: "50%", transform: "translateY(-50%)",
            width: 8, height: 36,
            background: "var(--line)",
            border: "none", cursor: "pointer", outline: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--line)"; }}>
          <span style={{ fontSize: 7, color: "var(--bg)", fontWeight: "bold" }}>{rightOpen ? "›" : "‹"}</span>
        </button>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        height: 22, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 20px", gap: 16,
        borderTop: "1px solid var(--line)",
        background: "var(--bg-panel)",
        overflow: "hidden",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: wsConnected ? "#22c55e" : "var(--line-strong)", flexShrink: 0 }} />
          <span style={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', color: "var(--text-quiet)" }}>
            {wsConnected ? "live" : "demo"}
          </span>
        </span>

        {selectedNode && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', color: "var(--text-quiet)", flex: 1, overflow: "hidden" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: LAYER_COLORS[selectedNode.layer as LayerKey] ?? "var(--accent)", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedNode.layer} · {selectedNode.label}
            </span>
          </span>
        )}

        <span style={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', color: "var(--text-quiet)", marginLeft: "auto", flexShrink: 0 }}>
          Omega v9
        </span>
      </footer>
    </div>
  );
}

// ── LayerBars (extracted to avoid hook-in-loop issues) ────────────────────────

function LayerBars({ breakdown }: { breakdown: { layer: LayerKey; count: number }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
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
      <div style={{
        width: 3,
        height: Math.max(2, Math.min(18, count * 2)),
        backgroundColor: LAYER_COLORS[layer],
        opacity: 0.7,
      }} />
      <Tooltip title={layer} body={`${count} nodes in the ${layer} layer`} anchor={anchor} side="bottom" />
    </div>
  );
}
