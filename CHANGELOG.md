# Changelog

## v2.0.0 — 2026-09-11

DevDNA becomes a complete, English-first developer identity lab, with Dutch as an optional interface language.

### Added

- Side-by-side profile comparison with shared languages, traits, and normalized hourly activity overlap.
- Per-timestamp IANA timezone support, including daylight-saving changes.
- Rule-based personal DNA summaries with visible supporting evidence.
- Interactive language charts linking to the underlying repositories.
- Optional scans of up to 1,000 public repositories and progressive language-byte analysis with pause/resume and rate-limit feedback.
- PNG exports at 1600 × 1280, scalable SVG exports, and Cyberpunk, Terminal, Minimal, and Light themes.
- Browser-local evolution snapshots and recent profile history, without login.
- JSON export, README links, and browser print/PDF.
- Automated browser coverage for desktop Chromium, mobile Chromium, and WebKit, using deterministic GitHub fixtures.

### Changed

- A responsive DNA-lab design replaces the original dashboard.
- The CLI and web share the core analyzer; empty activity no longer invents timing or commit-message traits.
- Language percentages explicitly distinguish repository share from codebase bytes.
- API failures are surfaced instead of silently becoming empty reports.
- Large repository responses are reduced to the fields the interface uses.
- Build and test dependencies are locked, and the web framework is updated to Next.js 15.5.25.

### Known limitations

- GitHub determines available public event history; at most 300 events are analyzed. This is not a complete contribution history.
- Quick scans cap repositories at 300; extended scans cap them at 1,000. Forks are excluded from language and star totals.
- Codebase scans can reach GitHub request limits. A dedicated public-read-only server token increases headroom but does not remove those limits.
- Codebase scan progress is in memory and is lost on reload or navigation. Existing GitHub responses remain cached for one hour.
- Snapshots and recent profiles exist only in the current browser. They are not synchronized or backed up.
- Comparisons use primary-repository language shares. Snapshot language and star deltas require matching analysis settings.
- PNG/SVG cards show the leading six languages and four traits. They are static exports, not live badges.
- Commit style is unknown when public events contain no commit messages.
- Browser tests use synthetic API responses; they do not validate live GitHub availability or production credential permissions.

### Upgrade notes

The CLI supports Node.js 18+. Use Node.js 20.9+ for the web app and Node.js 22 for browser-test development/CI. Existing profiles keep the same URLs. Configure `GITHUB_TOKEN` only in the server environment; never use a `NEXT_PUBLIC_` variable for credentials. See [server access](docs/server-access.md) and [testing](docs/testing.md).
