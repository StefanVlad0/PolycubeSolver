import { useRef, useState } from "react";
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

interface Props {
  onAssembled?: () => void;
}

export function StartupIntro({ onAssembled }: Props) {
  const solution = getSomaIntroSolution();
  const [explode, setExplode] = useState(3.2);
  const assembled = useRef(false);
  const onAssembledRef = useRef(onAssembled);
  onAssembledRef.current = onAssembled;

  useFrame((state) => {
    const u = Math.min(state.clock.elapsedTime / ASSEMBLE_DURATION, 1);
    setExplode(easeOutCubic(1 - u) * 3.2);

    if (u >= 1 && !assembled.current) {
      assembled.current = true;
      onAssembledRef.current?.();
    }
  });

  return (
    <SolutionScene
      solution={solution}
      container={SOMA_INTRO_CONTAINER}
      explode={explode}
    />
  );
}
