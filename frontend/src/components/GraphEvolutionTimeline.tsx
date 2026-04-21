/**
 * GraphEvolutionTimeline — shows pending graph change proposals and
 * their review lifecycle. Also includes an "open-endedness scan" trigger.
 *
 * Answers: "What new bridge or neighbourhood should be explored next?"
 */

import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useGraphStore } from "../store/graphStore";
import type { GraphChangeProposal } from "../api/client";

const PROPOSAL_TYPE_COLORS: Record<string, string> = {
  bridge:   "#8b5cf6",
  densify:  "#22c55e",
  new_edge: "#3b82f6",
  new_node: "#14b8a6",
  deprecate:"#ef4444",
  split:    "#f97316",
  merge:    "#eab308",
};

const STATUS_COLORS: Record<string, string> = {
  pending:       "#eab308",
  under_review:  "#3b82f6",
  accepted:      "#22c55e",
  rejected:      "#ef4444",
  deferred:      "#94a3b8",
};

interface Props {
  className?: string;
}

export function GraphEvolutionTimeline({ className = "" }: Props) {
  const { proposals, setProposals } = useGraphStore();
  const [scanning, setScanning] = useState(false);

  const loadProposals = () =>
    api.openendedness.proposals().then(setProposals).catch(() => {});

  useEffect(() => { loadProposals(); }, []);

  const scan = async () => {
    setScanning(true);
    try {
      const newProposals = await api.openendedness.scan();
      setProposals([...newProposals, ...proposals]);
    } catch {}
    finally { setScanning(false); }
  };

  const review = async (id: string, accepted: boolean) => {
    try {
      await api.openendedness.review(id, accepted);
      loadProposals();
    } catch {}
  };

  const pending = proposals.filter(p => p.status === "pending" || p.status === "under_review");
  const decided = proposals.filter(p => p.status === "accepted" || p.status === "rejected" || p.status === "deferred");

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header + scan button */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Graph evolution</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {pending.length} pending · {decided.length} decided
          </p>
        </div>
        <button
          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs rounded font-medium disabled:opacity-50"
          onClick={scan}
          disabled={scanning}
        >
          {scanning ? "Scanning…" : "⊕ Scan novelty"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {proposals.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            No proposals yet. Click "Scan novelty" to generate bridge and densification proposals.
          </p>
        )}

        {/* Pending proposals first */}
        {pending.map(p => (
          <ProposalCard key={p.id} proposal={p} onReview={review} />
        ))}

        {decided.length > 0 && (
          <>
            <div className="border-t border-slate-700 pt-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Decided</p>
            </div>
            {decided.map(p => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  onReview,
}: {
  proposal: GraphChangeProposal;
  onReview?: (id: string, accepted: boolean) => void;
}) {
  const typeColor = PROPOSAL_TYPE_COLORS[proposal.proposal_type] ?? "#64748b";
  const statusColor = STATUS_COLORS[proposal.status] ?? "#94a3b8";
  const noveltyPct = Math.round(proposal.novelty_score * 100);

  return (
    <div
      className="rounded-lg border p-3 space-y-2"
      style={{ borderColor: typeColor, backgroundColor: `${typeColor}10` }}
    >
      {/* Type + status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: `${typeColor}33`, color: typeColor }}
        >
          {proposal.proposal_type}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${statusColor}22`, color: statusColor }}
        >
          {proposal.status}
        </span>
        {proposal.domain && (
          <span className="text-xs text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
            {proposal.domain}
          </span>
        )}
        <span className="text-xs text-slate-400 ml-auto">novelty {noveltyPct}%</span>
      </div>

      {/* Novelty bar */}
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${noveltyPct}%`, backgroundColor: typeColor }}
        />
      </div>

      {/* Rationale */}
      <p className="text-xs text-slate-300 leading-relaxed">{proposal.rationale}</p>

      {/* Affected nodes */}
      {proposal.affected_node_ids.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {proposal.affected_node_ids.slice(0, 3).map(id => (
            <span key={id} className="text-xs font-mono text-slate-500 bg-slate-800 px-1 rounded truncate max-w-[120px]">
              {id}
            </span>
          ))}
          {proposal.affected_node_ids.length > 3 && (
            <span className="text-xs text-slate-600">+{proposal.affected_node_ids.length - 3}</span>
          )}
        </div>
      )}

      {/* Review buttons for pending proposals */}
      {onReview && (proposal.status === "pending" || proposal.status === "under_review") && (
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 py-1 bg-green-800 hover:bg-green-700 text-green-200 text-xs rounded"
            onClick={() => onReview(proposal.id, true)}
          >
            ✓ Accept
          </button>
          <button
            className="flex-1 py-1 bg-red-900 hover:bg-red-800 text-red-200 text-xs rounded"
            onClick={() => onReview(proposal.id, false)}
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );
}
