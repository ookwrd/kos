# Omega — Visual Language

## Design Philosophy

Omega should feel like a **frontier cognition laboratory** — not a SaaS dashboard, not a consumer app, not a generic "AI product." The visual language should communicate:

- institutional seriousness (this is infrastructure, not a toy)
- epistemic depth (many layers, many sources, traceable)
- living intelligence (motion, growth, contested zones)
- governed boundaries (authority is visible, not implicit)
- scientific calibration (confidence is shown, not hidden)

The reference aesthetic is closer to a deep-sea sonar display or a particle physics event visualization than a business intelligence dashboard. Dark, precise, layered, alive.

---

## Color System

### Layer Colors
Each of the seven layers has a canonical color used consistently throughout all views.

```
Evidence    #3b82f6   Blue        — empirical ground, raw substrate
Context     #f97316   Orange      — consequential events, decisions
Knowledge   #22c55e   Green       — causal structure, mechanisms
Goal        #eab308   Yellow      — normative commitments, agency
Governance  #a855f7   Purple      — authority, provenance, trust
Agents      #14b8a6   Teal        — epistemic actors, councils
Evolution   #ec4899   Pink        — growth, novelty, contested zones
```

### Background System
```
Deep space      #060c18   — primary background
Card surface    #0a1226   — panels, cards
Elevated        #0f1a35   — tooltips, dropdowns, modals
Border subtle   rgba(255,255,255,0.06)
Border visible  rgba(255,255,255,0.12)
```

### Text System
```
Primary     #f1f5f9   — main readable content
Secondary   #94a3b8   — supporting information
Muted       #475569   — labels, metadata
Disabled    #334155   — inactive states
```

### Signal System
```
Live / active     #22c55e   Green glow
Warning / dissent #eab308   Amber
Uncertain / sparse #f97316  Orange pulse
Error / revoked   #ef4444   Red
Novel / proposed  #ec4899   Pink shimmer
```

---

## Typography

- **Primary font**: System monospace stack for data, code, IDs
- **Display font**: Inter or similar humanist sans-serif for labels, headings
- **Scale**: tight — most interface text is 10–13px
- **Weight usage**: bold only for values and active states, never decorative

Labels should read like instrument panels, not marketing copy. Abbreviations are fine where meaning is established. Avoid full sentences in the interface except in narrative panels.

---

## Node Visual Language

Each layer's nodes have a distinct shape to enable layer identification without reading labels:

```
Evidence    roundrectangle   — document-like, bounded
Context     diamond          — decision point, pivotal
Knowledge   hexagon          — molecular, structural
Goal        star             — normative, radiating
Governance  pentagon         — bounded authority
Agents      ellipse          — organic, social
Evolution   octagon          — proposed, unresolved
```

### Node States
- **Default**: filled with 20% layer color opacity, full-opacity border
- **Selected**: bright border glow, elevated opacity, inspector opens
- **Uncertain**: pulsing opacity animation (0.6–1.0)
- **Contested/dissent**: amber border shimmer
- **Revoked**: red border, reduced opacity, strikethrough label
- **Novel/proposed**: pink outer ring, dashed border
- **High-confidence**: solid bright fill

### Edge Visual Language
- **Causal / mechanism**: directed arrow, layer color
- **Governance / permission**: dashed line, purple
- **Provenance**: dotted line, muted
- **Bridge (cross-domain)**: thick gradient line, both domain colors
- **Dissent**: red dashed arc

---

## Panel Design

### Glass Card Pattern
All panels use a consistent frosted-glass aesthetic:
```css
background: rgba(10, 18, 38, 0.92);
border: 1px solid rgba(255,255,255,0.08);
backdrop-filter: blur(12px);
```

### Layer Accent Pattern
Each panel has a left-border accent in the relevant layer color:
```css
border-left: 2px solid <layer-color>;
```

### Confidence Bars
Uncertainty/confidence values render as horizontal bars:
- Full width = certain (1.0)
- Half width = moderate (0.5)  
- Narrow = uncertain (<0.3)
- Color interpolates: green (certain) → amber (moderate) → red (uncertain)

### Provenance Chains
Provenance displays as a vertical timeline with:
- Actor identifier (left)
- Action verb (center, color-coded by action type)
- Timestamp (right, muted)
- Hash (truncated, monospace, far right)
- Connecting vertical line in layer color

---

## Motion Language

Motion should be purposeful and calm — never decorative or distracting.

### Appropriate motion:
- **Data loading**: subtle opacity fade-in (150ms ease-out)
- **Node selection**: smooth position transition to center (300ms ease)
- **Graph layout**: spring physics settling (dagre, 500ms)
- **Live events**: pulse animation on new nodes (1s fade)
- **Uncertainty**: slow opacity pulse (2s cycle, 0.6–1.0)
- **City view**: slow building height growth on load (1000ms stagger)
- **Novel nodes**: pink shimmer ring (3s loop)

### Inappropriate motion:
- No spinning loaders except initial page load
- No bounce animations
- No slide-in panels with elastic overshoot
- No parallax effects
- No continuous background animation that competes with content

---

## The Knowledge City / Ecology View

The Three.js overview is the signature visual. Design principles:

- **Districts** represent domain packs: drug_discovery, institutional_governance, industrial_operations
- **Building height** represents node count in that layer/area (evidence = tall buildings, sparse = low)
- **District color** is the primary layer color of that district's dominant layer
- **Bridges** between districts are literal glowing arcs when cross-domain connections exist
- **Novel/growth areas** have a pink glow emanating from them
- **Sparse areas** have a dim amber warning glow
- **Fog of uncertainty**: low-certainty zones have visible atmospheric haze

The city metaphor is not decorative. It communicates that:
- knowledge has geography (locality matters)
- different domains are different places (not collapsed together)
- bridges between domains are rare and valuable
- growth and decay are visible processes
- scale shifts are navigable (zoom in to see individual nodes)

---

## The Provenance Glow Effect

A key visual signature: when a node is selected or hovered, its provenance chain emits a visible "signal" — a traveling glow along edges back to source nodes. This communicates:

> "This claim did not appear from nowhere. It has a traceable lineage."

Implementation: CSS animation on edge opacity, traveling from target to source over 800ms.

---

## Contested Zones

When dissent records exist on a node or cluster, the surrounding area shows:
- amber edge highlighting
- a small dissent counter badge
- expanded on hover to show dissenting actor and rationale

The visual language of contested knowledge is intentionally different from error states. Disagreement is not a failure mode. It is the memory of genuine intellectual tension.

---

## Scale Shift Visual Grammar

Omega operates across scales: individual evidence fragments → mechanism chains → domain-level patterns → cross-domain ecology. The UI must make these scale shifts navigable:

- **Scroll/pinch in**: individual nodes, edge labels, provenance details
- **Scroll/pinch out**: cluster shapes, district boundaries, layer heatmaps
- **City view**: district-level patterns, bridge arcs, growth fronts
- **Overview panel**: domain pack comparison, cross-domain statistics

Each scale reveals different information. The visual language at each scale should be consistent but adapted — labels disappear at high zoom-out, shapes remain, district glow increases.

---

## Anti-patterns to Avoid

- **Node spaghetti as the default view**: the default view should be meaningful at first glance, not overwhelming. Start at district/layer level, not individual nodes.
- **Generic gradient backgrounds**: no purple-to-blue gradient hero sections.
- **Cute agent avatars**: agents are not assistants with faces. They are epistemic actors. Show calibration scores, authority scope, dissent records — not cartoon personas.
- **Loading spinners for everything**: skeleton states or progressive reveal are better.
- **Unexplained numbers**: every metric should have a tooltip explaining what it measures and why it matters.
- **Unlabeled edges**: every relationship type should be legible.
- **Flat panel lists**: hierarchy and layering should be visible in the layout.
