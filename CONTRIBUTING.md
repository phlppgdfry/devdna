# Contributing to DevDNA

Thanks for taking the time to contribute! Here's everything you need to know.

## Getting started

```sh
git clone https://github.com/KippieG/devdna.git
cd devdna
npm install
node src/index.js KippieG  # verify it works
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
| `src/analyzer.js` | Pattern analysis — languages, timing, traits, commit style |
| `src/renderer.js` | Terminal rendering — chalk, bars, layout |
| `src/index.js` | CLI entry point — orchestration, spinner |
| `web/lib/github.ts` | Same analysis pipeline, TypeScript, for the web app |
| `web/app/[username]/page.tsx` | The web DNA report page (Next.js Server Component) |

## Where to contribute

**Good first issues:**
- Add more languages to `LANG_COLORS` in `renderer.js` and `web/app/[username]/page.tsx`
- Improve trait heuristics in `analyzer.js` — better edge case handling
- Add `--version` flag to the CLI
- Better error messages for suspended accounts, empty profiles, etc.

**Bigger contributions:**
- `--json` output mode
- `devdna compare user1 user2` — side-by-side comparison
- GitHub Action for generating a DNA badge
- Tests (there are none — any testing framework welcome)

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Test against at least two different GitHub usernames (including edge cases like very new accounts or accounts with few repos)
5. Push and open a PR

## Code style

- No TypeScript in the CLI (keep it zero-build, pure ESM Node.js)
- TypeScript in the web (`web/` directory)
- No linter config — just be consistent with the surrounding code
- No comments unless the *why* is genuinely non-obvious

## Questions?

Open an issue — no question is too small.
