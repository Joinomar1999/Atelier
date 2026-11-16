import { useState, type FormEvent } from "react";
import { AGENTS } from "../agents/registry";
import { useAgents } from "../agents/store";

// Queues a task for an agent. It is stored locally and does NOT reach a real agent yet:
// the provider adapter that forwards commands is built in phase 7.
export function CommandBar() {
  const applyEvent = useAgents((s) => s.applyEvent);
  const [agentId, setAgentId] = useState(AGENTS[0].id);
  const [text, setText] = useState("");

  function send(e: FormEvent) {
    e.preventDefault();
    const task = text.trim();
    if (!task) return;
    const now = Date.now();
    applyEvent({ id: `cmd-${now}-${agentId}`, agentId, timestamp: now, state: "queued", task }, "local");
    setText("");
  }

  return (
    <form className="command" onSubmit={send}>
      <h2>Command</h2>
      <p className="sim-tag">Stored on this app only. Not sent to a real agent yet.</p>
      <select aria-label="Agent" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
        {AGENTS.map((a) => (
          <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
        ))}
      </select>
      <textarea
        aria-label="Command"
        placeholder="What should this agent do?"
        maxLength={1000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <button type="submit" disabled={!text.trim()}>Queue task</button>
    </form>
  );
}
