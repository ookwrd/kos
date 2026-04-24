import { useState, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ConceptType = "mechanism" | "concept" | "invariant" | "theorem" | "schema" | "instance" | "translator" | "validation_protocol" | "counterexample";

interface AtlasConcept {
  id: string;
  label: string;
  concept_type: ConceptType;
  domain: string;
  abstraction_level: number;    // Y: 0=concrete, 1=fully abstract
  substrate_distance: number;   // X: 0=near physical, 1=symbolic
  transferability: number;      // size
  description: string;
  invariants?: string[];
  instantiated_in?: string[];   // domain ids
  related?: string[];           // concept ids
  codifiability?: number;
}

interface AtlasEdge {
  source: string;
  target: string;
  type: "explains" | "instantiates" | "transfers_via" | "depends_on";
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  euv_lithography:        "#22c55e",
  surgical_robotics:      "#ec4899",
  drug_discovery:         "#3b82f6",
  climate_policy:         "#06b6d4",
  fukushima_governance:   "#f97316",
  aviation_safety:        "#94a3b8",
  extreme_environments:   "#ef4444",
  pandemic_governance:    "#a855f7",
  mathematics_category_theory:   "#8b5cf6",
  cross:                  "#818cf8",
  physics:                "#06b6d4",
  control_theory:         "#22c55e",
  information_theory:     "#8b5cf6",
};

const TYPE_SHAPE: Record<ConceptType, string> = {
  mechanism:           "○",
  concept:             "◆",
  invariant:           "★",
  theorem:             "▲",
  schema:              "■",
  instance:            "·",
  translator:          "⟺",
  validation_protocol: "✓",
  counterexample:      "✕",
};

const TYPE_LABEL: Record<ConceptType, string> = {
  mechanism:           "Mechanism",
  concept:             "Concept",
  invariant:           "Invariant",
  theorem:             "Theorem",
  schema:              "Schema",
  instance:            "Instance",
  translator:          "Translator",
  validation_protocol: "Validation",
  counterexample:      "Counterexample",
};

const DEMO_CONCEPTS: AtlasConcept[] = [
  // ── Theorems / Invariants (top-right) ────────────────────────────────────
  {
    id: "concept-functor",
    label: "Functor",
    concept_type: "theorem",
    domain: "mathematics_category_theory",
    abstraction_level: 0.97, substrate_distance: 0.97, transferability: 1.0,
    description: "A structure-preserving map between categories. Maps objects to objects and morphisms to morphisms, preserving composition and identities.",
    invariants: ["composition preservation", "identity preservation"],
    instantiated_in: ["knowledge_graph", "database_migration", "ontology_alignment"],
    codifiability: 0.99,
  },
  {
    id: "concept-entropy",
    label: "Entropy",
    concept_type: "invariant",
    domain: "cross",
    abstraction_level: 0.92, substrate_distance: 0.88, transferability: 0.95,
    description: "H = -Σ p log p. Substrate-independent measure of uncertainty over a probability distribution.",
    invariants: ["additivity", "maximum at uniform distribution", "monotone coarse-graining"],
    instantiated_in: ["physics", "information_theory", "biology"],
    related: ["concept-boltzmann-entropy", "concept-shannon-entropy"],
    codifiability: 0.98,
  },
  {
    id: "concept-noether",
    label: "Noether's Theorem",
    concept_type: "theorem",
    domain: "physics",
    abstraction_level: 0.95, substrate_distance: 0.90, transferability: 0.88,
    description: "Every continuous symmetry of a physical system's action has a corresponding conserved quantity.",
    invariants: ["symmetry → conservation", "Lie group structure"],
    codifiability: 0.97,
  },
  {
    id: "concept-nyquist",
    label: "Nyquist Stability",
    concept_type: "theorem",
    domain: "control_theory",
    abstraction_level: 0.88, substrate_distance: 0.80, transferability: 0.90,
    description: "A closed-loop feedback system is stable if and only if the open-loop gain is less than 1 at the phase-crossover frequency.",
    invariants: ["stability under delay", "gain-phase relationship"],
    codifiability: 0.96,
  },
  {
    id: "concept-natural-transformation",
    label: "Natural Transformation",
    concept_type: "theorem",
    domain: "mathematics_category_theory",
    abstraction_level: 0.98, substrate_distance: 0.99, transferability: 0.98,
    description: "A morphism between functors. Encodes when two different translations between the same domains are systematically comparable.",
    invariants: ["naturality square", "component morphisms"],
    codifiability: 0.99,
  },
  {
    id: "concept-adjunction",
    label: "Adjunction",
    concept_type: "invariant",
    domain: "mathematics_category_theory",
    abstraction_level: 0.96, substrate_distance: 0.98, transferability: 0.95,
    description: "F ⊣ G: a pair of functors where abstraction (F) and concretization (G) form a lawful two-way interface.",
    invariants: ["unit/counit", "hom-set bijection", "universal property"],
    codifiability: 0.99,
  },

  // ── Cross-domain concepts (mid-high abstraction) ──────────────────────────
  {
    id: "concept-delayed-feedback",
    label: "Delayed Feedback Correction",
    concept_type: "concept",
    domain: "cross",
    abstraction_level: 0.65, substrate_distance: 0.55, transferability: 0.82,
    description: "System drifts during feedback latency. Correction must compensate for accumulated drift, not just instantaneous error.",
    invariants: ["feedback loop", "drift accumulation", "compensatory overshoot"],
    instantiated_in: ["euv_lithography", "surgical_robotics"],
    related: ["concept-nyquist"],
    codifiability: 0.58,
  },
  {
    id: "concept-calibration-decay",
    label: "Calibration Decay",
    concept_type: "schema",
    domain: "cross",
    abstraction_level: 0.62, substrate_distance: 0.38, transferability: 0.88,
    description: "An expert's prediction accuracy declines over time when feedback loops are absent or when authority replaces accountability.",
    invariants: ["track record divergence", "prediction-outcome gap"],
    instantiated_in: ["fukushima_governance", "aviation_safety", "drug_discovery"],
    codifiability: 0.70,
  },
  {
    id: "concept-threshold-gate",
    label: "Threshold Gate",
    concept_type: "concept",
    domain: "cross",
    abstraction_level: 0.60, substrate_distance: 0.42, transferability: 0.78,
    description: "A binary decision rule over a continuous measurement. Creates cliff-edge governance dynamics when uncertainty is high near the threshold.",
    invariants: ["threshold value", "binary outcome", "cliff-edge uncertainty"],
    instantiated_in: ["drug_discovery", "climate_policy", "fukushima_governance"],
    codifiability: 0.72,
  },
  {
    id: "schema-auth-override",
    label: "Authority Override of Calibrated Dissent",
    concept_type: "schema",
    domain: "cross",
    abstraction_level: 0.72, substrate_distance: 0.40, transferability: 0.91,
    description: "Expert with high track record raises specific safety concern. Authority with lower track record overrides. Dissent is not recorded. Catastrophic outcome occurs.",
    invariants: ["expert dissent", "authority override", "suppression", "catastrophic vindication"],
    instantiated_in: ["extreme_environments", "fukushima_governance", "aviation_safety"],
    codifiability: 0.74,
  },
  {
    id: "concept-partial-functor",
    label: "Partial Functor (AlignmentMap)",
    concept_type: "translator",
    domain: "cross",
    abstraction_level: 0.82, substrate_distance: 0.75, transferability: 0.85,
    description: "A functor that maps some objects and morphisms between domains, with explicit documentation of what is unmapped (structural loss).",
    invariants: ["partial coverage", "explicit gap documentation"],
    instantiated_in: ["drug_discovery→fukushima", "euv_lithography→surgical_robotics"],
    codifiability: 0.90,
  },
  {
    id: "concept-normalization-deviance",
    label: "Normalization of Deviance",
    concept_type: "schema",
    domain: "cross",
    abstraction_level: 0.68, substrate_distance: 0.35, transferability: 0.85,
    description: "Small boundary violations are accepted without incident → repeated → rationalized → inevitable catastrophic failure.",
    invariants: ["incremental acceptance", "ratchet of tolerance", "cliff failure"],
    instantiated_in: ["extreme_environments", "aviation_safety"],
    codifiability: 0.75,
  },
  {
    id: "concept-tacit-calibration",
    label: "Tacit Calibration",
    concept_type: "concept",
    domain: "cross",
    abstraction_level: 0.45, substrate_distance: 0.28, transferability: 0.40,
    description: "A domain expert's ability to read alignment signals that cannot be reduced to written protocol. Acquired through embodied practice over years.",
    invariants: ["embodied exposure", "non-transferable by description", "practice-dependent"],
    instantiated_in: ["euv_lithography", "surgical_robotics"],
    codifiability: 0.08,
  },

  // ── Domain-specific mechanisms (low abstraction) ──────────────────────────
  {
    id: "mech-asml-prepulse",
    label: "ASML Pre-pulse Step 6",
    concept_type: "instance",
    domain: "euv_lithography",
    abstraction_level: 0.08, substrate_distance: 0.12, transferability: 0.10,
    description: "The specific calibration judgment that adjusts pulse width at step 6 based on droplet camera image — codifiability 0.05.",
    codifiability: 0.05,
  },
  {
    id: "mech-bbb-threshold",
    label: "BBB Penetration Threshold 0.40",
    concept_type: "instance",
    domain: "drug_discovery",
    abstraction_level: 0.12, substrate_distance: 0.25, transferability: 0.12,
    description: "The CNS safety gate: P:C ratio must exceed 0.40 for CNS drug candidates. Rationale held by Dr. Sarah Chen.",
    codifiability: 0.65,
  },
  {
    id: "mech-trocar-haptic",
    label: "Trocar Haptic Entry Signal",
    concept_type: "instance",
    domain: "surgical_robotics",
    abstraction_level: 0.10, substrate_distance: 0.10, transferability: 0.08,
    description: "The tactile signature of safe trocar entry — experienced surgeons recognize it; da Vinci haptic feedback provides limited proxy.",
    codifiability: 0.08,
  },
  {
    id: "mech-tepco-seawall",
    label: "TEPCO Seawall 10m Decision",
    concept_type: "instance",
    domain: "fukushima_governance",
    abstraction_level: 0.15, substrate_distance: 0.18, transferability: 0.05,
    description: "The 2008 decision to defer raising the seawall from 10m to 14m. Civil engineering dissent suppressed.",
    codifiability: 0.82,
  },
  {
    id: "mech-boisjoly-warning",
    label: "Boisjoly O-ring Warning",
    concept_type: "instance",
    domain: "extreme_environments",
    abstraction_level: 0.18, substrate_distance: 0.22, transferability: 0.05,
    description: "Roger Boisjoly's July 31, 1985 memo warning about O-ring cold-weather failure. Overruled. Challenger failed Jan 28, 1986.",
    codifiability: 0.90,
  },
  {
    id: "mech-shannon-entropy",
    label: "Shannon Entropy H = -Σ p log p",
    concept_type: "mechanism",
    domain: "information_theory",
    abstraction_level: 0.88, substrate_distance: 0.92, transferability: 0.95,
    description: "The information entropy formula. Formally identical to Boltzmann entropy but applied to message source statistics.",
    codifiability: 0.99,
    related: ["concept-entropy"],
  },
  {
    id: "mech-pierson-mcas",
    label: "Ed Pierson MCAS Warning",
    concept_type: "instance",
    domain: "aviation_safety",
    abstraction_level: 0.18, substrate_distance: 0.20, transferability: 0.05,
    description: "Boeing senior manager's 2018 production-floor safety concerns about MCAS single-sensor design. Overruled.",
    codifiability: 0.88,
  },
];

const DEMO_EDGES: AtlasEdge[] = [
  { source: "concept-delayed-feedback",    target: "mech-asml-prepulse",        type: "explains" },
  { source: "concept-delayed-feedback",    target: "mech-trocar-haptic",         type: "instantiates" },
  { source: "concept-delayed-feedback",    target: "concept-nyquist",            type: "depends_on" },
  { source: "concept-entropy",             target: "mech-shannon-entropy",       type: "instantiates" },
  { source: "concept-tacit-calibration",   target: "mech-asml-prepulse",        type: "explains" },
  { source: "concept-tacit-calibration",   target: "mech-trocar-haptic",        type: "explains" },
  { source: "schema-auth-override",        target: "mech-tepco-seawall",        type: "explains" },
  { source: "schema-auth-override",        target: "mech-boisjoly-warning",     type: "explains" },
  { source: "schema-auth-override",        target: "mech-pierson-mcas",         type: "explains" },
  { source: "concept-normalization-deviance", target: "schema-auth-override",   type: "depends_on" },
  { source: "concept-threshold-gate",      target: "mech-bbb-threshold",        type: "explains" },
  { source: "concept-partial-functor",     target: "concept-functor",           type: "depends_on" },
  { source: "concept-adjunction",          target: "concept-functor",           type: "depends_on" },
  { source: "concept-natural-transformation", target: "concept-functor",        type: "depends_on" },
];

// ── Component ─────────────────────────────────────────────────────────────────

const CANVAS_W = 680;
const CANVAS_H = 520;
const PAD = 48;

function conceptPos(c: AtlasConcept): [number, number] {
  // X = substrate_distance (0=left, 1=right)
  // Y = abstraction_level (0=bottom, 1=top)
  const x = PAD + c.substrate_distance * (CANVAS_W - PAD * 2);
  const y = CANVAS_H - PAD - c.abstraction_level * (CANVAS_H - PAD * 2);
  return [x, y];
}

function conceptRadius(c: AtlasConcept): number {
  return 5 + c.transferability * 10;
}

export function ConceptAtlasView({ className = "" }: { className?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ConceptType | null>(null);
  const [filterDomain, setFilterDomain] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const selected = DEMO_CONCEPTS.find(c => c.id === selectedId);

  const visibleConcepts = DEMO_CONCEPTS.filter(c =>
    (!filterType || c.concept_type === filterType) &&
    (!filterDomain || c.domain === filterDomain || c.domain === "cross")
  );
  const visibleIds = new Set(visibleConcepts.map(c => c.id));

  const handleNodeClick = useCallback((id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const domains = [...new Set(DEMO_CONCEPTS.map(c => c.domain).filter(d => d !== "cross"))];

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Concept Atlas · Abstraction Geometry</div>
        <div className="text-xs font-semibold text-slate-200 mb-2">Concepts placed by abstraction level (Y) × substrate distance (X)</div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Type filter */}
          <div className="flex gap-1 flex-wrap">
            {(["concept", "invariant", "theorem", "schema", "instance"] as ConceptType[]).map(t => (
              <button key={t} onClick={() => setFilterType(filterType === t ? null : t)}
                className="px-1.5 py-0.5 rounded text-[8px] font-semibold transition-all"
                style={{
                  backgroundColor: filterType === t ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${filterType === t ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: filterType === t ? "#818cf8" : "#475569",
                }}>
                {TYPE_SHAPE[t]} {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main area: Atlas + Inspector side by side */}
      <div className="flex flex-1 overflow-hidden">

        {/* SVG Atlas */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            style={{ cursor: "default" }}
          >
            <defs>
              <filter id="glow-node">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Axis grid */}
            {[0.25, 0.5, 0.75].map(t => (
              <g key={t}>
                <line x1={PAD + t * (CANVAS_W - PAD*2)} y1={PAD} x2={PAD + t * (CANVAS_W - PAD*2)} y2={CANVAS_H - PAD}
                  stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={PAD} y1={CANVAS_H - PAD - t * (CANVAS_H - PAD*2)} x2={CANVAS_W - PAD} y2={CANVAS_H - PAD - t * (CANVAS_H - PAD*2)}
                  stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="4 4" />
              </g>
            ))}

            {/* Axis labels */}
            <text x={PAD} y={CANVAS_H - 10} fill="#1e293b" fontSize={9} fontFamily="monospace">← near substrate / embodied</text>
            <text x={CANVAS_W - PAD} y={CANVAS_H - 10} fill="#1e293b" fontSize={9} fontFamily="monospace" textAnchor="end">symbolic / mathematical →</text>
            <text x={12} y={CANVAS_H - PAD} fill="#1e293b" fontSize={9} fontFamily="monospace" transform={`rotate(-90, 12, ${CANVAS_H - PAD})`} textAnchor="end">concrete ↓</text>
            <text x={12} y={PAD + 8} fill="#1e293b" fontSize={9} fontFamily="monospace" transform={`rotate(-90, 12, ${PAD + 8})`} textAnchor="end">theorem ↑</text>

            {/* Zone labels */}
            <text x={PAD + 8} y={PAD + 16} fill="rgba(239,68,68,0.12)" fontSize={11} fontWeight={600}>Instance / Procedure</text>
            <text x={CANVAS_W - PAD - 8} y={PAD + 16} fill="rgba(139,92,246,0.18)" fontSize={11} fontWeight={600} textAnchor="end">Theorem / Invariant</text>
            <text x={(CANVAS_W) / 2} y={(CANVAS_H) / 2 - 8} fill="rgba(129,140,248,0.12)" fontSize={14} fontWeight={700} textAnchor="middle">TRANSFER ZONE</text>

            {/* Edges */}
            {DEMO_EDGES.map((edge, i) => {
              const src = DEMO_CONCEPTS.find(c => c.id === edge.source);
              const tgt = DEMO_CONCEPTS.find(c => c.id === edge.target);
              if (!src || !tgt) return null;
              if (!visibleIds.has(src.id) || !visibleIds.has(tgt.id)) return null;
              const [sx, sy] = conceptPos(src);
              const [tx, ty] = conceptPos(tgt);
              const isRelated = selectedId === edge.source || selectedId === edge.target;
              const edgeColor = edge.type === "transfers_via" ? "#818cf8" : edge.type === "explains" ? "#22c55e" : edge.type === "instantiates" ? "#ec4899" : "#475569";
              return (
                <line key={i}
                  x1={sx} y1={sy} x2={tx} y2={ty}
                  stroke={edgeColor}
                  strokeWidth={isRelated ? 1.2 : 0.6}
                  strokeDasharray={edge.type === "depends_on" ? "4 3" : "none"}
                  opacity={isRelated ? 0.7 : 0.18}
                />
              );
            })}

            {/* Nodes */}
            {visibleConcepts.map(c => {
              const [x, y] = conceptPos(c);
              const r = conceptRadius(c);
              const color = DOMAIN_COLORS[c.domain] ?? "#6366f1";
              const isSelected = selectedId === c.id;
              const isHovered = hoveredId === c.id;
              const dimmed = (selectedId || filterType || filterDomain) && !isSelected;

              return (
                <g key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNodeClick(c.id)}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  filter={isSelected || isHovered ? "url(#glow-node)" : undefined}
                  opacity={dimmed ? 0.25 : 1}
                >
                  {/* Node shape based on type */}
                  {c.concept_type === "theorem" || c.concept_type === "invariant" ? (
                    <polygon
                      points={`${x},${y - r * 1.2} ${x + r},${y + r * 0.6} ${x - r},${y + r * 0.6}`}
                      fill={`${color}22`}
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                  ) : c.concept_type === "schema" ? (
                    <rect
                      x={x - r * 0.8} y={y - r * 0.8} width={r * 1.6} height={r * 1.6}
                      fill={`${color}18`}
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                  ) : c.concept_type === "instance" ? (
                    <circle cx={x} cy={y} r={r * 0.6}
                      fill={`${color}30`}
                      stroke={color}
                      strokeWidth={0.8}
                      strokeDasharray="2 2"
                    />
                  ) : (
                    <circle cx={x} cy={y} r={r}
                      fill={`${color}18`}
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                  )}

                  {/* Label */}
                  <text
                    x={x} y={y - r - 4}
                    fill={isSelected ? color : "rgba(148,163,184,0.7)"}
                    fontSize={c.concept_type === "instance" ? 7.5 : 8.5}
                    fontFamily="system-ui, sans-serif"
                    fontWeight={isSelected ? 600 : 400}
                    textAnchor="middle"
                  >
                    {c.label.length > 22 ? c.label.slice(0, 20) + "…" : c.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex flex-col gap-1">
            {(["theorem", "invariant", "concept", "schema", "instance"] as ConceptType[]).map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="text-[9px]" style={{ color: "rgba(100,116,139,0.7)" }}>{TYPE_SHAPE[t]}</span>
                <span className="text-[8px]" style={{ color: "rgba(71,85,105,0.8)" }}>{TYPE_LABEL[t]}</span>
              </div>
            ))}
            <div className="mt-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5"><div className="w-5 border-t border-green-500/40" /><span className="text-[8px] text-slate-700">explains</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 border-t border-pink-500/40" /><span className="text-[8px] text-slate-700">instantiates</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 border-t border-slate-600/40 border-dashed" /><span className="text-[8px] text-slate-700">depends on</span></div>
            </div>
          </div>
        </div>

        {/* Inspector panel */}
        <div className="w-56 flex-shrink-0 overflow-y-auto" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          {selected ? (
            <div className="p-3 space-y-3">
              <div>
                <div className="text-[8px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: DOMAIN_COLORS[selected.domain] ?? "#818cf8" }}>
                  {TYPE_LABEL[selected.concept_type]} · {selected.domain.replace(/_/g, " ")}
                </div>
                <div className="text-[11px] font-semibold text-slate-200 leading-snug">{selected.label}</div>
              </div>

              <p className="text-[9px] text-slate-500 leading-relaxed">{selected.description}</p>

              {/* Geometry metrics */}
              <div className="space-y-1.5">
                {[
                  ["Abstraction level", selected.abstraction_level],
                  ["Substrate distance", selected.substrate_distance],
                  ["Transferability", selected.transferability],
                  ...(selected.codifiability !== undefined ? [["Codifiability", selected.codifiability]] : []),
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[8px] text-slate-600">{label as string}</span>
                      <span className="text-[8px] font-mono text-slate-500">{(val as number).toFixed(2)}</span>
                    </div>
                    <div className="h-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${(val as number) * 100}%`, backgroundColor: DOMAIN_COLORS[selected.domain] ?? "#6366f1", opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Invariants */}
              {selected.invariants && selected.invariants.length > 0 && (
                <div>
                  <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Preserved invariants</div>
                  {selected.invariants.map((inv, i) => (
                    <div key={i} className="text-[8px] text-green-500/70 mb-0.5">• {inv}</div>
                  ))}
                </div>
              )}

              {/* Instantiated in */}
              {selected.instantiated_in && selected.instantiated_in.length > 0 && (
                <div>
                  <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Instantiated in</div>
                  {selected.instantiated_in.map((dom, i) => (
                    <div key={i} className="text-[8px] text-slate-500 mb-0.5">• {dom.replace(/_/g, " ")}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3">
              <div className="text-[9px] text-slate-600 italic text-center mt-8">
                Click a concept to inspect its geometry, invariants, and domain instantiations
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-[8px] text-slate-700 text-center">Y axis: abstraction level</div>
                <div className="text-[8px] text-slate-700 text-center">X axis: substrate distance</div>
                <div className="text-[8px] text-slate-700 text-center">Size: transferability</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
