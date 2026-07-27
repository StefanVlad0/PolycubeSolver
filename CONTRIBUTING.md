# Contributing to PolycubeSolver

Thanks for your interest in contributing! This project is open source under the [MIT License](LICENSE).

## Ways to help

- **Bug reports** - something broken? Open an issue with steps to reproduce.
- **Feature ideas** - suggest presets, UX improvements, or solver options.
- **Code** - fix bugs, add tests, improve docs, or implement approved features.
- **Docs** - README tweaks, clearer onboarding copy, screenshots.

## Before you code

1. Check [existing issues](https://github.com/StefanVlad0/PolycubeSolver/issues) to avoid duplicate work.
2. For larger changes, open an issue first so we can align on approach.
3. Fork the repo and work on a branch off `main`.

## Local setup

```bash
git clone https://github.com/StefanVlad0/PolycubeSolver.git
cd PolycubeSolver
npm install
npm run dev
```

## Checks to run before a PR

```bash
npm run lint      # TypeScript
npm run build     # type-check + production build
npm run verify    # Soma solver regression (11520 / 480 / 240)
```

CI runs the same checks on every push and pull request.

## Pull request guidelines

- Keep PRs focused - one bug fix or feature per PR when possible.
- Match existing code style (TypeScript, React, Tailwind).
- Update README if you change user-facing behavior.
- No unrelated refactors mixed in with feature work.

## Project structure (quick map)

| Path | Purpose |
|------|---------|
| `src/lib/solver.ts` | DLX exact-cover solver |
| `src/lib/presets.ts` | Soma pieces, colors, containers |
| `src/store.ts` | App state (Zustand) |
| `src/components/` | UI and 3D scenes |
| `src/worker/` | Solver Web Worker |
| `scripts/verify.ts` | Soma count regression test |

## Questions?

Open a [GitHub issue](https://github.com/StefanVlad0/PolycubeSolver/issues) or reach out via the repo owner profile.
