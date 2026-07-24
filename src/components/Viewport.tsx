import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useStore } from "../store";
import { SceneFrame } from "./scene/SceneFrame";
import { EditorScene } from "./scene/EditorScene";
import { SolutionScene } from "./scene/SolutionScene";
import { sceneExtent } from "../lib/grid";

function useExtent(): { extent: number; camDist: number } {
  const container = useStore((s) => s.container);

  return useMemo(() => {
    const extent = sceneExtent(container.dims);
    return { extent, camDist: extent };
  }, [container]);
}

export function Viewport() {
  const status = useStore((s) => s.status);
  const meta = useStore((s) => s.meta);
  const solutions = useStore((s) => s.solutions);
  const container = useStore((s) => s.container);
  const currentSolution = useStore((s) => s.currentSolution);
  const setCurrentSolution = useStore((s) => s.setCurrentSolution);
  const editTarget = useStore((s) => s.editTarget);
  const pieces = useStore((s) => s.pieces);

  const [viewing, setViewing] = useState(false);
  const [explode, setExplode] = useState(0);

  const hasSolutions = solutions.length > 0;

  useEffect(() => {
    if (meta && solutions.length > 0) setViewing(true);
  }, [meta, solutions.length]);

  useEffect(() => {
    setViewing(false);
  }, [editTarget, pieces, container]);

  const { extent } = useExtent();
  const camExtent = viewing
    ? sceneExtent(container.dims) + explode
    : extent;

  const showSolution = viewing && hasSolutions;

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{
          position: [camExtent * 2.3, camExtent * 1.9, camExtent * 2.7],
          fov: 42,
        }}
      >
        <SceneFrame extent={camExtent}>
          {showSolution ? (
            <SolutionScene
              solution={solutions[currentSolution] ?? solutions[0]}
              container={container}
              explode={explode}
            />
          ) : (
            <EditorScene />
          )}
        </SceneFrame>
      </Canvas>

      {/* Top-left mode badge */}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
        <div className="chip pointer-events-auto backdrop-blur">
          {showSolution ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Viewing solution
            </>
          ) : editTarget.kind === "piece" ? (
            <>
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Editing piece — click cells to toggle
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Editing container — click cells to toggle
            </>
          )}
        </div>
      </div>

      {/* Solving overlay */}
      {status === "solving" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="glass animate-fade-in rounded-2xl px-6 py-4 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-300" />
            <div className="text-sm font-semibold text-slate-100">Solving…</div>
            <SolvingCounter />
          </div>
        </div>
      )}

      {/* Solution controls */}
      {showSolution && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <div className="glass flex items-center gap-3 rounded-2xl px-3 py-2">
            <button
              className="btn btn-ghost !px-3 !py-1.5"
              onClick={() => setCurrentSolution(currentSolution - 1)}
              disabled={solutions.length <= 1}
              aria-label="Previous solution"
            >
              ‹
            </button>
            <div className="min-w-[7rem] text-center text-sm font-semibold tabular-nums">
              Solution {currentSolution + 1}
              <span className="text-slate-400"> / {solutions.length}</span>
            </div>
            <button
              className="btn btn-ghost !px-3 !py-1.5"
              onClick={() => setCurrentSolution(currentSolution + 1)}
              disabled={solutions.length <= 1}
              aria-label="Next solution"
            >
              ›
            </button>
          </div>

          <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2">
            <span className="text-xs font-medium text-slate-300">Explode</span>
            <input
              type="range"
              min={0}
              max={4}
              step={0.05}
              value={explode}
              onChange={(e) => setExplode(parseFloat(e.target.value))}
              className="accent-cyan-400"
            />
          </div>
        </div>
      )}

      {hasSolutions && !viewing && (
        <button
          className="btn btn-primary absolute bottom-4 left-1/2 -translate-x-1/2"
          onClick={() => setViewing(true)}
        >
          View {solutions.length} solution{solutions.length > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

function SolvingCounter() {
  const progress = useStore((s) => s.progress);
  const settings = useStore((s) => s.settings);
  const shown = settings.dedupe === "none" ? progress.count : progress.distinctCount;
  return (
    <div className="mt-1 text-xs text-slate-400">
      {shown.toLocaleString()} found
      <span className="mx-1 text-slate-600">·</span>
      {progress.nodes.toLocaleString()} nodes
    </div>
  );
}
