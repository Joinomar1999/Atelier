import * as THREE from "three";
import { useWorld, type Piece } from "./worldStore";

// Flat-shaded materials for the built pieces. Flat style, one colour per material.
const MAT = {
  stone: new THREE.MeshLambertMaterial({ color: 0xcfc4ae, flatShading: true }),
  cream: new THREE.MeshLambertMaterial({ color: 0xf1e8d6, flatShading: true }),
  door: new THREE.MeshLambertMaterial({ color: 0x7a5a3a, flatShading: true }),
  glass: new THREE.MeshLambertMaterial({ color: 0x9cc7d9, flatShading: true }),
};

function PieceMesh({ p }: { p: Piece }) {
  if (p.kind === "platform") {
    return (
      <mesh position={[p.x, 0.05, p.z]} rotation={[0, p.rotY, 0]} material={MAT.stone}>
        <boxGeometry args={[p.length, 0.1, 2]} />
      </mesh>
    );
  }
  if (p.kind === "stair") {
    return (
      <group position={[p.x, 0, p.z]} rotation={[0, p.rotY, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.05 + i * 0.1, 0.35 - i * 0.2]} material={MAT.stone}>
            <boxGeometry args={[1, 0.1, 0.25]} />
          </mesh>
        ))}
      </group>
    );
  }
  // wall: sits on top of the platform (0.1 high)
  const len = p.length;
  const wallH = 1.0;
  return (
    <group position={[p.x, 0.1, p.z]} rotation={[0, p.rotY, 0]}>
      {/* Solid wall with an opening cut out as a separate piece, so door and window read clearly */}
      <mesh position={[0, wallH / 2, 0]} material={MAT.cream}>
        <boxGeometry args={[len, wallH, 0.15]} />
      </mesh>
      {p.opening === "door" && (
        <mesh position={[-len / 2 + 0.5, 0.35, 0.08]} material={MAT.door}>
          <boxGeometry args={[0.6, 0.7, 0.04]} />
        </mesh>
      )}
      {p.opening === "window" && (
        <mesh position={[0, 0.6, 0.08]} material={MAT.glass}>
          <boxGeometry args={[0.6, 0.4, 0.04]} />
        </mesh>
      )}
    </group>
  );
}

export function Pieces() {
  const pieces = useWorld((s) => s.pieces);
  return <>{pieces.map((p) => <PieceMesh key={p.id} p={p} />)}</>;
}
