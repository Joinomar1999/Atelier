import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { AREAS } from "./areas";
import type { CharacterPlacement } from "./characters";
import { AGENTS } from "../agents/registry";
import { useAgents } from "../agents/store";
import { useWorld } from "./worldStore";
import { textSprite } from "./sprites";

// Each character acts on its agent's real state:
// - waiting for you: stands at the hub front, faces you, bobs, shows a "?" cloud
// - working: walks to its work spot and works (builders go to the build site)
// - idle: walks around the flat world; after a while it lies down and sleeps ("Zz")
// Arms are not rigged yet, so the motion is whole-body until the rig phase.
const WORLD = 9;
const EXCLUDED = [
  ...AREAS.map((a) => ({ x: a.position[0], z: a.position[2], r: a.size[0] + 0.8 })),
  { x: 4.5, z: 0, r: 4.5 }, // the build plots
];
const CAMERA_XZ = { x: 0, z: 14 };

function slotFor(i: number): [number, number] {
  return [(i % 3 - 1) * 0.8, 0];
}

function randomSpot(): { x: number; z: number } {
  for (let tries = 0; tries < 40; tries++) {
    const x = (Math.random() * 2 - 1) * WORLD;
    const z = (Math.random() * 2 - 1) * WORLD * 0.8;
    if (EXCLUDED.every((e) => Math.hypot(x - e.x, z - e.z) > e.r)) return { x, z };
  }
  return { x: 0, z: 4 };
}

function Model({ file }: { file: string }) {
  const gltf = useLoader(GLTFLoader, file);
  return <primitive object={gltf.scene} />;
}

export function DraftCharacter({ c }: { c: CharacterPlacement }) {
  const agentIndex = AGENTS.findIndex((a) => a.characterId === c.id);
  const agentDef = AGENTS[agentIndex];
  const agent = useAgents((s) => (agentDef ? s.agents[agentDef.id] : undefined));
  const buildTarget = useWorld((s) => s.buildTarget);
  const state = agent?.state ?? "idle";

  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const cloud = useMemo(() => textSprite("?", "#2b2620", "#ffffff"), []);
  const zz = useMemo(() => textSprite("Zz", "#2b2620", "#e8efe0"), []);
  const pos = useRef({ x: (agentIndex - 1.5) * 1.5, z: 3 + (agentIndex % 2) * 1.2 });
  const s = useRef({
    heading: 0, target: null as null | { x: number; z: number }, face: null as null | number,
    idle: 0, wait: 0.5, sleeping: false, lean: 0, t: 0, last: "",
  });

  useEffect(() => {
    return () => { cloud.material.map?.dispose(); zz.material.map?.dispose(); };
  }, [cloud, zz]);

  useFrame((clock, dt) => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const st = s.current;
    st.t += dt;
    const p = pos.current;

    if (state !== st.last) {
      st.last = state;
      st.idle = 0;
      st.sleeping = false;
      st.target = null;
    }

    let mode: "ask" | "work" | "idle" = "idle";
    if (state === "waiting_input" || state === "failed") mode = "ask";
    else if (state === "executing" || state === "researching" || state === "collaborating") mode = "work";

    let bob = 0;
    let lean = 0;
    let speed = 1.1;
    let target: { x: number; z: number } | null = null;

    if (mode === "ask") {
      const [sx, sz] = slotFor(agentIndex);
      target = { x: -2 + sx, z: -6 + 1.8 };    // hub front
      st.face = Math.atan2(CAMERA_XZ.x - p.x, CAMERA_XZ.z - p.z);
      bob = Math.sin(st.t * 3) * 0.015;
    } else if (mode === "work") {
      if (agentDef?.id === "nora" && buildTarget) {
        target = { x: buildTarget.x, z: buildTarget.z + 1.5 };
        st.face = Math.atan2(buildTarget.x - target.x, buildTarget.z - target.z);
      } else {
        const [sx, sz] = slotFor(agentIndex);
        const area = AREAS.find((a) => a.id === "workshop")!;
        target = { x: area.position[0] + sx, z: area.position[2] + 1.8 + sz };
        st.face = null;
      }
      lean = 0.25;
      bob = Math.abs(Math.sin(st.t * 6)) * 0.02;
    } else {
      st.idle += dt;
      st.face = null;
      if (st.idle > 8) st.sleeping = true;
      if (!st.sleeping) {
        if (!st.target) {
          if (st.wait > 0) st.wait -= dt;
          else { st.target = randomSpot(); }
        }
        target = st.target;
        speed = 0.9;
      }
    }

    // move toward the target
    if (target && !st.sleeping) {
      const dx = target.x - p.x, dz = target.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.03) {
        const step = Math.min(d, speed * dt);
        p.x += (dx / d) * step;
        p.z += (dz / d) * step;
        st.heading = Math.atan2(dx, dz);
      } else if (mode === "idle") {
        st.target = null;
        st.wait = 1.5 + Math.random() * 2.5;
      }
    }

    const wantYaw = st.face ?? st.heading;
    o.rotation.y = THREE.MathUtils.lerp(o.rotation.y, wantYaw, Math.min(1, dt * 6));
    o.position.set(p.x, 0, p.z);

    // lying down when sleeping, otherwise lean/bob
    const pitch = st.sleeping ? -Math.PI / 2 : lean;
    i.rotation.x = THREE.MathUtils.lerp(i.rotation.x, pitch, Math.min(1, dt * 4));
    i.position.y = st.sleeping ? 0.07 : bob;

    cloud.visible = mode === "ask";
    cloud.position.set(0, 0.55, 0);
    zz.visible = st.sleeping;
    zz.position.set(0.1, 0.5 + Math.sin(st.t * 2) * 0.02, 0);
  });

  return (
    <group ref={outer} name={c.name}>
      <group ref={inner}>
        <Suspense fallback={null}>
          <Model file={c.file} />
        </Suspense>
      </group>
      <primitive object={cloud} />
      <primitive object={zz} />
    </group>
  );
}
