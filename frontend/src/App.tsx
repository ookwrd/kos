/**
 * KOS Atlas — application shell.
 *
 * Three-column layout with collapsible sidebars, animated header stats,
 * live event feed in the status bar, and domain filter chips.
 */

import { useEffect, useState, useRef } from "react";
import { GraphCanvas } from "./components/GraphCanvas";
import { CityOverview } from "./components/CityOverview";
import { DecisionReplay } from "./components/DecisionReplay";
import { ProvenanceInspector } from "./components/ProvenanceInspector";
import { UncertaintyOverlay } from "./components/UncertaintyOverlay";
import { InferencePanel } from "./components/InferencePanel";
import { OntologyBridgeView } from "./components/OntologyBridgeView";
import { AgentCouncilView } from "./components/AgentCouncilView";
import { MechanismPathExplorer } from "./components/MechanismPathExplorer";
import { GraphEvolutionTimeline } from "./components/GraphEvolutionTimeline";
import { useGraphData, useDecisionReplay } from "./hooks/useGraphData";
import { useGraphStore, LAYER_COLORS, type LayerKey } from "./store/graphStore";
import { api } from "./api/client";

type LeftTab = "replay" | "provenance" | "uncertainty" | "inference";
type RightTab = "agents" | "mechanisms" | "alignment" | "evolution";
type CenterView = "graph" | "city";

const LEFT_TABS: { id: LeftTab; label: string; icon: string }[] = [
  { id: "replay",      label: "Replay",      icon: "▶" },
  { id: "provenance",  label: "Provenance",  icon: "⊕" },
  { id: "uncertainty", label: "Uncertainty", icon: "~" },
  { id: "inference",   label: "Inference",   icon: "⊛" },
];

const RIGHT_TABS: { id: RightTab; label: string; icon: string }[] = [
  { id: "agents",     label: "Council",    icon: "◉" },
  { id: "mechanisms", label: "Mechanisms", icon: "→" },
  { id: "alignment",  label: "Alignment",  icon: "⟺" },
  { id: "evolution",  label: "Evolution",  icon: "⊞" },
];

function SidebarTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon: string }[];
  active: T;
  onChange: (t: T) => void;
}) {
  return (
    <div
      className="flex border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(6,12,24,0.6)" }}
    >
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          title={t.label}
          className="flex-1 flex flex-col items-center justify-center py-2 transition-all duration-150 relative gap-0.5"
          style={{
            color: active === t.id ? "#f1f5f9" : "#475569",
            borderBottom: active === t.id ? "2px solid #6366f1" : "2px solid transparent",
          }}
        >
          <span className="text-[13px] leading-none">{t.icon}</span>
          <span className="text-[9px] font-medium uppercase tracking-widest leading-none">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function HexLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon
        points="14,2 25,8 25,20 14,26 3,20 3,8"
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
      />
      <polygon
        points="14,7 21,11 21,18 14,22 7,18 7,11"
        fill="#6366f130"
        stroke="#6366f1"
        strokeWidth="1"
      />
      <circle cx="14" cy="14" r="2.5" fill="#6366f1" />
    </svg>
  );
}

function AnimatedStat({ value, label }: { value: number | null; label: string }) {
  const prevRef = useRef(0);
  const displayValue = value ?? prevRef.current;
  useEffect(() => { if (value != null) prevRef.current = value; }, [value]);

  return (
    <div className="flex items-baseline gap-1">
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: value ? "#e2e8f0" : "#334155" }}
      >
        {displayValue}
      </span>
      <span className="text-[10px] text-slate-600 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function DomainChip({ domain, active, onClick }: { domain: string; active: boolean; onClick: () => void }) {
  const color = "#6366f1";
  return (
    <button
      onClick={onClick}
      className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-150"
      style={{
        backgroundColor: active ? `${color}25` : "rgba(30,41,59,0.5)",
        color: active ? color : "#475569",
        border: `1px solid ${active ? `${color}50` : "transparent"}`,
      }}
    >
      {domain.replace(/_/g, " ")}
    </button>
  );
}

function LiveDot({ connected }: { connected: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? "animate-pulse" : ""}`}
        style={{ backgroundColor: connected ? "#22c55e" : "#ef4444" }}
      />
      <span className="text-[10px] text-slate-600">{connected ? "live" : "offline"}</span>
    </span>
  );
}

export default function App() {
  const [leftTab, setLeftTab]   = useState<LeftTab>("replay");
  const [rightTab, setRightTab] = useState<RightTab>("agents");
  const [centerView, setCenterView] = useState<CenterView>("graph");
  const [leftOpen, setLeftOpen]   = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const {
    selectedNode, overview, error, loading,
    domainFilter, setDomainFilter,
    setAlignmentMap, liveEvents,
  } = useGraphStore();

  useGraphData();

  const [demoMode, setDemoMode] = useState(false);

  // Detect WS connectivity via live events
  useEffect(() => {
    if (liveEvents.length > 0) setWsConnected(true);
  }, [liveEvents]);

  // Health check — detect demo mode (no backend)
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

  const handleComputeAlignment = async () => {
    try {
      const map = await api.alignment.compute("drug_discovery", "ai_hardware");
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
    ? Object.entries(overview.layers).map(([k, v]) => ({
        layer: k as LayerKey,
        count: v.nodes.length,
      }))
    : [];

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden select-none"
      style={{ background: "#060c18", color: "#e2e8f0" }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 gap-4"
        style={{
          height: 52,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10,18,38,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <HexLogo />
          <div>
            <span className="text-sm font-bold tracking-tight text-white">KOS</span>
            <span className="ml-2 text-xs text-slate-500">Knowledge Operating System</span>
          </div>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
            style={{ backgroundColor: "#6366f120", color: "#818cf8", border: "1px solid #6366f130" }}
          >
            ACI
          </span>
          {demoMode && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={{ backgroundColor: "#f9731620", color: "#fb923c", border: "1px solid #f9731630" }}
              title="No backend connected — showing drug_discovery fixture data"
            >
              demo
            </span>
          )}
        </div>

        {/* Domain chips */}
        {domains.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-600 uppercase tracking-widest mr-1">Domain</span>
            <DomainChip
              domain="all"
              active={domainFilter === null}
              onClick={() => setDomainFilter(null)}
            />
            {domains.map(d => (
              <DomainChip
                key={d}
                domain={d}
                active={domainFilter === d}
                onClick={() => setDomainFilter(domainFilter === d ? null : d)}
              />
            ))}
          </div>
        )}

        {/* Center view toggle */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {(["graph", "city"] as CenterView[]).map(v => (
            <button
              key={v}
              onClick={() => setCenterView(v)}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: centerView === v ? "#6366f120" : "transparent",
                color: centerView === v ? "#818cf8" : "#475569",
              }}
            >
              {v === "graph" ? "⬡ Graph" : "⬛ City"}
            </button>
          ))}
        </div>

        {/* Stats + actions */}
        <div className="flex items-center gap-4">
          {loading && (
            <div
              className="w-3 h-3 rounded-full border border-t-indigo-400 border-indigo-900 animate-spin"
            />
          )}
          <AnimatedStat value={totalNodes} label="nodes" />
          <AnimatedStat value={totalEdges} label="edges" />

          {/* Layer breakdown micro-pips */}
          <div className="flex items-center gap-1">
            {layerBreakdown.map(({ layer, count }) => (
              <div
                key={layer}
                title={`${layer}: ${count}`}
                className="flex flex-col items-center gap-0.5"
              >
                <div
                  className="rounded-sm"
                  style={{
                    width: 4,
                    height: Math.max(4, Math.min(20, count * 2)),
                    backgroundColor: LAYER_COLORS[layer],
                    opacity: 0.8,
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleComputeAlignment}
            className="px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 hover:bg-indigo-500/20"
            style={{
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
              backgroundColor: "rgba(99,102,241,0.08)",
            }}
          >
            Align ↔
          </button>

          {error && (
            <span className="text-xs text-red-400 max-w-[160px] truncate" title={error}>
              ⚠ {error}
            </span>
          )}
        </div>
      </header>

      {/* ── Main layout ───────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left sidebar toggle button */}
        <button
          onClick={() => setLeftOpen(o => !o)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-3 h-12 flex items-center justify-center rounded-r transition-all duration-200 hover:opacity-100 opacity-40"
          style={{
            background: "rgba(99,102,241,0.15)",
            borderRight: "1px solid rgba(99,102,241,0.3)",
            marginLeft: leftOpen ? 280 : 0,
          }}
        >
          <span className="text-[8px] text-indigo-400">{leftOpen ? "‹" : "›"}</span>
        </button>

        {/* Left sidebar */}
        <aside
          className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-200"
          style={{
            width: leftOpen ? 280 : 0,
            borderRight: leftOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
            background: "rgba(8,14,30,0.95)",
          }}
        >
          {leftOpen && (
            <>
              <SidebarTabs tabs={LEFT_TABS} active={leftTab} onChange={setLeftTab} />
              <div className="flex-1 overflow-hidden">
                {leftTab === "replay"      && <DecisionReplay     className="h-full" />}
                {leftTab === "provenance"  && <ProvenanceInspector className="h-full" />}
                {leftTab === "uncertainty" && <UncertaintyOverlay  className="h-full" />}
                {leftTab === "inference"   && <InferencePanel      className="h-full" />}
              </div>
            </>
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
          className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-200"
          style={{
            width: rightOpen ? 280 : 0,
            borderLeft: rightOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
            background: "rgba(8,14,30,0.95)",
          }}
        >
          {rightOpen && (
            <>
              <SidebarTabs tabs={RIGHT_TABS} active={rightTab} onChange={setRightTab} />
              <div className="flex-1 overflow-hidden">
                {rightTab === "agents"     && <AgentCouncilView     className="h-full" />}
                {rightTab === "mechanisms" && <MechanismPathExplorer className="h-full" />}
                {rightTab === "alignment"  && <OntologyBridgeView   className="h-full" />}
                {rightTab === "evolution"  && <GraphEvolutionTimeline className="h-full" />}
              </div>
            </>
          )}
        </aside>

        {/* Right sidebar toggle button */}
        <button
          onClick={() => setRightOpen(o => !o)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-3 h-12 flex items-center justify-center rounded-l transition-all duration-200 hover:opacity-100 opacity-40"
          style={{
            background: "rgba(99,102,241,0.15)",
            borderLeft: "1px solid rgba(99,102,241,0.3)",
            marginRight: rightOpen ? 280 : 0,
          }}
        >
          <span className="text-[8px] text-indigo-400">{rightOpen ? "›" : "‹"}</span>
        </button>
      </div>

      {/* ── Status bar ───────────────────────────────────────── */}
      <footer
        className="flex-shrink-0 flex items-center justify-between px-4 gap-4 overflow-hidden"
        style={{
          height: 28,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(6,10,20,0.98)",
        }}
      >
        {/* Live event feed */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <LiveDot connected={wsConnected} />
          {liveEvents.length > 0 && (
            <span className="text-[10px] text-slate-600 truncate">
              {String((liveEvents[0] as Record<string, unknown>)?.type ?? "event")}
              {" — "}
              {String((liveEvents[0] as Record<string, unknown>)?.id ?? "").slice(0, 20)}
            </span>
          )}
        </div>

        {/* Selected node breadcrumb */}
        {selectedNode && (
          <div className="flex items-center gap-1.5 text-[10px] flex-shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: LAYER_COLORS[selectedNode.layer as LayerKey] ?? "#94a3b8" }}
            />
            <span className="text-slate-400">{selectedNode.layer}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 max-w-[200px] truncate">{selectedNode.label}</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-slate-700">
          <span>Neo4j · bolt://localhost:7687</span>
          <span>KOS v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}
