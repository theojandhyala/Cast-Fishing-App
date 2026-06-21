#!/usr/bin/env bash
#
# Reproducible web build for Cloudflare Pages.
#
# Architecture (simplified):
#   castfishingapp.com/          -> the Expo web app  (dist/index.html)
#   castfishingapp.com/_expo/... -> JS bundle
#   castfishingapp.com/marketing/-> marketing landing page
#   dist/_redirects              -> SPA fallback for all unknown paths
#
# The Expo app lives at the ROOT (no baseUrl prefix) which eliminates
# the dual-site /app/ routing complexity that was causing blank screens.
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Cleaning dist/"
rm -rf dist
mkdir -p dist

echo "==> Exporting Expo web app into dist/ (root, no baseUrl)"
npx expo export --platform web --output-dir dist

echo "==> Copying marketing assets into dist/marketing/"
mkdir -p dist/marketing
[ -f marketing-style.css ] && cp marketing-style.css dist/marketing-style.css || true
[ -f favicon.ico ]         && cp favicon.ico         dist/favicon.ico          || true
[ -f robots.txt ]          && cp robots.txt          dist/robots.txt           || true
[ -f sitemap.xml ]         && cp sitemap.xml         dist/sitemap.xml          || true
for f in google*.html; do [ -e "$f" ] && cp "$f" dist/ || true; done
cp -r marketing dist/marketing

echo "==> Writing dist/_redirects (SPA fallback)"
cat > dist/_redirects <<'EOF'
/*  /index.html  200
EOF

echo "==> Injecting loading spinner into dist/index.html"
python3 - <<'PYEOF'
import pathlib
p = pathlib.Path('dist/index.html')
html = p.read_text()
spinner = '''<style>
  body{background:#0A0E1A}
  #cast-loader{position:fixed;inset:0;background:#0A0E1A;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;transition:opacity .5s}
  #cast-loader.hidden{opacity:0;pointer-events:none}
  .cast-spin{width:44px;height:44px;border:3px solid rgba(0,212,170,.2);border-top-color:#00D4AA;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:18px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .cast-loader-text{color:#00D4AA;font-family:system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;opacity:.7}
  #cast-retry{display:none;flex-direction:column;align-items:center;gap:12px}
  #cast-retry-btn{background:#00D4AA;color:#0A0E1A;border:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:700;letter-spacing:1px;cursor:pointer}
  #cast-retry-msg{color:#8B95A7;font-family:system-ui,sans-serif;font-size:13px;text-align:center}
</style>
<div id="cast-loader">
  <div id="cast-spin-wrap"><div class="cast-spin"></div><div class="cast-loader-text">CAST</div></div>
  <div id="cast-retry">
    <div id="cast-retry-msg">Taking longer than expected</div>
    <button id="cast-retry-btn" onclick="window.location.reload()">Reload App</button>
  </div>
</div>
<script>
  // Capture JS errors and show reload button
  window.onerror=function(){showRetry();};
  window.addEventListener('unhandledrejection',function(){showRetry();});
  function showRetry(){
    var spin=document.getElementById('cast-spin-wrap');
    var retry=document.getElementById('cast-retry');
    if(spin)spin.style.display='none';
    if(retry)retry.style.display='flex';
  }
  // Hide spinner once React has mounted something into #root
  function checkMounted(){
    var root=document.getElementById('root');
    var loader=document.getElementById('cast-loader');
    if(!loader)return;
    if(root&&root.children.length>0){loader.classList.add('hidden');setTimeout(function(){loader.remove()},600);}
    else{setTimeout(checkMounted,100);}
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(checkMounted,200);});
  // After 12s with no mount, show reload button instead of blank
  setTimeout(function(){
    var root=document.getElementById('root');
    if(!root||root.children.length===0){showRetry();}
  },12000);
</script>'''
html = html.replace('</body>', spinner + '\n</body>', 1)
p.write_text(html)
print('  Spinner injected.')
PYEOF

echo "==> Done. dist/ contents:"
find dist -maxdepth 2 -type f | grep -v "_expo/static" | sort
