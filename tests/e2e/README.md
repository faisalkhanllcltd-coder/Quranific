# Quranific E2E Test Suite

End-to-end tests for `quranific.com`. Isolated in `tests/e2e` with independent dependencies.

## How to Run

```bash
cd tests/e2e
npm ci
npm run test:prod             # Tier A core on Desktop Chrome
npm run test:cross            # Cross-browser: Mobile Chrome, Safari, Firefox
npm run test:local            # Builds, runs local edge wrangler dev on :8787, runs Tier B
npm run summarize <run.json>  # Attribution summary
npm run review-sheet          # Generates visual review sheet in D:\Live Web\quranific-review
```

## Production Safety Rules

1. **Analytics/Ads Aborted**: All requests to GTM, GA, DoubleClick, Meta, and Cloudflare Insights are intercepted and aborted before hitting upstream endpoints.
2. **No Valid Submissions**: Never submit real leads or trigger downstream production transactional emails during test runs.
3. **Negative POSTs Capped**: Negative/probing POST requests are strictly capped at <= 2 per endpoint.
4. **No Rate-Limit Flooding**: Requests enforce delay intervals (`E2E_DELAY_MS`) and max 2 workers to prevent triggering Cloudflare challenge blocks.

## Reading Summarize Output

Run `node summarize.mjs <playwright-output.json>`.
- **Clean Run**: `pass` equals total tests, `fail: 0`, `unexplained: 0`.
- **Known Causes**: Failures are classified into predefined root-cause categories without modifying rule sets.
- **Reportable Gate**: A test run is reportable ONLY when `unexplained: 0` and the sum of root causes equals total failures. Any unclassified failure prints as `UNEXPLAINED` with its raw lines and blocks release.
