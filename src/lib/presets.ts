import type { Piece, ContainerShape, Vec3 } from "../types";

export const PIECE_COLORS = [
  "#818cf8", // indigo
  "#22d3ee", // cyan
  "#34d399", // emerald
  "#fbbf24", // amber
  "#fb7185", // rose
  "#a78bfa", // violet
  "#fb923c", // orange
  "#2dd4bf", // teal
  "#f472b6", // pink
  "#38bdf8", // sky
];

let idCounter = 0;
export function newId(prefix = "p"): string {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter}`;
}

export function cubeContainer(n: number): ContainerShape {
  const cells: Vec3[] = [];
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      for (let z = 0; z < n; z++) cells.push([x, y, z]);
  return { dims: [n, n, n], cells };
}

export function boxContainer(dx: number, dy: number, dz: number): ContainerShape {
  const cells: Vec3[] = [];
  for (let x = 0; x < dx; x++)
    for (let y = 0; y < dy; y++)
      for (let z = 0; z < dz; z++) cells.push([x, y, z]);
  return { dims: [dx, dy, dz], cells };
}

/** The classic 7 Soma cube pieces (1 tricube + 6 tetracubes). */
export function somaPieces(): Piece[] {
  const defs: Array<{ cells: Vec3[] }> = [
    { cells: [[0, 0, 0], [1, 0, 0], [0, 1, 0]] },
    { cells: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0]] },
    { cells: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]] },
    { cells: [[1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 0]] },
    { cells: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
    { cells: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 1]] },
    { cells: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  ];
  return defs.map((d, i) => ({
    id: newId(),
    name: `Piece ${i + 1}`,
    color: PIECE_COLORS[i % PIECE_COLORS.length],
    cells: d.cells,
  }));
}

export function emptyPiece(index: number): Piece {
  return {
    id: newId(),
    name: `Piece ${index + 1}`,
    color: PIECE_COLORS[index % PIECE_COLORS.length],
    cells: [[0, 0, 0]],
  };
}
