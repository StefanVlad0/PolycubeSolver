import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useStore } from "../store";
import { SceneFrame } from "./scene/SceneFrame";
import { EditorScene } from "./scene/EditorScene";
import { SolutionScene } from "./scene/SolutionScene";
import { StartupIntro } from "./scene/StartupIntro";
import { sceneExtent, DEFAULT_SPACING, MIN_SPACING, MAX_SPACING } from "../lib/grid";

function useExtent(spacing: number): { extent: number; camDist: number } {
  const container = useStore((s) => s.container);

  return useMemo(() => {
    const extent = sceneExtent(container.dims, spacing);
    return { extent, camDist: extent };
  }, [container, spacing]);
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
  const cellSpacing = useStore((s) => s.cellSpacing);
  const setCellSpacing = useStore((s) => s.setCellSpacing);
  const setEditTarget = useStore((s) => s.setEditTarget);

  const [viewing, setViewing] = useState(false);
  const [explode, setExplode] = useState(0);
  const [introDone, setIntroDone] = useState(false);

  const dismissIntro = () => {
    if (introDone) return;
    setIntroDone(true);
    if (pieces.length > 0) {
      setEditTarget({ kind: "piece", id: pieces[0].id });
    }
  };

  const editingPiece =
    editTarget.kind === "piece"
      ? pieces.find((p) => p.id === editTarget.id)
      : null;

  const hasSolutions = solutions.length > 0;
  const showSolution = viewing && hasSolutions;
  const showIntro = !introDone;

  useEffect(() => {
    if (meta && solutions.length > 0) setViewing(true);
  }, [meta, solutions.length]);

  useEffect(() => {
    setViewing(false);
  }, [editTarget, pieces, container]);

  const { extent } = useExtent(showIntro ? DEFAULT_SPACING : cellSpacing);
  const activeSpacing = showIntro ? DEFAULT_SPACING : cellSpacing;
  const camExtent = viewing
    ? sceneExtent(container.dims, activeSpacing) + explode
    : extent;

  return (
    <div
      className="relative h-full w-full"
      onPointerDown={dismissIntro}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{
          position: [camExtent * 2.3, camExtent * 1.9, camExtent * 2.7],
          fov: 42,
        }}
      >
        <SceneFrame
          extent={camExtent}
          autoRotate={showIntro}
          controlsEnabled={!showIntro}
        >
          {showIntro ? (
            <StartupIntro />
          ) : showSolution ? (
            <SolutionScene
              solution={solutions[currentSolution] ?? solutions[0]}
              container={container}
              explode={explode}
              spacing={cellSpacing}
            />
          ) : (
            <EditorScene />
          )}
        </SceneFrame>
      </Canvas>

      {/* Intro - example chip top left */}
      {showIntro && (
        <div className="pointer-events-none absolute left-4 top-4 z-10">
          <div className="animate-fade-in rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300/80">
              This example
            </p>
            <p className="mt-0.5 text-xs text-slate-300">
              Soma Cube · 7 pieces · 240 solutions
            </p>
          </div>
        </div>
      )}

      {/* Intro title overlay */}
      {showIntro && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-4">
          <div className="glass animate-fade-in max-w-sm rounded-2xl px-5 py-3 text-center">
            <p className="text-sm font-bold tracking-tight text-slate-100">PolycubeSolver</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Design pieces · solve any polycube puzzle
            </p>
            <p className="mt-2.5 text-xs font-medium text-slate-300">
              Click or drag to start
            </p>
          </div>
        </div>
      )}

      {/* Editor mode badge */}
      {!showIntro && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[15rem]">
          <div className="glass rounded-xl px-3 py-2 backdrop-blur">
            {showSolution ? (
              <EditorBadge
                color="bg-emerald-400"
                title={`Viewing solution ${currentSolution + 1} of ${solutions.length}`}
                hint="Drag to orbit · adjust Explode below"
              />
            ) : editTarget.kind === "piece" && editingPiece ? (
              <EditorBadge
                color="bg-indigo-400"
                title={`Editing ${editingPiece.name}`}
                hint="Click cells to build this piece"
              />
            ) : (
              <EditorBadge
                color="bg-sky-400"
                title="Editing target shape"
                hint="Click cells to define what must be filled"
              />
            )}
          </div>
        </div>
      )}

      {/* Support button - top right */}
      <a
        href="https://buymeacoffee.com/vladstefans"
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={(e) => e.stopPropagation()}
        className="btn btn-ghost absolute right-4 top-4 z-10 !px-3 !py-1.5 text-xs text-slate-400 backdrop-blur transition-colors hover:text-slate-200"
      >
        ☕ Support the project
      </a>

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

      {/* Spacing slider (editor) */}
      {introDone && !showSolution && (
        <div
          className="absolute bottom-4 right-4 glass flex items-center gap-2 rounded-2xl px-4 py-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-medium text-slate-300">Spacing</span>
          <input
            type="range"
            min={MIN_SPACING}
            max={MAX_SPACING}
            step={0.05}
            value={cellSpacing}
            onChange={(e) => setCellSpacing(parseFloat(e.target.value))}
            className="w-28 accent-indigo-400"
          />
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

function EditorBadge({
  color,
  title,
  hint,
}: {
  color: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`} />
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug text-slate-100">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</p>
      </div>
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
