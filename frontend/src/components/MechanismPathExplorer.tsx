/**
 * MechanismPathExplorer — interactive causal chain finder.
 *
 * Answers: "What evidence supports this mechanism path?"
 * User types two entity labels, the component calls /api/knowledge/path
 * and renders the chain as a horizontal flow diagram with confidence scores.
 */

import { useState } from "react";
import { api } from "../api/client";

interface PathNode {
  id: string;
  label: string;
  type: string;
}

interface PathResult {
  chain: PathNode[];
  depth: number;
}

interface Props {
  className?: string;
}

export function MechanismPathExplorer({ className = "" }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paths, setPaths] = useState<PathResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const results = await api.knowledge.path(from.trim(), to.trim()) as PathResult[];
      setPaths(results);
      if (results.length === 0) setError(`No mechanism path found from '${from}' to '${to}'`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Path not found");
      setPaths([]);
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    { from: "KRAS", to: "ERK", label: "KRAS → ERK (drug discovery)" },
    { from: "EUV Scanner", to: "M0 Interconnect", label: "EUV → yield (ai_hardware)" },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Mechanism path explorer</p>

        {/* Search inputs */}
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500"
            placeholder="From entity (label or ID)"
            value={from}
            onChange={e => setFrom(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
          />
          <span className="text-slate-500 text-xs">→</span>
          <input
            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500"
            placeholder="To entity"
            value={to}
            onChange={e => setTo(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
          />
          <button
            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded font-medium disabled:opacity-50"
            onClick={search}
            disabled={loading}
          >
            {loading ? "…" : "Find"}
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {presets.map(p => (
            <button
              key={p.label}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded px-2 py-0.5"
              onClick={() => { setFrom(p.from); setTo(p.to); }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {error && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-800 rounded p-3">
            {error}
          </p>
        )}

        {paths.map((path, pi) => (
          <div key={pi} className="space-y-2">
            <p className="text-xs text-slate-400">Path {pi + 1} · depth {path.depth}</p>
            <PathChain chain={path.chain} />
          </div>
        ))}

        {paths.length === 0 && !error && !loading && (
          <p className="text-slate-500 text-sm text-center py-8">
            Enter two entity names to find the causal chain connecting them.
          </p>
        )}
      </div>
    </div>
  );
}

function PathChain({ chain }: { chain: PathNode[] }) {
  const NODE_COLORS: Record<string, string> = {
    Entity:    "#22c55e",
    Mechanism: "#3b82f6",
    default:   "#64748b",
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {chain.map((node, i) => {
        const color = NODE_COLORS[node.type] ?? NODE_COLORS.default;
        const isMech = node.type === "Mechanism";
        return (
          <div key={i} className="flex items-center gap-1">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${isMech ? "italic" : ""}`}
              style={{
                backgroundColor: `${color}22`,
                borderWidth: 1,
                borderColor: color,
                color: "#f1f5f9",
              }}
              title={node.id}
            >
              {isMech ? "⇒ " : ""}
              {node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label}
            </div>
            {i < chain.length - 1 && !isMech && (
              <span className="text-slate-600 text-xs">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
