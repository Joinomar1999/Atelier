// The agents in the world. Each has one character, one role and, once linked, one session.
// `sessionId` is the Claude session that runs this agent. The link is not live yet: the
// world still shows the simulated feed until the session adapter is built.
export interface AgentDef {
  id: string;
  name: string;
  role: string;
  characterId: string;
  focus: string;
  sessionId?: string;
}

export const AGENTS: AgentDef[] = [
  {
    id: "ari", name: "Ari", role: "Senior manager", characterId: "ari",
    focus: "Coordinates the team and contacts Omar",
    sessionId: "session_01MMkfF8C1ovczUD7Ve88TYa",
  },
  {
    id: "otto", name: "Otto", role: "Unreal Engine programmer", characterId: "otto",
    focus: "AP01 VR Configurator, Unreal Engine work",
    sessionId: "session_01MMkfF8cRVohY3n6V6PMq2e",
  },
  {
    id: "nora", name: "Nora", role: "Job application expert", characterId: "nora",
    focus: "Job search, draft applications (nothing sent)",
    sessionId: "session_01MMkfFBwzZQvvdtTS2PMpc8",
  },
  {
    id: "mika", name: "Mika", role: "AI expert", characterId: "mika",
    focus: "Research into new ways to use AI",
    sessionId: "session_01MMkfF9N1qYkg5hywNo4gys",
  },
];
