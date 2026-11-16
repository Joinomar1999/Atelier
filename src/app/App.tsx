import { useEffect } from "react";
import { Atelier } from "../world/Atelier";
import { AREAS } from "../world/areas";
import { AgentPanel } from "./AgentPanel";
import { CommandBar } from "./CommandBar";
import { useAgents } from "../agents/store";
import { startSimulated } from "../agents/adapters/simulated/simulated";

// The simulated feed is on for now. A real provider adapter replaces it in phase 7.
const USE_SIMULATED = true;

export function App() {
  const applyEvent = useAgents((s) => s.applyEvent);

  useEffect(() => {
    if (!USE_SIMULATED) return;
    return startSimulated((e) => applyEvent(e, "simulated"));
  }, [applyEvent]);

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">The Atelier</span>
        <span className="tag">Draft world · {USE_SIMULATED ? "simulated agents" : "live agents"}</span>
      </header>
      <main className="stage">
        <Atelier />
      </main>
      <aside className="side">
        <CommandBar />
        <AgentPanel simulated={USE_SIMULATED} />
        <div className="areas">
          <h2>Areas</h2>
          <ul>
            {AREAS.map((a) => (
              <li key={a.id}>
                <span className="swatch" style={{ background: a.color }} />
                <span>{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
