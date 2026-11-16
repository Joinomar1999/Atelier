import { create } from "zustand";
import type { AgentEvent, AgentSnapshot } from "./model";

interface AgentStore {
  agents: Record<string, AgentSnapshot>;
  seen: string[];                       // recent event ids, to drop duplicates
  applyEvent: (e: AgentEvent, source: AgentSnapshot["source"]) => void;
  respond: (agentId: string) => void;   // clears a pending question once the user answers
}

const SEEN_LIMIT = 500;

export const useAgents = create<AgentStore>((set, get) => ({
  agents: {},
  seen: [],
  applyEvent: (e, source) => {
    const { agents, seen } = get();
    if (seen.includes(e.id)) return;                 // duplicate
    const current = agents[e.agentId];
    if (current && e.timestamp < current.lastTimestamp) return; // out of order: keep newer state
    const next: AgentSnapshot = {
      agentId: e.agentId,
      state: e.state,
      task: e.task ?? current?.task,
      progress: e.progress,
      needsInput: e.needsInput,
      artifact: e.artifact ?? current?.artifact,
      error: e.error,
      lastTimestamp: e.timestamp,
      source,
    };
    set({
      agents: { ...agents, [e.agentId]: next },
      seen: [...seen, e.id].slice(-SEEN_LIMIT),
    });
  },
  respond: (agentId) => {
    const cur = get().agents[agentId];
    if (!cur) return;
    set({ agents: { ...get().agents, [agentId]: { ...cur, needsInput: undefined, state: "executing" } } });
  },
}));
