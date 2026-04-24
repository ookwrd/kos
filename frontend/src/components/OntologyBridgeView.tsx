import { useState } from "react";
import type { AlignmentMap } from "../api/client";
import { useGraphStore } from "../store/graphStore";

const CONFIDENCE_COLORS: Record<string, string> = {
  exact:      "#22c55e",
  close:      "#84cc16",
  partial:    "#eab308",
  analogical: "#94a3b8",
  failed:     "#ef4444",
};

const CONFIDENCE_ICONS: Record<string, string> = {
  exact:      "≡",
  close:      "≈",
  partial:    "~",
  analogical: "∿",
  failed:     "✕",
};

const DOMAIN_COLORS: Record<string, string> = {
  drug_discovery:                      "#3b82f6",
  fukushima_governance:                "#f97316",
  extreme_environments:                "#ef4444",
  climate_policy:                      "#06b6d4",
  aviation_safety:                     "#94a3b8",
  pandemic_governance:                 "#a855f7",
  surgical_robotics:                   "#ec4899",
  euv_lithography:                     "#22c55e",
  semiconductor_hardware:              "#eab308",
  mathematics_category_theory:         "#8b5cf6",
  information_theory:                  "#d946ef",
  optimization_and_control:            "#4ade80",
  graph_theory_and_networks:           "#c084fc",
  algebraic_structures:                "#a78bfa",
  translational_biomedicine:           "#60a5fa",
  developmental_biology_morphogenesis: "#34d399",
  causality_and_complex_systems:       "#38bdf8",
  expert_preservation:                 "#d97706",
  industrial_quality_control:          "#84cc16",
  supply_chain_resilience:             "#0ea5e9",
  disaster_response_operations:        "#fb923c",
  public_health_coordination:          "#fbbf24",
  experimental_design_and_measurement: "#818cf8",
  scientific_model_transfer:           "#cbd5e1",
};

// ── 7 demo alignment maps covering all major domain pairs ─────────────────────

const DEMO_MAPS: AlignmentMap[] = [
  // 1. Drug discovery ↔ Fukushima governance (expert-authority override)
  {
    id: "align-dd-fgov",
    source_domain: "drug_discovery",
    target_domain: "fukushima_governance",
    coverage: 0.62,
    structural_notes:
      "Both domains feature institutional agents systematically overriding calibrated expert dissent. The 'expert-vs-authority' tension is structurally identical: a safety-critical threshold is defined by evidence, contested by an agent with authority, and overridden without documented rationale. Key gap: drug_discovery has no analogue to the 'public safety obligation' node in fukushima_governance — this represents a genuine ontological difference in who bears liability for catastrophic outcomes.",
    gaps_source: ["ent-bbr-pharmacodynamics", "mech-off-target-binding"],
    gaps_target: ["inst-nra-mandate", "constraint-public-safety-obligation"],
    mappings: [
      { id: "m-1", source_node_id: "ag-trial-committee",    target_node_id: "inst-tepco-mgmt",       confidence: "close",      score: 0.72, structural_loss: "Trial committee is epistemically accountable; TEPCO management is insulated from epistemic feedback by hierarchy." },
      { id: "m-2", source_node_id: "dec-phase2-approval",   target_node_id: "dec-seawall-2008",      confidence: "exact",      score: 0.95, structural_loss: "" },
      { id: "m-3", source_node_id: "dissent-chen",          target_node_id: "dissent-tepco-eng",     confidence: "exact",      score: 0.91, structural_loss: "" },
      { id: "m-4", source_node_id: "constraint-bbb-threshold", target_node_id: "constraint-seawall-height", confidence: "partial", score: 0.55, structural_loss: "BBB threshold is numerical and reviewable; seawall constraint has irreversible political dimensions." },
      { id: "m-5", source_node_id: "goal-patient-safety",   target_node_id: "goal-facility-safety",  confidence: "close",      score: 0.78, structural_loss: "Different horizons: patient safety is short-term; facility safety is generational with public externalities." },
      { id: "m-6", source_node_id: "ev-kras-binding",       target_node_id: "ev-jogan-deposit",      confidence: "analogical", score: 0.31, structural_loss: "Both are foundational evidence; no structural correspondence between molecular and geological data types." },
    ],
  },

  // 2. Extreme environments ↔ Fukushima (normalization of deviance)
  {
    id: "align-ext-fgov",
    source_domain: "extreme_environments",
    target_domain: "fukushima_governance",
    coverage: 0.74,
    structural_notes:
      "Challenger O-ring failure and Fukushima seawall underprovision share an identical causal graph: a technical constraint (O-ring temperature threshold / seawall height estimate) is known to engineers, formally dissented upon, and suppressed by schedule/cost pressure. Diane Vaughan's 'normalization of deviance' applies to both. The structural loss at the authority node: Thiokol management reversed a technical recommendation in real time; TEPCO management did so over years through institutional inertia — the timescale differs but the graph is isomorphic.",
    gaps_source: ["mech-thermal-cycling-fatigue", "ent-solid-rocket-booster"],
    gaps_target: ["ent-tsunami-inundation-model", "inst-japanese-nuclear-safety-commission"],
    mappings: [
      { id: "m-1", source_node_id: "dissent-boisjoly-oring",  target_node_id: "dissent-tepco-eng",       confidence: "exact",      score: 0.97, structural_loss: "" },
      { id: "m-2", source_node_id: "dec-launch-approval-1986", target_node_id: "dec-seawall-2008",        confidence: "exact",      score: 0.93, structural_loss: "" },
      { id: "m-3", source_node_id: "ag-thiokol-management",   target_node_id: "inst-tepco-mgmt",         confidence: "close",      score: 0.81, structural_loss: "Thiokol management reversed itself under client pressure in hours; TEPCO drifted over years." },
      { id: "m-4", source_node_id: "constraint-oring-temp",   target_node_id: "constraint-seawall-height", confidence: "close",    score: 0.79, structural_loss: "Temperature constraint is physical; seawall constraint has hydrological and probabilistic structure." },
      { id: "m-5", source_node_id: "mech-deviance-normalization", target_node_id: "mech-org-silence-failure", confidence: "exact", score: 0.88, structural_loss: "" },
      { id: "m-6", source_node_id: "ev-oring-erosion-history", target_node_id: "ev-jogan-deposit",       confidence: "partial",    score: 0.58, structural_loss: "Both are prior evidence of danger; erosion history is engineering record, Jogan deposit is geological." },
    ],
  },

  // 3. Aviation safety ↔ Extreme environments (regulatory capture & authority override)
  {
    id: "align-avi-ext",
    source_domain: "aviation_safety",
    target_domain: "extreme_environments",
    coverage: 0.69,
    structural_notes:
      "Both 737 MAX MCAS and Challenger share the pattern of production/schedule pressure silencing safety-critical technical concerns. Ed Pierson's Boeing factory complaints and Roger Boisjoly's O-ring memos are structurally identical: a credentialed engineer with specific technical evidence, formal dissent recorded, dismissed by management under external pressure. The key structural difference: Boeing's suppression operated through regulatory capture of the FAA ODA process (distributed, deniable) while Thiokol's operated through a single real-time management override (concentrated, traceable).",
    gaps_source: ["inst-faa-oda-delegation", "mech-regulatory-capture"],
    gaps_target: ["ent-space-shuttle-solid-booster", "mech-cold-temperature-seal-failure"],
    mappings: [
      { id: "m-1", source_node_id: "dissent-pierson-737max",  target_node_id: "dissent-boisjoly-oring",   confidence: "exact",      score: 0.94, structural_loss: "" },
      { id: "m-2", source_node_id: "ag-boeing-management",    target_node_id: "ag-thiokol-management",    confidence: "close",      score: 0.77, structural_loss: "Boeing management distributed over multi-year institutional process; Thiokol concentrated in one teleconference." },
      { id: "m-3", source_node_id: "constraint-mcas-aoa-limit", target_node_id: "constraint-oring-temp", confidence: "close",      score: 0.73, structural_loss: "AOA sensor constraint is epistemic (sensor disagreement); O-ring constraint is physical (material failure)." },
      { id: "m-4", source_node_id: "dec-faa-737-certification", target_node_id: "dec-launch-approval-1986", confidence: "partial",  score: 0.62, structural_loss: "FAA cert is a multi-year regulatory process; launch approval is a single synchronous decision." },
      { id: "m-5", source_node_id: "mech-authority-override",  target_node_id: "mech-deviance-normalization", confidence: "close", score: 0.71, structural_loss: "Authority override in aviation is mediated by regulation; normalization of deviance is cultural drift." },
    ],
  },

  // 4. Pandemic governance ↔ Fukushima (institutional delay under political pressure)
  {
    id: "align-pan-fgov",
    source_domain: "pandemic_governance",
    target_domain: "fukushima_governance",
    coverage: 0.58,
    structural_notes:
      "WHO PHEIC delay (Jan 2020) and TEPCO seawall underprovision share the mechanism of institutional delay under political-economic pressure. In both cases: a technically credentialed body (WHO Emergencies Committee / TEPCO safety engineers) has high-confidence risk evidence, a governing authority has political/economic incentives for inaction, and the delay generates asymmetric harm. Key structural difference: WHO's PHEIC delay operated through international political negotiation (member state pressure); TEPCO's operated through internal corporate hierarchy. The aerosol dissent case within pandemic_governance — where mask guidance reversed only after 18 months — maps more closely to TEPCO's calibration discount pattern.",
    gaps_source: ["inst-who-ihb", "mech-airborne-transmission"],
    gaps_target: ["mech-tsunami-inundation-modelling", "ent-nuclear-fuel-storage"],
    mappings: [
      { id: "m-1", source_node_id: "dec-who-pheic-jan2020",   target_node_id: "dec-seawall-2008",         confidence: "close",      score: 0.68, structural_loss: "PHEIC delay is weeks under political negotiation; seawall decision is multi-year under economic pressure." },
      { id: "m-2", source_node_id: "dissent-tedros-pheic",    target_node_id: "dissent-tepco-eng",         confidence: "partial",    score: 0.51, structural_loss: "Tedros's dissent is embedded in diplomatic process; TEPCO engineer dissent is internal and suppressed." },
      { id: "m-3", source_node_id: "mech-org-silence-failure", target_node_id: "mech-org-silence-failure", confidence: "exact",      score: 1.0,  structural_loss: "" },
      { id: "m-4", source_node_id: "constraint-pheic-threshold", target_node_id: "constraint-seawall-height", confidence: "analogical", score: 0.39, structural_loss: "Both are safety thresholds; PHEIC threshold is epidemiological and probabilistic, seawall is engineering and deterministic." },
      { id: "m-5", source_node_id: "inst-who-secretariat",    target_node_id: "inst-tepco-mgmt",           confidence: "partial",    score: 0.54, structural_loss: "WHO Secretariat operates under international treaty law; TEPCO management under corporate hierarchy and national regulation." },
    ],
  },

  // 5. Surgical robotics ↔ EUV lithography (tacit calibration knowledge transfer)
  {
    id: "align-surg-euv",
    source_domain: "surgical_robotics",
    target_domain: "euv_lithography",
    coverage: 0.55,
    structural_notes:
      "Da Vinci haptic calibration and ASML EUV pre-pulse droplet alignment share a deep structural pattern: a physical process with micro-scale tolerances depends on situated judgment that cannot be fully codified. In both cases: an operator must detect and correct for drift that is not captured by automated sensors, the knowledge is embodied and takes years to develop, and expert departure creates irreversible knowledge loss. Key difference: surgical calibration is real-time closed-loop with immediate tissue feedback; EUV droplet timing is open-loop with delayed yield feedback. The Expert Preservation subgraph is richer in euv_lithography (Yamamoto's ASML notebooks) than in surgical_robotics.",
    gaps_source: ["mech-haptic-force-feedback", "ent-or-safety-committee"],
    gaps_target: ["mech-co2-laser-pre-pulse", "ent-tin-droplet-plasma"],
    mappings: [
      { id: "m-1", source_node_id: "ag-da-vinci-calibrator",  target_node_id: "ag-asml-process-engineer", confidence: "close",      score: 0.76, structural_loss: "Surgical calibration is patient-specific per-procedure; EUV calibration is batch-continuous with different feedback timescale." },
      { id: "m-2", source_node_id: "mech-calibration-decay",  target_node_id: "mech-calibration-decay",   confidence: "exact",      score: 1.0,  structural_loss: "" },
      { id: "m-3", source_node_id: "tacit-davinci-entry-feel", target_node_id: "tacit-yamamoto-prepulse",  confidence: "close",      score: 0.82, structural_loss: "Both are embodied; surgical feel is proprioceptive, EUV timing is audiovisual and sensor-assisted." },
      { id: "m-4", source_node_id: "constraint-force-threshold", target_node_id: "constraint-droplet-timing", confidence: "partial", score: 0.61, structural_loss: "Force threshold is continuous and patient-variable; droplet timing is discrete and machine-constant." },
      { id: "m-5", source_node_id: "mech-expert-preservation-urgency", target_node_id: "mech-expert-preservation-urgency", confidence: "exact", score: 0.95, structural_loss: "" },
    ],
  },

  // 6. Mathematics category theory ↔ EUV lithography (functor as translation)
  {
    id: "align-cat-euv",
    source_domain: "mathematics_category_theory",
    target_domain: "euv_lithography",
    coverage: 0.41,
    structural_notes:
      "Category theory provides the formal language for EUV process transfer across tool generations. A functor maps ASML NXE:3400 process parameters to NXE:3600 while preserving the causal structure of the yield model. Natural transformations compare two competing calibration translators (Yamamoto's vs. Kim's protocol) by checking whether the commutativity condition holds at each node. The coverage is lower (41%) because category theory has rich ontological content (limits, colimits, adjunctions) with no manufacturing analogue, and EUV has domain-specific physical structure (plasma physics, tin droplet dynamics) with no categorical structure. The high-value mappings are concentrated at the structural-loss-accounting and transfer-validity nodes.",
    gaps_source: ["ent-adjunction", "ent-topos", "mech-yoneda-embedding"],
    gaps_target: ["ent-tin-plasma-physics", "mech-dose-uniformity-feedback"],
    mappings: [
      { id: "m-1", source_node_id: "ent-functor",             target_node_id: "mech-process-parameter-transfer", confidence: "close",  score: 0.74, structural_loss: "Mathematical functor is exact and structure-preserving; process parameter transfer has empirical tolerance." },
      { id: "m-2", source_node_id: "ent-natural-transformation", target_node_id: "mech-calibration-comparison",  confidence: "close",  score: 0.71, structural_loss: "Natural transformation is formally verifiable; calibration comparison is empirical and context-dependent." },
      { id: "m-3", source_node_id: "ent-structural-loss-record", target_node_id: "ent-yield-deviation-log",      confidence: "exact",  score: 0.89, structural_loss: "" },
      { id: "m-4", source_node_id: "ent-category",             target_node_id: "ent-process-domain",             confidence: "partial", score: 0.52, structural_loss: "Category has explicit morphisms and composition laws; process domain has implicit causal dependencies." },
      { id: "m-5", source_node_id: "mech-transfer-validity",   target_node_id: "mech-process-validation-protocol", confidence: "close", score: 0.67, structural_loss: "Mathematical validity is formal proof; process validation is statistical confidence interval." },
    ],
  },

  // 7. Semiconductor hardware ↔ Drug discovery (process window = clinical window)
  {
    id: "align-semi-drug",
    source_domain: "semiconductor_hardware",
    target_domain: "drug_discovery",
    coverage: 0.67,
    structural_notes:
      "Plasma etch process window and clinical therapeutic window are structurally isomorphic: both define a bounded parameter space (etch rate / drug concentration) where a desired outcome (target etch depth / target therapeutic effect) occurs without crossing into failure modes (over-etch / toxicity). Both have uncertainty-weighted margins. Both are subject to drift (tool aging / patient pharmacokinetics). Key structural difference: process window drift is deterministic and tool-specific; clinical window drift is biological and patient-specific. The governance overlay differs sharply — semiconductor process governance is internal quality control, clinical governance is regulatory with external liability.",
    gaps_source: ["mech-plasma-etch-chemistry", "ent-photoresist-stack"],
    gaps_target: ["mech-hepatic-clearance", "ent-patient-population-distribution"],
    mappings: [
      { id: "m-1", source_node_id: "ent-process-window",       target_node_id: "ent-therapeutic-window",    confidence: "exact",      score: 0.92, structural_loss: "" },
      { id: "m-2", source_node_id: "mech-process-drift",       target_node_id: "mech-pharmacokinetic-variability", confidence: "close", score: 0.75, structural_loss: "Process drift is deterministic and calibratable; pharmacokinetic variability is stochastic and patient-specific." },
      { id: "m-3", source_node_id: "constraint-etch-selectivity", target_node_id: "constraint-bbb-threshold", confidence: "close",    score: 0.69, structural_loss: "Etch selectivity is a ratio of material removal rates; BBB threshold is a concentration-dependent diffusion constraint." },
      { id: "m-4", source_node_id: "dissent-kim-spc",          target_node_id: "dissent-chen",               confidence: "partial",    score: 0.57, structural_loss: "Kim's SPC dissent is about measurement system adequacy; Chen's is about clinical evidence interpretation." },
      { id: "m-5", source_node_id: "ag-process-engineer",      target_node_id: "ag-pharmacologist",          confidence: "close",      score: 0.72, structural_loss: "Both are calibrated domain experts; process engineer's authority is bounded by production schedule, pharmacologist's by regulatory framework." },
      { id: "m-6", source_node_id: "mech-yield-governance",    target_node_id: "mech-trial-governance",      confidence: "close",      score: 0.78, structural_loss: "Yield governance is internal QC with fast feedback; trial governance is regulatory with multi-year feedback loops." },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function OntologyBridgeView({ className = "" }: { className?: string }) {
  const { alignmentMap } = useGraphStore();
  const [demoIdx, setDemoIdx] = useState(0);

  const isDemo = alignmentMap == null;
  const map = alignmentMap ?? DEMO_MAPS[demoIdx % DEMO_MAPS.length]!;

  const nextDemo = () => setDemoIdx(i => (i + 1) % DEMO_MAPS.length);
  const prevDemo = () => setDemoIdx(i => (i - 1 + DEMO_MAPS.length) % DEMO_MAPS.length);

  return (
    <BridgeDiagramInner
      map={map}
      isDemo={isDemo}
      demoIdx={demoIdx}
      demoTotal={DEMO_MAPS.length}
      onNext={nextDemo}
      onPrev={prevDemo}
      className={className}
    />
  );
}

function BridgeDiagramInner({
  map, isDemo, demoIdx, demoTotal, onNext, onPrev, className,
}: {
  map: AlignmentMap;
  isDemo: boolean;
  demoIdx: number;
  demoTotal: number;
  onNext: () => void;
  onPrev: () => void;
  className?: string;
}) {
  const { mappings, gaps_source, gaps_target, coverage, structural_notes } = map;
  const coverageColor = coverage > 0.6 ? "#22c55e" : coverage > 0.4 ? "#eab308" : "#ef4444";

  const label = (id: string) =>
    id.replace(/^(ent|dec|ag|inst|constraint|goal|ev|dissent|mech|tacit)-/, "").replace(/-/g, " ");

  const srcColor = DOMAIN_COLORS[map.source_domain] ?? "#3b82f6";
  const tgtColor = DOMAIN_COLORS[map.target_domain] ?? "#f97316";

  // Score distribution summary
  const avgScore = mappings.reduce((s, m) => s + m.score, 0) / Math.max(mappings.length, 1);
  const exactCount = mappings.filter(m => m.confidence === "exact").length;
  const gapCount = (gaps_source?.length ?? 0) + (gaps_target?.length ?? 0);

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Ontology Bridge</div>
          {isDemo && (
            <div className="flex items-center gap-1.5">
              <button onClick={onPrev}
                className="w-5 h-5 rounded flex items-center justify-center text-[10px] transition-all"
                style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)" }}
                title="Previous domain pair">‹</button>
              <span className="text-[9px] text-slate-600 tabular-nums">{demoIdx + 1}/{demoTotal}</span>
              <button onClick={onNext}
                className="w-5 h-5 rounded flex items-center justify-center text-[10px] transition-all"
                style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)" }}
                title="Next domain pair">›</button>
            </div>
          )}
        </div>

        {/* Domain pair header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ color: srcColor, background: `${srcColor}12`, border: `1px solid ${srcColor}25` }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: srcColor }} />
              {map.source_domain.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] text-slate-600">⟺</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ color: tgtColor, background: `${tgtColor}12`, border: `1px solid ${tgtColor}25` }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tgtColor }} />
              {map.target_domain.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-[9px] text-slate-500">coverage</div>
            <div className="text-sm font-bold font-mono" style={{ color: coverageColor }}>
              {Math.round(coverage * 100)}%
            </div>
          </div>
        </div>

        {/* Coverage bar */}
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div style={{ width: `${coverage * 100}%`, height: "100%", backgroundColor: coverageColor, transition: "width 0.5s ease" }} />
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-2">
          <StatPill label="mappings" value={mappings.length} color="#6366f1" />
          <StatPill label="exact" value={exactCount} color="#22c55e" />
          <StatPill label="gaps" value={gapCount} color="#ef4444" />
          <StatPill label="avg score" value={`${Math.round(avgScore * 100)}%`} color="#eab308" />
        </div>

        {/* Demo label */}
        {isDemo && (
          <div className="mt-2 text-[9px] italic px-2 py-1 rounded"
            style={{ color: "#64748b", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            Demo alignment · click ≡ Bridge in header to compute live via backend
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-2.5 mt-2 flex-wrap">
          {Object.entries(CONFIDENCE_COLORS).map(([conf, color]) => (
            <div key={conf} className="flex items-center gap-1">
              <span className="font-mono text-[10px]" style={{ color }}>{CONFIDENCE_ICONS[conf]}</span>
              <span className="text-[9px] text-slate-600">{conf}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bridge diagram */}
      <div className="flex-1 overflow-auto p-3">
        <div className="flex gap-2">
          {/* Source column */}
          <div className="flex-1 space-y-1.5">
            <div className="text-[9px] font-bold uppercase tracking-widest mb-2 px-1"
              style={{ color: srcColor }}>
              {map.source_domain.replace(/_/g, " ")}
            </div>
            {mappings.map(m => (
              <NodeChip
                key={`s-${m.id}`}
                label={label(m.source_node_id)}
                confidence={m.confidence}
                structuralLoss={m.structural_loss}
                score={m.score}
              />
            ))}
            {(gaps_source ?? []).map(id => (
              <GapChip key={id} label={label(id)} />
            ))}
          </div>

          {/* Bridge column */}
          <div className="flex flex-col items-center gap-1.5 pt-7" style={{ width: 28 }}>
            {mappings.map(m => {
              const color = CONFIDENCE_COLORS[m.confidence] ?? "#475569";
              const icon = CONFIDENCE_ICONS[m.confidence] ?? "·";
              return (
                <div key={m.id} title={m.structural_loss ? `Δ: ${m.structural_loss}` : m.confidence}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}35`, cursor: "default" }}>
                  {icon}
                </div>
              );
            })}
          </div>

          {/* Target column */}
          <div className="flex-1 space-y-1.5">
            <div className="text-[9px] font-bold uppercase tracking-widest mb-2 px-1 text-right"
              style={{ color: tgtColor }}>
              {map.target_domain.replace(/_/g, " ")}
            </div>
            {mappings.map(m => (
              <NodeChip
                key={`t-${m.id}`}
                label={label(m.target_node_id)}
                confidence={m.confidence}
                structuralLoss={m.structural_loss}
                score={m.score}
                side="target"
              />
            ))}
            {(gaps_target ?? []).map(id => (
              <GapChip key={id} label={label(id)} variant="target" />
            ))}
          </div>
        </div>
      </div>

      {/* Structural notes */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Structural Analysis</div>
        <p className="text-[10px] text-slate-400 leading-relaxed">{structural_notes}</p>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
      <span className="text-[10px] font-bold font-mono" style={{ color }}>{value}</span>
      <span className="text-[9px] text-slate-600">{label}</span>
    </div>
  );
}

function NodeChip({
  label, confidence, structuralLoss, score, side = "source",
}: {
  label: string;
  confidence: string;
  structuralLoss?: string;
  score?: number;
  side?: "source" | "target";
}) {
  const color = CONFIDENCE_COLORS[confidence] ?? "#94a3b8";
  return (
    <div
      className="px-2 py-1.5 rounded-lg text-[10px] truncate transition-all group relative"
      style={{
        backgroundColor: `${color}08`,
        border: `1px solid ${color}25`,
        color: "#cbd5e1",
        textAlign: side === "target" ? "right" : "left",
      }}
      title={structuralLoss ? `Structural loss: ${structuralLoss}` : label}
    >
      <div className="flex items-center justify-between gap-1">
        {side === "target" && score !== undefined && (
          <span className="text-[9px] font-mono flex-shrink-0" style={{ color, opacity: 0.7 }}>
            {Math.round(score * 100)}%
          </span>
        )}
        <span className="truncate flex-1">{label}</span>
        {side === "source" && score !== undefined && (
          <span className="text-[9px] font-mono flex-shrink-0" style={{ color, opacity: 0.7 }}>
            {Math.round(score * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}

function GapChip({ label, variant = "source" }: { label: string; variant?: "source" | "target" }) {
  return (
    <div
      className="px-2 py-1.5 rounded-lg text-[10px] truncate"
      style={{
        backgroundColor: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#fca5a5",
        textAlign: variant === "target" ? "right" : "left",
      }}
      title={`No ${variant === "source" ? "target" : "source"} mapping — ontological gap`}
    >
      ✕ {label}
    </div>
  );
}
