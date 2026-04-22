import { useState } from "react";

interface Actor {
  id: string;
  name: string;
  type: "human" | "ai" | "institution";
  domain: string;
  calibration: number;
}

interface Resource {
  id: string;
  label: string;
  layer: "evidence" | "context" | "knowledge" | "goal" | "governance" | "agents";
  domain: string;
  sensitivity: "public" | "restricted" | "confidential" | "sovereign";
}

interface PermEntry {
  actor_id: string;
  resource_id: string;
  access: "read" | "write" | "validate" | "revoke" | "none";
  requires_review: boolean;
  expires?: string;
}

const ACTORS: Actor[] = [
  { id: "agent-oncologist-01", name: "Dr. Sarah Chen", type: "human", domain: "drug_discovery", calibration: 0.84 },
  { id: "agent-chemist-01", name: "Dr. Marcus Webb", type: "human", domain: "drug_discovery", calibration: 0.79 },
  { id: "agent-ai-screen-01", name: "MolScreen-v2", type: "ai", domain: "drug_discovery", calibration: 0.71 },
  { id: "agent-tepco-civil", name: "TEPCO Civil Eng.", type: "institution", domain: "fukushima_governance", calibration: 0.76 },
  { id: "agent-tepco-mgmt", name: "TEPCO Management", type: "institution", domain: "fukushima_governance", calibration: 0.31 },
  { id: "agent-asml-systems", name: "ASML Systems", type: "institution", domain: "euv_lithography", calibration: 0.82 },
];

const RESOURCES: Resource[] = [
  { id: "ev-bbb-assay-results", label: "BBB Assay Data", layer: "evidence", domain: "drug_discovery", sensitivity: "restricted" },
  { id: "ev-kras-structure-2019", label: "KRAS Structure Paper", layer: "evidence", domain: "drug_discovery", sensitivity: "public" },
  { id: "dec-trial-approval-2024", label: "CNS Trial Decision", layer: "context", domain: "drug_discovery", sensitivity: "restricted" },
  { id: "ev-tepco-2008-assessment", label: "2008 Tsunami Assessment", layer: "evidence", domain: "fukushima_governance", sensitivity: "confidential" },
  { id: "dec-seawall-deferral-2008", label: "Seawall Deferral", layer: "context", domain: "fukushima_governance", sensitivity: "restricted" },
  { id: "tacit-droplet-calibration", label: "Droplet Calibration Trace", layer: "knowledge", domain: "euv_lithography", sensitivity: "confidential" },
];

const PERMISSIONS: PermEntry[] = [
  { actor_id: "agent-oncologist-01", resource_id: "ev-bbb-assay-results", access: "validate", requires_review: false },
  { actor_id: "agent-oncologist-01", resource_id: "dec-trial-approval-2024", access: "write", requires_review: true },
  { actor_id: "agent-oncologist-01", resource_id: "ev-kras-structure-2019", access: "read", requires_review: false },
  { actor_id: "agent-chemist-01", resource_id: "ev-bbb-assay-results", access: "write", requires_review: true },
  { actor_id: "agent-chemist-01", resource_id: "ev-kras-structure-2019", access: "read", requires_review: false },
  { actor_id: "agent-ai-screen-01", resource_id: "ev-bbb-assay-results", access: "read", requires_review: false },
  { actor_id: "agent-ai-screen-01", resource_id: "dec-trial-approval-2024", access: "read", requires_review: false },
  { actor_id: "agent-tepco-civil", resource_id: "ev-tepco-2008-assessment", access: "write", requires_review: false },
  { actor_id: "agent-tepco-civil", resource_id: "dec-seawall-deferral-2008", access: "read", requires_review: false },
  { actor_id: "agent-tepco-mgmt", resource_id: "dec-seawall-deferral-2008", access: "write", requires_review: false },
  { actor_id: "agent-tepco-mgmt", resource_id: "ev-tepco-2008-assessment", access: "read", requires_review: false },
  { actor_id: "agent-asml-systems", resource_id: "tacit-droplet-calibration", access: "write", requires_review: true },
];

const ACCESS_CONFIG = {
  read:     { color: "#3b82f6", label: "R",  bg: "rgba(59,130,246,0.12)" },
  write:    { color: "#22c55e", label: "W",  bg: "rgba(34,197,94,0.12)" },
  validate: { color: "#a855f7", label: "V",  bg: "rgba(168,85,247,0.12)" },
  revoke:   { color: "#ef4444", label: "⊗",  bg: "rgba(239,68,68,0.12)" },
  none:     { color: "#1e293b", label: "—",  bg: "rgba(255,255,255,0.02)" },
};

const SENSITIVITY_COLORS: Record<string, string> = {
  public: "#22c55e",
  restricted: "#eab308",
  confidential: "#f97316",
  sovereign: "#ef4444",
};

const LAYER_COLORS: Record<string, string> = {
  evidence: "#3b82f6",
  context: "#f97316",
  knowledge: "#22c55e",
  goal: "#eab308",
  governance: "#a855f7",
  agents: "#14b8a6",
};

const TYPE_COLORS: Record<string, string> = {
  human: "#14b8a6",
  ai: "#22c55e",
  institution: "#f97316",
};

export function PermissionExplorer({ className = "" }: { className?: string }) {
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const getPermission = (actorId: string, resourceId: string): PermEntry => {
    return PERMISSIONS.find(p => p.actor_id === actorId && p.resource_id === resourceId)
      ?? { actor_id: actorId, resource_id: resourceId, access: "none", requires_review: false };
  };

  const selectedActorObj = ACTORS.find(a => a.id === selectedActor);
  const selectedResourceObj = RESOURCES.find(r => r.id === selectedResource);

  const revokeImpact = selectedResource
    ? PERMISSIONS.filter(p => p.resource_id === selectedResource && p.access !== "none")
    : [];

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Permission Explorer</div>
        <div className="text-xs font-semibold text-slate-200">Access · Custody · Revocation</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Permission matrix */}
        <div>
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Access matrix</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr>
                  <th className="text-left text-slate-600 font-normal pb-2 pr-2" style={{ minWidth: 90 }}>Actor</th>
                  {RESOURCES.map(r => (
                    <th
                      key={r.id}
                      className="text-center pb-2 cursor-pointer"
                      style={{ minWidth: 36 }}
                      onClick={() => setSelectedResource(selectedResource === r.id ? null : r.id)}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: LAYER_COLORS[r.layer] }}
                        />
                        <span className="text-slate-500 leading-none" style={{ fontSize: 8, writingMode: "vertical-lr", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>
                          {r.label}
                        </span>
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: SENSITIVITY_COLORS[r.sensitivity], opacity: 0.7 }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTORS.map(actor => (
                  <tr
                    key={actor.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedActor(selectedActor === actor.id ? null : actor.id)}
                    style={{ backgroundColor: selectedActor === actor.id ? "rgba(99,102,241,0.05)" : "transparent" }}
                  >
                    <td className="py-1 pr-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[actor.type] }} />
                        <span className="text-slate-400 truncate" style={{ maxWidth: 80 }}>{actor.name}</span>
                      </div>
                    </td>
                    {RESOURCES.map(resource => {
                      const perm = getPermission(actor.id, resource.id);
                      const cfg = ACCESS_CONFIG[perm.access];
                      const isHighlighted = selectedActor === actor.id || selectedResource === resource.id;
                      return (
                        <td key={resource.id} className="py-1 text-center">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center mx-auto font-bold text-[9px] transition-all"
                            style={{
                              backgroundColor: perm.access !== "none" ? cfg.bg : "transparent",
                              color: cfg.color,
                              border: `1px solid ${isHighlighted && perm.access !== "none" ? cfg.color + "60" : "transparent"}`,
                              boxShadow: isHighlighted && perm.access !== "none" ? `0 0 6px ${cfg.color}30` : "none",
                            }}
                          >
                            {cfg.label}
                            {perm.requires_review && perm.access !== "none" && (
                              <span style={{ color: "#f59e0b", fontSize: 7 }}>*</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {Object.entries(ACCESS_CONFIG).filter(([k]) => k !== "none").map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1">
                <div className="w-4 h-4 rounded text-center text-[9px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </div>
                <span className="text-[9px] text-slate-500 capitalize">{key}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span style={{ color: "#f59e0b", fontSize: 10 }}>*</span>
              <span className="text-[9px] text-slate-500">requires review</span>
            </div>
          </div>
        </div>

        {/* Sensitivity key */}
        <div>
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">Data sensitivity</div>
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(SENSITIVITY_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5 rounded px-2 py-1.5"
                style={{ backgroundColor: `${c}10`, border: `1px solid ${c}25` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-[9px] text-slate-400 capitalize">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actor detail */}
        {selectedActorObj && (
          <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Actor detail: {selectedActorObj.name}</div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${TYPE_COLORS[selectedActorObj.type]}15`, color: TYPE_COLORS[selectedActorObj.type] }}>
                {selectedActorObj.type}
              </span>
              <span className="text-[9px] text-slate-500">{selectedActorObj.domain.replace(/_/g, " ")}</span>
              <span className="text-[9px] font-mono" style={{ color: selectedActorObj.calibration >= 0.75 ? "#22c55e" : "#f59e0b" }}>
                cal {selectedActorObj.calibration.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {PERMISSIONS.filter(p => p.actor_id === selectedActorObj.id && p.access !== "none").map(p => {
                const res = RESOURCES.find(r => r.id === p.resource_id);
                const cfg = ACCESS_CONFIG[p.access];
                return res ? (
                  <div key={p.resource_id} className="flex items-center gap-2 text-[10px]">
                    <span className="w-5 text-center font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-slate-300">{res.label}</span>
                    {p.requires_review && <span style={{ color: "#f59e0b", fontSize: 9 }}>· requires review</span>}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Revocation impact */}
        {selectedResourceObj && (
          <div
            className="rounded-xl p-3"
            style={{
              backgroundColor: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <div className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-2">
              Revocation impact: {selectedResourceObj.label}
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              If this resource were revoked, the following actors would lose access and all decisions citing it would be flagged for review:
            </p>
            <div className="space-y-1">
              {revokeImpact.map(p => {
                const actor = ACTORS.find(a => a.id === p.actor_id);
                const cfg = ACCESS_CONFIG[p.access];
                return actor ? (
                  <div key={p.actor_id} className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-slate-300">{actor.name}</span>
                    <span style={{ color: TYPE_COLORS[actor.type], fontSize: 9 }}>({actor.type})</span>
                  </div>
                ) : null;
              })}
            </div>
            {!revoking ? (
              <button
                onClick={() => setRevoking(selectedResource)}
                className="mt-3 w-full py-2 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                }}
              >
                Trace revocation cascade →
              </button>
            ) : (
              <div className="mt-3 rounded-lg p-2.5" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-1">Cascade simulation</div>
                <p className="text-[10px] text-red-300 leading-relaxed">
                  {revokeImpact.length} actor(s) affected · All downstream decisions flagged for re-evaluation ·
                  Provenance chain sealed with revocation timestamp · Dissent records preserved
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
