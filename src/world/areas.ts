// The five areas as flat zones on the ground. Positions are on the flat world, in metres.
export type AreaId = "workshop" | "library" | "hub" | "garden" | "gallery";

export interface Area {
  id: AreaId;
  label: string;
  color: string;
  position: [number, number, number];
  size: [number, number, number];   // [radius, unused, unused]: zones are round and flat
}

export const AREAS: Area[] = [
  { id: "library", label: "Library", color: "#d8c9a8", position: [-8, 0, -6], size: [2.2, 0, 0] },
  { id: "workshop", label: "Workshop", color: "#e6cba5", position: [8, 0, -6], size: [2.2, 0, 0] },
  { id: "hub", label: "Collaboration Hub", color: "#d5d0c8", position: [0, 0, -9], size: [2.2, 0, 0] },
  { id: "garden", label: "Garden", color: "#c6d3b1", position: [-8, 0, 6], size: [2.2, 0, 0] },
  { id: "gallery", label: "Gallery", color: "#e2dcc9", position: [8, 0, 6], size: [2.2, 0, 0] },
];
