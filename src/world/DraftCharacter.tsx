import { Suspense, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { AREAS, type AreaId } from "./areas";
import type { CharacterPlacement } from "./characters";
import { AGENTS } from "../agents/registry";
import { useAgents } from "../agents/store";
import { areaFor, FACES_VIEWER } from "../agents/behaviour";

const SPEED = 1.1; // world units per second

function Model({ file }: { file: string }) {
  const gltf = useLoader(GLTFLoader, file);
  return <primitive object={gltf.scene} />;
}

// Each agent takes a slot in the area it is in, so several agents do not overlap.
function slotFor(agentIndex: number, area: AreaId): [number, number] {
  const slot = agentIndex % 3;
  const x = (slot - 1) * 0.9;
  const z = area === "hub" ? 0.9 : 0.4;
  return [x, z];
}

export function DraftCharacter({ c }: { c: CharacterPlacement }) {
  const group = useRef<THREE.Group>(null);
  const agentIndex = AGENTS.findIndex((a) => a.characterId === c.id);
  const agent = useAgents((s) => s.agents[AGENTS[agentIndex]?.id ?? ""]);
  const state = agent?.state ?? "idle";
  const area = AREAS.find((a) => a.id === areaFor(state))!;
  const faces = FACES_VIEWER.includes(state);
  const target = useRef(new THREE.Vector3());
  const heading = useRef(c.rotationY);

  useFrame((clock, dt) => {
    const g = group.current;
    if (!g) return;
    const [sx, sz] = slotFor(agentIndex < 0 ? 0 : agentIndex, area.id);
    const top = area.position[1] + area.size[1] / 2;
    target.current.set(area.position[0] + sx, top, area.position[2] + sz);

    const pos = g.position;
    const to = target.current.clone().sub(pos);
    const dist = to.length();
    if (dist > 0.02) {
      const step = Math.min(dist, SPEED * dt);
      pos.add(to.normalize().multiplyScalar(step));
      heading.current = Math.atan2(to.x, to.z);
    }
    // Waiting or blocked: stop and face the viewer. Otherwise face the way it walks.
    const want = faces ? 0 : heading.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, want, Math.min(1, dt * 6));
    // Small bob while waiting for the user, to show the request for attention.
    const bob = faces && dist < 0.05 ? Math.sin(clock.clock.elapsedTime * 3) * 0.012 : 0;
    g.position.y = top + bob;
  });

  return (
    <group ref={group} position={[0, 0, 0]} name={c.name}>
      <Suspense fallback={null}>
        <Model file={c.file} />
      </Suspense>
    </group>
  );
}
