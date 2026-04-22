import { useEffect, useState, useRef } from "react";
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
import { LandingView } from "./components/LandingView";
import { useGraphData, useDecisionReplay } from "./hooks/useGraphData";
import { useGraphStore, LAYER_COLORS, type LayerKey } from "./store/graphStore";
import { api } from "./api/client";

type LeftTab = "replay" | "provenance" | "tacit" | "inference";
type RightTab = "council" | "twin" | "assay" | "alignment" | "evolution" | "permissions" | "agency" | "serendipity";
type CenterView = "graph" | "city";

const LEFT_TABS: { id: LeftTab; label: string; icon: string; tip: string }[] = [
  { id: "replay",     label: "Replay",     icon: "▶", tip: "Decision trace replay" },
  { id: "provenance", label: "Provenance", icon: "⊕", tip: "Custody chain" },
  { id: "tacit",      label: "Tacit",      icon: "◎", tip: "Situated skill traces" },
  { id: "inference",  label: "Inference",  icon: "⊛", tip: "Expert routing" },
];

const RIGHT_TABS: { id: RightTab; label: string; icon: string; tip: string }[] = [
  { id: "council",      label: "Council",      icon: "◉", tip: "Agent council" },
  { id: "twin",         label: "Expert",       icon: "⊙", tip: "Expert twin view" },
  { id: "assay",        label: "Assay",        icon: "⊗", tip: "Collective belief synthesis" },
  { id: "serendipity",  label: "Discover",     icon: "⟺", tip: "Cross-domain serendipity discoveries" },
  { id: "alignment",    label: "Bridge",       icon: "≡", tip: "Ontology bridge / functor" },
  { id: "evolution",    label: "Evolution",    icon: "⊞", tip: "Graph evolution timeline" },
  { id: "permissions",  label: "Permissions",  icon: "⬡", tip: "Permission explorer" },
  { id: "agency",       label: "Agency",       icon: "⊘", tip: "Nested agency / ALife" },
];

function SidebarTabs<T extends string>({
  tabs, active, onChange, orientation = "horizontal",
}: {
  tabs: { id: T; label: string; icon: string; tip: string }[];
  active: T;
  onChange: (t: T) => void;
  orientation?: "horizontal" | "vertical";
}) {
  if (orientation === "vertical") {
    return (
      <div className="flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            title={t.tip}
            className="flex flex-col items-center justify-center py-3 px-1.5 transition-all duration-150 relative"
            style={{
              color: active === t.id ? "#e2e8f0" : "#334155",
              borderLeft: active === t.id ? "2px solid #6366f1" : "2px solid transparent",
              background: active === t.id ? "rgba(99,102,241,0.06)" : "transparent",
            }}
          >
            <span className="text-[13px] leading-none">{t.icon}</span>
            <span className="text-[7px] font-medium uppercase tracking-widest mt-1 leading-none"
              style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", letterSpacing: "0.15em" }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(2,6,16,0.7)" }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          title={t.tip}
          className="flex-1 flex flex-col items-center justify-center py-2.5 transition-all duration-150"
          style={{
            color: active === t.id ? "#e2e8f0" : "#334155",
            borderBottom: active === t.id ? "2px solid #6366f1" : "2px solid transparent",
            background: active === t.id ? "rgba(99,102,241,0.04)" : "transparent",
          }}
        >
          <span className="text-[12px] leading-none">{t.icon}</span>
          <span className="text-[8px] font-medium uppercase tracking-widest mt-0.5 leading-none">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function OmegaGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <polygon points="14,7 21,11 21,18 14,22 7,18 7,11" fill="#6366f110" stroke="#6366f1" strokeWidth="1" />
      <circle cx="14" cy="14" r="2.5" fill="#6366f1" />
    </svg>
  );
}

function AnimatedStat({ value, label, color }: { value: number | null; label: string; color?: string }) {
  const prev = useRef(0);
  const display = value ?? prev.current;
  useEffect(() => { if (value != null) prev.current = value; }, [value]);
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-bold tabular-nums font-mono" style={{ color: value ? (color ?? "#e2e8f0") : "#1e293b" }}>
        {display}
      </span>
      <span className="text-[9px] text-slate-700 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function DomainPip({ domain, active, onClick }: { domain: string; active: boolean; onClick: () => void }) {
  const COLORS: Record<string, string> = {
    drug_discovery: "#3b82f6",
    fukushima_governance: "#f97316",
    euv_lithography: "#22c55e",
  };
  const LABELS: Record<string, string> = {
    drug_discovery: "Drug",
    fukushima_governance: "Governance",
    euv_lithography: "EUV",
  };
  const color = COLORS[domain] ?? "#6366f1";
  const label = LABELS[domain] ?? domain.replace(/_/g, " ");
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-150"
      style={{
        backgroundColor: active ? `${color}18` : "rgba(255,255,255,0.02)",
        color: active ? color : "#334155",
        border: `1px solid ${active ? `${color}35` : "rgba(255,255,255,0.04)"}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, opacity: active ? 1 : 0.4 }} />
      {label}
    </button>
  );
}

export default function App() {
  const [landed, setLanded] = useState(false);
  const [leftTab, setLeftTab]   = useState<LeftTab>("replay");
  const [rightTab, setRightTab] = useState<RightTab>("council");
  const [centerView, setCenterView] = useState<CenterView>("graph");
  const [leftOpen, setLeftOpen]   = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const {
    selectedNode, overview, error, loading,
    domainFilter, setDomainFilter, liveEvents,
    setAlignmentMap,
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
      ? selectedNode.id
      : null;
  useDecisionReplay(selectedDecisionId);

  useEffect(() => {
    if (selectedDecisionId) setLeftTab("replay");
  }, [selectedDecisionId]);

  useEffect(() => {
    if (selectedNode?.layer === "agents") setRightTab("twin");
  }, [selectedNode]);

  const handleComputeAlignment = async () => {
    try {
      const map = await api.alignment.compute("drug_discovery", "euv_lithography");
      setAlignmentMap(map);
      setRightTab("alignment");
    } catch {}
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

  if (!landed) {
    return <LandingView onEnter={() => setLanded(true)} demoMode={demoMode} />;
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: "#020610", color: "#e2e8f0", userSelect: "none" }}
    >
      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-4"
        style={{
          height: 48,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(2,6,16,0.98)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <OmegaGlyph />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight text-white">Omega</span>
            <span className="text-[10px] text-slate-600">Collective Intelligence Substrate</span>
          </div>
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest"
            style={{ backgroundColor: "#6366f115", color: "#6366f1", border: "1px solid #6366f125" }}
          >
            v2
          </span>
          {demoMode && (
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest"
              style={{ backgroundColor: "#f9731615", color: "#fb923c", border: "1px solid #f9731625" }}
              title="Demo mode — no live backend"
            >
              demo
            </span>
          )}
        </div>

        {/* Domain filter */}
        {domains.length > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[8px] text-slate-700 uppercase tracking-widest">Domain</span>
            <DomainPip domain="all" active={domainFilter === null} onClick={() => setDomainFilter(null)} />
            {domains.map(d => (
              <DomainPip
                key={d}
                domain={d}
                active={domainFilter === d}
                onClick={() => setDomainFilter(domainFilter === d ? null : d)}
              />
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Center view toggle */}
        <div className="flex rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["graph", "city"] as CenterView[]).map(v => (
            <button
              key={v}
              onClick={() => setCenterView(v)}
              className="px-3 py-1 text-[10px] font-medium transition-all duration-150"
              style={{
                backgroundColor: centerView === v ? "rgba(99,102,241,0.15)" : "transparent",
                color: centerView === v ? "#818cf8" : "#334155",
              }}
            >
              {v === "graph" ? "⬡ Graph" : "⬛ City"}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {loading && (
            <div className="w-3 h-3 rounded-full border border-t-indigo-400 border-indigo-900/50 animate-spin" />
          )}
          <AnimatedStat value={totalNodes} label="nodes" />
          <AnimatedStat value={totalEdges} label="edges" />

          {/* Layer bar chart */}
          <div className="flex items-end gap-0.5 h-5">
            {layerBreakdown.map(({ layer, count }) => (
              <div
                key={layer}
                title={`${layer}: ${count}`}
                className="rounded-sm"
                style={{
                  width: 4,
                  height: Math.max(3, Math.min(20, count * 2.2)),
                  backgroundColor: LAYER_COLORS[layer],
                  opacity: 0.75,
                }}
              />
            ))}
          </div>

          <button
            onClick={handleComputeAlignment}
            className="px-2.5 py-1 text-[10px] rounded-lg font-medium transition-all duration-150"
            style={{
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#6366f1",
              backgroundColor: "rgba(99,102,241,0.06)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(99,102,241,0.15)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(99,102,241,0.06)"; }}
          >
            Align ↔
          </button>

          {error && (
            <span className="text-[10px] text-red-400 max-w-[140px] truncate" title={error}>
              ⚠ {error}
            </span>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left sidebar toggle */}
        <button
          onClick={() => setLeftOpen(o => !o)}
          className="absolute z-30 top-1/2 -translate-y-1/2 w-2.5 h-10 flex items-center justify-center rounded-r transition-all"
          style={{
            left: leftOpen ? 296 : 0,
            background: "rgba(99,102,241,0.12)",
            borderRight: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <span className="text-[8px] text-indigo-500">{leftOpen ? "‹" : "›"}</span>
        </button>

        {/* Left sidebar */}
        <aside
          className="flex-shrink-0 flex overflow-hidden transition-all duration-200"
          style={{
            width: leftOpen ? 296 : 0,
            borderRight: leftOpen ? "1px solid rgba(255,255,255,0.05)" : "none",
            background: "rgba(2,6,16,0.97)",
          }}
        >
          {leftOpen && (
            <div className="flex w-full flex-col overflow-hidden">
              <SidebarTabs tabs={LEFT_TABS} active={leftTab} onChange={setLeftTab} />
              <div className="flex-1 overflow-hidden">
                {leftTab === "replay"     && <DecisionReplay      className="h-full" />}
                {leftTab === "provenance" && <ProvenanceInspector  className="h-full" />}
                {leftTab === "tacit"      && <TacitTraceViewer     className="h-full" />}
                {leftTab === "inference"  && <InferencePanel       className="h-full" />}
              </div>
            </div>
          )}
        </aside>

        {/* Center */}
        <main className="flex-1 overflow-hidden p-2 relative">
          {centerView === "graph" ? (
            <GraphCanvas className="w-full h-full" />
          ) : (
            <CityOverview className="w-full h-full" />
          )}
        </main>

        {/* Right sidebar */}
        <aside
          className="flex-shrink-0 flex overflow-hidden transition-all duration-200"
          style={{
            width: rightOpen ? 300 : 0,
            borderLeft: rightOpen ? "1px solid rgba(255,255,255,0.05)" : "none",
            background: "rgba(2,6,16,0.97)",
          }}
        >
          {rightOpen && (
            <div className="flex w-full flex-col overflow-hidden">
              <SidebarTabs tabs={RIGHT_TABS} active={rightTab} onChange={setRightTab} />
              <div className="flex-1 overflow-hidden">
                {rightTab === "council"      && <AgentCouncilView      className="h-full" />}
                {rightTab === "twin"         && <ExpertTwinView         className="h-full" />}
                {rightTab === "assay"        && <CollectiveAssayView    className="h-full" />}
                {rightTab === "serendipity"  && <SerendipityPanel       className="h-full" />}
                {rightTab === "alignment"    && <OntologyBridgeView     className="h-full" />}
                {rightTab === "permissions"  && <PermissionExplorer     className="h-full" />}
                {rightTab === "agency"       && <NestedAgencyView       className="h-full" />}
                {rightTab === "evolution"    && <GraphEvolutionTimeline  className="h-full" />}
              </div>
            </div>
          )}
        </aside>

        {/* Right sidebar toggle */}
        <button
          onClick={() => setRightOpen(o => !o)}
          className="absolute z-30 top-1/2 -translate-y-1/2 w-2.5 h-10 flex items-center justify-center rounded-l transition-all"
          style={{
            right: rightOpen ? 300 : 0,
            background: "rgba(99,102,241,0.12)",
            borderLeft: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <span className="text-[8px] text-indigo-500">{rightOpen ? "›" : "‹"}</span>
        </button>
      </div>

      {/* ── Status bar ── */}
      <footer
        className="flex-shrink-0 flex items-center justify-between px-4 gap-4 overflow-hidden"
        style={{
          height: 26,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(2,6,16,0.99)",
        }}
      >
        {/* Live events */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "animate-pulse" : ""}`}
              style={{ backgroundColor: wsConnected ? "#22c55e" : "#ef444460" }}
            />
            <span className="text-[9px] text-slate-700">{wsConnected ? "live" : "offline"}</span>
          </span>
          {liveEvents.length > 0 && (
            <span className="text-[9px] text-slate-700 truncate">
              {String((liveEvents[0] as Record<string, unknown>)?.type ?? "event")}
            </span>
          )}
        </div>

        {/* Selected node breadcrumb */}
        {selectedNode && (
          <div className="flex items-center gap-1.5 text-[9px] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: LAYER_COLORS[selectedNode.layer as LayerKey] ?? "#94a3b8" }} />
            <span className="text-slate-600">{selectedNode.layer}</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400 max-w-[180px] truncate">{selectedNode.label}</span>
          </div>
        )}

        <div className="flex items-center gap-4 flex-shrink-0 text-[9px] text-slate-800">
          <span>Neo4j · 7 layers</span>
          <span>Omega v2.0</span>
        </div>
      </footer>
    </div>
  );
}
