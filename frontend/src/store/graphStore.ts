/**
 * Zustand store for the KOS graph state.
 * Slices: graph overview, selected node, active layers, replay state,
 * alignment state, inference state, proposals.
 */

import { create } from "zustand";
import type {
  GraphOverview, GraphNode, GraphEdge, ReplayResult, AlignmentMap,
  ExpertRouting, NextBestQuestion, GraphChangeProposal,
} from "../api/client";

function loadLocalNodes(): GraphNode[] {
  try { return JSON.parse(localStorage.getItem("kos-local-nodes") ?? "[]"); } catch { return []; }
}
function loadLocalEdges(): GraphEdge[] {
  try { return JSON.parse(localStorage.getItem("kos-local-edges") ?? "[]"); } catch { return []; }
}
function mergeLocalIntoOverview(o: GraphOverview, nodes: GraphNode[], edges: GraphEdge[]): GraphOverview {
  if (nodes.length === 0) return o;
  const layers = { ...o.layers };
  for (const node of nodes) {
    const l = node.layer;
    layers[l] = { nodes: [...(layers[l]?.nodes ?? []), node], edges: layers[l]?.edges ?? [] };
  }
  return {
    ...o,
    layers,
    summary: {
      ...o.summary,
      total_nodes: o.summary.total_nodes + nodes.length,
      total_edges: o.summary.total_edges + edges.length,
    },
  };
}

export type LayerKey = "evidence" | "context" | "knowledge" | "goal" | "governance" | "agents";

export const LAYER_COLORS: Record<LayerKey, string> = {
  evidence:   "#3b82f6",  // blue
  context:    "#f97316",  // orange
  knowledge:  "#22c55e",  // green
  goal:       "#eab308",  // yellow
  governance: "#a855f7",  // purple
  agents:     "#14b8a6",  // teal
};

export const ALL_LAYERS: LayerKey[] = ["evidence", "context", "knowledge", "goal", "governance", "agents"];

interface GraphState {
  // Graph overview
  overview: GraphOverview | null;
  loading: boolean;
  error: string | null;
  setOverview: (o: GraphOverview) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;

  // Layer visibility toggles
  visibleLayers: Set<LayerKey>;
  toggleLayer: (layer: LayerKey) => void;
  setAllLayers: (visible: boolean) => void;

  // Selected node
  selectedNode: GraphNode | null;
  selectNode: (node: GraphNode | null) => void;

  // Domain filter
  domainFilter: string | null;
  setDomainFilter: (d: string | null) => void;

  // Decision replay
  replayResult: ReplayResult | null;
  replayStep: number;
  setReplayResult: (r: ReplayResult | null) => void;
  setReplayStep: (s: number) => void;

  // Alignment
  alignmentMap: AlignmentMap | null;
  setAlignmentMap: (a: AlignmentMap | null) => void;

  // Collective inference
  expertRouting: ExpertRouting[];
  nextQuestions: NextBestQuestion[];
  setExpertRouting: (r: ExpertRouting[]) => void;
  setNextQuestions: (q: NextBestQuestion[]) => void;

  // Open-endedness proposals
  proposals: GraphChangeProposal[];
  setProposals: (p: GraphChangeProposal[]) => void;

  // Local write path — session + localStorage-persisted nodes committed by user
  localNodes: GraphNode[];
  localEdges: GraphEdge[];
  commitLocalNode: (node: GraphNode, edges?: GraphEdge[]) => void;
  clearLocalNodes: () => void;

  // Highlighted bridge (set by SerendipityPanel, consumed by CityOverview)
  highlightedBridgeId: string | null;
  setHighlightedBridge: (id: string | null) => void;

  // Global view request (set by SerendipityPanel to switch to city view)
  requestedView: "graph" | "city" | null;
  requestView: (v: "graph" | "city" | null) => void;

  // Live WebSocket events
  liveEvents: unknown[];
  pushEvent: (e: unknown) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  overview: null,
  loading: false,
  error: null,
  setOverview: o => set(s => ({ overview: mergeLocalIntoOverview(o, s.localNodes, s.localEdges) })),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),

  visibleLayers: new Set(ALL_LAYERS),
  toggleLayer: layer => {
    const next = new Set(get().visibleLayers);
    if (next.has(layer)) next.delete(layer); else next.add(layer);
    set({ visibleLayers: next });
  },
  setAllLayers: visible => set({ visibleLayers: visible ? new Set(ALL_LAYERS) : new Set() }),

  selectedNode: null,
  selectNode: selectedNode => set({ selectedNode }),

  domainFilter: null,
  setDomainFilter: domainFilter => set({ domainFilter }),

  replayResult: null,
  replayStep: 0,
  setReplayResult: replayResult => set({ replayResult, replayStep: 0 }),
  setReplayStep: replayStep => set({ replayStep }),

  alignmentMap: null,
  setAlignmentMap: alignmentMap => set({ alignmentMap }),

  expertRouting: [],
  nextQuestions: [],
  setExpertRouting: expertRouting => set({ expertRouting }),
  setNextQuestions: nextQuestions => set({ nextQuestions }),

  proposals: [],
  setProposals: proposals => set({ proposals }),

  localNodes: loadLocalNodes(),
  localEdges: loadLocalEdges(),
  commitLocalNode: (node, edges = []) => {
    const { localNodes, localEdges, overview } = get();
    const newNodes = [...localNodes, node];
    const newEdges = [...localEdges, ...edges];
    try {
      localStorage.setItem("kos-local-nodes", JSON.stringify(newNodes));
      localStorage.setItem("kos-local-edges", JSON.stringify(newEdges));
    } catch {}
    const updatedOverview = overview ? mergeLocalIntoOverview(
      { ...overview, summary: { ...overview.summary, total_nodes: overview.summary.total_nodes - localNodes.length, total_edges: overview.summary.total_edges - localEdges.length } },
      newNodes, newEdges
    ) : null;
    set({ localNodes: newNodes, localEdges: newEdges, ...(updatedOverview ? { overview: updatedOverview } : {}) });
  },
  clearLocalNodes: () => {
    try { localStorage.removeItem("kos-local-nodes"); localStorage.removeItem("kos-local-edges"); } catch {}
    set(s => {
      if (!s.overview) return { localNodes: [], localEdges: [] };
      return { localNodes: [], localEdges: [], overview: mergeLocalIntoOverview(
        { ...s.overview, summary: { ...s.overview.summary, total_nodes: s.overview.summary.total_nodes - s.localNodes.length, total_edges: s.overview.summary.total_edges - s.localEdges.length } },
        [], []
      )};
    });
  },

  highlightedBridgeId: null,
  setHighlightedBridge: highlightedBridgeId => set({ highlightedBridgeId }),

  requestedView: null,
  requestView: requestedView => set({ requestedView }),

  liveEvents: [],
  pushEvent: e => set(s => ({ liveEvents: [e, ...s.liveEvents].slice(0, 50) })),
}));
