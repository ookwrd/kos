import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { useGraphStore, type LayerKey } from "../store/graphStore";

// ── City size taxonomy ────────────────────────────────────────────────────────

type CitySize = "large" | "medium" | "small";

const CITY_SIZE: Record<string, CitySize> = {
  // Large flagship cities
  drug_discovery:                     "large",
  fukushima_governance:               "large",
  euv_lithography:                    "large",
  climate_policy:                     "large",
  surgical_robotics:                  "large",
  // Medium cities
  semiconductor_hardware:             "medium",
  extreme_environments:               "medium",
  pandemic_governance:                "medium",
  aviation_safety:                    "medium",
  disaster_response_operations:       "medium",
  public_health_coordination:         "medium",
  industrial_quality_control:         "medium",
  supply_chain_resilience:            "medium",
  translational_biomedicine:          "medium",
  developmental_biology_morphogenesis:"medium",
  mathematics_category_theory:        "medium",
  optimization_and_control:           "medium",
  information_theory:                 "medium",
  // Small cities
  causality_and_complex_systems:          "small",
  experimental_design_and_measurement:    "small",
  expert_preservation:                    "small",
  algebraic_structures:                   "small",
  graph_theory_and_networks:              "small",
  scientific_model_transfer:              "small",
};

const DISTRICT_RADIUS: Record<CitySize, number> = {
  large:  6.0,
  medium: 4.2,
  small:  2.8,
};

// ── Domain layout ─────────────────────────────────────────────────────────────

interface DomainCluster {
  domain: string;
  cx: number;
  cz: number;
  totalNodes: number;
  layers: LayerKey[];
}

const DOMAIN_POSITIONS: Record<string, [number, number]> = {
  // ── Governance & Safety (top center) — cluster centered near [0, -12] ────────
  fukushima_governance:                [  0,  -9],
  aviation_safety:                     [ 13, -19],
  pandemic_governance:                 [-13, -19],
  climate_policy:                      [  0, -28],
  disaster_response_operations:        [ 14,  -3],
  public_health_coordination:          [-14,  -3],
  // ── Advanced Manufacturing (right) — cluster centered near [36, 6] ────────────
  euv_lithography:                     [ 36,  -2],
  semiconductor_hardware:              [ 46,   7],
  surgical_robotics:                   [ 34,  16],
  industrial_quality_control:          [ 48,  -9],
  supply_chain_resilience:             [ 42,  21],
  extreme_environments:                [ 24, -11],
  // ── Discovery Science (left) — cluster centered near [-36, 6] ─────────────────
  drug_discovery:                      [-36,  -2],
  translational_biomedicine:           [-46,   7],
  developmental_biology_morphogenesis: [-34,  16],
  causality_and_complex_systems:       [-48,  -9],
  experimental_design_and_measurement: [-42,  21],
  expert_preservation:                 [-24, -11],
  // ── Mathematical Transfer (bottom) — cluster centered near [0, 33] ────────────
  mathematics_category_theory:         [  0,  28],
  algebraic_structures:                [-14,  38],
  graph_theory_and_networks:           [ 14,  38],
  information_theory:                  [-24,  24],
  optimization_and_control:            [ 24,  24],
  scientific_model_transfer:           [  0,  46],
};

const DOMAIN_COLORS: Record<string, string> = {
  // Governance & Safety (warm / orange / red tones)
  fukushima_governance:                "#f97316",
  aviation_safety:                     "#94a3b8",
  pandemic_governance:                 "#a855f7",
  climate_policy:                      "#06b6d4",
  disaster_response_operations:        "#fb923c",
  public_health_coordination:          "#fbbf24",
  // Advanced Manufacturing (green / yellow tones)
  euv_lithography:                     "#22c55e",
  semiconductor_hardware:              "#eab308",
  surgical_robotics:                   "#ec4899",
  industrial_quality_control:          "#84cc16",
  supply_chain_resilience:             "#0ea5e9",
  extreme_environments:                "#ef4444",
  // Discovery Science (blue / teal / emerald tones)
  drug_discovery:                      "#3b82f6",
  translational_biomedicine:           "#60a5fa",
  developmental_biology_morphogenesis: "#34d399",
  causality_and_complex_systems:       "#38bdf8",
  experimental_design_and_measurement: "#818cf8",
  expert_preservation:                 "#d97706",
  // Mathematical Transfer (purple / violet / fuchsia tones)
  mathematics_category_theory:         "#8b5cf6",
  algebraic_structures:                "#a78bfa",
  graph_theory_and_networks:           "#c084fc",
  information_theory:                  "#d946ef",
  optimization_and_control:            "#4ade80",
  scientific_model_transfer:           "#cbd5e1",
};

const DOMAIN_LABELS: Record<string, string> = {
  fukushima_governance:                "Governance",
  aviation_safety:                     "Aviation Safety",
  pandemic_governance:                 "Pandemic Gov.",
  climate_policy:                      "Climate Policy",
  disaster_response_operations:        "Disaster Ops",
  public_health_coordination:          "Public Health",
  euv_lithography:                     "EUV Operations",
  semiconductor_hardware:              "Semiconductor",
  surgical_robotics:                   "Surgical Robotics",
  industrial_quality_control:          "Industrial QC",
  supply_chain_resilience:             "Supply Chain",
  extreme_environments:                "Robotics Extreme",
  drug_discovery:                      "Drug Discovery",
  translational_biomedicine:           "Translational Bio",
  developmental_biology_morphogenesis: "Morphogenesis",
  causality_and_complex_systems:       "Causality",
  experimental_design_and_measurement: "Experimental",
  expert_preservation:                 "Expert Preserve",
  mathematics_category_theory:         "Category Theory",
  algebraic_structures:                "Algebra",
  graph_theory_and_networks:           "Graph Theory",
  information_theory:                  "Info Theory",
  optimization_and_control:            "Optimization",
  scientific_model_transfer:           "Model Transfer",
};

const DOMAIN_SUBLABELS: Record<string, string> = {
  fukushima_governance:                "TEPCO · seawall · expert dissent",
  aviation_safety:                     "737 MAX · MCAS · FAA capture",
  pandemic_governance:                 "WHO · aerosol · PHEIC delay",
  climate_policy:                      "Hansen · NDC gap · tipping points",
  disaster_response_operations:        "incident command · resource routing",
  public_health_coordination:          "surveillance · outbreak response",
  euv_lithography:                     "ASML · pre-pulse · tacit skill",
  semiconductor_hardware:              "etch · yield · process window",
  surgical_robotics:                   "da Vinci · haptic · OR governance",
  industrial_quality_control:          "SPC · defect detection · process drift",
  supply_chain_resilience:             "bottleneck · shock · rerouting",
  extreme_environments:                "Challenger · O-ring · robotics autonomy",
  drug_discovery:                      "KRAS · BBB · clinical calibration",
  translational_biomedicine:           "bench-to-bedside · trial design",
  developmental_biology_morphogenesis: "Turing patterns · Levin · morphogen",
  causality_and_complex_systems:       "Pearl · DAG · invariant prediction",
  experimental_design_and_measurement: "RCT · measurement validity · bias",
  expert_preservation:                 "tacit knowledge · retirement · transfer",
  mathematics_category_theory:         "functors · natural transformations",
  algebraic_structures:                "groups · rings · Galois · codes",
  graph_theory_and_networks:           "spectral · flow · community detection",
  information_theory:                  "Shannon · entropy · channel capacity",
  optimization_and_control:            "Bellman · control · optimal transport",
  scientific_model_transfer:           "abstraction · invariant · domain bridge",
};

const DOMAIN_NODE_COUNTS: Record<string, number> = {
  fukushima_governance:                82,
  aviation_safety:                     71,
  pandemic_governance:                 68,
  climate_policy:                      75,
  disaster_response_operations:        44,
  public_health_coordination:          41,
  euv_lithography:                     88,
  semiconductor_hardware:              79,
  surgical_robotics:                   86,
  industrial_quality_control:          52,
  supply_chain_resilience:             48,
  extreme_environments:                63,
  drug_discovery:                      94,
  translational_biomedicine:           57,
  developmental_biology_morphogenesis: 49,
  causality_and_complex_systems:       38,
  experimental_design_and_measurement: 36,
  expert_preservation:                 32,
  mathematics_category_theory:         61,
  algebraic_structures:                34,
  graph_theory_and_networks:           37,
  information_theory:                  42,
  optimization_and_control:            55,
  scientific_model_transfer:           29,
};

// ── Data quality / grounding status per domain ────────────────────────────────

type Grounding = "source_grounded" | "hybrid" | "speculative";

const DOMAIN_GROUNDING: Record<string, Grounding> = {
  // Source-grounded: historically verifiable, named actors, real technical facts
  fukushima_governance:                "source_grounded",
  aviation_safety:                     "source_grounded",
  pandemic_governance:                 "source_grounded",
  drug_discovery:                      "source_grounded",
  euv_lithography:                     "source_grounded",
  extreme_environments:                "source_grounded",
  climate_policy:                      "source_grounded",
  surgical_robotics:                   "source_grounded",
  mathematics_category_theory:         "source_grounded",
  causality_and_complex_systems:       "source_grounded",
  information_theory:                  "source_grounded",
  graph_theory_and_networks:           "source_grounded",
  // Hybrid: structured around real literature, synthetic edges
  semiconductor_hardware:              "hybrid",
  translational_biomedicine:           "hybrid",
  developmental_biology_morphogenesis: "hybrid",
  experimental_design_and_measurement: "hybrid",
  optimization_and_control:            "hybrid",
  algebraic_structures:                "hybrid",
  // Speculative: domain is real, but fixture content is synthesized
  disaster_response_operations:        "speculative",
  public_health_coordination:          "speculative",
  industrial_quality_control:          "speculative",
  supply_chain_resilience:             "speculative",
  expert_preservation:                 "speculative",
  scientific_model_transfer:           "speculative",
};

const GROUNDING_COLOR: Record<Grounding, string> = {
  source_grounded: "#22c55e",
  hybrid:          "#eab308",
  speculative:     "#94a3b8",
};

const GROUNDING_LABEL: Record<Grounding, string> = {
  source_grounded: "SG",
  hybrid:          "HY",
  speculative:     "SC",
};

// ── District layout per city size ─────────────────────────────────────────────

interface DistrictDef { dx: number; dz: number; r: number; color: string; label: string; icon: string }

const DISTRICT_COLORS = {
  evidence:   "#3b82f6",
  governance: "#8b5cf6",
  tacit:      "#06b6d4",
  expert:     "#d97706",
  decision:   "#f97316",
};

function domainDistricts(size: CitySize): DistrictDef[] {
  if (size === "large") {
    return [
      { dx: -3.2, dz: -2.6, r: 1.5, color: DISTRICT_COLORS.evidence,   label: "Evidence Hub",        icon: "◎" },
      { dx:  3.2, dz: -2.6, r: 1.4, color: DISTRICT_COLORS.governance,  label: "Governance Chamber",  icon: "⬡" },
      { dx:  0.0, dz:  3.5, r: 1.5, color: DISTRICT_COLORS.tacit,       label: "Tacit Reservoir",     icon: "◌" },
      { dx:  3.0, dz:  2.8, r: 1.2, color: DISTRICT_COLORS.expert,      label: "Expert Archive",      icon: "⊙" },
      { dx: -3.0, dz:  2.8, r: 1.2, color: DISTRICT_COLORS.decision,    label: "Decision Core",       icon: "▶" },
    ];
  }
  if (size === "medium") {
    return [
      { dx: -2.0, dz: -1.8, r: 1.1, color: DISTRICT_COLORS.evidence,   label: "Evidence Hub",    icon: "◎" },
      { dx:  2.0, dz: -1.8, r: 1.0, color: DISTRICT_COLORS.governance,  label: "Governance",      icon: "⬡" },
      { dx:  0.0, dz:  2.2, r: 1.1, color: DISTRICT_COLORS.tacit,       label: "Tacit",           icon: "◌" },
    ];
  }
  return [
    { dx: -1.3, dz: -1.0, r: 0.8, color: DISTRICT_COLORS.evidence,   label: "Evidence", icon: "◎" },
    { dx:  1.3, dz:  1.0, r: 0.7, color: DISTRICT_COLORS.governance,  label: "Gov.",     icon: "⬡" },
  ];
}

const CROSS_DOMAIN_BRIDGES: Array<{ id: string; src: string; tgt: string; strength: number; label: string; color: string }> = [
  // ── High-stakes governance bridges ───────────────────────────────────────────
  { id: "b-deviance-normalization",     src: "extreme_environments",               tgt: "fukushima_governance",              strength: 0.92, label: "Deviance Normalization",     color: "#ef4444" },
  { id: "b-737max-challenger",          src: "aviation_safety",                    tgt: "extreme_environments",              strength: 0.89, label: "Deviance Pattern",           color: "#94a3b8" },
  { id: "b-auth-override",             src: "surgical_robotics",                  tgt: "fukushima_governance",              strength: 0.88, label: "Authority Override",         color: "#f97316" },
  { id: "b-climate-discount",          src: "climate_policy",                     tgt: "fukushima_governance",              strength: 0.85, label: "Political Discount",         color: "#06b6d4" },
  { id: "b-pandemic-tepco",            src: "pandemic_governance",                tgt: "fukushima_governance",              strength: 0.83, label: "Expert Override Schema",     color: "#a855f7" },
  { id: "b-aviation-pandemic",         src: "aviation_safety",                    tgt: "pandemic_governance",               strength: 0.79, label: "Regulatory Capture",         color: "#94a3b8" },
  { id: "b-disaster-public-health",    src: "disaster_response_operations",       tgt: "public_health_coordination",        strength: 0.81, label: "Crisis Coordination",        color: "#fb923c" },
  { id: "b-climate-disaster",          src: "climate_policy",                     tgt: "disaster_response_operations",      strength: 0.77, label: "Adaptive Risk Mgmt",        color: "#06b6d4" },
  { id: "b-aviation-disaster",         src: "aviation_safety",                    tgt: "disaster_response_operations",      strength: 0.74, label: "Crisis Command",             color: "#94a3b8" },
  { id: "b-pandemic-public-health",    src: "pandemic_governance",                tgt: "public_health_coordination",        strength: 0.80, label: "Health Governance",          color: "#a855f7" },
  { id: "b-extreme-fukushima-2",       src: "extreme_environments",               tgt: "aviation_safety",                   strength: 0.86, label: "Single-Point Failure",       color: "#ef4444" },
  // ── Manufacturing federation bridges ─────────────────────────────────────────
  { id: "b-euv-semiconductor",         src: "euv_lithography",                    tgt: "semiconductor_hardware",            strength: 0.88, label: "Process Coupling",           color: "#22c55e" },
  { id: "b-euv-surgical-tacit",        src: "euv_lithography",                    tgt: "surgical_robotics",                 strength: 0.83, label: "Tacit Skill Transfer",       color: "#22c55e" },
  { id: "b-euv-industrial",            src: "euv_lithography",                    tgt: "industrial_quality_control",        strength: 0.78, label: "Precision Control",          color: "#22c55e" },
  { id: "b-semiconductor-industrial",  src: "semiconductor_hardware",             tgt: "industrial_quality_control",        strength: 0.81, label: "Yield Optimization",         color: "#eab308" },
  { id: "b-surgical-supply",           src: "surgical_robotics",                  tgt: "supply_chain_resilience",           strength: 0.72, label: "Medical Supply Chain",       color: "#ec4899" },
  { id: "b-industrial-supply",         src: "industrial_quality_control",         tgt: "supply_chain_resilience",           strength: 0.75, label: "Quality-Supply Link",        color: "#84cc16" },
  { id: "b-extreme-disaster",          src: "extreme_environments",               tgt: "disaster_response_operations",      strength: 0.76, label: "Robotic Crisis Response",    color: "#ef4444" },
  // ── Discovery Science bridges ─────────────────────────────────────────────────
  { id: "b-drug-translational",        src: "drug_discovery",                     tgt: "translational_biomedicine",         strength: 0.87, label: "Bench-to-Bedside",          color: "#3b82f6" },
  { id: "b-drug-developmental",        src: "drug_discovery",                     tgt: "developmental_biology_morphogenesis",strength: 0.74, label: "Morphogen Targets",        color: "#3b82f6" },
  { id: "b-drug-causality",            src: "drug_discovery",                     tgt: "causality_and_complex_systems",     strength: 0.79, label: "Causal Trial Design",        color: "#3b82f6" },
  { id: "b-translational-design",      src: "translational_biomedicine",          tgt: "experimental_design_and_measurement",strength: 0.82, label: "Trial Methodology",        color: "#60a5fa" },
  { id: "b-causality-design",          src: "causality_and_complex_systems",      tgt: "experimental_design_and_measurement",strength: 0.80, label: "Causal Experiment",        color: "#38bdf8" },
  { id: "b-expert-translational",      src: "expert_preservation",                tgt: "translational_biomedicine",         strength: 0.71, label: "Clinical Tacit Knowledge",   color: "#d97706" },
  { id: "b-developmental-causality",   src: "developmental_biology_morphogenesis",tgt: "causality_and_complex_systems",     strength: 0.73, label: "Developmental Causality",    color: "#34d399" },
  // ── Mathematical Transfer bridges ─────────────────────────────────────────────
  { id: "b-cattheory-algebraic",       src: "mathematics_category_theory",        tgt: "algebraic_structures",              strength: 0.91, label: "Categorical Algebra",        color: "#8b5cf6" },
  { id: "b-cattheory-infotheory",      src: "mathematics_category_theory",        tgt: "information_theory",                strength: 0.85, label: "Entropy Functors",           color: "#8b5cf6" },
  { id: "b-cattheory-optimization",    src: "mathematics_category_theory",        tgt: "optimization_and_control",          strength: 0.82, label: "Optimal Transport",          color: "#8b5cf6" },
  { id: "b-algebraic-graph",           src: "algebraic_structures",               tgt: "graph_theory_and_networks",         strength: 0.83, label: "Spectral Graph Theory",      color: "#a78bfa" },
  { id: "b-infotheory-optimization",   src: "information_theory",                 tgt: "optimization_and_control",          strength: 0.80, label: "Rate-Distortion",            color: "#d946ef" },
  { id: "b-graph-optimization",        src: "graph_theory_and_networks",          tgt: "optimization_and_control",          strength: 0.77, label: "Network Flow",               color: "#c084fc" },
  { id: "b-cattheory-modelxfer",       src: "mathematics_category_theory",        tgt: "scientific_model_transfer",         strength: 0.89, label: "Meta-Category of Models",    color: "#8b5cf6" },
  { id: "b-algebraic-infotheory",      src: "algebraic_structures",               tgt: "information_theory",                strength: 0.86, label: "Coding Theory",              color: "#a78bfa" },
  // ── Cross-federation strategic bridges ───────────────────────────────────────
  { id: "b-adjunction-alignment",      src: "mathematics_category_theory",        tgt: "euv_lithography",                   strength: 0.76, label: "Formal Grounding",           color: "#8b5cf6" },
  { id: "b-infotheory-drug",           src: "information_theory",                 tgt: "drug_discovery",                    strength: 0.73, label: "Entropy-Based Drug Design",  color: "#d946ef" },
  { id: "b-calibration-decay",         src: "semiconductor_hardware",             tgt: "drug_discovery",                    strength: 0.74, label: "Calibration Drift",           color: "#eab308" },
  { id: "b-optimization-industrial",   src: "optimization_and_control",           tgt: "industrial_quality_control",        strength: 0.79, label: "Control Theory → QC",        color: "#4ade80" },
  { id: "b-drug-climate",              src: "drug_discovery",                     tgt: "climate_policy",                    strength: 0.68, label: "Threshold Gate Schema",       color: "#3b82f6" },
  { id: "b-causality-pandemic",        src: "causality_and_complex_systems",      tgt: "pandemic_governance",               strength: 0.76, label: "Causal Inference in Policy", color: "#38bdf8" },
  { id: "b-expert-euv",               src: "expert_preservation",                tgt: "euv_lithography",                   strength: 0.77, label: "Tacit EUV Knowledge",        color: "#d97706" },
  { id: "b-graph-pandemic",            src: "graph_theory_and_networks",          tgt: "pandemic_governance",               strength: 0.75, label: "Network Epidemiology",       color: "#c084fc" },
  { id: "b-modelxfer-drug",            src: "scientific_model_transfer",          tgt: "drug_discovery",                    strength: 0.71, label: "Pharmacological Transfer",   color: "#cbd5e1" },
  { id: "b-developmental-optimization",src: "developmental_biology_morphogenesis",tgt: "optimization_and_control",          strength: 0.69, label: "Morphogenetic Optim.",       color: "#34d399" },
  { id: "b-supply-disaster",           src: "supply_chain_resilience",            tgt: "disaster_response_operations",      strength: 0.73, label: "Supply Resilience in Crisis",color: "#0ea5e9" },
  { id: "b-infotheory-pandemic",       src: "information_theory",                 tgt: "pandemic_governance",               strength: 0.71, label: "Info Asymmetry in Health",   color: "#d946ef" },
  { id: "b-surgical-developmental",    src: "surgical_robotics",                  tgt: "developmental_biology_morphogenesis",strength: 0.67, label: "Bio-Inspired Robotics",    color: "#ec4899" },
  { id: "b-optimization-climate",      src: "optimization_and_control",           tgt: "climate_policy",                    strength: 0.70, label: "Climate Optimization",        color: "#4ade80" },
  { id: "b-modelxfer-climate",         src: "scientific_model_transfer",          tgt: "climate_policy",                    strength: 0.72, label: "Climate Model Transfer",      color: "#cbd5e1" },
  { id: "b-public-drug",               src: "public_health_coordination",         tgt: "drug_discovery",                    strength: 0.69, label: "Drug Policy Interface",       color: "#fbbf24" },
];

// ── Metro region data ─────────────────────────────────────────────────────────

interface MetroRegion {
  id: string;
  label: string;
  domains: string[];
  color: string;
  cx: number;
  cz: number;
  rx: number;  // semi-axis X
  rz: number;  // semi-axis Z
}

const METRO_REGIONS: MetroRegion[] = (() => {
  const groups: { id: string; label: string; domains: string[]; color: string }[] = [
    {
      id: "governance-safety",
      label: "Governance & Safety Federation",
      domains: ["fukushima_governance", "aviation_safety", "pandemic_governance", "disaster_response_operations", "public_health_coordination"],
      color: "#f97316",
    },
    {
      id: "climate-policy",
      label: "Climate & Environmental",
      domains: ["climate_policy"],
      color: "#06b6d4",
    },
    {
      id: "precision-manufacturing",
      label: "Precision Manufacturing",
      domains: ["euv_lithography", "semiconductor_hardware", "industrial_quality_control", "extreme_environments"],
      color: "#22c55e",
    },
    {
      id: "biomedical-systems",
      label: "Biomedical Systems",
      domains: ["surgical_robotics", "supply_chain_resilience", "translational_biomedicine"],
      color: "#ec4899",
    },
    {
      id: "discovery-science",
      label: "Discovery Science",
      domains: ["drug_discovery", "developmental_biology_morphogenesis", "causality_and_complex_systems", "experimental_design_and_measurement", "expert_preservation"],
      color: "#3b82f6",
    },
    {
      id: "mathematical-sciences",
      label: "Mathematical Sciences",
      domains: ["mathematics_category_theory", "algebraic_structures", "graph_theory_and_networks", "information_theory", "optimization_and_control", "scientific_model_transfer"],
      color: "#8b5cf6",
    },
  ];

  return groups.map(g => {
    const positions = g.domains.map(d => DOMAIN_POSITIONS[d] ?? [0, 0]);
    const cx = positions.reduce((s, p) => s + p[0], 0) / positions.length;
    const cz = positions.reduce((s, p) => s + p[1], 0) / positions.length;
    const dists = positions.map(p => Math.sqrt((p[0] - cx) ** 2 + (p[1] - cz) ** 2));
    const maxDist = Math.max(...dists, 6);
    return { ...g, cx, cz, rx: maxDist + 10, rz: maxDist + 8 };
  });
})();

function MetroRegionHalo({ region }: { region: MetroRegion }) {
  const { camera } = useThree();
  const fillRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // Use camera Y height as a zoom proxy (high Y = zoomed out)
    const camY = camera.position.y;
    const t = Math.max(0, Math.min(1, (camY - 12) / 60)); // 0 at y=12, 1 at y=72
    const fillOpacity = 0.05 + t * 0.12;  // 0.05 → 0.17
    const edgeOpacity = 0.12 + t * 0.25;  // 0.12 → 0.37

    if (fillRef.current) {
      (fillRef.current.material as THREE.MeshBasicMaterial).opacity = fillOpacity;
    }
    if (ringRef.current) {
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = edgeOpacity;
    }
  });

  const innerR = 0.97; // slightly less than 1 so ring is thin relative to halo
  const outerR = 1.00;

  return (
    <group position={[region.cx, 0.02, region.cz]}>
      {/* Filled ellipse — soft color wash */}
      <group scale={[region.rx, 1, region.rz]}>
        <mesh ref={fillRef} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1, 72]} />
          <meshBasicMaterial color={region.color} transparent opacity={0.08} depthWrite={false} />
        </mesh>
      </group>

      {/* Edge ring — slightly brighter to define the boundary */}
      <group scale={[region.rx, 1, region.rz]}>
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[innerR, outerR, 72]} />
          <meshBasicMaterial color={region.color} transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>

      {/* Region label — always dim, scales with zoom */}
      <Text
        position={[0, 0.12, region.rz * 0.72]}
        fontSize={2.4}
        color={region.color}
        anchorX="center" anchorY="middle"
        fillOpacity={0.35}
      >
        {region.label}
      </Text>
    </group>
  );
}

// ── City Glow — visible at overview zoom ──────────────────────────────────────

function CityGlow({ domain, cx, cz }: { domain: string; cx: number; cz: number }) {
  const color = DOMAIN_COLORS[domain] ?? "#6366f1";
  const size  = CITY_SIZE[domain] ?? "medium";
  const glowR = size === "large" ? 11 : size === "medium" ? 8 : 5.5;
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.06 + 0.04 * Math.sin(t * 0.5 + cx * 0.1);
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.05, cz]}>
      <circleGeometry args={[glowR, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

// ── Grounding indicator dot ───────────────────────────────────────────────────

function GroundingIndicator({ domain, cx, cz }: { domain: string; cx: number; cz: number }) {
  const grounding: Grounding = DOMAIN_GROUNDING[domain] ?? "speculative";
  const color = GROUNDING_COLOR[grounding];
  const size  = CITY_SIZE[domain] ?? "medium";
  const r = DISTRICT_RADIUS[size];
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = grounding === "source_grounded"
      ? 0.55 + 0.25 * Math.sin(t * 1.2 + cx * 0.2)
      : grounding === "hybrid"
      ? 0.35 + 0.15 * Math.sin(t * 0.8 + cx * 0.2)
      : 0.22;
  });

  // Position at the north edge of the city ring
  return (
    <mesh ref={ref} position={[cx, 0.25, cz - r - 0.5]}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
}

// ── District sub-zones (visible when city selected) ───────────────────────────

function DistrictZones({ cx, cz, size, visible }: {
  cx: number; cz: number; size: CitySize; visible: boolean;
}) {
  const districts = useMemo(() => domainDistricts(size), [size]);
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    districts.forEach((d, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const targetOpacity = visible ? 0.12 + 0.06 * Math.sin(t * 0.6 + i) : 0.0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.08;
    });
  });

  if (!visible) return null;

  return (
    <group>
      {districts.map((d, i) => (
        <group key={i} position={[cx + d.dx, 0, cz + d.dz]}>
          {/* District platform */}
          <mesh
            ref={el => { meshRefs.current[i] = el; }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <circleGeometry args={[d.r, 32]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.10} depthWrite={false} />
          </mesh>

          {/* District ring border */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[d.r - 0.12, d.r, 32]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.30} depthWrite={false} />
          </mesh>

          {/* District label */}
          <Text
            position={[0, 0.35, 0]}
            fontSize={0.32}
            color={d.color}
            anchorX="center" anchorY="middle"
            fillOpacity={0.75}
          >
            {d.icon} {d.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

// ── Swarm Reservoir ───────────────────────────────────────────────────────────

interface SwarmParticleSpec {
  orbitR: number;
  phase: number;
  speed: number;
  yBase: number;
  size: number;
  pulseFreq: number;
}

function SwarmReservoir({ domain, cx, cz }: { domain: string; cx: number; cz: number }) {
  const color = DOMAIN_COLORS[domain] ?? "#6366f1";
  const size  = CITY_SIZE[domain] ?? "medium";
  const count = size === "large" ? 7 : size === "medium" ? 5 : 3;
  const baseR = DISTRICT_RADIUS[size] + 1.8;

  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);

  const params = useMemo<SwarmParticleSpec[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      orbitR:    baseR + (i % 3) * 2.5,
      phase:     (i / count) * Math.PI * 2,
      speed:     0.05 + i * 0.025,
      yBase:     0.35 + (i % 3) * 0.22,
      size:      0.28 - i * 0.015,
      pulseFreq: 0.7  + i * 0.25,
    })), [count, baseR]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    params.forEach((p, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const angle = p.phase + t * p.speed;
      mesh.position.x = Math.cos(angle) * p.orbitR;
      mesh.position.z = Math.sin(angle) * p.orbitR;
      mesh.position.y = p.yBase + Math.sin(t * p.pulseFreq + p.phase) * 0.14;
      const s = p.size * (0.72 + 0.28 * Math.sin(t * p.pulseFreq * 1.6 + p.phase));
      mesh.scale.setScalar(s);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 + 0.35 * Math.sin(t * p.pulseFreq * 0.9 + p.phase * 1.3);
    });
  });

  return (
    <group position={[cx, 0, cz]}>
      {params.map((_, i) => (
        <mesh key={i} ref={el => { meshRefs.current[i] = el; }}>
          <sphereGeometry args={[1, 7, 7]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── Building layout per city size ─────────────────────────────────────────────

interface BuildingSpec { dx: number; dz: number; h: number; color: string }

const ALT_COLORS: Record<string, string> = {
  "#3b82f6": "#60a5fa", "#f97316": "#fb923c", "#22c55e": "#4ade80",
  "#06b6d4": "#22d3ee", "#8b5cf6": "#a78bfa", "#ec4899": "#f472b6",
  "#eab308": "#fbbf24", "#ef4444": "#f87171", "#a855f7": "#c084fc",
  "#94a3b8": "#cbd5e1",
};

function domainBuildings(domain: string): BuildingSpec[] {
  const c = DOMAIN_COLORS[domain] ?? "#6366f1";
  const a = ALT_COLORS[c] ?? c;
  const size = CITY_SIZE[domain] ?? "medium";

  if (size === "large") {
    // 16 buildings: tall central tower + inner ring + outer ring
    return [
      { dx:  0.0,  dz:  0.0,  h: 8.5, color: c },
      { dx: -1.8,  dz: -1.8,  h: 6.0, color: a },
      { dx:  1.8,  dz: -1.8,  h: 5.2, color: c },
      { dx: -1.8,  dz:  1.6,  h: 5.6, color: a },
      { dx:  1.8,  dz:  1.6,  h: 4.8, color: c },
      { dx:  0.0,  dz: -3.0,  h: 4.2, color: a },
      { dx:  0.0,  dz:  3.0,  h: 3.9, color: c },
      { dx: -3.0,  dz:  0.0,  h: 3.6, color: a },
      { dx:  3.0,  dz:  0.0,  h: 3.4, color: c },
      { dx: -4.0,  dz: -3.2,  h: 2.8, color: a },
      { dx:  0.0,  dz: -4.2,  h: 3.0, color: c },
      { dx:  4.0,  dz: -3.2,  h: 2.4, color: a },
      { dx: -4.4,  dz:  0.4,  h: 2.2, color: c },
      { dx:  4.4,  dz:  0.4,  h: 2.4, color: a },
      { dx: -3.6,  dz:  3.6,  h: 2.0, color: c },
      { dx:  3.6,  dz:  3.6,  h: 2.2, color: a },
    ];
  }

  if (size === "medium") {
    return [
      { dx:  0.0,  dz:  0.0,  h: 5.0, color: c },
      { dx: -1.4,  dz: -1.4,  h: 2.8, color: a },
      { dx:  0.0,  dz: -1.9,  h: 3.8, color: c },
      { dx:  1.4,  dz: -1.1,  h: 2.4, color: a },
      { dx: -1.7,  dz:  0.6,  h: 2.2, color: c },
      { dx:  1.7,  dz:  0.8,  h: 2.8, color: a },
      { dx: -0.8,  dz:  1.9,  h: 3.2, color: c },
      { dx:  0.9,  dz:  1.9,  h: 2.2, color: a },
    ];
  }

  // Small: 4 modest buildings
  return [
    { dx: -0.8,  dz: -0.8,  h: 2.0, color: c },
    { dx:  0.8,  dz: -0.6,  h: 3.0, color: a },
    { dx: -0.4,  dz:  1.0,  h: 2.4, color: c },
    { dx:  0.8,  dz:  1.0,  h: 1.6, color: a },
  ];
}

// ── Three.js components ───────────────────────────────────────────────────────

function Building({ dx, dz, h, color, cx, cz, selected, onGroupClick }: {
  dx: number; dz: number; h: number; color: string;
  cx: number; cz: number; selected: boolean; onGroupClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const tgt = (hovered || selected) ? h * 1.25 : h;
    const cur = meshRef.current.scale.y;
    meshRef.current.scale.y += (tgt - cur) * Math.min(delta * 6, 1);
    meshRef.current.position.y = meshRef.current.scale.y * 0.5;
  });

  return (
    <group position={[cx + dx, 0, cz + dz]}>
      <mesh
        ref={meshRef}
        scale={[1, h, 1]}
        position={[0, h * 0.5, 0]}
        onClick={e => { e.stopPropagation(); onGroupClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={(hovered || selected) ? 0.55 : 0.12}
          transparent opacity={(hovered || selected) ? 0.98 : 0.74}
          roughness={0.32} metalness={0.48}
        />
      </mesh>

      {selected && (
        <mesh position={[0, h + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.28} />
        </mesh>
      )}

      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[1.6, 0.16, 1.6]} />
        <meshStandardMaterial color="#0a1a10" roughness={0.9} />
      </mesh>
    </group>
  );
}

function InternalStreets({ cx, cz, color, size }: {
  cx: number; cz: number; color: string; size: CitySize;
}) {
  if (size === "small") return null;

  const r = DISTRICT_RADIUS[size];
  const opacity = 0.10;
  const lineWidth = 0.4;

  if (size === "large") {
    return (
      <>
        <Line points={[[cx - r, 0, cz - 2.0], [cx + r, 0, cz - 2.0]]} color={color} lineWidth={lineWidth} opacity={opacity} transparent />
        <Line points={[[cx - r, 0, cz + 2.0], [cx + r, 0, cz + 2.0]]} color={color} lineWidth={lineWidth} opacity={opacity} transparent />
        <Line points={[[cx - 2.0, 0, cz - r], [cx - 2.0, 0, cz + r]]} color={color} lineWidth={lineWidth} opacity={opacity} transparent />
        <Line points={[[cx + 2.0, 0, cz - r], [cx + 2.0, 0, cz + r]]} color={color} lineWidth={lineWidth} opacity={opacity} transparent />
        <Line points={[[cx - 3.6, 0, cz - 3.6], [cx + 3.6, 0, cz + 3.6]]} color={color} lineWidth={0.25} opacity={0.05} transparent />
        <Line points={[[cx + 3.6, 0, cz - 3.6], [cx - 3.6, 0, cz + 3.6]]} color={color} lineWidth={0.25} opacity={0.05} transparent />
      </>
    );
  }

  // Medium: single cross
  return (
    <>
      <Line points={[[cx - r, 0, cz], [cx + r, 0, cz]]} color={color} lineWidth={lineWidth} opacity={opacity} transparent />
      <Line points={[[cx, 0, cz - r], [cx, 0, cz + r]]} color={color} lineWidth={lineWidth} opacity={opacity} transparent />
    </>
  );
}

function DomainDistrict({ cluster, selected, onClick }: {
  cluster: DomainCluster; selected: boolean; onClick: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const color = DOMAIN_COLORS[cluster.domain] ?? "#6366f1";
  const label = DOMAIN_LABELS[cluster.domain] ?? cluster.domain;
  const sublabel = DOMAIN_SUBLABELS[cluster.domain] ?? "";
  const size = CITY_SIZE[cluster.domain] ?? "medium";
  const r = DISTRICT_RADIUS[size];
  const buildings = useMemo(() => domainBuildings(cluster.domain), [cluster.domain]);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.07;
  });

  const labelZ = cluster.cz + r + 1.4;

  return (
    <group>
      {/* Outer rotating ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[cluster.cx, -0.10, cluster.cz]}>
        <ringGeometry args={[r - 0.25, r + 0.05, 64]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.30 : 0.08} />
      </mesh>

      {/* Ground platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cluster.cx, -0.15, cluster.cz]} onClick={onClick}>
        <circleGeometry args={[r, 64]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.07 : 0.025} />
      </mesh>

      {/* Inner border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cluster.cx, -0.12, cluster.cz]}>
        <ringGeometry args={[r - 0.5, r - 0.25, 48]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.18 : 0.05} />
      </mesh>

      {/* Internal streets */}
      <InternalStreets cx={cluster.cx} cz={cluster.cz} color={color} size={size} />

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building
          key={i}
          cx={cluster.cx} cz={cluster.cz}
          dx={b.dx} dz={b.dz} h={b.h}
          color={b.color} selected={selected} onGroupClick={onClick}
        />
      ))}

      {/* Domain label */}
      <Text
        position={[cluster.cx, 0.3, labelZ]}
        fontSize={size === "large" ? 0.72 : size === "medium" ? 0.58 : 0.50}
        color={selected ? color : "#475569"}
        anchorX="center" anchorY="middle"
        outlineWidth={0.04} outlineColor="#020610"
      >
        {label}
      </Text>
      <Text
        position={[cluster.cx, -0.15, labelZ]}
        fontSize={size === "small" ? 0.22 : 0.26}
        color={selected ? "#94a3b8" : "#1e293b"}
        anchorX="center" anchorY="middle"
      >
        {sublabel}
      </Text>

      {/* Node count badge */}
      {cluster.totalNodes > 0 && (
        <Text
          position={[cluster.cx + r + 0.6, 0.5, cluster.cz]}
          fontSize={0.30}
          color={selected ? color : "#334155"}
          anchorX="center" anchorY="middle"
        >
          ~{cluster.totalNodes}n
        </Text>
      )}

      {/* Size indicator for large cities */}
      {size === "large" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cluster.cx, -0.18, cluster.cz]}>
          <ringGeometry args={[r + 0.5, r + 0.7, 64]} />
          <meshBasicMaterial color={color} transparent opacity={selected ? 0.12 : 0.03} />
        </mesh>
      )}

      {/* District sub-zones — appear when city is selected */}
      <DistrictZones cx={cluster.cx} cz={cluster.cz} size={size} visible={selected} />
    </group>
  );
}

function BridgeArc({ src, tgt, strength, color, highlighted }: {
  src: [number, number]; tgt: [number, number]; strength: number; color: string; highlighted: boolean;
}) {
  const points = useMemo(() => {
    const numPts = 60;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= numPts; i++) {
      const t = i / numPts;
      const x = src[0] + (tgt[0] - src[0]) * t;
      const z = src[1] + (tgt[1] - src[1]) * t;
      const arcH = Math.sin(Math.PI * t) * (highlighted ? 8 : 6) * strength;
      pts.push(new THREE.Vector3(x, arcH + 0.1, z));
    }
    return pts;
  }, [src, tgt, strength, highlighted]);

  if (highlighted) {
    return (
      <>
        {/* Glow halo */}
        <Line points={points} color={color} lineWidth={9} opacity={0.10} transparent />
        {/* Bright solid arc */}
        <Line points={points} color={color} lineWidth={3.5} opacity={0.90} transparent />
      </>
    );
  }

  return (
    <Line
      points={points}
      color={color}
      lineWidth={strength > 0.88 ? 2.2 : strength > 0.80 ? 1.6 : 1.2}
      opacity={strength > 0.88 ? 0.58 : strength > 0.80 ? 0.38 : 0.25}
      transparent
      dashed
      dashScale={0.5}
      dashSize={1.0}
      gapSize={0.5}
    />
  );
}

function RoadNetwork({ clusters }: { clusters: DomainCluster[] }) {
  const roads = useMemo(() => {
    const lines: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const a = clusters[i], b = clusters[j];
        const dist = Math.sqrt((a.cx - b.cx) ** 2 + (a.cz - b.cz) ** 2);
        if (dist < 16) {
          lines.push([
            new THREE.Vector3(a.cx, -0.05, a.cz),
            new THREE.Vector3(b.cx, -0.05, b.cz),
          ]);
        }
      }
    }
    return lines;
  }, [clusters]);

  return (
    <>
      {roads.map((pts, i) => (
        <Line key={i} points={pts} color="#1e293b" lineWidth={0.5} opacity={0.35} transparent />
      ))}
    </>
  );
}

function Particles({ clusters }: { clusters: DomainCluster[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 160;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const cluster = clusters[i % clusters.length];
      const r = DISTRICT_RADIUS[CITY_SIZE[cluster?.domain ?? ""] ?? "medium"];
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * r * 1.2 + r * 0.3;
      return {
        x: (cluster?.cx ?? 0) + Math.cos(angle) * radius,
        y: Math.random() * 3,
        z: (cluster?.cz ?? 0) + Math.sin(angle) * radius,
        speed: Math.random() * 0.22 + 0.07,
        offset: Math.random() * Math.PI * 2,
        color: DOMAIN_COLORS[cluster?.domain ?? ""] ?? "#6366f1",
      };
    });
  }, [clusters]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((p, i) => {
      dummy.position.set(p.x, p.y + Math.sin(t * p.speed + p.offset) * 0.4, p.z);
      dummy.scale.setScalar(0.09);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.42} />
    </instancedMesh>
  );
}

function CameraController({ targetDomain, clusters, controlsRef }: {
  targetDomain: string | null;
  clusters: DomainCluster[];
  controlsRef: { current: any };
}) {
  const { camera } = useThree();
  const goalPos = useRef(new THREE.Vector3(0, 72, 64));
  const goalTarget = useRef(new THREE.Vector3(0, 0, 9));

  useFrame(() => {
    const cluster = targetDomain ? clusters.find(c => c.domain === targetDomain) : null;

    if (cluster) {
      const size = CITY_SIZE[cluster.domain] ?? "medium";
      const zH = size === "large" ? 22 : size === "medium" ? 17 : 13;
      const zD = size === "large" ? 22 : size === "medium" ? 17 : 13;
      goalPos.current.set(cluster.cx, zH, cluster.cz + zD);
      goalTarget.current.set(cluster.cx, 0, cluster.cz);
    } else {
      goalPos.current.set(0, 72, 64);
      goalTarget.current.set(0, 0, 9);
    }

    const ease = 0.048;
    camera.position.lerp(goalPos.current, ease);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(goalTarget.current, ease);
      controlsRef.current.update();
    }
  });

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

function useCityData(): { clusters: DomainCluster[] } {
  const { overview } = useGraphStore();
  return useMemo(() => {
    const demoClusters: DomainCluster[] = Object.entries(DOMAIN_POSITIONS).map(([domain, [cx, cz]]) => ({
      domain,
      cx,
      cz,
      totalNodes: DOMAIN_NODE_COUNTS[domain] ?? 20,
      layers: ["knowledge", "context", "agents", "governance"] as LayerKey[],
    }));

    if (!overview) return { clusters: demoClusters };

    const domains = new Set<string>();
    for (const layerData of Object.values(overview.layers)) {
      for (const node of layerData.nodes) {
        const d = (node.data as Record<string, unknown>)?.domain as string | null;
        if (d) domains.add(d);
      }
    }

    const domainList = [...domains];
    const clusterMap: Record<string, { nodes: number; layers: Set<LayerKey> }> = {};
    domainList.forEach(domain => {
      clusterMap[domain] = { nodes: 0, layers: new Set() };
      (Object.keys(overview.layers) as LayerKey[]).forEach(layer => {
        const layerData = overview.layers[layer];
        if (!layerData) return;
        const count = layerData.nodes.filter(n =>
          ((n.data as Record<string, unknown>)?.domain as string | null) === domain
        ).length;
        if (count > 0) {
          clusterMap[domain].nodes += count;
          clusterMap[domain].layers.add(layer);
        }
      });
    });

    const liveClusters: DomainCluster[] = domainList.map(domain => {
      const pos = DOMAIN_POSITIONS[domain] ?? [0, 0];
      const info = clusterMap[domain] ?? { nodes: 0, layers: new Set() };
      return { domain, cx: pos[0], cz: pos[1], totalNodes: info.nodes, layers: [...info.layers] };
    });

    for (const demo of demoClusters) {
      if (!liveClusters.find(c => c.domain === demo.domain)) {
        liveClusters.push(demo);
      }
    }

    return { clusters: liveClusters };
  }, [overview]);
}

interface Props { className?: string }

export function CityOverview({ className = "" }: Props) {
  const { overview, setDomainFilter, highlightedBridgeId } = useGraphStore();
  const [selected, setSelected] = useState<string | null>(null);
  const { clusters } = useCityData();
  const controlsRef = useRef<any>(null);

  const handleDomainClick = (domain: string) => {
    const next = selected === domain ? null : domain;
    setSelected(next);
    setDomainFilter(next);
  };

  const selectedCluster = clusters.find(c => c.domain === selected);

  // Group domains for display
  const largeCities  = clusters.filter(c => CITY_SIZE[c.domain] === "large");
  const mediumCities = clusters.filter(c => CITY_SIZE[c.domain] === "medium");
  const smallCities  = clusters.filter(c => CITY_SIZE[c.domain] === "small");

  function NavChip({ c }: { c: DomainCluster }) {
    const color = DOMAIN_COLORS[c.domain] ?? "#6366f1";
    const isActive = selected === c.domain;
    const size = CITY_SIZE[c.domain] ?? "medium";
    return (
      <button
        onClick={() => handleDomainClick(c.domain)}
        className="flex items-center gap-2 rounded-lg text-left transition-all"
        style={{
          padding: size === "large" ? "5px 10px" : size === "medium" ? "4px 8px" : "3px 7px",
          fontSize: size === "large" ? 10 : size === "medium" ? 9 : 8,
          fontWeight: 500,
          background: isActive ? `${color}18` : "var(--bg-panel)",
          border: `1px solid ${isActive ? `${color}45` : "var(--line)"}`,
          color: isActive ? color : "var(--text-quiet)",
          backdropFilter: "blur(8px)",
          boxShadow: isActive ? `0 0 12px ${color}20` : "none",
        }}
      >
        <span className="rounded-full flex-shrink-0"
          style={{ width: size === "large" ? 8 : 6, height: size === "large" ? 8 : 6, backgroundColor: color, opacity: isActive ? 1 : 0.5 }}
        />
        <span className="flex-1">{DOMAIN_LABELS[c.domain] ?? c.domain}</span>
        <span style={{ fontFamily: "monospace", fontSize: 8, opacity: 0.55 }}>~{c.totalNodes}</span>
      </button>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ background: "transparent" }}>
      {/* Selected domain info */}
      {selected && selectedCluster && (() => {
        const grounding: Grounding = DOMAIN_GROUNDING[selected] ?? "speculative";
        const gColor = GROUNDING_COLOR[grounding];
        const gLabel = GROUNDING_LABEL[grounding];
        const size = CITY_SIZE[selected] ?? "medium";
        const districts = domainDistricts(size);
        return (
          <div className="absolute top-3 left-3 z-10 rounded-xl p-3 min-w-[200px]"
            style={{
              background: "var(--bg-panel)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${DOMAIN_COLORS[selected] ?? "var(--accent)"}30`,
              maxWidth: 240,
            }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] uppercase tracking-widest" style={{ color: "var(--text-quiet)" }}>
                {size} knowledge city
              </p>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: gColor, background: `${gColor}15`, border: `1px solid ${gColor}30` }}
                title={grounding === "source_grounded" ? "Source-grounded: historically verified, named actors" : grounding === "hybrid" ? "Hybrid: structured around real literature, synthetic edges" : "Speculative scaffold: domain is real, fixture content synthesized"}>
                {gLabel}
              </span>
            </div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>{DOMAIN_LABELS[selected] ?? selected}</p>
            <p className="text-[10px] italic mb-2" style={{ color: "var(--text-muted)" }}>{DOMAIN_SUBLABELS[selected]}</p>

            {/* Stats row */}
            <div className="flex gap-3 mb-2">
              <div>
                <div className="text-sm font-bold font-mono" style={{ color: DOMAIN_COLORS[selected] }}>~{selectedCluster.totalNodes}</div>
                <div className="text-[9px]" style={{ color: "var(--text-quiet)" }}>nodes</div>
              </div>
              <div>
                <div className="text-sm font-bold font-mono" style={{ color: DOMAIN_COLORS[selected] }}>{selectedCluster.layers.length}</div>
                <div className="text-[9px]" style={{ color: "var(--text-quiet)" }}>layers</div>
              </div>
              <div>
                <div className="text-sm font-bold font-mono" style={{ color: DOMAIN_COLORS[selected] }}>{districts.length}</div>
                <div className="text-[9px]" style={{ color: "var(--text-quiet)" }}>districts</div>
              </div>
            </div>

            {/* District list */}
            <div className="space-y-1 mb-2">
              {districts.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[9px]" style={{ color: d.color }}>{d.label}</span>
                </div>
              ))}
            </div>

            <button className="text-[9px] transition-colors" style={{ color: "var(--text-quiet)" }}
              onClick={() => { setSelected(null); setDomainFilter(null); }}>
              ✕ deselect
            </button>
          </div>
        );
      })()}

      {/* Domain nav chips — right panel with size grouping */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2.5" style={{ maxHeight: "calc(100% - 24px)", overflowY: "auto" }}>
        {largeCities.length > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-[0.15em] mb-1 px-1" style={{ color: "var(--text-quiet)" }}>Large</div>
            <div className="flex flex-col gap-1">
              {largeCities.map(c => <NavChip key={c.domain} c={c} />)}
            </div>
          </div>
        )}
        {mediumCities.length > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-[0.15em] mb-1 px-1" style={{ color: "var(--text-quiet)" }}>Medium</div>
            <div className="flex flex-col gap-1">
              {mediumCities.map(c => <NavChip key={c.domain} c={c} />)}
            </div>
          </div>
        )}
        {smallCities.length > 0 && (
          <div>
            <div className="text-[7px] uppercase tracking-[0.15em] mb-1 px-1" style={{ color: "var(--text-quiet)" }}>Small</div>
            <div className="flex flex-col gap-1">
              {smallCities.map(c => <NavChip key={c.domain} c={c} />)}
            </div>
          </div>
        )}
      </div>

      {/* Bridge legend — bottom */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5" style={{ maxWidth: "62%" }}>
        {CROSS_DOMAIN_BRIDGES.slice(0, 6).map(b => {
          const isHighlighted = highlightedBridgeId === b.id;
          return (
            <div key={b.id} className="flex items-center gap-1.5 rounded px-2 py-1 transition-all"
              style={{
                background: isHighlighted ? `${b.color}18` : "var(--bg-panel)",
                border: `1px solid ${isHighlighted ? b.color : `${b.color}30`}`,
                backdropFilter: "blur(6px)",
                boxShadow: isHighlighted ? `0 0 10px ${b.color}30` : "none",
              }}>
              <div className="w-4 border-t" style={{ borderColor: b.color, borderStyle: isHighlighted ? "solid" : "dashed" }} />
              <span className="text-[9px] font-medium" style={{ color: b.color }}>{b.label}</span>
              <span className="text-[8px] font-mono" style={{ color: "var(--text-quiet)" }}>{Math.round(b.strength * 100)}%</span>
            </div>
          );
        })}
      </div>

      {/* Grounding legend — always visible */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {!overview && (
          <span className="text-[9px] italic whitespace-nowrap" style={{ color: "var(--text-quiet)" }}>
            24 cities · 6 metro regions · 50+ bridges
          </span>
        )}
        <div className="flex items-center gap-2 px-2 py-1 rounded"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--line)" }}>
          <span className="text-[8px] uppercase tracking-widest" style={{ color: "var(--text-quiet)" }}>grounding:</span>
          {(["source_grounded", "hybrid", "speculative"] as Grounding[]).map(g => (
            <div key={g} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: GROUNDING_COLOR[g] }} />
              <span className="text-[8px]" style={{ color: GROUNDING_COLOR[g] }}>{GROUNDING_LABEL[g]}</span>
            </div>
          ))}
        </div>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 72, 64], fov: 62, near: 0.5, far: 500 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.32} />
        <directionalLight position={[10, 40, 10]} intensity={0.9} castShadow shadow-mapSize={[2048, 2048]} />
        {/* Governance quadrant — top center */}
        <pointLight position={[0, 18, -18]} intensity={0.5} color="#f97316" />
        {/* Manufacturing quadrant — right */}
        <pointLight position={[40, 16, 6]} intensity={0.45} color="#22c55e" />
        {/* Discovery Science — left */}
        <pointLight position={[-40, 16, 6]} intensity={0.45} color="#3b82f6" />
        {/* Mathematical Sciences — bottom */}
        <pointLight position={[0, 16, 36]} intensity={0.45} color="#8b5cf6" />
        {/* Climate policy — top far */}
        <pointLight position={[0, 14, -32]} intensity={0.35} color="#06b6d4" />
        <hemisphereLight args={["#0d2118", "#060f08", 0.48]} />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 9]} receiveShadow>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#060f08" roughness={0.98} metalness={0.02} />
        </mesh>
        <gridHelper args={[200, 100, "#0d2118", "#0a1912"]} position={[0, -0.19, 9]} />

        {/* Metro region halos — faint colored ellipses, brighten at far zoom */}
        {METRO_REGIONS.map(region => (
          <MetroRegionHalo key={region.id} region={region} />
        ))}

        <RoadNetwork clusters={clusters} />

        {/* City glow halos — visible at all zoom levels */}
        {clusters.map(cluster => (
          <CityGlow key={`glow-${cluster.domain}`} domain={cluster.domain} cx={cluster.cx} cz={cluster.cz} />
        ))}

        {/* Grounding status dots — green=source_grounded, amber=hybrid, grey=speculative */}
        {clusters.map(cluster => (
          <GroundingIndicator key={`gnd-${cluster.domain}`} domain={cluster.domain} cx={cluster.cx} cz={cluster.cz} />
        ))}

        {clusters.map(cluster => (
          <DomainDistrict
            key={cluster.domain}
            cluster={cluster}
            selected={selected === cluster.domain}
            onClick={() => handleDomainClick(cluster.domain)}
          />
        ))}

        {CROSS_DOMAIN_BRIDGES.map(bridge => {
          const src = clusters.find(c => c.domain === bridge.src);
          const tgt = clusters.find(c => c.domain === bridge.tgt);
          if (!src || !tgt) return null;
          return (
            <BridgeArc
              key={bridge.id}
              src={[src.cx, src.cz]}
              tgt={[tgt.cx, tgt.cz]}
              strength={bridge.strength}
              color={bridge.color}
              highlighted={highlightedBridgeId === bridge.id}
            />
          );
        })}

        <Particles clusters={clusters} />

        {/* Swarm reservoirs — orbiting knowledge particles around each city */}
        {clusters.map(cluster => (
          <SwarmReservoir
            key={`swarm-${cluster.domain}`}
            domain={cluster.domain}
            cx={cluster.cx}
            cz={cluster.cz}
          />
        ))}

        <CameraController targetDomain={selected} clusters={clusters} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          target={[0, 0, 9]}
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.08}
          minDistance={5}
          maxDistance={180}
          dampingFactor={0.10}
          enableDamping
          panSpeed={1.2}
          rotateSpeed={0.6}
          zoomSpeed={1.0}
        />
      </Canvas>
    </div>
  );
}
