import { Canvas } from "@react-three/fiber";
import { AREAS } from "./areas";
import { CHARACTERS } from "./characters";
import { DraftCharacter } from "./DraftCharacter";
import { Controls } from "./Controls";
import { Pieces } from "./Pieces";

// The flat world: one flat ground, flat zones for each area, and the things built so far.
export function Atelier() {
  return (
    <Canvas camera={{ position: [0, 17, 14], fov: 42 }} style={{ width: "100%", height: "100%" }}>
      <Controls />
      <color attach="background" args={["#efe9df"]} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[6, 12, 6]} intensity={0.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#e7dfcd" />
      </mesh>
      {AREAS.map((a) => (
        <mesh key={a.id} rotation={[-Math.PI / 2, 0, 0]} position={[a.position[0], 0.003, a.position[2]]}>
          <circleGeometry args={[a.size[0], 6]} />
          <meshLambertMaterial color={a.color} flatShading />
        </mesh>
      ))}
      <Pieces />
      {CHARACTERS.map((c) => (
        <DraftCharacter key={c.id} c={c} />
      ))}
    </Canvas>
  );
}
