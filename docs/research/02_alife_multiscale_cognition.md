# ALife & Multiscale Cognition: Interface and Systems Ideas

## Core ALife Concepts to Make Visible in Omega

### 1. Nested Agency / Emergent Individuality

**The idea (from ALife):** Agency and individuality emerge at multiple scales. A cell is an agent. A tissue is an agent. An organ is an agent. An organism is an agent. A social institution is an agent. These are not metaphors — they are genuine agents with their own goals, epistemic states, and boundaries.

**Chris Langton, Rodney Brooks, Francisco Varela:** The key insight is that individuality is *achieved*, not given. A collective becomes an individual when it develops a stable boundary (immune system, governance structure) and a self-model (beliefs about its own state and environment).

**Interface translation for Omega:**
- **Nested rings view**: Five concentric rings — Individual Expert → Team → Institution → Domain Pack → Multi-Domain. Each ring is interactive. Clicking zooms into that scale level.
- **Boundary visualization**: Each scale level has a visible "membrane" — a boundary that shows what is inside vs. outside the individual. For institutions, this is the permission scope.
- **Self-model panel**: Each agent level has a "self-model" — what it believes about itself. For an expert twin, this is calibration score + belief state. For an institution, it's its declared mandate + constraint set.

### 2. Open-Ended Evolution

**The idea (from ALife):** Systems that can generate genuine novelty must have: (a) variation, (b) selection, (c) heredity, and (d) some form of protected exploration. Open-ended evolution is evolution that never terminates — it continuously generates new complexity.

**Olaf Sporns, Kenneth Stanley (NEAT/novelty search):** Novelty itself can be an objective. Systems that only optimize fitness get stuck. Systems that reward novelty (distance from all previously seen states) can escape local optima and keep growing.

**Interface translation for Omega:**
- **Evolution Timeline**: Not just a list of changes, but a phylogenetic-tree-style view. Nodes branch. Dead branches (deprecated hypotheses) are shown as gray stumps. Living branches are bright.
- **Novelty heatmap**: Overlay on the graph showing which nodes/edges are "novel" (recently proposed, not yet grounded by evidence) vs. "established."
- **Fitness landscape visualization**: A 3D hill where different knowledge configurations have different "fitness" (evidence support). The current graph occupies one position on this landscape.
- **Proposal queue**: The open-endedness module generates proposals. Show them as "seeds" — glowing potential nodes waiting to be planted. Each seed has a novelty score.

### 3. Ecological Dynamics in Knowledge

**The idea:** Knowledge domains are ecological niches. Concepts compete for explanatory territory. Some become dominant (high connectivity, many citations). Some go extinct (deprecated, refuted). Some symbiose (alignment bridges). Some parasitize (incorrect claims borrowing evidence from correct ones).

**Stuart Kauffman, Per Bak (self-organized criticality):** Complex systems at the edge of chaos (near critical points) are most productive. Neither too ordered (rigid, no change) nor too disordered (chaotic, no structure) but at the boundary.

**Interface translation for Omega:**
- **Extinction markers**: When a hypothesis is refuted, show it as a faded gray node with a "fossil" icon. Its evidence connections remain visible as ghost links.
- **Competitive displacement view**: When two hypotheses compete for the same explanatory niche, show them in opposition with a "contested zone" between them.
- **Criticality indicator**: A readout showing whether the current knowledge graph is too rigid (low novelty, no proposals), too chaotic (many proposals, low confidence), or near-critical (productive tension).
- **Bloom events**: When a new domain pack is loaded or a breakthrough evidence piece confirms many hypotheses simultaneously, show a "bloom" animation — nodes light up in cascade.

### 4. Multi-Scale Cognition

**The idea (from cognitive science / ALife):** Intelligence is not located at one scale. Individual neurons, brain regions, individual brains, social groups, institutions, cultures, and civilizations all process information and "know" things. Each scale has its own:
- Temporal horizon (fast for neurons, slow for cultures)
- Spatial scope
- Type of representation (local vs. distributed)

**Andy Clark, Karl Friston, Michael Levin:** Extended cognition. The cognitive boundary is not the skull. It extends into tools, communities, and institutions.

**Interface translation for Omega:**
- **Scale slider**: A slider in the city view that adjusts the "zoom level of agency" — from individual expert (nodes) to collective (clusters) to domain pack (districts) to multi-domain (the full city).
- **Temporal resolution control**: Adjust the "clock speed" of the evolution timeline. At fast speed, you see rapid hypothesis cycles. At slow speed, you see institutional drift.
- **Cross-scale bridge indicators**: Some knowledge moves between scales — tacit knowledge from individual to institutional. Show these "scale bridges" as diagonal connections in the nested rings view.

### 5. Stigmergy and Distributed Memory

**The idea (from ALife, swarm intelligence):** Ants don't coordinate by messaging each other — they leave chemical trails (pheromones) that influence future behavior. Intelligence emerges from the environment, not from any one agent.

**Relevance to Omega:** The knowledge graph IS the pheromone trail. Agents don't coordinate by talking to each other — they read and write to the shared substrate. A node that many agents have visited has higher "activation." A knowledge pathway that has been "used" many times to reach decisions has higher influence.

**Interface translation for Omega:**
- **Usage heat trails**: Show edges that have been "traversed" by many decisions as bright highways. Rarely-used edges fade.
- **Activation map**: An overlay showing which parts of the graph are most "active" — referenced most often in recent decisions.
- **Dead zones**: Areas with no recent activity shown in deep gray. These are candidates for the open-endedness module to explore.

## Translating ALife → Omega UI Surfaces

### NestedAgencyView (New Component)
```
Level 5: Multi-Domain Intelligence (Full ecology)
  Level 4: Domain Pack (drug_discovery, fukushima_governance, euv_lithography)
    Level 3: Institution / Agent Collective (TEPCO, ASML)
      Level 2: Expert Twin (individual calibrated agent)
        Level 1: Belief / Evidence Fragment (atomic unit)
```

Each level:
- Has a distinct visual boundary (concentric rings or nested frames)
- Shows the "individuality" properties at that scale (goals, constraints, beliefs)
- Is selectable and expandable

### Evolution Timeline (Upgraded)
- Phylogenetic tree structure, not flat list
- Branch points = when a hypothesis was contested and two paths diverged
- Fossil nodes = deprecated knowledge
- "Bloom" events = cascade confirmations
- Novelty score overlay = shows where new growth is happening

### Ecology Overlay (GraphCanvas mode)
- Switch from standard graph to ecology mode
- Nodes become "organisms" — size = evidence density, color = domain
- Edges become "ecological relationships" — mutualistic, competitive, parasitic
- Background darkness = unexplored territory

## Research Sources Supporting This Approach

- Langton, C. (1989). Artificial Life. Santa Fe Institute Proceedings.
- Kauffman, S. (1993). Origins of Order: Self-Organization and Selection in Evolution.
- Brooks, R. (1991). Intelligence Without Representation. Artificial Intelligence.
- Clark, A. & Chalmers, D. (1998). The Extended Mind. Analysis.
- Friston, K. (2010). The free-energy principle: a unified brain theory. Nature Reviews Neuroscience.
- Stanley, K. & Lehman, J. (2015). Why Greatness Cannot Be Planned.
- Levin, M. (2023). Collective intelligence of morphogenesis. Nature Reviews Biomedical Engineering.
- Per Bak (1996). How Nature Works: The Science of Self-Organized Criticality.
