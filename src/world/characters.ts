// Draft characters and where each one stands in the world (static placement only).
// No agent state drives these yet; that comes in phase 5.
import type { AreaId } from "./areas";

export interface CharacterPlacement {
  id: string;
  name: string;
  file: string;
  area: AreaId;
  offset: [number, number, number];
  rotationY: number;
}

export const CHARACTERS: CharacterPlacement[] = [
  { id: "nora", name: "Nora", file: "/models/nora.glb", area: "library", offset: [-0.8, 0.8, 1.3], rotationY: Math.PI },
  { id: "otto", name: "Otto", file: "/models/otto.glb", area: "workshop", offset: [0.9, 0.8, 0.4], rotationY: Math.PI },
  { id: "mika", name: "Mika", file: "/models/mika.glb", area: "hub", offset: [0, 0.3, 1.5], rotationY: Math.PI },
  { id: "eli", name: "Eli", file: "/models/eli.glb", area: "workshop", offset: [-1.2, 0.8, 0.5], rotationY: Math.PI },
  { id: "ari", name: "Ari", file: "/models/ari.glb", area: "gallery", offset: [0, 1.0, 0.9], rotationY: Math.PI },
  { id: "pip", name: "Pip", file: "/models/pip.glb", area: "garden", offset: [0.8, 0.9, 0.6], rotationY: Math.PI },
];
