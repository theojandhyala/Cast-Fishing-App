# Resubmit CAST — run this top to bottom

Everything in the code is done and on `main`. These are the steps only you can
do (they need your Apple, RevenueCat and Cloudflare logins).

```bash
git checkout main && git pull origin main && npm ci
```

---

## Decision first: are you selling CAST Pro in this build?

**Yes — sell Pro (needs ~15 min of RevenueCat setup).** Do step 1.
**No — ship free now, monetise in 1.1.** Skip step 1, and in App Store Connect
**remove the three CAST Pro items** (subscription group + Monthly + Annual)
from the submission. The app is compliant either way; it simply shows no
purchase screen without a key.

---

## 1. RevenueCat  (only if selling Pro)

At <https://app.revenuecat.com>:
- New project → add iOS app, bundle id **com.cast.fishingapp**
- Paste your **App Store Connect shared secret** (for receipt validation)
- Create entitlement with identifier exactly **`pro`**
- Create the default **Offering** with two packages → **Monthly** = `CAST Pro Monthly`,
  **Annual** = `CAST Pro Annual`; attach both to `pro`
- Copy the **iOS public SDK key** (starts `appl_`)

```bash
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_API_KEY --value appl_XXXXXXXX
eas secret:list      # confirm it is there
```

> If your entitlement is not literally `pro`, change `PRO_ENTITLEMENT` in
> `services/purchases.ts`.

## 2. Deploy the website — required before review

The Privacy Policy and Terms URLs must resolve or review fails.

```bash
bash scripts/deploy-local.sh          # browser login, no API token needed
```

Then open both and confirm they load:
- <https://castfishingapp.com/privacy.html>
- <https://castfishingapp.com/terms.html>

## 3. Preflight

```bash
bash scripts/preflight-appstore.sh    # must print "blockers: 0"
```

## 4. Build

```bash
eas build -p ios --profile production   # auto-bumps to 1.0(9)
```

## 5. TEST THE PURCHASE — do not skip  (only if selling Pro)

StoreKit cannot be tested on web or in CI, and a purchase that fails in review
is itself a rejection. Install the build on a device, sign out of the App Store
and sign in with a **Sandbox Apple ID**
(App Store Connect → Users and Access → Sandbox Testers), then check:

- [ ] both plans show a **real price from the store**
- [ ] buying completes and Pro unlocks
- [ ] delete + reinstall → **Restore membership** brings Pro back
- [ ] cancelling the purchase sheet leaves the app working normally

## 6. App Store Connect

- App Information → **Privacy Policy URL** = `https://castfishingapp.com/privacy.html`
- Each subscription needs a localised display name, description and review screenshot
- Subscription group needs a rank order
- **App Review Information** → provide a demo account (email + password) and note:
  *"CAST Pro is sold via Apple In-App Purchase. Sandbox purchase verified."*

## 7. Submit

```bash
eas submit -p ios
```
Then in App Store Connect: **Resubmit to App Review**.

---

### What was fixed since the rejection
Rejection was **3.1.2 Business: Payments – Subscriptions**.

- iOS now purchases through **Apple In-App Purchase** (RevenueCat); the external
  Stripe checkout is unreachable on iOS from any path. Web/Android keep Stripe.
- Added the **Terms of Use** and **Privacy Policy** links Apple requires next to a
  subscription — the app had neither, anywhere. Both pages now exist.
- **Restore membership** performs a genuine StoreKit restore (it previously just
  re-read our own server).
- Plans show the **live localised store price** instead of hardcoded £4.99/£29.99.
- Payment-provider branding removed from all user-facing copy.
- (Earlier) in-app **Delete Account**, required by guideline 5.1.1(v).

Full detail: `docs/APP_STORE_RESUBMISSION.md`
