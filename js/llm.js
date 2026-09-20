/* =====================================================================
   LLM layer — OpenAI, Anthropic, Google Gemini
   ---------------------------------------------------------------------
   Two transport modes:
     'browser' : the student pastes their own key; we call the provider
                 REST endpoint directly with fetch(). Raw HTTP is used
                 here deliberately — this app has no bundler, so npm
                 SDKs are not available in the page. See server/server.mjs
                 for the SDK-based path.
     'proxy'   : we POST to a local Node proxy that holds one shared key
                 (see server/server.mjs). No key ever touches the browser.
     'offline' : no LLM. Deterministic rubric-based coaching from the
                 expert notes in content.js.
   ===================================================================== */

window.VHC = window.VHC || {};

VHC.providers = {
  anthropic: {
    label: "Anthropic (Claude)",
    defaultModel: "claude-opus-5",
    models: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"],
    keyHint: "sk-ant-…",
    keyUrl: "https://console.anthropic.com/settings/keys"
  },
  openai: {
    label: "OpenAI (GPT)",
    defaultModel: "gpt-5",
    models: ["gpt-5", "gpt-5-mini", "gpt-4.1"],
    keyHint: "sk-…",
    keyUrl: "https://platform.openai.com/api-keys"
  },
  gemini: {
    label: "Google (Gemini)",
    defaultModel: "gemini-2.5-pro",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    keyHint: "AIza…",
    keyUrl: "https://aistudio.google.com/apikey"
  }
};

/* ---------- provider calls (browser-direct, raw REST) -------------- */

async function callAnthropic({ apiKey, model, system, user, maxTokens }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Required to call the Anthropic API from a browser page.
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Anthropic ${res.status}`);
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  if (data.stop_reason === "max_tokens" && !text.trim()) {
    throw new Error("Claude hit its output limit before answering. Raise maxTokens.");
  }
  if (!text.trim()) throw new Error(`Claude returned no text (${data.stop_reason || "unknown"}).`);
  return text;
}

async function callOpenAI({ apiKey, model, system, user, maxTokens }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_completion_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `OpenAI ${res.status}`);
  const choice = data.choices?.[0];
  const text = choice?.message?.content || "";
  // Reasoning models bill reasoning against max_completion_tokens, so an
  // exhausted budget yields finish_reason "length" with empty content.
  if (!text.trim()) {
    throw new Error(choice?.finish_reason === "length"
      ? "The model hit its output limit before answering. Raise maxTokens."
      : `OpenAI returned no text (${choice?.finish_reason || "unknown"}).`);
  }
  return text;
}

async function callGemini({ apiKey, model, system, user, maxTokens }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens }
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini ${res.status}`);
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts || []).map(p => p.text || "").join("");
  // Gemini 2.5 spends "thinking" tokens out of maxOutputTokens. If the budget
  // runs out the call still returns 200 with truncated or empty text, so check
  // the finish reason rather than handing back an unparseable string.
  if (!text.trim()) {
    const why = cand?.finishReason || "no content";
    throw new Error(why === "MAX_TOKENS"
      ? "Gemini hit its output limit while thinking and returned nothing. Try gemini-2.5-flash, or raise maxTokens."
      : `Gemini returned no text (${why}).`);
  }
  if (cand?.finishReason === "MAX_TOKENS") throw new Error("Gemini response was cut off by the output limit.");
  return text;
}

const DIRECT = { anthropic: callAnthropic, openai: callOpenAI, gemini: callGemini };

/* ---------- unified entry point ------------------------------------ */

VHC.llm = {
  /**
   * cfg = { mode:'browser'|'proxy'|'offline', provider, model, apiKey, proxyUrl }
   * Returns the model's text.
   */
  async complete(cfg, { system, user, maxTokens = 6000 }) {
    if (cfg.mode === "proxy") {
      const res = await fetch(`${cfg.proxyUrl.replace(/\/$/, "")}/api/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: cfg.provider, model: cfg.model, system, user, maxTokens })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Proxy ${res.status}`);
      return data.text || "";
    }
    const fn = DIRECT[cfg.provider];
    if (!fn) throw new Error(`Unknown provider: ${cfg.provider}`);
    if (!cfg.apiKey) throw new Error("No API key set.");
    return fn({ apiKey: cfg.apiKey, model: cfg.model, system, user, maxTokens });
  },

  /**
   * Tolerant JSON extraction. Models wrap JSON in prose or code fences, and
   * occasionally emit a false start — a partial object, then a complete one.
   * Naively slicing from the first "{" to the last "}" spans both and fails,
   * so scan for balanced top-level objects and keep the richest one that parses.
   */
  parseJSON(text) {
    if (!text) return null;
    const tryParse = t => { try { return JSON.parse(t); } catch { return null; } };
    const isObj = o => o && typeof o === "object" && !Array.isArray(o);

    const direct = tryParse(text.trim());
    if (isObj(direct)) return direct;

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      const f = tryParse(fenced[1].trim());
      if (isObj(f)) return f;
    }

    // Brace scan, honouring string literals and escapes.
    const found = [];
    let depth = 0, start = -1, inStr = false, esc = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; continue; }
      if (c === "{") { if (depth === 0) start = i; depth++; }
      else if (c === "}") {
        depth--;
        if (depth === 0 && start >= 0) { found.push(text.slice(start, i + 1)); start = -1; }
        else if (depth < 0) depth = 0;
      }
    }

    let best = null, bestKeys = -1;
    for (const cand of found) {
      const o = tryParse(cand);
      if (isObj(o) && Object.keys(o).length > bestKeys) { best = o; bestKeys = Object.keys(o).length; }
    }
    return best;
  }
};

/* ---------- prompts ------------------------------------------------ */

VHC.prompts = {
  system: `You are an exacting but generous professor of Responsible AI, coaching an
executive-education student through a simulation at a fictional medical-lending
company, Veritas Health Credit.

You will be told, for each decision: the scenario, the option the student chose,
the expert note attached to that option, and (where one exists) the option the
designers consider strongest and its note. Treat the designers' view as informed
but not infallible — if the student's choice is defensible for a reason the
designers missed, say so explicitly and credit it.

Judge along five dimensions:
  1. Problem-solving method — did they frame the problem correctly before reaching for a technique?
  2. Choice of methods and algorithms — SHAP / LIME / Anchors / counterfactuals / model class, matched to the question actually being asked.
  3. Fairness — metric selection, the impossibility results, mitigation stage, intersectionality.
  4. Ethical principles and vulnerabilities — autonomy, recourse, harm to a medically vulnerable population, transparency, power.
  5. Governance — accountability, independence, documentation, monitoring, incident remediation, regulatory posture.

Rules: be specific and concrete; name the technique or the regulation; spell out
every abbreviation the first time you use it (write "population stability index
(PSI)", not "PSI"), because the student is learning this vocabulary; never
praise generically; quote or paraphrase the student's actual choice when you
critique it; keep a warm, direct, collegial tone; no moralising, no bullet-point
padding. Never invent facts about the scenario that were not given to you.`,

  round(ctx) {
    return `The student has just finished **${ctx.roundTitle}**.

${ctx.transcript}

Write coaching for this sprint only. Return JSON exactly in this shape and nothing else:

{
  "headline": "<one sentence, max 18 words, capturing the pattern in this sprint's choices>",
  "strong": ["<a specific thing they got right, naming the concept — omit the array entry if there is genuinely nothing>"],
  "sharpen": ["<a specific weakness, with the concrete alternative they should have chosen and why>"],
  "probe": "<one hard Socratic question that would expose whether they understand their own choice>"
}

1–3 items per array. Be concrete. Reference the actual techniques by name.`;
  },

  reflection(ctx) {
    return `The student wrote a free-text answer in the simulation.

QUESTION: ${ctx.prompt}
RUBRIC (what a strong answer contains): ${ctx.rubric}
STUDENT'S ANSWER: """${ctx.answer}"""

Return JSON exactly in this shape and nothing else:

{
  "score": <integer 0-10>,
  "verdict": "<one sentence>",
  "missing": ["<a specific idea the rubric wanted that the answer lacked; empty array if none>"],
  "rewrite": "<a 2-3 sentence model answer, written in the student's own register>"
}`;
  },

  final(ctx) {
    return `The student has completed the simulation. Here is the full record.

ROLE PLAYED: ${ctx.role}
FINAL METERS: trust ${ctx.meters.trust}, compliance ${ctx.meters.compliance}, performance ${ctx.meters.performance}, budget ${ctx.meters.budget}
DIMENSION SCORES (raw, each out of ${ctx.maxPerDim}): ${JSON.stringify(ctx.totals)}
LIGHTNING ROUND: ${ctx.lightningCorrect} of ${ctx.lightningTotal} correct
BADGES EARNED: ${ctx.badges.join(", ") || "none"}
DEMERITS: ${ctx.demerits.join(", ") || "none"}

FULL DECISION RECORD:
${ctx.transcript}

FREE-TEXT REFLECTIONS:
${ctx.reflections || "(none submitted)"}

Write the student's end-of-course report. Return JSON exactly in this shape and nothing else:

{
  "verdict": "<2-3 sentences. The honest headline assessment of this student as a responsible-AI decision maker. Name their characteristic pattern — e.g. 'technically sharp, governance-light'.>",
  "dimensions": {
    "method":     { "grade": "A|A-|B+|B|B-|C+|C|C-|D|F", "comment": "<2 sentences, citing a specific decision they made>" },
    "methods_algorithms": { "grade": "...", "comment": "..." },
    "fairness":   { "grade": "...", "comment": "..." },
    "ethics":     { "grade": "...", "comment": "..." },
    "governance": { "grade": "...", "comment": "..." }
  },
  "best_moment":  { "decision": "<decision title>", "why": "<1-2 sentences>" },
  "worst_moment": { "decision": "<decision title>", "why": "<1-2 sentences>", "should_have": "<what to do instead>" },
  "blind_spot": "<2-3 sentences naming the single conceptual gap most likely to cause this person real trouble in practice, and how it would show up>",
  "improve": ["<4-6 specific, actionable study or practice items. Each should name a concept, method, framework or paper — e.g. 'Re-read Chouldechova (2017) and work out by hand why calibration and equalized odds conflict at unequal base rates.' Not generic advice.>"],
  "next_scenario": "<one sentence describing a scenario this student should be given next to stretch exactly where they are weakest>"
}`;
  }
};

/* ---------- offline coach (no API key required) -------------------- */

VHC.offlineCoach = {
  round(entries, roundTitle) {
    const strong = [], sharpen = [];
    entries.forEach(e => {
      const line = `<b>${e.title}</b> — ${e.optionLabel}. ${e.note}`;
      (e.quality >= 2 ? strong : sharpen).push(line);
      if (e.quality < 2 && e.bestLabel) {
        sharpen.push(`<span class="muted">Stronger play: ${e.bestLabel}</span>`);
      }
    });
    return {
      headline: `${roundTitle}: ${strong.length} of ${entries.length} decisions landed at or near best practice.`,
      strong: strong.length ? strong : ["No decision in this sprint reached best practice — review the notes below carefully."],
      sharpen: sharpen.length ? sharpen : ["Nothing to sharpen in this sprint. Unusual."],
      probe: "Which of this sprint's choices would you find hardest to defend to a regulator, and why?",
      offline: true
    };
  }
};
