#!/usr/bin/env bash
#
# One-command production deploy for castfishingapp.com — no API tokens.
#
# Run this from the repo root on your own computer:
#
#     bash scripts/deploy-local.sh
#
# It authenticates via your browser (wrangler login), builds the web app,
# deploys it to Cloudflare Pages, applies the D1 migrations, and deploys the
# Worker (live-sessions API). Everything the GitHub Action does — but using
# your own logged-in browser session instead of the CLOUDFLARE_API_TOKEN
# secret, so it sidesteps the token entirely.
#
# Prerequisites: Node.js 20+, npm, and git already installed.
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 1/6  Making sure this is the latest code"
git fetch origin main --quiet || true
echo "    (on branch: $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD))"

echo "==> 2/6  Checking Cloudflare login"
if ! npx --yes wrangler whoami >/dev/null 2>&1; then
  echo "    Not logged in — opening your browser. Click 'Allow' in the page that appears."
  npx --yes wrangler login
fi
echo "    Logged in as: $(npx --yes wrangler whoami 2>/dev/null | grep -i 'associated with the email' || echo 'ok')"

echo "==> 3/6  Installing dependencies (npm ci)"
npm ci --no-audit --no-fund

echo "==> 4/6  Building the web app (220k spots, live-session UI, all fixes)"
npm run build

echo "==> 5/6  Deploying the site to Cloudflare Pages"
npx --yes wrangler pages deploy dist \
  --project-name cast-fishing-app \
  --branch main \
  --commit-dirty=true

echo "==> 6/6  Deploying the Worker + database (live sessions API)"
pushd worker >/dev/null
  echo "    Applying D1 migrations (creates live_sessions tables if missing)…"
  npx --yes wrangler d1 migrations apply cast-app --remote
  echo "    Deploying the Worker…"
  npx --yes wrangler deploy
popd >/dev/null

echo ""
echo "==> DONE. Verifying the live site…"
sleep 5
HTTP=$(curl -o /dev/null -s -w '%{http_code}' https://castfishingapp.com/ || echo "000")
API=$(curl -o /dev/null -s -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' https://cast-ai.theojandhyala.workers.dev/sessions || echo "000")
echo "    Site  https://castfishingapp.com/  -> HTTP $HTTP   (expect 200)"
echo "    API   POST /sessions               -> HTTP $API   (expect 401 = live-sessions API is up)"
echo ""
echo "Open https://castfishingapp.com and go to the Spots tab — you should see 220,585 locations."
