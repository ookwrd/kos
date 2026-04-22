import { useGraphStore } from "../store/graphStore";

interface TacitStep {
  step: number;
  action: string;
  observation?: string;
  decision_point?: string;
  tacit_warning?: string;
  uncertainty?: number;
  duration_seconds?: number;
}

interface TacitTrace {
  id: string;
  name: string;
  domain?: string;
  expert_id?: string;
  expert_name?: string;
  calibration_score?: number;
  context?: string;
  equipment?: string;
  prerequisite_knowledge?: string[];
  steps: TacitStep[];
  outcome?: string;
  transferability_notes?: string;
}

const DEMO_TRACES: TacitTrace[] = [
  {
    id: "tacit-droplet-calibration",
    name: "Tin droplet generator calibration",
    domain: "euv_lithography",
    expert_name: "Senior ASML Process Engineer",
    calibration_score: 0.87,
    context: "EUV source maintenance after collector mirror replacement. System is warming up, droplet frequency nominal at 50kHz but pulse energy is drifting.",
    equipment: "Cymer/TRUMPF LPP EUV source, CO2 laser timing controller, in-situ droplet camera",
    steps: [
      { step: 1, action: "Observe droplet plume via in-situ camera at 10k fps", observation: "Droplet shape irregular — slight elongation on axis indicating nozzle wear pattern", uncertainty: 0.1 },
      { step: 2, action: "Reduce nozzle temperature by 2°C and hold 90 seconds", decision_point: "Temperature adjustment magnitude is experience-dependent; manuals say 1–5°C but experienced engineers read the elongation pattern to calibrate the delta", uncertainty: 0.25 },
      { step: 3, action: "Run pre-pulse timing sweep ±200ps around nominal", observation: "Peak conversion efficiency appears 80ps earlier than nominal — indicates droplet arrival drift", uncertainty: 0.15 },
      { step: 4, action: "Adjust droplet timing offset in control software", observation: "Conversion efficiency rises from 3.1% to 4.7%", uncertainty: 0.08 },
      { step: 5, action: "Monitor plasma emission spectrum for Sn II line at 13.5nm", observation: "Spectrum shape acceptable, no satellite lines indicating over-ionization", uncertainty: 0.12 },
      { step: 6, action: "Lock in parameters and run 10-minute stability burn-in", tacit_warning: "The final judgment of whether the calibration is 'settled' is not in any procedure. Engineers describe it as the droplet stream looking 'quiet' — a visual gestalt from 4+ years experience that has never been successfully codified into a threshold or metric.", uncertainty: 0.4 },
    ],
    outcome: "EUV source stabilized at 250W sustained output, within 2% of spec",
    transferability_notes: "Steps 1–5 can be taught in ~2 weeks. Step 6 requires 6–18 months supervised practice before independent certification.",
  },
  {
    id: "tacit-seawall-decision-1967",
    name: "Onagawa seawall height decision — 1967",
    domain: "fukushima_governance",
    expert_name: "Yanosuke Hirai",
    calibration_score: 0.91,
    context: "Design review for Onagawa Nuclear Power Plant. Standard JAEC guidelines specified 3m seawall. Hirai was the lead civil engineer reviewing site selection and coastal hazard data.",
    steps: [
      { step: 1, action: "Review historical tide records and coastal charts for Onagawa Bay", observation: "Records going back to 1896 show three tsunami events. Maximum recorded: 3.1m. Standard guideline: 3m wall would be marginally compliant.", uncertainty: 0.3 },
      { step: 2, action: "Interview local fishermen and examine inland debris markers", observation: "Fishermen report oral tradition of a very large wave 'in grandfather's time.' Debris markers found 8m above mean sea level 2km inland.", decision_point: "Oral tradition and debris are not in the regulatory evidence set. Hirai had to decide whether they counted.", tacit_warning: "The decision to weight non-documented evidence — local knowledge, debris patterns, oral history — over the official record required judgment that no procedure could specify. Hirai described it later as 'not wanting to be the engineer who was wrong because he only read the books.'", uncertainty: 0.55 },
      { step: 3, action: "Commission additional geological survey of bay sediment layers", observation: "Survey finds tsunami deposit layer consistent with large 9th-century event (later identified as Jogan 869 AD)", uncertainty: 0.2 },
      { step: 4, action: "Advocate for 14.8m seawall — nearly 5x the required minimum", decision_point: "Hirai argued for the higher wall against significant cost pressure. His argument: the asymmetry of consequences. A wall that is too high wastes money. A wall that is too low kills people.", uncertainty: 0.1 },
    ],
    outcome: "14.8m seawall built. On March 11, 2011, tsunami reached ~13m at Onagawa. Plant survived intact. All three reactors achieved cold shutdown.",
    transferability_notes: "The evidentiary judgment in step 2 — deciding when non-canonical evidence overrides canonical evidence — is the core tacit skill. It cannot be reduced to a rule without losing precisely what makes it valuable.",
  },
];

function UncertaintyBar({ value }: { value: number }) {
  const color = value > 0.5 ? "#f59e0b" : value > 0.25 ? "#6366f1" : "#22c55e";
  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 3, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color, borderRadius: 9999, transition: "width 0.4s" }} />
      </div>
      <span className="text-[9px] font-mono" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  );
}

export function TacitTraceViewer({ className = "" }: { className?: string }) {
  const { selectedNode, domainFilter } = useGraphStore();

  const relevantTraces = DEMO_TRACES.filter(t =>
    !domainFilter || t.domain === domainFilter
  );

  const activeTrace = selectedNode?.id && DEMO_TRACES.find(t => t.id === selectedNode.id)
    ? DEMO_TRACES.find(t => t.id === selectedNode.id)!
    : relevantTraces[0];

  if (!activeTrace) {
    return (
      <div className={`flex items-center justify-center text-slate-600 text-xs ${className}`}>
        No tacit traces for selected domain
      </div>
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      <div className="flex-shrink-0 px-3 pt-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-200 leading-snug">{activeTrace.name}</div>
            {activeTrace.expert_name && (
              <div className="text-[10px] text-slate-500 mt-0.5">{activeTrace.expert_name}
                {activeTrace.calibration_score !== undefined && (
                  <span className="ml-1.5 font-mono" style={{ color: "#6366f1" }}>
                    cal {activeTrace.calibration_score.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>
          <span
            className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
            style={{ backgroundColor: "#f59e0b15", color: "#f59e0b", border: "1px solid #f59e0b30" }}
          >
            tacit
          </span>
        </div>
        {activeTrace.context && (
          <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{activeTrace.context}</p>
        )}
        {relevantTraces.length > 1 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {relevantTraces.map(t => (
              <span
                key={t.id}
                className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                style={{
                  backgroundColor: t.id === activeTrace.id ? "#6366f125" : "rgba(30,41,59,0.5)",
                  color: t.id === activeTrace.id ? "#818cf8" : "#475569",
                  border: `1px solid ${t.id === activeTrace.id ? "#6366f140" : "transparent"}`,
                }}
              >
                {t.domain?.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {activeTrace.steps.map((step) => (
          <div
            key={step.step}
            className="rounded-lg p-2.5"
            style={{ backgroundColor: step.tacit_warning ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.03)", border: `1px solid ${step.tacit_warning ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)"}` }}
          >
            <div className="flex items-start gap-2">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: step.tacit_warning ? "#f59e0b20" : "#6366f120", color: step.tacit_warning ? "#f59e0b" : "#6366f1" }}
              >
                {step.step}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-300 leading-snug">{step.action}</div>

                {step.observation && (
                  <div className="mt-1 text-[10px] text-slate-500 leading-relaxed">
                    <span className="text-slate-600 uppercase tracking-widest text-[9px]">obs </span>
                    {step.observation}
                  </div>
                )}

                {step.decision_point && (
                  <div className="mt-1 text-[10px] leading-relaxed" style={{ color: "#818cf8" }}>
                    <span className="uppercase tracking-widest text-[9px]" style={{ color: "#6366f1" }}>decision </span>
                    {step.decision_point}
                  </div>
                )}

                {step.tacit_warning && (
                  <div
                    className="mt-2 p-2 rounded text-[10px] leading-relaxed"
                    style={{ backgroundColor: "rgba(245,158,11,0.08)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    <span className="block text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#f59e0b" }}>
                      ⚠ tacit knowledge — cannot be fully codified
                    </span>
                    {step.tacit_warning}
                  </div>
                )}

                {step.uncertainty !== undefined && (
                  <UncertaintyBar value={step.uncertainty} />
                )}
              </div>
            </div>
          </div>
        ))}

        {activeTrace.outcome && (
          <div
            className="rounded-lg p-2.5 mt-1"
            style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}
          >
            <div className="text-[9px] font-bold uppercase tracking-widest text-green-500 mb-1">Outcome</div>
            <div className="text-[10px] text-slate-400 leading-relaxed">{activeTrace.outcome}</div>
          </div>
        )}

        {activeTrace.transferability_notes && (
          <div
            className="rounded-lg p-2.5"
            style={{ backgroundColor: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)" }}
          >
            <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#6366f1" }}>Transferability</div>
            <div className="text-[10px] text-slate-400 leading-relaxed">{activeTrace.transferability_notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}
