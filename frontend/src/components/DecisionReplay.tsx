/**
 * DecisionReplay — step-through timeline for a decision trace.
 *
 * Renders the replay_steps array from the /decisions/{id}/replay endpoint
 * as a vertical timeline with step-by-step navigation. Each step type
 * has a distinct icon and colour.
 *
 * Used in the Context Graph panel and triggered when a DecisionTrace node
 * is selected in the GraphCanvas.
 */

import { useState } from "react";
import type { ReplayResult, ReplayStep } from "../api/client";
import { useGraphStore } from "../store/graphStore";

const STEP_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  question:  { bg: "bg-slate-700",  border: "border-slate-500",  icon: "?" },
  evidence:  { bg: "bg-blue-900",   border: "border-blue-500",   icon: "E" },
  policy:    { bg: "bg-purple-900", border: "border-purple-500", icon: "P" },
  precedent: { bg: "bg-amber-900",  border: "border-amber-500",  icon: "⊞" },
  actor:     { bg: "bg-teal-900",   border: "border-teal-500",   icon: "A" },
  outcome:   { bg: "bg-orange-900", border: "border-orange-500", icon: "→" },
};

interface Props {
  className?: string;
}

export function DecisionReplay({ className = "" }: Props) {
  const { replayResult, replayStep, setReplayStep } = useGraphStore();
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!replayResult) {
    return (
      <div className={`flex items-center justify-center text-slate-500 text-sm p-8 ${className}`}>
        Select a decision node to replay it.
      </div>
    );
  }

  const { decision, replay_steps } = replayResult;
  const steps = replay_steps ?? [];
  const current = steps[replayStep] ?? null;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Decision replay</p>
        <p className="text-sm text-slate-100 font-medium leading-snug">
          {String((decision as Record<string, unknown>)?.question ?? "Unknown question")}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: outcomeColor(String((decision as Record<string, unknown>)?.outcome ?? "")) }}
          >
            {String((decision as Record<string, unknown>)?.outcome ?? "unknown")}
          </span>
          {Boolean((decision as Record<string, unknown>)?.is_exception) && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-800 text-red-200">EXCEPTION</span>
          )}
        </div>
      </div>

      {/* Step navigator */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700">
        <button
          className="text-slate-400 hover:text-white disabled:opacity-30"
          onClick={() => setReplayStep(Math.max(0, replayStep - 1))}
          disabled={replayStep === 0}
        >
          ←
        </button>
        <span className="text-xs text-slate-400">
          Step {replayStep + 1} / {steps.length}
        </span>
        <button
          className="text-slate-400 hover:text-white disabled:opacity-30"
          onClick={() => setReplayStep(Math.min(steps.length - 1, replayStep + 1))}
          disabled={replayStep >= steps.length - 1}
        >
          →
        </button>
      </div>

      {/* Current step detail */}
      {current && (
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
          <StepCard step={current} highlighted />
        </div>
      )}

      {/* Full timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {steps.map((step, i) => (
          <button
            key={step.step}
            className="w-full text-left"
            onClick={() => { setReplayStep(i); setExpanded(expanded === i ? null : i); }}
          >
            <StepCard step={step} highlighted={i === replayStep} compact />
          </button>
        ))}
      </div>
    </div>
  );
}

function StepCard({
  step,
  highlighted = false,
  compact = false,
}: {
  step: ReplayStep;
  highlighted?: boolean;
  compact?: boolean;
}) {
  const style = STEP_STYLES[step.type] ?? STEP_STYLES.question;
  return (
    <div
      className={`rounded-lg border p-2 transition-all ${style.bg} ${style.border} ${
        highlighted ? "ring-1 ring-white/20" : "opacity-70"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white flex-shrink-0">
          {style.icon}
        </span>
        <span className="text-xs text-slate-300">{step.label}</span>
      </div>
      {!compact && step.content != null && typeof step.content === "object" && (
        <pre className="mt-2 text-xs text-slate-400 overflow-auto max-h-32 bg-slate-900 rounded p-2">
          {JSON.stringify(step.content, null, 2)}
        </pre>
      )}
    </div>
  );
}

function outcomeColor(outcome: string): string {
  const map: Record<string, string> = {
    approved: "#166534",
    rejected: "#7f1d1d",
    deferred: "#78350f",
    escalated: "#1e3a5f",
    overridden: "#4a1d96",
  };
  return map[outcome] ?? "#334155";
}
