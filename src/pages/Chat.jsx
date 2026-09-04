import { useCallback, useEffect, useRef, useState } from "react";
import ChatBubble, { TypingDots } from "../components/ChatBubble.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useApp } from "../context/AppContext.jsx";
import { SUGGESTED_PROMPTS } from "../data/prompts.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { askHearth, chatStatus } from "../services/gemini.js";

export default function Chat() {
  const { messages, setMessages, clearChat, apiKey, profile } = useApp();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [serverKey, setServerKey] = useState(false);
  const scroller = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatStatus().then((s) => setServerKey(Boolean(s.configured)));
  }, []);

  const onVoice = useCallback((text) => {
    setDraft((prev) => (prev ? `${prev} ${text}` : text));
    inputRef.current?.focus();
  }, []);

  const { listening, supported, toggle } = useSpeech({ onResult: onVoice });

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  async function send(text) {
    const content = (text ?? draft).trim();
    if (!content || busy) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      at: Date.now(),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setDraft("");
    setBusy(true);

    try {
      const reply = await askHearth({
        messages: next,
        apiKey: serverKey ? undefined : apiKey,
      });
      const bot = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        at: Date.now(),
      };
      setLastId(bot.id);
      setMessages([...next, bot]);
    } catch (err) {
      const bot = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: err.message || "Something odd happened. Try once more.",
        error: true,
        at: Date.now(),
      };
      setLastId(bot.id);
      setMessages([...next, bot]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    send();
  }

  return (
    <div className="chat-page">
      <div className="chat-thread" ref={scroller} aria-live="polite">
        {messages.length === 0 && !busy && (
          <EmptyState
            title={`Morning, ${profile.firstName}.`}
            copy="Ask about people, leave, rooms, or get a draft. Hearth keeps this thread on your machine."
          >
            <ul className="prompts">
              {SUGGESTED_PROMPTS.map((p) => (
                <li key={p}>
                  <button type="button" onClick={() => send(p)}>
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </EmptyState>
        )}

        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            animate={msg.id === lastId && msg.role === "assistant"}
          />
        ))}
        {busy && <TypingDots />}
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <div className="composer-row">
          <textarea
            ref={inputRef}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask Hearth. Shift+Enter for a new line."
            disabled={busy}
          />
          {supported && (
            <button
              type="button"
              className={listening ? "icon-btn on" : "icon-btn"}
              onClick={toggle}
              aria-label={listening ? "Stop listening" : "Voice input"}
              title={listening ? "Listening…" : "Speak"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="6" y="1.5" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 12v2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          )}
          <button type="submit" className="btn solid" disabled={busy || !draft.trim()}>
            Send
          </button>
        </div>
        <div className="composer-meta">
          <span>
            {apiKey || serverKey
              ? "Desk is on. If Gemini blocks the project, Hearth answers from the directory instead."
              : "No API key yet — add GEMINI_API_KEY to .env, or paste one under You."}
          </span>
          {messages.length > 0 && (
            <button type="button" className="text-btn" onClick={clearChat}>
              Clear thread
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
