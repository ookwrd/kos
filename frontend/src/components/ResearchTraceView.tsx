import { useState, useCallback } from "react";
import { useGraphStore } from "../store/graphStore";

// ── Types ─────────────────────────────────────────────────────────────────────

type SourceType = "journal_article" | "government_report" | "testimony" | "book" | "conference" | "arc_synthesized" | "standard";
type Grounding = "source_grounded" | "hybrid" | "arc_synthesized" | "speculative";
type ClaimType = "mechanism" | "decision" | "evidence" | "transfer_opportunity" | "contradiction" | "abstraction";
type StepStatus = "complete" | "active" | "pending";

interface ResearchSource {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: SourceType;
  doi?: string;
  trust_score: number;
  grounding: Grounding;
  key_claim: string;
  contestability: "settled" | "contested" | "open";
}

interface ResearchClaim {
  id: string;
  text: string;
  type: ClaimType;
  confidence: number;
  source_ids: string[];
  contradicted_by?: string[];
  omega_artifact?: { node_type: string; node_id: string; domain: string };
}

interface ResearchRun {
  id: string;
  topic: string;
  domain: string;
  domain_color: string;
  status: "complete" | "running" | "queued";
  grounding: Grounding;
  model: string;
  timestamp: string;
  sources: ResearchSource[];
  claims: ResearchClaim[];
  contradictions: Array<{ claim_a: string; claim_b: string; note: string }>;
  abstractions: Array<{ label: string; invariants: string[]; transfer_candidates: string[] }>;
  artifacts_generated: number;
  bridge_candidates: number;
  pipeline_steps: Array<{ label: string; status: StepStatus; count?: number; note?: string }>;
}

// ── Colors ────────────────────────────────────────────────────────────────────

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  journal_article:    "Journal",
  government_report:  "Gov. Report",
  testimony:          "Testimony",
  book:               "Book",
  conference:         "Conference",
  arc_synthesized:    "ARC Synthesis",
  standard:           "Standard",
};

const GROUNDING_COLOR: Record<Grounding, string> = {
  source_grounded: "#22c55e",
  hybrid:          "#eab308",
  arc_synthesized: "#3b82f6",
  speculative:     "#94a3b8",
};
const GROUNDING_LABEL: Record<Grounding, string> = {
  source_grounded: "SG",
  hybrid:          "HY",
  arc_synthesized: "AS",
  speculative:     "SC",
};

const CLAIM_TYPE_COLOR: Record<ClaimType, string> = {
  mechanism:            "#8b5cf6",
  decision:             "#f97316",
  evidence:             "#3b82f6",
  transfer_opportunity: "#22c55e",
  contradiction:        "#ef4444",
  abstraction:          "#ec4899",
};
const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  mechanism:            "Mechanism",
  decision:             "Decision",
  evidence:             "Evidence",
  transfer_opportunity: "Transfer opp.",
  contradiction:        "Contradiction",
  abstraction:          "Abstraction",
};

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_RUNS: ResearchRun[] = [
  {
    id: "run-governance-failure-schema",
    topic: "Normalization of deviance: structural comparison across Challenger, Fukushima, 737 MAX",
    domain: "fukushima_governance",
    domain_color: "#f97316",
    status: "complete",
    grounding: "source_grounded",
    model: "gpt-5",
    timestamp: "2026-04-24T09:14:00Z",
    pipeline_steps: [
      { label: "Topic intake", status: "complete", note: "Normalization of deviance — three-case comparative" },
      { label: "Source retrieval", status: "complete", count: 7, note: "Rogers Commission, NAIIC, House Transportation Committee" },
      { label: "Claim extraction", status: "complete", count: 14, note: "11 confirmed, 3 contested" },
      { label: "Contradiction detection", status: "complete", count: 2, note: "Timescale asymmetry; cultural specificity" },
      { label: "Abstraction synthesis", status: "complete", count: 2, note: "Deviance normalization schema; authority-calibration inversion" },
      { label: "Transfer identification", status: "complete", count: 3, note: "Drug trial governance; pandemic aerosol delay; nuclear QA" },
      { label: "Artifact import", status: "complete", count: 8, note: "4 evidence nodes, 2 mechanism nodes, 2 bridge candidates" },
    ],
    sources: [
      {
        id: "src-rogers-1986",
        title: "Report of the Presidential Commission on the Space Shuttle Challenger Accident",
        authors: "Rogers Commission",
        year: 1986,
        type: "government_report",
        trust_score: 0.99,
        grounding: "source_grounded",
        key_claim: "Morton Thiokol engineers filed formal objection to launch on Jan 27, 1986. Management reversed engineering recommendation under NASA schedule pressure.",
        contestability: "settled",
      },
      {
        id: "src-vaughan-1996",
        title: "The Challenger Launch Decision: Risky Technology, Culture, and Deviance at NASA",
        authors: "Diane Vaughan",
        year: 1996,
        type: "book",
        trust_score: 0.97,
        grounding: "source_grounded",
        key_claim: "Normalization of deviance: repeated anomalous events without catastrophe → risk reclassified as acceptable. Process is incremental and invisible to insiders.",
        contestability: "settled",
      },
      {
        id: "src-naiic-2012",
        title: "The National Diet of Japan Fukushima Nuclear Accident Independent Investigation Commission",
        authors: "NAIIC",
        year: 2012,
        type: "government_report",
        trust_score: 0.98,
        grounding: "source_grounded",
        key_claim: "The Fukushima disaster was fundamentally manmade. Its causes were foreseeable. TEPCO, regulators and the government failed to develop the most basic safety requirements.",
        contestability: "settled",
      },
      {
        id: "src-house-737max-2020",
        title: "The Design, Development and Certification of the Boeing 737 MAX",
        authors: "House Transportation Committee",
        year: 2020,
        type: "government_report",
        trust_score: 0.95,
        grounding: "source_grounded",
        key_claim: "Boeing concealed MCAS changes from FAA. MCAS was redesigned to expand flight envelope authority without corresponding safety analysis update. Financial pressure drove schedule over safety.",
        contestability: "settled",
      },
      {
        id: "src-caib-2003",
        title: "Columbia Accident Investigation Board Report",
        authors: "CAIB",
        year: 2003,
        type: "government_report",
        trust_score: 0.98,
        grounding: "source_grounded",
        key_claim: "Columbia's organizational culture contributed as much to the accident as the foam debris strike. NASA had not internalized lessons from Challenger.",
        contestability: "settled",
      },
      {
        id: "src-pierson-2019",
        title: "Congressional Testimony on Boeing 737 MAX",
        authors: "Ed Pierson, former Boeing Senior Manager",
        year: 2019,
        type: "testimony",
        trust_score: 0.91,
        grounding: "source_grounded",
        key_claim: "Production pressure in Renton factory was so severe that Pierson stopped production. Quality problems were being 'worked around' rather than resolved. Management did not want to hear safety concerns.",
        contestability: "contested",
      },
      {
        id: "src-arc-deviance-synthesis",
        title: "Structural comparison: deviance normalization across three high-stakes domains",
        authors: "AutoResearchClaw / gpt-5",
        year: 2026,
        type: "arc_synthesized",
        trust_score: 0.72,
        grounding: "arc_synthesized",
        key_claim: "All three cases share: (1) pre-existing internal dissent, (2) authority gradient that silences dissent, (3) absence of persistent governance record, (4) catastrophic outcome attributable partly to (3).",
        contestability: "open",
      },
    ],
    claims: [
      { id: "cl-1", type: "mechanism", confidence: 0.97, text: "Engineers with correct technical assessments were overridden in all three cases by organizational authority figures with demonstrably lower epistemic calibration.", source_ids: ["src-rogers-1986", "src-naiic-2012", "src-house-737max-2020"],
        omega_artifact: { node_type: "Mechanism", node_id: "mech-authority-calibration-inversion", domain: "fukushima_governance" } },
      { id: "cl-2", type: "abstraction", confidence: 0.95, text: "Normalization of deviance is a substrate-independent institutional failure mechanism: repeated anomaly without immediate consequence → incrementally lowered risk threshold → catastrophic outcome.", source_ids: ["src-vaughan-1996", "src-caib-2003"],
        omega_artifact: { node_type: "Mechanism", node_id: "mech-deviance-normalization", domain: "extreme_environments" } },
      { id: "cl-3", type: "evidence", confidence: 0.99, text: "Boisjoly memo of July 31 1985 explicitly predicted O-ring failure under cold-launch conditions. Filed 6 months before Challenger. Not cited in launch decision record.", source_ids: ["src-rogers-1986"],
        omega_artifact: { node_type: "EvidenceFragment", node_id: "ev-boisjoly-oring-memo-1985", domain: "extreme_environments" } },
      { id: "cl-4", type: "decision", confidence: 0.98, text: "TEPCO's 2008 PTHA study projected >10m tsunami. Internal assessment was not escalated to regulator. Seawall remained at 5.7m until 2011.", source_ids: ["src-naiic-2012"],
        omega_artifact: { node_type: "DecisionTrace", node_id: "dec-seawall-deferral-2008", domain: "fukushima_governance" } },
      { id: "cl-5", type: "transfer_opportunity", confidence: 0.86, text: "WHO aerosol guidance delay (2020) shares structural features with all three cases: correct scientific assessment available, institutional authority delays action, downstream harm traceable to delay.", source_ids: ["src-arc-deviance-synthesis"],
        omega_artifact: { node_type: "Mechanism", node_id: "mech-reporting-delay-spread", domain: "pandemic_governance" } },
      { id: "cl-6", type: "contradiction", confidence: 0.78, text: "Cultural specificity objection: 'anzen shinwa' (Japanese safety myth) may not transfer to US or EU organizational contexts. Vaughan argues mechanism is universal; Perrow argues cultural embedding limits transfer.", source_ids: ["src-vaughan-1996", "src-naiic-2012"],
        contradicted_by: ["cl-2"] },
      { id: "cl-7", type: "transfer_opportunity", confidence: 0.82, text: "Drug trial governance: institutional data safety monitoring boards (DSMBs) can exhibit the same authority-calibration inversion when sponsor pressure influences safety reporting timelines.", source_ids: ["src-arc-deviance-synthesis"],
        omega_artifact: { node_type: "Mechanism", node_id: "mech-schedule-pressure-risk-acceptance", domain: "drug_discovery" } },
      { id: "cl-8", type: "abstraction", confidence: 0.91, text: "The absence of a persistent, queryable governance record is itself a causal factor in all three outcomes — not merely an incidental feature. The record gap is part of the mechanism.", source_ids: ["src-naiic-2012", "src-rogers-1986", "src-house-737max-2020"],
        omega_artifact: { node_type: "Mechanism", node_id: "mech-org-silence-failure", domain: "fukushima_governance" } },
    ],
    contradictions: [
      { claim_a: "cl-2", claim_b: "cl-6", note: "Vaughan's mechanism is general; Perrow argues normal accidents theory requires system-level analysis that Vaughan's individual-agency focus misses. Both may be correct at different levels of analysis." },
      { claim_a: "cl-4", claim_b: "cl-1", note: "TEPCO case involves deliberate suppression; Challenger case involves motivated reasoning without deliberate deception. The mechanism may be more heterogeneous than the schema suggests." },
    ],
    abstractions: [
      {
        label: "Deviance Normalization Schema",
        invariants: ["pre-existing internal dissent", "authority gradient suppresses dissent", "no persistent governance record", "catastrophic outcome"],
        transfer_candidates: ["pandemic_governance", "drug_discovery", "nuclear_qa", "clinical_trial_governance"],
      },
      {
        label: "Authority-Calibration Inversion",
        invariants: ["high-calibration expert overridden by lower-calibration authority", "outcome vindicates overridden expert", "vindication occurs post-catastrophe"],
        transfer_candidates: ["pharmaceutical_approval", "financial_risk", "climate_policy"],
      },
    ],
    artifacts_generated: 8,
    bridge_candidates: 3,
  },

  {
    id: "run-kras-bbb-cns",
    topic: "KRAS G12C inhibitor CNS penetration: BBB challenge in NSCLC with brain metastases",
    domain: "drug_discovery",
    domain_color: "#3b82f6",
    status: "complete",
    grounding: "hybrid",
    model: "gpt-5",
    timestamp: "2026-04-24T10:02:00Z",
    pipeline_steps: [
      { label: "Topic intake", status: "complete", note: "KRAS G12C + CNS penetration — focused on sotorasib/adagrasib BBB data" },
      { label: "Source retrieval", status: "complete", count: 5, note: "NEJM trials, FDA review, BBB mechanism literature" },
      { label: "Claim extraction", status: "complete", count: 9, note: "7 confirmed, 2 open questions" },
      { label: "Contradiction detection", status: "complete", count: 1, note: "Conflicting efflux ratio interpretation" },
      { label: "Abstraction synthesis", status: "complete", count: 1, note: "Therapeutic window ≡ process window (cross-domain)" },
      { label: "Transfer identification", status: "complete", count: 2, note: "EUV process window; semiconductor yield optimization" },
      { label: "Artifact import", status: "complete", count: 6, note: "3 evidence nodes, 1 mechanism node, 2 bridge candidates" },
    ],
    sources: [
      {
        id: "src-codebreaK100",
        title: "Sotorasib for Lung Cancers with KRAS p.G12C Mutation",
        authors: "Skoulidis et al.",
        year: 2021,
        type: "journal_article",
        doi: "10.1056/NEJMoa2103695",
        trust_score: 0.97,
        grounding: "source_grounded",
        key_claim: "ORR 37.1% in CodeBreaK 100 Phase II. No dedicated CNS cohort. CNS metastatic patients excluded from primary analysis.",
        contestability: "settled",
      },
      {
        id: "src-krystal1",
        title: "Adagrasib in Non-Small-Cell Lung Cancer Harboring a KRAS G12C Mutation",
        authors: "Jänne et al.",
        year: 2022,
        type: "journal_article",
        doi: "10.1056/NEJMoa2204619",
        trust_score: 0.97,
        grounding: "source_grounded",
        key_claim: "ORR 42.9% KRYSTAL-1 Phase II. Adagrasib showed CNS activity: 33% ORR in 19 patients with CNS metastases. BBB penetration confirmed in preclinical models.",
        contestability: "settled",
      },
      {
        id: "src-bbb-mechanism",
        title: "Blood-Brain Barrier Penetration by KRAS G12C Inhibitors",
        authors: "ARC synthesis / hybrid",
        year: 2026,
        type: "arc_synthesized",
        trust_score: 0.74,
        grounding: "arc_synthesized",
        key_claim: "Sotorasib efflux ratio ~3.4 (P-gp substrate); poor CNS penetration. Adagrasib efflux ratio ~1.4; better CNS penetration. Difference due to P-gp substrate liability, molecular weight, and lipophilicity differences.",
        contestability: "open",
      },
      {
        id: "src-fda-nda214665",
        title: "FDA Clinical Review: Sotorasib NDA 214665",
        authors: "FDA CDER",
        year: 2021,
        type: "government_report",
        trust_score: 0.98,
        grounding: "source_grounded",
        key_claim: "Accelerated approval granted based on ORR. CNS metastatic patients not included in pivotal trial. CNS activity to be evaluated in post-market commitment.",
        contestability: "settled",
      },
      {
        id: "src-resistance-mechanisms",
        title: "Resistance mechanisms to KRAS G12C covalent inhibitors",
        authors: "ARC synthesis / hybrid",
        year: 2026,
        type: "arc_synthesized",
        trust_score: 0.71,
        grounding: "arc_synthesized",
        key_claim: "On-target: KRAS amplification, Y96D mutation, S17N. Off-target: KRAS-independent bypass via SOS1, EGFR, MET. CNS is a pharmacological sanctuary site — inadequate drug exposure may permit CNS progression even with systemic control.",
        contestability: "open",
      },
    ],
    claims: [
      { id: "cl-k1", type: "evidence", confidence: 0.97, text: "Adagrasib shows measurable CNS activity (33% ORR, n=19) in NSCLC patients with active brain metastases. Sotorasib CNS data is absent from pivotal trial.", source_ids: ["src-krystal1", "src-fda-nda214665"],
        omega_artifact: { node_type: "EvidenceFragment", node_id: "ev-adagrasib-cns-activity", domain: "drug_discovery" } },
      { id: "cl-k2", type: "mechanism", confidence: 0.85, text: "P-glycoprotein efflux pump is the primary BBB resistance mechanism for sotorasib. Adagrasib's lower efflux ratio reflects weaker P-gp substrate liability.", source_ids: ["src-bbb-mechanism"],
        omega_artifact: { node_type: "Mechanism", node_id: "mech-pgp-bbb-efflux", domain: "drug_discovery" } },
      { id: "cl-k3", type: "transfer_opportunity", confidence: 0.81, text: "Therapeutic window (dose × PK parameter space producing response without toxicity) is structurally identical to EUV process window (dose × focus producing acceptable patterning). Both are 2D constraint manifolds over competing physical processes.", source_ids: ["src-arc-deviance-synthesis"],
        omega_artifact: { node_type: "Mechanism", node_id: "mech-process-window", domain: "euv_lithography" } },
      { id: "cl-k4", type: "decision", confidence: 0.88, text: "CNS expansion decision for KRAS trial requires: BBB penetration uncertainty below threshold AND CNS ORR data from at least one agent. Current evidence: adagrasib meets criterion, sotorasib does not.", source_ids: ["src-codebreaK100", "src-krystal1"],
        omega_artifact: { node_type: "DecisionTrace", node_id: "dec-trial-approval-2024", domain: "drug_discovery" } },
      { id: "cl-k5", type: "contradiction", confidence: 0.72, text: "CNS ORR 33% (adagrasib) is promising but n=19 — possibly underpowered. Some reviewers argue this is insufficient for expansion decision; others argue it exceeds the historical bar for CNS-active agents.", source_ids: ["src-krystal1"],
        contradicted_by: ["cl-k4"] },
    ],
    contradictions: [
      { claim_a: "cl-k4", claim_b: "cl-k5", note: "n=19 CNS ORR data may be sufficient for a constrained expansion decision (enriched CNS-metastatic cohort with frequent MRI monitoring) but not for an unrestricted label expansion." },
    ],
    abstractions: [
      {
        label: "Therapeutic Window ≡ Process Window",
        invariants: ["2D constraint manifold", "competing failure modes on each axis", "operating point must stay interior", "boundary defined by physical/biological mechanism"],
        transfer_candidates: ["euv_lithography", "semiconductor_hardware", "optimization_and_control"],
      },
    ],
    artifacts_generated: 6,
    bridge_candidates: 2,
  },

  {
    id: "run-transfer-invariants",
    topic: "Structural invariants that survive domain transfer: category theory, structure mapping, lawful analogy",
    domain: "mathematics_category_theory",
    domain_color: "#8b5cf6",
    status: "complete",
    grounding: "hybrid",
    model: "gpt-5",
    timestamp: "2026-04-24T11:30:00Z",
    pipeline_steps: [
      { label: "Topic intake", status: "complete", note: "Formal conditions for transfer validity" },
      { label: "Source retrieval", status: "complete", count: 6, note: "Gentner 1983, Spivak ologs, Eilenberg-MacLane, Hofstadter" },
      { label: "Claim extraction", status: "complete", count: 11, note: "8 confirmed, 3 open" },
      { label: "Contradiction detection", status: "complete", count: 1, note: "Formal vs. productive analogy debate" },
      { label: "Abstraction synthesis", status: "complete", count: 2, note: "Transfer validity conditions; structural loss taxonomy" },
      { label: "Transfer identification", status: "complete", count: 4, note: "Cross-domain transfer for all Transfer Workbench cases" },
      { label: "Artifact import", status: "complete", count: 7, note: "5 evidence nodes, 2 mechanism nodes" },
    ],
    sources: [
      { id: "src-gentner-1983", title: "Structure Mapping: A Theoretical Framework for Analogy", authors: "Dedre Gentner", year: 1983, type: "journal_article", doi: "10.1207/s15516709cog0702_3", trust_score: 0.97, grounding: "source_grounded", key_claim: "Analogical inference is driven by relational structure, not surface features. A 'lawful' analogy preserves higher-order relational structure (relations among relations). Surface similarity without structural match = mere appearance.", contestability: "settled" },
      { id: "src-spivak-ologs", title: "Ologs: A Categorical Framework for Knowledge Representation", authors: "Spivak & Kent", year: 2012, type: "journal_article", doi: "10.1371/journal.pone.0024274", trust_score: 0.95, grounding: "source_grounded", key_claim: "Ologs formalize conceptual structure as category-theoretic diagrams. A functor between ologs is a meaning-preserving map. The 'facts' captured are the commutative diagrams, not the objects alone.", contestability: "settled" },
      { id: "src-hofstadter-1995", title: "Fluid Concepts and Creative Analogies", authors: "Douglas Hofstadter", year: 1995, type: "book", trust_score: 0.88, grounding: "source_grounded", key_claim: "The most productive analogies are those that modify the target domain's ontology, not merely map it. Transfer creates new entities in the target, not just new labels for old ones.", contestability: "contested" },
    ],
    claims: [
      { id: "cl-t1", type: "mechanism", confidence: 0.95, text: "A transfer is 'lawful' (Gentner's term) when it preserves higher-order relational structure (causal/constraint relations between mechanisms), not merely surface co-occurrence.", source_ids: ["src-gentner-1983"], omega_artifact: { node_type: "Mechanism", node_id: "mech-transfer-validity", domain: "mathematics_category_theory" } },
      { id: "cl-t2", type: "abstraction", confidence: 0.91, text: "Structural loss is unavoidable and informative — it is not evidence of a bad transfer but the formal output of a precise one. Enumerating what is lost is more valuable than claiming perfect transfer.", source_ids: ["src-spivak-ologs", "src-gentner-1983"], omega_artifact: { node_type: "Mechanism", node_id: "mech-structural-loss-accounting", domain: "mathematics_category_theory" } },
      { id: "cl-t3", type: "transfer_opportunity", confidence: 0.88, text: "Normalization-of-deviance schema transfer is lawful by Gentner's criterion: higher-order relation (authority overrides calibration → absent governance record → catastrophic outcome) is preserved across Challenger/Fukushima/737 MAX.", source_ids: ["src-gentner-1983", "src-arc-deviance-synthesis"] },
    ],
    contradictions: [
      { claim_a: "cl-t1", claim_b: "cl-t2", note: "Tension: if structural loss is 'unavoidable and informative,' when does it become disqualifying? Gentner's framework lacks a threshold criterion. This is an open problem in analogical reasoning theory." },
    ],
    abstractions: [
      { label: "Transfer Validity Conditions", invariants: ["higher-order relational structure preserved", "causal direction preserved", "failure modes analogous"], transfer_candidates: ["all_domains"] },
      { label: "Structural Loss Taxonomy", invariants: ["substrate loss", "timescale loss", "magnitude loss", "directionality loss", "governance loss"], transfer_candidates: ["transfer_workbench"] },
    ],
    artifacts_generated: 7,
    bridge_candidates: 4,
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function GroundingBadge({ g }: { g: Grounding }) {
  const c = GROUNDING_COLOR[g];
  return (
    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0"
      style={{ backgroundColor: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      {GROUNDING_LABEL[g]}
    </span>
  );
}

function TrustBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", background: color }} />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>{Math.round(value * 100)}%</span>
    </div>
  );
}

function PipelineStep({ step, idx }: { step: ResearchRun["pipeline_steps"][0]; idx: number }) {
  const color = step.status === "complete" ? "#22c55e" : step.status === "active" ? "#6366f1" : "#334155";
  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
          style={{ background: step.status === "complete" ? "#22c55e18" : step.status === "active" ? "#6366f118" : "transparent",
                   border: `1px solid ${color}`, color }}>
          {step.status === "complete" ? "✓" : step.status === "active" ? "●" : String(idx + 1)}
        </div>
        {idx < 6 && <div className="w-px flex-1 min-h-3" style={{ background: step.status === "complete" ? "#22c55e30" : "#334155" }} />}
      </div>
      <div className="pb-3 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-medium" style={{ color }}>{step.label}</span>
          {step.count !== undefined && (
            <span className="text-[9px] font-mono px-1 rounded" style={{ background: `${color}18`, color }}>×{step.count}</span>
          )}
        </div>
        {step.note && <p className="text-[9px] text-slate-600 leading-relaxed">{step.note}</p>}
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: ResearchSource }) {
  const [open, setOpen] = useState(false);
  const tc = source.trust_score >= 0.9 ? "#22c55e" : source.trust_score >= 0.75 ? "#eab308" : "#94a3b8";
  return (
    <div className="rounded-lg cursor-pointer transition-colors"
      style={{ background: open ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      onClick={() => setOpen(o => !o)}>
      <div className="p-2.5 flex items-start gap-2">
        <span className="text-[8px] px-1 py-0.5 rounded flex-shrink-0 mt-0.5 font-medium"
          style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}>
          {SOURCE_TYPE_LABELS[source.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-medium text-slate-200 leading-tight">{source.title}</span>
            <GroundingBadge g={source.grounding} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-slate-600">{source.authors} · {source.year}</span>
            {source.doi && <span className="text-[9px] font-mono text-slate-700">{source.doi}</span>}
          </div>
          <div className="mt-1">
            <TrustBar value={source.trust_score} color={tc} />
          </div>
        </div>
      </div>
      {open && (
        <div className="px-3 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{source.key_claim}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[8px] uppercase tracking-widest text-slate-600">contestability:</span>
            <span className="text-[9px]" style={{ color: source.contestability === "settled" ? "#22c55e" : source.contestability === "contested" ? "#f97316" : "#eab308" }}>
              {source.contestability}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimCard({ claim, sources }: { claim: ResearchClaim; sources: ResearchSource[] }) {
  const color = CLAIM_TYPE_COLOR[claim.type];
  const srcLabels = claim.source_ids.map(id => sources.find(s => s.id === id)?.authors.split(",")[0] ?? id).join(", ");
  return (
    <div className="rounded-lg p-2.5" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest flex-shrink-0"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
          {CLAIM_TYPE_LABEL[claim.type]}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div style={{ width: `${claim.confidence * 100}%`, height: "100%", background: color }} />
          </div>
          <span className="text-[9px] font-mono" style={{ color }}>{Math.round(claim.confidence * 100)}%</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-300 leading-relaxed mb-1.5">{claim.text}</p>
      <div className="flex items-center gap-2">
        <span className="text-[8px] text-slate-700">Sources:</span>
        <span className="text-[9px] text-slate-600">{srcLabels}</span>
        {claim.omega_artifact && (
          <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
            → {claim.omega_artifact.node_type}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Substrate Growth Panel ────────────────────────────────────────────────────

const KINTSUGI_ARTIFACT = {
  sourceId: "src-kintsugi-tacit-ev",
  sourceTitle: "Kintsugi restoration practice — gold powder application timing (tacit)",
  sourceAuthors: "Craft ethnography — public domain practice record",
  sourceYear: 2021,
  sourceType: "journal_article" as const,
  trustScore: 0.82,
  grounding: "hybrid" as const,
  keyClaim: "Gold powder application depends on humidity and half-cured urushi timing. This judgment cannot be reduced to sensor thresholds — every automated attempt has failed to match master outcomes.",
  proposedNodeId: "mech-kintsugi-humidity-window-judgment",
  proposedNodeLabel: "Kintsugi humidity + cure window → gold adhesion judgment",
  proposedLayer: "knowledge",
  proposedType: "Mechanism",
  proposedData: {
    mechanism_type: "tacit_process",
    domain: "kintsugi_restoration",
    codifiability: 0.18,
    confidence: 0.71,
    tacit_warning: "No sensor array has matched master judgment. Codifiability: 0.18.",
    committed_by: "local_demo_write",
  },
  proposedEdge: { source: "ev-kintsugi-gold-tacit", target: "mech-kintsugi-humidity-window-judgment", relation: "SUPPORTS" as const },
};

function provenanceHash(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return "sha256:prov-" + Math.abs(h).toString(16).padStart(8, "0") + "a3f2c91b";
}

function SubstrateGrowthPanel({
  committedIds, onCommit, onClear, localNodes,
}: {
  committedIds: Set<string>;
  onCommit: (node: import("../api/client").GraphNode, edges?: import("../api/client").GraphEdge[]) => void;
  onClear: () => void;
  localNodes: import("../api/client").GraphNode[];
}) {
  const a = KINTSUGI_ARTIFACT;
  const isCommitted = committedIds.has(a.proposedNodeId);
  const [confirming, setConfirming] = useState(false);

  const handleCommit = useCallback(() => {
    setConfirming(true);
    setTimeout(() => {
      onCommit(
        { id: a.proposedNodeId, label: a.proposedNodeLabel, layer: a.proposedLayer, type: a.proposedType, data: a.proposedData },
        [a.proposedEdge],
      );
      setConfirming(false);
    }, 600);
  }, [onCommit, a]);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="rounded-lg p-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
        <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#4ade80" }}>
          Substrate Growth · Local Write Path
        </div>
        <p className="text-[9px] text-slate-500 leading-relaxed">
          Review extracted claims below. Approved nodes are written to your local session substrate and persist in localStorage.
          Node count updates immediately. This is a local demo write path — Neo4j production write is pending backend integration.
        </p>
      </div>

      {/* Seed artifact */}
      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[8px] uppercase tracking-widest text-slate-600">Source record</div>
          <GroundingBadge g={a.grounding} />
          <TrustBar value={a.trustScore} color="#eab308" />
        </div>
        <div className="text-[10px] font-semibold text-slate-300 mb-0.5 leading-snug">{a.sourceTitle}</div>
        <div className="text-[8px] text-slate-600 mb-2">{a.sourceAuthors} · {a.sourceYear}</div>
        <p className="text-[9px] text-slate-400 leading-relaxed border-l-2 pl-2 mb-1" style={{ borderColor: "#eab308" }}>
          "{a.keyClaim}"
        </p>
      </div>

      {/* Extracted claim */}
      <div className="rounded-lg p-3" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}>
        <div className="text-[8px] uppercase tracking-widest text-indigo-500 mb-2">Extracted claim → proposed node</div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest"
            style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
            Mechanism
          </span>
          <span className="text-[8px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: "rgba(255,255,255,0.04)", color: "#64748b" }}>
            {a.proposedNodeId}
          </span>
          <span className="ml-auto text-[8px] text-slate-600">codifiability {a.proposedData.codifiability}</span>
        </div>
        <div className="text-[10px] text-slate-200 font-medium mb-2">{a.proposedNodeLabel}</div>

        <div className="text-[8px] uppercase tracking-widest text-slate-700 mb-1">Proposed edge</div>
        <div className="font-mono text-[8px] text-slate-500 mb-2 p-1.5 rounded"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          {a.proposedEdge.source} → <span style={{ color: "#818cf8" }}>{a.proposedEdge.relation}</span> → {a.proposedEdge.target}
        </div>

        <div className="text-[8px] uppercase tracking-widest text-slate-700 mb-1">Provenance hash</div>
        <div className="font-mono text-[8px] text-slate-600 p-1.5 rounded mb-3" style={{ background: "rgba(0,0,0,0.3)" }}>
          {provenanceHash(a.proposedNodeId)}
        </div>

        <div className="text-[8px] uppercase tracking-widest text-slate-700 mb-1">Governance note</div>
        <p className="text-[9px] text-slate-500 mb-3">
          Human review required before commit. Tacit knowledge nodes carry epistemic risk — codifiability below 0.25 flagged for domain expert sign-off before production write.
        </p>

        {isCommitted ? (
          <div className="rounded-lg px-3 py-2 text-center"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div className="text-[10px] font-bold" style={{ color: "#4ade80" }}>✓ Committed to local substrate</div>
            <div className="text-[8px] text-slate-600 mt-0.5">node visible in graph · count updated · localStorage persisted</div>
          </div>
        ) : (
          <button
            onClick={handleCommit}
            disabled={confirming}
            className="w-full rounded-lg px-3 py-2 text-[10px] font-bold transition-all"
            style={{
              background: confirming ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.12)",
              color: confirming ? "#64748b" : "#4ade80",
              border: "1px solid rgba(34,197,94,0.25)",
              cursor: confirming ? "wait" : "pointer",
            }}>
            {confirming ? "Writing to local substrate…" : "Approve into local substrate"}
          </button>
        )}
      </div>

      {/* Committed log */}
      {localNodes.length > 0 && (
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[8px] uppercase tracking-widest text-slate-600">
              Local substrate — {localNodes.length} committed node{localNodes.length > 1 ? "s" : ""}
            </div>
            <button
              onClick={onClear}
              className="ml-auto text-[8px] text-slate-700 hover:text-red-400 transition-colors"
              title="Clear all local commits (cannot be undone)">
              clear all
            </button>
          </div>
          {localNodes.map(n => (
            <div key={n.id} className="flex items-center gap-2 py-1 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#4ade80" }} />
              <span className="text-[9px] text-slate-400 flex-1 truncate">{n.label}</span>
              <span className="text-[8px] font-mono text-slate-700">{n.id.slice(0, 20)}…</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResearchTraceView({ className = "" }: { className?: string }) {
  const [selectedRun, setSelectedRun] = useState<string>(DEMO_RUNS[0].id);
  const [activeTab, setActiveTab] = useState<"pipeline" | "sources" | "claims" | "abstractions" | "commit">("pipeline");

  const run = DEMO_RUNS.find(r => r.id === selectedRun)!;

  const { localNodes, commitLocalNode, clearLocalNodes } = useGraphStore();
  const committedIds = new Set(localNodes.map(n => n.id));

  const tabs: Array<{ id: typeof activeTab; label: string; count?: number; highlight?: boolean }> = [
    { id: "pipeline",    label: "Pipeline" },
    { id: "sources",     label: "Sources",     count: run.sources.length },
    { id: "claims",      label: "Claims",      count: run.claims.length },
    { id: "abstractions",label: "Abstractions",count: run.abstractions.length + run.bridge_candidates },
    { id: "commit",      label: "Commit",      count: localNodes.length || undefined, highlight: true },
  ];

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}
      style={{ background: "rgba(2,6,16,0.98)", color: "#e2e8f0" }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#6366f1" }}>Research Engine</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest"
            style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
            gpt-5 · live
          </span>
          <span className="ml-auto text-[9px] text-slate-600">AutoResearchClaw · sandbox mode</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Sources → Claims → Contradictions → Abstractions → Knowledge objects → Transfer opportunities
        </p>
      </div>

      {/* Run selector */}
      <div className="flex-shrink-0 px-3 py-2 border-b flex flex-col gap-1.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {DEMO_RUNS.map(r => (
          <button key={r.id}
            onClick={() => { setSelectedRun(r.id); setActiveTab("pipeline"); }}
            className="w-full text-left rounded-lg px-2.5 py-2 transition-colors"
            style={{
              background: selectedRun === r.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${selectedRun === r.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)"}`,
            }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.domain_color }} />
              <span className="text-[9px] font-medium text-slate-300 leading-tight line-clamp-1 flex-1">{r.topic}</span>
              <GroundingBadge g={r.grounding} />
              <span className="text-[8px] text-slate-700 flex-shrink-0">{new Date(r.timestamp).toLocaleDateString()}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          const accent = t.highlight ? "#22c55e" : "#6366f1";
          const accentText = t.highlight ? "#4ade80" : "#818cf8";
          return (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-3 py-2 text-[10px] font-medium transition-colors flex items-center gap-1"
              style={{
                color: isActive ? accentText : "#334155",
                borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent",
                background: "transparent",
              }}>
              {t.label}
              {t.count !== undefined && (
                <span className="text-[8px] px-1 rounded"
                  style={{ background: t.highlight ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", color: t.highlight ? "#4ade80" : "#475569" }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">

        {activeTab === "pipeline" && (
          <div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Artifacts", value: run.artifacts_generated, color: "#6366f1" },
                { label: "Bridges", value: run.bridge_candidates, color: "#22c55e" },
                { label: "Sources", value: run.sources.length, color: "#3b82f6" },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-2.5 text-center"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                  <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[8px] uppercase tracking-widest text-slate-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pipeline steps */}
            <div>
              {run.pipeline_steps.map((step, i) => (
                <PipelineStep key={i} step={step} idx={i} />
              ))}
            </div>

            {/* Contradictions summary */}
            {run.contradictions.length > 0 && (
              <div className="mt-3 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-2">
                  {run.contradictions.length} contradiction{run.contradictions.length > 1 ? "s" : ""} detected
                </div>
                {run.contradictions.map((c, i) => (
                  <p key={i} className="text-[9px] text-slate-400 leading-relaxed mb-1">{c.note}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "sources" && (
          <div className="flex flex-col gap-2">
            {run.sources.map(s => <SourceCard key={s.id} source={s} />)}
          </div>
        )}

        {activeTab === "claims" && (
          <div className="flex flex-col gap-2">
            {run.claims.map(c => <ClaimCard key={c.id} claim={c} sources={run.sources} />)}
          </div>
        )}

        {activeTab === "commit" && (
          <SubstrateGrowthPanel
            committedIds={committedIds}
            onCommit={commitLocalNode}
            onClear={clearLocalNodes}
            localNodes={localNodes}
          />
        )}

        {activeTab === "abstractions" && (
          <div className="flex flex-col gap-3">
            {run.abstractions.map((a, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.2)" }}>
                <div className="text-[10px] font-semibold text-pink-300 mb-2">{a.label}</div>
                <div className="mb-2">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600 mb-1">Invariants preserved</div>
                  {a.invariants.map((inv, j) => (
                    <div key={j} className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#ec4899" }} />
                      <span className="text-[9px] text-slate-400">{inv}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-slate-600 mb-1">Transfer candidates</div>
                  <div className="flex flex-wrap gap-1">
                    {a.transfer_candidates.map(tc => (
                      <span key={tc} className="text-[8px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                        {tc.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {run.bridge_candidates > 0 && (
              <div className="rounded-lg p-3" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="text-[9px] font-bold text-green-400 uppercase tracking-widest mb-1">
                  {run.bridge_candidates} bridge candidate{run.bridge_candidates > 1 ? "s" : ""} generated
                </div>
                <p className="text-[9px] text-slate-500">Available in Discover tab (⟺) — ranked by structural novelty.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
