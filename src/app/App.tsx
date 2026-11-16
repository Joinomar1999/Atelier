import { Atelier } from "../world/Atelier";
import { AREAS } from "../world/areas";

export function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">The Atelier</span>
        <span className="tag">Phase 1 · blockout</span>
      </header>
      <main className="stage">
        <Atelier />
      </main>
      <aside className="legend" aria-label="Areas">
        <h2>Areas (placeholder)</h2>
        <ul>
          {AREAS.map((a) => (
            <li key={a.id}>
              <span className="swatch" style={{ background: a.color }} />
              <span>{a.label}</span>
            </li>
          ))}
        </ul>
        <p className="note">
          Grey-box placeholders. No character is shown yet: the first character is Nora,
          added in phase 2 from approved models only.
        </p>
      </aside>
    </div>
  );
}
