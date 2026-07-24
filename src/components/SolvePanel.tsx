import { useStore } from "../store";
import { Section, Toggle } from "./ui";
import type { SymmetryMode } from "../types";

export function SolvePanel() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const solve = useStore((s) => s.solve);
  const cancelSolve = useStore((s) => s.cancelSolve);
  const status = useStore((s) => s.status);
  const meta = useStore((s) => s.meta);
  const errorMessage = useStore((s) => s.errorMessage);
  const container = useStore((s) => s.container);
  const totalPieceVolume = useStore((s) => s.totalPieceVolume());

  const volumeMatch = totalPieceVolume === container.cells.length;
  const solving = status === "solving";

  return (
    <Section title="Solver">
      <div className="mb-3 flex flex-col gap-0.5 rounded-xl bg-white/[0.03] p-1">
        <Toggle
          label="Allow reflections"
          hint="Pieces may be mirrored when placed"
          checked={settings.allowReflections}
          onChange={(v) => setSettings({ allowReflections: v })}
        />
      </div>

      <label className="mb-3 block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-400">
          Count solutions as
        </span>
        <select
          value={settings.dedupe}
          onChange={(e) =>
            setSettings({ dedupe: e.target.value as SymmetryMode })
          }
          className="w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/60"
        >
          <option value="none">All placements (raw count)</option>
          <option value="rotations">Unique up to rotation</option>
          <option value="rotations+reflections">
            Unique up to rotation + mirror
          </option>
        </select>
      </label>

      {/* Volume check */}
      <div
        className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
          volumeMatch
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : "border-amber-500/30 bg-amber-500/10 text-amber-200"
        }`}
      >
        <span className="font-medium">
          {volumeMatch ? "Volumes match" : "Volume mismatch"}
        </span>
        <span className="tabular-nums">
          {totalPieceVolume} pieces / {container.cells.length} cells
        </span>
      </div>

      {solving ? (
        <button className="btn btn-danger w-full" onClick={cancelSolve}>
          Cancel
        </button>
      ) : (
        <button
          className="btn btn-primary w-full"
          onClick={solve}
          disabled={!volumeMatch}
        >
          <span className="text-base">▶</span> Solve puzzle
        </button>
      )}

      {/* Results */}
      {status === "invalid" && errorMessage && (
        <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 animate-fade-in">
          {errorMessage}
        </p>
      )}
      {status === "error" && errorMessage && (
        <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 animate-fade-in">
          {errorMessage}
        </p>
      )}

      {status === "done" && meta && (
        <div className="mt-3 animate-fade-in">
          {meta.count === 0 ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-center">
              <div className="text-2xl">🚫</div>
              <div className="mt-1 text-sm font-semibold text-rose-200">
                No solutions exist
              </div>
              <div className="text-xs text-rose-300/70">
                These pieces can't fill the container.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-center">
              <div className="text-3xl font-extrabold tabular-nums text-emerald-200">
                {(settings.dedupe === "none"
                  ? meta.count
                  : meta.distinctCount
                ).toLocaleString()}
                {meta.capped ? "+" : ""}
              </div>
              <div className="text-sm font-semibold text-emerald-100">
                {settings.dedupe === "none"
                  ? "solutions found"
                  : "distinct solutions"}
              </div>
              {settings.dedupe !== "none" && (
                <div className="mt-0.5 text-xs text-emerald-300/70">
                  {meta.count.toLocaleString()}
                  {meta.capped ? "+" : ""} raw placements
                </div>
              )}
            </div>
          )}
          <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span>{Math.round(meta.elapsedMs)} ms</span>
            {meta.capped && <span className="text-amber-400">· capped</span>}
          </div>
        </div>
      )}
    </Section>
  );
}
