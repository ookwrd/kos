/**
 * UncertaintyOverlay — shows the highest-uncertainty nodes and the
 * next-best-questions for the currently active goal or domain.
 *
 * This is the epistemic dashboard: it answers "Which assumption is most
 * uncertain?" and surfaces the active-inference next-best-question list.
 */

import { useEffect } from "react";
import { api } from "../api/client";
import { useGraphStore } from "../store/graphStore";

interface Props {
  goalId?: string;
  className?: string;
}

export function UncertaintyOverlay({ goalId, className = "" }: Props) {
  const { nextQuestions, setNextQuestions, domainFilter } = useGraphStore();

  useEffect(() => {
    api.inference
      .nextQuestion(goalId, domainFilter ?? undefined)
      .then(setNextQuestions)
      .catch(() => {});
  }, [goalId, domainFilter]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="px-4 py-3 border-b border-slate-700">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-0.5">
          Uncertainty · Next questions
        </p>
        <p className="text-xs text-slate-500">
          Highest-uncertainty nodes — answers here most reduce collective free energy
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {nextQuestions.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            No uncertainty annotations found.
            <br />
            <span className="text-xs">Annotate nodes via POST /api/agents/uncertainty</span>
          </p>
        )}

        {nextQuestions.map((q, i) => {
          const ann = q.annotation as Record<string, unknown>;
          const value = q.uncertainty_value;
          const priority = q.epistemic_priority;
          return (
            <div
              key={i}
              className="rounded-lg border p-3"
              style={{
                borderColor: priority === "high" ? "#ef4444" : "#eab308",
                backgroundColor: priority === "high" ? "#7f1d1d22" : "#78350f22",
              }}
            >
              {/* Uncertainty bar */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(value * 100)}%`,
                      backgroundColor: priority === "high" ? "#ef4444" : "#eab308",
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold w-8 text-right"
                  style={{ color: priority === "high" ? "#ef4444" : "#eab308" }}
                >
                  {Math.round(value * 100)}%
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: priority === "high" ? "#7f1d1d" : "#78350f",
                    color: priority === "high" ? "#fca5a5" : "#fcd34d",
                  }}
                >
                  {priority}
                </span>
              </div>

              {/* Dimension */}
              <p className="text-xs text-slate-300 font-medium leading-snug mb-1">
                {String(ann.dimension ?? "unknown dimension")}
              </p>

              {/* Suggested question */}
              <p className="text-xs text-slate-400 italic leading-snug mb-2">
                "{q.suggested_question}"
              </p>

              {/* Target node */}
              <p className="text-xs text-slate-600 font-mono truncate">
                target: {String(ann.target_id ?? "")}
              </p>

              {/* Rationale */}
              {ann.rationale != null && (
                <p className="text-xs text-slate-500 mt-1">{String(ann.rationale)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
