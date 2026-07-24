import type { Vec3 } from "../types";

/** Base distance between cell centers at spacing = 1. */
export const BASE_PITCH = 1.1;

/** Visual cube size at spacing = 1 (nearly touching). */
export const VOXEL_SIZE = 0.98;

export const DEFAULT_SPACING = 1;
export const MIN_SPACING = 1;
export const MAX_SPACING = 2.4;

export function pitchFor(spacing: number): number {
  return BASE_PITCH * spacing;
}

export function gridCenter(dims: Vec3): Vec3 {
  return [(dims[0] - 1) / 2, (dims[1] - 1) / 2, (dims[2] - 1) / 2];
}

export function cellToWorld(
  cell: Vec3,
  dims: Vec3,
  spacing = DEFAULT_SPACING,
): [number, number, number] {
  const pitch = pitchFor(spacing);
  const [cx, cy, cz] = gridCenter(dims);
  return [
    (cell[0] - cx) * pitch,
    (cell[1] - cy) * pitch,
    (cell[2] - cz) * pitch,
  ];
}

export function sceneExtent(dims: Vec3, spacing = DEFAULT_SPACING): number {
  const pitch = pitchFor(spacing);
  const span = Math.max(dims[0], dims[1], dims[2]);
  return (span / 2) * pitch + pitch * 0.6;
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
