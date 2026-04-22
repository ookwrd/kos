/**
 * Static demo data derived from the drug_discovery fixture.
 * Used as fallback when the backend API is unavailable.
 */

import type { GraphOverview } from "./client";

export const DEMO_OVERVIEW: GraphOverview = {
  layers: {
    evidence: {
      nodes: [
        { id: "ev-kras-structure-2019", label: "Covalent targeting of KRAS G12C (AMG 510)", layer: "evidence", type: "evidence",
          data: { id: "ev-kras-structure-2019", source_type: "document", domain: "drug_discovery",
                  content_ref: "doi:10.1038/s41586-019-1694-1", tags: ["kras","sotorasib","structure"] } },
        { id: "ev-codebreak100-trial", label: "CodeBreaK 100 Phase II — Sotorasib NSCLC", layer: "evidence", type: "evidence",
          data: { id: "ev-codebreak100-trial", source_type: "document", domain: "drug_discovery",
                  content_ref: "doi:10.1056/NEJMoa2103695", tags: ["clinical-trial","sotorasib","NSCLC"] } },
        { id: "ev-bbb-assay-results", label: "BBB permeability assay — AMG510 analogues", layer: "evidence", type: "evidence",
          data: { id: "ev-bbb-assay-results", source_type: "sensor_window", domain: "drug_discovery",
                  uncertainty: 0.6, tags: ["bbb","permeability","assay"] } },
      ],
      edges: [],
    },

    context: {
      nodes: [
        { id: "dec-trial-approval-2024", label: "Phase II CNS cohort expansion — deferred", layer: "context", type: "context",
          data: { id: "dec-trial-approval-2024", question: "Should the Phase II expansion cohort include CNS-metastatic NSCLC patients?",
                  outcome: "deferred", is_exception: true, domain: "drug_discovery" } },
        { id: "prec-cns-deferral-2022", label: "CNS deferral precedent — AMG-224 (2022)", layer: "context", type: "Precedent",
          data: { id: "prec-cns-deferral-2022", confidence: 0.82, invocation_count: 1, domain: "drug_discovery" } },
      ],
      edges: [
        { source: "dec-trial-approval-2024", target: "ev-bbb-assay-results", relation: "JUSTIFIED_BY" },
        { source: "dec-trial-approval-2024", target: "ev-codebreak100-trial", relation: "JUSTIFIED_BY" },
      ],
    },

    knowledge: {
      nodes: [
        { id: "ent-KRAS",   label: "KRAS",             layer: "knowledge", type: "knowledge",
          data: { id: "ent-KRAS",   entity_type: "protein",   domain: "drug_discovery", attributes: { gene: "KRAS", mutation: "G12C" } } },
        { id: "ent-RAF",    label: "RAF",              layer: "knowledge", type: "knowledge",
          data: { id: "ent-RAF",    entity_type: "protein",   domain: "drug_discovery" } },
        { id: "ent-MEK",    label: "MEK",              layer: "knowledge", type: "knowledge",
          data: { id: "ent-MEK",    entity_type: "protein",   domain: "drug_discovery" } },
        { id: "ent-ERK",    label: "ERK",              layer: "knowledge", type: "knowledge",
          data: { id: "ent-ERK",    entity_type: "protein",   domain: "drug_discovery" } },
        { id: "ent-AMG510", label: "Sotorasib (AMG510)", layer: "knowledge", type: "knowledge",
          data: { id: "ent-AMG510", entity_type: "compound",  domain: "drug_discovery",
                  attributes: { mechanism: "covalent KRAS G12C inhibitor", fda_approved: true } } },
        { id: "mech-KRAS-activates-RAF",   label: "KRAS activates RAF",   layer: "knowledge", type: "Mechanism",
          data: { id: "mech-KRAS-activates-RAF",   mechanism_type: "causal",    confidence: 0.97 } },
        { id: "mech-RAF-activates-MEK",    label: "RAF phosphorylates MEK", layer: "knowledge", type: "Mechanism",
          data: { id: "mech-RAF-activates-MEK",    mechanism_type: "causal",    confidence: 0.96 } },
        { id: "mech-MEK-activates-ERK",    label: "MEK activates ERK",    layer: "knowledge", type: "Mechanism",
          data: { id: "mech-MEK-activates-ERK",    mechanism_type: "causal",    confidence: 0.98 } },
        { id: "mech-AMG510-inhibits-KRAS", label: "AMG510 inhibits KRAS G12C", layer: "knowledge", type: "Mechanism",
          data: { id: "mech-AMG510-inhibits-KRAS", mechanism_type: "inhibitory", confidence: 0.94 } },
      ],
      edges: [
        { source: "ent-KRAS",   target: "mech-KRAS-activates-RAF",   relation: "HAS_MECHANISM" },
        { source: "mech-KRAS-activates-RAF",   target: "ent-RAF",    relation: "TARGETS" },
        { source: "ent-RAF",    target: "mech-RAF-activates-MEK",    relation: "HAS_MECHANISM" },
        { source: "mech-RAF-activates-MEK",    target: "ent-MEK",   relation: "TARGETS" },
        { source: "ent-MEK",    target: "mech-MEK-activates-ERK",    relation: "HAS_MECHANISM" },
        { source: "mech-MEK-activates-ERK",    target: "ent-ERK",   relation: "TARGETS" },
        { source: "ent-AMG510", target: "mech-AMG510-inhibits-KRAS", relation: "HAS_MECHANISM" },
        { source: "mech-AMG510-inhibits-KRAS", target: "ent-KRAS",  relation: "TARGETS" },
      ],
    },

    goal: {
      nodes: [
        { id: "goal-reduce-tumor-burden", label: "Reduce KRAS G12C tumour burden", layer: "goal", type: "goal",
          data: { id: "goal-reduce-tumor-burden", priority: 0.95, status: "active", metric: "objective_response_rate", metric_target: 0.40 } },
        { id: "goal-patient-safety", label: "Maintain acceptable safety profile", layer: "goal", type: "goal",
          data: { id: "goal-patient-safety", priority: 1.0, status: "active", metric: "grade3_adverse_events", metric_target: 0.15 } },
        { id: "goal-drug-selectivity", label: "KRAS G12C selectivity >100x over WT", layer: "goal", type: "goal",
          data: { id: "goal-drug-selectivity", priority: 0.8, status: "active" } },
        { id: "goal-research-acceleration", label: "Accelerate CNS cohort to next trial phase", layer: "goal", type: "goal",
          data: { id: "goal-research-acceleration", priority: 0.75, status: "active", metric: "months_to_cohort_expansion", metric_target: 6 } },
        { id: "constraint-cns-safety-gate", label: "CNS expansion requires BBB uncertainty <0.4", layer: "goal", type: "Constraint",
          data: { id: "constraint-cns-safety-gate", constraint_type: "hard", domain: "drug_discovery" } },
      ],
      edges: [],
    },

    governance: {
      nodes: [
        { id: "prov-ev-bbb-assay", label: "Provenance: BBB assay validated", layer: "governance", type: "ProvenanceRecord",
          data: { id: "prov-ev-bbb-assay", actor_id: "agent-chemist-01", action: "validated",
                  timestamp: "2024-07-10T09:15:00Z", source_id: "ev-bbb-assay-results" } },
        { id: "prov-dec-trial-approval", label: "Provenance: Trial approval decision", layer: "governance", type: "ProvenanceRecord",
          data: { id: "prov-dec-trial-approval", actor_id: "agent-oncologist-01", action: "created",
                  timestamp: "2024-07-15T14:30:00Z", source_id: "dec-trial-approval-2024" } },
      ],
      edges: [],
    },

    agents: {
      nodes: [
        { id: "agent-oncologist-01", label: "Dr. Sarah Chen", layer: "agents", type: "agents",
          data: { id: "agent-oncologist-01", agent_type: "human", domain: "drug_discovery",
                  competences: ["oncology","clinical trial design","RAS pathway"], calibration_score: 0.84 } },
        { id: "agent-chemist-01", label: "Dr. Marcus Webb", layer: "agents", type: "agents",
          data: { id: "agent-chemist-01", agent_type: "human", domain: "drug_discovery",
                  competences: ["medicinal chemistry","covalent inhibitors","KRAS"], calibration_score: 0.79 } },
        { id: "agent-ai-screen-01", label: "MolScreen-v2", layer: "agents", type: "agents",
          data: { id: "agent-ai-screen-01", agent_type: "ai", domain: "drug_discovery",
                  competences: ["virtual screening","docking","ADMET prediction"], calibration_score: 0.71 } },
      ],
      edges: [],
    },
  },

  summary: {
    total_nodes: 22,
    total_edges: 12,
    domain: "drug_discovery",
    layer_filter: null,
  },
};
