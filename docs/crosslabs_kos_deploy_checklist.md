# Cross Labs KOS — Deployment Checklist

*Target: `kos.crosslabs.org` (preferred) or `kos-labs.crosslabs.org`*
*Deployment mode: private/unlisted, frontend-only demo mode is acceptable*

---

## Status as of April 2026

**What is deployable now:**
- Frontend (React/TypeScript/Vite) — fully functional in demo mode, no backend required
- All 22 components operational with embedded demo data
- Build produces static files deployable to any CDN or Vercel project

**What requires additional work:**
- Backend (FastAPI + Neo4j) — stub only, not deployable as a live service
- DNS configuration for `kos.crosslabs.org` — requires access to Cross Labs DNS
- Vercel project creation under Cross Labs account — requires Vercel access

**Approach:** Deploy the frontend as a standalone static site in demo mode. The demo mode is labeled and honest. The full experience is available without a live backend.

---

## Repository Setup

### Option A: Separate repo (recommended)
```
github.com/crosslabs/kos   (private)
├── frontend/              # Cross Labs branded React app
├── backend/               # FastAPI stub (for future activation)
└── docs/                  # Cross Labs-specific documentation
```

1. Create new private repo at `github.com/crosslabs/kos`
2. Push the Cross Labs fork from `/Users/okw/Code/crosslabs/kos/`
3. Set repo visibility: **Private**
4. Do NOT connect to the main Omega repo — they must remain separate

### Option B: Branch in existing Omega repo
If a separate repo is not possible immediately:
1. Create branch `crosslabs-fork` from `master`
2. Apply all Cross Labs branding changes on this branch
3. Configure separate Vercel project pointing to this branch
4. Mark the branch as "protected" to prevent accidental merges back to `master`

---

## Environment Variables

### Frontend (`.env.production` or Vercel environment)

```bash
# Required for Cross Labs build identity
VITE_APP_NAME="KOS by Cross Labs"
VITE_APP_BUILD="2026.04"
VITE_VARIANT="crosslabs"
VITE_ATTRIBUTION="Research & Development by Olaf Witkowski, Cross Labs"
VITE_PRIVATE_PREVIEW=true

# Backend (optional — demo mode works without it)
VITE_API_URL=https://kos-api.crosslabs.org

# Analytics (optional)
# VITE_POSTHOG_KEY=...
```

### Backend (if activating later)
```bash
NEO4J_URI=bolt://...
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...
CHROMADB_HOST=...
CHROMADB_PORT=8001
OPENAI_API_KEY=...  # for embedding sidecar
```

---

## Vercel Deployment Steps

### 1. Create Vercel project (one-time)

```bash
# From /Users/okw/Code/crosslabs/kos/frontend/
npx vercel --name kos-crosslabs --private
```

Or via Vercel dashboard:
- New Project → Import `github.com/crosslabs/kos`
- Root Directory: `frontend`
- Framework: Vite
- Build command: `bun run build`
- Output directory: `dist`
- Set environment variables from above

### 2. Configure domains

In Vercel project settings → Domains:
- Add `kos.crosslabs.org`
- Add `kos-labs.crosslabs.org` (alias)

DNS records to add at Cross Labs DNS registrar:
```
CNAME  kos              cname.vercel-dns.com
CNAME  kos-labs         cname.vercel-dns.com
```

### 3. Deploy

```bash
cd /Users/okw/Code/crosslabs/kos/frontend
bun install
bun run build
vercel deploy --prod
```

Or push to `main` branch if Vercel is connected to the repo.

---

## Build Identity Verification

Before any public-facing demo, verify:

```bash
# Check build output
grep -r "Cognisee\|Sony\|PRI\|client" dist/ --include="*.js" --include="*.html"
# Must return no results

# Check build stamp appears
grep "Cross Labs" dist/index.html
# Must show: <title>KOS — Knowledge Operating System by Cross Labs</title>
```

---

## Branding Checklist (Pre-Deploy)

- [ ] `<title>` in `index.html`: `KOS — Knowledge Operating System by Cross Labs`
- [ ] Landing page shows: `KOS — Knowledge Operating System`
- [ ] Landing page shows: `by Cross Labs`
- [ ] Footer shows: `Research & Development by Olaf Witkowski`
- [ ] Build stamp shows: `KOS by Cross Labs · private preview · build 2026.04`
- [ ] No "Omega" branding in visible UI (Omega is the backend codename, not the Cross Labs product name)
- [ ] No "Cognisee", "Sony", "PRI", or any enterprise client name in any visible string
- [ ] All domain labels use public or generalized names only
- [ ] Demo mode indicator shows when backend is not connected
- [ ] Attribution line visible in footer (tasteful, not prominent)
- [ ] Private preview badge in header

---

## Keeping Omega and Cross Labs KOS Separate

| Property | Omega | Cross Labs KOS |
|---|---|---|
| Repo | `github.com/ookwrd/kos` | `github.com/crosslabs/kos` (private) |
| Domain | Not publicly promoted | `kos.crosslabs.org` |
| Brand name | Omega / KOS (codename) | KOS — Knowledge Operating System |
| Color scheme | Deep navy + indigo (`#6366f1`) | Deep midnight + bronze (`#b5893f`) |
| Attribution | None prominent | Olaf Witkowski, Cross Labs |
| Domains | All public domains | + industrial/craft packs |
| Visibility | Open for collaboration | Private / unlisted |
| Vercel project | `omega-kos` | `kos-crosslabs` |

**Never merge Cross Labs branding back into Omega.** Improvements to functionality may be backported; branding must not cross.

---

## One-Command Local Preview

```bash
cd /Users/okw/Code/crosslabs/kos/frontend
bun install
bun run dev
# → http://localhost:5174 (Cross Labs fork on different port than Omega)
```

In `vite.config.ts`, Cross Labs fork uses port 5174 to avoid conflict with Omega at 5173.

---

## Deployment Readiness Summary

| Component | Ready now | Needs work |
|---|---|---|
| Frontend demo mode | ✓ | |
| Cross Labs branding | ✓ (in this fork) | |
| Build stamp | ✓ | |
| Attribution | ✓ | |
| Industrial domain pack | ✓ | |
| Craft domain pack | ✓ | |
| DNS configuration | | Requires Cross Labs DNS access |
| Vercel project creation | | Requires Vercel account access |
| Live backend | | Backend stub only — future work |
| Neo4j data ingestion | | Future work |
| Calibration computation | | Future work |

**The frontend is deployable today** in demo mode. The one-command deploy is `vercel deploy --prod` once a Vercel project exists for `crosslabs/kos`. Everything else is future infrastructure work.

---

*End of deployment checklist.*
