<div align="center">

# ✳ DevDNA

**Your code tells a story. Decode yours.**

A playful GitHub identity lab: discover your developer traits, explore your language palette and push rhythm, and take your report with you.

[Open the lab](https://devdna-xi.vercel.app) · [Example profile](https://devdna-xi.vercel.app/phlppgdfry) · [Report an issue](https://github.com/phlppgdfry/devdna/issues)

</div>

## Inside the lab

- **Compare profiles:** side-by-side languages, push rhythm, shared traits, and normalized hourly overlap at `/compare`.
- **PNG and SVG cards:** download a 1600 × 1280 PNG or a scalable SVG, with an instant preview.
- **Four card themes:** Cyberpunk, Terminal, Minimal, and Light.
- **Local timezones:** select an IANA timezone or use the browser timezone. Each push timestamp respects daylight-saving changes.
- **Personal DNA story:** a playful, rule-based summary with the evidence behind each trait.
- **Interactive language palette:** click a language to see its repositories; byte mode shows each codebase's byte contribution.
- **Extended analysis:** opt into up to 1,000 public repositories and a progressive scan of actual language bytes for every sampled original repository.
- **Evolution snapshots:** save local snapshots and compare repository, follower, star, and language-share changes on later visits.
- **English first, Dutch optional:** a persistent language switch covers the interface and card exports.
- **Recent discoveries:** revisit up to eight profiles stored locally, with a clear-history button and no login.
- **Share and export:** profile links, README links, JSON reports, and browser print/PDF.
- **Accessible interface:** responsive layouts, keyboard focus, reduced motion, loading states, honest empty states, and retryable errors.

These are playful interpretations, not a developer ranking or an assessment of ability.

## Run locally

Use Node.js 20.9+ for the web dashboard. The CLI supports Node.js 18+.

```sh
git clone https://github.com/phlppgdfry/devdna.git
cd devdna
npm ci
node src/index.js phlppgdfry
node src/index.js phlppgdfry --json > dna.json
npm test
```

Run the dashboard:

```sh
cd web
npm ci
npm run dev
# http://localhost:3000
```

Optionally set `GITHUB_TOKEN` in the server environment (or `web/.env.local` for Next.js) for a higher GitHub API allowance. Never put a token in browser code or commit it. DevDNA only requests public profile data; private repository support is not implemented.

## What the data actually means

Quick reports sample **up to 300 public repositories**; extended reports sample **up to 1,000**, sorted by most recent push. Both modes sample **up to 300 public events**. GitHub controls the available event history. Larger profiles remain partial. Web requests are cached for one hour.

**Repository-share mode** counts each original repository with a detected primary language once. The palette initially shows eight languages and can expand to all languages. Cards show the top six. These shares do not measure proficiency or time spent.

**Codebase-byte mode** fetches [GitHub's language breakdown](https://docs.github.com/en/rest/repos/repos#list-repository-languages) for each sampled original repository. It sums bytes across codebases; larger repositories weigh more. Secondary languages are included. Progress and partial coverage stay visible, and the scan can be paused and resumed while the page remains open. Switching profiles or reloading clears in-memory scan progress; GitHub responses remain cached. Snapshots require the byte scan to finish.

The byte endpoint serves ten repositories per batch with at most five simultaneous GitHub calls. Only repositories from the public profile listing are eligible. Large scans require many API calls and may hit GitHub rate limits; existing results are retained for a later retry. Configure a server-side `GITHUB_TOKEN` for more headroom. Without it, a large scan may not finish in a single rate-limit window. Tokens never enter client bundles or local snapshots.

**Push rhythm** uses push-event timestamps, not individual commits. UTC is the initial timezone; changing it recomputes hours, weekdays, timing traits, and export contents. The busiest six-hour period determines the time trait: night (00–06), morning (06–12), afternoon (12–18), or evening (18–24). Ties prefer night, morning, evening, then afternoon. No pushes means no timing trait.

**Comparison** uses primary-repository shares on both sides and the same selected timezone. Hourly overlap normalizes each profile's push counts and sums the smaller share at every hour. Missing activity shows “not enough data”, not zero similarity. Different event windows and sample sizes limit interpretation.

**Commit style** uses commit messages only when present in event payloads. If GitHub supplies no messages, the style is Unknown. No extra commit API calls are made.

| Trait                          | Signal                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Mobile Architect               | Leading language in the selected mode is Swift, Kotlin, Dart, or Objective-C |
| UI Craftsman                   | Leading language is JavaScript, TypeScript, CSS, HTML, Vue, or Svelte        |
| Backend Pragmatist             | Leading language belongs to the backend language set in the analyzer         |
| Systems Thinker                | Another leading language                                                     |
| Polyglot / True Polyglot       | At least 3 / 5 observed languages                                            |
| Builder / Prolific Creator     | At least 15 / 40 public repositories on the profile                          |
| Open Source Contributor / Hero | At least 100 / 500 sampled original-repository stars                         |

Star and repository labels describe public signals, not the quality of a developer's work. An API failure is surfaced as an error rather than silently producing an empty report.

## Architecture

```text
src/index.js                 CLI arguments, JSON output, orchestration
src/github.js                Public GitHub API client with timeout
src/analyzer.js              Re-exports the shared engine
src/renderer.js              Terminal report
web/lib/analyzer.js          Shared CLI/web analysis engine
web/lib/github.ts            Cached web API client and report adapter
web/app/                     Landing, report, loading, and error pages
web/components/              Bilingual profile lab, comparison, exports, local history
web/lib/insights.js           Timezone views, byte aggregation, comparison, snapshots
web/app/api/languages/        Bounded public-codebase scan endpoint
test/                        Deterministic analysis and API regression tests
```

The shared engine lives inside `web` so the dashboard can deploy independently using `web` as its root. The CLI repository/package must include `web/lib/analyzer.js` and `web/package.json`.

## Release and production access

See [v2.0.0 changes and known limitations](CHANGELOG.md). For reliable hosted API access, follow the [dedicated public-read-only token setup](docs/server-access.md). Automated CI uses fictional GitHub data and does not require a production token.

## Validate and deploy

```sh
npm test
npm run build:web
```

On Vercel, import the repository, choose **web** as the root directory, and optionally configure `GITHUB_TOKEN`. The landing page is static; profiles render on the server. Deployment is separate from local development.

CI runs unit tests, a production web build, and 33 browser scenarios across desktop Chromium, mobile Chromium and WebKit. See [testing instructions](docs/testing.md). Lockfiles are committed so `npm ci` is reproducible.

## Browser-local data

The app keeps only your chosen interface language, eight recent usernames, and up to 100 explicitly saved snapshots in local storage. Snapshots contain public aggregate metrics, language shares, traits, timezone, method, repository limit, and timestamps. They are not uploaded. Clearing browser data removes them; storage failures show a message instead of a false success.

Snapshots compare the current report against a selected saved report. Language and star deltas require the same account, timezone, method, repository limit, and a complete byte scan. Public repository and follower deltas can still be shown when analysis settings differ. Cached responses may legitimately produce zero changes; changing public activity windows or samples does not measure productivity.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Please keep interpretations transparent and add regression coverage when changing analysis rules.

MIT · [Philippe Godfroy](https://github.com/phlppgdfry)
