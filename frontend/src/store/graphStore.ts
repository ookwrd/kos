/**
 * Zustand store for the KOS graph state.
 * Slices: graph overview, selected node, active layers, replay state,
 * alignment state, inference state, proposals.
 */

import { create } from "zustand";
import type {
  GraphOverview, GraphNode, ReplayResult, AlignmentMap,
  ExpertRouting, NextBestQuestion, GraphChangeProposal,
} from "../api/client";

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

  // Live WebSocket events
  liveEvents: unknown[];
  pushEvent: (e: unknown) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  overview: null,
  loading: false,
  error: null,
  setOverview: overview => set({ overview }),
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

  liveEvents: [],
  pushEvent: e => set(s => ({ liveEvents: [e, ...s.liveEvents].slice(0, 50) })),
}));
