"use client";

import { useEffect, useRef, useState } from "react";
import { suggestions } from "@/lib/twin";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi, I'm Federico's digital twin: an AI trained on his career and design thinking. Ask me anything about his work.",
};

export default function TwinChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const fab = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, open]);

  useEffect(() => {
    if (open) field.current?.focus();
    else if (wasOpen.current) fab.current?.focus(); // return focus on close (incl. Escape)
    wasOpen.current = open;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !panel.current) return;
      // Trap Tab / Shift+Tab inside the panel.
      const items = Array.from(
        panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panel.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(raw: string, base: Msg[] = msgs) {
    const q = raw.trim();
    if (!q || busy) return;
    const history: Msg[] = [...base, { role: "user", content: q }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const set = (content: string, error = false) =>
      setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content, error }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Skip the canned greeting; the server supplies the system prompt.
        body: JSON.stringify({ messages: history.slice(1).filter((m) => !m.error) }),
      });
      if (!res.body) throw new Error();
      // The server sends its error messages as plain text with a non-2xx status.
      if (!res.ok) return set(await res.text(), true);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        set(acc);
      }
      if (!acc.trim()) set("I didn't manage to answer that. Could you try rephrasing?");
    } catch {
      set("Something went wrong. Please try again.", true);
    } finally {
      setBusy(false);
    }
  }

  // Re-ask the last question, dropping the failed exchange from the history.
  function retry() {
    const lastUser = msgs[msgs.length - 2];
    if (lastUser?.role === "user") send(lastUser.content, msgs.slice(0, -2));
  }

  return (
    <>
      <button
        ref={fab}
        className={`twin-fab ${open ? "hide" : ""}`}
        onClick={() => setOpen(true)}
        tabIndex={open ? -1 : 0}
        aria-hidden={open}
        aria-label="Chat with Federico's digital twin"
      >
        <span className="dot" /> Ask my digital twin
      </button>

      <section
        ref={panel}
        className={`twin ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Digital twin chat"
        aria-hidden={!open}
      >
        <header>
          <div>
            <strong>Digital twin</strong>
            <span className="mono">AI · answers from Federico&rsquo;s career</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </header>

        <div className="twin-log" aria-live="polite">
          {msgs.map((m, i) => (
            <p key={i} className={`bubble ${m.role} ${m.error ? "error" : ""}`} role={m.error ? "alert" : undefined}>
              {m.content || <span className="typing"><i /><i /><i /></span>}
              {m.error && i === msgs.length - 1 && !busy && (
                <button type="button" className="retry" onClick={retry}>Try again</button>
              )}
            </p>
          ))}
          {msgs.length === 1 && (
            <div className="chips">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}
          <div ref={end} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about my career…"
            maxLength={400}
            aria-label="Your question"
          />
          <button type="submit" disabled={busy || !input.trim()}>Send →</button>
        </form>
      </section>
    </>
  );
}
