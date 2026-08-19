#!/usr/bin/env bash
#
# Reproducible web build for Cloudflare Pages (castfishingapp.com).
#
# Layout:
#   castfishingapp.com/          -> the Expo web app (dist/index.html)
#   castfishingapp.com/_expo/... -> JS bundle
#   castfishingapp.com/fonts/... -> icon + Inter fonts (required: the app
#                                   registers @font-face for these at runtime)
#   castfishingapp.com/marketing -> marketing landing page (if present)
#   dist/_redirects              -> SPA fallback for all unknown paths
#   dist/_headers                -> no-cache for HTML so deploys show instantly
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Cleaning dist/"
rm -rf dist
mkdir -p dist

echo "==> Exporting Expo web app into dist/ (root, no baseUrl)"
npx expo export --platform web --output-dir dist

echo "==> Copying fonts (icons render as squares without these)"
mkdir -p dist/fonts
cp node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf dist/fonts/material-community.ttf
cp node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf dist/fonts/inter-400.ttf
cp node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf dist/fonts/inter-600.ttf
cp node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf dist/fonts/inter-700.ttf

echo "==> Copying marketing + root assets (when present)"
[ -f marketing-style.css ] && cp marketing-style.css dist/marketing-style.css || true
[ -f favicon.ico ]         && cp favicon.ico         dist/favicon.ico          || true
[ -f robots.txt ]          && cp robots.txt          dist/robots.txt           || true
[ -f sitemap.xml ]         && cp sitemap.xml         dist/sitemap.xml          || true
for f in google*.html; do [ -e "$f" ] && cp "$f" dist/ || true; done
[ -f privacy.html ] && cp privacy.html dist/privacy.html || true
[ -f terms.html ]   && cp terms.html   dist/terms.html   || true
[ -d marketing ] && cp -r marketing dist/marketing || true

echo "==> Writing dist/_redirects (SPA fallback)"
cat > dist/_redirects <<'EOF'
/*  /index.html  200
EOF

echo "==> Writing dist/_headers (no-cache for HTML)"
cat > dist/_headers <<'EOF'
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache

/
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
EOF

echo "==> Injecting dark background + loading spinner into dist/index.html"
python3 - <<'PYEOF'
import pathlib
p = pathlib.Path('dist/index.html')
html = p.read_text()

# 1. Dark background in <head>, before any JS executes — fixes the white
#    flash on slow connections and on iOS Safari.
head_css = '''<style>
  html,body,#root{background:#0A0E1A!important}
  html{min-height:-webkit-fill-available;min-height:100%}
  body{min-height:-webkit-fill-available;min-height:100%}
</style>
<script>
  document.documentElement.style.setProperty('background','#0A0E1A','important');
  document.addEventListener('DOMContentLoaded',function(){
    document.body.style.setProperty('background','#0A0E1A','important');
    document.documentElement.style.setProperty('background','#0A0E1A','important');
  });
</script>'''
html = html.replace('</head>', head_css + '\n</head>', 1)
html = html.replace('<body>', '<body style="background:#0A0E1A">', 1)

# 2. Loading spinner + error recovery before </body>.
spinner = '''<style>
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
  window.onerror=function(msg,src,line,col,err){showRetry('JS error: '+(err?err.message:msg));return false;};
  window.addEventListener('unhandledrejection',function(e){showRetry('Promise error: '+(e.reason&&e.reason.message?e.reason.message:String(e.reason)));});
  function showRetry(detail){
    var spin=document.getElementById('cast-spin-wrap');
    var retry=document.getElementById('cast-retry');
    var msg=document.getElementById('cast-retry-msg');
    if(spin)spin.style.display='none';
    if(retry)retry.style.display='flex';
    if(detail&&msg)msg.textContent=detail;
  }
  function checkMounted(){
    var root=document.getElementById('root');
    var loader=document.getElementById('cast-loader');
    if(!loader)return;
    if(root&&root.children.length>0){loader.classList.add('hidden');setTimeout(function(){loader.remove()},600);}
    else{setTimeout(checkMounted,100);}
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(checkMounted,200);});
  setTimeout(function(){
    var root=document.getElementById('root');
    if(!root||root.children.length===0){showRetry('App took too long \\u2014 tap to reload');}
  },12000);
</script>'''
html = html.replace('</body>', spinner + '\n</body>', 1)
p.write_text(html)
print('  Dark background + spinner injected.')
PYEOF

echo "==> Done. dist/ top-level:"
find dist -maxdepth 2 -type f | grep -v "_expo/static" | sort
