# Omega Backport Plan

*What to bring back from the Cross Labs KOS fork into the neutral Omega codebase.*
*April 2026.*

---

## Principle

Omega is the white-label, neutral, general-purpose demonstration layer. The Cross Labs fork adds branding, domain packs, and ALife visual motifs specific to Cross Labs. The backport extracts only the functional improvements — those that make the product better regardless of brand.

**Do not backport:** Cross Labs logos, bronze/gold color scheme, Olaf Witkowski attribution, private-preview markers, any Cross Labs-specific copy or domain narrative framing.

**Do backport:** stronger data, better component richness, improved visual modes that are brand-neutral, new domain content that is publicly safe and generally useful.

---

## Backport Item 1: Craft Tacit Knowledge Domains

**Source:** Cross Labs fork `frontend/src/api/demoData.ts`
**Target:** Omega `frontend/src/api/demoData.ts`

Add two new domain fixtures:
- `kintsugi_restoration` — traditional lacquer repair as a tacit knowledge case
- `fermentation_craft` — process judgment as tacit knowledge

These are public, non-NDA, pedagogically clear demonstrations of the tacit capture concept. They belong in Omega because they strengthen the tacit knowledge argument without any client association.

**Content to add:**
- 4–6 evidence nodes per domain (sourced from Polanyi, Nonaka, ethnographic studies of craft)
- 2–3 knowledge nodes (tacit judgment mechanisms with low codifiability markers)
- 1–2 context nodes (decision points in a restoration or fermentation process)
- 1 tacit trace in TacitTraceViewer demo data

**Impact:** Omega gains a demonstrable case where the tacit capture argument is maximally clear, without any governance-failure overlay that might distract from the core capability.

---

## Backport Item 2: Industrial Quality Control Domain Enrichment

**Source:** Cross Labs fork extended domain pack
**Target:** Omega `frontend/src/api/demoData.ts` — existing `industrial_quality_control` domain

The existing industrial_quality_control fixture has 3 evidence nodes and 2 knowledge nodes. Enrich with:
- SPC drift detection trace (process control as tacit knowledge)
- Andon cord activation decision trace (authority to halt production)
- Defect pattern mechanism (process drift → quality failure cascade)

These are source-grounded (Shewhart, Toyota TPS) and add richness to a domain that is currently thin.

---

## Backport Item 3: Improved ExpertTwin Calibration History Display

**Source:** Cross Labs fork `frontend/src/components/ExpertTwinView.tsx` improvements
**Target:** Omega `frontend/src/components/ExpertTwinView.tsx`

Add calibration history display:
- Show last 5 significant decisions with outcome (vindicated / overruled / inconclusive)
- Show vindication rate as computed value (decisions vindicated / total contested decisions)
- Show domain envelope: explicit list of domains where this agent is and is not authoritative
- Show dissent count separately from calibration score

These improvements apply regardless of branding. They make the Expert Twin view look like accumulated track record rather than a generated profile. This is the single most important component to strengthen for investor demos.

---

## Backport Item 4: ResearchTrace ARC Grounding Indicators

**Source:** Cross Labs fork improvements to `frontend/src/components/ResearchTraceView.tsx`
**Target:** Omega `frontend/src/components/ResearchTraceView.tsx`

Add grounding tier badges to every trace item:
- `SG` (source-grounded) — primary document, DOI available
- `HY` (hybrid) — real domain, synthesized content
- `AS` (arc-synthesized) — ARC batch output, not primary source
- `SC` (speculative construct) — plausible but not sourced

This was identified in the v8 investor review as a required honesty improvement. The badges signal research-grade rigor, which is more trustworthy than unlabeled content. Same logic applies to Omega.

---

## Backport Item 5: ALife-Inspired Breathing Pulse in GraphEvolutionTimeline

**Source:** Cross Labs fork `frontend/src/components/GraphEvolutionTimeline.tsx` animated novelty indicators
**Target:** Omega `frontend/src/components/GraphEvolutionTimeline.tsx`

Add a subtle pulsing animation to pending GraphChangeProposal nodes in the timeline. The pulse signals "this is a live proposal subject to governance" rather than "this is a static display item." The animation is brand-neutral — it uses the existing indigo color scheme in Omega.

This is a 10-line CSS animation change with meaningful semantic impact.

---

## Backport Item 6: Serendipity Panel — Pattern Strength Bars

**Source:** Cross Labs fork `frontend/src/components/SerendipityPanel.tsx` visual improvements
**Target:** Omega `frontend/src/components/SerendipityPanel.tsx`

Add visual confidence bars to each serendipity bridge, showing:
- Structural similarity score (how close the mechanism graphs are)
- Evidentiary support (how many source-grounded evidence nodes support the bridge)
- Historical instances count (how many independent domain examples instantiate the pattern)

Currently the panel shows text descriptions. The confidence bars make the epistemic content visually legible.

---

## What Is NOT Backported

| Cross Labs Feature | Why Not Backported |
|---|---|
| Bronze/gold color scheme (`#b5893f`) | Cross Labs-specific brand identity |
| Cross Labs KOS logo and glyph | Cross Labs identity |
| "by Cross Labs" attribution | Cross Labs identity |
| "Research & Development by Olaf Witkowski" | Attribution for Cross Labs fork only |
| Private preview badge | Cross Labs-specific deployment marker |
| ALife field background animation on landing | Too specific to Cross Labs ALife identity |
| Cross Labs-specific domain narratives | Branded framing |

Omega should remain visually neutral — deep navy background, indigo accent (`#6366f1`), white/slate text — so it can be re-branded for any deployment context without conflicts.

---

## Backport Schedule

| Item | Priority | Effort | Status |
|---|---|---|---|
| ExpertTwin calibration history | P1 | 2h | In this sprint |
| Craft domain data (kintsugi, fermentation) | P1 | 3h | In this sprint |
| ResearchTrace grounding badges | P2 | 1h | In this sprint |
| Industrial QC domain enrichment | P2 | 2h | In this sprint |
| GraphEvolution pulse animation | P3 | 0.5h | Deferred |
| Serendipity pattern strength bars | P3 | 1.5h | Deferred |

---

*End of backport plan.*
