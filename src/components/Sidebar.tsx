import { useStore } from "../store";
import { PieceList } from "./PieceList";
import { ContainerControls } from "./ContainerControls";
import { SolvePanel } from "./SolvePanel";
import { PuzzleLogo } from "./PuzzleLogo";

export function Sidebar() {
  const loadSoma = useStore((s) => s.loadSoma);
  const loadEmpty = useStore((s) => s.loadEmpty);
  const sidebarLocked = useStore((s) => s.sidebarLocked);

  return (
    <aside className="relative flex h-full w-[22rem] shrink-0 flex-col gap-3 overflow-y-auto p-3">
      <div
        className={`flex flex-1 flex-col gap-3 transition-opacity ${
          sidebarLocked ? "pointer-events-none select-none opacity-35" : ""
        }`}
        aria-hidden={sidebarLocked}
      >
      <header className="glass rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white shadow-md ring-1 ring-slate-200/80">
            <PuzzleLogo size={48} />
          </div>
          <div>
            <h1 className="brand-title">PolycubeSolver</h1>
            <p className="text-xs text-slate-400">
              Design pieces · solve any polycube puzzle
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

      <footer className="mt-auto space-y-2 px-1 pb-1 pt-2 text-center text-[11px] leading-relaxed text-slate-600">
        <p>
          Drag to orbit · scroll to zoom · click cells in the 3D view to sculpt
          pieces & the container.
        </p>
        <p className="text-slate-500">
          Made with <span aria-hidden="true">❤️</span> by{" "}
          <a
            href="https://github.com/StefanVlad0"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-400 underline-offset-2 transition-colors hover:text-indigo-300 hover:underline"
          >
            Vlad Stefan
          </a>
        </p>
      </footer>
      </div>
    </aside>
  );
}
