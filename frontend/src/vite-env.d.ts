/// <reference types="vite/client" />

declare module "cytoscape-dagre" {
  import type cytoscape from "cytoscape";
  const dagreLayout: cytoscape.Ext;
  export = dagreLayout;
}
