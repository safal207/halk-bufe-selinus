# Halk Büfe · Social menu (2026-11-10)

## What ships
- Existing Feed / Photos / List / item detail and basket continue to share the same catalog.
- Every item can be liked and bookmarked independently. Saved items have their own category.
- Feed and photo cards show a **personal** 0/1 like indicator, counted views, bookmarks and an existing image/story share action.
- Feed has a position indicator, mobile scroll snapping, an always-visible vertical reaction rail over the **right edge of each dish photo** in both Feed and Photos views, and double-tap-to-like on the food photo. Single tap still opens the dish; keyboard activation is immediate.
- TR, RU, EN and DE are supported. Reduced-motion preference disables the heart animation.

## Immersive one-card feed (2026-11-10)
- The Feed view has an **independent vertical scroll area**; it no longer makes the entire HTML page snap.
- A card fills the feed viewport, with a large uncropped food image, centered design, and a short title/price/order footer. The social rail stays over the right side of the photo.
- Each swipe uses mandatory scroll snapping with `scroll-snap-stop: always`; wheel/trackpad input accumulates deliberately and has an 850ms cooldown to avoid skipping multiple items.
- At the first/last card, outward wheel gestures return to regular page scroll. ArrowUp/ArrowDown and PageUp/PageDown work when the feed is focused.
- On mobile the feed uses `svh` to avoid height jumping when the browser address bar expands or collapses, and reserves space for sticky menu controls and the cart dock.
- The Photos grid, List view, basket and existing social state remain unchanged.

## Transparent social actions & rich sharing (2026-11-10)
- Social buttons stay on the photo at the right, but the rail itself has **no pill background, border or backdrop blur**. Individual white icons and numbers use a dark drop shadow for legibility over light and dark foods, with keyboard focus outlines and unchanged ≥44px hit targets.
- Share modal now shows the full available dish description, ingredients from the nutrition editorial record, provenance/caveat, and a CTA; copy action copies the entire description plus direct dish link, not only a URL.
- Native share sends `title`, full `text`, and the deep `url`, with **no image attachment** so mobile apps are less likely to discard the text. "Save story" separately exports the image with a compact ingredient teaser.
- All 176 locale-specific HTML OG/Twitter preview pages regenerated with rich descriptions, photos and direct-to-dish links. New share URLs use a `?v=rich-20261110` variant to limit reuse of cached old social snippets. Platforms may still truncate snippets.
- For unverified recipe assumptions, visible text says **sample recipe**. Confirm full recipes and allergens with café staff before describing them as certain.

## Metric integrity
- This is a **static GitHub Pages** site. There are no global or other-visitors' likes/views. Never advertise local values as public popularity.
- Likes and bookmarks live in `localStorage` under the existing `halk-bufe-selinus:v1:social` key (old likes/views are preserved).
- Views count once per dish per tab session (tracked by `sessionStorage`). In the feed/photos a fully loaded photo must be at least 60% visible for >=1 second; opening a dish also records a view.
- Missing or blocked storage falls back to in-memory state. Unknown item IDs and invalid storage values are ignored.
- The saved/liked filters and counts synchronize across tabs using the browser `storage` event.
- Sharing opens the existing story-card / share sheet; it is not evidence that someone placed an order.

## Acceptance checklist
1. On 320px, 360px, and 390px phones and desktop, verify one card fits the feed viewport; scroll snaps to precisely one item per swipe/wheel burst, not the page. Check 568px/667px/800px screen heights, address-bar collapse, scroll at either end, and keyboard arrows. Then confirm the vertical right-side rail overlays the **photo** (not text) in Feed and Photos. It contains like / local view count / bookmark / share; all buttons remain at least 44px tall and usable, including on short screens.
2. Test Feed, Photos, List, search, categories, and basket without horizontal clipping.
3. Swipe down the feed; verify item progress changes and that visible photos count only once per tab session.
4. Double-tap a photo in Feed: it likes without opening the detail. Single tap opens detail, keyboard Enter opens immediately.
5. Like one dish and bookmark another. Verify the two filters are independent, and toggles work from the list and detail.
6. Reload and open a second tab: likes and bookmarks persist and refresh; previously counted views stay unchanged in the same session.
7. Share a dish and verify the URL/story resolves to the selected dish; full localized description, main ingredients/assumptions, caveat, price and CTA appear in the copy/share sheet and server-side OG descriptions. Test WhatsApp/Telegram URL cards where practical; previews may be truncated by the platform. No automatic checkout or order submission.
8. Switch TR / RU / EN / DE, light/dark theme, and test `prefers-reduced-motion`.
9. Test with blocked browser storage and with slow images (no accidental view until actually loaded).

## Future shared metrics
If the café wants aggregate likes/views across visitors, implement a backend with server-side deduplication, rate limiting, clear privacy notice, and auditable counters. Do not push fabricated counters or client-controlled totals to production.
