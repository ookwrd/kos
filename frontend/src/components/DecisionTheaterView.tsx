import { useState, useCallback } from "react";
import { useGraphStore } from "../store/graphStore";

// ── Design tokens — CSS custom properties (theme-aware) ───────────────────────
const BG       = "var(--bg)";
const SURFACE  = "var(--bg-surface)";
const SURFACE2 = "var(--bg-surface)";
const BORDER   = "var(--line)";
const BORDER2  = "var(--line-strong)";
const TXT      = "var(--text)";
const TXT2     = "var(--text-muted)";
const TXT3     = "var(--text-quiet)";
const ACCENT   = "var(--accent)";
const ACCENTBG = "var(--bg-surface)";

// ── Types ─────────────────────────────────────────────────────────────────────

type Scenario    = "baseline" | "30d" | "60d" | "90d" | "combined" | "blackswan";
type TheaterMode = "food" | "governance";

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
  baseline:  "Current import mix · normal operations",
  "30d":     "Major import corridor disrupted for 30 days",
  "60d":     "Extended disruption · strategic reserves drawn down",
  "90d":     "Reserves depleted · emergency measures required",
  combined:  "Corridor disruption + price spike + domestic water stress",
  blackswan: "Simultaneous port bottleneck + supplier export controls",
};

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
  { id: "import-diversification", label: "Import diversification",              cost: "medium",   availability: 82, nutrition: 79, resilience: 71, timeToEffect: "6–18 months",  confidence: 0.74, openQuestions: 2, status: "partial"      },
  { id: "strategic-reserves",     label: "Strategic reserves → 6 months",       cost: "high",     availability: 94, nutrition: 91, resilience: 89, timeToEffect: "12–24 months", confidence: 0.83, openQuestions: 1, status: "not_deployed" },
  { id: "domestic-production",    label: "Selective domestic production",        cost: "very high",availability: 48, nutrition: 44, resilience: 95, timeToEffect: "24–60 months", confidence: 0.52, openQuestions: 4, status: "partial"      },
  { id: "demand-management",      label: "Demand management + nutrition focus",  cost: "low",      availability: 78, nutrition: 85, resilience: 62, timeToEffect: "1–3 months",   confidence: 0.89, openQuestions: 2, status: "not_deployed" },
  { id: "emergency-procurement",  label: "Emergency procurement corridors",      cost: "high",     availability: 71, nutrition: 68, resilience: 55, timeToEffect: "1–6 months",   confidence: 0.67, openQuestions: 3, status: "not_deployed" },
];

interface DataSource {
  id: string;
  label: string;
  type: "public" | "internal" | "placeholder";
  status: "connected" | "partial" | "gap";
  note: string;
}

const DATA_SOURCES: DataSource[] = [
  { id: "faostat",          label: "FAOSTAT Food Balance Sheets",     type: "public",      status: "connected", note: "Annual · ~18-month lag" },
  { id: "fao-fsi",          label: "FAO Food Security Indicators",    type: "public",      status: "connected", note: "National level" },
  { id: "wfp-hunger",       label: "WFP HungerMap",                   type: "public",      status: "connected", note: "Near real-time risk signals" },
  { id: "comtrade",         label: "UN Comtrade (food imports)",       type: "public",      status: "connected", note: "6-month lag" },
  { id: "wb-food",          label: "World Bank food / agriculture",    type: "public",      status: "connected", note: "Annual" },
  { id: "reserve-stocks",   label: "National reserve stock data",      type: "internal",    status: "gap",       note: "Not publicly disclosed — critical gap" },
  { id: "domestic-prod",    label: "Domestic production (real-time)",  type: "internal",    status: "gap",       note: "Agricultural census partial" },
  { id: "nutrition-survey", label: "Household nutrition survey",       type: "internal",    status: "gap",       note: "Last survey >3 years old" },
  { id: "foresight",        label: "Foresight radar",                  type: "placeholder", status: "gap",       note: "Connector ready" },
  { id: "montecarlo",       label: "Supply-chain Monte Carlo",         type: "placeholder", status: "gap",       note: "Connector ready" },
  { id: "trade-intel",      label: "Trade intelligence platform",      type: "placeholder", status: "gap",       note: "Connector ready" },
  { id: "expert-capture",   label: "Expert interview capture",         type: "placeholder", status: "gap",       note: "Tacit knowledge — pending" },
];

interface NextBestQuestion {
  id: string;
  question: string;
  dimension: string;
  urgency: "critical" | "high" | "medium";
  owner: string;
}

const NEXT_BEST_QUESTIONS: NextBestQuestion[] = [
  { id: "q1", question: "What is the current reserve stock level for cereals and protein — and when was it last verified?", dimension: "Stability",    urgency: "critical", owner: "Food authority"      },
  { id: "q2", question: "Which protein import partners could be diversified within 12 months without a price premium?",    dimension: "Availability", urgency: "high",     owner: "Trade ministry"      },
  { id: "q3", question: "What nutrition threshold applies for pediatric populations during rationing — and is it legally binding?", dimension: "Utilization",  urgency: "high",     owner: "Health ministry"     },
  { id: "q4", question: "Which agency owns the crisis governance trigger — and at what reserve level does it activate?",   dimension: "Sovereignty",  urgency: "critical", owner: "Cabinet / Crisis"    },
  { id: "q5", question: "Which scenario invalidates the current import-diversification strategy entirely?",                dimension: "Resilience",   urgency: "high",     owner: "Supply chain team"   },
  { id: "q6", question: "How does desalination capacity constrain domestic food production under a combined shock?",       dimension: "Availability", urgency: "medium",   owner: "Agriculture ministry"},
];

const GOV_FUNCTIONS = [
  { id: "policy",      label: "Policy & Strategy",  agents: 2, dataClass: "sensitive",  risk: "medium"   },
  { id: "procurement", label: "Procurement",         agents: 3, dataClass: "restricted", risk: "high"     },
  { id: "operations",  label: "Operations",          agents: 4, dataClass: "restricted", risk: "medium"   },
  { id: "public-svc",  label: "Public Services",     agents: 5, dataClass: "public",     risk: "low"      },
  { id: "legal",       label: "Legal & Compliance",  agents: 2, dataClass: "sovereign",  risk: "high"     },
  { id: "infra",       label: "Infrastructure",      agents: 3, dataClass: "restricted", risk: "high"     },
  { id: "audit",       label: "Audit",               agents: 2, dataClass: "sovereign",  risk: "critical" },
];

// ── Shared primitives ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: TXT3, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function ScoreBar({ value, color = ACCENT }: { value: number; color?: string }) {
  const barColor = value < 50 ? "#e05252" : value < 70 ? "#c97a42" : color;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 52, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, flexShrink: 0 }}>
        <div style={{ width: `${value}%`, height: 4, background: barColor, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 11, color: barColor, fontVariantNumeric: "tabular-nums", fontWeight: 600, minWidth: 24 }}>{value}</span>
    </div>
  );
}

function ConfBadge({ value }: { value: number }) {
  const color = value >= 0.8 ? "#5ecea0" : value >= 0.6 ? "#c97a42" : "#e05252";
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: `${color}14`, color, border: `1px solid ${color}28` }}>
      {Math.round(value * 100)}%
    </span>
  );
}

function UrgencyDot({ urgency }: { urgency: NextBestQuestion["urgency"] }) {
  const color = urgency === "critical" ? "#e05252" : urgency === "high" ? "#c97a42" : "#c4a84a";
  return <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 3 }} />;
}

function SourceDot({ status }: { status: DataSource["status"] }) {
  const color = status === "connected" ? "#5ecea0" : status === "partial" ? "#c97a42" : TXT3;
  return <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

// ── Food Security Panel ────────────────────────────────────────────────────────

function FoodSecurityPanel({ scenario, setScenario, onCommit, localNodeCount }: {
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

      {/* Scenario selector */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: TXT3, fontWeight: 500, marginRight: 6 }}>Scenario</span>
        {(Object.keys(SCENARIO_LABELS) as Scenario[]).map(s => {
          const isActive = scenario === s;
          const isRisk = s !== "baseline";
          return (
            <button key={s} onClick={() => setScenario(s)} style={{
              padding: "5px 13px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: isActive ? (isRisk ? "rgba(224,82,82,0.12)" : ACCENTBG) : SURFACE,
              color: isActive ? (isRisk ? "#e08080" : ACCENT) : TXT2,
              border: `1px solid ${isActive ? (isRisk ? "rgba(224,82,82,0.28)" : "rgba(166,212,189,0.28)") : BORDER}`,
              transition: "all 0.15s",
            }}>
              {SCENARIO_LABELS[s]}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 11, color: TXT3 }}>{SCENARIO_DESC[scenario]}</span>
        {localNodeCount > 0 && (
          <span style={{ fontSize: 11, color: "#5ecea0", fontWeight: 600, marginLeft: 12 }}>
            +{localNodeCount} committed to substrate
          </span>
        )}
      </div>

      {/* Three-column body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Left: Dimensions + Data confidence ── */}
        <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${BORDER}`, overflowY: "auto", padding: "20px 18px" }}>
          <Label>Food Security Dimensions</Label>
          {[
            { key: "availability", label: "Availability",           value: impact.availability },
            { key: "access",       label: "Access / Affordability", value: impact.access       },
            { key: "utilization",  label: "Nutrition / Safety",     value: impact.utilization  },
            { key: "stability",    label: "Stability",              value: impact.stability     },
            { key: "sovereignty",  label: "Sovereignty",            value: impact.sovereignty   },
          ].map(dim => {
            const col = dim.value < 50 ? "#e05252" : dim.value < 70 ? "#c97a42" : "#5ecea0";
            return (
              <div key={dim.key} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: TXT2 }}>{dim.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums" }}>{dim.value}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4 }}>
                  <div style={{ width: `${dim.value}%`, height: 4, background: col, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}

          {/* Reserve months callout */}
          <div style={{ margin: "4px 0 20px", padding: "12px 14px", borderRadius: 8, background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 11, color: TXT3, marginBottom: 4 }}>Reserve months remaining</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1,
              color: impact.reserveMonths < 1 ? "#e05252" : impact.reserveMonths < 2 ? "#c97a42" : ACCENT }}>
              {impact.reserveMonths.toFixed(1)}
              <span style={{ fontSize: 13, fontWeight: 400, color: TXT3, marginLeft: 6 }}>months</span>
            </div>
          </div>

          <Label>Data Confidence</Label>
          {DATA_SOURCES.slice(0, 8).map(ds => (
            <div key={ds.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
              <SourceDot status={ds.status} />
              <span style={{ fontSize: 11, color: ds.status === "gap" ? TXT3 : TXT2, flex: 1 }} title={ds.note}>
                {ds.label}
              </span>
              {ds.status === "gap" && (
                <span style={{ fontSize: 10, color: TXT3, flexShrink: 0 }}>gap</span>
              )}
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "rgba(224,82,82,0.07)", border: "1px solid rgba(224,82,82,0.16)" }}>
            <span style={{ fontSize: 11, color: "#e08080" }}>3 critical data gaps identified</span>
          </div>
        </div>

        {/* ── Center: Decision matrix + Tool fabric ── */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: TXT, letterSpacing: "0.01em" }}>
              Decision Options
            </span>
            <span style={{ fontSize: 12, color: TXT2 }}>·</span>
            <span style={{ fontSize: 12, color: TXT2 }}>{SCENARIO_LABELS[scenario]}</span>
            <ConfBadge value={impact.confidence} />
            <span style={{ marginLeft: "auto", fontSize: 11, color: TXT3 }}>FAOSTAT · WFP · Comtrade · public data</span>
          </div>

          {/* Matrix header row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 70px 90px 54px 80px", gap: 6, padding: "6px 12px", marginBottom: 6 }}>
            {["Strategy", "Avail.", "Nutrition", "Resilience", "Cost", "Time to effect", "Conf.", "Status"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: TXT3 }}>{h}</div>
            ))}
          </div>

          {DECISION_OPTIONS.map(opt => {
            const costColor = { low: "#5ecea0", medium: "#c4a84a", high: "#c97a42", "very high": "#e05252" }[opt.cost];
            const statusColor = opt.status === "active" ? "#5ecea0" : opt.status === "partial" ? "#c4a84a" : TXT3;
            return (
              <div key={opt.id} style={{
                display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 70px 90px 54px 80px",
                gap: 6, padding: "10px 12px", borderRadius: 8, marginBottom: 5,
                background: SURFACE, border: `1px solid ${BORDER}`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TXT, marginBottom: 2 }}>{opt.label}</div>
                  {opt.openQuestions > 0 && (
                    <div style={{ fontSize: 10, color: "#c97a42" }}>{opt.openQuestions} open question{opt.openQuestions > 1 ? "s" : ""}</div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}><ScoreBar value={opt.availability} color="#5ecea0" /></div>
                <div style={{ display: "flex", alignItems: "center" }}><ScoreBar value={opt.nutrition} color={ACCENT} /></div>
                <div style={{ display: "flex", alignItems: "center" }}><ScoreBar value={opt.resilience} color="#6ba5d8" /></div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: costColor, fontWeight: 600 }}>{opt.cost}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: TXT2 }}>{opt.timeToEffect}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}><ConfBadge value={opt.confidence} /></div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: statusColor, fontWeight: 500, textTransform: "capitalize" }}>
                    {opt.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Gap banner */}
          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 8, background: "rgba(224,82,82,0.06)", border: "1px solid rgba(224,82,82,0.16)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e08080", marginBottom: 4 }}>
              No single strategy achieves adequate availability + nutrition + resilience under {SCENARIO_LABELS[scenario]}
            </div>
            <div style={{ fontSize: 11, color: TXT3 }}>
              Combined strategy required. Key open question: is strategic-reserve build-up feasible at current fiscal capacity?
            </div>
          </div>

          {/* Tool Integration Fabric */}
          <div style={{ marginTop: 22 }}>
            <Label>Tool Integration Fabric</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {DATA_SOURCES.map(ds => (
                <div key={ds.id} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6,
                  background: SURFACE, border: `1px solid ${BORDER}`,
                }}>
                  <SourceDot status={ds.status} />
                  <span style={{ fontSize: 11, color: ds.status === "gap" ? TXT3 : TXT2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={ds.note}>
                    {ds.label}
                  </span>
                  {ds.type === "placeholder" && (
                    <span style={{ fontSize: 10, color: TXT3, flexShrink: 0 }}>connector-ready</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Next-best questions + substrate growth ── */}
        <div style={{ width: 268, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, overflowY: "auto", padding: "20px 16px" }}>
          <Label>Next-Best Questions</Label>

          {NEXT_BEST_QUESTIONS.map((q, i) => {
            const isCommitted = committedQ.has(q.id);
            return (
              <div key={q.id} style={{
                padding: "12px 12px", borderRadius: 8, marginBottom: 8,
                background: isCommitted ? "rgba(94,206,160,0.07)" : SURFACE,
                border: `1px solid ${isCommitted ? "rgba(94,206,160,0.22)" : BORDER}`,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <UrgencyDot urgency={q.urgency} />
                  <span style={{ fontSize: 12, color: TXT, lineHeight: 1.55, flex: 1 }}>{q.question}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: TXT3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{q.dimension}</span>
                  <span style={{ fontSize: 10, color: TXT3 }}>·</span>
                  <span style={{ fontSize: 10, color: TXT3 }}>{q.owner}</span>
                  {isCommitted ? (
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#5ecea0", fontWeight: 500 }}>✓ in substrate</span>
                  ) : i < 2 && (
                    <button onClick={() => handleCommitQ(q.id)} style={{
                      marginLeft: "auto", fontSize: 11, color: "#5ecea0",
                      background: "rgba(94,206,160,0.08)", border: "1px solid rgba(94,206,160,0.22)",
                      borderRadius: 5, padding: "3px 9px", cursor: "pointer", fontWeight: 500,
                    }}>
                      commit
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Substrate growth */}
          <div style={{ marginTop: 16, padding: "14px 14px", borderRadius: 8, background: ACCENTBG, border: `1px solid rgba(157,143,245,0.18)` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 6 }}>Substrate Growth</div>
            <p style={{ fontSize: 11, color: TXT2, lineHeight: 1.6, marginBottom: 10 }}>
              Committing a question adds it as a governed node — source, owner, and timestamp preserved across sessions.
            </p>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#5ecea0" }}>
              {localNodeCount} node{localNodeCount !== 1 ? "s" : ""} committed this session
            </div>
            <div style={{ fontSize: 10, color: TXT3, marginTop: 2 }}>localStorage · demo write</div>
          </div>

          {/* Scenario interpretation */}
          {scenario !== "baseline" && (
            <div style={{ marginTop: 10, padding: "12px 12px", borderRadius: 8, background: "rgba(224,82,82,0.06)", border: "1px solid rgba(224,82,82,0.16)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#e08080", marginBottom: 5 }}>Decision window</div>
              <p style={{ fontSize: 11, color: TXT2, lineHeight: 1.6 }}>
                {scenario === "30d"      && "Managed stress — reserve drawdown is containable if diversification is activated immediately."}
                {scenario === "60d"      && "Reserves critically low. Demand management and emergency procurement are no longer optional."}
                {scenario === "90d"      && "Reserves exhausted. Crisis trigger should have fired by day 45. Emergency measures now unavoidable."}
                {scenario === "combined" && "Combined shock invalidates import-diversification. Domestic production and reserves become the only absorbers."}
                {scenario === "blackswan"&& "No current strategy yields acceptable outcomes. Pre-positioned reserves are the sole remaining absorber."}
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
    <div style={{ padding: "24px 28px", height: "100%", overflow: "auto" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          {[
            {
              title: "Risk: Monolithic cloud agent",
              titleColor: "#e08080",
              bg: "rgba(224,82,82,0.06)",
              border: "rgba(224,82,82,0.18)",
              desc: "All ministry context → single foreign API → no data residency → no governance boundary → no auditability.",
              items: ["Sensitive context in foreign cloud", "No permission boundary per function", "No provenance or revocation", "Single model failure = institution failure"],
              icon: "✗", iconColor: "#e05252",
            },
            {
              title: "Governed distributed substrate",
              titleColor: ACCENT,
              bg: ACCENTBG,
              border: "rgba(166,212,189,0.18)",
              desc: "Each function has a local vault. Data is classified and bounded. KOS provides the provenance substrate.",
              items: ["Data residency enforced per vault", "Permission boundaries per function", "Full provenance + revocation chain", "Graceful degradation if one agent fails"],
              icon: "✓", iconColor: ACCENT,
            },
          ].map(card => (
            <div key={card.title} style={{ padding: "18px 20px", borderRadius: 10, background: card.bg, border: `1px solid ${card.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: card.titleColor, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: TXT2, lineHeight: 1.6, marginBottom: 12 }}>{card.desc}</div>
              {card.items.map(r => (
                <div key={r} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <span style={{ color: card.iconColor, fontSize: 12, lineHeight: 1.5 }}>{card.icon}</span>
                  <span style={{ fontSize: 12, color: TXT2 }}>{r}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Label>Function Vaults</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {GOV_FUNCTIONS.map(fn => {
            const rc = { low: "#5ecea0", medium: "#c4a84a", high: "#c97a42", critical: "#e05252" }[fn.risk];
            const isSelected = selected === fn.id;
            return (
              <button key={fn.id} onClick={() => setSelected(isSelected ? null : fn.id)} style={{
                padding: "14px 14px", borderRadius: 8, textAlign: "left", cursor: "pointer",
                background: isSelected ? `${rc}10` : SURFACE, border: `1px solid ${isSelected ? `${rc}30` : BORDER}`,
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: TXT, marginBottom: 5 }}>{fn.label}</div>
                <div style={{ fontSize: 11, color: TXT3, marginBottom: 6 }}>{fn.agents} agent{fn.agents > 1 ? "s" : ""}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${rc}12`, color: rc, border: `1px solid ${rc}22`, textTransform: "uppercase", fontWeight: 600 }}>
                    {fn.dataClass}
                  </span>
                  <span style={{ fontSize: 10, color: rc }}>● {fn.risk}</span>
                </div>
              </button>
            );
          })}
        </div>

        <Label>KOS Architecture Stack</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { layer: "Tool / MCP adapter layer",    note: "Permissioned tool calls · prompt injection gates · audit log", color: "#a878e8" },
            { layer: "Evidence + knowledge graph",  note: "Source-grounded nodes · provenance hash chain · confidence badges", color: ACCENT },
            { layer: "Decision trace + assumption", note: "Every decision, assumption, and question is a graph node",         color: "#5ecea0" },
            { layer: "Tacit expert capture",        note: "Low-codifiability knowledge with uncertainty ranges",               color: "#6ba5d8" },
            { layer: "Policy / governance graph",   note: "Authority chains · dissent records · revision history",             color: "#c97a42" },
            { layer: "Federation layer",            note: "Shared abstractions only · no raw data leaves vault",               color: "#c56898" },
          ].map(l => (
            <div key={l.layer} style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 7, background: `${l.color}07`, border: `1px solid ${l.color}18`, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              <div style={{ fontSize: 12, fontWeight: 500, color: TXT, width: 220, flexShrink: 0 }}>{l.layer}</div>
              <div style={{ fontSize: 11, color: TXT3 }}>{l.note}</div>
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
      data: { domain: "food_security_decision_theater", scenario, committed_by: "decision_theater", timestamp: new Date().toISOString() },
    });
  }, [commitLocalNode, scenario]);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: BG }}>
      {/* Header */}
      <div style={{
        height: 48, flexShrink: 0, display: "flex", alignItems: "center", gap: 16, padding: "0 20px",
        borderBottom: `1px solid ${BORDER}`, background: "rgba(9,26,17,0.98)", backdropFilter: "blur(16px)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: TXT, letterSpacing: "0.01em" }}>Decision Board</span>
          <span style={{ fontSize: 12, color: TXT3 }}>
            {mode === "food" ? "Food Security · UAE / GCC" : "Governance Architecture"}
          </span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {([["food", "Food Security"], ["governance", "Governance"]] as [TheaterMode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", borderRadius: 7,
              background: mode === m ? ACCENTBG : "transparent",
              color: mode === m ? ACCENT : TXT3,
              border: `1px solid ${mode === m ? "rgba(166,212,189,0.25)" : BORDER}`,
              transition: "all 0.15s",
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 10, color: TXT3, marginLeft: 8 }}>public data · demo mode</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {mode === "food" ? (
          <FoodSecurityPanel scenario={scenario} setScenario={setScenario} onCommit={handleCommit} localNodeCount={localNodes.length} />
        ) : (
          <GovernancePanel />
        )}
      </div>
    </div>
  );
}
