import { useEffect, useRef, useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AGENTS } from "../agents/registry";
import { useAgents } from "../agents/store";

interface Message {
  id: string;
  from: "you" | "agent" | "system";
  who: string;
  text: string;
  time: number;
}

const inTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const fmt = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// A chat with the team. You write to one agent (Ari by default). Questions from agents appear here too.
export function ChatPanel() {
  const agents = useAgents((s) => s.agents);
  const applyEvent = useAgents((s) => s.applyEvent);
  const [to, setTo] = useState("ari");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", from: "system", who: "", text: "Chat with the team. Write to Ari, or pick another agent.", time: Date.now() },
  ]);
  const seen = useRef<Record<string, string>>({});
  const log = useRef<HTMLDivElement>(null);

  // Show each new question or finished result from an agent in the chat
  useEffect(() => {
    const next: Message[] = [];
    AGENTS.forEach((a) => {
      const s = agents[a.id];
      if (!s) return;
      if (s.needsInput && seen.current[a.id] !== s.needsInput) {
        seen.current[a.id] = s.needsInput;
        next.push({ id: `q-${a.id}-${s.lastTimestamp}`, from: "agent", who: a.name, text: `Question: ${s.needsInput}`, time: s.lastTimestamp });
      }
      if (s.state === "completed" && s.artifact && seen.current[`${a.id}-done`] !== s.artifact.name) {
        seen.current[`${a.id}-done`] = s.artifact.name;
        next.push({ id: `d-${a.id}-${s.lastTimestamp}`, from: "agent", who: a.name, text: `Finished: ${s.artifact.name}`, time: s.lastTimestamp });
      }
    });
    if (next.length) setMessages((m) => [...m, ...next]);
  }, [agents]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const task = text.trim();
    if (!task || busy) return;
    const now = Date.now();
    const agent = AGENTS.find((a) => a.id === to)!;
    setMessages((m) => [...m, { id: `you-${now}`, from: "you", who: "You", text: `to ${agent.name}: ${task}`, time: now }]);
    applyEvent({ id: `cmd-${now}-${to}`, agentId: to, timestamp: now, state: "queued", task }, "local");
    setText("");
    if (!inTauri()) {
      setMessages((m) => [...m, { id: `s-${now}`, from: "system", who: "", text: "Shown here only. The desktop app sends messages to the repo.", time: now }]);
      return;
    }
    setBusy(true);
    try {
      await invoke<string>("queue_command", { line: JSON.stringify({ id: `cmd-${now}-${to}`, agentId: to, task, createdAt: now }) });
      setMessages((m) => [...m, { id: `ok-${now}`, from: "system", who: "", text: "Sent to the repo. The agent reads it from there.", time: Date.now() }]);
    } catch (err) {
      setMessages((m) => [...m, { id: `err-${now}`, from: "system", who: "", text: `Not sent: ${String(err)}`, time: Date.now() }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="chat" aria-label="Chat with the team">
      <h2>Chat</h2>
      <div className="chat-log" ref={log} role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`msg msg-${m.from}`}>
            {m.who && <span className="msg-who">{m.who}</span>}
            <span className="msg-text">{m.text}</span>
            <span className="msg-time">{fmt(m.time)}</span>
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={send}>
        <select aria-label="Talk to" value={to} onChange={(e) => setTo(e.target.value)}>
          {AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
        </select>
        <textarea aria-label="Message" rows={2} maxLength={1000} placeholder="Write a message or a task…" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" disabled={!text.trim() || busy}>Send</button>
      </form>
    </section>
  );
}
