/**
 * OntologyBridgeView — visualises an AlignmentMap as a functor bridge diagram.
 *
 * Left column: source ontology nodes (coloured by mapping confidence).
 * Right column: target ontology nodes.
 * Connecting lines: mapping quality (green = EXACT, yellow = CLOSE/PARTIAL, grey = ANALOGICAL).
 * Red orphan nodes: gaps (source nodes with no mapping).
 *
 * This is the visual answer to: "Where do these two ontologies align,
 * and where do they fail to translate?"
 */

import { useMemo } from "react";
import type { AlignmentMap, OntologyMapping } from "../api/client";
import { useGraphStore } from "../store/graphStore";

const CONFIDENCE_COLORS: Record<string, string> = {
  exact:       "#22c55e",  // green
  close:       "#84cc16",  // lime
  partial:     "#eab308",  // yellow
  analogical:  "#94a3b8",  // grey
  failed:      "#ef4444",  // red
};

interface Props {
  className?: string;
}

export function OntologyBridgeView({ className = "" }: Props) {
  const { alignmentMap } = useGraphStore();

  if (!alignmentMap) {
    return (
      <div className={`flex items-center justify-center text-slate-500 text-sm p-8 ${className}`}>
        Run an alignment to see the ontology bridge.
      </div>
    );
  }

  return <BridgeDiagram map={alignmentMap} className={className} />;
}

function BridgeDiagram({ map, className }: { map: AlignmentMap; className?: string }) {
  const { mappings, gaps_source, gaps_target, coverage, structural_notes } = map;

  const mappedSourceIds = useMemo(() => new Set(mappings.map(m => m.source_node_id)), [mappings]);
  const mappedTargetIds = useMemo(() => new Set(mappings.map(m => m.target_node_id)), [mappings]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">Alignment</p>
            <p className="text-sm font-medium text-slate-100">
              {map.source_domain} → {map.target_domain}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Coverage</p>
            <p
              className="text-lg font-bold"
              style={{ color: coverage > 0.6 ? "#22c55e" : coverage > 0.4 ? "#eab308" : "#ef4444" }}
            >
              {Math.round(coverage * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Bridge diagram */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-4 min-h-full">
          {/* Source column */}
          <div className="flex-1 space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">{map.source_domain}</p>
            {mappings.map(m => (
              <MappingRow key={m.id} mapping={m} side="source" />
            ))}
            {gaps_source.map(id => (
              <GapNode key={id} id={id} />
            ))}
          </div>

          {/* Connection lines column (visual) */}
          <div className="w-8 flex flex-col items-center">
            {mappings.map(m => (
              <div
                key={m.id}
                className="w-0.5 flex-1 my-0.5"
                style={{ backgroundColor: CONFIDENCE_COLORS[m.confidence] ?? "#475569" }}
              />
            ))}
          </div>

          {/* Target column */}
          <div className="flex-1 space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">{map.target_domain}</p>
            {mappings.map(m => (
              <MappingRow key={m.id} mapping={m} side="target" />
            ))}
            {gaps_target.map(id => (
              <GapNode key={id} id={id} variant="target" />
            ))}
          </div>
        </div>
      </div>

      {/* Structural notes */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-800">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Structural notes</p>
        <p className="text-xs text-slate-300 leading-relaxed">{structural_notes}</p>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-slate-700 flex flex-wrap gap-3">
        {Object.entries(CONFIDENCE_COLORS).map(([conf, color]) => (
          <div key={conf} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-400">{conf}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MappingRow({ mapping, side }: { mapping: OntologyMapping; side: "source" | "target" }) {
  const id = side === "source" ? mapping.source_node_id : mapping.target_node_id;
  const color = CONFIDENCE_COLORS[mapping.confidence] ?? "#94a3b8";
  return (
    <div
      className="px-2 py-1 rounded text-xs text-slate-200 border truncate"
      style={{ borderColor: color, backgroundColor: `${color}18` }}
      title={mapping.structural_loss || mapping.confidence}
    >
      {id.replace(/^ent-/, "").replace(/-/g, " ")}
    </div>
  );
}

function GapNode({ id, variant = "source" }: { id: string; variant?: "source" | "target" }) {
  return (
    <div
      className="px-2 py-1 rounded text-xs text-red-300 border border-red-700 bg-red-950/40 truncate"
      title={`No ${variant === "source" ? "target" : "source"} mapping`}
    >
      ✗ {id.replace(/^ent-/, "").replace(/-/g, " ")}
    </div>
  );
}
