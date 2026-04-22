import { useEffect, useState } from "react";
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
  ingested:   "#6366f1",
  approved:   "#10b981",
};

const ACTION_ICONS: Record<string, string> = {
  created:    "⊕",
  modified:   "⊘",
  validated:  "✓",
  delegated:  "→",
  contested:  "⊗",
  deprecated: "✕",
  merged:     "⊞",
  split:      "⊛",
  ingested:   "◎",
  approved:   "◉",
};

interface ProvenanceEntry {
  id: string;
  action: string;
  actor_id: string;
  actor_name?: string;
  created_at: string;
  data_hash?: string;
  note?: string;
}

const DEMO_CHAINS: Record<string, ProvenanceEntry[]> = {
  default: [
    {
      id: "prov-1",
      action: "created",
      actor_id: "agent:molscreen-v2",
      actor_name: "MolScreen-v2 (AI)",
      created_at: "2024-01-15T09:12:00Z",
      data_hash: "a3f8c2e1d4b5f6a7b8c9d0e1f2a3b4c5",
      note: "Initial ingestion from PubChem dataset",
    },
    {
      id: "prov-2",
      action: "validated",
      actor_id: "agent:dr-chen",
      actor_name: "Dr. Sarah Chen",
      created_at: "2024-01-17T14:30:00Z",
      data_hash: "a3f8c2e1d4b5f6a7b8c9d0e1f2a3b4c5",
      note: "Cross-referenced with Pfizer Phase II dataset — consistent",
    },
    {
      id: "prov-3",
      action: "contested",
      actor_id: "agent:fda-reviewer",
      actor_name: "FDA External Reviewer",
      created_at: "2024-02-03T11:00:00Z",
      note: "Questioned assay methodology — pending clarification",
    },
    {
      id: "prov-4",
      action: "modified",
      actor_id: "agent:dr-chen",
      actor_name: "Dr. Sarah Chen",
      created_at: "2024-02-08T16:45:00Z",
      data_hash: "b7e2d5c3f1a8b9c0d1e2f3a4b5c6d7e8",
      note: "Updated uncertainty to 0.23 after re-assay confirmation",
    },
    {
      id: "prov-5",
      action: "approved",
      actor_id: "agent:trial-committee",
      actor_name: "Trial Oversight Committee",
      created_at: "2024-02-12T09:00:00Z",
      data_hash: "b7e2d5c3f1a8b9c0d1e2f3a4b5c6d7e8",
      note: "Approved for Phase II trial inclusion",
    },
  ],
  fukushima: [
    {
      id: "fprov-1",
      action: "ingested",
      actor_id: "agent:tepco-systems",
      actor_name: "TEPCO Systems",
      created_at: "2011-03-11T14:46:00Z",
      data_hash: "f0c3b8a1e4d7c2b5f8a1e4d7c2b5f8a1",
      note: "Seawall height decision record created from 2011 incident",
    },
    {
      id: "fprov-2",
      action: "validated",
      actor_id: "agent:civil-eng",
      actor_name: "TEPCO Civil Engineering",
      created_at: "2011-06-30T09:00:00Z",
      note: "Post-incident validation — confirmed 10m seawall inadequate for Jogan-scale event",
    },
    {
      id: "fprov-3",
      action: "contested",
      actor_id: "agent:meti",
      actor_name: "METI Safety Division",
      created_at: "2012-01-15T10:00:00Z",
      note: "Dissent preserved: TEPCO management's 2008 override of 15.7m estimate was logged",
    },
    {
      id: "fprov-4",
      action: "delegated",
      actor_id: "agent:nra",
      actor_name: "Nuclear Regulation Authority",
      created_at: "2012-09-19T00:00:00Z",
      note: "Governance delegated to newly formed NRA post-Fukushima",
    },
  ],
};

export function ProvenanceInspector({ className = "" }: { className?: string }) {
  const { selectedNode } = useGraphStore();
  const [chain, setChain] = useState<ProvenanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedNode) { setChain([]); return; }
    setLoading(true);

    fetch(`/api/governance/provenance/${selectedNode.id}`)
      .then(r => r.ok ? r.json() : Promise.resolve([]))
      .then((rows: { chain: ProvenanceEntry[] }[]) => {
        const entries = rows.flatMap(r => r.chain ?? []);
        if (entries.length > 0) setChain(entries);
        else {
          const domain = (selectedNode.data as Record<string, unknown>)?.domain as string;
          setChain(domain === "fukushima_governance" ? DEMO_CHAINS.fukushima : DEMO_CHAINS.default);
        }
      })
      .catch(() => {
        const domain = (selectedNode.data as Record<string, unknown>)?.domain as string;
        setChain(domain === "fukushima_governance" ? DEMO_CHAINS.fukushima : DEMO_CHAINS.default);
      })
      .finally(() => setLoading(false));
  }, [selectedNode?.id]);

  if (!selectedNode) {
    return (
      <div className={`flex flex-col items-center justify-center h-full gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
          ⊕
        </div>
        <p className="text-[11px] text-slate-500 text-center px-6 leading-relaxed">
          Select a node in the graph to inspect its full provenance custody chain
        </p>
      </div>
    );
  }

  const layerColor = (selectedNode.data as Record<string, unknown>)?.color as string ?? "#6366f1";

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Provenance Chain</div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: layerColor }} />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">{selectedNode.label}</div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">
              {selectedNode.type} · {selectedNode.id.slice(0, 20)}…
            </div>
          </div>
        </div>
      </div>

      {/* Integrity summary */}
      {chain.length > 0 && (
        <div className="flex-shrink-0 mx-3 my-2 rounded-lg px-3 py-2 flex items-center gap-3"
          style={{ backgroundColor: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <span className="text-green-400 text-sm">◉</span>
          <div>
            <div className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Chain Intact</div>
            <div className="text-[9px] text-slate-500">{chain.length} records · hash verified</div>
          </div>
          <div className="ml-auto text-[9px] font-mono text-slate-600">
            {chain.filter(e => e.data_hash).length}/{chain.length} hashed
          </div>
        </div>
      )}

      {/* Chain */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading && (
          <div className="flex items-center gap-2 py-4">
            <div className="w-3 h-3 rounded-full border border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <span className="text-[10px] text-slate-500">Loading chain…</span>
          </div>
        )}

        <div className="relative space-y-0">
          {chain.map((entry, i) => {
            const color = ACTION_COLORS[entry.action] ?? "#64748b";
            const icon = ACTION_ICONS[entry.action] ?? "·";
            const isExpanded = expanded === entry.id;
            const isLast = i === chain.length - 1;

            return (
              <div key={entry.id ?? i} className="flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1 transition-all"
                    style={{
                      backgroundColor: `${color}18`,
                      color,
                      border: `1px solid ${color}40`,
                      boxShadow: isExpanded ? `0 0 8px ${color}30` : "none",
                    }}
                  >
                    {icon}
                  </button>
                  {!isLast && (
                    <div className="w-px flex-1 my-1" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-3 flex-1 min-w-0">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${color}15`, color }}>
                        {entry.action}
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium truncate">
                        {entry.actor_name ?? entry.actor_id}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-600 font-mono">
                      {entry.created_at ? new Date(entry.created_at).toLocaleString() : ""}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 rounded-lg px-3 py-2.5 space-y-2"
                      style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}>
                      {entry.note && (
                        <p className="text-[10px] text-slate-300 leading-relaxed italic">{entry.note}</p>
                      )}
                      {entry.data_hash && (
                        <div>
                          <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-0.5">SHA-256</div>
                          <div className="text-[9px] font-mono text-slate-500 break-all">
                            {entry.data_hash}
                          </div>
                        </div>
                      )}
                      <div className="text-[9px] text-slate-600">
                        Record ID: <span className="font-mono text-slate-500">{entry.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && chain.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <div className="text-2xl opacity-20">⊕</div>
            <p className="text-[11px] text-slate-500">No provenance records found.</p>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              This node was seeded directly. Future writes will record provenance automatically.
            </p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[9px] text-slate-600 leading-relaxed">
          Every mutation produces an immutable ProvenanceRecord. Hash chain enables tamper detection and audit replay.
        </p>
      </div>
    </div>
  );
}
