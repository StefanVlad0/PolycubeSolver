import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { Vec3 } from "../../types";
import { pickCellAtNdc, pointerToNdc } from "../../lib/pickCell";

const DRAG_THRESHOLD_PX = 6;

interface Props {
  dims: Vec3;
  spacing: number;
  onPick: (cell: Vec3) => void;
  onHover: (cell: Vec3 | null) => void;
}

/** Screen-space cell picker - not blocked by outer voxels. */
export function GridPicker({ dims, spacing, onPick, onHover }: Props) {
  const { gl, camera } = useThree();
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const onPickRef = useRef(onPick);
  const onHoverRef = useRef(onHover);
  onPickRef.current = onPick;
  onHoverRef.current = onHover;

  useEffect(() => {
    const canvas = gl.domElement;

    const pick = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const { x, y } = pointerToNdc(clientX, clientY, rect);
      return pickCellAtNdc(x, y, camera, dims, spacing);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      downRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      onHoverRef.current(pick(e.clientX, e.clientY));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0 || !downRef.current) return;
      const dx = e.clientX - downRef.current.x;
      const dy = e.clientY - downRef.current.y;
      downRef.current = null;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) return;

      const cell = pick(e.clientX, e.clientY);
      if (cell) onPickRef.current(cell);
    };

    const onLeave = () => onHoverRef.current(null);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, camera, dims, spacing]);

  return null;
}
