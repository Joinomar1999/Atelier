import { useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AGENTS } from "../agents/registry";
import { useAgents } from "../agents/store";

const inTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// Queues a command for an agent. It shows on this screen at once, and is also written to
// commands/inbox.jsonl in the repo and pushed, so the agent side can read it.
export function CommandBar() {
  const applyEvent = useAgents((s) => s.applyEvent);
  const [agentId, setAgentId] = useState(AGENTS[0].id);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    const task = text.trim();
    if (!task || busy) return;
    const now = Date.now();
    const id = `cmd-${now}-${agentId}`;
    const record = { id, agentId, task, createdAt: now };
    applyEvent({ id, agentId, timestamp: now, state: "queued", task }, "local");
    setText("");
    if (!inTauri()) {
      setStatus("Shown here only: this is the browser preview, not the desktop app.");
      return;
    }
    setBusy(true);
    setStatus("Sending to the repo...");
    try {
      await invoke<string>("queue_command", { line: JSON.stringify(record) });
      setStatus("Sent. The agent side reads it from the repo.");
    } catch (err) {
      setStatus(`Shown here, but not sent: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="command" onSubmit={send}>
      <h2>Command</h2>
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
      <button type="submit" disabled={!text.trim() || busy}>Send command</button>
      {status && <p className="sim-tag" role="status">{status}</p>}
    </form>
  );
}
