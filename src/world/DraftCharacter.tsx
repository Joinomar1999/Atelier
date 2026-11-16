import { Suspense } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AREAS } from "./areas";
import type { CharacterPlacement } from "./characters";

// Loads one draft character glTF and places it on its area. Static: no agent state.
function Model({ file }: { file: string }) {
  const gltf = useLoader(GLTFLoader, file);
  return <primitive object={gltf.scene} />;
}

export function DraftCharacter({ c }: { c: CharacterPlacement }) {
  const area = AREAS.find((a) => a.id === c.area)!;
  const base: [number, number, number] = [
    area.position[0] + c.offset[0],
    area.position[1] + area.size[1] / 2 + c.offset[1] * 0,
    area.position[2] + c.offset[2],
  ];
  return (
    <group position={base} rotation={[0, c.rotationY, 0]} name={c.name}>
      <Suspense fallback={null}>
        <Model file={c.file} />
      </Suspense>
    </group>
  );
}
