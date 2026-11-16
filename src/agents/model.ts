// Normalized agent model. Every provider adapter converts its events into these types.
// The 3D world only reads AgentSnapshot values; it never creates agent activity itself.

export type AgentState =
  | "idle"
  | "researching"
  | "executing"
  | "collaborating"
  | "waiting_input"
  | "queued"
  | "completed"
  | "failed"
  | "unknown";

export interface AgentEvent {
  id: string;            // unique per event, used to drop duplicates
  agentId: string;
  timestamp: number;     // ms since epoch, from the source
  state: AgentState;
  task?: string;
  progress?: number;     // 0..1 when the provider reports it
  needsInput?: string;   // question shown to the user
  artifact?: { name: string };
  error?: string;
}

export interface AgentSnapshot {
  agentId: string;
  state: AgentState;
  task?: string;
  progress?: number;
  needsInput?: string;
  artifact?: { name: string };
  error?: string;
  lastTimestamp: number;
  source: "simulated" | "claude" | "local";
}
