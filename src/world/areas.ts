// The five areas from the brief. Positions are placeholder blockout coordinates.
export type AreaId = "workshop" | "library" | "hub" | "garden" | "gallery";

export interface Area {
  id: AreaId;
  label: string;
  color: string;
  position: [number, number, number];
  size: [number, number, number];
}

export const AREAS: Area[] = [
  { id: "workshop", label: "Workshop", color: "#b89268", position: [-4, 0.4, -2], size: [4, 0.8, 3] },
  { id: "library", label: "Library", color: "#8c7a63", position: [4, 0.4, -2], size: [4, 0.8, 3] },
  { id: "hub", label: "Collaboration Hub", color: "#a9a195", position: [0, 0.3, 0], size: [3.5, 0.6, 3.5] },
  { id: "garden", label: "Garden", color: "#7d8f6c", position: [-4, 0.2, 3.5], size: [4, 0.4, 3] },
  { id: "gallery", label: "Gallery", color: "#c9c1b3", position: [4, 0.5, 3.5], size: [4, 1, 3] },
];
