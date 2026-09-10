# Contributing to DevDNA

Thanks for taking the time to contribute! Here's everything you need to know.

## Getting started

```sh
git clone https://github.com/phlppgdfry/devdna.git
cd devdna
npm install
node src/index.js phlppgdfry  # verify it works
```

For the web dashboard:

```sh
cd web
npm install
npm run dev
```

## Project structure

| File | What it does |
|------|-------------|
| `src/github.js` | GitHub API client — fetches user, repos, events |
| `web/lib/analyzer.js` | Shared pattern analysis — languages, timing, traits, commit style |
| `src/renderer.js` | Terminal rendering — chalk, bars, layout |
| `src/index.js` | CLI entry point — orchestration, spinner |
| `web/lib/github.ts` | Cached GitHub client and shared-analysis adapter |
| `web/app/[username]/page.tsx` | The web DNA report page (Next.js Server Component) |

## Where to contribute

**Good first issues:**
- Add more languages to `LANG_COLORS` in `renderer.js` and `web/app/[username]/page.tsx`
- Improve trait heuristics in `analyzer.js` — better edge case handling
- Add `--version` flag to the CLI
- Better error messages for suspended accounts, empty profiles, etc.

**Bigger contributions:**
- Richer comparison and export tools
- `devdna compare user1 user2` — side-by-side comparison
- GitHub Action for generating a DNA badge
- Add regression cases to the existing Node.js test suite

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run `npm test` and `npm run build:web`; check the affected UI on desktop and mobile.
5. Push and open a PR

## Code style

- No TypeScript in the CLI (keep it zero-build, pure ESM Node.js)
- TypeScript in the web (`web/` directory)
- Format changes using the installed Prettier (`npx prettier --write <files>`).
- No comments unless the *why* is genuinely non-obvious

## Questions?

Open an issue — no question is too small.
