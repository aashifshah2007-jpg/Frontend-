# BASEIC Clothing: storefront starter

Plain HTML, CSS and native JavaScript modules. No framework, no build step. Built to be copied per client.

## Run
Modules need an HTTP server (opening `index.html` as a file will not work):
`npm start`, then open http://localhost:8080 (uses Python 3; any static server works).

## Test
- `npm test`: unit tests for cart, checkout validation and the order service (Node 20+, no installs).
- `npm run test:e2e`: Playwright browser tests. Install first: `npm i -D @playwright/test && npx playwright install chromium`.

## Deploy
Drag the folder to Netlify or connect the repo. No build command; publish directory is the project root.

## Before launch (placeholders in this starter)
Sample products, sample prices and a placeholder image. Empty contact details. No order endpoint, so checkout reports that ordering is not switched on. Bank-transfer instructions are generic. No payment is processed, and a transfer screenshot is never treated as proof of payment.

See `docs/` for architecture, client setup and backend integration.
