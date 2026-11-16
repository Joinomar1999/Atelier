import { useState } from "react";
import { AGENTS } from "../agents/registry";
import { useAgents } from "../agents/store";
import { STATE_LABEL } from "../agents/behaviour";

// Lists each agent with its real state, task and any question for the user.
export function AgentPanel({ simulated }: { simulated: boolean }) {
  const agents = useAgents((s) => s.agents);
  const respond = useAgents((s) => s.respond);
  const [draft, setDraft] = useState<Record<string, string>>({});

  return (
    <div className="agents-panel">
      <h2>Agents</h2>
      {simulated && <p className="sim-tag">Simulated feed: sample activity, not real agents.</p>}
      <ul>
        {AGENTS.map((a) => {
          const s = agents[a.id];
          const state = s?.state ?? "unknown";
          return (
            <li key={a.id} className={`agent-row state-${state}`}>
              <div className="agent-head">
                <strong>{a.name}</strong> <span className="role">{a.role}</span>
              </div>
              <div className="agent-state">{STATE_LABEL[state]}</div>
              {s?.task && <div className="agent-task">{s.task}</div>}
              {s?.error && <div className="agent-error">{s.error}</div>}
              {s?.artifact && <div className="agent-artifact">Result: {s.artifact.name}</div>}
              {s?.needsInput && (
                <div className="agent-question">
                  <p>{s.needsInput}</p>
                  <div className="reply">
                    <input
                      aria-label={`Answer for ${a.name}`}
                      value={draft[a.id] ?? ""}
                      onChange={(e) => setDraft({ ...draft, [a.id]: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...draft, [a.id]: "" });
                        respond(a.id);
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
