import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Radius of the model, used to place the floor and shadows. */
  extent: number;
  autoRotate?: boolean;
  controlsEnabled?: boolean;
}

export function SceneFrame({
  children,
  extent,
  autoRotate = false,
  controlsEnabled = true,
}: Props) {
  const floorY = -extent - 0.6;
  return (
    <>
      <color attach="background" args={["#070812"]} />
      <fog attach="fog" args={["#070812", extent * 6, extent * 16]} />

      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={0.85} color="#9fbaff" groundColor="#0a0c1a" />
      <directionalLight
        position={[extent * 3, extent * 5, extent * 4]}
        intensity={2.2}
      />
      <directionalLight
        position={[-extent * 4, extent * 2, -extent * 3]}
        intensity={0.8}
        color="#8b93ff"
      />
      <directionalLight
        position={[extent * 2, -extent * 2, extent * 3]}
        intensity={0.5}
        color="#22d3ee"
      />

      <group position={[0, 0, 0]}>{children}</group>

      <ContactShadows
        position={[0, floorY, 0]}
        opacity={0.55}
        scale={extent * 8}
        blur={2.4}
        far={extent * 4}
        color="#000000"
      />
      <Grid
        position={[0, floorY, 0]}
        args={[extent * 12, extent * 12]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#1b2140"
        sectionSize={extent}
        sectionThickness={1}
        sectionColor="#2a3160"
        fadeDistance={extent * 14}
        fadeStrength={1.5}
        infiniteGrid
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableRotate={controlsEnabled}
        enableZoom={controlsEnabled}
        autoRotate={autoRotate}
        minDistance={extent * 1.6}
        maxDistance={extent * 9}
        autoRotateSpeed={1.4}
        dampingFactor={0.08}
      />
    </>
  );
}
