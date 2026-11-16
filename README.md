# The Atelier

A desktop 3D world where AI agents exist as characters. Their activity in the scene reflects real state reported by an integration layer. The 3D world never invents activity.

Status: planning. See [docs/PLAN.md](docs/PLAN.md) for the architecture, stack, phases and open decisions.

## Layout

- `src-tauri/`: desktop shell (not yet created)
- `src/app/`: shell layout and panels
- `src/world/`: scene root and the five areas
- `src/characters/`: one folder per character (Nora first)
- `src/agents/`: normalized event model, state store, behaviour mapping, provider adapters
- `src/ui/`: inspector and assignment panels
- `assets-source/`: Blender source files, not shipped in the build
- `docs/`: plan and design notes

Phase 1 (Tauri shell) has not started.
