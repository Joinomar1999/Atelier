import * as THREE from "three";

// Small text sprites: a "?" thought cloud and "Zz" for sleeping. Built once per character.
export function textSprite(text: string, color: string, bg: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.beginPath();
  g.arc(64, 64, 52, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = color;
  g.font = "bold 62px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 64, 68);
  const tex = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(0.3, 0.3, 1);
  sprite.visible = false;
  return sprite;
}
