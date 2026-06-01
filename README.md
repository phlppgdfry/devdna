<div align="center">

# 🧬 DevDNA

**Uncover your GitHub genetic code**

*A CLI tool + web dashboard that analyzes any GitHub profile and generates a beautiful developer DNA report — your coding personality, visualized in data.*

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKippieG%2Fdevdna&root-directory=web&env=GITHUB_TOKEN)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](./CONTRIBUTING.md)

<br />

```
╔══════════════════════════════════════════════════════════════════════════╗
║  🧬  D E V   D N A                                             KippieG  ║
╚══════════════════════════════════════════════════════════════════════════╝

  PHILIPPE GODFROY
  Night Owl  ·  Mobile Architect  ·  True Polyglot  ·  Prolific Creator
  🤖 commoditize the petaflop.
  ★ 847 stars  ·  42 repos  ·  since 2019  ·  📍 Belgium 🇧🇪

  LANGUAGES ─────────────────────────────────────────────────────────────
  Swift         ████████████████████░░░░░░  42%  18 repos
  Dart          █████████████████░░░░░░░░░  31%  12 repos
  TypeScript    ████████████░░░░░░░░░░░░░░  18%   8 repos
  Python        ████░░░░░░░░░░░░░░░░░░░░░░   7%   3 repos
  Go            █░░░░░░░░░░░░░░░░░░░░░░░░░   2%   1 repo

  COMMIT RHYTHM ─────────────────────────────────────────────────────────
  00h   ████████████████████████░░  ← peak
  03h   ██████████████░░░░░░░░░░░░
  06h   ░░░░░░░░░░░░░░░░░░░░░░░░░░
  09h   ████░░░░░░░░░░░░░░░░░░░░░░
  12h   ████████░░░░░░░░░░░░░░░░░░
  18h   █████████████░░░░░░░░░░░░░
  21h   ███████████████████░░░░░░░

  DNA SIGNATURE ─────────────────────────────────────────────────────────
  Mobile-first  ████████████████████████░░  96%
  Polyglot      ████████████████████░░░░░░  80%
  Night owl     ████████████████████████░░  98%
  Open source   ████████████░░░░░░░░░░░░░░  47%
  Active        ████████████████████████░░  96%

  TOP REPOS ─────────────────────────────────────────────────────────────
  LEASH           ★ 234  ·  Swift     iOS dog walking coach app
  ReflectBuddy    ★ 187  ·  Swift     Pocket mirror for iOS
  portpulse       ★ 89   ·  TypeScript  Dead-time analytics for terminals

  COMMIT STYLE ──────────────────────────────────────────────────────────
  Chaotic Genius

  ──────────────────────────────────────────────────────────────────────
  🧬 https://devdna.vercel.app/KippieG
```

<br />

[**Try it now →**](https://devdna.vercel.app) &nbsp;·&nbsp; [**Web Demo**](https://devdna.vercel.app/KippieG) &nbsp;·&nbsp; [**Report Bug**](https://github.com/KippieG/devdna/issues/new?template=bug_report.md) &nbsp;·&nbsp; [**Request Feature**](https://github.com/KippieG/devdna/issues/new?template=feature_request.md)

</div>

---

## What is DevDNA?

DevDNA reads any public GitHub profile — repos, commit history, events, topics — and surfaces patterns that reveal **who you are as a developer**.

It gives you two things:

| | |
|---|---|
| **`npx devdna <username>`** | A full terminal report with language bars, commit heatmap, DNA signature, and trait analysis. Zero install. |
| **`devdna.vercel.app/<username>`** | A shareable web profile with the same data, beautifully rendered and cached for instant loads. |

---

## Features

- **🧬 DNA Traits** — Algorithmic personality derived from real data: *Night Owl*, *Mobile Architect*, *True Polyglot*, *Prolific Creator*, *Open Source Hero*, and more. Every trait maps to a specific signal.
- **📊 Language DNA** — Language distribution weighted by actual codebase size (bytes), not just repo count. Gives a truer picture of where you spend your time.
- **🌙 Commit Rhythm** — Hour-by-hour heatmap built from your last 300 push events. Shows not just *that* you code, but *when* you code.
- **🎯 Commit Style** — Pattern analysis on commit message length and vocabulary: *YOLO Committer*, *Chaotic Genius*, *Documenter*, *Bug Hunter*, *Emoji Committer*.
- **⭐ Top Repos** — Your most-starred original work, with description and language.
- **🔖 Topics** — Your most-used repo topics, surfaced as tags.
- **🔗 Shareable** — Every report links to `devdna.vercel.app/<username>`. Web profile loads in <1s (SSR + 1hr cache).
- **🔑 Rate limit aware** — Works without a token (60 req/hr). Set `GITHUB_TOKEN` for 5,000 req/hr.

---

## Quick Start

### Terminal — zero install

```sh
npx devdna <github-username>
```

### Terminal — global install

```sh
npm install -g devdna
devdna torvalds
devdna KippieG
devdna antfu
```

### With a GitHub token (recommended)

The public API allows 60 requests/hour without authentication. Set a token to unlock 5,000:

```sh
# 1. Create a token at https://github.com/settings/tokens
#    (no scopes needed — DevDNA only reads public data)

# 2. Set the env var
export GITHUB_TOKEN=ghp_...

# 3. Run
devdna <username>
```

### Web

Visit **[devdna.vercel.app/\<username\>](https://devdna.vercel.app)** — no install, just works.

---

## How the DNA is computed

DevDNA pulls three GitHub API endpoints and runs them through a local analysis pipeline:

```
GitHub API
  /users/:username          → bio, location, followers, repo count
  /users/:username/repos    → language distribution, stars, topics
  /users/:username/events   → push timestamps, commit messages
         │
         ▼
  Analyzer
  ┌─────────────────┬────────────────────┬────────────────────────┐
  │ Language DNA    │ Commit Rhythm      │ Trait Engine           │
  │                 │                    │                        │
  │ Weighted by     │ Hour-of-day dist.  │ Rules over all signals │
  │ repo.size       │ from PushEvents    │ → personality labels   │
  │ (bytes, not     │ (last 300 events,  │                        │
  │  repo count)    │  ~90 days)         │ Commit style from      │
  └─────────────────┴────────────────────┘ message patterns       │
         │                                                         │
         ▼                                                         ▼
  Terminal Renderer                                        Web Dashboard
  chalk + responsive bars                                  Next.js SSR
  auto-adapts to terminal width                            cached 1h
```

### Trait logic

| Trait | Signal |
|-------|--------|
| **Night Owl** | More push events between 22:00–05:00 than 09:00–18:00 |
| **Early Bird** | Peak push hour before 09:00 |
| **Mobile Architect** | Top language is Swift, Kotlin, Dart, or Objective-C |
| **UI Craftsman** | Top language is JS, TS, CSS, HTML, Vue, or Svelte |
| **Backend Pragmatist** | Top language is Go, Rust, Python, Java, C#, etc. |
| **True Polyglot** | 5+ languages in top repos |
| **Polyglot** | 3–4 languages in top repos |
| **Prolific Creator** | 40+ public repos |
| **Builder** | 15–39 public repos |
| **Open Source Hero** | 500+ total stars |
| **Open Source Contributor** | 100+ total stars |

---

## Architecture

```
devdna/
│
├── src/                          # Node.js CLI — zero config, npx-ready
│   ├── index.js                  # Entry point, orchestration, spinner
│   ├── github.js                 # GitHub API client (rate-limit aware)
│   ├── analyzer.js               # Pattern analysis + trait engine
│   └── renderer.js               # Terminal renderer, responsive bars
│
├── web/                          # Next.js 14 web dashboard
│   ├── app/
│   │   ├── layout.tsx            # Root layout, global styles (monospace, dark)
│   │   ├── page.tsx              # Landing page — search input
│   │   ├── not-found.tsx         # Global 404
│   │   └── [username]/
│   │       └── page.tsx          # DNA report — SSR, 1h cache
│   └── lib/
│       └── github.ts             # GitHub client + full analysis pipeline (TypeScript)
│
├── .github/
│   ├── workflows/ci.yml          # CI: lint + test on Node 18 & 20
│   └── ISSUE_TEMPLATE/           # Bug report + feature request templates
│
├── package.json                  # CLI package — bin: devdna
└── README.md
```

---

## Deploy your own

The web dashboard is a standard Next.js app. Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKippieG%2Fdevdna&project-name=devdna&root-directory=web&env=GITHUB_TOKEN&envDescription=GitHub%20token%20to%20avoid%20public%20rate%20limits%20(optional%2C%20no%20scopes%20needed)&envLink=https%3A%2F%2Fgithub.com%2Fsettings%2Ftokens)

**Manual deploy:**

```sh
# 1. Fork this repo
# 2. Import in Vercel — set root directory to "web"
# 3. Optionally set GITHUB_TOKEN env var
# 4. Deploy
```

---

## Local development

### CLI

```sh
git clone https://github.com/KippieG/devdna.git
cd devdna
npm install
node src/index.js <username>
```

### Web

```sh
cd web
npm install
npm run dev
# → http://localhost:3000
```

---

## GitHub API rate limits

| Mode | Limit | How to set |
|------|-------|------------|
| No token (default) | 60 requests / hour | — |
| With `GITHUB_TOKEN` | 5,000 requests / hour | `export GITHUB_TOKEN=ghp_...` |

Create a token at [github.com/settings/tokens](https://github.com/settings/tokens). No scopes needed — DevDNA only reads public data.

---

## Roadmap

- [ ] `--json` flag — output raw analysis as JSON
- [ ] Compare mode — `devdna compare user1 user2`
- [ ] Language color themes
- [ ] GitHub Action — generate a DNA badge for your own README
- [ ] Private repo support (opt-in, with token)
- [ ] `devdna teams <org>` — org-level DNA report

---

## Contributing

Contributions are very welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```sh
# Fork → clone → branch → PR
git checkout -b feat/my-feature
```

Areas where help is appreciated:
- **More trait logic** — better heuristics, edge cases
- **Language colors** — the `LANG_COLORS` map in `renderer.js` is incomplete
- **Web design** — the web dashboard could look much better
- **Tests** — there are none yet

---

## License

MIT © [Philippe Godfroy](https://github.com/KippieG)

---

<div align="center">

Made with 🧬 and too many late-night commits

**[⭐ Star this repo](https://github.com/KippieG/devdna)** if DevDNA gave you an accurate read

</div>
