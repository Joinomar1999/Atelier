# Nora: artist handoff brief

## The project

The Atelier is a desktop 3D world where AI agents appear as small ceramic characters. Each character's activity reflects real agent state. Nora is the first character, and the world is built around her. The art direction is already set, so this brief is about making Nora real, not redesigning her.

## What to deliver

1. **Sculpt / base model** of Nora, following the approved references below. Modelled in Blender (.blend) and exported as glTF (.glb).
2. **Turnaround check**: front, side, back and three-quarter views, matched to the character family sheet.
3. **Expressions**: five eye states (neutral, curious, focused, alert, resting), built as eyelid and iris changes. Nora has no mouth.
4. **Materials**: satin ceramic (ivory), champagne metal, graphite joints, slate mantle fabric, dusty blue accent, and glass eyes.
5. **Joint layout** ready for rigging: clearly separated parts at shoulders, elbows, hips, knees, ankles and neck. Rigging is a later phase.

## Approved references (in this repo)

- `docs/references/character-family-sheet.webp`: primary reference. Nora's turnaround, head views, pose and palette.
- `docs/references/nora-design-bible-sheet.webp`: secondary reference for expressions and materials.
- `docs/references/cast-group-approved.webp`: the six characters together, for silhouette and scale context.

## Key specifications

- Height: 20–30 cm, about 26 cm at the top of the body, not counting the halo.
- Head: about 110 mm diameter.
- Torso: about 75 mm.
- Materials: ivory ceramic (satin), champagne metal, graphite, slate mantle, dusty blue accent.
- Eyes: large, glass, dark with a thin gold and blue rim, as in the sheet.
- No mouth.

## What to fix from the current draft

The draft is in `assets-source/nora/` (`build_nora.py`, `nora.blend`, `nora.glb`). Read `assets-source/nora/STATUS.md` first. Main gaps:

- The cape is a flat tent. It needs a hooded mantle with folds, a gold brooch and the shape shown in the sheet.
- The limbs are thin sticks. They need fuller, mechanical forms with visible joints.
- The feet are blobs.
- The eyes are too blue and too shiny. They should be dark glass.
- The body lacks the sheet's neck and chest detail.

Use the draft for proportions and scale only. Don't reuse its geometry.

## Export and acceptance

- Blender 4.0 or later. Units in metres. Nora at about 0.26 m body height.
- Export glTF 2.0 (.glb), Y-up, with materials embedded. Target under 3 MB, excluding textures.
- Acceptance: side-by-side renders against the character family sheet, approved by the project owner before rigging.

## Questions for the owner

- Is the slate mantle or the sand cape the final colour? The character family sheet shows slate.
- Is the halo ring solid gold or a light champagne metal? The sheet suggests champagne.
