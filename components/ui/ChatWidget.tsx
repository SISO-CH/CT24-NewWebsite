"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const abortRef                = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    const abort = new AbortController();
    abortRef.current = abort;

    let assistantText = "";
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: next }),
        signal:  abort.signal,
      });

      if (!res.ok || !res.body) throw new Error("Fehler");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        if (abort.signal.aborted) break;
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text: chunk } = JSON.parse(data) as { text?: string };
            if (chunk) {
              assistantText += chunk;
              setMessages([...next, { role: "assistant", content: assistantText }]);
            }
          } catch { /* ignoriere Parse-Fehler */ }
        }
      }
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
        if (open) abortRef.current?.abort();
        setOpen((o) => !o);
      }}
        className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full
                   flex items-center justify-center shadow-lg
                   text-white transition-transform hover:scale-105"
        style={{ backgroundColor: "var(--ct-cyan)" }}
        aria-label={open ? "Chat schliessen" : "Chat oeffnen"}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {open && (
        <div
          className="fixed bottom-36 right-4 z-50 w-80 rounded-2xl shadow-2xl
                     border border-ct-border bg-white flex flex-col overflow-hidden"
          style={{ height: 420 }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: "var(--ct-cyan)" }}
          >
            <Bot size={16} className="text-white" />
            <p className="text-white text-sm font-semibold">Car Trade24 Assistent</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-ct-muted text-center mt-4">Wie kann ich Ihnen helfen?</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-ct-cyan text-white"
                      : "bg-ct-light text-ct-dark"
                  }`}
                >
                  {m.content || (loading && m.role === "assistant"
                    ? <Loader2 size={14} className="animate-spin" />
                    : null
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-[#e5e7eb] p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ihre Frage..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-ct-border
                         focus:outline-none focus:ring-2 focus:ring-ct-cyan/30 focus:border-ct-cyan"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white
                         transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: "var(--ct-cyan)" }}
              aria-label="Senden"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
