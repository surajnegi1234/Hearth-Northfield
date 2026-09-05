import { employees } from "../data/employees.js";
import { SYSTEM_HINT } from "../data/prompts.js";
import { localDeskReply } from "./localDesk.js";

const MODELS = ["gemini-3.6-flash", "gemini-flash-latest"];

function directoryBlock() {
  return employees
    .map(
      (p) =>
        `${p.name} — ${p.position}, ${p.department} (${p.status}). ${p.email}. Based in ${p.location}.`
    )
    .join("\n");
}

function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!parts?.length) return "";
  return parts.map((part) => part.text || "").join("").trim();
}

function googleErrorMessage(payload, status) {
  const err = payload?.error;
  if (!err) return `Gemini returned ${status || "an error"}.`;
  const reason = err.details?.find((d) => d.reason)?.reason || err.status;
  const message = err.message || "";
  if (/quota|rate.limit|resource_exhausted/i.test(message) || status === 429) {
    return "Free Gemini quota for this minute is used up. Wait about a minute and send again — the new key is fine.";
  }
  if (reason === "API_KEY_HTTP_REFERRER_BLOCKED" || /referer/i.test(message)) {
    return "Google blocked this request because of HTTP referrer rules on the API key. In Google Cloud, edit the key and add https://surajnegi1234.github.io/* under website restrictions.";
  }
  if (reason === "API_KEY_INVALID" || /api key not valid/i.test(message)) {
    return "Google says this API key is not valid. Check the GitHub secret VITE_GEMINI_API_KEY matches a current AI Studio key.";
  }
  if (/denied access/i.test(message) || reason === "PERMISSION_DENIED") {
    return message || "Google denied this Gemini project.";
  }
  return reason ? `${message} (${reason})` : message;
}

function fallbackWithReason(messages, reason) {
  const lastUser = [...(messages || [])].reverse().find((m) => m.role === "user");
  const local = localDeskReply(lastUser?.content || "");
  return `${local}\n\n—\n${reason}`;
}

function buildBody(messages) {
  const contents = (messages || [])
    .filter((msg) => !msg.error)
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  return {
    systemInstruction: {
      parts: [{ text: SYSTEM_HINT.replace("{{DIRECTORY}}", directoryBlock()) }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };
}

function resolveKey() {
  return (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
}

async function callGemini(model, key, body) {
  const payloadJson = JSON.stringify(body);
  const queryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const queryRes = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payloadJson,
    referrerPolicy: "origin",
  });
  const queryPayload = await queryRes.json().catch(() => ({}));
  if (
    queryRes.ok ||
    queryRes.status === 404 ||
    queryRes.status === 429 ||
    queryRes.status === 403
  ) {
    return { response: queryRes, payload: queryPayload };
  }

  const headerRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: payloadJson,
      referrerPolicy: "origin",
    }
  );
  const headerPayload = await headerRes.json().catch(() => ({}));
  return { response: headerRes, payload: headerPayload };
}

async function askGeminiDirect({ messages }) {
  const key = resolveKey();
  if (!key) {
    const err = new Error(
      "No Gemini key yet. Add VITE_GEMINI_API_KEY as a GitHub Actions secret."
    );
    err.code = "NO_KEY";
    throw err;
  }

  const body = buildBody(messages);
  let lastMessage = "";
  let lastStatus = 500;

  for (const model of MODELS) {
    let result;
    try {
      result = await callGemini(model, key, body);
    } catch {
      const err = new Error("Couldn’t reach Gemini. Check your connection and try again.");
      err.code = "NETWORK";
      throw err;
    }

    const { response, payload } = result;
    lastStatus = response.status;
    lastMessage = payload?.error?.message || "";

    if (response.status === 404) continue;

    if (!response.ok) {
      if (response.status === 403) {
        return fallbackWithReason(messages, googleErrorMessage(payload, 403));
      }
      const err = new Error(
        googleErrorMessage(payload, response.status) || `Gemini returned ${response.status}.`
      );
      err.code = response.status === 429 ? "QUOTA" : "API";
      err.status = response.status;
      throw err;
    }

    const text = extractText(payload);
    if (!text) {
      const err = new Error(
        payload?.promptFeedback?.blockReason
          ? `Gemini blocked that prompt (${payload.promptFeedback.blockReason}). Try rephrasing.`
          : "Gemini sent back an empty reply. Try again in a second."
      );
      err.code = "EMPTY";
      throw err;
    }

    return text;
  }

  const err = new Error(
    googleErrorMessage({ error: { message: lastMessage } }, lastStatus) ||
      "No Gemini model accepted the request."
  );
  err.code = "API";
  err.status = lastStatus;
  throw err;
}

async function askViaProxy({ messages, apiKey }) {
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

  if (response.status === 429) {
    const err = new Error(
      "Free Gemini quota for this minute is used up. Wait about a minute and send again — the new key is fine."
    );
    err.code = "QUOTA";
    err.status = 429;
    throw err;
  }

  if (response.status === 403 || data.denied) {
    return fallbackWithReason(
      payload.messages,
      data.error || "Gemini returned 403."
    );
  }

  const err = new Error(
    data.error || "Gemini didn’t answer. Check the key under You, or restart npm run dev."
  );
  err.code = "API";
  err.status = response.status;
  throw err;
}

export async function askHearth({ messages, apiKey }) {
  if (import.meta.env.DEV) {
    return askViaProxy({ messages, apiKey });
  }
  return askGeminiDirect({ messages, apiKey });
}

export async function chatStatus() {
  const envKey = Boolean((import.meta.env.VITE_GEMINI_API_KEY || "").trim());

  if (!import.meta.env.DEV) {
    return { configured: envKey };
  }

  try {
    const res = await fetch("/api/chat/status");
    if (!res.ok) return { configured: envKey };
    const data = await res.json();
    return { configured: Boolean(data.configured) || envKey };
  } catch {
    return { configured: envKey };
  }
}
