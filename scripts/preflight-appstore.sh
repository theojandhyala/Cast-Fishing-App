#!/usr/bin/env bash
#
# Pre-submission check for the App Store.
#
#   bash scripts/preflight-appstore.sh
#
# Verifies the things that got CAST 1.0 rejected, plus the setup that must be
# in place before you press submit. Exits non-zero if a blocker is found.
#
cd "$(dirname "$0")/.."
pass=0; fail=0; warn=0
ok()   { echo "  [ok]   $1"; pass=$((pass+1)); }
bad()  { echo "  [FAIL] $1"; fail=$((fail+1)); }
note() { echo "  [warn] $1"; warn=$((warn+1)); }

echo ""
echo "CAST — App Store preflight"
echo "=========================="

echo ""
echo "1. Payments compliance (guideline 3.1.2)"
if grep -q "canPurchaseOnThisPlatform" components/paywall/ProPaywall.tsx; then
  ok "paywall is platform-gated"
else
  bad "paywall is NOT platform-gated — external checkout may be reachable on iOS"
fi
if grep -qE "Linking\.openURL\(checkoutUrl\)" components/paywall/ProPaywall.tsx && \
   ! grep -q "if (useStore)" components/paywall/ProPaywall.tsx; then
  bad "external checkout is not behind the in-app-purchase path"
else
  ok "external checkout cannot run on the in-app-purchase path"
fi
# Only user-visible text matters: ignore the `stripeConfigured` API field and
# source comments, which a reviewer never sees.
if grep -i "stripe" components/paywall/ProPaywall.tsx \
     | grep -v "stripeConfigured" \
     | grep -vE "^[0-9]*:?[[:space:]]*(//|\*|/\*)" | grep -q .; then
  bad "user-facing payment-provider branding still present in the paywall"
else
  ok "no external payment provider named in user-facing paywall text"
fi

echo ""
echo "2. Required subscription disclosures"
grep -q "LEGAL_LINKS.terms"   components/paywall/ProPaywall.tsx && ok "Terms of Use link present"   || bad "Terms of Use link MISSING"
grep -q "LEGAL_LINKS.privacy" components/paywall/ProPaywall.tsx && ok "Privacy Policy link present" || bad "Privacy Policy link MISSING"
grep -q "restoreProPurchases" components/paywall/ProPaywall.tsx && ok "real StoreKit restore wired" || bad "restore purchases MISSING"
[ -f privacy.html ] && ok "privacy.html exists" || bad "privacy.html missing"
[ -f terms.html ]   && ok "terms.html exists"   || bad "terms.html missing"

echo ""
echo "3. Account deletion (guideline 5.1.1(v))"
grep -q "deleteAccount" store/authStore.ts && grep -q "Delete Account" app/settings.tsx \
  && ok "in-app account deletion present" || bad "in-app account deletion MISSING"

echo ""
echo "4. In-app purchase setup"
if [ -n "${EXPO_PUBLIC_REVENUECAT_API_KEY:-}" ]; then
  ok "RevenueCat key present in this shell — iOS will SELL CAST Pro"
  echo "         -> keep the CAST Pro subscriptions in the submission"
else
  note "no RevenueCat key in this shell."
  echo "         If it is set as an EAS secret, the build will still sell Pro:"
  echo "           eas secret:list"
  echo "         If you are NOT shipping purchases yet, REMOVE the CAST Pro"
  echo "         subscription items from the App Store submission, or review fails."
fi
grep -q '"react-native-purchases"' package.json && ok "react-native-purchases installed" || bad "react-native-purchases NOT installed"

echo ""
echo "5. Build health"
if npx tsc --noEmit >/dev/null 2>&1; then ok "typecheck clean"; else bad "typecheck has errors — run: npx tsc --noEmit"; fi
grep -q '"appVersionSource"' eas.json && ok "eas appVersionSource set (build number auto-increments)" || note "eas appVersionSource unset — EAS may prompt during build"

echo ""
echo "6. Live website (Privacy/Terms must resolve for review)"
for u in https://castfishingapp.com/privacy.html https://castfishingapp.com/terms.html; do
  code=$(curl -o /dev/null -s -w '%{http_code}' --max-time 12 "$u" 2>/dev/null) || code="000"
  [ -z "$code" ] && code="000"
  if [ "$code" = "200" ]; then ok "$u -> 200"
  elif [ "$code" = "000" ]; then note "$u not reachable from this machine — open it in a browser to confirm"
  else bad "$u -> HTTP $code  (deploy the site: bash scripts/deploy-local.sh)"; fi
done

echo ""
echo "=========================="
echo "passed: $pass   warnings: $warn   blockers: $fail"
echo ""
if [ "$fail" -gt 0 ]; then
  echo "Fix the blockers above before submitting."
  exit 1
fi
echo "No blockers. Remaining manual steps are in docs/APP_STORE_RESUBMISSION.md:"
echo "  1) deploy site      bash scripts/deploy-local.sh"
echo "  2) build            eas build -p ios --profile production"
echo "  3) TEST the purchase on a device with a Sandbox Apple ID"
echo "  4) submit           eas submit -p ios"
