#!/usr/bin/env bash
#
# Reproducible web build for Cloudflare Pages.
#
# Produces a `dist/` folder laid out as:
#   dist/index.html          -> marketing landing page (castfishingapp.com/)
#   dist/app/index.html      -> the Expo web app       (castfishingapp.com/app/)
#   dist/app/_expo/...        -> app JS bundle (baseUrl "/app" makes the HTML
#                                reference /app/_expo/..., which matches here)
#   dist/_redirects          -> route /app/* to the SPA, everything else to marketing
#
# Cloudflare Pages settings that go with this script:
#   Build command:           npm run build
#   Build output directory:  dist
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Cleaning dist/"
rm -rf dist
mkdir -p dist

echo "==> Exporting Expo web app into dist/app (baseUrl /app)"
npx expo export --platform web --output-dir dist/app

echo "==> Copying marketing landing page + assets into dist/ root"
cp index.html              dist/index.html
cp marketing-style.css     dist/marketing-style.css
cp favicon.ico             dist/favicon.ico
[ -f robots.txt ]   && cp robots.txt   dist/robots.txt   || true
[ -f sitemap.xml ]  && cp sitemap.xml  dist/sitemap.xml  || true
# Google Search Console verification file(s), if present
for f in google*.html; do [ -e "$f" ] && cp "$f" dist/ || true; done
rm -rf dist/marketing
cp -r marketing dist/marketing

echo "==> Writing dist/_redirects (order matters: /app/* before the /* SPA fallback)"
cat > dist/_redirects <<'EOF'
/app/*  /app/index.html  200
/*      /index.html       200
EOF

echo "==> Done. dist/ contents:"
find dist -maxdepth 2 -type f | grep -v "_expo/static" | sort
