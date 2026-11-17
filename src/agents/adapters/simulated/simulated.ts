// SIMULATED adapter. Sample activity for development only. Everything it produces is
// labelled "simulated" in the UI. It is not real agent activity.
//
// Nora runs a house build: six pieces added to the world one by one, with one question
// for you on the front door. Otto and Mika run short sample loops.
import type { AgentEvent, AgentState } from "../../model";
import { housePlan } from "../../../world/house";
import { useWorld } from "../../../world/worldStore";
import { useAgents } from "../../store";

type Push = (e: AgentEvent) => void;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function ev(agentId: string, state: AgentState, extra: Partial<AgentEvent> = {}): AgentEvent {
  return { id: `sim-${agentId}-${Math.random().toString(36).slice(2, 9)}`, agentId, timestamp: Date.now(), state, ...extra };
}

async function runHouseBuilds(push: Push, alive: () => boolean) {
  let plot = 0;
  while (alive()) {
    const plotX = 4.5 + plot * 7;
    const plan = housePlan(plotX, "nora", `house${plot}`);
    const task = `Build a small house (plot ${plot + 1})`;
    for (let i = 0; i < plan.length && alive(); i++) {
      const step = plan[i];
      useWorld.getState().setBuildTarget({ x: step.x, z: step.z });
      push(ev("nora", "executing", { task, progress: i / plan.length, artifact: undefined }));
      await sleep(4000);
      if (!alive()) return;
      useWorld.getState().addPiece(step);
      if (i === 4) {
        // A question for you before the door is finished
        push(ev("nora", "waiting_input", { task, needsInput: "Should the front door face the garden or the street?" }));
        while (alive() && useAgents.getState().agents["nora"]?.needsInput) await sleep(500);
        push(ev("nora", "executing", { task, progress: (i + 1) / plan.length }));
      }
    }
    if (!alive()) return;
    push(ev("nora", "completed", { task, progress: 1, artifact: { name: `Small house (plot ${plot + 1})` } }));
    useWorld.getState().setBuildTarget(null);
    await sleep(10000);
    plot += 1;
  }
}

async function runSample(push: Push, agentId: string, steps: { state: AgentState; ms: number; task?: string }[], alive: () => boolean) {
  let i = 0;
  while (alive()) {
    const s = steps[i % steps.length];
    push(ev(agentId, s.state, { task: s.task }));
    i += 1;
    await sleep(s.ms);
  }
}

export function startSimulated(push: Push): () => void {
  let running = true;
  const alive = () => running;
  runHouseBuilds(push, alive);
  runSample(push, "otto", [
    { state: "executing", ms: 9000, task: "Simulated Unreal build step" },
    { state: "idle", ms: 9000 },
  ], alive);
  runSample(push, "mika", [
    { state: "collaborating", ms: 8000, task: "Simulated layout review" },
    { state: "idle", ms: 9000 },
  ], alive);
  return () => { running = false; };
}
