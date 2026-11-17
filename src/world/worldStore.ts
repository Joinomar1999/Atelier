// The built world: every finished piece, plus where the next piece should go.
// Pieces are added by the build runner when an agent finishes a step of its task.
import { create } from "zustand";

export type PieceKind = "platform" | "wall" | "stair";
export type Opening = "door" | "window" | null;

export interface Piece {
  id: string;
  kind: PieceKind;
  x: number;
  z: number;
  rotY: number;          // 0 or PI/2 for walls
  length: number;        // metres along the piece
  opening?: Opening;     // walls only
  builtBy: string;       // agent id
  label: string;         // e.g. "Front wall with door"
}

interface WorldStore {
  pieces: Piece[];
  buildTarget: { x: number; z: number } | null;
  addPiece: (p: Piece) => void;
  setBuildTarget: (t: { x: number; z: number } | null) => void;
}

export const useWorld = create<WorldStore>((set) => ({
  pieces: [],
  buildTarget: null,
  addPiece: (p) => set((s) => ({ pieces: [...s.pieces, p] })),
  setBuildTarget: (t) => set({ buildTarget: t }),
}));
