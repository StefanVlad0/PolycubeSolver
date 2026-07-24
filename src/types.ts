export type Vec3 = [number, number, number];

/** A cell key "x,y,z" used for fast set membership. */
export type CellKey = string;

export interface Piece {
  id: string;
  name: string;
  color: string;
  /** Cells that make up the piece, in its own local coordinate space. */
  cells: Vec3[];
}

export interface ContainerShape {
  /** Bounding dimensions used by the editor grid. */
  dims: Vec3;
  /** Cells that must be filled. */
  cells: Vec3[];
}

export type SymmetryMode = "none" | "rotations" | "rotations+reflections";

export interface SolverSettings {
  /** Whether pieces may be mirrored (reflections) when placed. */
  allowReflections: boolean;
  /** How to deduplicate solutions that are equivalent under container symmetry. */
  dedupe: SymmetryMode;
  /** Maximum number of full solutions to store for viewing. */
  maxStored: number;
  /** Stop counting after this many solutions (safety cap). */
  maxCount: number;
}

/** One solution: for each placed piece, the world cells it occupies. */
export interface PlacedPiece {
  pieceId: string;
  color: string;
  name: string;
  cells: Vec3[];
}

export type Solution = PlacedPiece[];

export type SolverStatus =
  | "idle"
  | "preparing"
  | "solving"
  | "done"
  | "error"
  | "invalid";

export interface SolveResultMeta {
  /** Total solutions found (may be capped). */
  count: number;
  /** Distinct solutions after symmetry dedupe. */
  distinctCount: number;
  /** Whether the count hit the safety cap. */
  capped: boolean;
  /** Milliseconds elapsed. */
  elapsedMs: number;
}

// ---- Worker message protocol ----

export interface SolveRequest {
  type: "solve";
  pieces: Piece[];
  container: ContainerShape;
  settings: SolverSettings;
}

export interface CancelRequest {
  type: "cancel";
}

export type WorkerRequest = SolveRequest | CancelRequest;

export interface ProgressMessage {
  type: "progress";
  count: number;
  distinctCount: number;
  nodes: number;
}

export interface SolutionsMessage {
  type: "solutions";
  solutions: Solution[];
}

export interface DoneMessage {
  type: "done";
  meta: SolveResultMeta;
  solutions: Solution[];
}

export interface ErrorMessage {
  type: "error";
  message: string;
  kind: "invalid" | "error";
}

export type WorkerResponse =
  | ProgressMessage
  | SolutionsMessage
  | DoneMessage
  | ErrorMessage;
