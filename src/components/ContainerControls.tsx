import { useStore } from "../store";
import { Section, NumberStepper } from "./ui";
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
          className={`btn !px-2.5 !py-1 text-xs ${
            active ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => setEditTarget({ kind: "container" })}
        >
          {active ? "Editing" : "Edit shape"}
        </button>
      }
    >
      <div className="flex items-end justify-between gap-2">
        <NumberStepper label="X" value={dx} onChange={(v) => setDim(0, v)} />
        <NumberStepper label="Y" value={dy} onChange={(v) => setDim(1, v)} />
        <NumberStepper label="Z" value={dz} onChange={(v) => setDim(2, v)} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          <span className="font-semibold text-slate-200 tabular-nums">
            {container.cells.length}
          </span>{" "}
          / {dx * dy * dz} cells filled
        </span>
        <div className="flex gap-1.5">
          <button className="btn btn-ghost !px-2.5 !py-1 text-xs" onClick={fillContainer}>
            Fill
          </button>
          <button className="btn btn-ghost !px-2.5 !py-1 text-xs" onClick={clearContainer}>
            Clear
          </button>
        </div>
      </div>
    </Section>
  );
}
