/**
 * Typed API client for the KOS backend.
 * All functions return typed responses; errors throw with a message.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const BASE = `${API_BASE}/api`;

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`KOS API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types (mirror Pydantic models) ────────────────────────────────────────────

export interface GraphOverview {
  layers: Record<string, { nodes: GraphNode[]; edges: GraphEdge[] }>;
  summary: { total_nodes: number; total_edges: number; domain: string | null; layer_filter: string | null };
}

export interface GraphNode {
  id: string;
  label: string;
  layer: string;
  type: string;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface ReplayResult {
  decision: Record<string, unknown>;
  actors: Record<string, unknown>[];
  evidence: Record<string, unknown>[];
  policies: Record<string, unknown>[];
  precedents: Record<string, unknown>[];
  replay_steps: ReplayStep[];
}

export interface ReplayStep {
  step: number;
  type: string;
  label: string;
  content: unknown;
}

export interface AlignmentMap {
  id: string;
  source_domain: string;
  target_domain: string;
  mappings: OntologyMapping[];
  gaps_source: string[];
  gaps_target: string[];
  coverage: number;
  structural_notes: string;
}

export interface OntologyMapping {
  id: string;
  source_node_id: string;
  target_node_id: string;
  confidence: string;
  score: number;
  structural_loss: string;
}

export interface ExpertRouting {
  agent: Record<string, unknown>;
  eig_score: number;
  calibration: number;
  competence_similarity: number;
  n_dissents: number;
  routing_reason: string;
}

export interface NextBestQuestion {
  annotation: Record<string, unknown>;
  suggested_question: string;
  uncertainty_value: number;
  epistemic_priority: string;
}

export interface GraphChangeProposal {
  id: string;
  proposal_type: string;
  rationale: string;
  novelty_score: number;
  status: string;
  affected_node_ids: string[];
  domain: string | null;
}

export interface BridgeCandidate {
  id: string;
  claim: string;
  source_domain: string;
  target_domain: string;
  source_node_ids: string[];
  target_node_ids: string[];
  confidence: number;
  novelty_score: number;
  structural_loss: string;
}

export interface TransferOperator {
  id: string;
  bridge_map_id: string;
  status: string;
  approved_by: string | null;
  approval_note: string;
  acknowledged_loss_report_id: string | null;
  reversible: boolean;
  expiry_condition: string;
}

export interface StructuralLossReport {
  id: string;
  source_domain: string;
  target_domain: string;
  items: Array<{ loss_type: string; description: string; severity: number }>;
  overall_fidelity: number;
  summary: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const api = {
  graph: {
    overview: (domain?: string, layer?: string) =>
      req<GraphOverview>(`/graph/overview${qs({ domain, layer })}`),
  },
  decisions: {
    replay: (id: string) => req<ReplayResult>(`/decisions/${id}/replay`),
    exceptions: (domain?: string) =>
      req<unknown[]>(`/decisions/exceptions${qs({ domain })}`),
    searchPrecedents: (q: string) =>
      req<unknown[]>(`/decisions/precedents/search?q=${encodeURIComponent(q)}`),
  },
  knowledge: {
    path: (from: string, to: string) =>
      req<unknown[]>(`/knowledge/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    entities: (domain?: string) =>
      req<unknown[]>(`/knowledge/entities${qs({ domain })}`),
    hypotheses: (domain?: string) =>
      req<unknown[]>(`/knowledge/hypotheses${qs({ domain })}`),
    search: (q: string) =>
      req<unknown[]>(`/knowledge/search?q=${encodeURIComponent(q)}`),
  },
  goals: {
    list: (domain?: string) => req<unknown[]>(`/goals${qs({ domain })}`),
    conflicts: (ids: string[]) =>
      req<unknown[]>(`/goals/conflicts?${ids.map(id => `ids=${id}`).join("&")}`),
    hierarchy: (id: string) => req<unknown[]>(`/goals/${id}/hierarchy`),
  },
  agents: {
    get: (id: string) => req<unknown>(`/agents/${id}`),
    uncertainties: (targetId: string) =>
      req<unknown[]>(`/agents/uncertainty/${targetId}`),
    dissents: (targetId: string) =>
      req<unknown[]>(`/agents/dissent/${targetId}`),
    search: (q: string) =>
      req<unknown[]>(`/agents/search/semantic?q=${encodeURIComponent(q)}`),
  },
  alignment: {
    compute: (sourceDomain: string, targetDomain: string) =>
      req<AlignmentMap>(`/alignment/compute?source_domain=${sourceDomain}&target_domain=${targetDomain}`),
    list: () => req<AlignmentMap[]>("/alignment"),
    get: (id: string) => req<AlignmentMap>(`/alignment/${id}`),
  },
  inference: {
    routeExpert: (question: string, goalId?: string, domain?: string, topK = 3) =>
      req<ExpertRouting[]>(`/inference/route${qs({ question, goal_id: goalId, domain, top_k: topK })}`),
    nextQuestion: (goalId?: string, domain?: string) =>
      req<NextBestQuestion[]>(`/inference/next-question${qs({ goal_id: goalId, domain })}`),
    dissents: (domain?: string) =>
      req<unknown[]>(`/inference/dissents${qs({ domain })}`),
  },
  openendedness: {
    scan: () => req<GraphChangeProposal[]>("/openendedness/scan", { method: "POST" }),
    proposals: () => req<GraphChangeProposal[]>("/openendedness/proposals"),
    review: (id: string, accepted: boolean, note = "") =>
      req<unknown>(`/openendedness/proposals/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ accepted, note }),
      }),
    bridges: () => req<BridgeCandidate[]>("/openendedness/bridges"),
  },
  transfer: {
    operators: () => req<TransferOperator[]>("/transfer/operators"),
    lossReport: (id: string) => req<StructuralLossReport>(`/transfer/loss-report/${id}`),
  },
};

// ── WebSocket ─────────────────────────────────────────────────────────────────

export function connectGraphWs(onEvent: (event: unknown) => void): () => void {
  const wsBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/^https?/, (p: string) => (p === "https" ? "wss" : "ws"))
    : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  const ws = new WebSocket(`${wsBase}/api/graph/ws`);
  ws.onmessage = e => {
    try { onEvent(JSON.parse(e.data)); } catch {}
  };
  ws.onerror = () => ws.close();
  return () => ws.close();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function qs(params: Record<string, unknown>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}
