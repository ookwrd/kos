import { useState, useCallback } from "react";
import { useGraphStore } from "../store/graphStore";

// ── Types ─────────────────────────────────────────────────────────────────────

type Scenario = "baseline" | "30d" | "60d" | "90d" | "combined" | "blackswan";
type TheaterMode = "food" | "governance";

// ── Scenario data ─────────────────────────────────────────────────────────────

interface ScenarioImpact {
  availability: number;
  access: number;
  utilization: number;
  stability: number;
  sovereignty: number;
  reserveMonths: number;
  confidence: number;
}

const SCENARIO_IMPACTS: Record<Scenario, ScenarioImpact> = {
  baseline:  { availability: 92, access: 88, utilization: 84, stability: 85, sovereignty: 72, reserveMonths: 3.2, confidence: 0.88 },
  "30d":     { availability: 74, access: 71, utilization: 79, stability: 63, sovereignty: 72, reserveMonths: 1.8, confidence: 0.81 },
  "60d":     { availability: 54, access: 52, utilization: 70, stability: 44, sovereignty: 72, reserveMonths: 0.6, confidence: 0.72 },
  "90d":     { availability: 34, access: 38, utilization: 61, stability: 28, sovereignty: 72, reserveMonths: 0.0, confidence: 0.63 },
  combined:  { availability: 41, access: 31, utilization: 55, stability: 19, sovereignty: 65, reserveMonths: 0.2, confidence: 0.55 },
  blackswan: { availability: 22, access: 18, utilization: 44, stability: 9,  sovereignty: 65, reserveMonths: 0.0, confidence: 0.38 },
};

const SCENARIO_LABELS: Record<Scenario, string> = {
  baseline:  "Baseline",
  "30d":     "30-day disruption",
  "60d":     "60-day disruption",
  "90d":     "90-day disruption",
  combined:  "Combined shock",
  blackswan: "Black swan",
};

const SCENARIO_DESC: Record<Scenario, string> = {
  baseline:  "Current import mix, normal operations",
  "30d":     "Major import corridor disrupted — 30 days",
  "60d":     "Extended disruption — strategic reserves drawn down",
  "90d":     "90-day disruption — reserves depleted, emergency measures required",
  combined:  "Corridor disruption + price spike + domestic water stress",
  blackswan: "Simultaneous port bottleneck + supplier export controls",
};

// ── Decision options ──────────────────────────────────────────────────────────

interface DecisionOption {
  id: string;
  label: string;
  cost: "low" | "medium" | "high" | "very high";
  availability: number;
  nutrition: number;
  resilience: number;
  timeToEffect: string;
  confidence: number;
  openQuestions: number;
  status: "active" | "partial" | "not_deployed";
}

const DECISION_OPTIONS: DecisionOption[] = [
  { id: "import-diversification", label: "Import diversification", cost: "medium", availability: 82, nutrition: 79, resilience: 71, timeToEffect: "6–18 months", confidence: 0.74, openQuestions: 2, status: "partial" },
  { id: "strategic-reserves",     label: "Strategic reserves ↑ to 6 months", cost: "high", availability: 94, nutrition: 91, resilience: 89, timeToEffect: "12–24 months", confidence: 0.83, openQuestions: 1, status: "not_deployed" },
  { id: "domestic-production",    label: "Selective domestic production", cost: "very high", availability: 48, nutrition: 44, resilience: 95, timeToEffect: "24–60 months", confidence: 0.52, openQuestions: 4, status: "partial" },
  { id: "demand-management",      label: "Demand management + nutrition focus", cost: "low", availability: 78, nutrition: 85, resilience: 62, timeToEffect: "1–3 months", confidence: 0.89, openQuestions: 2, status: "not_deployed" },
  { id: "emergency-procurement",  label: "Emergency procurement corridors", cost: "high", availability: 71, nutrition: 68, resilience: 55, timeToEffect: "1–6 months", confidence: 0.67, openQuestions: 3, status: "not_deployed" },
];

// ── Data sources ──────────────────────────────────────────────────────────────

interface DataSource {
  id: string;
  label: string;
  type: "public" | "internal" | "placeholder";
  status: "connected" | "partial" | "gap";
  confidence: number;
  note: string;
}

const DATA_SOURCES: DataSource[] = [
  { id: "faostat",          label: "FAOSTAT Food Balance Sheets",        type: "public",      status: "connected", confidence: 0.91, note: "Annual data, ~18-month lag" },
  { id: "fao-fsi",          label: "FAO Food Security Indicators",       type: "public",      status: "connected", confidence: 0.87, note: "National level; sub-national gaps" },
  { id: "wfp-hunger",       label: "WFP HungerMap",                      type: "public",      status: "connected", confidence: 0.78, note: "Near real-time risk signals" },
  { id: "comtrade",         label: "UN Comtrade (food imports)",          type: "public",      status: "connected", confidence: 0.84, note: "6-month lag; HS code granularity" },
  { id: "wb-food",          label: "World Bank food/agriculture",         type: "public",      status: "connected", confidence: 0.82, note: "Annual; nutrition metrics limited" },
  { id: "reserve-stocks",   label: "National reserve stock data",         type: "internal",    status: "gap",       confidence: 0.41, note: "Not publicly disclosed — critical gap" },
  { id: "domestic-prod",    label: "Domestic production (real-time)",     type: "internal",    status: "gap",       confidence: 0.38, note: "Agricultural census partial" },
  { id: "nutrition-survey", label: "Household nutrition survey",          type: "internal",    status: "gap",       confidence: 0.29, note: "Last survey >3 years old" },
  { id: "foresight",        label: "Foresight radar",                     type: "placeholder", status: "gap",       confidence: 0.0,  note: "Tool connector — not yet built" },
  { id: "montecarlo",       label: "Supply-chain Monte Carlo",            type: "placeholder", status: "gap",       confidence: 0.0,  note: "Tool connector — not yet built" },
  { id: "trade-intel",      label: "Trade intelligence",                  type: "placeholder", status: "gap",       confidence: 0.0,  note: "Tool connector — not yet built" },
  { id: "expert-capture",   label: "Expert interview capture",            type: "placeholder", status: "gap",       confidence: 0.0,  note: "Tacit knowledge capture — pending" },
];

// ── Next-best questions ────────────────────────────────────────────────────────

interface NextBestQuestion {
  id: string;
  question: string;
  dimension: string;
  urgency: "critical" | "high" | "medium";
  owner: string;
  gapType: "data" | "definition" | "governance" | "strategy";
}

const NEXT_BEST_QUESTIONS: NextBestQuestion[] = [
  { id: "q1", question: "What is the current reserve stock level for cereals and protein sources — and when was it last verified?", dimension: "Stability",    urgency: "critical", owner: "Food authority",     gapType: "data" },
  { id: "q2", question: "Which protein import partners could be diversified within 12 months without price premium?",             dimension: "Availability", urgency: "high",     owner: "Trade ministry",     gapType: "strategy" },
  { id: "q3", question: "What nutrition threshold applies for pediatric populations during rationing — and is it legally binding?", dimension: "Utilization",  urgency: "high",     owner: "Health ministry",    gapType: "definition" },
  { id: "q4", question: "Which agency owns the crisis governance trigger — and at what reserve level does it activate?",          dimension: "Sovereignty",  urgency: "critical", owner: "Cabinet / Crisis",   gapType: "governance" },
  { id: "q5", question: "Which scenario invalidates the current import-diversification strategy?",                                 dimension: "Resilience",   urgency: "high",     owner: "Supply chain team",  gapType: "strategy" },
  { id: "q6", question: "How does desalination capacity constrain domestic production options under a combined shock?",            dimension: "Availability", urgency: "medium",   owner: "Agriculture ministry", gapType: "strategy" },
];

// ── Governance functions ──────────────────────────────────────────────────────

const GOV_FUNCTIONS = [
  { id: "policy",      label: "Policy & Strategy",  agents: 2, dataClass: "sensitive",  risk: "medium" },
  { id: "procurement", label: "Procurement",         agents: 3, dataClass: "restricted", risk: "high" },
  { id: "operations",  label: "Operations",          agents: 4, dataClass: "restricted", risk: "medium" },
  { id: "public-svc",  label: "Public Services",     agents: 5, dataClass: "public",     risk: "low" },
  { id: "legal",       label: "Legal & Compliance",  agents: 2, dataClass: "sovereign",  risk: "high" },
  { id: "infra",       label: "Infrastructure",      agents: 3, dataClass: "restricted", risk: "high" },
  { id: "audit",       label: "Audit",               agents: 2, dataClass: "sovereign",  risk: "critical" },
];

// ── Utility components ─────────────────────────────────────────────────────────

function ScoreBar({ value, color = "#6366f1", size = "md" }: { value: number; color?: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? 3 : 4;
  return (
    <div className="flex items-center gap-1.5">
      <div style={{ width: size === "sm" ? 40 : 56, height: h, background: "rgba(255,255,255,0.06)", borderRadius: h }}>
        <div style={{ width: `${value}%`, height: h, background: color, borderRadius: h, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 9, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const color = value >= 0.8 ? "#22c55e" : value >= 0.6 ? "#eab308" : value >= 0.4 ? "#f97316" : "#ef4444";
  return (
    <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {Math.round(value * 100)}%
    </span>
  );
}

function UrgencyDot({ urgency }: { urgency: NextBestQuestion["urgency"] }) {
  const color = urgency === "critical" ? "#ef4444" : urgency === "high" ? "#f97316" : "#eab308";
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />;
}

function StatusPill({ status }: { status: DataSource["status"] }) {
  const [label, color] = status === "connected" ? ["connected", "#22c55e"] : status === "partial" ? ["partial", "#eab308"] : ["gap", "#64748b"];
  return (
    <span style={{ fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: `${color}18`, color, border: `1px solid ${color}28`, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}
    </span>
  );
}

// ── Food Security Panel ────────────────────────────────────────────────────────

function FoodSecurityPanel({
  scenario, setScenario, onCommit, localNodeCount,
}: {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  onCommit: () => void;
  localNodeCount: number;
}) {
  const impact = SCENARIO_IMPACTS[scenario];
  const [committedQ, setCommittedQ] = useState<Set<string>>(new Set());

  const handleCommitQ = useCallback((qId: string) => {
    onCommit();
    setCommittedQ(prev => new Set([...prev, qId]));
  }, [onCommit]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Context strip */}
      <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 9, color: "#6366f1" }}>Food security scenario · UAE / GCC</span>
        <span style={{ fontSize: 9, color: "#1e293b" }}>·</span>
        <span style={{ fontSize: 9, color: "#1e293b" }}>Public data: FAOSTAT / WFP / Comtrade</span>
        {localNodeCount > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#4ade80", fontWeight: 600 }}>
            +{localNodeCount} committed to substrate
          </span>
        )}
      </div>

      {/* Scenario bar */}
      <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
        <span style={{ fontSize: 8, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4 }}>Scenario</span>
        {(Object.keys(SCENARIO_LABELS) as Scenario[]).map(s => {
          const isActive = scenario === s;
          const isRisk = s !== "baseline";
          return (
            <button key={s} onClick={() => setScenario(s)}
              style={{
                padding: "3px 9px", borderRadius: 5, fontSize: 9, fontWeight: 500, cursor: "pointer",
                background: isActive ? (isRisk ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.12)") : "rgba(255,255,255,0.02)",
                color: isActive ? (isRisk ? "#fca5a5" : "#818cf8") : "#334155",
                border: `1px solid ${isActive ? (isRisk ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.25)") : "rgba(255,255,255,0.05)"}`,
              }}>
              {SCENARIO_LABELS[s]}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 8, color: "#1e293b" }}>{SCENARIO_DESC[scenario]}</span>
      </div>

      {/* 3-column layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: Dimensions + Data confidence */}
        <div style={{ width: 210, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.04)", overflowY: "auto", padding: "12px 12px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", marginBottom: 10 }}>
            Food Security Dimensions
          </div>
          {[
            { key: "availability", label: "Availability",          value: impact.availability },
            { key: "access",       label: "Access / Affordability", value: impact.access },
            { key: "utilization",  label: "Nutrition / Safety",     value: impact.utilization },
            { key: "stability",    label: "Stability",               value: impact.stability },
            { key: "sovereignty",  label: "Sovereignty",             value: impact.sovereignty },
          ].map(dim => {
            const c = dim.value < 50 ? "#ef4444" : dim.value < 70 ? "#f97316" : "#22c55e";
            return (
              <div key={dim.key} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 9, color: "#64748b" }}>{dim.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c, fontVariantNumeric: "tabular-nums" }}>{dim.value}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                  <div style={{ width: `${dim.value}%`, height: 3, background: c, borderRadius: 2, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 4, padding: "6px 8px", borderRadius: 6, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)" }}>
            <div style={{ fontSize: 8, color: "#64748b", marginBottom: 2 }}>Reserve months</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: impact.reserveMonths < 1 ? "#ef4444" : impact.reserveMonths < 2 ? "#f97316" : "#818cf8", fontVariantNumeric: "tabular-nums" }}>
              {impact.reserveMonths.toFixed(1)} <span style={{ fontSize: 10, fontWeight: 400, color: "#64748b" }}>months</span>
            </div>
          </div>

          <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", marginTop: 16, marginBottom: 8 }}>
            Data Confidence
          </div>
          {DATA_SOURCES.slice(0, 8).map(ds => (
            <div key={ds.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <StatusPill status={ds.status} />
              <span style={{ fontSize: 8, color: ds.status === "gap" ? "#1e293b" : "#64748b", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                title={ds.note}>
                {ds.label}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 4, padding: "4px 6px", borderRadius: 4, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <span style={{ fontSize: 8, color: "#fca5a5" }}>3 critical data gaps</span>
          </div>
        </div>

        {/* Center: Decision matrix + tool connectors */}
        <div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1" }}>
              Decision Options · {SCENARIO_LABELS[scenario]}
            </span>
            <ConfidenceBadge value={impact.confidence} />
            <span style={{ marginLeft: "auto", fontSize: 8, color: "#1e293b" }}>Source: FAOSTAT / WFP · public data</span>
          </div>

          {/* Matrix header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.5fr 0.6fr", gap: 4, padding: "4px 8px", marginBottom: 4 }}>
            {["Strategy", "Avail.", "Nutrition", "Resilience", "Cost", "Time", "Conf.", "Status"].map(h => (
              <div key={h} style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#334155" }}>{h}</div>
            ))}
          </div>

          {DECISION_OPTIONS.map(opt => {
            const costColor = { low: "#22c55e", medium: "#eab308", high: "#f97316", "very high": "#ef4444" }[opt.cost];
            const statusColor = opt.status === "active" ? "#22c55e" : opt.status === "partial" ? "#eab308" : "#334155";
            return (
              <div key={opt.id} style={{
                display: "grid", gridTemplateColumns: "2fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.5fr 0.6fr",
                gap: 4, padding: "6px 8px", borderRadius: 6, marginBottom: 4,
                background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0", marginBottom: 1 }}>{opt.label}</div>
                  {opt.openQuestions > 0 && (
                    <div style={{ fontSize: 8, color: "#f97316" }}>{opt.openQuestions} open question{opt.openQuestions > 1 ? "s" : ""}</div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}><ScoreBar value={opt.availability} color="#22c55e" size="sm" /></div>
                <div style={{ display: "flex", alignItems: "center" }}><ScoreBar value={opt.nutrition} color="#6366f1" size="sm" /></div>
                <div style={{ display: "flex", alignItems: "center" }}><ScoreBar value={opt.resilience} color="#3b82f6" size="sm" /></div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: costColor, fontWeight: 600 }}>{opt.cost}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: "#64748b" }}>{opt.timeToEffect}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}><ConfidenceBadge value={opt.confidence} /></div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: statusColor, fontWeight: 600, textTransform: "capitalize" }}>
                    {opt.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 6, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.14)" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#fca5a5", marginBottom: 4 }}>
              No single strategy achieves adequate availability + nutrition + resilience under {SCENARIO_LABELS[scenario]}
            </div>
            <div style={{ fontSize: 8, color: "#64748b" }}>
              Combined strategy required. Key question: is strategic-reserve build-up feasible at current fiscal capacity?
            </div>
          </div>

          {/* Tool Integration Fabric */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", marginBottom: 8 }}>
              Tool Integration Fabric
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {DATA_SOURCES.map(ds => (
                <div key={ds.id} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 7px", borderRadius: 4,
                  background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: ds.status === "connected" ? "#22c55e" : ds.status === "partial" ? "#eab308" : "#1e293b" }} />
                  <span style={{ fontSize: 8, color: ds.status === "gap" ? "#1e293b" : "#64748b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={ds.note}>
                    {ds.label}
                  </span>
                  <span style={{ fontSize: 7, color: "#1e293b", flexShrink: 0 }}>
                    {ds.type === "placeholder" ? "connector-ready" : ds.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Next-best questions + commit */}
        <div style={{ width: 230, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.04)", overflowY: "auto", padding: "12px 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", marginBottom: 10 }}>
            Next-Best Questions
          </div>
          {NEXT_BEST_QUESTIONS.map((q, i) => {
            const isCommitted = committedQ.has(q.id);
            return (
              <div key={q.id} style={{
                padding: "8px 8px", borderRadius: 6, marginBottom: 6,
                background: isCommitted ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.018)",
                border: `1px solid ${isCommitted ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.05)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 4 }}>
                  <UrgencyDot urgency={q.urgency} />
                  <span style={{ fontSize: 9, color: "#e2e8f0", lineHeight: 1.4, flex: 1 }}>{q.question}</span>
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <span style={{ fontSize: 7, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>{q.dimension}</span>
                  <span style={{ fontSize: 7, color: "#1e293b" }}>·</span>
                  <span style={{ fontSize: 7, color: "#334155" }}>{q.owner}</span>
                  {isCommitted ? (
                    <span style={{ marginLeft: "auto", fontSize: 7, color: "#4ade80" }}>✓ in substrate</span>
                  ) : i < 2 && (
                    <button onClick={() => handleCommitQ(q.id)}
                      style={{ marginLeft: "auto", fontSize: 7, color: "#4ade80", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 3, padding: "1px 5px", cursor: "pointer" }}>
                      commit
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 12, padding: "8px 8px", borderRadius: 6, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#818cf8", marginBottom: 4 }}>Substrate Growth</div>
            <p style={{ fontSize: 8, color: "#334155", lineHeight: 1.4, marginBottom: 8 }}>
              Committing a question adds it as a governed node — source, owner, and timestamp preserved.
            </p>
            <div style={{ fontSize: 8, color: "#22c55e", marginBottom: 2 }}>
              {localNodeCount} node{localNodeCount !== 1 ? "s" : ""} committed this session
            </div>
            <div style={{ fontSize: 7, color: "#1e293b" }}>local demo write · localStorage persisted</div>
          </div>

          {scenario !== "baseline" && (
            <div style={{ marginTop: 10, padding: "8px 8px", borderRadius: 6, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.14)" }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: "#fca5a5", marginBottom: 4 }}>Decision window</div>
              <p style={{ fontSize: 8, color: "#64748b", lineHeight: 1.4 }}>
                {scenario === "30d" && "30-day: managed stress — reserve drawdown manageable if diversification is activated immediately."}
                {scenario === "60d" && "60-day: reserves critically low. Demand management and emergency procurement are mandatory."}
                {scenario === "90d" && "90-day: reserves exhausted. Crisis measures unavoidable. Trigger should have fired by day 45."}
                {scenario === "combined" && "Combined shock invalidates import-diversification. Domestic production and reserves are the only absorbers."}
                {scenario === "blackswan" && "Black swan: no current strategy yields acceptable outcomes. Pre-positioned reserves are the only absorber."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Governance Architecture Panel ─────────────────────────────────────────────

function GovernancePanel() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ padding: "16px 20px", height: "100%", overflow: "auto" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: "14px 16px", borderRadius: 8, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Risk: Monolithic cloud agent</div>
            <div style={{ fontSize: 9, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>All context → single foreign API → no data residency → no governance boundary → no auditability.</div>
            {["Sensitive context in foreign cloud", "No permission boundary per function", "No provenance or revocation", "Single model failure = institution failure"].map(r => (
              <div key={r} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                <span style={{ color: "#ef4444", fontSize: 9 }}>✗</span>
                <span style={{ fontSize: 9, color: "#4b5563" }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "14px 16px", borderRadius: 8, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Governed distributed substrate</div>
            <div style={{ fontSize: 9, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>Each function has a local vault. Data classified and bounded. KOS provides the provenance substrate.</div>
            {["Data residency enforced per vault", "Permission boundaries per function", "Full provenance + revocation chain", "Graceful degradation if one agent fails"].map(r => (
              <div key={r} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                <span style={{ color: "#6366f1", fontSize: 9 }}>✓</span>
                <span style={{ fontSize: 9, color: "#64748b" }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", marginBottom: 10 }}>
          Function Vaults
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          {GOV_FUNCTIONS.map(fn => {
            const riskColor = { low: "#22c55e", medium: "#eab308", high: "#f97316", critical: "#ef4444" }[fn.risk];
            const isSelected = selected === fn.id;
            return (
              <button key={fn.id} onClick={() => setSelected(isSelected ? null : fn.id)}
                style={{
                  padding: "10px 12px", borderRadius: 7, textAlign: "left", cursor: "pointer",
                  background: isSelected ? `${riskColor}12` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isSelected ? `${riskColor}35` : "rgba(255,255,255,0.06)"}`,
                }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{fn.label}</div>
                <div style={{ fontSize: 8, color: "#334155", marginBottom: 4 }}>{fn.agents} agent{fn.agents > 1 ? "s" : ""}</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 7, padding: "1px 4px", borderRadius: 3, background: `${riskColor}14`, color: riskColor, border: `1px solid ${riskColor}25`, textTransform: "uppercase" }}>
                    {fn.dataClass}
                  </span>
                  <span style={{ fontSize: 7, color: riskColor }}>● {fn.risk}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", marginBottom: 8 }}>
          KOS Architecture Stack
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { layer: "Tool / MCP adapter layer",      note: "Permissioned tool calls · prompt injection gates · audit log", color: "#a855f7" },
            { layer: "Evidence + knowledge graph",    note: "Source-grounded nodes · provenance hash chain · confidence badges", color: "#6366f1" },
            { layer: "Decision trace + assumption",   note: "Every decision, assumption, and question is a graph node", color: "#22c55e" },
            { layer: "Tacit expert capture",          note: "Low-codifiability knowledge with uncertainty ranges", color: "#3b82f6" },
            { layer: "Policy / governance graph",     note: "Authority chains · dissent records · revision history", color: "#f97316" },
            { layer: "Federation layer",              note: "Shared abstractions only · no raw data leaves vault", color: "#ec4899" },
          ].map(l => (
            <div key={l.layer} style={{ display: "flex", gap: 8, padding: "5px 10px", borderRadius: 5, background: `${l.color}06`, border: `1px solid ${l.color}18`, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              <div style={{ fontSize: 9, fontWeight: 600, color: "#e2e8f0", width: 220, flexShrink: 0 }}>{l.layer}</div>
              <div style={{ fontSize: 8, color: "#334155" }}>{l.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main DecisionTheaterView ──────────────────────────────────────────────────

export function DecisionTheaterView({ className = "" }: { className?: string }) {
  const [scenario, setScenario] = useState<Scenario>("baseline");
  const [mode, setMode] = useState<TheaterMode>("food");
  const { localNodes, commitLocalNode } = useGraphStore();

  const handleCommit = useCallback(() => {
    commitLocalNode({
      id: `decision-theater-assumption-${Date.now()}`,
      label: `Decision assumption — ${SCENARIO_LABELS[scenario]}`,
      layer: "context",
      type: "context",
      data: {
        domain: "food_security_decision_theater",
        scenario,
        committed_by: "decision_theater",
        timestamp: new Date().toISOString(),
      },
    });
  }, [commitLocalNode, scenario]);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        height: 40, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 14px",
        borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(2,6,16,0.98)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#6366f1" }}>
          Decision Theater
        </span>
        <span style={{ fontSize: 9, color: "#1e293b", letterSpacing: "0.04em" }}>
          {mode === "food" ? "Food Security Scenario" : "Governance Architecture"}
        </span>

        <div style={{ display: "flex", borderRadius: 5, overflow: "hidden", border: "1px solid rgba(99,102,241,0.2)", marginLeft: "auto" }}>
          {([["food", "Food Security"], ["governance", "Governance"]] as [TheaterMode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                padding: "3px 10px", fontSize: 9, fontWeight: 600, cursor: "pointer",
                background: mode === m ? "rgba(99,102,241,0.15)" : "transparent",
                color: mode === m ? "#818cf8" : "#334155",
                border: "none",
              }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 8, color: "#1e293b" }}>
          public data · demo mode · not a live advisory system
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {mode === "food" ? (
          <FoodSecurityPanel
            scenario={scenario}
            setScenario={setScenario}
            onCommit={handleCommit}
            localNodeCount={localNodes.length}
          />
        ) : (
          <GovernancePanel />
        )}
      </div>
    </div>
  );
}
