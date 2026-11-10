# Halk Büfe — warm mirror glow, cross-browser / non-functional QA

## Design decision
A restrained warm-amber perimeter halo (like an LED-backlit mirror) sits behind the card edge, with a faint **inset reflected-light ring** on top of the food card. The ingredient reveal and dish detail receive a softer related halo. It is **static**, requiring no JS, timed loops, filter animation or active layout changes. Images and tap targets retain their original placement.

The social action rail deliberately remains transparent; it is separate from the amber card-edge effect. High-contrast / Windows forced-colors modes replace glow with a clear solid border. Reduced-motion preferences disable visual animation.

## Supported engines & execution
The GitHub Actions workflow `.github/workflows/menu-quality.yml` now runs real Playwright browser sessions on:
- **Chromium** (Chrome-family rendering engine)
- **Firefox** (Gecko rendering engine)
- **WebKit** (Safari-family rendering engine; Linux WebKit is not an iOS Safari device)
- **Microsoft Edge** (actual `msedge` browser channel, separate from bundled Chromium)

**Not supported:** Internet Explorer 11 / EdgeHTML, which cannot run the site's modern ES modules and newer web APIs. These are retired engines; support would require a separate legacy rebuild.

## Responsive matrix
`320×568`, `360×640`, `390×844`, `414×896`, `768×1024`, `1440×900`.
Light and dark modes are covered; mobile browser viewports are emulated, not physical Android/iPhone devices.

## Acceptance criteria
| Area | Objective threshold/check |
| --- | --- |
| Horizontal overflow | document overflow <=3 CSS px at every viewport |
| Feed geometry | first card fills feed scroll viewport within 3 px; image remains >=160px |
| Social controls | buttons >=44×44px, transparent background, keyboard focus |
| Inside reveal | slider supports keyboard Home/Arrows, dialog fits 320×568, recipe provenance visible |
| Sharing | localized ingredients and caveat present; share modal opens without error |
| Scroll | wheel burst advances one dish, follow-up burst blocked during cooldown |
| Startup | locally served interactive feed <12s, no uncaught runtime exceptions |
| Visual stability | cumulative layout shift <=0.25 where LayoutShift API is supported |
| Accessibility | reduced motion removes decorative animation; forced-colors removes glow and retains border |
| Mobile energy | no infinite glow animations, event timers or layout-thrashing effects |
| Artifacts | Playwright screenshots/trace/video on failure, retained 7 days |

## Commands
```bash
npm install
npm run check
npm test
npx playwright install --with-deps chromium firefox webkit msedge
E2E_BROWSER=chromium npm run test:e2e
E2E_BROWSER=firefox npm run test:e2e
E2E_BROWSER=webkit npm run test:e2e
E2E_BROWSER=msedge npm run test:e2e
```

## Regression guard added after live inspection
The amber perimeter is implemented in the **separate** `mirror-glow.css`, linked after `style.css` in `index.html`. Checking the base stylesheet alone gives a false negative. A generic card shadow is also not proof of the LED ring.

The automated browser check now requires a **linked and loaded** LED stylesheet, the root amber variable, a rendered `::after` pseudo-element with nonempty colored `box-shadow` and `pointer-events:none`. The Node source-level test prevents accidentally dropping this file. The dedicated CSS file was also observed at its public GitHub Pages URL; this does not establish a hands-on physical-device visual PASS.

## Evidence & limitations
A green GitHub quality workflow confirms these automated checks were executed on the tested commit, *not* that every physical device / OS configuration works. A Microsoft Edge Linux browser is not Windows Edge; WebKit Linux is not iPhone Safari. After a green PR, check the actual published Pages site and perform physical-phone spot checks before declaring full device QA PASS. Do not claim browser runs passed based on a syntax check or a successful Pages deployment alone. Third-party preview caching and native Web Share targets are external dependencies.

## Future upgrades
BrowserStack/Sauce Labs or own Windows/macOS/iOS test machines for actual Windows Edge, Safari macOS and iOS Safari (including keyboard, safe-area and touch). Add real-device CPU throttling and Core Web Vitals lab measurement, and monitor RUM/real-user load once café analytics consent is established.
