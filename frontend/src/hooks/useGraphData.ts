/**
 * useGraphData — fetches the graph overview on mount and when domain/layer
 * filters change. Connects the WebSocket for live updates.
 */

import { useEffect } from "react";
import { api, connectGraphWs } from "../api/client";
import { useGraphStore } from "../store/graphStore";
import { DEMO_OVERVIEW } from "../api/demoData";

export function useGraphData() {
  const { domainFilter, setOverview, setLoading, setError, pushEvent } = useGraphStore();

  useEffect(() => {
    setLoading(true);
    api.graph
      .overview(domainFilter ?? undefined)
      .then(setOverview)
      .catch(() => {
        // No backend — show static demo data so the UI is always functional
        setOverview(DEMO_OVERVIEW);
        setError(null);
      })
      .finally(() => setLoading(false));
  }, [domainFilter]);

  // WebSocket live events
  useEffect(() => {
    const disconnect = connectGraphWs(event => {
      pushEvent(event);
      // Re-fetch overview when a node is added
      if ((event as Record<string, unknown>)?.type === "node_added") {
        api.graph
          .overview(domainFilter ?? undefined)
          .then(setOverview)
          .catch(() => {});
      }
    });
    return disconnect;
  }, [domainFilter]);
}

export function useDecisionReplay(decisionId: string | null) {
  const { setReplayResult } = useGraphStore();

  useEffect(() => {
    if (!decisionId) { setReplayResult(null); return; }
    api.decisions
      .replay(decisionId)
      .then(setReplayResult)
      .catch(() => setReplayResult(null));
  }, [decisionId]);
}
