/**
 * InferencePanel — expert routing query interface.
 * Answers: "Which expert agent should we consult next?"
 */

import { useState } from "react";
import { api } from "../api/client";
import { useGraphStore } from "../store/graphStore";

interface Props {
  className?: string;
}

export function InferencePanel({ className = "" }: Props) {
  const { setExpertRouting, expertRouting } = useGraphStore();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const route = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const results = await api.inference.routeExpert(question.trim());
      setExpertRouting(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Routing failed");
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    "What is the CNS penetration of AMG510?",
    "Should we approve this genomic data sharing agreement?",
    "What is causing bridging defects in the EUV process?",
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Expert routing</p>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            placeholder="Ask a question to route to an expert…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && route()}
          />
          <button
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs rounded font-medium disabled:opacity-50"
            onClick={route}
            disabled={loading}
          >
            {loading ? "…" : "Route"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {presets.map(p => (
            <button
              key={p}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 truncate max-w-[180px]"
              onClick={() => setQuestion(p)}
              title={p}
            >
              {p.length > 30 ? p.slice(0, 28) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {error && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-800 rounded p-2 mb-3">
            {error}
          </p>
        )}
        {expertRouting.length === 0 && !loading && (
          <p className="text-slate-500 text-sm text-center py-8">
            Enter a question to find the best expert to consult.
          </p>
        )}
        {expertRouting.map((r, i) => {
          const agent = r.agent as Record<string, unknown>;
          return (
            <div key={i} className="rounded-lg border border-teal-700 bg-teal-950/30 p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-100">
                    {agent?.name as string ?? agent?.id as string}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                    {agent?.agent_type as string}
                  </span>
                </div>
                <span className="text-teal-400 text-xs font-bold">
                  EIG {r.eig_score.toFixed(3)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-400">
                <span>calibration: {Math.round(r.calibration * 100)}%</span>
                <span>competence: {Math.round(r.competence_similarity * 100)}%</span>
                {r.n_dissents > 0 && (
                  <span className="text-amber-400">{r.n_dissents} dissent(s)</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 italic">{r.routing_reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
