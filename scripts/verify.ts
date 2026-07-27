import { solvePuzzle } from "../src/lib/solver";
import { somaPieces, cubeContainer } from "../src/lib/presets";
import type { SolverSettings } from "../src/types";

interface Expectation {
  label: string;
  settings: SolverSettings;
  raw?: number;
  distinct?: number;
}

const base: Omit<SolverSettings, "dedupe"> = {
  allowReflections: false,
  maxStored: 10,
  maxCount: 1_000_000,
};

const cases: Expectation[] = [
  {
    label: "dedupe: none",
    settings: { ...base, dedupe: "none" },
    raw: 11520,
  },
  {
    label: "dedupe: rotations",
    settings: { ...base, dedupe: "rotations" },
    distinct: 480,
  },
  {
    label: "dedupe: rot+reflections",
    settings: { ...base, dedupe: "rotations+reflections" },
    distinct: 240,
  },
];

let failed = false;

for (const { label, settings, raw, distinct } of cases) {
  const { meta } = solvePuzzle(somaPieces(), cubeContainer(3), settings);
  console.log(
    `${label.padEnd(28)} raw=${meta.count} distinct=${meta.distinctCount} (${Math.round(
      meta.elapsedMs,
    )}ms)`,
  );

  if (raw !== undefined && meta.count !== raw) {
    console.error(`  FAIL: expected raw=${raw}, got ${meta.count}`);
    failed = true;
  }
  if (distinct !== undefined && meta.distinctCount !== distinct) {
    console.error(`  FAIL: expected distinct=${distinct}, got ${meta.distinctCount}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nSolver verification failed.");
  process.exit(1);
}

console.log("\nAll Soma 3x3x3 checks passed.");
