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

echo "==> Injecting loading spinner into dist/app/index.html"
python3 - <<'PYEOF'
import re, pathlib
p = pathlib.Path('dist/app/index.html')
html = p.read_text()
spinner = '''<style>
  #cast-loader{position:fixed;inset:0;background:#0A0E1A;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;transition:opacity .4s}
  #cast-loader.hidden{opacity:0;pointer-events:none}
  .cast-spin{width:44px;height:44px;border:3px solid rgba(0,212,170,.2);border-top-color:#00D4AA;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:18px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .cast-loader-text{color:#00D4AA;font-family:system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;opacity:.7}
</style>
<div id="cast-loader"><div class="cast-spin"></div><div class="cast-loader-text">CAST</div></div>
<script>
  window.addEventListener('load',function(){var l=document.getElementById('cast-loader');if(l){l.classList.add('hidden');setTimeout(function(){l.remove()},500);}});
</script>'''
# Insert just before </body>
html = html.replace('</body>', spinner + '\n</body>', 1)
p.write_text(html)
print('  Spinner injected.')
PYEOF

echo "==> Done. dist/ contents:"
find dist -maxdepth 2 -type f | grep -v "_expo/static" | sort
