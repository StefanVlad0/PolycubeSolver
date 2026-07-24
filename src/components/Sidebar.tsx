import { useStore } from "../store";
import { PieceList } from "./PieceList";
import { ContainerControls } from "./ContainerControls";
import { SolvePanel } from "./SolvePanel";

export function Sidebar() {
  const loadSoma = useStore((s) => s.loadSoma);
  const loadEmpty = useStore((s) => s.loadEmpty);

  return (
    <aside className="flex h-full w-[22rem] shrink-0 flex-col gap-3 overflow-y-auto p-3">
      <header className="glass rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-glow">
            <CubeGlyph />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight gradient-text">
              PolycubeSolver
            </h1>
            <p className="text-xs text-slate-400">
              Design pieces · solve like a Soma Cube
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn btn-ghost flex-1 text-xs" onClick={loadSoma}>
            Soma preset
          </button>
          <button className="btn btn-ghost flex-1 text-xs" onClick={loadEmpty}>
            Start blank
          </button>
        </div>
      </header>

      <PieceList />
      <ContainerControls />
      <SolvePanel />

      <footer className="mt-auto px-1 pb-1 pt-2 text-center text-[11px] leading-relaxed text-slate-600">
        Drag to orbit · scroll to zoom · click cells in the 3D view to sculpt
        pieces & the container.
      </footer>
    </aside>
  );
}

function CubeGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
      <g
        stroke="#0b0d1a"
        strokeWidth="3.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M32 6 54 18v28L32 58 10 46V18z" fill="rgba(11,13,26,0.15)" />
        <path d="M32 6 32 32 54 18" />
        <path d="M32 32 32 58" />
        <path d="M32 32 10 18" />
      </g>
    </svg>
  );
}
