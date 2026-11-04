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

Manual checks still required before a visual pass:
- 320×568, 360×640, 390×844; 619/620/621 width boundary; short landscape.
- Russian and long German dish names; light/dark themes.
- Like/unlike, liked filter and empty state; persistence after reload.
- Card, detail and share actions visible together; basket dock does not cover them.
- No horizontal document overflow; keyboard focus and dialog return focus.
- Real iOS/Android browser chrome, virtual keyboard and native share.

The execution environment disconnected during implementation; visual QA was not recorded as passed.
