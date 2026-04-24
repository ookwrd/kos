# Distributed Cognition Fabric: Architecture Document

**Date:** 2026-04-24
**Status:** Architecture spec — V5 sprint

---

## Overview

The Distributed Cognition Fabric is Omega's answer to Cisco IoC's Cognition State Protocols: the shared infrastructure that allows distinct knowledge-holding agents (human experts, AI systems, institutional repositories) to pool cognition without surrendering local autonomy or exposing proprietary knowledge.

The word "fabric" is deliberate. A fabric is not a bus (all-to-all), not a hierarchy (top-down routing), and not a peer-to-peer mesh (unmediated). It is a substrate with structure — some parts are dense, some sparse, some temporarily isolated, some permanently separated by governance barriers.

---

## Three-Layer Architecture

The fabric operates across three distinct layers. These are not OSI layers in a strict protocol sense — they are epistemological layers describing where in the abstraction hierarchy knowledge lives.

### Layer 1: Latent (Local Vault)

The latent layer is the private substrate of each agent or domain node. It contains:

- Raw embeddings, model weights, and fine-tuning residuals
- Unstructured epistemic records: notes, observations, unvalidated hypotheses
- Tacit knowledge traces: recorded problem-solving episodes, multimodal expert sequences
- Information that has never been formalized or explicitly declared

This layer is **local by default**. Nothing at the latent layer enters the shared fabric without an explicit permission action by the owning domain or its governance principals. The latent layer corresponds roughly to what Polanyi called tacit knowledge — the "we know more than we can tell" reservoir.

In the current Omega implementation, the latent layer is a conceptual placeholder. The schema for tacit knowledge traces exists; the ingestion pipeline does not. Local vaults are represented in the UI as opaque nodes with declared-but-not-exported content summaries.

### Layer 2: Compressed (Abstraction / Pattern)

The compressed layer contains information that has been partially formalized: patterns extracted from raw data, recurring structural templates, domain heuristics, and abstracted problem-solving strategies. This layer is the output of the abstraction machinery.

Key properties:
- Substrate-partial: some features of the original domain are still present, some have been stripped
- Transferable with caveats: a compressed pattern can be shared, but the transfer validity score may be low if the receiving domain is structurally dissimilar
- Governed: permissions specify who can receive, copy, modify, or re-export a compressed pattern

The compressed layer is where most productive cross-domain transfer happens. A structural mapping that works between two domains is a compressed pattern — it captures enough of the relational structure to be useful without requiring the full latent substrate.

In the current implementation, the ConceptAtlas geometry partially represents this layer. Nodes at intermediate abstraction_level values (0.3–0.7) approximate compressed-layer objects.

### Layer 3: Semantic (Explicit Concept / Theorem / Policy)

The semantic layer contains fully formalized knowledge objects: named concepts with typed relations, theorems with proof dependencies, policy objects with enforcement mechanisms, and ontology entries with formal semantics.

This is the layer at which:
- ConceptAtlas nodes are defined
- Cross-domain bridges are registered
- Transfer mappings are documented (as functor descriptions)
- Governance constraints are expressed (as executable permissions)

The semantic layer is the only layer Omega currently implements with any completeness. The CognitionFabricView, ConceptAtlas, TransferWorkbench, and governance panel all operate at the semantic layer.

**Honest mapping to IoC:** Cisco's Cognition State Protocols describe something closer to a low-level cognitive protocol — potentially operating at tensor/embedding granularity. Omega's fabric operates exclusively at the semantic layer. There is no Omega-native mechanism for sharing raw embeddings or model activations between agents. This is both a practical limitation and a design choice: semantic-layer sharing is more auditable and more governable.

---

## Local Vaults vs. Shared Fabric: The Core Tension

The fundamental design tension in the fabric is between **local sovereignty** and **collective utility**.

Each domain/agent has strong reasons to maintain a local vault: competitive advantage, data privacy, regulatory compliance, and the basic epistemological fact that tacit knowledge is hard to externalize without distortion. Forcing full sharing degrades knowledge quality and destroys trust.

But isolated vaults produce no collective benefit. The fabric only has value if agents share at least at the semantic layer.

Omega's resolution: **tiered sharing with governance gates**. The default is local. Sharing is an explicit action. What gets shared is a semantic-layer representation, not the raw latent material. The governance layer records what was shared, to whom, under what terms, with what revocation conditions.

This is a weaker form of sharing than IoC envisions (which imagines fluent cognition state exchange), but it is more honest about the political economy of knowledge sharing between autonomous agents.

---

## Permission-Gated Exchange

Every transfer across the fabric boundary requires a permission object. Permission objects in Omega specify:

- **Source domain**: which vault is releasing the object
- **Target domain(s)**: who is permitted to receive
- **Object identity**: what concept, pattern, or mapping is being shared
- **Use constraints**: read-only, derivation-allowed, re-export-allowed
- **Revocation condition**: under what circumstances the permission expires or is withdrawn
- **Provenance chain**: history of prior transfers this object has already undergone

Permissions are executable in the sense that the fabric can enforce them — a domain attempting to use a revoked permission gets a governance rejection, not a silent failure.

Contestability is built in: any domain that received an object under a permission can contest a revocation if the revocation appears to violate prior agreements.

This machinery is designed but partially implemented. The data model for permission objects is complete. The enforcement layer in the fabric exchange flow is present for demo flows; it is not yet hardened for production-style adversarial cases.

---

## The Ratchet Effect

One of the fabric's intended emergent properties is a **cognitive ratchet**: once a well-validated abstraction is established at the semantic layer and shared across the fabric, it becomes a common substrate that subsequent work builds on. This is analogous to how a mathematical theorem, once proven and accepted, becomes infrastructure rather than active problem-solving territory.

The ratchet operates through:
1. **Structural loss measurement**: if a transfer mapping scores high transfer validity, it is flagged as a candidate for fabric-wide registration
2. **Multi-domain validation**: if multiple domains independently arrive at compatible abstractions, the fabric records this convergence as a higher-confidence semantic object
3. **Governance ratification**: a registered fabric-wide abstraction requires endorsement from a quorum of governance principals before it becomes "canonical"

The ratchet prevents regress — the collective does not have to re-solve the same abstraction problem in each new domain — while the permission and provenance machinery prevents the ratchet from being hijacked by a dominant domain that imposes its local vocabulary as global truth.

---

## CognitionFabricView as UI Surface

The CognitionFabricView in Omega's interface surfaces the fabric architecture as a navigable visualization. Current implementation:

- Domain nodes rendered as positioned circles with vault status indicators
- Active bridges shown as edges with transfer validity annotations
- Permission-gated edges styled differently from open edges
- Selecting an edge shows: source, target, object being transferred, permission status
- Ratcheted (canonicalized) abstractions shown in a distinct visual register

Not yet implemented in the UI:
- Live fabric state from the Neo4j graph (currently demo data)
- Real-time permission enforcement visualization
- Latent and Compressed layer representations (only Semantic layer is shown)
- Revocation event timeline

The CognitionFabricView is currently the strongest demo surface in Omega. It communicates the architecture quickly to technical audiences. The gap between the demo and a production fabric is large and should not be understated.
