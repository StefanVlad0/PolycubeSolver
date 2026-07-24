import type {
  Piece,
  ContainerShape,
  SolverSettings,
  Solution,
  Vec3,
  SolveResultMeta,
  PlacedPiece,
} from "../types";
import { DLX } from "./dlx";
import { orientationsOf, containerSymmetries, keyOf } from "./geometry";

export interface SolveCallbacks {
  onProgress?: (count: number, distinctCount: number, nodes: number) => void;
  /** Return false to cancel. */
  shouldContinue?: () => boolean;
}

export class InvalidPuzzleError extends Error {}

interface Placement {
  pieceIndex: number;
  cells: Vec3[];
}

export function solvePuzzle(
  pieces: Piece[],
  container: ContainerShape,
  settings: SolverSettings,
  cb: SolveCallbacks = {},
): { meta: SolveResultMeta; solutions: Solution[] } {
  const start = performance.now();

  if (pieces.length === 0) {
    throw new InvalidPuzzleError("Add at least one piece before solving.");
  }
  if (container.cells.length === 0) {
    throw new InvalidPuzzleError("The container is empty. Add target cells.");
  }

  const totalPieceVolume = pieces.reduce((s, p) => s + p.cells.length, 0);
  if (totalPieceVolume !== container.cells.length) {
    throw new InvalidPuzzleError(
      `Volume mismatch: pieces cover ${totalPieceVolume} cells but the container has ${container.cells.length}. They must be equal.`,
    );
  }

  const numCells = container.cells.length;
  const numPieces = pieces.length;
  const cellIndex = new Map<string, number>();
  container.cells.forEach((c, i) => cellIndex.set(keyOf(c), i));

  // Container bounding box.
  let cminX = Infinity,
    cminY = Infinity,
    cminZ = Infinity;
  let cmaxX = -Infinity,
    cmaxY = -Infinity,
    cmaxZ = -Infinity;
  for (const [x, y, z] of container.cells) {
    cminX = Math.min(cminX, x);
    cminY = Math.min(cminY, y);
    cminZ = Math.min(cminZ, z);
    cmaxX = Math.max(cmaxX, x);
    cmaxY = Math.max(cmaxY, y);
    cmaxZ = Math.max(cmaxZ, z);
  }

  // Build placements.
  const placements: Placement[] = [];
  const dlx = new DLX(numCells + numPieces);

  for (let pi = 0; pi < numPieces; pi++) {
    const piece = pieces[pi];
    const orients = orientationsOf(piece.cells, settings.allowReflections);
    for (const orient of orients) {
      let obx = 0,
        oby = 0,
        obz = 0;
      for (const [x, y, z] of orient) {
        obx = Math.max(obx, x);
        oby = Math.max(oby, y);
        obz = Math.max(obz, z);
      }
      for (let ox = cminX; ox + obx <= cmaxX; ox++) {
        for (let oy = cminY; oy + oby <= cmaxY; oy++) {
          for (let oz = cminZ; oz + obz <= cmaxZ; oz++) {
            const cells: Vec3[] = [];
            const cols: number[] = [];
            let fits = true;
            for (const [x, y, z] of orient) {
              const wc: Vec3 = [x + ox, y + oy, z + oz];
              const idx = cellIndex.get(keyOf(wc));
              if (idx === undefined) {
                fits = false;
                break;
              }
              cells.push(wc);
              cols.push(idx);
            }
            if (!fits) continue;
            cols.push(numCells + pi); // piece column
            const rowId = placements.length;
            placements.push({ pieceIndex: pi, cells });
            dlx.addRow(rowId, cols);
          }
        }
      }
    }
  }

  // If any piece has no placement, no solution exists.
  const pieceHasPlacement = new Array<boolean>(numPieces).fill(false);
  for (const p of placements) pieceHasPlacement[p.pieceIndex] = true;
  const impossible = pieceHasPlacement.some((v) => !v);

  const doDedupe = settings.dedupe !== "none";
  const symms = doDedupe
    ? containerSymmetries(
        container.cells,
        settings.dedupe === "rotations+reflections",
      )
    : [[]];

  let count = 0;
  const distinctKeys = new Set<string>();
  const storedSolutions: Solution[] = [];
  let capped = false;
  let cancelled = false;

  // Canonicalize a solution by its *partition* of cells into pieces (labels are
  // relabeled by first occurrence). This makes two solutions equivalent when a
  // container symmetry maps one grouping onto the other — which correctly counts
  // mirror-image arrangements as the same (e.g. Soma's 240 up to rot+reflect).
  const remap = new Int16Array(numPieces + 2);
  const canonicalOf = (assign: Int16Array): string => {
    let best: string | null = null;
    const mapped = new Int16Array(numCells);
    for (const perm of symms) {
      for (let i = 0; i < numCells; i++) mapped[perm[i]] = assign[i];
      remap.fill(0);
      let next = 1;
      let s = "";
      for (let j = 0; j < numCells; j++) {
        const g = mapped[j];
        let lbl = remap[g];
        if (lbl === 0) {
          lbl = next++;
          remap[g] = lbl;
        }
        s += lbl + ",";
      }
      if (best === null || s < best) best = s;
    }
    return best as string;
  };

  const toPlacedPieces = (rows: number[]): PlacedPiece[] => {
    return rows.map((r) => {
      const pl = placements[r];
      const piece = pieces[pl.pieceIndex];
      return {
        pieceId: piece.id,
        name: piece.name,
        color: piece.color,
        cells: pl.cells,
      } satisfies PlacedPiece;
    });
  };

  if (!impossible) {
    dlx.solve(
      (rows) => {
        count++;

        if (doDedupe) {
          const assign = new Int16Array(numCells);
          for (const r of rows) {
            const pl = placements[r];
            for (const c of pl.cells) {
              assign[cellIndex.get(keyOf(c))!] = pl.pieceIndex + 1;
            }
          }
          const key = canonicalOf(assign);
          if (!distinctKeys.has(key)) {
            distinctKeys.add(key);
            if (storedSolutions.length < settings.maxStored) {
              storedSolutions.push(toPlacedPieces(rows));
            }
          }
        } else {
          if (storedSolutions.length < settings.maxStored) {
            storedSolutions.push(toPlacedPieces(rows));
          }
        }

        if (count >= settings.maxCount) {
          capped = true;
          return false;
        }
        return true;
      },
      (nodes) => {
        if (cb.shouldContinue && !cb.shouldContinue()) {
          cancelled = true;
          return false;
        }
        cb.onProgress?.(count, doDedupe ? distinctKeys.size : count, nodes);
        return true;
      },
    );
  }

  const elapsedMs = performance.now() - start;
  const distinctCount = doDedupe ? distinctKeys.size : count;

  const meta: SolveResultMeta = {
    count,
    distinctCount,
    capped: capped || cancelled,
    elapsedMs,
  };

  return { meta, solutions: storedSolutions };
}
