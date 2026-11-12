# Halk Büfe · Commercial funnel foundation (P0 · 2026-11-12)

## Decision
The website is a four-language **menu and counter-preparation demo**, not an online checkout and not an authenticated POS. Cart totals are *prepared amounts*, not revenue. A completed payment cannot be inferred from a QR code, a copy action or an opened cashier screen.

## What P0 ships
1. Cryptographically generated `HB-XXXXXXXX-XXXXXXXX` reference on the cashier handoff screen. It identifies the current **unpaid draft**. The code is included in the QR payload and copied order text, and is stable while basket quantities, prices and service mode are unchanged.
2. Any basket edit, service-mode change or external basket-storage update invalidates the old code. The next handoff creates a new one. The code lives in **sessionStorage** only and survives a same-tab refresh; where storage is blocked, a temporary in-memory draft is used.
3. When the browser's secure crypto API is unavailable, no identifier is displayed; the cashier can still read the order list. No weak Math.random fallback and no implied POS registration.
4. A zero-network `halk:funnel` CustomEvent contract reports local UI actions. It does not install analytics cookies, maintain a unique visitor ID, transmit events or create paid orders.
5. UTM parsing recognizes only non-personal source and medium categories. Campaign strings, arbitrary parameters, full URLs, IPs, emails and referrers are deliberately omitted.

## Local event schema — NOT business analytics
| Event | Trigger | Fields |
|---|---|---|
| `menu_view` | Initial menu ready | view, lang, source, medium |
| `view_item` | Item detail opened | item_id |
| `add_to_cart`, `remove_from_cart` | Successful quantity change | item_id, quantity, amount_try |
| `offer_accept` | Successful optional item addition | item_id, amount_try |
| `begin_checkout` | Prepared order opened for cashier | amount_try |
| `draft_ready` | Fresh prepared reference | order_reference, amount_try |
| `guide_start` | Fast-choice guide link clicked | lang |

Every event includes `source` (one of `qr`, `instagram`, `facebook`, `google_maps`, `website`, `direct`) and optional `medium` (`qr`, `social`, `organic`, `referral`). Unrecognized UTM values are reduced to direct/unknown without retaining the raw string.

Example non-tracking links:
- `https://safal207.github.io/halk-bufe-selinus/?lang=tr&utm_source=qr&utm_medium=qr`
- `https://safal207.github.io/halk-bufe-selinus/?lang=tr&utm_source=instagram&utm_medium=social`

**Important:** these events are transient in the visitor's browser. They cannot populate an owner dashboard, produce conversion rates or be counted across users until a deliberate, privacy-reviewed collection service and appropriate consent mechanisms are implemented. Never call them GA4/POS transactions.

## Revenue confirmation — a separate secure milestone
The next backend integration must:
- authenticate a real cashier/owner (never put a public `markPaid` button in the menu);
- create a **server-side** order record with authoritative item prices and available stock;
- reconcile cashier/POS payment with a unique external payment/receipt ID;
- support idempotency, rejection, voids and refunds, store timestamps and audit history;
- distinguish `draft_created`, `cashier_received`, `paid`, `refunded`; only the verified `paid` transition permits a `purchase` analytics event;
- keep a stable but non-secret code for the prepared handoff; do not use it as authentication.

## Unit economics — no real margin figures yet
For each item and price period the authorized owner must supply:
- actual net selling revenue excluding applicable collected tax;
- ingredient and portion costs;
- packaging, processing/payment and other variable costs;
- waste/spoilage allowance; availability, recipe validity and price-effective dates.

Unit contribution = net selling revenue − all variable costs. Order contribution = sum(quantity × unit contribution) − order-level variable costs. **Contribution is not net profit**, which further deducts fixed overhead and taxes.

Never publish private supplier costs in this public repository. Do not fabricate a price/cost dataset or show placeholder numbers as actual profitability. A separate access-controlled owner panel and POS export are required.

## Acceptance and limitations
- Node unit tests exercise IDs, UTM filtering, forbidden purchase events and four-language labels.
- Playwright browser test covers 360×640 handoff, stable reference, change of service mode and ephemeral event payloads. Existing four-engine cross-browser/NFR gates also run.
- Test success is evidence for this demo code, not proof of real buyer behavior, external WhatsApp previews, physical mobile devices, consent compliance or revenue growth.
