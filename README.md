# Halk Büfe Selinus

A four-language demo menu and order guide for Halk Büfe Selinus in Gazipaşa. Includes light and dark themes, a cart and a QR order summary for the counter. Food photography is generated for illustration. Confirm prices and availability at the counter.

The static site is published from `main` at the repository root. Open `index.html` through a local HTTP server to preview it.

## Premium cards and quality checks

The menu uses a static, warm LED-mirror glow around food cards and ingredient details, with dark-mode and high-contrast fallbacks. The photo social rail remains transparent and one large dish occupies the visible feed area.

Quality gates are in [`.github/workflows/menu-quality.yml`](.github/workflows/menu-quality.yml): Node syntax/unit tests and Playwright end-to-end tests across Chromium, Firefox, WebKit and Microsoft Edge on Linux. Read [`docs/cross-browser-nfr.md`](docs/cross-browser-nfr.md) for viewports, accessibility and performance thresholds; tests do not replace physical Windows, macOS or iOS checks.

Before publishing, review the five quality jobs for the exact commit and verify the live Pages asset `mirror-glow.css` is served. A successful code merge alone does not prove the public site has refreshed.
