// Maps an agent's real state to the area it should be in, and how it should look.
import type { AgentState } from "./model";
import type { AreaId } from "../world/areas";

export const STATE_LABEL: Record<AgentState, string> = {
  idle: "Idle",
  researching: "Researching",
  executing: "Executing",
  collaborating: "Collaborating",
  waiting_input: "Waiting for you",
  completed: "Completed",
  failed: "Blocked or failed",
  unknown: "No recent update",
};

// Where an agent stands for each state. The brief's rules, one per state.
export function areaFor(state: AgentState): AreaId {
  switch (state) {
    case "researching": return "library";
    case "executing": return "workshop";
    case "collaborating": return "hub";
    case "completed": return "gallery";
    case "waiting_input": return "hub";     // stops and faces the user at the front of the hub
    case "failed": return "hub";            // stops the activity and shows the problem
    case "idle":
    case "unknown":
    default: return "garden";
  }
}

// Whether the agent should face the viewer (waiting for input) or work (executing).
export const FACES_VIEWER: AgentState[] = ["waiting_input", "failed"];
