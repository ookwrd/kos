import { useState } from "react";
import { api } from "../api/client";
import { useGraphStore } from "../store/graphStore";

const PRESETS = [
  { q: "What is the CNS penetration of AMG510?", domain: "drug_discovery" },
  { q: "Should we approve this genomic data sharing agreement?", domain: "drug_discovery" },
  { q: "What is causing bridging defects in the EUV process?", domain: "euv_lithography" },
  { q: "Was the 2008 seawall decision defensible given available evidence?", domain: "fukushima_governance" },
];

const DEMO_ROUTING = [
  {
    agent: { id: "agent-oncologist-01", name: "Dr. Sarah Chen", agent_type: "human" },
    eig_score: 0.847,
    calibration: 0.84,
    competence_similarity: 0.91,
    n_dissents: 1,
    routing_reason: "Highest competence match for RAS pathway / CNS pharmacology. Track record: 2 analogous decisions with 84% calibration. 1 preserved dissent on record — relevant to current uncertainty.",
  },
  {
    agent: { id: "agent-ai-screen-01", name: "MolScreen-v2", agent_type: "ai" },
    eig_score: 0.612,
    calibration: 0.71,
    competence_similarity: 0.79,
    n_dissents: 0,
    routing_reason: "Strong ADMET prediction competence. Lower calibration than Chen but complements with computational throughput for BBB modeling variants.",
  },
];

export function InferencePanel({ className = "" }: { className?: string }) {
  const { setExpertRouting, expertRouting } = useGraphStore();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [usedDemo, setUsedDemo] = useState(false);

  const route = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setUsedDemo(false);
    try {
      const results = await api.inference.routeExpert(question.trim());
      if (results.length > 0) {
        setExpertRouting(results);
      } else {
        setExpertRouting(DEMO_ROUTING as never);
        setUsedDemo(true);
      }
    } catch {
      setExpertRouting(DEMO_ROUTING as never);
      setUsedDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const results = expertRouting.length > 0 ? expertRouting : [];

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Expert Routing</div>

        {/* Query input */}
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg px-3 py-2 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "inherit",
            }}
            placeholder="Ask a question to route to the best expert…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && route()}
          />
          <button
            onClick={route}
            disabled={loading || !question.trim()}
            className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30"
            style={{
              backgroundColor: "rgba(20,184,166,0.15)",
              color: "#2dd4bf",
              border: "1px solid rgba(20,184,166,0.3)",
            }}
          >
            {loading ? (
              <span className="w-3 h-3 block rounded-full border border-teal-400 border-t-transparent animate-spin" />
            ) : "Route"}
          </button>
        </div>

        {/* Preset queries */}
        <div className="flex flex-wrap gap-1 mt-2">
          {PRESETS.map(p => (
            <button
              key={p.q}
              onClick={() => setQuestion(p.q)}
              title={p.q}
              className="text-[9px] px-1.5 py-0.5 rounded transition-colors text-slate-600 hover:text-slate-400 truncate max-w-[140px]"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              {p.q.length > 35 ? p.q.slice(0, 33) + "…" : p.q}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {usedDemo && (
          <div className="text-[9px] text-slate-600 px-1 mb-2 italic">
            Backend unavailable — showing demo routing for drug discovery domain
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="text-2xl opacity-10">⊛</div>
            <p className="text-[11px] text-slate-600 text-center">
              Enter a question to find which expert agent will produce the highest expected information gain
            </p>
          </div>
        )}

        <div className="space-y-2">
          {results.map((r, i) => {
            const agent = r.agent as Record<string, unknown>;
            return (
              <div key={i} className="rounded-xl p-3 transition-all"
                style={{
                  backgroundColor: i === 0 ? "rgba(20,184,166,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${i === 0 ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: i === 0 ? "0 0 16px rgba(20,184,166,0.06)" : "none",
                }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.06)", color: i === 0 ? "#2dd4bf" : "#475569" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-200 truncate">
                        {String(agent?.name ?? agent?.id ?? "")}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#475569" }}>
                        {String(agent?.agent_type ?? "")}
                      </span>
                      {r.n_dissents > 0 && (
                        <span className="text-[9px] font-bold" style={{ color: "#f59e0b" }}>
                          {r.n_dissents}⚠
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono" style={{ color: i === 0 ? "#2dd4bf" : "#64748b" }}>
                      {r.eig_score.toFixed(3)}
                    </div>
                    <div className="text-[9px] text-slate-600">EIG</div>
                  </div>
                </div>

                <div className="flex gap-3 mb-2">
                  <ScorePip label="calib" value={r.calibration} />
                  <ScorePip label="competence" value={r.competence_similarity} />
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed italic">{r.routing_reason}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[9px] text-slate-600 leading-relaxed">
          Routing uses expected information gain: confidence × calibration, normalized. High-dissent agents are surfaced as epistemic signals.
        </p>
      </div>
    </div>
  );
}

function ScorePip({ label, value }: { label: string; value: number }) {
  const color = value >= 0.75 ? "#22c55e" : value >= 0.5 ? "#eab308" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5 flex-1">
      <div className="text-[9px] text-slate-600 uppercase tracking-widest">{label}</div>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>{Math.round(value * 100)}%</span>
    </div>
  );
}
