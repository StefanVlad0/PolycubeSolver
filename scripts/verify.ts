import { solvePuzzle } from "../src/lib/solver";
import { somaPieces, cubeContainer } from "../src/lib/presets";
import type { SolverSettings } from "../src/types";

function run(label: string, settings: SolverSettings) {
  const { meta } = solvePuzzle(somaPieces(), cubeContainer(3), settings);
  console.log(
    `${label.padEnd(28)} raw=${meta.count} distinct=${meta.distinctCount} (${Math.round(
      meta.elapsedMs,
    )}ms)`,
  );
  return meta;
}

const base = { allowReflections: false, maxStored: 10, maxCount: 1_000_000 };

run("dedupe: none", { ...base, dedupe: "none" });
run("dedupe: rotations", { ...base, dedupe: "rotations" });
run("dedupe: rot+reflections", { ...base, dedupe: "rotations+reflections" });

console.log("\nExpected for Soma 3x3x3: raw=11520, rotations->480, rot+refl->240");
