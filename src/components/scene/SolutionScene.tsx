import { useMemo } from "react";
import type { Solution, ContainerShape, Vec3 } from "../../types";
import { cellToWorld } from "../../lib/grid";
import { VoxelCell } from "./VoxelCell";

interface Props {
  solution: Solution;
  container: ContainerShape;
  explode: number;
  spacing?: number;
}

export function SolutionScene({
  solution,
  container,
  explode,
  spacing,
}: Props) {
  const center = useMemo(() => {
    let mnx = Infinity,
      mny = Infinity,
      mnz = Infinity;
    let mxx = -Infinity,
      mxy = -Infinity,
      mxz = -Infinity;
    for (const [x, y, z] of container.cells) {
      mnx = Math.min(mnx, x);
      mny = Math.min(mny, y);
      mnz = Math.min(mnz, z);
      mxx = Math.max(mxx, x);
      mxy = Math.max(mxy, y);
      mxz = Math.max(mxz, z);
    }
    return [(mnx + mxx) / 2, (mny + mxy) / 2, (mnz + mxz) / 2] as Vec3;
  }, [container]);

  const dims = container.dims;

  return (
    <group>
      {solution.map((piece, pi) => {
        let sx = 0,
          sy = 0,
          sz = 0;
        for (const [x, y, z] of piece.cells) {
          sx += x;
          sy += y;
          sz += z;
        }
        const n = piece.cells.length || 1;
        const dir: Vec3 = [
          sx / n - center[0],
          sy / n - center[1],
          sz / n - center[2],
        ];
        const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
        const off: Vec3 = [
          (dir[0] / len) * explode,
          (dir[1] / len) * explode,
          (dir[2] / len) * explode,
        ];
        return (
          <group key={piece.pieceId + "-" + pi}>
            {piece.cells.map((c, ci) => {
              const base = cellToWorld(c, dims, spacing);
              return (
                <VoxelCell
                  key={ci}
                  position={[
                    base[0] + off[0],
                    base[1] + off[1],
                    base[2] + off[2],
                  ]}
                  color={piece.color}
                  variant="filled"
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
