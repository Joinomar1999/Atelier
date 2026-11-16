// SIMULATED adapter. It produces believable sample events so the world can be developed.
// Everything it produces is labelled "simulated" in the UI. It is not real agent activity.
import type { AgentEvent, AgentState } from "../../model";

type Script = { state: AgentState; ms: number; task?: string; needsInput?: string; artifact?: string };

const SCRIPTS: Record<string, Script[]> = {
  nora: [
    { state: "idle", ms: 6000 },
    { state: "researching", ms: 9000, task: "Reading sample research notes" },
    { state: "waiting_input", ms: 9000, task: "Reading sample research notes", needsInput: "Simulated question: include older sources too?" },
    { state: "completed", ms: 6000, task: "Sample research summary", artifact: "Sample summary" },
  ],
  otto: [
    { state: "executing", ms: 10000, task: "Simulated build step" },
    { state: "failed", ms: 6000, task: "Simulated build step", needsInput: undefined },
    { state: "idle", ms: 6000 },
  ],
  mika: [
    { state: "collaborating", ms: 9000, task: "Simulated layout review with Otto" },
    { state: "executing", ms: 9000, task: "Simulated layout update" },
    { state: "idle", ms: 6000 },
  ],
};

export function startSimulated(push: (e: AgentEvent) => void): () => void {
  const timers: number[] = [];
  let counter = 0;
  Object.entries(SCRIPTS).forEach(([agentId, steps]) => {
    let i = 0;
    const step = () => {
      const s = steps[i % steps.length];
      i += 1;
      counter += 1;
      push({
        id: `sim-${agentId}-${counter}`,
        agentId,
        timestamp: Date.now(),
        state: s.state,
        task: s.task,
        needsInput: s.needsInput,
        artifact: s.artifact ? { name: s.artifact } : undefined,
        error: s.state === "failed" ? "Simulated: a build step failed" : undefined,
      });
      timers.push(window.setTimeout(step, s.ms));
    };
    timers.push(window.setTimeout(step, 500 + Math.random() * 1500));
  });
  return () => timers.forEach((t) => clearTimeout(t));
}
