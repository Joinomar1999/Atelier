// The first build: a small house, six steps, built by Nora. Each step is one Piece.
import type { Piece } from "./worldStore";

// Plot origin is the centre of the house footprint on the ground. Plots are spaced 7 m apart on x.
export function housePlan(plotX: number, builtBy: string, idPrefix: string): Piece[] {
  const at = (x: number, z: number) => ({ x: plotX + x, z });
  return [
    { kind: "platform", ...at(0, 0), rotY: 0, length: 3, builtBy, label: "Floor platform" },
    { kind: "wall", ...at(0, -1), rotY: 0, length: 3, opening: null, builtBy, label: "Back wall" },
    { kind: "wall", ...at(-1.5, 0), rotY: Math.PI / 2, length: 2, opening: null, builtBy, label: "Left wall" },
    { kind: "wall", ...at(1.5, 0), rotY: Math.PI / 2, length: 2, opening: "window", builtBy, label: "Right wall with window" },
    { kind: "wall", ...at(0, 1), rotY: 0, length: 3, opening: "door", builtBy, label: "Front wall with door" },
    { kind: "stair", ...at(0, 1.7), rotY: 0, length: 1, builtBy, label: "Entrance stairs" },
  ].map((p, i) => ({ ...p, id: `${idPrefix}-${i}` })) as Piece[];
}
