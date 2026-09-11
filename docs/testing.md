# Testing DevDNA

## Unit tests

From the repository root:

```sh
npm ci
npm test
```

The Node test suite covers empty profiles, trait evidence, timezone and DST boundaries, secondary language bytes, bounded pagination, comparisons, export escaping, snapshots, and storage failures.

## Browser tests

Use Node.js 22. From the repository root:

```sh
npm ci --prefix web
npm run test:e2e:install --prefix web
npm run build:web
npm run test:e2e
```

Playwright runs each scenario against desktop Chromium, mobile Chromium, and WebKit. The production Next.js build is served on `127.0.0.1:3120`; a pre-existing server on that port is intentionally not reused.

The suite verifies:

- Username/profile-URL search, recent history, invalid input and missing profiles.
- Side-by-side comparison and normalized overlap, including a rate-limited participant.
- A real downloaded PNG's signature, dimensions, filename and nonempty payload.
- Snapshot saving, persistence after reload, incompatible-settings feedback, deletion and blocked storage.
- Language switching, repository drilldown, timezone selection and mobile overflow.
- Completed and rate-limited codebase scans, and snapshot eligibility.
- Honest empty states.

`web/e2e/mock-github.mjs` replaces GitHub fetches only in the Playwright-launched server process. It refuses to run on Vercel, requires `DEVDNA_E2E=1`, and rejects any GitHub authorization header. The production application never imports it. Browser requests to external hosts are blocked. Test data is fictional and no GitHub credentials are needed.

Run one project while developing:

```sh
cd web
npm run test:e2e -- --project=chromium
```

Open the local report:

```sh
cd web
npx playwright show-report
```

GitHub Actions executes the same scenarios. Failed runs retain traces and screenshots as a short-lived workflow artifact. Test reports, caches and downloaded artifacts are ignored by Git and Vercel uploads.

These checks complement a live deployment smoke test. They cannot prove GitHub's current availability or that a production token is valid.
