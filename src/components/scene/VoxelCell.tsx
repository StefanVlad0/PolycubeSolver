import { RoundedBox, Edges } from "@react-three/drei";
import { VOXEL_SIZE } from "../../lib/grid";

interface Props {
  position: [number, number, number];
  color: string;
  variant: "filled" | "ghost";
  highlighted?: boolean;
  size?: number;
}

export function VoxelCell({
  position,
  color,
  variant,
  highlighted = false,
  size = VOXEL_SIZE,
}: Props) {
  if (variant === "ghost") {
    return (
      <group position={position}>
        <mesh>
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={highlighted ? 0.45 : 0.06}
            roughness={0.6}
            metalness={0.1}
            depthWrite={false}
          />
          <Edges
            scale={1}
            threshold={15}
            color={highlighted ? color : "#4a5280"}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      <RoundedBox args={[size, size, size]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={color}
          roughness={0.32}
          metalness={0.28}
          emissive={color}
          emissiveIntensity={highlighted ? 0.55 : 0.16}
        />
        <Edges threshold={15} color="#0b0d1a" scale={1.001} />
      </RoundedBox>
    </group>
  );
}
