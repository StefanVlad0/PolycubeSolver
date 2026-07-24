# PolycubeSolver

A modern, good-looking web app for designing 3D polycube pieces and solving
packing puzzles like the **Soma Cube** - right in your browser. Define up to
**7 pieces**, choose a target container shape, and the solver tells you whether
solutions exist, **how many**, and lets you browse every one in interactive 3D.

![PolycubeSolver](public/favicon.svg)

## Features

- **Interactive 3D editor** - sculpt each piece and the container by clicking
  cells in a live 3D grid (drag to orbit, scroll to zoom).
- **Up to 7 pieces**, each with its own name and color.
- **Fast exact-cover solver** (Dancing Links / Algorithm X) that runs in a Web
  Worker, so the UI stays smooth. Shows live progress while searching.
- **Solution counting** with three modes:
  - _All placements_ - every raw solution.
  - _Unique up to rotation_ - deduplicates whole-cube rotations.
  - _Unique up to rotation + mirror_ - the classic count (e.g. Soma → **240**).
- **Optional piece reflections** (mirrored placements).
- **Solution browser** with an "explode" slider to inspect how pieces fit.
- **Soma Cube preset** built in, plus a blank canvas to design your own puzzles.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## How it works

The container and every piece are sets of unit cells in a 3D integer lattice.
For each piece the solver generates all 24 rotations (or 48 with reflections),
then every valid translation inside the container. This becomes an **exact
cover** problem - each container cell must be covered exactly once and each
piece used exactly once - which is solved with **Knuth's Dancing Links**.

Distinct-solution counts are computed by canonicalizing each solution's cell
**partition** under the container's own symmetry group, so mirror-image
arrangements collapse correctly (this is why Soma reports 240).

### Verifying the solver

```bash
npx tsx scripts/verify.ts
# Soma 3x3x3 → raw=11520, unique-rotations=480, unique-rot+reflect=240
```

## Tech stack

React · TypeScript · Vite · Three.js (`@react-three/fiber` + `drei`) ·
Zustand · Tailwind CSS · Web Workers.
