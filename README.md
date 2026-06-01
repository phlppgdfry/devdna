# 🧬 DevDNA

> Uncover your GitHub genetic code — beautiful terminal report + shareable web profile.

```
╔══════════════════════════════════════════════════════════════════════════╗
║  🧬  D E V   D N A                                             KippieG  ║
╚══════════════════════════════════════════════════════════════════════════╝

  PHILIPPE GODFROY
  Night Owl  ·  Mobile Architect  ·  True Polyglot  ·  Prolific Creator

  ★ 847 stars  ·  42 repos  ·  since 2018  ·  📍 Belgium

  LANGUAGES ────────────────────────────────────────────────────────────────
  Swift         ████████████████████░░░░░░  42%  18 repos
  Dart          ████████████████░░░░░░░░░░  31%  12 repos
  JavaScript    ████████░░░░░░░░░░░░░░░░░░  18%   8 repos
  Python        ████░░░░░░░░░░░░░░░░░░░░░░   7%   3 repos
  Go            ██░░░░░░░░░░░░░░░░░░░░░░░░   2%   1 repos

  COMMIT RHYTHM ────────────────────────────────────────────────────────────
  00h   ░░░░░░░░░░░░░░░░░░░░░░░░
  03h   ░░░░░░░░░░░░░░░░░░░░░░░░
  06h   ░░░░░░░░░░░░░░░░░░░░░░░░
  09h   ████░░░░░░░░░░░░░░░░░░░░
  12h   ████████░░░░░░░░░░░░░░░░
  15h   ████████░░░░░░░░░░░░░░░░
  18h   ████████████░░░░░░░░░░░░
  21h   ████████████████████████  ← peak

  DNA SIGNATURE ────────────────────────────────────────────────────────────
  Mobile-first  ████████████████████████░░  96%
  Polyglot      ████████████████████░░░░░░  80%
  Night owl     ████████████████████████░░  96%
  Open source   ████████████░░░░░░░░░░░░░░  47%
  Active        ████████████████████░░░░░░  78%

  COMMIT STYLE ─────────────────────────────────────────────────────────────
  Chaotic Genius

  🧬 https://devdna.vercel.app/KippieG
```

## Usage

**Terminal (no install)**
```sh
npx devdna <github-username>
```

**Terminal (global install)**
```sh
npm install -g devdna
devdna torvalds
devdna KippieG
```

**With higher rate limits**
```sh
GITHUB_TOKEN=ghp_... devdna <username>
```

**Web** — visit `https://devdna.vercel.app/<username>`

## What it shows

| Signal | Source |
|--------|--------|
| **Language DNA** | Repo language distribution, weighted by codebase size |
| **Commit rhythm** | Hour-of-day heatmap from recent push events |
| **DNA traits** | Algorithmic personality (Night Owl, Polyglot, Mobile Architect…) |
| **Commit style** | Message pattern analysis (YOLO Committer, Documenter, Chaotic Genius…) |
| **Top repos** | Sorted by stars, filtered to original work |

## Architecture

```
devdna/
├── src/                  # Node.js CLI (zero config, npx-ready)
│   ├── index.js          # Entry point & orchestration
│   ├── github.js         # GitHub API client (rate limit aware)
│   ├── analyzer.js       # Pattern analysis & trait computation
│   └── renderer.js       # Terminal renderer (chalk + responsive layout)
│
└── web/                  # Next.js 14 web dashboard
    ├── app/
    │   ├── page.tsx           # Landing / search
    │   └── [username]/page.tsx  # DNA report (SSR, cached 1h)
    └── lib/github.ts     # Shared GitHub client (Next.js fetch cache)
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKippieG%2Fdevdna&project-name=devdna&root-directory=web&env=GITHUB_TOKEN&envDescription=GitHub%20token%20to%20avoid%20rate%20limits)

Set `GITHUB_TOKEN` in Vercel env vars to avoid the 60 req/hr public API limit.

## Local dev

```sh
# CLI
npm install
node src/index.js KippieG

# Web
cd web && npm install && npm run dev
```

## Rate limits

The public GitHub API allows 60 requests/hour without auth. To increase this:

1. Create a token at github.com/settings/tokens (no scopes needed for public repos)
2. `export GITHUB_TOKEN=ghp_...`

## License

MIT — Philippe Godfroy
