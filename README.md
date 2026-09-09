<div align="center">

# ✳ DevDNA

**Your code tells a story. Decode yours.**

A playful GitHub identity lab: discover your developer traits, explore your language palette and push rhythm, and take your report with you.

[Open the lab](https://devdna-xi.vercel.app) · [Example profile](https://devdna-xi.vercel.app/phlppgdfry) · [Report an issue](https://github.com/phlppgdfry/devdna/issues)

</div>

## Inside the lab

- **A fresh visual identity:** mint and lavender colors, animated DNA specimen, responsive profile cards, reduced-motion support, and keyboard focus indicators.
- **Your developer traits:** playful labels such as Mobile Architect, True Polyglot, and Night Owl, based on observable signals.
- **Language palette:** primary-language share across original repositories.
- **Your rhythm:** hourly public pushes in UTC and weekday totals.
- **Exploration log:** active repositories, pull request events, and star events in the sample.
- **Project showcase:** most-starred sampled original repositories and common topics.
- **Keep and share:** copy the profile URL or a README link, download JSON, or print/save PDF through your browser.
- **Useful states:** loading feedback, invalid-username validation, empty-data explanations, and retryable API errors.
- **Matching CLI and web analysis:** one shared engine, with regression tests.

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

Each report samples **up to 300 public repositories**, sorted by most recent push, and **up to 300 public events**. GitHub controls how much event history is available. This is not a complete contribution history. Profiles with more than 300 repositories have partial repository totals. Web requests are cached for one hour.

**Language percentages** count each non-fork repository with a primary language once, then show the top six languages. They do not measure bytes, lines of code, time spent, or proficiency. Omitted languages and rounding can mean displayed shares do not add up to 100%.

**Push rhythm** uses event timestamps in UTC, not inferred local time and not individual commit timestamps. The timing trait follows the busiest six-hour UTC period: night (00–06), morning (06–12), afternoon (12–18), or evening (18–24). Ties use night, morning, evening, then afternoon priority. No pushes means no timing trait.

**Commit style** uses commit messages only when present in event payloads. If GitHub supplies no messages, the style is Unknown. No extra commit API calls are made.

| Trait | Signal |
|---|---|
| Mobile Architect | Leading primary language is Swift, Kotlin, Dart, or Objective-C |
| UI Craftsman | Leading language is JavaScript, TypeScript, CSS, HTML, Vue, or Svelte |
| Backend Pragmatist | Leading language belongs to the backend language set in the analyzer |
| Systems Thinker | Another leading language |
| Polyglot / True Polyglot | At least 3 / 5 primary languages |
| Builder / Prolific Creator | At least 15 / 40 public repositories on the profile |
| Open Source Contributor / Hero | At least 100 / 500 sampled original-repository stars |

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
web/components/              Search, animated specimen, report actions
test/                        Deterministic analysis and API regression tests
```

The shared engine lives inside `web` so the dashboard can deploy independently using `web` as its root. The CLI repository/package must include `web/lib/analyzer.js` and `web/package.json`.

## Validate and deploy

```sh
npm test
npm run build:web
```

On Vercel, import the repository, choose **web** as the root directory, and optionally configure `GITHUB_TOKEN`. The landing page is static; profiles render on the server. Deployment is separate from local development.

CI runs deterministic CLI tests and a production web build. Lockfiles are committed so `npm ci` is reproducible.

## Next ideas

- Compare two developer profiles side by side.
- Export an illustrated profile card as PNG/SVG.
- Optional local-time selection for push charts.
- Explore more than 300 repositories with explicit pagination controls.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Please keep interpretations transparent and add regression coverage when changing analysis rules.

MIT · [Philippe Godfroy](https://github.com/phlppgdfry)
