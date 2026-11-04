# Compact mobile menu and personal reactions

Scope: Halk Büfe Selinus; feed, photos, list, dish details and the share sheet.

- Hearts save personal liked dishes; the Liked category filters the menu.
- Views are explicitly labelled as the visitor's own views, stored in this browser.
- A loaded photo at least 60% visible for one second counts once per tab session. Opening a dish also counts once; repeated opens or scrolls in that session do not add views.
- No public social proof is invented. No backend is configured.
- Menu data, original food photos, prices and public share URLs are unchanged.
- Mobile feed height follows viewport space after the header, category toolbar and basket dock. Short landscape screens retain normal scrolling.
- All controls remain at least 44 CSS pixels.

Validation completed in the JavaScript runtime on 2026-11-04:
- JavaScript syntax for app, copy and social modules.
- 19 assertions for likes, persistence, deduplication, invalid storage, blocked storage, cross-tab changes, translations and preserved catalog.
- Application initialization and dish detail contracts using DOM stubs: four languages × three menu views (12 cases). These are not visual/browser tests.

Run the saved state tests with `node --test tests/social.test.mjs`.

Manual browser validation completed on 2026-11-04 in Chromium, using viewport-sized frames:

| Viewport | Scenario | Result |
| --- | --- | --- |
| 320×568, Russian | Hero, feed, kids menu, populated basket dock, dish details, share sheet | Pass; first card is 304px high with basket, ends at y=485.6, dock begins at y=512. |
| 360×640, Turkish | Feed and two-column photos, child dish names and sides | Pass; actions and prices visible, no document overflow. |
| 390×844, German | Feed and compact list, child dish names, dark theme | Pass; names wrap, hearts remain reachable, no document overflow. |
| 619×700, English | Feed at mobile breakpoint | Pass. |
| 620×700, German | Feed at exact mobile breakpoint | Pass. |
| 621×700, Russian | Photos immediately above mobile breakpoint | Pass; no document overflow. |
| 568×320, Russian | Landscape share sheet | Pass; 242px sheet height, all actions visible without internal scrolling. |

Interaction checks passed: like/unlike, liked filter and its empty state, liked state after reload, session-deduplicated view count after repeat opening/reload, cross-tab updates, light/dark theme, category/view switches, basket visibility, details → share → details return. New heart and share targets are 44×44 CSS pixels.

Two visual defects were fixed during QA: the hero menu link left excess heading space above the first card, and the 340px minimum card height overlapped the basket dock on 320×568. The link now aligns the results under the sticky toolbar; the minimum card height is 300px.

`node --test tests/social.test.mjs`: 5 passing behavioral tests. Final JavaScript syntax and `git diff --check` pass. Short landscape uses normal page scrolling; the full catalogue is not forced into one screen.

Not covered by this browser run: real iOS/Android browser chrome and safe areas, virtual keyboard behavior, OS-level native share, screen-reader operation and enlarged text. These are not claimed as passed. Public multi-user counts are deliberately not implemented without a configured backend.
