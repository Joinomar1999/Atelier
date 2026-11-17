import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Drag to rotate, scroll or pinch to zoom, right-drag to pan. Keeps the camera above the floor.
export function Controls() {
  const { camera, gl } = useThree();
  const ref = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.target.set(0, 0, 0);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.minDistance = 3;
    c.maxDistance = 40;
    c.maxPolarAngle = Math.PI * 0.42;
    c.update();
    ref.current = c;
    return () => { c.dispose(); ref.current = null; };
  }, [camera, gl]);

  useFrame(() => ref.current?.update());
  return null;
}
