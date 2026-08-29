#!/usr/bin/env bash
#
# Put CAST on your iPhone — run this on your Mac.
#
#   bash scripts/run-on-device.sh
#
# WHY YOU CANNOT USE EXPO GO
# CAST now uses native modules (in-app purchases, Sign in with Apple). Expo Go
# is a prebuilt app and cannot contain them, so launching through Expo Go gives:
#     "Purchases" plugin is not implemented on ios   (reason=configure-failed)
# You need a *development build* — an app compiled from this project. That is
# what this script makes.
#
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$(uname)" != "Darwin" ]; then
  echo "This must run on macOS with Xcode installed." >&2
  exit 1
fi

echo "==> 1/4  Dependencies"
npm ci

echo "==> 2/4  Generating the native iOS project"
# --clean so stale native config (plugins, entitlements) cannot linger.
npx expo prebuild -p ios --clean

echo "==> 3/4  Installing CocoaPods (links the native modules)"
npx pod-install

echo "==> 4/4  Building and launching on your connected iPhone"
echo "    If signing fails, open the workspace and set your Team once:"
echo "      open ios/*.xcworkspace   ->  Signing & Capabilities -> Team"
npx expo run:ios --device --configuration Release

cat <<'NOTE'

Done. If this is the first build on that iPhone:
  Settings -> General -> VPN & Device Management -> trust your developer certificate

Notes on the two native features:
  * Sign in with Apple works once the App ID has the capability enabled.
    app.json already sets ios.usesAppleSignIn, so prebuild adds the entitlement.
  * In-app purchases need EXPO_PUBLIC_REVENUECAT_API_KEY at build time, e.g.
      EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxx bash scripts/run-on-device.sh
    Without it the plan step simply says plans are unavailable — the rest of
    CAST still works.
  * Sandbox purchases only work when signed into a Sandbox Apple ID
    (App Store Connect -> Users and Access -> Sandbox Testers).
NOTE
