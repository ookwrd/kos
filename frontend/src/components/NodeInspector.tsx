/**
 * NodeInspector — detail panel for the currently selected graph node.
 * Rendered as a glass panel inside the GraphCanvas area.
 */

import { useGraphStore, LAYER_COLORS, type LayerKey } from "../store/graphStore";
import type { GraphNode } from "../api/client";

function LayerPip({ layer }: { layer: string }) {
  const color = LAYER_COLORS[layer as LayerKey] ?? "#94a3b8";
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
    />
  );
}

function DataRow({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value)
    ? (value as unknown[]).join(", ")
    : typeof value === "object"
    ? JSON.stringify(value)
    : String(value);
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-slate-300 break-words min-w-0">{display}</span>
    </div>
  );
}

function renderNodeData(node: GraphNode) {
  const d = node.data as Record<string, unknown>;
  const skip = new Set(["id", "created_at", "updated_at", "provenance", "tags"]);
  return Object.entries(d)
    .filter(([k]) => !skip.has(k))
    .slice(0, 10);
}

export function NodeInspector() {
  const { selectedNode, selectNode } = useGraphStore();
  if (!selectedNode) return null;

  const color = LAYER_COLORS[selectedNode.layer as LayerKey] ?? "#94a3b8";
  const fields = renderNodeData(selectedNode);

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[520px] max-w-[90%] rounded-xl border backdrop-blur-md"
      style={{
        backgroundColor: "rgba(10,18,38,0.92)",
        borderColor: `${color}40`,
        boxShadow: `0 0 32px ${color}20, 0 8px 32px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: `${color}30` }}>
        <LayerPip layer={selectedNode.layer} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{selectedNode.label}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{selectedNode.layer} · {selectedNode.id.slice(0, 12)}…</p>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-slate-500 hover:text-slate-300 text-lg leading-none ml-2 flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Fields */}
      <div className="px-4 py-2 grid grid-cols-1 gap-0 max-h-44 overflow-y-auto">
        {fields.map(([k, v]) => (
          <DataRow key={k} label={k.replace(/_/g, " ")} value={v} />
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-slate-500 py-2">No additional data.</p>
        )}
      </div>

      {/* Uncertainty bar if present */}
      {(selectedNode.data as Record<string, unknown>)?.uncertainty != null && (
        <div className="px-4 pb-3 pt-1">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Uncertainty</span>
            <span>{Math.round(Number((selectedNode.data as Record<string, unknown>).uncertainty) * 100)}%</span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(Number((selectedNode.data as Record<string, unknown>).uncertainty) * 100)}%`,
                backgroundColor: Number((selectedNode.data as Record<string, unknown>).uncertainty) > 0.6 ? "#ef4444" : "#eab308",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
