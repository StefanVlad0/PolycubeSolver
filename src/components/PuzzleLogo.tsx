import { getSomaIntroSolution } from "../lib/somaIntro";

interface Props {
  size?: number;
}

type Point = [number, number];
type FaceTone = "top" | "mid" | "deep";

const UNIT = 4;

function proj(px: number, py: number, pz: number): Point {
  return [(px - pz) * UNIT, (px + pz) * (UNIT * 0.5) - py * UNIT];
}

function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

function tuneLightness(hex: string, delta: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.min(94, Math.max(24, l + delta)));
}

const GRID_STROKE = "#111827";

/** Simulated light from top-left — keeps hue, only shifts lightness. */
function faceFill(hex: string, tone: FaceTone): string {
  return tone === "top" ? tuneLightness(hex, 7) : tone === "mid" ? hex : tuneLightness(hex, -8);
}

function cellKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

interface Face {
  points: Point[];
  fill: string;
  depth: number;
}

function buildScene(): { faces: Face[]; viewBox: string } {
  const solution = getSomaIntroSolution();
  const occupied = new Map<string, string>();
  for (const piece of solution) {
    for (const [x, y, z] of piece.cells) {
      occupied.set(cellKey(x, y, z), piece.color);
    }
  }

  const faces: Face[] = [];

  for (const [key, color] of occupied) {
    const [x, y, z] = key.split(",").map(Number);

    const addFace = (
      corners: [number, number, number][],
      tone: FaceTone,
      depthAt: [number, number, number],
    ) => {
      const points = corners.map(([px, py, pz]) => proj(px, py, pz));
      const [dx, dy, dz] = depthAt;
      const style = faceFill(color, tone);
      faces.push({
        points,
        fill: style,
        depth: dx + dz - dy,
      });
    };

    if (!occupied.has(cellKey(x, y + 1, z))) {
      addFace(
        [
          [x, y + 1, z],
          [x + 1, y + 1, z],
          [x + 1, y + 1, z + 1],
          [x, y + 1, z + 1],
        ],
        "top",
        [x + 0.5, y + 1, z + 0.5],
      );
    }

    if (!occupied.has(cellKey(x + 1, y, z))) {
      addFace(
        [
          [x + 1, y, z],
          [x + 1, y, z + 1],
          [x + 1, y + 1, z + 1],
          [x + 1, y + 1, z],
        ],
        "mid",
        [x + 1, y + 0.5, z + 0.5],
      );
    }

    if (!occupied.has(cellKey(x, y, z + 1))) {
      addFace(
        [
          [x, y, z + 1],
          [x + 1, y, z + 1],
          [x + 1, y + 1, z + 1],
          [x, y + 1, z + 1],
        ],
        "deep",
        [x + 0.5, y + 0.5, z + 1],
      );
    }
  }

  faces.sort((a, b) => a.depth - b.depth);

  let mnx = Infinity;
  let mny = Infinity;
  let mxx = -Infinity;
  let mxy = -Infinity;
  for (const face of faces) {
    for (const [sx, sy] of face.points) {
      mnx = Math.min(mnx, sx);
      mxx = Math.max(mxx, sx);
      mny = Math.min(mny, sy);
      mxy = Math.max(mxy, sy);
    }
  }

  const pad = UNIT * 0.22;
  const viewBox = `${mnx - pad} ${mny - pad} ${mxx - mnx + pad * 2} ${mxy - mny + pad * 2}`;
  return { faces, viewBox };
}

function polygonPath(points: Point[]): string {
  return `M${points.map(([x, y]) => `${x},${y}`).join(" L")} Z`;
}

const { faces, viewBox } = buildScene();
const strokeWidth = UNIT * 0.1;

/** Assembled 3×3×3 Soma cube with soft lighting for depth. */
export function PuzzleLogo({ size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      aria-hidden
      overflow="visible"
    >
      {faces.map((face, i) => (
        <path key={i} d={polygonPath(face.points)} fill={face.fill} />
      ))}
      {faces.map((face, i) => (
        <path
          key={`s-${i}`}
          d={polygonPath(face.points)}
          fill="none"
          stroke={GRID_STROKE}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
