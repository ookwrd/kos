# Deployment Reality Check v3

*Run: 2026-04-28*

## Omega

| Field | Value |
|---|---|
| local path | `/Users/okw/Code/codex/universal/kos/` |
| git repo | `https://github.com/ookwrd/kos.git` |
| branch | `master` |
| latest local commit | `60c0416` feat(v9): substrate growth workflow, craft domains, ExpertTwin calibration history |
| pushed commit | `60c0416` (pushed to `origin/master`) |
| local build status | ✓ clean (`tsc && vite build` passes, 2.1MB JS) |
| Vercel project name | `frontend` |
| Vercel project ID | `prj_T8bk1JfzKtrsjtxg3JmdeWWencgi` |
| production URL | https://kos-omega.vercel.app |
| latest deployment URL | https://frontend-7efuz9q4x-olafwitkowskis-projects.vercel.app |
| deployed build stamp | `index-DyngN2IG.js` (matches local dist) |
| graph loads without backend? | ✓ yes — `useGraphData` falls back to `DEMO_OVERVIEW` on API error; `demoMode` indicator shown |
| visible branding correct? | ✓ "Omega · Knowledge Operating System · v8" |
| confidential-name scan passed? | ✓ PASS — one leak found and fixed (LandingView "Cross Labs × Cognisee") |

## Cross Labs KOS

| Field | Value |
|---|---|
| local path | `/Users/okw/Code/crosslabs/kos/` |
| git repo | not initialized (no `.git`) |
| branch | n/a |
| latest local commit | n/a |
| pushed commit | n/a |
| local build status | ✓ clean (`tsc && vite build` passes, 2.1MB JS) |
| Vercel project name | `kos-crosslabs` |
| Vercel project ID | `prj_cnMlXbR1L91rb3sV2u0EfYAE9tka` |
| production URL | https://kos-crosslabs.vercel.app |
| latest deployment URL | `kos-crosslabs-970z2im3v-olafwitkowskis-projects.vercel.app` (deployed 2026-04-27) |
| deployed build stamp | title verified: "KOS — Knowledge Operating System by Cross Labs" |
| graph loads without backend? | ✓ yes — same fallback wired |
| visible branding correct? | ✓ "KOS by Cross Labs · private preview" |
| confidential-name scan passed? | ✓ PASS — no Sony/PRI/Cognisee in source or docs |

## Remaining blockers

| Blocker | Severity | Notes |
|---|---|---|
| Cross Labs git repo not initialized | medium | Cannot push or version-control the fork. Run `git init && git remote add origin <repo>` |
| Cross Labs substrate growth workflow not yet deployed | medium | The v9 commit workflow exists in Omega but not yet copied to Cross Labs fork |
| `kos-omega.vercel.app` Vercel project named "frontend" | low | Works fine but cosmetically confusing. Can rename in Vercel dashboard |
| Vercel CLI socket drop on upload | low | Workaround: curl-based REST upload works reliably |
