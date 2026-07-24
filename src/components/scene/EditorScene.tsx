import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "../../store";
import { keyOf } from "../../lib/geometry";
import { cellToWorld } from "../../lib/grid";
import type { Vec3 } from "../../types";
import { VoxelCell } from "./VoxelCell";
import { GridPicker } from "./GridPicker";

export function EditorScene() {
  const editTarget = useStore((s) => s.editTarget);
  const pieces = useStore((s) => s.pieces);
  const container = useStore((s) => s.container);
  const togglePieceCell = useStore((s) => s.togglePieceCell);
  const toggleContainerCell = useStore((s) => s.toggleContainerCell);
  const [hovered, setHovered] = useState<Vec3 | null>(null);

  const model = useMemo(() => {
    const dims = container.dims;
    if (editTarget.kind === "piece") {
      const piece = pieces.find((p) => p.id === editTarget.id);
      if (!piece) return null;
      return {
        dims,
        filled: new Set(piece.cells.map(keyOf)),
        color: piece.color,
        onToggle: (c: Vec3) => togglePieceCell(piece.id, c),
      };
    }
    return {
      dims,
      filled: new Set(container.cells.map(keyOf)),
      color: "#8ab4ff",
      onToggle: (c: Vec3) => toggleContainerCell(c),
    };
  }, [editTarget, pieces, container, togglePieceCell, toggleContainerCell]);

  if (!model) return null;

  const [dx, dy, dz] = model.dims;
  const hoveredKey = hovered ? keyOf(hovered) : null;
  const filledCells: ReactNode[] = [];
  const ghostCells: ReactNode[] = [];

  for (let x = 0; x < dx; x++) {
    for (let y = 0; y < dy; y++) {
      for (let z = 0; z < dz; z++) {
        const cell: Vec3 = [x, y, z];
        const pos = cellToWorld(cell, model.dims);
        const k = keyOf(cell);
        const isFilled = model.filled.has(k);
        const highlighted = hoveredKey === k;

        if (isFilled) {
          filledCells.push(
            <VoxelCell
              key={`f-${x}-${y}-${z}`}
              position={pos}
              color={model.color}
              variant="filled"
              highlighted={highlighted}
            />,
          );
        } else {
          ghostCells.push(
            <VoxelCell
              key={`g-${x}-${y}-${z}`}
              position={pos}
              color={model.color}
              variant="ghost"
              highlighted={highlighted}
            />,
          );
        }
      }
    }
  }

  return (
    <group>
      <GridPicker
        dims={model.dims}
        onPick={model.onToggle}
        onHover={setHovered}
      />
      {ghostCells}
      {filledCells}
    </group>
  );
}
