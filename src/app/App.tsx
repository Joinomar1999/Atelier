import { Atelier } from "../world/Atelier";
import { AREAS } from "../world/areas";

export function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">The Atelier</span>
        <span className="tag">Draft world · static characters</span>
      </header>
      <main className="stage">
        <Atelier />
      </main>
      <aside className="legend" aria-label="Areas">
        <h2>Areas</h2>
        <ul>
          {AREAS.map((a) => (
            <li key={a.id}>
              <span className="swatch" style={{ background: a.color }} />
              <span>{a.label}</span>
            </li>
          ))}
        </ul>
        <p className="note">
          Grey-box areas. Six draft characters stand in their areas as static placements.
          They are procedural drafts, not approved sculpts, and they do not reflect agent
          state yet (phase 5).
        </p>
      </aside>
    </div>
  );
}
