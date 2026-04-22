import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { BridgeCandidate } from "../api/client";

const DOMAIN_COLORS: Record<string, string> = {
  drug_discovery:       "#3b82f6",
  fukushima_governance: "#f97316",
  euv_lithography:      "#14b8a6",
  math_category_theory: "#8b5cf6",
  surgical_robotics:    "#ec4899",
  semiconductor_hardware: "#eab308",
  extreme_environments: "#ef4444",
};

const DEMO_BRIDGES: BridgeCandidate[] = [
  {
    id: "bridge-deviance-normalization",
    claim: "Challenger O-ring acceptance and TEPCO seawall acceptance share identical decision structure: authority normalizing known risk under schedule pressure",
    source_domain: "extreme_environments",
    target_domain: "fukushima_governance",
    source_node_ids: ["dec-challenger-launch", "ent-normalization-event-oring", "dissent-boisjoly-launch"],
    target_node_ids: ["dec-seawall-2008", "dissent-tepco-eng", "inst-tepco-mgmt"],
    confidence: 0.91,
    novelty_score: 0.91,
    structural_loss: "Challenger was a discrete launch decision; TEPCO's seawall was a persistent infrastructure commitment. The authority-override-of-expert-dissent pattern is structurally identical.",
  },
  {
    id: "bridge-auth-override",
    claim: "OR Safety Committee overriding Dr. Santos's credentialing recommendation mirrors TEPCO Management overriding Civil Engineering's seawall recommendation",
    source_domain: "surgical_robotics",
    target_domain: "fukushima_governance",
    source_node_ids: ["dec-park-credentialing", "dissent-santos-credentialing", "ag-or-safety-committee"],
    target_node_ids: ["dec-seawall-2008", "dissent-tepco-eng", "inst-tepco-mgmt"],
    confidence: 0.87,
    novelty_score: 0.87,
    structural_loss: "Different stakes: surgical credentialing is reversible; the 2011 tsunami was not. Structural decision pattern identical; consequence scale differs by ~3 orders of magnitude.",
  },
  {
    id: "bridge-tacit-skill",
    claim: "Trocar entry haptic calibration and EUV pre-pulse calibration are both irreducible situated skill patterns — the same meta-skill of learning a non-verbal operational signal",
    source_domain: "surgical_robotics",
    target_domain: "euv_lithography",
    source_node_ids: ["ent-tacit-cluster-trocar", "mech-haptic-calibration"],
    target_node_ids: ["tac-prepulse-1", "ag-asml-eng"],
    confidence: 0.82,
    novelty_score: 0.82,
    structural_loss: "Physical substrate is entirely different. What transfers is the pedagogical meta-pattern, not the specific sensory content.",
  },
  {
    id: "bridge-adjunction-alignment",
    claim: "KOS AlignmentMap is a concrete instantiation of a partial functor in category-theoretic terms — the formal theory and the implementation share the same categorical structure",
    source_domain: "math_category_theory",
    target_domain: "fukushima_governance",
    source_node_ids: ["ent-functor", "ent-natural-transformation", "ent-limit"],
    target_node_ids: ["AlignmentMap", "NaturalTransformationCandidate", "GlobalGluingGap"],
    confidence: 0.91,
    novelty_score: 0.76,
    structural_loss: "KOS AlignmentMap is partial (gaps allowed); strict functors require total maps. Loss is documented in GlobalGluingGap.",
  },
  {
    id: "bridge-calibration-decay",
    claim: "Semiconductor process window drift is structurally parallel to agent calibration decay: both measure accumulated deviation from a reliable baseline that predicts imminent failure",
    source_domain: "semiconductor_hardware",
    target_domain: "drug_discovery",
    source_node_ids: ["ent-process-window", "mech-etch-uniformity-degradation"],
    target_node_ids: ["calibration_decay_mechanism"],
    confidence: 0.71,
    novelty_score: 0.74,
    structural_loss: "Process window is a physical measurement; calibration is a statistical track record. Time-series behavior (drift, cliff, sudden failure) is analogous but the underlying mechanism differs.",
  },
];

const PATTERN_LABELS: Record<string, { label: string; color: string }> = {
  "bridge-deviance-normalization": { label: "Normalization of Deviance", color: "#ef4444" },
  "bridge-auth-override":          { label: "Authority Override", color: "#f97316" },
  "bridge-tacit-skill":            { label: "Tacit Skill Transfer", color: "#ec4899" },
  "bridge-adjunction-alignment":   { label: "Formal Grounding", color: "#8b5cf6" },
  "bridge-calibration-decay":      { label: "Calibration Drift", color: "#eab308" },
};

function NoveltyBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-mono flex-shrink-0" style={{ color }}>{Math.round(value * 100)}%</span>
    </div>
  );
}

function DomainChip({ domain }: { domain: string }) {
  const color = DOMAIN_COLORS[domain] ?? "#94a3b8";
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-widest"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {domain.replace(/_/g, " ")}
    </span>
  );
}

function BridgeCard({ bridge, rank }: { bridge: BridgeCandidate; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 0);
  const pattern = PATTERN_LABELS[bridge.id];
  const patternColor = pattern?.color ?? "#64748b";
  const noveltyColor = bridge.novelty_score >= 0.8 ? "#ef4444" : bridge.novelty_score >= 0.6 ? "#f97316" : "#eab308";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all cursor-pointer"
      style={{
        border: `1px solid ${patternColor}25`,
        backgroundColor: rank === 0 ? `${patternColor}08` : "rgba(255,255,255,0.02)",
        boxShadow: rank === 0 ? `0 0 20px ${patternColor}10` : "none",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Card header */}
      <div className="px-3 py-2.5">
        <div className="flex items-start gap-2.5">
          {/* Rank */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
            style={{
              backgroundColor: rank === 0 ? `${patternColor}25` : "rgba(255,255,255,0.06)",
              color: rank === 0 ? patternColor : "#475569",
            }}
          >
            {rank + 1}
          </div>

          <div className="flex-1 min-w-0">
            {/* Pattern label */}
            {pattern && (
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: patternColor }}>
                {pattern.label}
              </div>
            )}

            {/* Domain bridge */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <DomainChip domain={bridge.source_domain} />
              <span className="text-[10px] text-slate-600">⟺</span>
              <DomainChip domain={bridge.target_domain} />
            </div>

            {/* Novelty */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-0.5">Novelty</div>
                <NoveltyBar value={bridge.novelty_score} color={noveltyColor} />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[8px] text-slate-600 uppercase tracking-widest">Confidence</div>
                <div className="text-[10px] font-mono font-bold" style={{ color: "#64748b" }}>
                  {Math.round(bridge.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2" style={{ borderTop: `1px solid ${patternColor}15` }}>
          <p className="text-[10px] text-slate-300 leading-relaxed pt-2">{bridge.claim}</p>

          {bridge.structural_loss && (
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Structural Loss</div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">{bridge.structural_loss}</p>
            </div>
          )}

          {bridge.source_node_ids.length > 0 && (
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="text-[8px] uppercase tracking-widest mb-1" style={{ color: DOMAIN_COLORS[bridge.source_domain] ?? "#94a3b8" }}>
                  Source nodes
                </div>
                <div className="flex flex-wrap gap-1">
                  {bridge.source_node_ids.slice(0, 3).map(id => (
                    <span key={id} className="text-[8px] font-mono px-1 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", color: "#475569" }}>
                      {id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[8px] uppercase tracking-widest mb-1" style={{ color: DOMAIN_COLORS[bridge.target_domain] ?? "#94a3b8" }}>
                  Target nodes
                </div>
                <div className="flex flex-wrap gap-1">
                  {bridge.target_node_ids.slice(0, 3).map(id => (
                    <span key={id} className="text-[8px] font-mono px-1 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", color: "#475569" }}>
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SerendipityPanel({ className = "" }: { className?: string }) {
  const [bridges, setBridges] = useState<BridgeCandidate[]>([]);
  const [scanning, setScanning] = useState(false);
  const [usedDemo, setUsedDemo] = useState(false);

  useEffect(() => {
    api.openendedness.bridges()
      .then(b => {
        if (b.length > 0) {
          setBridges(b);
        } else {
          setBridges(DEMO_BRIDGES);
          setUsedDemo(true);
        }
      })
      .catch(() => {
        setBridges(DEMO_BRIDGES);
        setUsedDemo(true);
      });
  }, []);

  const scan = async () => {
    setScanning(true);
    try {
      const newBridges = await api.openendedness.bridges();
      if (newBridges.length > 0) {
        setBridges(newBridges);
        setUsedDemo(false);
      }
    } catch {}
    finally { setScanning(false); }
  };

  const sorted = [...bridges].sort((a, b) => b.novelty_score - a.novelty_score);

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Cross-Domain Discoveries</div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-200">
            {sorted.length} structural {sorted.length === 1 ? "bridge" : "bridges"} found
          </div>
          <button
            onClick={scan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all disabled:opacity-40"
            style={{
              backgroundColor: "rgba(239,68,68,0.12)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            {scanning ? (
              <><span className="w-2 h-2 rounded-full border border-red-400 border-t-transparent animate-spin" /> Scanning…</>
            ) : (
              <><span>⟺</span> Scan bridges</>
            )}
          </button>
        </div>

        {/* Lead insight */}
        {sorted.length > 0 && (
          <div className="mt-2 px-2 py-1.5 rounded-lg text-[10px] text-slate-400 leading-relaxed"
            style={{ backgroundColor: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
            Highest novelty: <span className="text-slate-200 font-medium">{sorted[0].source_domain.replace(/_/g, " ")}</span>
            {" "}⟺{" "}
            <span className="text-slate-200 font-medium">{sorted[0].target_domain.replace(/_/g, " ")}</span>
            {" "}— {Math.round(sorted[0].novelty_score * 100)}% novel structural parallel
          </div>
        )}
      </div>

      {/* Bridge list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {usedDemo && (
          <div className="text-[9px] text-slate-600 px-1 mb-1 italic">
            Backend unavailable — showing pre-computed bridge candidates
          </div>
        )}

        {sorted.map((bridge, i) => (
          <BridgeCard key={bridge.id} bridge={bridge} rank={i} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[9px] text-slate-600 leading-relaxed">
          Serendipity scan detects structural isomorphisms across domain boundaries. Ranked by novelty: how unexpected is this connection given current knowledge?
        </p>
      </div>
    </div>
  );
}
