"""Cypher query templates for the context graph layer."""

# ── Write path ──────────────────────────────────────────────────────────────

UPSERT_DECISION = """
MERGE (d:DecisionTrace {id: $id})
SET d += $props
RETURN d
"""

UPSERT_PRECEDENT = """
MERGE (p:Precedent {id: $id})
SET p += $props
RETURN p
"""

LINK_DECISION_EVIDENCE = """
MATCH (d:DecisionTrace {id: $decision_id})
MATCH (e {id: $evidence_id})
MERGE (d)-[r:JUSTIFIED_BY]->(e)
SET r.created_at = $created_at
RETURN r
"""

LINK_DECISION_ACTOR = """
MATCH (d:DecisionTrace {id: $decision_id})
MATCH (a:AgentProfile {id: $actor_id})
MERGE (d)-[r:DECIDED_BY]->(a)
SET r.created_at = $created_at
RETURN r
"""

LINK_DECISION_POLICY = """
MATCH (d:DecisionTrace {id: $decision_id})
MATCH (p {id: $policy_id})
MERGE (d)-[r:GOVERNED_BY]->(p)
SET r.created_at = $created_at
RETURN r
"""

LINK_DECISION_PRECEDENT = """
MATCH (d:DecisionTrace {id: $decision_id})
MATCH (p:Precedent {id: $precedent_id})
MERGE (d)-[r:INVOKED_PRECEDENT]->(p)
SET r.created_at = $created_at
RETURN r
"""

LINK_PRECEDENT_FROM_DECISION = """
MATCH (d:DecisionTrace {id: $decision_id})
MATCH (p:Precedent {id: $precedent_id})
MERGE (d)-[r:CREATED_PRECEDENT]->(p)
SET r.created_at = $created_at
RETURN r
"""

# ── Replay ───────────────────────────────────────────────────────────────────

# Full decision replay: returns the decision and its directly linked nodes
REPLAY_DECISION = """
MATCH (d:DecisionTrace {id: $decision_id})
OPTIONAL MATCH (d)-[:DECIDED_BY]->(actor:AgentProfile)
OPTIONAL MATCH (d)-[:JUSTIFIED_BY]->(ev)
OPTIONAL MATCH (d)-[:GOVERNED_BY]->(pol)
OPTIONAL MATCH (d)-[:INVOKED_PRECEDENT]->(prec:Precedent)
RETURN d,
       collect(DISTINCT actor) AS actors,
       collect(DISTINCT ev)    AS evidence,
       collect(DISTINCT pol)   AS policies,
       collect(DISTINCT prec)  AS precedents
"""

# Ordered event chain leading to a decision (context path up to depth 5)
REPLAY_CONTEXT_PATH = """
MATCH path = (ancestor)-[:CREATED_PRECEDENT|JUSTIFIED_BY|GOVERNED_BY*1..5]->(d:DecisionTrace {id: $decision_id})
RETURN path
ORDER BY length(path) ASC
LIMIT 20
"""

# ── Precedent search ─────────────────────────────────────────────────────────

# Find precedents in the same domain; rank by invocation count
FIND_PRECEDENTS_BY_DOMAIN = """
MATCH (p:Precedent)
WHERE p.domain = $domain OR $domain IS NULL
RETURN p
ORDER BY p.invocation_count DESC, p.confidence DESC
LIMIT $limit
"""

# Precedents invoked by decisions that shared the same actor
FIND_PRECEDENTS_BY_ACTOR = """
MATCH (a:AgentProfile {id: $actor_id})<-[:DECIDED_BY]-(d:DecisionTrace)-[:INVOKED_PRECEDENT]->(p:Precedent)
RETURN DISTINCT p
ORDER BY p.invocation_count DESC
LIMIT $limit
"""

# Decisions that invoked a given precedent (usage history)
DECISIONS_USING_PRECEDENT = """
MATCH (d:DecisionTrace)-[:INVOKED_PRECEDENT]->(p:Precedent {id: $precedent_id})
OPTIONAL MATCH (d)-[:DECIDED_BY]->(actor:AgentProfile)
RETURN d, actor
ORDER BY d.created_at DESC
LIMIT $limit
"""

# ── Exception analysis ───────────────────────────────────────────────────────

FIND_EXCEPTIONS = """
MATCH (d:DecisionTrace)
WHERE d.is_exception = true
  AND ($domain IS NULL OR d.domain = $domain)
OPTIONAL MATCH (d)-[:INVOKED_PRECEDENT]->(p:Precedent)
RETURN d, collect(DISTINCT p) AS precedents
ORDER BY d.created_at DESC
LIMIT $limit
"""
