import { useEffect, useRef, useCallback, useState } from "react";
import cytoscape, { Core, ElementDefinition } from "cytoscape";
import dagre from "cytoscape-dagre";
import { useGraphStore, LAYER_COLORS, ALL_LAYERS, type LayerKey } from "../store/graphStore";
import { NodeInspector } from "./NodeInspector";

cytoscape.use(dagre);

const LAYER_SHAPES: Record<LayerKey, string> = {
  evidence:   "roundrectangle",
  context:    "diamond",
  knowledge:  "hexagon",
  goal:       "star",
  governance: "pentagon",
  agents:     "ellipse",
};

const LAYER_LABELS: Record<LayerKey, string> = {
  evidence:   "Evidence",
  context:    "Context",
  knowledge:  "Knowledge",
  goal:       "Goal",
  governance: "Governance",
  agents:     "Agents",
};

type LayoutMode = "dagre" | "concentric" | "grid";

interface Props { className?: string }

export function GraphCanvas({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("dagre");

  const { overview, visibleLayers, selectNode } = useGraphStore();

  const buildElements = useCallback((): ElementDefinition[] => {
    if (!overview) return [];
    const elements: ElementDefinition[] = [];
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const [layerKey, layerData] of Object.entries(overview.layers)) {
      if (!visibleLayers.has(layerKey as LayerKey)) continue;

      for (const node of layerData.nodes) {
        if (seenNodes.has(node.id)) continue;
        seenNodes.add(node.id);
        const color = LAYER_COLORS[node.layer as LayerKey] ?? "#94a3b8";
        const shape = LAYER_SHAPES[node.layer as LayerKey] ?? "ellipse";
        const uncertainty = (node.data as Record<string, unknown>)?.uncertainty as number | undefined;
        const nodeType = (node.data as Record<string, unknown>)?.type as string | undefined;
        const domain = (node.data as Record<string, unknown>)?.domain as string | undefined;
        elements.push({
          group: "nodes",
          data: {
            id: node.id,
            label: node.label.length > 20 ? node.label.slice(0, 17) + "…" : node.label,
            layer: node.layer,
            fullData: node,
            color,
            shape,
            uncertainty: uncertainty ?? 0,
            domain: domain ?? "",
            isDissent: nodeType === "DissentRecord",
          },
        });
      }

      for (const edge of layerData.edges) {
        const edgeId = `${edge.source}__${edge.relation}__${edge.target}`;
        if (!seenNodes.has(edge.source) || !seenNodes.has(edge.target)) continue;
        if (seenEdges.has(edgeId)) continue;
        seenEdges.add(edgeId);
        const srcNode = overview.layers[layerKey]?.nodes.find(n => n.id === edge.source);
        const edgeColor = srcNode ? LAYER_COLORS[srcNode.layer as LayerKey] : "#475569";
        elements.push({
          group: "edges",
          data: {
            id: edgeId,
            source: edge.source,
            target: edge.target,
            label: edge.relation.replace(/_/g, " ").toLowerCase(),
            edgeColor,
          },
        });
      }
    }
    return elements;
  }, [overview, visibleLayers]);

  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: "node",
          style: {
            shape: "data(shape)" as never,
            "background-color": "data(color)",
            "background-opacity": 0.9,
            label: "data(label)",
            "font-size": 9,
            "font-family": "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
            color: "#cbd5e1",
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 7,
            "text-background-color": "#091a12",
            "text-background-opacity": 0.85,
            "text-background-padding": "2.5px",
            "text-background-shape": "roundrectangle",
            width: 32,
            height: 32,
            "border-width": 1.5,
            "border-color": "data(color)",
            "border-opacity": 0.7,
            "overlay-opacity": 0,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 2.5,
            "border-color": "#ffffff",
            "border-opacity": 1,
            "background-opacity": 1,
            width: 40,
            height: 40,
            "z-index": 9999,
            "shadow-blur": 16,
            "shadow-color": "data(color)",
            "shadow-opacity": 0.6,
            "shadow-offset-x": 0,
            "shadow-offset-y": 0,
          } as never,
        },
        {
          selector: "node[isDissent]",
          style: {
            "border-color": "#f59e0b",
            "border-width": 2,
            "border-opacity": 0.9,
          },
        },
        {
          selector: "node:active",
          style: { "overlay-opacity": 0 },
        },
        {
          selector: "edge",
          style: {
            width: 1.2,
            "line-color": "data(edgeColor)",
            "line-opacity": 0.3,
            "target-arrow-color": "data(edgeColor)",
            "target-arrow-shape": "triangle",
            "arrow-scale": 0.7,
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 7,
            "font-family": "'SF Mono', 'Fira Code', monospace",
            color: "#475569",
            "text-rotation": "autorotate",
            "text-background-color": "#091a12",
            "text-background-opacity": 0.9,
            "text-background-padding": "2px",
            "overlay-opacity": 0,
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#f8fafc",
            "target-arrow-color": "#f8fafc",
            width: 2,
            "line-opacity": 0.85,
          },
        },
        {
          selector: "edge:hover",
          style: {
            "line-opacity": 0.7,
            width: 2,
            "overlay-opacity": 0,
          },
        },
      ],
      layout: { name: "dagre", rankDir: "LR", nodeSep: 55, rankSep: 110, padding: 36 } as never,
    });

    cyRef.current.on("tap", "node", evt => {
      selectNode(evt.target.data("fullData") ?? null);
    });
    cyRef.current.on("tap", evt => {
      if (evt.target === cyRef.current) selectNode(null);
    });

    return () => { cyRef.current?.destroy(); cyRef.current = null; };
  }, [selectNode]);

  useEffect(() => {
    if (!cyRef.current) return;
    const elements = buildElements();
    cyRef.current.elements().remove();
    cyRef.current.add(elements);
    if (elements.length === 0) return;

    const layoutConfig: Record<LayoutMode, never> = {
      dagre: { name: "dagre", rankDir: "LR", nodeSep: 55, rankSep: 110, padding: 36 } as never,
      concentric: {
        name: "concentric",
        concentric: (node: { data: (k: string) => string }) => {
          const layerOrder: Record<LayerKey, number> = {
            agents: 6, governance: 5, goal: 4, context: 3, knowledge: 2, evidence: 1,
          };
          return layerOrder[node.data("layer") as LayerKey] ?? 0;
        },
        levelWidth: () => 2,
        minNodeSpacing: 50,
        padding: 36,
      } as never,
      grid: { name: "grid", rows: 5, padding: 36 } as never,
    };

    cyRef.current.layout(layoutConfig[layoutMode]).run();
  }, [buildElements, layoutMode]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ background: "transparent" }}>
      {/* Background overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" style={{ opacity: 0.35 }}>
          <defs>
            <radialGradient id="glow-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.07 }} />
              <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#glow-center)" />
          {/* Grid lines */}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`}
              style={{ stroke: "var(--line)" }} strokeWidth="0.5" />
          ))}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`v${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%"
              style={{ stroke: "var(--line)" }} strokeWidth="0.5" />
          ))}
          {/* Star field */}
          {Array.from({ length: 80 }, (_, i) => (
            <circle
              key={`s${i}`}
              cx={`${(i * 137.5) % 100}%`}
              cy={`${(i * 97.3) % 100}%`}
              r={Math.random() > 0.9 ? 1.2 : 0.6}
              fill="white"
              opacity={(i % 7) * 0.06 + 0.03}
            />
          ))}
        </svg>
      </div>

      {/* Layer toggle bar */}
      <LayerToggleBar layoutMode={layoutMode} onLayoutChange={setLayoutMode} />

      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!overview && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full animate-ping" style={{ border: "1px solid var(--accent)", opacity: 0.2 }} />
            <div className="absolute inset-1 rounded-full animate-spin" style={{ borderWidth: 2, borderStyle: "solid", borderColor: "var(--line-strong)", borderTopColor: "var(--accent)" }} />
          </div>
          <p className="text-xs tracking-widest uppercase" style={{ color: "var(--text-quiet)" }}>Connecting to substrate…</p>
        </div>
      )}

      <NodeInspector />
    </div>
  );
}

function LayerToggleBar({ layoutMode, onLayoutChange }: { layoutMode: LayoutMode; onLayoutChange: (m: LayoutMode) => void }) {
  const { overview, visibleLayers, toggleLayer, setAllLayers } = useGraphStore();

  const nodeCounts = overview
    ? Object.fromEntries(ALL_LAYERS.map(l => [l, overview.layers[l]?.nodes.length ?? 0]))
    : {};

  return (
    <div
      className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 rounded-xl p-2"
      style={{ background: "var(--bg-panel)", backdropFilter: "blur(12px)", border: "1px solid var(--line)" }}
    >
      {ALL_LAYERS.map(layer => {
        const active = visibleLayers.has(layer);
        const color = LAYER_COLORS[layer];
        const count = nodeCounts[layer] ?? 0;
        return (
          <button
            key={layer}
            onClick={() => toggleLayer(layer)}
            title={`${LAYER_LABELS[layer]} (${count} nodes)`}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-150"
            style={{
              backgroundColor: active ? `${color}18` : "transparent",
              color: active ? color : "var(--text-quiet)",
              border: `1px solid ${active ? `${color}35` : "var(--line)"}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? color : "var(--line-strong)" }} />
            {LAYER_LABELS[layer]}
            {count > 0 && (
              <span className="text-[8px] font-mono px-1 rounded"
                style={{ backgroundColor: active ? `${color}25` : "transparent", color: active ? color : "var(--text-quiet)" }}>
                {count}
              </span>
            )}
          </button>
        );
      })}

      <div className="flex items-center gap-1 ml-1 pl-1.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
        {(["dagre", "concentric", "grid"] as LayoutMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => onLayoutChange(mode)}
            className="px-2 py-1 rounded text-[9px] font-medium transition-all"
            style={{
              backgroundColor: layoutMode === mode ? "var(--bg-surface)" : "transparent",
              color: layoutMode === mode ? "var(--accent)" : "var(--text-quiet)",
              border: `1px solid ${layoutMode === mode ? "var(--line-strong)" : "transparent"}`,
            }}
          >
            {mode === "dagre" ? "→" : mode === "concentric" ? "◎" : "⊞"}
          </button>
        ))}
        <button
          onClick={() => setAllLayers(true)}
          className="px-2 py-1 rounded text-[9px] transition-colors" style={{ color: "var(--text-quiet)" }}
        >
          all
        </button>
      </div>
    </div>
  );
}
