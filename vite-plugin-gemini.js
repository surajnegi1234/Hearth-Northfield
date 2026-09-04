import { loadEnv } from "vite";
import { employees } from "./src/data/employees.js";
import { SYSTEM_HINT } from "./src/data/prompts.js";

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

function explainDenied(message) {
  const text = (message || "").toLowerCase();
  if (text.includes("denied access") || text.includes("permission_denied")) {
    return [
      "Google blocked this Gemini project.",
      "Create a new key at https://aistudio.google.com/apikey — use Create API key in AI Studio, not an unrestricted Cloud Console key (those stopped working in June 2026).",
      "Paste the new key in You, or put GEMINI_API_KEY in .env and restart.",
    ].join(" ");
  }
  return message;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

async function callGemini(model, key, body) {
  const payloadJson = JSON.stringify(body);
  const headerRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: payloadJson,
    }
  );
  const headerPayload = await headerRes.json().catch(() => ({}));
  if (
    headerRes.ok ||
    headerRes.status === 404 ||
    headerRes.status === 429 ||
    headerRes.status === 403
  ) {
    return { response: headerRes, payload: headerPayload };
  }

  const queryRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadJson,
    }
  );
  const queryPayload = await queryRes.json().catch(() => ({}));
  return { response: queryRes, payload: queryPayload };
}

function attach(server, getKey) {
  server.middlewares.use(async (req, res, next) => {
    const url = req.url?.split("?")[0];

    if (req.method === "GET" && url === "/api/chat/status") {
      sendJson(res, 200, { configured: Boolean(getKey()) });
      return;
    }

    if (req.method !== "POST" || url !== "/api/chat") {
      next();
      return;
    }

    try {
      const incoming = await readBody(req);
      const key = (getKey() || incoming.apiKey || "").trim();
      if (!key) {
        sendJson(res, 400, {
          error:
            "No Gemini key on the server. Add GEMINI_API_KEY to .env, or paste one in You.",
        });
        return;
      }

      const contents = (incoming.messages || [])
        .filter((msg) => !msg.error)
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

      const body = {
        systemInstruction: {
          parts: [
            { text: SYSTEM_HINT.replace("{{DIRECTORY}}", directoryBlock()) },
          ],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      };

      let lastMessage = "";
      let lastStatus = 500;

      for (const model of MODELS) {
        const { response, payload } = await callGemini(model, key, body);
        lastStatus = response.status;
        lastMessage = payload?.error?.message || "";

        if (response.status === 404) continue;
        if (response.status === 429) {
          sendJson(res, 429, {
            error:
              "Free Gemini quota for this minute is used up. Wait about a minute and send again — the new key is fine.",
          });
          return;
        }
        if (!response.ok) {
          sendJson(res, response.status, {
            error: explainDenied(lastMessage) || `Gemini returned ${response.status}.`,
            denied: response.status === 403,
          });
          return;
        }

        const text = extractText(payload);
        if (!text) {
          sendJson(res, 502, {
            error: payload?.promptFeedback?.blockReason
              ? `Gemini blocked that prompt (${payload.promptFeedback.blockReason}). Try rephrasing.`
              : "Gemini sent back an empty reply.",
          });
          return;
        }

        sendJson(res, 200, { text });
        return;
      }

      sendJson(res, lastStatus || 502, {
        error: explainDenied(lastMessage) || "No Gemini model accepted the request.",
      });
    } catch {
      sendJson(res, 500, {
        error: "Couldn’t reach Gemini. Check your connection and try again.",
      });
    }
  });
}

export function geminiProxy(mode) {
  const env = loadEnv(mode, process.cwd(), "");
  const getKey = () =>
    (env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || "").trim();

  return {
    name: "hearth-gemini-proxy",
    configureServer(server) {
      attach(server, getKey);
    },
    configurePreviewServer(server) {
      attach(server, getKey);
    },
  };
}
