import { Canvas } from "@react-three/fiber";
import { AREAS } from "./areas";

// Phase 1: blockout only. No agent state is read or shown here yet.
export function Atelier() {
  return (
    <Canvas
      camera={{ position: [0, 12, 17], fov: 40 }}
      shadows
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#efe9df"]} />
      <hemisphereLight args={["#ffffff", "#8a7a60", 0.8]} />
      <directionalLight position={[6, 12, 6]} intensity={0.6} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#d8cdb8" roughness={0.9} />
      </mesh>
      {AREAS.map((a) => (
        <mesh key={a.id} position={a.position} castShadow receiveShadow>
          <boxGeometry args={a.size} />
          <meshStandardMaterial color={a.color} roughness={0.8} />
        </mesh>
      ))}
    </Canvas>
  );
}
