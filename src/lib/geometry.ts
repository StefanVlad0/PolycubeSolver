import type { Vec3, CellKey } from "../types";

export function keyOf(c: Vec3): CellKey {
  return `${c[0]},${c[1]},${c[2]}`;
}

export function parseKey(k: CellKey): Vec3 {
  const [x, y, z] = k.split(",").map(Number);
  return [x, y, z];
}

/** A signed permutation transform of 3D integer space. */
interface Transform {
  perm: [number, number, number];
  sign: [number, number, number];
  det: number;
}

function apply(t: Transform, v: Vec3): Vec3 {
  return [
    t.sign[0] * v[t.perm[0]],
    t.sign[1] * v[t.perm[1]],
    t.sign[2] * v[t.perm[2]],
  ];
}

const PERMS: Array<[number, number, number]> = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

function permParity(p: [number, number, number]): number {
  // Count inversions.
  let inv = 0;
  for (let i = 0; i < 3; i++)
    for (let j = i + 1; j < 3; j++) if (p[i] > p[j]) inv++;
  return inv % 2 === 0 ? 1 : -1;
}

let cachedRot: Transform[] | null = null;
let cachedAll: Transform[] | null = null;

function buildTransforms(): { rotations: Transform[]; all: Transform[] } {
  const all: Transform[] = [];
  for (const perm of PERMS) {
    for (let s = 0; s < 8; s++) {
      const sign: [number, number, number] = [
        s & 1 ? -1 : 1,
        s & 2 ? -1 : 1,
        s & 4 ? -1 : 1,
      ];
      const det = permParity(perm) * sign[0] * sign[1] * sign[2];
      all.push({ perm, sign, det });
    }
  }
  const rotations = all.filter((t) => t.det === 1);
  return { rotations, all };
}

function getTransforms(includeReflections: boolean): Transform[] {
  if (!cachedRot || !cachedAll) {
    const built = buildTransforms();
    cachedRot = built.rotations;
    cachedAll = built.all;
  }
  return includeReflections ? cachedAll : cachedRot;
}

/** Translate a set of cells so its minimum corner sits at the origin. */
export function normalize(cells: Vec3[]): Vec3[] {
  let mx = Infinity,
    my = Infinity,
    mz = Infinity;
  for (const [x, y, z] of cells) {
    if (x < mx) mx = x;
    if (y < my) my = y;
    if (z < mz) mz = z;
  }
  return cells
    .map<Vec3>(([x, y, z]) => [x - mx, y - my, z - mz])
    .sort(compareVec);
}

export function compareVec(a: Vec3, b: Vec3): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/** Canonical string of a normalized cell set. */
export function canonicalKey(cells: Vec3[]): string {
  return normalize(cells)
    .map((c) => keyOf(c))
    .join("|");
}

/**
 * Return every distinct orientation of a polycube shape.
 * Orientations are normalized to the origin and de-duplicated.
 */
export function orientationsOf(
  cells: Vec3[],
  includeReflections: boolean,
): Vec3[][] {
  const transforms = getTransforms(includeReflections);
  const seen = new Set<string>();
  const result: Vec3[][] = [];
  for (const t of transforms) {
    const transformed = cells.map((c) => apply(t, c));
    const norm = normalize(transformed);
    const key = norm.map(keyOf).join("|");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(norm);
    }
  }
  return result;
}

/**
 * Compute the symmetry group of a container as permutations of its cell
 * indices. Each returned array `perm` satisfies: the image of cell `i` under a
 * symmetry is cell `perm[i]`. The identity is always included.
 */
export function containerSymmetries(
  containerCells: Vec3[],
  includeReflections: boolean,
): number[][] {
  const transforms = getTransforms(includeReflections);
  const indexByKey = new Map<CellKey, number>();
  containerCells.forEach((c, i) => indexByKey.set(keyOf(c), i));

  const originalKeys = containerCells.map(keyOf).slice().sort();
  const originalSig = originalKeys.join("#");

  const perms: number[][] = [];
  const seenPerm = new Set<string>();

  for (const t of transforms) {
    const transformed = containerCells.map((c) => apply(t, c));
    // Find the translation that maps transformed set onto the original set.
    // Anchor by matching min corners.
    let mx = Infinity,
      my = Infinity,
      mz = Infinity;
    for (const [x, y, z] of transformed) {
      if (x < mx) mx = x;
      if (y < my) my = y;
      if (z < mz) mz = z;
    }
    // Original min corner.
    let ox = Infinity,
      oy = Infinity,
      oz = Infinity;
    for (const [x, y, z] of containerCells) {
      if (x < ox) ox = x;
      if (y < oy) oy = y;
      if (z < oz) oz = z;
    }
    const dx = ox - mx,
      dy = oy - my,
      dz = oz - mz;
    const moved: Vec3[] = transformed.map(([x, y, z]) => [
      x + dx,
      y + dy,
      z + dz,
    ]);
    const movedSig = moved
      .map(keyOf)
      .slice()
      .sort()
      .join("#");
    if (movedSig !== originalSig) continue; // not a symmetry

    const perm = new Array<number>(containerCells.length);
    let ok = true;
    for (let i = 0; i < moved.length; i++) {
      const j = indexByKey.get(keyOf(moved[i]));
      if (j === undefined) {
        ok = false;
        break;
      }
      perm[i] = j;
    }
    if (!ok) continue;
    const permKey = perm.join(",");
    if (!seenPerm.has(permKey)) {
      seenPerm.add(permKey);
      perms.push(perm);
    }
  }
  // Ensure identity present.
  if (perms.length === 0) {
    perms.push(containerCells.map((_, i) => i));
  }
  return perms;
}
