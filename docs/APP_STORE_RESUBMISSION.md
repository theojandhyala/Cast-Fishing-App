# CAST — App Store resubmission checklist

Version 1.0 (build 8) was rejected under **Guideline 3.1.2 — Business: Payments,
Subscriptions**, because the paywall opened an external Stripe checkout and did
not present the disclosures Apple requires for an auto-renewing subscription.

## What was fixed in code

| Rejection cause | Fix |
|---|---|
| External (Stripe) checkout for a subscription on iOS | iOS now purchases through Apple In-App Purchase via RevenueCat. `subscribe()` and `manageBilling()` also hard-return on iOS so no external checkout can be reached from any path. |
| No Terms of Use (EULA) link | Added on the paywall → `https://castfishingapp.com/terms.html` |
| No Privacy Policy link | Added on the paywall → `https://castfishingapp.com/privacy.html` |
| No real "restore purchases" | `Restore membership` now calls StoreKit restore through RevenueCat. |
| Hardcoded prices | Plan cards and renewal terms show the **live localised store price** from the offering, falling back to £4.99 / £29.99 only if offerings fail to load. |
| Copy referenced the Stripe customer portal | All payment-provider branding removed from user-facing text. |

**Safety net:** `constants/purchases.ts` derives `IOS_IAP_READY` from whether a
RevenueCat key is present. With **no key**, the iOS app shows a compliant
screen with no prices, no purchase button and no external link. It can never
silently fall back to the external checkout.

Web and Android keep the Stripe flow, which is permitted outside the App Store.

## What you must do before resubmitting

### 1. RevenueCat (one-time, ~15 min)
1. Create a project at <https://app.revenuecat.com> and add your iOS app
   (bundle id `com.cast.fishingapp`).
2. Add your App Store Connect shared secret so RevenueCat can validate receipts.
3. Create an **entitlement with identifier exactly `pro`**.
4. Create an **Offering** (the default/`current` one) with two packages:
   - Monthly → product `CAST Pro Monthly`
   - Annual → product `CAST Pro Annual`
   Attach both products to the `pro` entitlement.
5. Copy the **iOS public SDK key** (starts `appl_`).

If the entitlement is not literally `pro`, change `PRO_ENTITLEMENT` in
`services/purchases.ts` to match.

### 2. Provide the key to the build
Set it as an EAS secret so it is present at build time:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_API_KEY --value appl_XXXXXXXX
```

Without this the app builds and runs, but iOS shows the no-purchase screen.

### 3. App Store Connect
- **App Information → Privacy Policy URL**: `https://castfishingapp.com/privacy.html`
- **App Information → EULA**: leave as Apple's standard, or paste the Terms of Use.
- Keep the **CAST Pro** subscription group and both subscriptions in the submission
  (they are now genuinely used by the app).
- Make sure each subscription has a localised display name, description and a
  review screenshot, and that the subscription group has a rank order.

### 4. Deploy the website first
The Privacy Policy and Terms URLs must resolve before review, and they are served
from the web build:

```bash
bash scripts/deploy-local.sh
```

Verify: <https://castfishingapp.com/privacy.html> and `/terms.html` both load.

### 5. Test the purchase on a real device — do not skip this
StoreKit cannot be tested in CI or on web. Untested purchase code is itself a
common rejection ("purchase did not complete").

```bash
eas build -p ios --profile production
```

Install on a device, sign in with a **Sandbox Apple ID**
(App Store Connect → Users and Access → Sandbox Testers) and confirm:
- both plans show a real price from the store,
- a purchase completes and Pro unlocks,
- **Restore membership** re-unlocks Pro after deleting and reinstalling,
- cancelling the sheet leaves the app in a sane state.

### 6. Submit
```bash
eas submit -p ios
```
In the review notes, state that CAST Pro is sold via Apple In-App Purchase, and
provide a demo account so the reviewer can sign in.

## If you would rather ship free first
Do not set `EXPO_PUBLIC_REVENUECAT_API_KEY`, and remove the three IAP items from
the submission. The app is then compliant with no purchases at all, and you can
add the key in a later build to switch monetisation on.
