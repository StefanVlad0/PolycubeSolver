import { useStore } from "../store";
import { Section } from "./ui";
import type { Vec3 } from "../types";

export function ContainerControls() {
  const container = useStore((s) => s.container);
  const editTarget = useStore((s) => s.editTarget);
  const setContainerDims = useStore((s) => s.setContainerDims);
  const fillContainer = useStore((s) => s.fillContainer);
  const clearContainer = useStore((s) => s.clearContainer);
  const setEditTarget = useStore((s) => s.setEditTarget);

  const active = editTarget.kind === "container";
  const [dx, dy, dz] = container.dims;
  const total = dx * dy * dz;

  const setDim = (i: number, v: number) => {
    const dims: Vec3 = [...container.dims] as Vec3;
    dims[i] = v;
    setContainerDims(dims);
  };

  return (
    <Section
      title="Container"
      right={
        <button
          type="button"
          className={`btn !px-2 !py-1 text-xs ${
            active ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => setEditTarget({ kind: "container" })}
          title={active ? "Editing container" : "Edit container shape"}
        >
          {active ? "Editing" : "Edit"}
        </button>
      }
    >
      <p className="mb-2 text-[11px] leading-snug text-slate-500">
        Size of the puzzle box - how many cells wide, tall, and deep.
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        <DimStep label="W" title="Width (cells)" value={dx} onChange={(v) => setDim(0, v)} />
        <DimStep label="H" title="Height (cells)" value={dy} onChange={(v) => setDim(1, v)} />
        <DimStep label="D" title="Depth (cells)" value={dz} onChange={(v) => setDim(2, v)} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[11px] text-slate-400">
          <span className="font-semibold tabular-nums text-slate-200">
            {container.cells.length}
          </span>
          /{total} cells to fill
        </span>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="btn btn-ghost !px-2 !py-0.5 text-[11px]"
            onClick={fillContainer}
          >
            Fill
          </button>
          <button
            type="button"
            className="btn btn-ghost !px-2 !py-0.5 text-[11px]"
            onClick={clearContainer}
          >
            Clear
          </button>
        </div>
      </div>
    </Section>
  );
}

function DimStep({
  label,
  title,
  value,
  onChange,
}: {
  label: string;
  title?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.max(1, Math.min(8, v));
  return (
    <div className="min-w-0" title={title}>
      <span className="mb-0.5 block truncate text-center text-[10px] font-semibold text-slate-500">
        {label}
      </span>
      <div className="flex items-center justify-center rounded-lg bg-white/5">
        <button
          type="button"
          className="grid h-6 w-6 shrink-0 place-items-center text-xs text-slate-400 hover:text-slate-200"
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-4 shrink-0 text-center text-xs font-bold tabular-nums text-slate-100">
          {value}
        </span>
        <button
          type="button"
          className="grid h-6 w-6 shrink-0 place-items-center text-xs text-slate-400 hover:text-slate-200"
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
