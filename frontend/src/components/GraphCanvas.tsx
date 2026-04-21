/**
 * GraphCanvas — multi-layer Cytoscape.js graph with layer toggles.
 *
 * Six layers, each with a distinct colour and node shape.
 * Layer shapes: evidence=roundrectangle, context=diamond, knowledge=hexagon,
 *   goal=star, governance=vee, agents=ellipse.
 */

import { useEffect, useRef, useCallback } from "react";
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

interface Props {
  className?: string;
}

export function GraphCanvas({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const { overview, visibleLayers, selectNode } = useGraphStore();

  const buildElements = useCallback((): ElementDefinition[] => {
    if (!overview) return [];
    const elements: ElementDefinition[] = [];
    const seenNodes = new Set<string>();

    for (const [layerKey, layerData] of Object.entries(overview.layers)) {
      if (!visibleLayers.has(layerKey as LayerKey)) continue;

      for (const node of layerData.nodes) {
        if (seenNodes.has(node.id)) continue;
        seenNodes.add(node.id);
        const color = LAYER_COLORS[node.layer as LayerKey] ?? "#94a3b8";
        const shape = LAYER_SHAPES[node.layer as LayerKey] ?? "ellipse";
        elements.push({
          group: "nodes",
          data: {
            id: node.id,
            label: node.label.length > 22 ? node.label.slice(0, 19) + "…" : node.label,
            layer: node.layer,
            fullData: node,
            color,
            shape,
          },
        });
      }

      for (const edge of layerData.edges) {
        if (!seenNodes.has(edge.source) || !seenNodes.has(edge.target)) continue;
        const srcLayer = overview.layers[layerKey]?.nodes.find(n => n.id === edge.source)?.layer as LayerKey | undefined;
        const edgeColor = srcLayer ? LAYER_COLORS[srcLayer] : "#475569";
        elements.push({
          group: "edges",
          data: {
            id: `${edge.source}__${edge.relation}__${edge.target}`,
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
            "background-opacity": 0.85,
            label: "data(label)",
            "font-size": 10,
            "font-family": "'Inter', 'SF Pro Display', system-ui, sans-serif",
            color: "#e2e8f0",
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 6,
            "text-background-color": "#0a1628",
            "text-background-opacity": 0.7,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            width: 36,
            height: 36,
            "border-width": 2,
            "border-color": "data(color)",
            "border-opacity": 0.9,
            "overlay-opacity": 0,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 3,
            "border-color": "#ffffff",
            "background-opacity": 1,
            width: 44,
            height: 44,
            "z-index": 9999,
          },
        },
        {
          selector: "node:active",
          style: { "overlay-opacity": 0 },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "data(edgeColor)",
            "line-opacity": 0.35,
            "target-arrow-color": "data(edgeColor)",
            "target-arrow-shape": "triangle",
            "arrow-scale": 0.8,
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 8,
            "font-family": "'Inter', system-ui, sans-serif",
            color: "#64748b",
            "text-rotation": "autorotate",
            "text-background-color": "#0a1628",
            "text-background-opacity": 0.8,
            "text-background-padding": "2px",
            "overlay-opacity": 0,
          },
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#f8fafc",
            "target-arrow-color": "#f8fafc",
            width: 2.5,
            "line-opacity": 0.9,
          },
        },
      ],
      layout: {
        name: "dagre",
        rankDir: "LR",
        nodeSep: 60,
        rankSep: 120,
        edgeSep: 10,
        padding: 32,
      } as never,
    });

    cyRef.current.on("tap", "node", evt => {
      const node = evt.target;
      selectNode(node.data("fullData") ?? null);
    });
    cyRef.current.on("tap", evt => {
      if (evt.target === cyRef.current) selectNode(null);
    });

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, [selectNode]);

  useEffect(() => {
    if (!cyRef.current) return;
    const elements = buildElements();
    cyRef.current.elements().remove();
    cyRef.current.add(elements);
    if (elements.length > 0) {
      cyRef.current
        .layout({
          name: "dagre",
          rankDir: "LR",
          nodeSep: 60,
          rankSep: 120,
          padding: 32,
        } as never)
        .run();
    }
  }, [buildElements]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ background: "#060c18" }}>
      {/* Subtle radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)",
        }}
      />

      <LayerToggleBar />

      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!overview && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm">Connecting to graph…</p>
        </div>
      )}

      <NodeInspector />
    </div>
  );
}

function LayerToggleBar() {
  const { overview, visibleLayers, toggleLayer, setAllLayers } = useGraphStore();

  const nodeCounts = overview
    ? Object.fromEntries(
        ALL_LAYERS.map(l => [l, overview.layers[l]?.nodes.length ?? 0])
      )
    : {};

  return (
    <div
      className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 rounded-xl p-2"
      style={{ background: "rgba(6,12,24,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.06)" }}
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              backgroundColor: active ? `${color}22` : "rgba(30,41,59,0.5)",
              color: active ? color : "#475569",
              border: `1px solid ${active ? `${color}50` : "transparent"}`,
              boxShadow: active ? `0 0 8px ${color}30` : "none",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: active ? color : "#334155" }}
            />
            {LAYER_LABELS[layer]}
            {count > 0 && (
              <span
                className="text-[9px] font-bold px-1 rounded"
                style={{ backgroundColor: active ? `${color}30` : "rgba(30,41,59,0.7)", color: active ? color : "#334155" }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      <button
        onClick={() => setAllLayers(true)}
        className="px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
        style={{ backgroundColor: "rgba(30,41,59,0.5)" }}
      >
        all
      </button>
    </div>
  );
}
