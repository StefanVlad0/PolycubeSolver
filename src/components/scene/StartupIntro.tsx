import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { SolutionScene } from "./SolutionScene";
import {
  getSomaIntroSolution,
  SOMA_INTRO_CONTAINER,
} from "../../lib/somaIntro";

const ASSEMBLE_DURATION = 1.15;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function StartupIntro() {
  const solution = getSomaIntroSolution();
  const [explode, setExplode] = useState(3.2);

  useFrame((state) => {
    const u = Math.min(state.clock.elapsedTime / ASSEMBLE_DURATION, 1);
    setExplode(easeOutCubic(1 - u) * 3.2);
  });

  return (
    <SolutionScene
      solution={solution}
      container={SOMA_INTRO_CONTAINER}
      explode={explode}
    />
  );
}
