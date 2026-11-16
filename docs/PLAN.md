# The Atelier: First Deliverable (Plan for Approval)

No implementation code has been written. This is the planning deliverable the brief asks for, to be approved before any major work starts.

## Status of inputs

- **Repository:** not available. This container has no repository, and no repo matching "atelier" is on your account. The brief says to inspect the existing repo first, so section 1 is incomplete until one is shared.
- **Asset folder (ATELIER_ASSETS):** not received. Only one reference image was provided (the Nora design bible sheet). The turnarounds, expression sheets, animation references, materials, environment images, color palette and design bible PDF are still needed.
- **Approved visual references:** the Nora sheet is treated as the working reference. It shows an ivory ceramic shell, a champagne metal ring above the head, a cape and backpack, large glass eyes with no mouth, a height of about 26 cm, and five expressions (neutral, curious, focused, alert, resting). It also shows five poses (walking, investigating, working, waving, presenting). Nothing else has been approved yet.

## 1. Repository assessment

Not possible yet. Required: a repository URL or an upload, and the asset folder. Once received, I will inspect the existing structure, dependencies, runtime, current functionality and limits before recommending changes.

## 2. Recommended architecture

Three layers, with the 3D layer kept read-only with respect to agent activity:

1. **Agent integration layer.** Adapters per provider (Claude, others later). Each adapter converts its provider's events into one normalized event type:
   `{ agentId, state, task, progress?, needsInput?, artifact?, error?, timestamp }`
2. **State store.** Holds the latest normalized state per agent and an event log. Persists to local storage so state survives restarts.
3. **Presentation.** The 3D world and UI subscribe to the store. They can display state but cannot create it. Agent movement and actions are driven only by state.

Simulation (for prototyping only) is a separate adapter that emits the same event type, labelled as simulated everywhere it appears.

## 3. Technology stack

Keep the brief's recommendations, subject to the repo check:

- **Shell:** Tauri 2. Small desktop footprint, native packaging, and the Rust side can host adapters that need system access.
- **UI:** React + TypeScript.
- **3D:** React Three Fiber on Three.js. Lets scene state be expressed as React state.
- **State:** Zustand. Small, works well with R3F's per-frame loop through selectors.
- **Persistence:** SQLite via a Tauri plugin for event history and agent records. A file-based store is enough for the first phase.
- **Assets:** Blender modeling, exported as glTF 2.0 (.glb), with PBR materials and Draco compression if file size requires it.

Reasons: each piece is widely used, works with the others, and needs no server.

## 4. Proposed folder structure

```
atelier/
├── src-tauri/              Rust shell, persistence, native adapters
├── src/
│   ├── app/                 Shell layout, panels, routing
│   ├── world/               Scene root, areas (Workshop, Library, Hub, Garden, Gallery)
│   ├── characters/
│   │   ├── nora/            Model, materials, rig, animation clips, config
│   │   └── _template/       Shared character structure for future characters
│   ├── agents/
│   │   ├── model.ts         Normalized event and state types
│   │   ├── store.ts         State store
│   │   ├── behaviour.ts     State → location, animation, expression mapping
│   │   └── adapters/        claude/, simulated/, one folder per provider
│   ├── ui/                  Inspector, assignment and result panels
│   └── assets/              Textures, shared materials, environment props
├── assets-source/           Blender files (.blend), kept out of the runtime build
└── docs/                    Design notes, adapter contracts
```

## 5. Agent integration strategy

- Adapters are the only code that talks to providers. The 3D world never calls a provider directly.
- **State mapping** (from the brief): idle → wander or rest; researching → Library; executing → Workshop; collaborating → Hub; waiting for input → stop, face the user, wave; completed → Gallery presentation; failed or blocked → stop, show the problem.
- **Reliability:** events may arrive late, twice, or out of order. Each event carries an ID and timestamp, and the store applies only newer state. A provider going silent shows as "unknown", not as still working.
- **Honesty rule:** the scene shows only states reported by an adapter. A simulated adapter is visibly marked.
- **Current prototype:** the monitor board we built is a prototype with primitive characters and a shared job list. It isn't the design, and its characters should be replaced by approved models. Its job-storage logic could inform a future adapter, but that's a decision for later.

## 6. Character asset pipeline

1. **Reference lock:** approved turnarounds and expressions are the source of truth. Changes need your approval.
2. **Model (Blender):** build the shell, mechanical joints, cape and backpack as separate parts. Target roughly 15,000–25,000 triangles per character.
3. **Eyes:** separate glass meshes with a glass material and an iris texture. Expressions change through eyelid and iris geometry, not through a mouth.
4. **Materials:** ivory and sand ceramic (satin), champagne metal, graphite mechanical parts, dusty blue accent. Each is a PBR material shared across characters.
5. **Rig:** an armature with IK on hands and feet, and separate controls for the head ring.
6. **Animations:** walking, investigating, working, waving, presenting, resting, plus transitions. Each clip is checked on the reference poses before export.
7. **Export:** glTF 2.0 per character, with one file per character and shared materials. Check it loads and plays in the app before moving on.

## 7. Development phases

Following the brief's order, starting with Nora only:

0. **Inputs:** repository and full asset folder received, plan approved.
1. **Shell:** Tauri app with an empty R3F scene and a blockout of the five areas (grey boxes, clearly labelled as placeholders).
2. **Nora model, materials and eyes**, checked against the turnaround and expression sheets.
3. **Rig and animation** for Nora's five poses plus rest and transitions.
4. **Environment integration:** Nora moves between blocked-out areas on command, and the Workshop, Library, Hub, Garden and Gallery are built out.
5. **Agent state integration:** a simulated adapter drives Nora's states, labelled as simulated.
6. **User interaction:** click to inspect, status and assignment panel, response to input requests.
7. **Real adapter:** connect the first provider (Claude, if you want it first) through the same event type.
8. **Remaining characters:** Otto, Mika, Eli, Ari and Pip, one at a time, using the template.

Each phase is verified before the next starts.

## 8. Main technical risks

- **Missing or incomplete assets.** Without approved models, animation and materials can't be validated. Mitigation: the phase 0 gate.
- **Visual quality versus performance.** Glass eyes, PBR materials and several animated characters can be heavy. Mitigation: measure frame time on a mid-range machine early in phase 2.
- **Tauri WebGL differences** across Windows, macOS and Linux. Mitigation: test each target after phase 1.
- **Adapter reliability.** Late, duplicate or missing events, and providers going offline. Mitigation: event IDs, ordering rules, and an explicit "unknown" state.
- **Scope creep.** The brief describes a full world. Mitigation: phases gate each addition, and no environment is built beyond blockout until Nora works.
- **Animation state blending** between many states. Mitigation: a small, fixed set of states with defined transitions.
- **Data migration** as the schema changes. Mitigation: version the store schema from the start.

## Decisions needed from you

1. Share the repository (or confirm there isn't one yet) and the full ATELIER_ASSETS folder.
2. Approve this stack and folder structure, or request changes.
3. Choose the first real agent provider to integrate, or leave it until phase 7.
