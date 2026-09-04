import { localDeskReply } from "./localDesk.js";

export async function askHearth({ messages, apiKey }) {
  const payload = {
    messages: (messages || []).filter((msg) => !msg.error),
  };
  if (apiKey) payload.apiKey = apiKey;

  let response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    const err = new Error("Couldn’t reach the desk server. Is npm run dev still running?");
    err.code = "NETWORK";
    throw err;
  }

  const data = await response.json().catch(() => ({}));

  if (response.ok && data.text) return data.text;

  if (response.status === 403 || data.denied) {
    const lastUser = [...payload.messages].reverse().find((m) => m.role === "user");
    const local = localDeskReply(lastUser?.content || "");
    return `${local}\n\n—\nGemini itself refused the key (project denied). Local directory still works. New key: aistudio.google.com/apikey`;
  }

  const err = new Error(
    data.error || "Gemini didn’t answer. Check the key under You, or restart npm run dev."
  );
  err.code = "API";
  err.status = response.status;
  throw err;
}

export async function chatStatus() {
  try {
    const res = await fetch("/api/chat/status");
    if (!res.ok) return { configured: false };
    return res.json();
  } catch {
    return { configured: false };
  }
}
