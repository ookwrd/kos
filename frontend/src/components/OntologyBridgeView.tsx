import type { AlignmentMap, OntologyMapping } from "../api/client";
import { useGraphStore } from "../store/graphStore";

const CONFIDENCE_COLORS: Record<string, string> = {
  exact:      "#22c55e",
  close:      "#84cc16",
  partial:    "#eab308",
  analogical: "#94a3b8",
  failed:     "#ef4444",
};

const CONFIDENCE_ICONS: Record<string, string> = {
  exact:      "≡",
  close:      "≈",
  partial:    "~",
  analogical: "∿",
  failed:     "✕",
};

const DEMO_MAP: AlignmentMap = {
  id: "align-dd-fgov",
  source_domain: "drug_discovery",
  target_domain: "fukushima_governance",
  coverage: 0.62,
  structural_notes: "Both domains feature institutional agents overriding calibrated expert dissent. The 'expert-vs-authority' tension is structurally identical. Key gap: drug_discovery has no analogue to the 'public safety obligation' node type in fukushima_governance — this represents a genuine ontological difference in who bears the liability.",
  gaps_source: ["ent-bbr-pharmacodynamics", "mech-off-target-binding"],
  gaps_target: ["inst-nra-mandate", "constraint-public-safety"],
  mappings: [
    {
      id: "m-1",
      source_node_id: "ag-trial-committee",
      target_node_id: "inst-tepco-mgmt",
      confidence: "close",
      score: 0.72,
      structural_loss: "Trial committee is epistemically accountable; TEPCO management is not.",
    },
    {
      id: "m-2",
      source_node_id: "dec-phase2-approval",
      target_node_id: "dec-seawall-2008",
      confidence: "exact",
      score: 0.95,
      structural_loss: "",
    },
    {
      id: "m-3",
      source_node_id: "dissent-chen",
      target_node_id: "dissent-tepco-eng",
      confidence: "exact",
      score: 0.91,
      structural_loss: "",
    },
    {
      id: "m-4",
      source_node_id: "constraint-bbb-threshold",
      target_node_id: "constraint-seawall-height",
      confidence: "partial",
      score: 0.55,
      structural_loss: "BBB threshold is numerical; seawall constraint has political dimensions.",
    },
    {
      id: "m-5",
      source_node_id: "goal-patient-safety",
      target_node_id: "goal-facility-safety",
      confidence: "close",
      score: 0.78,
      structural_loss: "Different horizons: patient safety is short-term; facility safety is generational.",
    },
    {
      id: "m-6",
      source_node_id: "ev-kras-binding",
      target_node_id: "ev-jogan-deposit",
      confidence: "analogical",
      score: 0.31,
      structural_loss: "Both are foundational evidence; no structural correspondence between molecular and geological data.",
    },
  ],
};

export function OntologyBridgeView({ className = "" }: { className?: string }) {
  const { alignmentMap } = useGraphStore();
  const map = alignmentMap ?? DEMO_MAP;

  return <BridgeDiagram map={map} className={className} />;
}

function BridgeDiagram({ map, className }: { map: AlignmentMap; className?: string }) {
  return <BridgeDiagramInner map={map} className={className} />;
}

function BridgeDiagramInner({ map, className }: { map: AlignmentMap; className?: string }) {
  const { mappings, gaps_source, gaps_target, coverage, structural_notes } = map;
  const coverageColor = coverage > 0.6 ? "#22c55e" : coverage > 0.4 ? "#eab308" : "#ef4444";

  const label = (id: string) => id.replace(/^(ent|dec|ag|inst|constraint|goal|ev|dissent|mech)-/, "").replace(/-/g, " ");

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Ontology Bridge</div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-blue-400">{map.source_domain.replace(/_/g, " ")}</span>
            <span className="text-[10px] text-slate-500 mx-2">⟺</span>
            <span className="text-[10px] font-semibold text-orange-400">{map.target_domain.replace(/_/g, " ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[9px] text-slate-500">coverage</div>
            <div className="text-sm font-bold font-mono" style={{ color: coverageColor }}>
              {Math.round(coverage * 100)}%
            </div>
          </div>
        </div>

        {/* Coverage bar */}
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div style={{ width: `${coverage * 100}%`, height: "100%", backgroundColor: coverageColor, transition: "width 0.5s ease" }} />
        </div>

        {/* Legend */}
        <div className="flex gap-2.5 mt-2 flex-wrap">
          {Object.entries(CONFIDENCE_COLORS).map(([conf, color]) => (
            <div key={conf} className="flex items-center gap-1">
              <span className="font-mono text-[10px]" style={{ color }}>{CONFIDENCE_ICONS[conf]}</span>
              <span className="text-[9px] text-slate-600">{conf}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bridge diagram */}
      <div className="flex-1 overflow-auto p-3">
        <div className="flex gap-2">
          {/* Source column */}
          <div className="flex-1 space-y-1.5">
            <div className="text-[9px] font-bold uppercase tracking-widest mb-2 px-1"
              style={{ color: "#3b82f6" }}>
              {map.source_domain.replace(/_/g, " ")}
            </div>
            {mappings.map(m => (
              <NodeChip
                key={`s-${m.id}`}
                label={label(m.source_node_id)}
                confidence={m.confidence}
                structuralLoss={m.structural_loss}
              />
            ))}
            {gaps_source.map(id => (
              <GapChip key={id} label={label(id)} />
            ))}
          </div>

          {/* Bridge column */}
          <div className="flex flex-col items-center gap-1.5 pt-7" style={{ width: 24 }}>
            {mappings.map(m => {
              const color = CONFIDENCE_COLORS[m.confidence] ?? "#475569";
              const icon = CONFIDENCE_ICONS[m.confidence] ?? "·";
              return (
                <div key={m.id} title={m.structural_loss ?? m.confidence}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
                  {icon}
                </div>
              );
            })}
          </div>

          {/* Target column */}
          <div className="flex-1 space-y-1.5">
            <div className="text-[9px] font-bold uppercase tracking-widest mb-2 px-1"
              style={{ color: "#f97316" }}>
              {map.target_domain.replace(/_/g, " ")}
            </div>
            {mappings.map(m => (
              <NodeChip
                key={`t-${m.id}`}
                label={label(m.target_node_id)}
                confidence={m.confidence}
                structuralLoss={m.structural_loss}
                side="target"
              />
            ))}
            {gaps_target.map(id => (
              <GapChip key={id} label={label(id)} variant="target" />
            ))}
          </div>
        </div>
      </div>

      {/* Structural notes */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Structural Notes</div>
        <p className="text-[10px] text-slate-400 leading-relaxed">{structural_notes}</p>
      </div>
    </div>
  );
}

function NodeChip({ label, confidence, structuralLoss, side = "source" }: {
  label: string;
  confidence: string;
  structuralLoss?: string;
  side?: "source" | "target";
}) {
  const color = CONFIDENCE_COLORS[confidence] ?? "#94a3b8";
  return (
    <div
      className="px-2 py-1.5 rounded-lg text-[10px] truncate transition-all"
      style={{
        backgroundColor: `${color}08`,
        border: `1px solid ${color}25`,
        color: "#cbd5e1",
        textAlign: side === "target" ? "right" : "left",
      }}
      title={structuralLoss ?? label}
    >
      {label}
    </div>
  );
}

function GapChip({ label, variant = "source" }: { label: string; variant?: "source" | "target" }) {
  return (
    <div
      className="px-2 py-1.5 rounded-lg text-[10px] truncate"
      style={{
        backgroundColor: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#fca5a5",
        textAlign: variant === "target" ? "right" : "left",
      }}
      title={`No ${variant === "source" ? "target" : "source"} mapping — ontological gap`}
    >
      ✕ {label}
    </div>
  );
}
