# Deploy CAST to castfishingapp.com — task prompt for a Claude agent

Copy everything below the line into a Claude session that has this repo checked out
and can run shell commands + the GitHub tools. It is self-contained.

---

You are deploying the CAST fishing app (repo `theojandhyala/cast-fishing-app`) to
production at **castfishingapp.com**. All the code is already written, committed, and
merged to the `main` branch. Your ONLY job is to get the current `main` live and prove
it worked. Do not build new features. Do not rewrite anything.

## What "live" means (two deploy targets, same Cloudflare account)
1. **The site (Cloudflare Pages, project `cast-fishing-app`)** — this is what makes the
   220,585 fishing spots and all UI appear. Highest priority.
2. **The Worker + D1 (`cast-ai` worker, `cast-app` D1 database)** — powers live friend
   sessions. Migrations in `worker/migrations/` (incl. `0003_live_sessions.sql`) must be
   applied, then the worker deployed.

## CRITICAL CONTEXT — read before doing anything
Every GitHub Actions deploy has failed for one reason only: the repo secret
`CLOUDFLARE_API_TOKEN` is an **invalid Cloudflare API token**. Verified directly against
Cloudflare's own endpoint — it returns `valid: False | code 1000 Invalid API Token`.
Re-running / dispatching the workflow does NOT help, because the token is the problem,
not the trigger. So:

- **Do NOT just dispatch the workflow and hope.** First establish whether the token is
  valid. Only dispatch if it verifies as valid.
- Cloudflare shows an API token's real value **only once, at creation**. If the user
  "edited permissions" or "rolled" an existing token, the value in GitHub is stale/dead.

## Decision procedure (follow in order)

### Step 1 — Check if the GitHub secret token is now valid
Trigger the worker deploy workflow (it has a step that verifies the token against
Cloudflare and prints `valid: True/False` without revealing the token):
- Use the GitHub tool to run workflow `deploy-worker.yml` on `main`
  (`actions_run_trigger` → `run_workflow`).
- Wait ~90s, then read the "Verify token" step log
  (`actions_list` → `list_workflow_jobs`, then `get_job_logs` with `return_content`).
- If it prints `valid: True` → the token works. Go to Step 2.
- If it prints `valid: False` (code 1000) → the token is still dead. Go to Step 3.

### Step 2 — Token is valid: deploy both targets via GitHub Actions
- Dispatch `deploy.yml` on `main` (site → Cloudflare Pages). Wait for it to complete
  green. Its built-in health check verifies the live HTML serves this commit's bundle
  hash and that React mounts.
- Dispatch `deploy-worker.yml` on `main` (worker + D1 migrations) — it should now pass
  its health gate (`POST /sessions` returns 401 = live-sessions API is up).
- Report both run URLs and their green status. DONE.

### Step 3 — Token is dead: do NOT loop. Deploy locally with browser login instead.
If you are running on the user's own machine (can open a browser), run:
```bash
git pull origin main
bash scripts/deploy-local.sh
```
`scripts/deploy-local.sh` already exists in the repo. It uses `wrangler login`
(browser-based, NO token) to deploy Pages + the worker + migrations, then curls the live
site and API and prints the result. This sidesteps the token entirely.

If you are NOT on the user's machine (e.g. a sandbox that cannot reach Cloudflare or open
a browser), STOP and tell the user exactly this, with no filler:
> The GitHub `CLOUDFLARE_API_TOKEN` secret is still an invalid token, so GitHub deploys
> can't work. Fix it once: go to https://dash.cloudflare.com/profile/api-tokens →
> Create Token → Create Custom Token → permissions **Workers Scripts: Edit**, **D1: Edit**,
> **Cloudflare Pages: Edit** → Create Token → **copy the value shown on that screen**
> (Cloudflare only shows it once) → paste it into the GitHub repo secret
> `CLOUDFLARE_API_TOKEN` → do not edit/roll the token afterward. Then say "done".
> Or, on your own computer: `git pull origin main && bash scripts/deploy-local.sh`.

## Verify success (whichever path)
- `curl -s -o /dev/null -w '%{http_code}' https://castfishingapp.com/` → expect **200**.
- `curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' https://cast-ai.theojandhyala.workers.dev/sessions` → expect **401** (proves the
  new live-sessions API is deployed; 404/405 means the old worker is still live).
- Confirm the site loads and the Spots tab shows **220,585 locations**.
- Report exactly what you verified. Do not claim success without these checks passing.

## Reference facts
- Cloudflare account ID: `0e58fe4a2ba9eabd4aa4e029b8b5ed85`
- D1 database name: `cast-app`, id `0c202650-a68f-4e3e-9680-e0043af70f9d`
- Pages project: `cast-fishing-app`; Worker: `cast-ai`; production branch: `main`
- Build command: `npm run build` (= `scripts/build-web.sh`); output dir: `dist`
