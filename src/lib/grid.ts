import type { Vec3 } from "../types";

/** World-space distance between adjacent cell centers. */
export const GRID_PITCH = 2.4;

/** Visual cube size (smaller than pitch → visible gaps). */
export const VOXEL_SIZE = 0.95;

/** Invisible hit target for easier clicking (slightly smaller than pitch). */
export const HIT_SIZE = GRID_PITCH * 0.88;

export function gridCenter(dims: Vec3): Vec3 {
  return [(dims[0] - 1) / 2, (dims[1] - 1) / 2, (dims[2] - 1) / 2];
}

export function cellToWorld(
  cell: Vec3,
  dims: Vec3,
): [number, number, number] {
  const [cx, cy, cz] = gridCenter(dims);
  return [
    (cell[0] - cx) * GRID_PITCH,
    (cell[1] - cy) * GRID_PITCH,
    (cell[2] - cz) * GRID_PITCH,
  ];
}

export function sceneExtent(dims: Vec3): number {
  const span = Math.max(dims[0], dims[1], dims[2]);
  return (span / 2) * GRID_PITCH + GRID_PITCH * 0.6;
}

export function isInsideDims(cell: Vec3, dims: Vec3): boolean {
  return (
    cell[0] >= 0 &&
    cell[0] < dims[0] &&
    cell[1] >= 0 &&
    cell[1] < dims[1] &&
    cell[2] >= 0 &&
    cell[2] < dims[2]
  );
}
