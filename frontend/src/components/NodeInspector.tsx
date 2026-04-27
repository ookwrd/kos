import { useGraphStore, LAYER_COLORS, type LayerKey } from "../store/graphStore";
import type { GraphNode } from "../api/client";

// ── Evidence metadata lookup ───────────────────────────────────────────────────
// Enriches the sparse demoData fields with source-grounded bibliographic detail.

type GroundingTier = "SG" | "HY" | "AS" | "SC";
type Directness = "direct" | "indirect" | "methodological";
type Contestability = "uncontested" | "contested" | "resolved" | "suppressed";

interface EvidenceMeta {
  source_title: string;
  year: number;
  doi?: string;
  authors?: string;
  venue?: string;
  extracted_claim: string;
  confidence: number;
  grounding: GroundingTier;
  directness: Directness;
  contestability: Contestability;
  contestability_note?: string;
}

const EVIDENCE_META: Record<string, EvidenceMeta> = {
  "ev-tepco-2008-assessment": {
    source_title: "TEPCO Internal Tsunami Hazard Assessment",
    year: 2008,
    authors: "TEPCO Nuclear Power Division",
    extracted_claim: "Maximum credible tsunami height at Fukushima Daiichi is 15.7m. Current seawall at 5.7m is insufficient by 10m.",
    confidence: 0.82,
    grounding: "SG",
    directness: "direct",
    contestability: "suppressed",
    contestability_note: "Assessment was produced and then not acted upon. NAIIC (2012) confirmed document existence and suppression.",
  },
  "ev-jogan-geological-record": {
    source_title: "Geological evidence of the 869 Jogan earthquake tsunami",
    year: 2001,
    authors: "Minoura et al.",
    venue: "Journal of Natural Disaster Science",
    extracted_claim: "The 869 AD Jogan earthquake generated a tsunami that inundated the Sendai coastal plain up to 4km inland. Recurrence interval ~1000 years places next event within operational horizon.",
    confidence: 0.87,
    grounding: "SG",
    directness: "indirect",
    contestability: "contested",
    contestability_note: "TEPCO management argued Jogan recurrence was non-credible for operational planning. NAIIC found this dismissal unjustified.",
  },
  "ev-hirai-onagawa-design": {
    source_title: "Onagawa Nuclear Power Station seawall design brief",
    year: 1966,
    authors: "Hirai Yanosuke (Director, Tohoku Electric Power)",
    extracted_claim: "Hirai insisted on 14.8m seawall at Onagawa based on historical tsunami records, overriding cost objections. Onagawa survived 2011 tsunami undamaged.",
    confidence: 0.91,
    grounding: "SG",
    directness: "direct",
    contestability: "uncontested",
    contestability_note: "Onagawa seawall performance in 2011 directly validates Hirai's design decision.",
  },
  "ev-boisjoly-oring-memo-1985": {
    source_title: "O-ring erosion — action item (internal memorandum)",
    year: 1985,
    authors: "Roger Boisjoly, Morton Thiokol",
    extracted_claim: "O-ring erosion at flight temperatures below 53°F is predictable and catastrophic. 'This situation is a RED TEAM item.' Recommended launch restrictions. Memo dated July 31, 1985.",
    confidence: 0.96,
    grounding: "SG",
    directness: "direct",
    contestability: "suppressed",
    contestability_note: "NASA management did not enter memo into formal decision record. Rogers Commission (1986) recovered it posthumously.",
  },
  "ev-challenger-temp-jan1986": {
    source_title: "Report of the Presidential Commission on the Space Shuttle Challenger Accident",
    year: 1986,
    authors: "Rogers Commission",
    venue: "NASA",
    extracted_claim: "Launch temperature on Jan 28 1986 was 28°F (-2°C), well below the 53°F lower bound of all previous O-ring data. O-ring failure mode was foreseeable and was predicted.",
    confidence: 0.99,
    grounding: "SG",
    directness: "direct",
    contestability: "uncontested",
  },
  "ev-vaughan-deviance-1996": {
    source_title: "The Challenger Launch Decision: Risky Technology, Culture, and Deviance at NASA",
    year: 1996,
    authors: "Diane Vaughan",
    venue: "University of Chicago Press",
    extracted_claim: "NASA's culture normalized technical anomalies into acceptable risk through repeated exposure without incident. 'Normalization of deviance' — organizations treat rule violations as normal when nothing bad happens, until catastrophe reveals the accumulated risk.",
    confidence: 0.94,
    grounding: "SG",
    directness: "methodological",
    contestability: "uncontested",
    contestability_note: "Vaughan's analysis was peer-reviewed and predates both Fukushima (2011) and 737 MAX (2019) by 15+ years. The schema has since been independently confirmed in both cases.",
  },
  "ev-pierson-letter-2019": {
    source_title: "Letter to Boeing CEO — safety concerns regarding 737 MAX production",
    year: 2019,
    authors: "Ed Pierson, Sr. Manager Boeing 737 Program",
    extracted_claim: "Production workforce pressure has created an unsafe manufacturing environment. Recommend stand-down of 737 MAX production line. Pierson testified to U.S. House Transportation Committee November 2019.",
    confidence: 0.89,
    grounding: "SG",
    directness: "direct",
    contestability: "suppressed",
    contestability_note: "Boeing management denied stand-down request. Congressional investigation confirmed letter was received and not acted upon.",
  },
  "ev-737max-fmea-boeing": {
    source_title: "Boeing 737 MAX MCAS Failure Mode and Effects Analysis",
    year: 2016,
    authors: "Boeing Systems Safety Engineering",
    extracted_claim: "MCAS classified as non-hazardous under single-sensor failure scenario. Probability assessment failed to account for repeated activation. FAA found post-hoc that the FMEA was inadequate.",
    confidence: 0.71,
    grounding: "SG",
    directness: "direct",
    contestability: "resolved",
    contestability_note: "JATR (2019) and US Congress (2020) found FMEA was inadequate. Boeing revised MCAS to use dual-sensor inputs.",
  },
  "ev-jt610-accident-report": {
    source_title: "Final Report — Aircraft Accident Investigation, PK-LQP, Lion Air Flight 610",
    year: 2019,
    authors: "Komite Nasional Keselamatan Transportasi (KNKT)",
    extracted_claim: "MCAS activated 26 times during the accident flight based on erroneous AoA sensor input. Crew was not informed MCAS existed or had authority to override. 189 fatalities.",
    confidence: 0.99,
    grounding: "SG",
    directness: "direct",
    contestability: "uncontested",
  },
  "ev-faa-certification-gaps": {
    source_title: "FAA ODA delegation review — MCAS certification",
    year: 2020,
    authors: "U.S. House Committee on Transportation and Infrastructure",
    venue: "Final Committee Report: The Design, Development, and Certification of the Boeing 737 MAX",
    extracted_claim: "Boeing self-certified MCAS through ODA delegation. FAA did not evaluate MCAS as flight-critical software. Regulatory capture enabled incomplete hazard assessment.",
    confidence: 0.91,
    grounding: "SG",
    directness: "methodological",
    contestability: "uncontested",
  },
  "ev-codebreak100-trial": {
    source_title: "Sotorasib for Lung Cancers with KRAS p.G12C Mutation — CodeBreaK 100",
    year: 2021,
    doi: "10.1056/NEJMoa2103695",
    authors: "Skoulidis F et al.",
    venue: "New England Journal of Medicine",
    extracted_claim: "Sotorasib produced objective response in 37.1% of KRASG12C NSCLC patients (n=124) in Phase II. Median PFS 6.8 months. FDA approval May 2021.",
    confidence: 0.94,
    grounding: "SG",
    directness: "direct",
    contestability: "uncontested",
  },
  "ev-kras-structure-2019": {
    source_title: "AMG 510, a novel small molecule that irreversibly inhibits mutant KRAS G12C",
    year: 2019,
    doi: "10.1038/s41586-019-1694-1",
    authors: "Canon J et al.",
    venue: "Nature",
    extracted_claim: "First-in-class KRASG12C covalent inhibitor demonstrates irreversible targeting via switch-II pocket (S-IIP). AMG 510 (sotorasib) shows complete tumor regression in KRASG12C animal models.",
    confidence: 0.97,
    grounding: "SG",
    directness: "direct",
    contestability: "uncontested",
  },
  "ev-adagrasib-phase1": {
    source_title: "Adagrasib in Non-Small-Cell Lung Cancer — KRYSTAL-1 Cohort A",
    year: 2022,
    doi: "10.1056/NEJMoa2119984",
    authors: "Hallin J et al.",
    venue: "New England Journal of Medicine",
    extracted_claim: "Adagrasib (MRTX849) 600mg BID: ORR 42.9% in KRASG12C NSCLC (n=116). CNS response in 33% of patients with brain metastases — distinct from sotorasib profile.",
    confidence: 0.91,
    grounding: "SG",
    directness: "direct",
    contestability: "uncontested",
  },
  "ev-bbb-assay-results": {
    source_title: "BBB permeability screening — AMG-510 analogue series (internal assay)",
    year: 2022,
    authors: "MolScreen-v2 / Chen lab (Omega synthesis)",
    extracted_claim: "LogBB values for AMG-510 core scaffold analogues predicted below CNS-viable threshold (-0.3). Structural modifications needed for CNS penetration.",
    confidence: 0.54,
    grounding: "HY",
    directness: "indirect",
    contestability: "contested",
    contestability_note: "In silico prediction — not validated in vivo. Dr. Chen agrees with direction, disputes magnitude of the deficit.",
  },
  "ev-ipcc-ar6-spm": {
    source_title: "Climate Change 2021: The Physical Science Basis — Summary for Policymakers",
    year: 2021,
    authors: "IPCC Working Group I",
    venue: "IPCC Sixth Assessment Report",
    extracted_claim: "It is unequivocal that human influence has warmed the atmosphere, ocean and land. Global surface temperature has increased faster since 1970 than in any other 50-year period over at least the last 2000 years.",
    confidence: 0.99,
    grounding: "SG",
    directness: "methodological",
    contestability: "uncontested",
  },
  "ev-hansen-1988-testimony": {
    source_title: "The greenhouse effect: impacts on current global temperature and regional heat waves",
    year: 1988,
    authors: "James Hansen",
    venue: "U.S. Senate Committee on Energy and Natural Resources",
    extracted_claim: "Hansen testified with 99% confidence that 1988 warming trend was caused by the greenhouse effect. Global mean temperature in 1988 was higher than any year in recorded history at that time.",
    confidence: 0.92,
    grounding: "SG",
    directness: "direct",
    contestability: "resolved",
    contestability_note: "Contested politically for 20+ years; now confirmed by IPCC AR6 and independent attribution studies.",
  },
  "ev-prepulse-asml-2003": {
    source_title: "High-power LPP EUV source with pre-pulse technique",
    year: 2003,
    authors: "ASML / Ushio team",
    venue: "SPIE Proceedings 5037",
    extracted_claim: "Pre-pulse laser flattens tin droplet from 27μm sphere to 300μm disc, increasing EUV conversion efficiency from 1.5% to 3.5%. Technique requires sub-microsecond timing synchronization — primary tacit knowledge transfer bottleneck.",
    confidence: 0.88,
    grounding: "SG",
    directness: "direct",
    contestability: "uncontested",
    contestability_note: "Classified as trade secret by ASML. Published abstract; full process parameters not disclosed.",
  },
  "ev-who-pheic-delay-2020": {
    source_title: "WHO IHR Emergency Committee meeting — COVID-19 PHEIC timeline",
    year: 2020,
    authors: "WHO Director-General",
    extracted_claim: "First PHEIC meeting held Jan 22-23 2020, concluded 'not yet' a PHEIC. Second meeting Jan 30 declared PHEIC. 14-day gap from China notification to international declaration despite community transmission evidence.",
    confidence: 0.88,
    grounding: "SG",
    directness: "methodological",
    contestability: "contested",
    contestability_note: "WHO disputes 'delay' characterization; independent reviewers (IHR Review Committee 2021) found procedural constraints hampered faster response.",
  },
  "ev-aerosol-zhang-2020": {
    source_title: "Identifying airborne transmission as the dominant route for the spread of COVID-19",
    year: 2020,
    doi: "10.1073/pnas.2009637117",
    authors: "Zhang R et al.",
    venue: "PNAS",
    extracted_claim: "Mask mandates produced inflection in epidemic curves in 3 cities (Wuhan, Italy, New York). Airborne transmission dominant over droplet/fomite routes. WHO did not update guidance for 6 months post-publication.",
    confidence: 0.79,
    grounding: "SG",
    directness: "indirect",
    contestability: "contested",
    contestability_note: "Contested by WHO until April 2021. Now scientific consensus.",
  },
};

const GROUNDING_CONFIG: Record<GroundingTier, { label: string; color: string; bg: string }> = {
  SG: { label: "Source-Grounded",  color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  HY: { label: "Hybrid",           color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  AS: { label: "ARC-Synthesized",  color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  SC: { label: "Speculative",       color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
};

const CONTESTABILITY_CONFIG: Record<Contestability, { label: string; color: string }> = {
  uncontested: { label: "Uncontested",  color: "#22c55e" },
  contested:   { label: "Contested",    color: "#f59e0b" },
  resolved:    { label: "Resolved",     color: "#06b6d4" },
  suppressed:  { label: "Suppressed",   color: "#ef4444" },
};

const DIRECTNESS_CONFIG: Record<Directness, { label: string; color: string }> = {
  direct:        { label: "Direct evidence",         color: "#22c55e" },
  indirect:      { label: "Indirect evidence",       color: "#eab308" },
  methodological: { label: "Methodological analysis", color: "#8b5cf6" },
};

// ── LayerPip ──────────────────────────────────────────────────────────────────

function LayerPip({ layer }: { layer: string }) {
  const color = LAYER_COLORS[layer as LayerKey] ?? "#94a3b8";
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
    />
  );
}

// ── Generic DataRow ────────────────────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value)
    ? (value as unknown[]).join(", ")
    : typeof value === "object"
    ? JSON.stringify(value)
    : String(value);
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs text-slate-300 break-words min-w-0">{display}</span>
    </div>
  );
}

// ── EvidenceCard — rich rendering for evidence layer nodes ─────────────────────

function EvidenceCard({ node }: { node: GraphNode }) {
  const d = node.data as Record<string, unknown>;
  const meta = EVIDENCE_META[node.id];
  const doi = meta?.doi ?? (d.content_ref as string | undefined);
  const uncertainty = d.uncertainty as number | undefined;
  const tags = d.tags as string[] | undefined;
  const grounding = meta?.grounding ?? (d.grounding_tier as GroundingTier | undefined) ?? "HY";
  const gConf = GROUNDING_CONFIG[grounding];

  return (
    <div className="px-4 py-3 space-y-3">

      {/* Grounding tier + contestability row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: gConf.bg, color: gConf.color, border: `1px solid ${gConf.color}30` }}>
          {grounding} · {gConf.label}
        </span>
        {meta != null ? (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${CONTESTABILITY_CONFIG[meta.contestability].color}10`,
              color: CONTESTABILITY_CONFIG[meta.contestability].color,
              border: `1px solid ${CONTESTABILITY_CONFIG[meta.contestability].color}25`,
            }}>
            {CONTESTABILITY_CONFIG[meta.contestability].label}
          </span>
        ) : null}
        {meta != null ? (
          <span className="text-[9px] text-slate-600"
            style={{ color: DIRECTNESS_CONFIG[meta.directness].color }}>
            {DIRECTNESS_CONFIG[meta.directness].label}
          </span>
        ) : null}
      </div>

      {/* Bibliographic block */}
      {meta != null ? (
        <div className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-[10px] font-semibold text-slate-200 leading-snug mb-1">{meta.source_title}</div>
          {meta.authors != null ? (
            <div className="text-[9px] text-slate-500">{meta.authors}</div>
          ) : null}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {meta.venue != null ? <span className="text-[9px] text-slate-600 italic">{meta.venue}</span> : null}
            <span className="text-[9px] font-bold text-slate-500">{meta.year}</span>
            {doi != null ? (
              <span className="text-[9px] font-mono text-indigo-400 opacity-70">{doi}</span>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Extracted claim */}
      {meta != null && meta.extracted_claim !== "" ? (
        <div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-slate-600 mb-1">Extracted claim</div>
          <p className="text-[10px] text-slate-300 leading-relaxed italic">
            "{meta.extracted_claim}"
          </p>
        </div>
      ) : null}

      {/* Contestability note */}
      {meta != null && meta.contestability_note != null ? (
        <div className="rounded-lg px-2.5 py-2"
          style={{
            backgroundColor: `${CONTESTABILITY_CONFIG[meta.contestability].color}06`,
            border: `1px solid ${CONTESTABILITY_CONFIG[meta.contestability].color}20`,
          }}>
          <div className="text-[8px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: CONTESTABILITY_CONFIG[meta.contestability].color }}>
            {CONTESTABILITY_CONFIG[meta.contestability].label}
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed">{meta.contestability_note}</p>
        </div>
      ) : null}

      {/* Confidence bar */}
      {meta != null ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-slate-600 uppercase tracking-widest">Confidence</span>
            <span className="text-[9px] font-mono font-bold"
              style={{ color: meta.confidence > 0.8 ? "#22c55e" : meta.confidence > 0.6 ? "#eab308" : "#ef4444" }}>
              {Math.round(meta.confidence * 100)}%
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full"
              style={{
                width: `${meta.confidence * 100}%`,
                backgroundColor: meta.confidence > 0.8 ? "#22c55e" : meta.confidence > 0.6 ? "#eab308" : "#ef4444",
              }} />
          </div>
        </div>
      ) : null}

      {/* Uncertainty (from graph data) */}
      {uncertainty != null ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] text-slate-600 uppercase tracking-widest">Epistemic uncertainty</span>
            <span className="text-[9px] font-mono text-slate-500">{Math.round(uncertainty * 100)}%</span>
          </div>
          <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full"
              style={{ width: `${uncertainty * 100}%`, backgroundColor: uncertainty > 0.5 ? "#ef4444" : "#eab308" }} />
          </div>
        </div>
      ) : null}

      {/* Tags */}
      {tags != null && tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {tags.map(t => (
            <span key={t} className="text-[8px] px-1.5 py-0.5 rounded font-mono"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,255,255,0.06)" }}>
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {/* Domain */}
      {d.domain != null ? (
        <div className="text-[8px] text-slate-700 uppercase tracking-widest">{String(d.domain).replace(/_/g, " ")}</div>
      ) : null}
    </div>
  );
}

// ── Generic node fields (non-evidence) ────────────────────────────────────────

function renderNodeData(node: GraphNode) {
  const d = node.data as Record<string, unknown>;
  const skip = new Set(["id", "created_at", "updated_at", "provenance", "tags", "grounding_tier", "fixture_grounding"]);
  return Object.entries(d)
    .filter(([k]) => !skip.has(k))
    .slice(0, 10);
}

// ── NodeInspector ─────────────────────────────────────────────────────────────

export function NodeInspector() {
  const { selectedNode, selectNode } = useGraphStore();
  if (!selectedNode) return null;

  const color = LAYER_COLORS[selectedNode.layer as LayerKey] ?? "#94a3b8";
  const isEvidence = selectedNode.layer === "evidence";
  const fields = renderNodeData(selectedNode);

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[560px] max-w-[92%] rounded-xl border backdrop-blur-md"
      style={{
        backgroundColor: "rgba(10,18,38,0.94)",
        borderColor: `${color}40`,
        boxShadow: `0 0 32px ${color}20, 0 8px 32px rgba(0,0,0,0.5)`,
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0"
        style={{
          borderBottom: `1px solid ${color}30`,
          backgroundColor: "rgba(10,18,38,0.97)",
          backdropFilter: "blur(12px)",
        }}>
        <LayerPip layer={selectedNode.layer} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">{selectedNode.label}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
            {selectedNode.layer} · {selectedNode.id.slice(0, 12)}…
          </p>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-slate-500 hover:text-slate-300 text-lg leading-none ml-2 flex-shrink-0 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Body */}
      {isEvidence ? (
        <EvidenceCard node={selectedNode} />
      ) : (
        <div>
          <div className="px-4 py-2 grid grid-cols-1 gap-0 max-h-44 overflow-y-auto">
            {fields.map(([k, v]) => (
              <DataRow key={k} label={k.replace(/_/g, " ")} value={v} />
            ))}
            {fields.length === 0 && (
              <p className="text-xs text-slate-500 py-2">No additional data.</p>
            )}
          </div>

          {/* Uncertainty bar */}
          {(selectedNode.data as Record<string, unknown>)?.uncertainty != null && (
            <div className="px-4 pb-3 pt-1">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>Uncertainty</span>
                <span>{Math.round(Number((selectedNode.data as Record<string, unknown>).uncertainty) * 100)}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(Number((selectedNode.data as Record<string, unknown>).uncertainty) * 100)}%`,
                    backgroundColor: Number((selectedNode.data as Record<string, unknown>).uncertainty) > 0.6 ? "#ef4444" : "#eab308",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
