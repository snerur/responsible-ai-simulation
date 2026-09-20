/* =====================================================================
   Optional instructor proxy for the Veritas Health Credit simulation.
   Holds ONE key per provider server-side so students never need their own.

   Usage:
     cd server && npm install
     ANTHROPIC_API_KEY=sk-ant-... node server.mjs
     # optionally also OPENAI_API_KEY=... GEMINI_API_KEY=...
     # then open http://localhost:8787  and pick "Instructor's proxy server"

   Notes on style: Claude is called through the official @anthropic-ai/sdk.
   OpenAI and Gemini are called over their REST endpoints with fetch() to
   keep this file to a single dependency — swap in their SDKs if you prefer.
   ===================================================================== */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const PORT = Number(process.env.PORT || 8787);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const KEYS = {
  anthropic: process.env.ANTHROPIC_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
};

const anthropic = KEYS.anthropic ? new Anthropic({ apiKey: KEYS.anthropic }) : null;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

/* ---------------- provider calls ---------------- */

async function completeAnthropic({ model, system, user, maxTokens }) {
  if (!anthropic) throw new Error("ANTHROPIC_API_KEY is not set on the server");
  const res = await anthropic.messages.create({
    model: model || "claude-opus-5",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }]
  });
  return res.content.filter(b => b.type === "text").map(b => b.text).join("");
}

async function completeOpenAI({ model, system, user, maxTokens }) {
  if (!KEYS.openai) throw new Error("OPENAI_API_KEY is not set on the server");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${KEYS.openai}` },
    body: JSON.stringify({
      model: model || "gpt-5",
      max_completion_tokens: maxTokens,
      messages: [{ role: "system", content: system }, { role: "user", content: user }]
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `OpenAI ${r.status}`);
  return data.choices?.[0]?.message?.content || "";
}

async function completeGemini({ model, system, user, maxTokens }) {
  if (!KEYS.gemini) throw new Error("GEMINI_API_KEY is not set on the server");
  const m = model || "gemini-2.5-pro";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": KEYS.gemini },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens }
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `Gemini ${r.status}`);
  return (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
}

const PROVIDERS = { anthropic: completeAnthropic, openai: completeOpenAI, gemini: completeGemini };

/* ---------------- http ---------------- */

function send(res, code, body, headers = {}) {
  res.writeHead(code, {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, GET, OPTIONS",
    ...headers
  });
  res.end(body);
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT)) return send(res, 403, "Forbidden");
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, "Not found");
    send(res, 200, buf, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
  });
}

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, "");

  if (req.method === "GET" && req.url === "/api/health") {
    return send(res, 200, JSON.stringify({
      ok: true,
      configured: Object.fromEntries(Object.entries(KEYS).map(([k, v]) => [k, Boolean(v)]))
    }), { "content-type": "application/json" });
  }

  if (req.method === "POST" && req.url === "/api/complete") {
    let raw = "";
    req.on("data", c => {
      raw += c;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", async () => {
      try {
        const { provider, model, system, user, maxTokens = 2000 } = JSON.parse(raw);
        const fn = PROVIDERS[provider];
        if (!fn) throw new Error(`Unknown provider: ${provider}`);
        const text = await fn({ model, system, user, maxTokens: Math.min(maxTokens, 8000) });
        send(res, 200, JSON.stringify({ text }), { "content-type": "application/json" });
      } catch (e) {
        send(res, 400, JSON.stringify({ error: e.message }), { "content-type": "application/json" });
      }
    });
    return;
  }

  if (req.method === "GET") return serveStatic(req, res);
  send(res, 405, "Method not allowed");
}).listen(PORT, () => {
  const ready = Object.entries(KEYS).filter(([, v]) => v).map(([k]) => k);
  console.log(`\n  Veritas Health Credit simulation`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  Providers configured: ${ready.length ? ready.join(", ") : "NONE — set ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY"}\n`);
});
