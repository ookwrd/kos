# Interface Research: Provenance-Rich Scientific Systems & Graph Sensemaking

## Key UI Patterns for Omega

### 1. Provenance-Rich Scientific Systems

**Reference systems:** CERN data provenance tools, NASA mission dashboards, scientific data management systems (DataCite, PID graph), Scholix, OpenAIRE

**Patterns that work:**
- **Custody chain visualization**: Linear flow from raw evidence → processed data → claim → decision. Each step is a node with actor, timestamp, method. Omega equivalent: the provenance chain in ProvenanceInspector must be impossible to miss, not buried.
- **Color-coded trust levels**: Systems like ORCID and DataCite use visual "rings" of trust. Green = peer-reviewed. Yellow = preprint. Orange = gray literature. Red = retracted. Omega should use uncertainty values (0–1) as visual field intensity, not just numbers.
- **Retraction propagation**: When a source is retracted, every downstream claim in the lineage is flagged. This is the "impact tracer" pattern. Critical for Omega's governance story.
- **Attribution at sub-claim level**: Not just "paper X says Y" but "Table 3, row 7 of paper X says Y, validated by reviewer Z on date D." Omega's EvidenceFragment already supports this; it needs visual expression.

**What Omega is missing currently:**
- The provenance chain looks like a list. It should look like a river — a living flow of custody.
- There is no visual "retraction impact" mode
- Attribution is textual; it should be spatial and glowing

### 2. Graph Sensemaking

**Reference systems:** Gephi, Cytoscape (biology), The Brain (personal KM), Roam Research galaxy view, Systems Biology Markup Language (SBML) editors

**Patterns that work:**
- **Force-directed with semantic clustering**: Nodes group by meaning, not just by graph topology. Omega's knowledge layer should cluster by domain AND by epistemic status (evidence-heavy vs. hypothesis-only).
- **Lensing / focal zoom**: Clicking a node creates a "lens" that zooms its neighborhood while keeping global context. Critical for 47-node graphs that will grow to 4700.
- **Edge bundling**: Many edges from one node to another domain get bundled into one thick pipe. Reduces visual noise dramatically.
- **Confidence opacity**: Edge opacity = confidence. High confidence = solid line. Low confidence = ghost line. Makes uncertainty visible at a glance.
- **"Galaxy" metaphor**: Dense clusters are bright galaxy cores. Sparse nodes are dim outliers. The open-endedness layer should visually manifest as dark regions waiting to be lit.

**What Omega is missing currently:**
- Layout is pure dagre (left-to-right flow). Needs force-directed or concentric layout by domain.
- No confidence opacity on edges
- No lensing / neighborhood focus
- No "dark region" representation for knowledge gaps

### 3. Uncertainty Visualization

**Reference systems:** IPCC Assessment Report figures, NHS mortality risk charts, FiveThirtyEight election forecasts, climate model ensemble plots

**Patterns that work:**
- **Halo width = uncertainty**: The wider the halo around a node, the higher the uncertainty. This is pre-attentive (processed before conscious thought).
- **Field shading**: Background shading in the region around uncertain nodes — a "cloud" of uncertainty that overlaps multiple nodes.
- **Violin plots for distributions**: When showing calibration scores or belief distributions, violin plots communicate shape better than bars.
- **Ensemble lines**: For time-series confidence, draw multiple thin lines (ensemble members) rather than one thick line with error bars.
- **Traffic-light shorthand**: For non-expert audiences, use green/amber/red encoded as glyphs, not just colors (for accessibility).

**What Omega is missing currently:**
- Uncertainty is shown as numbers, not visual fields
- Node halo should pulse at frequency proportional to uncertainty
- No ensemble visualization for multi-agent beliefs

### 4. Institutional Decision Replay

**Reference systems:** Palantir Gotham timeline views, court case management systems, aviation black box replay interfaces, incident investigation tools

**Patterns that work:**
- **The timeline as story**: Each replay step occupies the full visible area. No scrolling — step through is the navigation.
- **Spatial evidence staging**: As the story advances, evidence "arrives" from the sides and locks into position.
- **Actor presence**: Each actor has a persistent card in a council rail on the side. When they speak, their card activates.
- **Counterfactual mode**: "What if this evidence had been weighted differently?" A slider lets the viewer adjust one input and watch the outcome change.
- **The moment of decision**: The decision step is a full-screen dramatic moment — large typography, outcome color fill, dissent records appear as floating challenges.

**What Omega is missing currently:**
- DecisionReplay is a list with a step counter. It needs to be a full-height, step-through story with dramatic transitions.
- Actors don't appear spatially — they're just referenced by ID
- No counterfactual mode
- The outcome is a small badge; it should be the climax of the narrative

### 5. Agent Councils / Deliberation Interfaces

**Reference systems:** United Nations vote tracking systems, OpenDemocracy deliberation tools, Pol.is opinion mapping, Loomio decision tools

**Patterns that work:**
- **Position space map**: A 2D space where axes are dimensions of disagreement. Each agent is a dot. Convergence = clustered dots. Genuine disagreement = spread.
- **Speech-to-council format**: Each agent has a panel/card. Their statement is visible simultaneously. The user sees the council, not just the outcome.
- **Dissent as first-class UI element**: Dissenting positions are not hidden or minimized. They have their own prominent panel.
- **Confidence-weighted synthesis**: The "collective verdict" shows not just what was decided but why the weighting came out as it did.
- **Temporal deliberation**: The council didn't agree instantly. Show the order in which agents responded and how the consensus evolved.

### 6. High-Trust Operational Dashboards

**Reference systems:** Bloomberg Terminal, SpaceX mission control, ICU dashboards (APACHE scoring), air traffic control (NATS En Route UK)

**Patterns that work:**
- **Nothing hidden**: Every number is visible. If something is unknown, "—" appears, not a blank space.
- **Alarm states, not notifications**: Critical issues change the background, not just show a badge.
- **Hierarchy of views**: Overview → Domain → Node → Evidence, each view transition is explicit and reversible.
- **Persistent status rail**: A narrow rail on one edge always shows system health — connection, live data rate, last update.
- **Dense information, not cluttered**: Bloomberg packs enormous information density without feeling cluttered because the typography system is rigorous and consistent.

## Translation to Omega Interface Decisions

1. **GraphCanvas**: Switch to force-directed with domain clustering. Add confidence opacity to edges. Add halo pulse for high-uncertainty nodes. Add "dark region" for knowledge gaps.
2. **DecisionReplay**: Full-height step-through with actor council rail on the side. Dramatic outcome screen. Evidence arrives spatially.
3. **ProvenanceInspector**: Show as a river/chain, not a list. Add retraction impact tracer.
4. **AgentCouncilView**: Add position space map. Show simultaneous agent positions. Dissent as first-class card.
5. **App shell**: Add persistent status rail. Use alarm states for constraint violations.

## Visual References (Conceptual)

- **Node glow intensity** ∝ evidence density
- **Edge opacity** ∝ confidence
- **Node halo pulse rate** ∝ uncertainty (high uncertainty = fast pulse)
- **Background darkness** ∝ knowledge gap (dark = unexplored)
- **District height** (city view) ∝ node count in that domain+layer
- **Bridge arc thickness** ∝ alignment confidence
- **Agent card brightness** ∝ calibration score
