import { useState, useEffect } from "react";
import { api } from "../api/client";
import type { BridgeCandidate } from "../api/client";
import { useGraphStore } from "../store/graphStore";

const DOMAIN_COLORS: Record<string, string> = {
  // Governance & Safety
  fukushima_governance:                "#f97316",
  aviation_safety:                     "#94a3b8",
  pandemic_governance:                 "#a855f7",
  climate_policy:                      "#06b6d4",
  disaster_response_operations:        "#fb923c",
  public_health_coordination:          "#fbbf24",
  // Advanced Manufacturing
  euv_lithography:                     "#22c55e",
  semiconductor_hardware:              "#eab308",
  surgical_robotics:                   "#ec4899",
  industrial_quality_control:          "#84cc16",
  supply_chain_resilience:             "#0ea5e9",
  extreme_environments:                "#ef4444",
  // Discovery Science
  drug_discovery:                      "#3b82f6",
  translational_biomedicine:           "#60a5fa",
  developmental_biology_morphogenesis: "#34d399",
  causality_and_complex_systems:       "#38bdf8",
  experimental_design_and_measurement: "#818cf8",
  expert_preservation:                 "#d97706",
  // Mathematical Transfer
  mathematics_category_theory:         "#8b5cf6",
  algebraic_structures:                "#a78bfa",
  graph_theory_and_networks:           "#c084fc",
  information_theory:                  "#d946ef",
  optimization_and_control:            "#4ade80",
  scientific_model_transfer:           "#cbd5e1",
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
    source_domain: "mathematics_category_theory",
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
  {
    id: "bridge-737max-challenger",
    claim: "Boeing 737 MAX MCAS failure and Challenger O-ring failure share identical structure: incremental normalization of known risk under schedule pressure, named engineer dissents overridden, catastrophic outcome traceable to decisions already visible before the accident",
    source_domain: "aviation_safety",
    target_domain: "extreme_environments",
    source_node_ids: ["dec-mcas-single-sensor", "mech-deviance-schedule", "ag-ed-pierson"],
    target_node_ids: ["dec-challenger-launch", "dissent-boisjoly-launch"],
    confidence: 0.94,
    novelty_score: 0.88,
    structural_loss: "Challenger was a discrete launch decision; MCAS accumulated across years of design decisions. Temporal structure differs; the normalization mechanism is identical.",
  },
  {
    id: "bridge-climate-political-discount",
    claim: "COP26 'phase down' language and TEPCO seawall deferral are both instances of political time-horizon discounting: governance bodies acknowledge expert evidence then accept weaker action to preserve consensus under economic pressure",
    source_domain: "climate_policy",
    target_domain: "fukushima_governance",
    source_node_ids: ["dec-glasgow-coal-phasedown", "dissent-hayhoe-cop26", "mech-calibration-discount"],
    target_node_ids: ["dec-seawall-deferral-2008", "dissent-tepco-civil", "agent-tepco-mgmt"],
    confidence: 0.88,
    novelty_score: 0.85,
    structural_loss: "COP26 was a multilateral negotiation across 195 states; TEPCO seawall was a single corporate decision. Scale and reversibility differ by orders of magnitude. The evidence-to-policy discount pattern is structurally identical.",
  },
  {
    id: "bridge-aerosol-seawall-reporting-gap",
    claim: "WHO's delayed aerosol guidance and TEPCO's suppressed dissent share identical structure: an institutional body receives calibrated scientific evidence, delays action, and the downstream consequence is traceable to the delay decision",
    source_domain: "pandemic_governance",
    target_domain: "fukushima_governance",
    source_node_ids: ["dec-who-aerosol-guidance", "dissent-tedros-pheic-delay", "mech-reporting-delay-spread"],
    target_node_ids: ["dec-seawall-deferral-2008", "dissent-tepco-civil", "mech-org-silence-failure"],
    confidence: 0.86,
    novelty_score: 0.82,
    structural_loss: "WHO aerosol guidance was reversible within months; TEPCO seawall was locked in infrastructure for decades. The institutional delay-under-pressure mechanism is identical.",
  },
  {
    id: "bridge-pearl-fisher-causal-hierarchy",
    claim: "Judea Pearl's causal hierarchy (association → intervention → counterfactual) is structurally parallel to the KOS evidence-context-governance layer stack: both formalize the epistemic distinction between observing, acting, and reasoning about alternatives",
    source_domain: "causality_and_complex_systems",
    target_domain: "experimental_design_and_measurement",
    source_node_ids: ["mech-ghg-forcing", "ent-tipping-points"],
    target_node_ids: ["dec-trial-approval-2024", "ev-bbb-assay-results"],
    confidence: 0.78,
    novelty_score: 0.88,
    structural_loss: "Pearl's hierarchy is a formal logical structure; KOS layers encode institutional roles. The observational/interventional/counterfactual distinction maps cleanly; the governance/provenance layer has no direct Pearl analogue.",
  },
  {
    id: "bridge-functor-bench-to-bedside",
    claim: "Translational biomedicine's bench-to-bedside transfer problem is a concrete instance of the category-theoretic functor problem: mapping objects and morphisms from the 'in vitro' category to the 'in vivo' category with explicit structural loss at each step",
    source_domain: "mathematics_category_theory",
    target_domain: "translational_biomedicine",
    source_node_ids: ["ent-euv-photon", "mech-laser-plasma"],
    target_node_ids: ["ev-adagrasib-phase1", "dec-adagrasib-combination"],
    confidence: 0.81,
    novelty_score: 0.90,
    structural_loss: "Biological translation is irreversible and lossy in ways that formal functors are not required to be. The categorical framing is structurally correct but the variance in target mapping is far larger than typical mathematical applications.",
  },
  {
    id: "bridge-reed-solomon-genome-error-correction",
    claim: "Reed-Solomon error correction codes and DNA repair mechanisms both implement redundant encoding strategies to recover information under noise — the finite field algebra that defines RS codes appears to be independently instantiated by biological evolution",
    source_domain: "algebraic_structures",
    target_domain: "developmental_biology_morphogenesis",
    source_node_ids: ["ent-AMG510", "ent-cetuximab"],
    target_node_ids: ["ent-sars-cov2", "mech-aerosol-transmission"],
    confidence: 0.72,
    novelty_score: 0.93,
    structural_loss: "DNA repair is probabilistic, energy-constrained, and evolved; RS codes are exact, algebraically guaranteed, and designed. The error-recovery invariant transfers; the implementation substrate is completely different.",
  },
  {
    id: "bridge-optimal-transport-drug-delivery",
    claim: "Optimal transport (Wasserstein distance) formalizes how drug concentration distributions should move between compartments in pharmacokinetics — the same mathematical machinery that describes probability distribution movement applies directly to ADMET modeling",
    source_domain: "optimization_and_control",
    target_domain: "drug_discovery",
    source_node_ids: ["mech-ghg-forcing", "ent-tipping-points"],
    target_node_ids: ["ent-KRAS", "mech-AMG510-inhibits-KRAS"],
    confidence: 0.75,
    novelty_score: 0.87,
    structural_loss: "Pharmacokinetic compartments are biological; Wasserstein geometry is abstract. The transport formalization requires that the compartment boundary conditions be mathematically well-posed, which is not guaranteed for heterogeneous tumor microenvironments.",
  },
  {
    id: "bridge-supply-chain-incident-command",
    claim: "Supply chain resilience under shock and incident command under mass-casualty events share the same structural challenge: distributed resource allocation with partial information, competing priorities, and a single authority that must route under time pressure",
    source_domain: "supply_chain_resilience",
    target_domain: "disaster_response_operations",
    source_node_ids: ["mech-reporting-delay-spread", "ent-who-ihr"],
    target_node_ids: ["mech-org-silence-failure", "mech-authority-override"],
    confidence: 0.84,
    novelty_score: 0.76,
    structural_loss: "Supply chain shocks unfold over weeks; disaster response is measured in hours. The optimization horizon and reversibility of decisions differ significantly, though the routing-under-uncertainty mechanism is structurally identical.",
  },
  {
    id: "bridge-graph-epidemiology-network-topology",
    claim: "Network epidemiology uses the same spectral graph theory that underlies community detection algorithms — the R₀ of a disease in a network equals the dominant eigenvalue of the contact graph adjacency matrix, making graph-theoretic tools directly applicable to pandemic preparedness",
    source_domain: "graph_theory_and_networks",
    target_domain: "pandemic_governance",
    source_node_ids: ["mech-aerosol-transmission", "ent-sars-cov2"],
    target_node_ids: ["dec-who-pheic-jan30", "mech-reporting-delay-spread"],
    confidence: 0.89,
    novelty_score: 0.79,
    structural_loss: "Real contact networks are dynamic, weighted, and partially observable; mathematical spectral theory assumes static, unweighted, complete graphs. The eigenvalue-R₀ correspondence is asymptotically correct but requires strong assumptions about network stationarity.",
  },
];

const PATTERN_LABELS: Record<string, { label: string; color: string }> = {
  "bridge-deviance-normalization": { label: "Normalization of Deviance", color: "#ef4444" },
  "bridge-auth-override":          { label: "Authority Override",        color: "#f97316" },
  "bridge-tacit-skill":            { label: "Tacit Skill Transfer",      color: "#ec4899" },
  "bridge-adjunction-alignment":   { label: "Formal Grounding",          color: "#8b5cf6" },
  "bridge-calibration-decay":      { label: "Calibration Drift",         color: "#eab308" },
  "bridge-737max-challenger":      { label: "Deviance Normalization",    color: "#94a3b8" },
  "bridge-climate-political-discount":       { label: "Political Discount",        color: "#06b6d4" },
  "bridge-aerosol-seawall-reporting-gap":    { label: "Institutional Delay",       color: "#a855f7" },
  "bridge-pearl-fisher-causal-hierarchy":    { label: "Causal Ladder",             color: "#3b82f6" },
  "bridge-functor-bench-to-bedside":         { label: "Functor Transfer",          color: "#8b5cf6" },
  "bridge-reed-solomon-genome-error-correction": { label: "Redundancy Invariant", color: "#34d399" },
  "bridge-optimal-transport-drug-delivery":  { label: "Wasserstein Routing",       color: "#22c55e" },
  "bridge-supply-chain-incident-command":    { label: "Distributed Routing",       color: "#f97316" },
  "bridge-graph-epidemiology-network-topology": { label: "Spectral R₀",           color: "#ec4899" },
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

function BridgeCard({ bridge, rank, highlighted, onHighlight }: {
  bridge: BridgeCandidate; rank: number;
  highlighted: boolean;
  onHighlight: (id: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(rank === 0);
  const pattern = PATTERN_LABELS[bridge.id];
  const patternColor = pattern?.color ?? "#64748b";
  const noveltyColor = bridge.novelty_score >= 0.8 ? "#ef4444" : bridge.novelty_score >= 0.6 ? "#f97316" : "#eab308";

  const handleClick = () => {
    setExpanded(e => !e);
    onHighlight(highlighted ? null : bridge.id);
  };


  return (
    <div
      className="rounded-xl overflow-hidden transition-all cursor-pointer"
      style={{
        border: `1px solid ${highlighted ? patternColor : `${patternColor}25`}`,
        backgroundColor: highlighted ? `${patternColor}12` : rank === 0 ? `${patternColor}08` : "rgba(255,255,255,0.02)",
        boxShadow: highlighted ? `0 0 24px ${patternColor}25, inset 0 0 0 1px ${patternColor}30` : rank === 0 ? `0 0 20px ${patternColor}10` : "none",
        transition: "all 0.2s ease",
      }}
      onClick={handleClick}
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
            {/* Pattern label + highlight indicator */}
            <div className="flex items-center justify-between mb-1">
              {pattern && (
                <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: patternColor }}>
                  {pattern.label}
                </div>
              )}
              {highlighted && (
                <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${patternColor}20`, color: patternColor, border: `1px solid ${patternColor}40` }}>
                  ↗ City
                </span>
              )}
            </div>

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
  const { highlightedBridgeId, setHighlightedBridge, requestView } = useGraphStore();

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
            {sorted.length} pre-identified structural {sorted.length === 1 ? "parallel" : "parallels"}
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
          <BridgeCard
            key={bridge.id}
            bridge={bridge}
            rank={i}
            highlighted={highlightedBridgeId === bridge.id}
            onHighlight={(id) => {
              setHighlightedBridge(id);
              if (id) requestView("city");
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        {highlightedBridgeId ? (
          <p className="text-[9px] leading-relaxed" style={{ color: "#94a3b8" }}>
            Bridge highlighted in City view — switch to <strong style={{ color: "#e2e8f0" }}>⬛ City</strong> to see the arc glow.
          </p>
        ) : (
          <p className="text-[9px] text-slate-600 leading-relaxed">
            Click a bridge to highlight its arc in the City view. Pre-identified structural parallels across domain boundaries, ranked by novelty score. Algorithmic detection planned.
          </p>
        )}
      </div>
    </div>
  );
}
