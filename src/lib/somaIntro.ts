import type { Solution } from "../types";
import { solvePuzzle } from "./solver";
import { somaPieces, cubeContainer } from "./presets";

/** One cached Soma solution used for the startup intro animation. */
let cached: Solution | null = null;

export function getSomaIntroSolution(): Solution {
  if (cached) return cached;
  const { solutions } = solvePuzzle(somaPieces(), cubeContainer(3), {
    allowReflections: false,
    dedupe: "none",
    maxStored: 1,
    maxCount: 1,
  });
  if (solutions.length === 0) {
    throw new Error("Could not build Soma intro solution.");
  }
  cached = solutions[0];
  return cached;
}

export const SOMA_INTRO_CONTAINER = cubeContainer(3);
