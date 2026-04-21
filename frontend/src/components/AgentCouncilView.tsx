/**
 * AgentCouncilView — displays the collective of agents with their beliefs,
 * competences, calibration scores, and dissent indicators.
 *
 * Also shows the expert routing results when an inference query has been run.
 * Answers: "Which expert agent should we consult next?"
 */

import type { ExpertRouting } from "../api/client";
import { useGraphStore } from "../store/graphStore";

interface Props {
  className?: string;
}

export function AgentCouncilView({ className = "" }: Props) {
  const { expertRouting, overview } = useGraphStore();

  const agents = overview?.layers?.agents?.nodes ?? [];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-widest">Agent Council</p>
      </div>

      {/* Expert routing results (if available) */}
      {expertRouting.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-700 bg-teal-950/30">
          <p className="text-xs text-teal-400 uppercase tracking-widest mb-2">Routing recommendation</p>
          <div className="space-y-2">
            {expertRouting.map((r, i) => (
              <RoutingCard key={i} routing={r} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* All agents */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {agents.map(node => (
          <AgentCard key={node.id} node={node} routing={expertRouting.find(r =>
            (r.agent as Record<string, unknown>)?.id === node.id
          )} />
        ))}
        {agents.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">No agents loaded. Seed the database first.</p>
        )}
      </div>
    </div>
  );
}

function AgentCard({
  node,
  routing,
}: {
  node: { id: string; label: string; data: Record<string, unknown> };
  routing?: ExpertRouting;
}) {
  const data = node.data;
  const beliefs = (data.beliefs ?? {}) as Record<string, number>;
  const competences = (data.competences ?? []) as string[];
  const calibration = data.calibration_score as number | null;
  const agentType = data.agent_type as string;

  return (
    <div
      className={`rounded-lg border p-3 ${
        routing ? "border-teal-600 bg-teal-950/30" : "border-slate-700 bg-slate-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-slate-100">{node.label}</span>
          <span className="ml-2 text-xs text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
            {agentType}
          </span>
        </div>
        {calibration !== null && calibration !== undefined && (
          <CalibrationBadge score={calibration as number} />
        )}
      </div>

      {/* Competences */}
      {competences.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(competences as string[]).slice(0, 4).map((c, i) => (
            <span key={i} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
              {c}
            </span>
          ))}
          {competences.length > 4 && (
            <span className="text-xs text-slate-500">+{competences.length - 4}</span>
          )}
        </div>
      )}

      {/* Beliefs */}
      {Object.keys(beliefs).length > 0 && (
        <div className="mt-2 space-y-1">
          {Object.entries(beliefs).slice(0, 3).map(([prop, prob]) => (
            <BeliefBar key={prop} proposition={prop} probability={prob} />
          ))}
        </div>
      )}

      {/* Routing score */}
      {routing && (
        <div className="mt-2 pt-2 border-t border-teal-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-teal-400">EIG score: {routing.eig_score.toFixed(3)}</span>
            {routing.n_dissents > 0 && (
              <span className="text-xs text-amber-400">{routing.n_dissents} dissent(s)</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{routing.routing_reason}</p>
        </div>
      )}
    </div>
  );
}

function RoutingCard({ routing, rank }: { routing: ExpertRouting; rank: number }) {
  const agent = routing.agent as Record<string, unknown>;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold flex-shrink-0">
        {rank}
      </span>
      <span className="text-slate-200 font-medium">{agent?.name as string ?? agent?.id as string}</span>
      <span className="text-teal-400 ml-auto">EIG {routing.eig_score.toFixed(2)}</span>
    </div>
  );
}

function BeliefBar({ proposition, probability }: { proposition: string; probability: number }) {
  const pct = Math.round(probability * 100);
  const color = probability > 0.7 ? "#22c55e" : probability > 0.4 ? "#eab308" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-0.5">
        <span className="truncate max-w-[75%]">{proposition.replace(/_/g, " ")}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function CalibrationBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.8 ? "#22c55e" : score >= 0.6 ? "#eab308" : "#ef4444";
  return (
    <div className="text-center">
      <p className="text-xs" style={{ color }}>{pct}%</p>
      <p className="text-xs text-slate-500">calib.</p>
    </div>
  );
}
