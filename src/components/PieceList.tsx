import { useStore, MAX_PIECES } from "../store";
import { Section } from "./ui";

export function PieceList() {
  const pieces = useStore((s) => s.pieces);
  const editTarget = useStore((s) => s.editTarget);
  const addPiece = useStore((s) => s.addPiece);
  const removePiece = useStore((s) => s.removePiece);
  const renamePiece = useStore((s) => s.renamePiece);
  const setPieceColor = useStore((s) => s.setPieceColor);
  const setEditTarget = useStore((s) => s.setEditTarget);

  return (
    <Section
      title={`Pieces · ${pieces.length}/${MAX_PIECES}`}
      right={
        <button
          className="btn btn-ghost !px-2.5 !py-1 text-xs"
          onClick={addPiece}
          disabled={pieces.length >= MAX_PIECES}
        >
          + Add
        </button>
      }
    >
      <div className="flex flex-col gap-2">
        {pieces.map((p) => {
          const active =
            editTarget.kind === "piece" && editTarget.id === p.id;
          return (
            <div
              key={p.id}
              className={`group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all ${
                active
                  ? "border-indigo-400/50 bg-indigo-500/10 shadow-glow"
                  : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <label
                className="relative h-7 w-7 shrink-0 cursor-pointer rounded-lg ring-1 ring-white/20"
                style={{ background: p.color }}
                title="Change color"
              >
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) => setPieceColor(p.id, e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>

              <input
                value={p.name}
                onChange={(e) => renamePiece(p.id, e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Name"
              />

              <span className="chip !px-2 !py-0.5 tabular-nums">
                {p.cells.length}
              </span>

              <button
                className={`rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-indigo-500/30 text-indigo-100"
                    : "text-slate-300 hover:bg-white/10"
                }`}
                onClick={() => setEditTarget({ kind: "piece", id: p.id })}
              >
                {active ? "Editing" : "Edit"}
              </button>

              <button
                className="rounded-lg px-1.5 py-1 text-slate-500 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                onClick={() => removePiece(p.id)}
                disabled={pieces.length <= 1}
                title="Delete piece"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
