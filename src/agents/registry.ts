// The agents in the world. Each has one character and one role.
// `characterId` links the agent to a character in src/world/characters.ts.
export interface AgentDef {
  id: string;
  name: string;
  role: string;
  characterId: string;
  focus: string;
}

export const AGENTS: AgentDef[] = [
  { id: "nora", name: "Nora", role: "Researcher", characterId: "nora", focus: "Research and reading" },
  { id: "otto", name: "Otto", role: "Builder", characterId: "otto", focus: "Unreal Engine work and builds" },
  { id: "mika", name: "Mika", role: "Designer", characterId: "mika", focus: "Ideas, layouts and design" },
  { id: "eli", name: "Eli", role: "Analyst", characterId: "eli", focus: "Data and analysis" },
  { id: "ari", name: "Ari", role: "Coordinator", characterId: "ari", focus: "Coordinating other agents" },
  { id: "pip", name: "Pip", role: "Messenger", characterId: "pip", focus: "Messages and updates" },
];
