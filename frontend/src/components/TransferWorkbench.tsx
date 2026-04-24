import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConceptNode {
  id: string;
  label: string;
  concept_type: "mechanism" | "concept" | "invariant" | "theorem" | "schema" | "instance" | "translator" | "validation_protocol";
  domain: string;
  abstraction_level: number;
  substrate_distance: number;
  transferability: number;
  description: string;
  invariants?: string[];
}

interface TranslatorStep {
  source_id: string;
  source_label: string;
  target_id: string;
  target_label: string;
  confidence: "exact" | "close" | "partial" | "analogical" | "blocked";
  preserved: string[];
  lost?: string;
}

interface StructuralLoss {
  id: string;
  what: string;
  why: string;
  consequence: string;
}

interface ValidationProtocol {
  id: string;
  test: string;
  expected: string;
  domain: string;
}

interface TransferCase {
  id: string;
  label: string;
  source_domain: string;
  target_domain: string;
  source_color: string;
  target_color: string;
  via_concept: ConceptNode;
  elevator: Array<{
    level: "substrate" | "mechanism" | "concept" | "invariant" | "theorem" | "schema" | "instantiation" | "validation";
    label: string;
    domain: string;
    color: string;
    codifiability?: number;
    note?: string;
  }>;
  primary_translator: { label: string; steps: TranslatorStep[] };
  competing_translator?: { label: string; steps: TranslatorStep[]; divergence: string };
  structural_losses: StructuralLoss[];
  validation_protocols: ValidationProtocol[];
  transfer_claim: string;
  historical_note?: string;
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
  mathematics_category_theory:   "#8b5cf6",
  information_theory:     "#8b5cf6",
  physics:                "#06b6d4",
  control_theory:         "#22c55e",
};

const CONFIDENCE_ICON: Record<string, string> = {
  exact: "≡", close: "≈", partial: "~", analogical: "∿", blocked: "✕",
};
const CONFIDENCE_COLOR: Record<string, string> = {
  exact: "#22c55e", close: "#84cc16", partial: "#eab308", analogical: "#94a3b8", blocked: "#ef4444",
};

const ELEVATOR_LEVEL_COLORS: Record<string, string> = {
  substrate:      "#475569",
  mechanism:      "#6366f1",
  concept:        "#8b5cf6",
  invariant:      "#ec4899",
  theorem:        "#ec4899",
  schema:         "#a855f7",
  instantiation:  "#22c55e",
  validation:     "#06b6d4",
};
const ELEVATOR_LEVEL_LABELS: Record<string, string> = {
  substrate:      "Substrate / Evidence",
  mechanism:      "Mechanism",
  concept:        "Concept",
  invariant:      "Invariant / Theorem",
  theorem:        "Theorem",
  schema:         "Schema / Pattern",
  instantiation:  "Instantiation (target)",
  validation:     "Validation Protocol",
};

const DEMO_TRANSFERS: TransferCase[] = [
  {
    id: "transfer-dissent-governance",
    label: "Normalization of Deviance",
    source_domain: "extreme_environments",
    target_domain: "aviation_safety",
    source_color: "#ef4444",
    target_color: "#94a3b8",
    via_concept: {
      id: "schema-auth-override",
      label: "Authority-override-of-calibrated-dissent schema",
      concept_type: "schema",
      domain: "cross",
      abstraction_level: 0.72,
      substrate_distance: 0.40,
      transferability: 0.91,
      description: "An expert with a high calibration track record raises a specific, documented safety concern. An authority with a lower calibration track record overrides the concern for institutional reasons (schedule, cost, precedent). The decision is not recorded as a dissent. A catastrophic outcome occurs that was directly predicted by the suppressed expert.",
      invariants: ["expert dissent", "authority override", "dissent suppression", "catastrophic vindication"],
    },
    elevator: [
      { level: "substrate",      domain: "extreme_environments", color: "#ef4444", label: "O-ring failure data at low temperatures — Morton Thiokol charts showing erosion at <53°F", codifiability: 0.80 },
      { level: "mechanism",      domain: "extreme_environments", color: "#ef4444", label: "Boisjoly warning (July 1985) — specific, documented, overruled. Launch at 28°F on Jan 28 1986. O-ring fails.", codifiability: 0.82 },
      { level: "schema",         domain: "cross",                color: "#8b5cf6", label: "Authority-override-of-calibrated-dissent — expert dissent raised, suppressed, vindicated after catastrophe", codifiability: 0.75, note: "Diane Vaughan (1996): 'normalization of deviance' — organizations treat deviance as normal until catastrophe makes it visible. Named in 1996; knowable before both Fukushima and 737 MAX." },
      { level: "instantiation",  domain: "fukushima_governance", color: "#f97316", label: "TEPCO Civil Engineering dissent (2008) — 10m seawall deficit raised, overruled. March 2011: 14.1m tsunami. Calibration score: overruled engineer 0.76; authority 0.31.", codifiability: 0.75 },
      { level: "instantiation",  domain: "aviation_safety",      color: "#94a3b8", label: "Ed Pierson Boeing warning (2018) — MCAS single-sensor risk raised to management, overruled. 346 fatalities across two crashes.", codifiability: 0.80 },
      { level: "validation",     domain: "cross",                color: "#06b6d4", label: "Cross-domain schema validation — 3 independent cases confirm identical decision structure and outcome class. CalibrationDifferential ≥ 0.3 in each case.", codifiability: 0.72 },
    ],
    primary_translator: {
      label: "Governance Failure Schema Translator",
      steps: [
        { source_id: "boisjoly-dissent",    source_label: "Boisjoly O-ring warning",           target_id: "pierson-dissent",         target_label: "Ed Pierson MCAS warning",         confidence: "exact",      preserved: ["expert with documented track record", "specific technical concern", "written and dated"], lost: undefined },
        { source_id: "nasa-override",       source_label: "NASA management launch decision",    target_id: "boeing-override",         target_label: "Boeing management approval",      confidence: "exact",      preserved: ["authority with lower track record overrules expert"] },
        { source_id: "suppression-record",  source_label: "No formal dissent record at NASA",   target_id: "boeing-no-record",        target_label: "Internal pushback not documented", confidence: "close",      preserved: ["absence of governance record"],  lost: "Boeing's suppression was commercial; NASA's was procedural" },
        { source_id: "challenger-outcome",  source_label: "Challenger explosion — 7 fatalities", target_id: "mcas-outcome",           target_label: "346 fatalities, 2 crashes",       confidence: "analogical", preserved: ["catastrophic outcome traceable to overruled warning"],  lost: "Scale: 7 vs 346. Temporal structure: instant vs. months." },
      ],
    },
    structural_losses: [
      { id: "sl-gov-1", what: "Temporal structure",      why: "Challenger: 6-month decision to launch. MCAS: multi-year accumulation of design decisions. Fukushima: 3-year deferral", consequence: "The schema is temporally symmetric — but timeline determines which interventions were possible and when" },
      { id: "sl-gov-2", what: "Institutional character", why: "NASA = public safety agency. Boeing = commercial manufacturer. TEPCO = regulated utility", consequence: "Accountability mechanisms differ substantially; the schema is preserved but consequences for non-compliance differ" },
    ],
    validation_protocols: [
      { id: "vp-gov-1", test: "CalibrationDifferential test", expected: "In each case, dissenting expert's calibration > authority's calibration by ≥ 0.3",                   domain: "cross" },
      { id: "vp-gov-2", test: "Dissent suppression flag",     expected: "In each case, no formal dissent record exists at the time of the override decision",               domain: "cross" },
      { id: "vp-gov-3", test: "Prediction specificity test",  expected: "In each case, the dissenting expert predicted the specific failure mode that occurred",            domain: "cross" },
    ],
    transfer_claim: "The authority-override-of-calibrated-dissent schema is a genuine domain-invariant. It has been instantiated in aerospace, nuclear, and aviation with structurally identical decision patterns and outcome classes. This is not analogy — it is schema reuse. Omega is the substrate that makes the schema permanent, queryable, and transferable before the next disaster.",
    historical_note: "Diane Vaughan (1996, The Challenger Launch Decision) named the mechanism 'normalization of deviance.' Her analysis predates Fukushima (2011) and 737 MAX (2018-19) by 15 and 22 years respectively. The schema was knowable and transferable. It was not institutionally acted on.",
  },

  {
    id: "transfer-process-window-euv-kras",
    label: "EUV Process Window → KRAS Therapeutic Window",
    source_domain: "euv_lithography",
    target_domain: "drug_discovery",
    source_color: "#22c55e",
    target_color: "#3b82f6",
    via_concept: {
      id: "concept-bounded-viable-envelope",
      label: "Bounded viable operating envelope",
      concept_type: "invariant",
      domain: "cross",
      abstraction_level: 0.70,
      substrate_distance: 0.78,
      transferability: 0.76,
      description: "Any complex process reliably produces desired outputs only within a finite bounded region of its parameter space. Outside this region the system fails — either by under-driving (insufficient effect) or over-driving (destructive overshoot). The boundary is not fixed: it drifts with system state, environment, and accumulated wear.",
      invariants: ["finite feasible region", "failure modes at both boundaries", "boundary drift over time", "requires systematic scanning to map"],
    },
    elevator: [
      { level: "substrate",      domain: "euv_lithography",  color: "#22c55e", label: "Focus-Exposure Matrix (FEM) — systematic grid scan of {dose, focus} reveals wafer pattern quality across parameter space", codifiability: 0.85, note: "Standard ASML lithography metrology: ~200 die exposures covering the full 2D parameter grid" },
      { level: "mechanism",      domain: "euv_lithography",  color: "#22c55e", label: "Process window: the {dose, focus} region where CD tolerance ≤ ±10% and LER ≤ threshold — used to set safe operating margins", codifiability: 0.78 },
      { level: "invariant",      domain: "cross",            color: "#ec4899", label: "Bounded viable operating envelope — every physical process has a finite feasible region; failure is symmetric at both boundaries; boundary drifts with process age", codifiability: 0.82, note: "This is the domain-invariant structure. The FEM protocol is its operational expression in lithography." },
      { level: "instantiation",  domain: "drug_discovery",   color: "#3b82f6", label: "KRASG12C therapeutic window — sotorasib Phase I dose escalation (CodeBreaK100): dose-response plateau between 960mg/day and toxicity boundary; sub-therapeutic below 240mg/day", codifiability: 0.70 },
      { level: "schema",         domain: "cross",            color: "#8b5cf6", label: "FEM-to-DEM (Dose-Efficacy Matrix) transfer — systematic multi-parameter scan of {dose, schedule} analogous to FEM grid, to map full therapeutic envelope", codifiability: 0.62, note: "Transfer claim: KRAS combination therapy (KRASG12C + MEK inhibitor) needs a 2D DEM analogous to EUV FEM — neither drug development nor clinical trial design currently uses this systematic 2D scanning approach" },
      { level: "validation",     domain: "drug_discovery",   color: "#06b6d4", label: "DEM validation protocol — systematic {sotorasib dose, cobimetinib dose} matrix in PDX models; map response surface; validate that boundary drift follows analogous physics to process window drift under repeated cycling", codifiability: 0.68 },
    ],
    primary_translator: {
      label: "Process Envelope Translator",
      steps: [
        { source_id: "euv-dose",           source_label: "EUV exposure dose (mJ/cm²)",         target_id: "drug-dose",         target_label: "Sotorasib dose (mg/day)",              confidence: "close",      preserved: ["continuous scalar parameter", "failure modes at both extremes"],   lost: "dose has physical energy units; drug dose has pharmacokinetic complexity" },
        { source_id: "euv-focus",          source_label: "Focus offset (nm)",                   target_id: "drug-schedule",     target_label: "Dosing schedule (q.d. vs b.i.d.)",     confidence: "partial",    preserved: ["second parameter axis that expands the feasible region"],           lost: "focus is a physical offset; schedule is a temporal pattern — different mathematics" },
        { source_id: "euv-process-window", source_label: "FEM process window region",           target_id: "drug-window",       target_label: "Therapeutic window envelope",          confidence: "close",      preserved: ["bounded feasible region", "failure at both boundaries", "window shrinkage with drift"] },
        { source_id: "euv-cd-metric",      source_label: "Critical dimension (CD) uniformity",  target_id: "drug-response",     target_label: "Tumor response rate (RECIST ORR)",      confidence: "analogical", preserved: ["scalar output metric for process quality"],                          lost: "CD is a geometric measure; ORR is a clinical endpoint — very different measurement ecosystems" },
        { source_id: "euv-fem-protocol",   source_label: "Focus-Exposure Matrix (FEM) scan",    target_id: "drug-dem-protocol", target_label: "Dose-Efficacy Matrix (DEM) scan",       confidence: "partial",    preserved: ["systematic 2D grid exploration of parameter space"],                 lost: "FEM takes hours on a wafer; DEM takes months in vivo — cadence completely different" },
      ],
    },
    competing_translator: {
      label: "Dose-Response Curve Translator (conventional)",
      steps: [
        { source_id: "euv-dose-axis",      source_label: "EUV dose (1D)",     target_id: "drug-dose-1d",   target_label: "Drug dose 1D curve",   confidence: "exact",    preserved: ["1D parameter sweep", "response curve shape"],  lost: undefined },
        { source_id: "euv-margin",         source_label: "Process margin",    target_id: "drug-margin",    target_label: "Therapeutic index",    confidence: "exact",    preserved: ["margin = window width", "safety quantification"] },
      ],
      divergence: "The conventional translator (dose-response curve) maps only the 1D projection of the process window. The FEM-to-DEM translator preserves the 2D structure — the insight that a second parameter (schedule, combination) can expand the feasible region in drug development, just as focus offsets expand the EUV process window. The 2D structure is the transfer innovation.",
    },
    structural_losses: [
      { id: "sl-pw-1", what: "Measurement cadence",        why: "EUV FEM: complete in hours. KRAS DEM: months per parameter combination in vivo", consequence: "The 2D systematic scan that takes 1 day in lithography takes 3 years in clinical development — the operational transfer requires pre-clinical proxies (PDX models, organoids) to be viable" },
      { id: "sl-pw-2", what: "Boundary physics",           why: "EUV: boundary is optical physics (diffraction limits). Drug: boundary is pharmacokinetic/pharmacodynamic (PK/PD) complexity", consequence: "Process window drift in EUV follows known physics; therapeutic window drift (tumor evolution, resistance acquisition) is far less predictable" },
      { id: "sl-pw-3", what: "Output metric dimensionality", why: "EUV has one primary output metric (CD uniformity). KRAS drug response has multiple competing endpoints (ORR, PFS, OS, toxicity)", consequence: "The 'window' in drug development is multi-objective — not all outputs can be simultaneously optimized; this requires Pareto frontier analysis absent from the EUV analogy" },
    ],
    validation_protocols: [
      { id: "vp-pw-1", test: "2D DEM surface reconstruction",     expected: "KRASG12C + MEK inhibitor response surface in PDX shows closed contour (bounded window) analogous to FEM ellipse",                  domain: "drug_discovery" },
      { id: "vp-pw-2", test: "Boundary drift test",               expected: "Repeated cycles of sotorasib treatment shrink the therapeutic envelope by >20% in 6 months (analogous to EUV process window drift under aging source)", domain: "drug_discovery" },
      { id: "vp-pw-3", test: "Schedule-axis expansion test",      expected: "Intermittent dosing schedules (the 'focus offset' analog) expand viable DEM region by >30% vs. continuous dosing in 3+ tumor models", domain: "drug_discovery" },
    ],
    transfer_claim: "EUV lithography's Focus-Exposure Matrix protocol — a systematic 2D parameter scan to map the process window — has no direct analog in drug development. The structural parallel suggests that KRAS combination therapy optimization (dose × schedule grid) could be run as a 'Dose-Efficacy Matrix', revealing a bounded therapeutic envelope with the same structure as an EUV process window. The transfer is scientifically grounded; the experiment has not been done.",
    historical_note: "This bridge is speculative (grounding tier: HY). The process window concept in lithography is a standard engineering tool; the therapeutic window in pharmacology is standard PK/PD. The 2D FEM-to-DEM transfer claim is novel — there is no published work applying lithography process window methodology to multi-parameter drug optimization.",
  },

  {
    id: "transfer-feedback-euv-surgery",
    label: "EUV Calibration → Surgical Robotics",
    source_domain: "euv_lithography",
    target_domain: "surgical_robotics",
    source_color: "#22c55e",
    target_color: "#ec4899",
    via_concept: {
      id: "concept-delayed-feedback",
      label: "Delayed feedback correction under drift",
      concept_type: "concept",
      domain: "cross",
      abstraction_level: 0.65,
      substrate_distance: 0.55,
      transferability: 0.82,
      description: "When a control system receives feedback after a delay, the system drifts during the latency window. Correction must compensate for both the observed error and the accumulated drift, not just the instantaneous deviation.",
      invariants: ["feedback loop", "drift accumulation during latency", "compensatory correction signal", "convergence to setpoint"],
    },
    elevator: [
      { level: "substrate",      domain: "euv_lithography",  color: "#22c55e", label: "Tin droplet camera image — target position observed 1.2ms after laser pulse", codifiability: 0.15, note: "Physical measurement; tacit read of image quality" },
      { level: "mechanism",      domain: "euv_lithography",  color: "#22c55e", label: "Pre-pulse alignment correction — engineer adjusts pulse width to compensate for droplet drift", codifiability: 0.05, note: "Step 6: the tacit judgment that cannot be written down" },
      { level: "concept",        domain: "cross",            color: "#8b5cf6", label: "Delayed feedback correction under drift — system moves during feedback latency; correction must overshoot compensated", codifiability: 0.55 },
      { level: "invariant",      domain: "control_theory",   color: "#ec4899", label: "Nyquist stability criterion — closed-loop feedback stable iff open-loop gain stays below 1 at the phase crossover", codifiability: 0.90 },
      { level: "instantiation",  domain: "surgical_robotics", color: "#ec4899", label: "Trocar haptic correction — surgeon adjusts grip force to compensate for da Vinci actuator latency (~30ms)", codifiability: 0.12, note: "Structural loss: physical medium is tissue, not plasma" },
      { level: "validation",     domain: "surgical_robotics", color: "#06b6d4", label: "Force-feedback convergence assay — measure correction latency vs. setpoint error at 10, 30, 60ms delays", codifiability: 0.80 },
    ],
    primary_translator: {
      label: "Sensorimotor-Control Translator",
      steps: [
        { source_id: "euv-alignment-signal",   source_label: "EUV alignment error signal",   target_id: "surgery-haptic-signal",  target_label: "Haptic force deviation signal",   confidence: "close",       preserved: ["feedback signal structure", "error magnitude metric"],      lost: "physical medium: electromagnetic vs. mechanical" },
        { source_id: "euv-correction-action",  source_label: "Pulse width adjustment",        target_id: "surgery-grip-force",     target_label: "Grip force modulation",           confidence: "analogical",  preserved: ["corrective action direction"],                             lost: "actuator physics entirely different" },
        { source_id: "euv-latency-window",     source_label: "1.2ms laser-camera latency",    target_id: "surgery-latency",        target_label: "30ms actuator-sensor latency",    confidence: "partial",     preserved: ["latency creates drift problem"],                           lost: "timescale differs by 25×; compensation math changes" },
        { source_id: "euv-convergence-check",  source_label: "Overlay metrology verification", target_id: "surgery-assay",         target_label: "Force-feedback calibration assay", confidence: "close",      preserved: ["convergence to setpoint is the success criterion"],       lost: "measurement instrument entirely different" },
      ],
    },
    competing_translator: {
      label: "PID Control Translator (alternative framing)",
      steps: [
        { source_id: "euv-alignment-signal",   source_label: "EUV alignment error",     target_id: "surgery-pid-error",      target_label: "Haptic PID error term",    confidence: "exact",    preserved: ["error term structure", "proportional response"],  lost: undefined },
        { source_id: "euv-correction-action",  source_label: "Pulse width (P term)",    target_id: "surgery-pid-p",          target_label: "Force proportional term",  confidence: "close",    preserved: ["proportional correction structure"],              lost: "physical implementation" },
        { source_id: "euv-latency-window",     source_label: "Latency (integral lag)",  target_id: "surgery-pid-i",          target_label: "Integral term for drift",  confidence: "partial",  preserved: ["accumulated error logic"],                        lost: "timescale incompatibility" },
      ],
      divergence: "Sensorimotor translator preserves tacit skill transfer; PID translator preserves formal control structure. They agree on the feedback loop but diverge on what the tacit expert carries: craft knowledge vs. parameter tuning.",
    },
    structural_losses: [
      { id: "sl-1", what: "Physical substrate",           why: "EUV operates on plasma; surgery operates on tissue and metal",       consequence: "Force magnitudes, timescales, and failure modes are completely different — the 'grip force' analog is only valid at the schema level" },
      { id: "sl-2", what: "Calibration transfer pathway", why: "ASML trains engineers over 6+ months of live system exposure; da Vinci training is simulation-based", consequence: "Tacit knowledge may not transfer even when structural knowledge does — the training ecology differs" },
      { id: "sl-3", what: "Failure mode symmetry",        why: "EUV failure = wafer defect (recoverable); surgical failure = patient harm (irreversible)",             consequence: "The validation protocol must be far more conservative in surgery — error tolerance ≠ error tolerance" },
    ],
    validation_protocols: [
      { id: "vp-1", test: "Delay-step response test",     expected: "Correction signal converges to setpoint within 3× delay window",     domain: "surgical_robotics" },
      { id: "vp-2", test: "Drift accumulation measure",   expected: "Uncorrected drift is proportional to latency (linear in delay)",      domain: "surgical_robotics" },
      { id: "vp-3", test: "Expert calibration transfer",  expected: "EUV-trained engineer's haptic correction strategy predicts surgical correction quality above baseline", domain: "surgical_robotics" },
    ],
    transfer_claim: "Sensorimotor correction under delayed feedback is a substrate-independent schema. The tacit skill of anticipating drift during latency should transfer between EUV calibration and robotic surgical haptics, because both involve correcting a physical system that has moved during the feedback delay.",
    historical_note: "This bridge is pre-identified (bridge-tacit-skill in SerendipityPanel). The transfer claim has not been empirically validated. The structural parallel is well-grounded; the tacit transfer is speculative.",
  },

  {
    id: "transfer-entropy-mechanics-info",
    label: "Statistical Mechanics → Information Theory",
    source_domain: "physics",
    target_domain: "information_theory",
    source_color: "#06b6d4",
    target_color: "#8b5cf6",
    via_concept: {
      id: "concept-entropy",
      label: "Probabilistic entropy over configurations",
      concept_type: "invariant",
      domain: "cross",
      abstraction_level: 0.92,
      substrate_distance: 0.85,
      transferability: 0.95,
      description: "Entropy measures the expected surprise of a probability distribution: H = -Σ p log p. This formula is substrate-independent — it captures uncertainty over any set of configurations, whether molecular states or bit sequences.",
      invariants: ["additivity for independent systems", "maximum at uniform distribution", "monotonicity under coarse-graining", "non-negativity"],
    },
    elevator: [
      { level: "substrate",      domain: "physics",            color: "#06b6d4", label: "Molecular velocity distribution in a gas — Boltzmann's measurement of microscopic states", codifiability: 0.70 },
      { level: "mechanism",      domain: "physics",            color: "#06b6d4", label: "Boltzmann H-theorem (1872) — S = -k Σ p log p measures thermodynamic disorder" },
      { level: "invariant",      domain: "cross",              color: "#ec4899", label: "Probabilistic entropy — H = -Σ p log p; additivity, maximum at uniform distribution, monotone under coarse-graining", codifiability: 0.98, note: "The structural invariant that Shannon recognized" },
      { level: "instantiation",  domain: "information_theory", color: "#8b5cf6", label: "Shannon entropy (1948) — H = -Σ p log p measures information uncertainty in a message source", codifiability: 0.98 },
      { level: "validation",     domain: "information_theory", color: "#06b6d4", label: "Shannon capacity theorem — channel capacity C = log(1 + S/N) follows from entropy bounds", codifiability: 0.98 },
    ],
    primary_translator: {
      label: "Probability Structure Translator",
      steps: [
        { source_id: "boltzmann-entropy",    source_label: "Thermodynamic entropy S",     target_id: "shannon-entropy",       target_label: "Information entropy H",        confidence: "exact",       preserved: ["formula: -Σ p log p", "additivity", "maximum at uniform", "monotone coarse-graining"] },
        { source_id: "boltzmann-microstate", source_label: "Molecular microstate",         target_id: "shannon-symbol",        target_label: "Message symbol",               confidence: "analogical",  preserved: ["unit of the distribution"],  lost: "physical interpretation: disorder vs. surprise" },
        { source_id: "boltzmann-temperature", source_label: "Temperature kT",              target_id: "shannon-bits",          target_label: "Information in bits",          confidence: "partial",     preserved: ["scaling of entropy unit"],   lost: "kT has physical meaning; bits are abstract" },
      ],
    },
    structural_losses: [
      { id: "sl-ent-1", what: "Arrow of time",           why: "Thermodynamic entropy only increases (2nd law); Shannon entropy has no temporal direction",   consequence: "Information-theoretic arguments about entropy production cannot be imported into thermodynamics" },
      { id: "sl-ent-2", what: "Physical interpretation", why: "'Disorder' (thermodynamics) ≠ 'surprise' (information theory)",                              consequence: "Intuitions built in one domain mislead in the other — the math is identical but the meaning differs" },
    ],
    validation_protocols: [
      { id: "vp-ent-1", test: "Noisy channel capacity derivation",    expected: "H bounds C = log(1 + S/N) via data processing inequality",   domain: "information_theory" },
      { id: "vp-ent-2", test: "Lossless compression bound",           expected: "Expected code length ≥ H bits per symbol (Shannon's theorem)",  domain: "information_theory" },
    ],
    transfer_claim: "Shannon recognized that Boltzmann's entropy formula captures something deeper than thermodynamics: the structure of probabilistic uncertainty over any configuration space. By extracting this invariant, he founded information theory without changing a single symbol.",
    historical_note: "Shannon (1948) explicitly noted the connection to Boltzmann. Von Neumann reportedly told Shannon: 'You should call it entropy, for two reasons: first, the function is the same as the entropy in thermodynamics; second, most people don't know what entropy is, which means that in any debate you will always have the advantage.'",
  },

];

// ── Sub-components ────────────────────────────────────────────────────────────

function ElevatorPanel({ elevator, sourceColor, targetColor }: {
  elevator: TransferCase["elevator"];
  sourceColor: string;
  targetColor: string;
}) {
  const [activeLevel, setActiveLevel] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-0">
      {elevator.map((step, i) => {
        const levelColor = ELEVATOR_LEVEL_COLORS[step.level];
        const isActive = activeLevel === i;
        const isTop = step.level === "invariant" || step.level === "theorem";

        return (
          <div
            key={i}
            className="cursor-pointer transition-all"
            onClick={() => setActiveLevel(isActive ? null : i)}
          >
            {/* Level connector line */}
            {i > 0 && (
              <div className="flex items-center ml-5 gap-1.5 my-0.5">
                <div className="w-px h-3" style={{ backgroundColor: "rgba(255,255,255,0.10)" }} />
                <div className="text-[7px] text-slate-700 uppercase tracking-widest">
                  {i === Math.floor(elevator.length / 2) ? "← TRANSFER →" : ""}
                </div>
              </div>
            )}

            <div
              className="rounded-lg px-3 py-2.5 transition-all"
              style={{
                backgroundColor: isActive ? `${levelColor}12` : isTop ? `${levelColor}08` : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? levelColor : `${levelColor}25`}`,
                boxShadow: isTop ? `0 0 16px ${levelColor}18` : "none",
              }}
            >
              <div className="flex items-start gap-2.5">
                {/* Level indicator */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="text-[8px] font-bold uppercase tracking-widest"
                    style={{ color: levelColor }}>
                    {ELEVATOR_LEVEL_LABELS[step.level]}
                  </div>
                  <div className="text-[8px] text-slate-600 italic">{step.domain.replace(/_/g, " ")}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-200 leading-snug">{step.label}</div>
                  {step.codifiability !== undefined && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="text-[8px] text-slate-600 uppercase tracking-widest">codifiability</div>
                      <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)", maxWidth: 60 }}>
                        <div style={{
                          width: `${step.codifiability * 100}%`, height: "100%",
                          backgroundColor: step.codifiability < 0.3 ? "#f59e0b" : step.codifiability < 0.6 ? "#8b5cf6" : "#3b82f6",
                        }} />
                      </div>
                      <span className="text-[8px] font-mono text-slate-600">{step.codifiability.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {isActive && step.note && (
                <div className="mt-2 text-[9px] text-slate-500 italic leading-relaxed pl-2"
                  style={{ borderLeft: `2px solid ${levelColor}40` }}>
                  {step.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TranslatorPanel({ translator, competing }: {
  translator: TransferCase["primary_translator"];
  competing?: TransferCase["competing_translator"];
}) {
  const [showCompeting, setShowCompeting] = useState(false);
  const active = showCompeting && competing ? competing : translator;

  return (
    <div className="flex flex-col gap-2">
      {/* Translator selector */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setShowCompeting(false)}
          className="px-2.5 py-1 rounded text-[9px] font-semibold transition-all"
          style={{
            backgroundColor: !showCompeting ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${!showCompeting ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: !showCompeting ? "#818cf8" : "#475569",
          }}
        >
          F: {translator.label}
        </button>
        {competing && (
          <button
            onClick={() => setShowCompeting(true)}
            className="px-2.5 py-1 rounded text-[9px] font-semibold transition-all"
            style={{
              backgroundColor: showCompeting ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${showCompeting ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: showCompeting ? "#818cf8" : "#475569",
            }}
          >
            G: {competing.label}
          </button>
        )}
        {competing && (
          <div className="text-[8px] text-slate-600 self-center ml-1">← natural transformation F⟹G</div>
        )}
      </div>

      {/* Competing divergence note */}
      {showCompeting && competing && (
        <div className="px-2.5 py-2 rounded-lg text-[9px] text-slate-400 leading-relaxed"
          style={{ backgroundColor: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <span className="font-bold text-indigo-400">Divergence: </span>{competing.divergence}
        </div>
      )}

      {/* Mapping steps */}
      <div className="space-y-1.5">
        {active.steps.map((step, i) => {
          const conf = step.confidence;
          const color = CONFIDENCE_COLOR[conf];
          const icon = CONFIDENCE_ICON[conf];
          return (
            <div key={i} className="flex items-start gap-2">
              {/* Source */}
              <div className="flex-1 min-w-0 px-2 py-1.5 rounded"
                style={{ backgroundColor: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <div className="text-[9px] text-blue-400 font-mono">{step.source_label}</div>
              </div>

              {/* Bridge symbol */}
              <div className="flex-shrink-0 flex flex-col items-center gap-0.5 mt-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}40` }}>
                  {icon}
                </div>
                {step.lost && (
                  <div className="w-[1px] h-2" style={{ backgroundColor: "rgba(239,68,68,0.3)" }} />
                )}
              </div>

              {/* Target */}
              <div className="flex-1 min-w-0 px-2 py-1.5 rounded"
                style={{ backgroundColor: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.12)" }}>
                <div className="text-[9px] text-pink-400 font-mono">{step.target_label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preserved invariants */}
      <div>
        <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Preserved invariants</div>
        <div className="flex flex-wrap gap-1">
          {active.steps.flatMap(s => s.preserved).filter((v, i, a) => a.indexOf(v) === i).map((inv, i) => (
            <span key={i} className="text-[8px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.15)" }}>
              {inv}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LossPanel({ losses }: { losses: StructuralLoss[] }) {
  return (
    <div className="space-y-2">
      {losses.map(loss => (
        <div key={loss.id} className="rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.04)" }}>
          <div className="px-2.5 py-2">
            <div className="text-[9px] font-semibold text-red-400 mb-1">✕ {loss.what}</div>
            <div className="text-[9px] text-slate-500 leading-relaxed mb-1">{loss.why}</div>
            <div className="text-[9px] text-slate-600 italic">{loss.consequence}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ValidationPanel({ protocols }: { protocols: ValidationProtocol[] }) {
  return (
    <div className="space-y-1.5">
      {protocols.map(vp => (
        <div key={vp.id} className="rounded-lg px-2.5 py-2"
          style={{ backgroundColor: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
          <div className="text-[8px] font-bold uppercase tracking-widest text-cyan-500 mb-1">
            {vp.domain.replace(/_/g, " ")} · test
          </div>
          <div className="text-[9px] text-slate-300 font-medium mb-0.5">{vp.test}</div>
          <div className="text-[9px] text-slate-600 italic">{vp.expected}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TransferWorkbench({ className = "", initialCase }: { className?: string; initialCase?: string }) {
  const [activeId, setActiveId] = useState(initialCase ?? DEMO_TRANSFERS[0].id);
  const [activeTab, setActiveTab] = useState<"elevator" | "translator" | "loss" | "validation">("elevator");

  const tc = DEMO_TRANSFERS.find(t => t.id === activeId) ?? DEMO_TRANSFERS[0];

  const TABS = [
    { id: "elevator" as const,   label: "Abstraction Elevator", icon: "↕" },
    { id: "translator" as const, label: "Functor / Translator",  icon: "⟺" },
    { id: "loss" as const,       label: "Structural Loss",       icon: "✕" },
    { id: "validation" as const, label: "Validation",            icon: "✓" },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Transfer Workbench · Functor Lab</div>
        <div className="text-xs font-semibold text-slate-200 mb-2">Cross-domain structure-preserving translation</div>

        {/* Transfer case selector */}
        <div className="flex flex-wrap gap-1.5">
          {DEMO_TRANSFERS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className="px-2 py-1 rounded text-[9px] font-medium transition-all"
              style={{
                backgroundColor: activeId === t.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeId === t.id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: activeId === t.id ? "#818cf8" : "#475569",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Domain bridge header */}
      <div className="flex-shrink-0 px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold" style={{ color: tc.source_color }}>
            {tc.source_domain.replace(/_/g, " ")}
          </span>
          <span className="text-slate-600 text-[10px]">⟹</span>
          <span className="text-[10px] font-semibold" style={{ color: "#8b5cf6" }}>
            {tc.via_concept.label}
          </span>
          <span className="text-slate-600 text-[10px]">⟹</span>
          <span className="text-[10px] font-semibold" style={{ color: tc.target_color }}>
            {tc.target_domain.replace(/_/g, " ")}
          </span>
        </div>
        <div className="text-[8px] font-mono text-slate-600">
          transferability {Math.round(tc.via_concept.transferability * 100)}%
        </div>
      </div>

      {/* Transfer claim */}
      <div className="flex-shrink-0 mx-4 my-2 px-3 py-2 rounded-lg"
        style={{ backgroundColor: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="text-[8px] font-bold uppercase tracking-widest text-purple-400 mb-1">Transfer claim</div>
        <p className="text-[9px] text-slate-400 leading-relaxed">{tc.transfer_claim}</p>
        {tc.historical_note && (
          <p className="text-[8px] text-slate-600 italic mt-1">{tc.historical_note}</p>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex-shrink-0 px-4 flex gap-1 pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? "rgba(255,255,255,0.06)" : "transparent",
              color: activeTab === tab.id ? "#e2e8f0" : "#475569",
              border: `1px solid ${activeTab === tab.id ? "rgba(255,255,255,0.10)" : "transparent"}`,
            }}
          >
            <span style={{ opacity: 0.7 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === "elevator" && (
          <ElevatorPanel elevator={tc.elevator} sourceColor={tc.source_color} targetColor={tc.target_color} />
        )}
        {activeTab === "translator" && (
          <TranslatorPanel translator={tc.primary_translator} competing={tc.competing_translator} />
        )}
        {activeTab === "loss" && (
          <LossPanel losses={tc.structural_losses} />
        )}
        {activeTab === "validation" && (
          <ValidationPanel protocols={tc.validation_protocols} />
        )}
      </div>
    </div>
  );
}
