import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useGraphStore } from "../store/graphStore";
import type { GraphChangeProposal } from "../api/client";

const PROPOSAL_TYPE_COLORS: Record<string, string> = {
  bridge:    "#8b5cf6",
  densify:   "#22c55e",
  new_edge:  "#3b82f6",
  new_node:  "#14b8a6",
  deprecate: "#ef4444",
  split:     "#f97316",
  merge:     "#eab308",
};

const PROPOSAL_TYPE_ICONS: Record<string, string> = {
  bridge:    "⟺",
  densify:   "⊕",
  new_edge:  "→",
  new_node:  "◎",
  deprecate: "✕",
  split:     "⊛",
  merge:     "⊞",
};

const STATUS_COLORS: Record<string, string> = {
  pending:      "#eab308",
  under_review: "#3b82f6",
  accepted:     "#22c55e",
  rejected:     "#ef4444",
  deferred:     "#64748b",
};

const DEMO_PROPOSALS: GraphChangeProposal[] = [
  {
    id: "prop-1",
    proposal_type: "bridge",
    rationale: "Institutional override pattern in fukushima_governance mirrors drug_discovery Phase II approval exceptions. Both involve authority-vs-evidence tension. Cross-domain bridge would surface Fukushima 2008 as a precedent for trial committee decisions.",
    novelty_score: 0.87,
    status: "pending",
    domain: "cross-domain",
    affected_node_ids: ["dec-seawall-2008", "dec-phase2-approval", "dissent-chen", "dissent-tepco-eng"],
  },
  {
    id: "prop-2",
    proposal_type: "new_node",
    rationale: "EUV lithography pre-pulse optimization represents tacit knowledge not captured by any current entity type. Propose: TacitKnowledgeCluster entity for multi-step situated skill episodes that cannot be reduced to declarative facts.",
    novelty_score: 0.73,
    status: "under_review",
    domain: "euv_lithography",
    affected_node_ids: ["tac-prepulse-1", "ent-tin-droplet", "ag-asml-eng"],
  },
  {
    id: "prop-3",
    proposal_type: "densify",
    rationale: "drug_discovery knowledge graph is sparse in the KRAS→MEK causal pathway. Three intermediate mechanisms are known in literature but not yet linked. Adding them would improve explanation path queries by 3 hops.",
    novelty_score: 0.61,
    status: "pending",
    domain: "drug_discovery",
    affected_node_ids: ["mech-kras-mek", "mech-raf-activation", "ent-kras"],
  },
  {
    id: "prop-4",
    proposal_type: "bridge",
    rationale: "Calibration decay patterns for institutional agents show similar topology in fukushima_governance and a historical UK nuclear safety dataset. Propose cross-domain AlignmentMap to leverage the historical failure data.",
    novelty_score: 0.79,
    status: "accepted",
    domain: "cross-domain",
    affected_node_ids: ["ag-tepco-mgmt", "inst-nra"],
  },
  {
    id: "prop-5",
    proposal_type: "deprecate",
    rationale: "EvidenceFragment ev-euv-legacy references a 2003 test rig that no longer exists and was superseded by the current ASML NXE platform. Deprecating prevents stale evidence from influencing current mechanism scores.",
    novelty_score: 0.22,
    status: "accepted",
    domain: "euv_lithography",
    affected_node_ids: ["ev-euv-legacy"],
  },
];

export function GraphEvolutionTimeline({ className = "" }: { className?: string }) {
  const { proposals, setProposals } = useGraphStore();
  const [scanning, setScanning] = useState(false);
  const [localProposals, setLocalProposals] = useState<GraphChangeProposal[]>([]);

  const loadProposals = () =>
    api.openendedness.proposals()
      .then(p => { setProposals(p); setLocalProposals(p.length > 0 ? p : DEMO_PROPOSALS); })
      .catch(() => setLocalProposals(DEMO_PROPOSALS));

  useEffect(() => { loadProposals(); }, []);

  const all = localProposals.length > 0 ? localProposals : (proposals.length > 0 ? proposals : DEMO_PROPOSALS);

  const scan = async () => {
    setScanning(true);
    try {
      const newP = await api.openendedness.scan();
      const merged = [...newP, ...all];
      setProposals(merged);
      setLocalProposals(merged);
    } catch {}
    finally { setScanning(false); }
  };

  const review = async (id: string, accepted: boolean) => {
    setLocalProposals(prev => prev.map(p =>
      p.id === id ? { ...p, status: accepted ? "accepted" : "rejected" } : p
    ));
    try { await api.openendedness.review(id, accepted); } catch {}
  };

  const pending = all.filter(p => p.status === "pending" || p.status === "under_review");
  const decided = all.filter(p => p.status === "accepted" || p.status === "rejected" || p.status === "deferred");

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ background: "#020610" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Graph Evolution</div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-200">
            {pending.length} pending · {decided.length} decided
          </div>
          <button
            onClick={scan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all disabled:opacity-40"
            style={{
              backgroundColor: "rgba(139,92,246,0.15)",
              color: "#a78bfa",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            {scanning ? (
              <><span className="w-2 h-2 rounded-full border border-purple-400 border-t-transparent animate-spin" /> Scanning…</>
            ) : (
              <><span>⊕</span> Scan novelty</>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {pending.length > 0 && (
          <>
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1 pt-1">Pending review</div>
            {pending.map(p => (
              <ProposalCard key={p.id} proposal={p} onReview={review} />
            ))}
          </>
        )}

        {decided.length > 0 && (
          <>
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1 pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
              Decided
            </div>
            {decided.map(p => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[9px] text-slate-600 leading-relaxed">
          Open-ended evolution: the graph proposes its own extensions. Every proposal is subject to governance review before merge.
        </p>
      </div>
    </div>
  );
}

function ProposalCard({ proposal, onReview }: { proposal: GraphChangeProposal; onReview?: (id: string, accepted: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = PROPOSAL_TYPE_COLORS[proposal.proposal_type] ?? "#64748b";
  const statusColor = STATUS_COLORS[proposal.status] ?? "#94a3b8";
  const typeIcon = PROPOSAL_TYPE_ICONS[proposal.proposal_type] ?? "·";
  const noveltyPct = Math.round(proposal.novelty_score * 100);
  const isPending = proposal.status === "pending" || proposal.status === "under_review";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        border: `1px solid ${typeColor}25`,
        backgroundColor: `${typeColor}06`,
        boxShadow: expanded ? `0 0 16px ${typeColor}10` : "none",
      }}
    >
      <button className="w-full text-left px-3 py-2.5" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          {/* Type icon */}
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30` }}>
            {typeIcon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: typeColor }}>
                {proposal.proposal_type}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
                {proposal.status}
              </span>
              {proposal.domain && (
                <span className="text-[9px] text-slate-600">
                  {proposal.domain.replace(/_/g, " ")}
                </span>
              )}
            </div>
            {/* Novelty bar */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <div style={{ width: `${noveltyPct}%`, height: "100%", backgroundColor: typeColor }} />
              </div>
              <span className="text-[9px] font-mono flex-shrink-0" style={{ color: typeColor }}>
                {noveltyPct}% novel
              </span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5" style={{ borderTop: `1px solid ${typeColor}15` }}>
          <p className="text-[10px] text-slate-400 leading-relaxed pt-2">{proposal.rationale}</p>

          {proposal.affected_node_ids.length > 0 && (
            <div>
              <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Affected nodes</div>
              <div className="flex flex-wrap gap-1">
                {proposal.affected_node_ids.slice(0, 4).map(id => (
                  <span key={id} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#64748b" }}>
                    {id}
                  </span>
                ))}
                {proposal.affected_node_ids.length > 4 && (
                  <span className="text-[9px] text-slate-600">+{proposal.affected_node_ids.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {onReview && isPending && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onReview(proposal.id, true)}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                ✓ Accept
              </button>
              <button
                onClick={() => onReview(proposal.id, false)}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{ backgroundColor: "rgba(239,68,68,0.10)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
