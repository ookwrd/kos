/**
 * ProvenanceInspector — renders the custody chain for a selected node.
 *
 * Shows the full ProvenanceRecord chain: who created/modified/validated
 * the node, in chronological order, with data hash for tamper detection.
 */

import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useGraphStore } from "../store/graphStore";

const ACTION_COLORS: Record<string, string> = {
  created:    "#22c55e",
  modified:   "#3b82f6",
  validated:  "#a855f7",
  delegated:  "#14b8a6",
  contested:  "#f97316",
  deprecated: "#ef4444",
  merged:     "#eab308",
  split:      "#06b6d4",
};

interface ProvenanceEntry {
  id: string;
  action: string;
  actor_id: string;
  created_at: string;
  data_hash?: string;
  note?: string;
}

interface Props {
  className?: string;
}

export function ProvenanceInspector({ className = "" }: Props) {
  const { selectedNode } = useGraphStore();
  const [chain, setChain] = useState<ProvenanceEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedNode) { setChain([]); return; }
    setLoading(true);
    // Use the governance provenance chain endpoint
    fetch(`/api/governance/provenance/${selectedNode.id}`)
      .then(r => r.ok ? r.json() : Promise.resolve([]))
      .then((rows: { chain: ProvenanceEntry[] }[]) => {
        // Flatten chain entries from all paths
        const entries: ProvenanceEntry[] = rows.flatMap(r => r.chain ?? []);
        setChain(entries);
      })
      .catch(() => setChain([]))
      .finally(() => setLoading(false));
  }, [selectedNode?.id]);

  if (!selectedNode) {
    return (
      <div className={`flex items-center justify-center text-slate-500 text-sm p-8 ${className}`}>
        Select a node to inspect its provenance.
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Provenance chain</p>
        <p className="text-sm font-medium text-slate-100 truncate">{selectedNode.label}</p>
        <p className="text-xs text-slate-400">{selectedNode.type} · {selectedNode.id}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && <p className="text-slate-500 text-sm">Loading…</p>}

        {!loading && chain.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">No provenance records found.</p>
            <p className="text-slate-600 text-xs mt-1">
              This node was seeded directly. Future writes will record provenance automatically.
            </p>
          </div>
        )}

        <div className="relative space-y-0">
          {chain.map((entry, i) => {
            const color = ACTION_COLORS[entry.action] ?? "#64748b";
            return (
              <div key={entry.id ?? i} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: color }}
                  />
                  {i < chain.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-700 my-1" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      {entry.action}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{entry.actor_id}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {entry.created_at ? new Date(entry.created_at).toLocaleString() : ""}
                  </p>
                  {entry.note && (
                    <p className="text-xs text-slate-400 mt-1 italic">{entry.note}</p>
                  )}
                  {entry.data_hash && (
                    <p className="text-xs text-slate-600 mt-1 font-mono truncate" title={entry.data_hash}>
                      sha256: {entry.data_hash.slice(0, 16)}…
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
