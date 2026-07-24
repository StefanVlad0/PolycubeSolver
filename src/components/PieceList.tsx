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
                placeholder="Piece name"
              />

              <span
                className="chip shrink-0 whitespace-nowrap !px-1.5 !py-0.5 text-[10px] leading-none tabular-nums"
                title={`${p.cells.length} unit cube${p.cells.length === 1 ? "" : "s"}`}
              >
                {p.cells.length}&nbsp;cubes
              </span>

              <button
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  active
                    ? "bg-indigo-500/30 text-indigo-100"
                    : "text-slate-300 hover:bg-white/10"
                }`}
                onClick={() => setEditTarget({ kind: "piece", id: p.id })}
                title={active ? "Editing piece" : "Edit piece"}
                aria-label={active ? "Editing piece" : "Edit piece"}
              >
                <PencilIcon />
              </button>

              <button
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-30"
                onClick={() => removePiece(p.id)}
                disabled={pieces.length <= 1}
                title="Delete piece"
                aria-label="Delete piece"
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
