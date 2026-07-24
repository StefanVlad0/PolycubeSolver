import { create } from "zustand";
import type {
  Piece,
  ContainerShape,
  SolverSettings,
  Solution,
  SolveResultMeta,
  SolverStatus,
  Vec3,
  WorkerResponse,
} from "./types";
import {
  somaPieces,
  cubeContainer,
  boxContainer,
  emptyPiece,
  newId,
  PIECE_COLORS,
} from "./lib/presets";
import { keyOf } from "./lib/geometry";
import { normalize } from "./lib/geometry";
import { isInsideDims, DEFAULT_SPACING, MIN_SPACING, MAX_SPACING } from "./lib/grid";

const MAX_PIECES = 7;

export type EditTarget = { kind: "piece"; id: string } | { kind: "container" };

interface Progress {
  count: number;
  distinctCount: number;
  nodes: number;
}

interface AppState {
  pieces: Piece[];
  container: ContainerShape;
  settings: SolverSettings;

  editTarget: EditTarget;
  eraseMode: boolean;
  cellSpacing: number;

  status: SolverStatus;
  progress: Progress;
  meta: SolveResultMeta | null;
  solutions: Solution[];
  currentSolution: number;
  errorMessage: string | null;

  // actions
  setEditTarget: (t: EditTarget) => void;
  setEraseMode: (v: boolean) => void;
  setCellSpacing: (v: number) => void;

  addPiece: () => void;
  removePiece: (id: string) => void;
  renamePiece: (id: string, name: string) => void;
  setPieceColor: (id: string, color: string) => void;
  togglePieceCell: (id: string, cell: Vec3) => void;

  setContainerDims: (dims: Vec3) => void;
  toggleContainerCell: (cell: Vec3) => void;
  fillContainer: () => void;
  clearContainer: () => void;

  setSettings: (s: Partial<SolverSettings>) => void;

  loadSoma: () => void;
  loadEmpty: () => void;

  solve: () => void;
  cancelSolve: () => void;
  setCurrentSolution: (i: number) => void;

  totalPieceVolume: () => number;
}

let worker: Worker | null = null;

function ensureWorker(get: () => AppState, set: (p: Partial<AppState>) => void) {
  if (worker) return worker;
  worker = new Worker(new URL("./worker/solver.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    switch (msg.type) {
      case "progress":
        set({
          progress: {
            count: msg.count,
            distinctCount: msg.distinctCount,
            nodes: msg.nodes,
          },
        });
        break;
      case "done":
        set({
          status: "done",
          meta: msg.meta,
          solutions: msg.solutions,
          currentSolution: 0,
          progress: {
            count: msg.meta.count,
            distinctCount: msg.meta.distinctCount,
            nodes: get().progress.nodes,
          },
        });
        break;
      case "error":
        set({
          status: msg.kind === "invalid" ? "invalid" : "error",
          errorMessage: msg.message,
        });
        break;
    }
  };
  return worker;
}

const defaultSettings: SolverSettings = {
  allowReflections: false,
  dedupe: "none",
  maxStored: 1000,
  maxCount: 500000,
};

const initialPieces = somaPieces();

export const useStore = create<AppState>((set, get) => ({
  pieces: initialPieces,
  container: cubeContainer(3),
  settings: defaultSettings,

  editTarget: { kind: "piece", id: initialPieces[0].id },
  eraseMode: false,
  cellSpacing: DEFAULT_SPACING,

  status: "idle",
  progress: { count: 0, distinctCount: 0, nodes: 0 },
  meta: null,
  solutions: [],
  currentSolution: 0,
  errorMessage: null,

  setEditTarget: (t) => set({ editTarget: t }),
  setEraseMode: (v) => set({ eraseMode: v }),
  setCellSpacing: (v) =>
    set({
      cellSpacing: Math.max(MIN_SPACING, Math.min(MAX_SPACING, v)),
    }),

  addPiece: () => {
    const { pieces } = get();
    if (pieces.length >= MAX_PIECES) return;
    const p = emptyPiece(pieces.length);
    set({
      pieces: [...pieces, p],
      editTarget: { kind: "piece", id: p.id },
      status: "idle",
    });
  },

  removePiece: (id) => {
    const { pieces, editTarget } = get();
    const next = pieces.filter((p) => p.id !== id);
    let et = editTarget;
    if (editTarget.kind === "piece" && editTarget.id === id) {
      et = next.length ? { kind: "piece", id: next[0].id } : { kind: "container" };
    }
    set({ pieces: next, editTarget: et, status: "idle" });
  },

  renamePiece: (id, name) =>
    set({
      pieces: get().pieces.map((p) => (p.id === id ? { ...p, name } : p)),
    }),

  setPieceColor: (id, color) =>
    set({
      pieces: get().pieces.map((p) => (p.id === id ? { ...p, color } : p)),
    }),

  togglePieceCell: (id, cell) => {
    const { pieces, container } = get();
    if (!isInsideDims(cell, container.dims)) return;
    set({
      pieces: pieces.map((p) => {
        if (p.id !== id) return p;
        const k = keyOf(cell);
        const exists = p.cells.some((c) => keyOf(c) === k);
        let cells: Vec3[];
        if (exists) {
          cells = p.cells.filter((c) => keyOf(c) !== k);
          if (cells.length === 0) cells = p.cells; // don't allow empty piece
        } else {
          cells = [...p.cells, cell];
        }
        return { ...p, cells: normalize(cells) };
      }),
      status: "idle",
    });
  },

  setContainerDims: (dims) => {
    set({ container: boxContainer(dims[0], dims[1], dims[2]), status: "idle" });
  },

  toggleContainerCell: (cell) => {
    const { container } = get();
    const k = keyOf(cell);
    const exists = container.cells.some((c) => keyOf(c) === k);
    const cells = exists
      ? container.cells.filter((c) => keyOf(c) !== k)
      : [...container.cells, cell];
    set({ container: { ...container, cells }, status: "idle" });
  },

  fillContainer: () => {
    const { container } = get();
    const [dx, dy, dz] = container.dims;
    set({ container: boxContainer(dx, dy, dz), status: "idle" });
  },

  clearContainer: () => {
    const { container } = get();
    set({ container: { ...container, cells: [] }, status: "idle" });
  },

  setSettings: (s) => set({ settings: { ...get().settings, ...s }, status: "idle" }),

  loadSoma: () => {
    const pieces = somaPieces();
    set({
      pieces,
      container: cubeContainer(3),
      editTarget: { kind: "piece", id: pieces[0].id },
      status: "idle",
      solutions: [],
      meta: null,
      errorMessage: null,
    });
  },

  loadEmpty: () => {
    const p: Piece = {
      id: newId(),
      name: "Piece 1",
      color: PIECE_COLORS[0],
      cells: [[0, 0, 0]],
    };
    set({
      pieces: [p],
      container: cubeContainer(3),
      editTarget: { kind: "piece", id: p.id },
      status: "idle",
      solutions: [],
      meta: null,
      errorMessage: null,
    });
  },

  solve: () => {
    const state = get();
    const w = ensureWorker(get, set);
    set({
      status: "solving",
      progress: { count: 0, distinctCount: 0, nodes: 0 },
      meta: null,
      solutions: [],
      currentSolution: 0,
      errorMessage: null,
    });
    w.postMessage({
      type: "solve",
      pieces: state.pieces,
      container: state.container,
      settings: state.settings,
    });
  },

  cancelSolve: () => {
    if (worker) worker.postMessage({ type: "cancel" });
  },

  setCurrentSolution: (i) => {
    const { solutions } = get();
    if (solutions.length === 0) return;
    const idx = ((i % solutions.length) + solutions.length) % solutions.length;
    set({ currentSolution: idx });
  },

  totalPieceVolume: () =>
    get().pieces.reduce((s, p) => s + p.cells.length, 0),
}));

export { MAX_PIECES };
