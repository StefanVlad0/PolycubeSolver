import * as THREE from "three";
import { cellToWorld, DEFAULT_SPACING } from "./grid";
import type { Vec3 } from "../types";

const _camPos = new THREE.Vector3();
const _world = new THREE.Vector3();
const _proj = new THREE.Vector3();
const _refA = new THREE.Vector3();
const _refB = new THREE.Vector3();

function voxelScreenRadius(
  camera: THREE.Camera,
  dims: Vec3,
  spacing: number,
): number {
  const a = cellToWorld([0, 0, 0], dims, spacing);
  const b = cellToWorld([1, 0, 0], dims, spacing);
  _refA.set(a[0], a[1], a[2]).project(camera);
  _refB.set(b[0], b[1], b[2]).project(camera);
  return Math.hypot(_refB.x - _refA.x, _refB.y - _refA.y) * 0.55;
}

export function pickCellAtNdc(
  ndcX: number,
  ndcY: number,
  camera: THREE.Camera,
  dims: Vec3,
  spacing = DEFAULT_SPACING,
): Vec3 | null {
  const [dx, dy, dz] = dims;
  camera.getWorldPosition(_camPos);

  const maxDist = Math.max(voxelScreenRadius(camera, dims, spacing), 0.08);

  let bestCell: Vec3 | null = null;
  let bestScreenDist = Infinity;
  let bestDepth = Infinity;

  for (let x = 0; x < dx; x++) {
    for (let y = 0; y < dy; y++) {
      for (let z = 0; z < dz; z++) {
        const cell: Vec3 = [x, y, z];
        const [wx, wy, wz] = cellToWorld(cell, dims, spacing);
        _world.set(wx, wy, wz);
        const depth = _world.distanceTo(_camPos);

        _proj.copy(_world).project(camera);
        if (_proj.z > 1) continue;

        const screenDist = Math.hypot(_proj.x - ndcX, _proj.y - ndcY);
        const eps = 0.02;
        const isBetter =
          screenDist < bestScreenDist - eps ||
          (Math.abs(screenDist - bestScreenDist) <= eps && depth < bestDepth);

        if (isBetter) {
          bestCell = cell;
          bestScreenDist = screenDist;
          bestDepth = depth;
        }
      }
    }
  }

  if (!bestCell || bestScreenDist > maxDist) return null;
  return bestCell;
}

export function pointerToNdc(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: -((clientY - rect.top) / rect.height) * 2 + 1,
  };
}
