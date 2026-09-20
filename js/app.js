/* =====================================================================
   Veritas Health Credit — game engine + UI
   ===================================================================== */

(function () {
  "use strict";

  const DIMS = ["rigor", "fairness", "ethics", "governance", "ops"];
  const DIM_LABEL = {
    rigor: "Problem-solving method",
    fairness: "Fairness",
    ethics: "Ethics & vulnerability",
    governance: "Governance",
    ops: "MLOps / AIOps"
  };
  const METERS = {
    trust: { label: "Patient & public trust", icon: "❤" },
    compliance: { label: "Regulatory safety margin", icon: "⚖" },
    performance: { label: "Business performance", icon: "📈" },
    budget: { label: "Program runway", icon: "💰" }
  };
  const STORE_KEY = "vhc-sim-v1";
  const CFG_KEY = "vhc-llm-cfg-v1";

  const $ = sel => document.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Scenario/concept text is authored as HTML with blank-line paragraph breaks.
  // Blank line -> new paragraph; a newline before a <b> lead-in -> line break;
  // any other newline is just source wrapping.
  const fmt = src => String(src).split(/\n\s*\n/).map(chunk => {
    const t = chunk.trim();
    if (!t) return "";
    const body = t.replace(/\n(?=<b>)/g, "<br>").replace(/\n/g, " ");
    return /^<(p|div|table|blockquote|ul|ol|h\d)\b/i.test(t) ? body : `<p>${body}</p>`;
  }).join("");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- glossary ----------------
     Acronyms are expanded on first use in the prose, and every occurrence is
     also decorated here: the first mention of each term inside a rendered
     block becomes an <abbr> you can hover (desktop) or tap (touch) to read.
     Works on LLM-written coaching too, which is why it runs on the DOM
     rather than on the source strings. */

  let ABBR_RE = null;
  function abbrRegex() {
    if (ABBR_RE) return ABBR_RE;
    const terms = Object.keys(VHC.glossary)
      .sort((a, b) => b.length - a.length)
      .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    // Custom boundaries: \b misbehaves around "GA²M" and "SR 11-7".
    ABBR_RE = new RegExp(`(?<![A-Za-z0-9²-])(${terms.join("|")})(s?)(?![A-Za-z0-9²-])`, "g");
    return ABBR_RE;
  }

  const SKIP_TAGS = /^(ABBR|CODE|PRE|SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|BUTTON)$/;

  function annotateAbbr(root) {
    if (!root || !VHC.glossary) return;
    const re = abbrRegex();
    const seen = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        for (let p = n.parentElement; p && p !== root.parentElement; p = p.parentElement) {
          if (SKIP_TAGS.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    for (let n; (n = walker.nextNode());) nodes.push(n);

    nodes.forEach(node => {
      const text = node.nodeValue;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m, hit = false;
      while ((m = re.exec(text))) {
        const key = m[1];
        if (seen.has(key)) continue;
        seen.add(key);
        hit = true;
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const g = VHC.glossary[key];
        const a = document.createElement("abbr");
        a.className = "gloss";
        a.dataset.term = key;
        a.setAttribute("tabindex", "0");
        a.title = `${g.full}${g.def ? " — " + g.def : ""}`;
        a.textContent = m[1] + m[2];
        frag.appendChild(a);
        last = m.index + m[0].length;
      }
      if (!hit) return;
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function renderGlossary(filter = "", highlight = "") {
    const q = filter.trim().toLowerCase();
    const groups = {};
    Object.entries(VHC.glossary).forEach(([term, g]) => {
      if (q && !(term.toLowerCase().includes(q) || g.full.toLowerCase().includes(q) ||
                 (g.def || "").toLowerCase().includes(q))) return;
      (groups[g.group] = groups[g.group] || []).push([term, g]);
    });
    const html = Object.keys(groups).sort().map(grp => `
      <div class="gloss-group">
        <h4>${esc(grp)}</h4>
        ${groups[grp].sort((a, b) => a[0].localeCompare(b[0])).map(([term, g]) => `
          <div class="gloss-item${term === highlight ? " hit" : ""}" id="gloss-${esc(term).replace(/[^A-Za-z0-9]/g, "_")}">
            <div class="gloss-term">${esc(term)}</div>
            <div><div class="gloss-full">${esc(g.full)}</div>
            <div class="gloss-def">${esc(g.def || "")}</div></div>
          </div>`).join("")}
      </div>`).join("");
    $("#gloss-list").innerHTML = html || `<div class="muted">No terms match "${esc(filter)}".</div>`;
  }

  function openGlossary(term) {
    $("#gloss-search").value = "";
    renderGlossary("", term || "");
    $("#glossary").classList.remove("hidden");
    if (term) {
      const t = document.getElementById("gloss-" + term.replace(/[^A-Za-z0-9]/g, "_"));
      if (t) t.scrollIntoView({ block: "center" });
    } else {
      $("#gloss-list").scrollTop = 0;
    }
  }
  const closeGlossary = () => $("#glossary").classList.add("hidden");

  /* ---------------- state ---------------- */

  let S = null;   // game state
  let cfg = null; // llm config

  function newState(roleId, mode) {
    const role = VHC.company.roles.find(r => r.id === roleId);
    return {
      roleId, mode,                       // mode: 'quick' | 'full'
      meters: { ...role.meters },
      picks: {},                          // decisionId -> optionId
      reflections: {},                    // roundId -> { answer, grade }
      coach: {},                          // roundId -> coaching object
      idx: 0,                             // index into the active deck
      started: Date.now(),
      finished: false
    };
  }

  function deck() {
    return VHC.decisions.filter(d => S.mode === "full" || d.core);
  }

  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch { return null; } }
  function saveCfg() { try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ } }
  function loadCfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || "null"); } catch { return null; }
  }

  /* ---------------- scoring ---------------- */

  const optScore = o => DIMS.reduce((a, d) => a + (o.scores?.[d] || 0), 0);
  const bestOption = dec => dec.options.reduce((a, b) => (optScore(b) > optScore(a) ? b : a));

  function quality(dec, opt) {
    // 0 = poor, 1 = weak, 2 = good, 3 = best
    const scores = dec.options.map(optScore).sort((a, b) => b - a);
    const s = optScore(opt);
    if (s === scores[0]) return 3;
    if (s >= scores[0] - 3) return 2;
    if (s >= 0) return 1;
    return 0;
  }

  function tally() {
    const totals = { rigor: 0, fairness: 0, ethics: 0, governance: 0, ops: 0 };
    const maxes = { rigor: 0, fairness: 0, ethics: 0, governance: 0, ops: 0 };
    const mins = { rigor: 0, fairness: 0, ethics: 0, governance: 0, ops: 0 };
    let lightningCorrect = 0, lightningTotal = 0, bestCount = 0, answered = 0;

    deck().forEach(dec => {
      const oid = S.picks[dec.id];
      if (dec.lightning) lightningTotal++;
      if (!oid) return;
      answered++;
      const opt = dec.options.find(o => o.id === oid);
      if (dec.lightning && (opt.best || quality(dec, opt) === 3)) lightningCorrect++;
      if (quality(dec, opt) === 3) bestCount++;
      DIMS.forEach(d => {
        totals[d] += opt.scores?.[d] || 0;
        maxes[d] += Math.max(...dec.options.map(o => o.scores?.[d] || 0));
        mins[d] += Math.min(...dec.options.map(o => o.scores?.[d] || 0));
      });
    });

    const pct = {};
    DIMS.forEach(d => {
      const span = maxes[d] - mins[d];
      pct[d] = span > 0 ? clamp(Math.round(((totals[d] - mins[d]) / span) * 100), 0, 100) : 50;
    });
    const overall = Math.round(DIMS.reduce((a, d) => a + pct[d], 0) / DIMS.length);

    return { totals, maxes, mins, pct, overall, lightningCorrect, lightningTotal, bestCount, answered };
  }

  function earnedBadges(t) {
    const ctx = {
      picks: S.picks, totals: t.totals, meters: S.meters,
      lightningCorrect: t.lightningCorrect, lightningTotal: t.lightningTotal,
      bestCount: t.bestCount, decisionsAnswered: t.answered
    };
    return VHC.badges.filter(b => { try { return b.test(ctx); } catch { return false; } });
  }

  /* ---------------- screens ---------------- */

  function show(id) {
    ["setup", "game", "report"].forEach(s => $("#screen-" + s).classList.toggle("hidden", s !== id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- setup ---------- */

  function renderSetup() {
    $("#brief").innerHTML = VHC.company.brief
      .split("\n\n").map(p => `<p>${esc(p).replace(/\n/g, " ")}</p>`).join("");

    const rw = $("#roles");
    rw.innerHTML = "";
    VHC.company.roles.forEach((r, i) => {
      const c = el("button", "role-card" + (i === 0 ? " selected" : ""));
      c.innerHTML = `<div class="role-name">${esc(r.name)}</div><div class="role-perk">${esc(r.perk)}</div>`;
      c.onclick = () => {
        rw.querySelectorAll(".role-card").forEach(x => x.classList.remove("selected"));
        c.classList.add("selected");
        rw.dataset.role = r.id;
      };
      rw.appendChild(c);
    });
    rw.dataset.role = VHC.company.roles[0].id;

    // LLM config
    cfg = loadCfg() || { mode: "browser", provider: "anthropic", model: "claude-opus-5", apiKey: "", proxyUrl: "http://localhost:8787" };
    const ps = $("#provider");
    ps.innerHTML = Object.entries(VHC.providers)
      .map(([k, p]) => `<option value="${k}">${esc(p.label)}</option>`).join("");
    ps.value = cfg.provider;
    $("#llm-mode").value = cfg.mode;
    $("#proxy-url").value = cfg.proxyUrl;
    $("#api-key").value = cfg.apiKey;
    syncProvider();

    ps.onchange = () => { cfg.model = VHC.providers[ps.value].defaultModel; syncProvider(); };
    $("#llm-mode").onchange = syncProvider;
    $("#test-llm").onclick = testLLM;

    const resumable = load();
    $("#resume").classList.toggle("hidden", !resumable || resumable.finished);
    if (resumable && !resumable.finished) {
      $("#resume").onclick = () => { S = resumable; renderGame(); show("game"); };
    }
  }

  function syncProvider() {
    const mode = $("#llm-mode").value;
    const prov = $("#provider").value;
    const p = VHC.providers[prov];
    $("#model").innerHTML = p.models.map(m => `<option>${esc(m)}</option>`).join("");
    $("#model").value = cfg.provider === prov && cfg.model ? cfg.model : p.defaultModel;
    $("#key-hint").textContent = p.keyHint;
    $("#key-link").href = p.keyUrl;
    $("#row-key").classList.toggle("hidden", mode !== "browser");
    $("#row-proxy").classList.toggle("hidden", mode !== "proxy");
    $("#row-provider").classList.toggle("hidden", mode === "offline");
    $("#row-model").classList.toggle("hidden", mode === "offline");
    $("#test-llm").classList.toggle("hidden", mode === "offline");
    $("#llm-status").textContent = mode === "offline"
      ? "Offline mode: you'll get the built-in expert notes and a rubric-scored report, with no AI coach."
      : "";
  }

  function readCfg() {
    cfg = {
      mode: $("#llm-mode").value,
      provider: $("#provider").value,
      model: $("#model").value,
      apiKey: $("#api-key").value.trim(),
      proxyUrl: $("#proxy-url").value.trim() || "http://localhost:8787"
    };
    saveCfg();
    return cfg;
  }

  async function testLLM() {
    readCfg();
    const st = $("#llm-status");
    st.className = "status";
    st.textContent = "Testing…";
    try {
      const txt = await VHC.llm.complete(cfg, {
        system: "You are terse.",
        user: "Reply with exactly: READY",
        maxTokens: 500
      });
      st.className = "status ok";
      st.textContent = `✓ ${VHC.providers[cfg.provider].label} responded: ${txt.trim().slice(0, 40)}`;
    } catch (e) {
      st.className = "status err";
      st.textContent = `✗ ${e.message}`;
    }
  }

  /* ---------- game ---------- */

  function renderMeters() {
    const w = $("#meters");
    w.innerHTML = "";
    Object.entries(METERS).forEach(([k, m]) => {
      const v = clamp(S.meters[k], 0, 100);
      const tone = v >= 66 ? "good" : v >= 33 ? "warn" : "bad";
      const n = el("div", "meter");
      n.innerHTML = `
        <div class="meter-top"><span>${m.icon} ${esc(m.label)}</span><b>${v}</b></div>
        <div class="bar"><i class="${tone}" style="width:${v}%"></i></div>`;
      w.appendChild(n);
    });
  }

  function renderGame() {
    renderMeters();
    const d = deck();
    const dec = d[S.idx];
    $("#progress-bar").style.width = `${(S.idx / d.length) * 100}%`;
    $("#progress-text").textContent = `Decision ${Math.min(S.idx + 1, d.length)} of ${d.length}`;

    if (!dec) { finish(); return; }

    const round = VHC.rounds.find(r => r.id === dec.round);
    const first = S.idx === 0 || d[S.idx - 1].round !== dec.round;
    const stage = $("#stage");
    stage.innerHTML = "";

    if (first) {
      const intro = el("div", "round-intro");
      intro.innerHTML = `
        <div class="round-kicker">Sprint ${round.n}</div>
        <h2>${esc(round.title)}</h2>
        <div class="round-sub">${esc(round.subtitle)}</div>
        <p>${esc(round.intro).replace(/\n/g, " ")}</p>
        <div class="chips">${round.concepts.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>`;
      stage.appendChild(intro);
    }

    const card = el("div", "card decision");
    card.innerHTML = `
      <div class="dec-head">
        <span class="tag">${esc(dec.tag)}</span>
        <h3>${esc(dec.title)}</h3>
      </div>
      <div class="scenario">${fmt(dec.scenario)}</div>
      ${dec.concept ? `<details class="concept"><summary>Concept refresher</summary><div>${fmt(dec.concept)}</div></details>` : ""}
      <div class="options"></div>
      <div class="dec-actions">
        <button class="btn primary" id="lock" disabled>Lock in decision</button>
        <span class="hint">Choices are final — like the real thing.</span>
      </div>`;
    stage.appendChild(card);

    annotateAbbr(stage);

    const optWrap = card.querySelector(".options");
    let chosen = null;
    dec.options.forEach(o => {
      const b = el("button", "option");
      b.innerHTML = `<span class="opt-key">${o.id.toUpperCase()}</span>
        <span class="opt-body"><b>${esc(o.label)}</b>${o.detail ? `<span class="opt-detail">${esc(o.detail)}</span>` : ""}</span>`;
      b.onclick = () => {
        optWrap.querySelectorAll(".option").forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        chosen = o;
        card.querySelector("#lock").disabled = false;
      };
      optWrap.appendChild(b);
    });

    card.querySelector("#lock").onclick = () => {
      if (!chosen) return;
      commit(dec, chosen, card, optWrap);
    };
  }

  function commit(dec, opt, card, optWrap) {
    S.picks[dec.id] = opt.id;
    Object.entries(opt.effects || {}).forEach(([k, v]) => {
      S.meters[k] = clamp((S.meters[k] || 0) + v, 0, 100);
    });
    save();
    renderMeters();

    const q = quality(dec, opt);
    const best = bestOption(dec);
    optWrap.querySelectorAll(".option").forEach((n, i) => {
      n.disabled = true;
      const o = dec.options[i];
      if (o.id === opt.id) n.classList.add("locked", ["poor", "weak", "good", "best"][q]);
      if (o.id === best.id && o.id !== opt.id) n.classList.add("was-best");
    });
    card.querySelector(".dec-actions").remove();

    const fb = el("div", "feedback " + ["poor", "weak", "good", "best"][q]);
    const verdictLabel = ["Costly", "Partial credit", "Solid", "Best available"][q];
    fb.innerHTML = `
      <div class="fb-head"><span class="verdict">${verdictLabel}</span>
        <span class="deltas">${Object.entries(opt.effects || {}).filter(([, v]) => v)
          .map(([k, v]) => `<span class="${v > 0 ? "up" : "down"}">${METERS[k].icon} ${v > 0 ? "+" : ""}${v}</span>`).join("")}</span>
      </div>
      <div class="fb-note">${opt.note || ""}</div>
      ${q < 3 ? `<div class="fb-best"><b>Strongest option was ${best.id.toUpperCase()}:</b> ${esc(best.label)}<div class="fb-best-note">${best.note || ""}</div></div>` : ""}`;
    card.appendChild(fb);
    annotateAbbr(fb);

    const next = el("div", "dec-actions");
    next.innerHTML = `<button class="btn primary" id="next">Continue →</button>`;
    card.appendChild(next);
    next.querySelector("#next").onclick = async () => {
      S.idx++;
      save();
      const d = deck();
      const endOfRound = !d[S.idx] || d[S.idx].round !== dec.round;
      if (endOfRound && dec.round !== "r7") {
        await roundBreak(dec.round);
      } else {
        renderGame();
      }
    };
    fb.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- round break: coaching + reflection ---------- */

  function roundEntries(roundId) {
    return deck().filter(d => d.round === roundId && S.picks[d.id]).map(d => {
      const o = d.options.find(x => x.id === S.picks[d.id]);
      const b = bestOption(d);
      return {
        id: d.id, title: d.title, tag: d.tag,
        optionLabel: o.label, note: o.note || "",
        bestLabel: b.id === o.id ? null : b.label,
        bestNote: b.id === o.id ? null : b.note,
        quality: quality(d, o)
      };
    });
  }

  function transcriptFor(entries) {
    return entries.map(e =>
      `DECISION: ${e.title} [${e.tag}]\n` +
      `  STUDENT CHOSE: ${e.optionLabel}\n` +
      `  EXPERT NOTE ON THAT CHOICE: ${stripTags(e.note)}\n` +
      (e.bestLabel ? `  DESIGNERS' STRONGEST OPTION: ${e.bestLabel} — ${stripTags(e.bestNote)}\n` : `  (This was the designers' strongest option.)\n`)
    ).join("\n");
  }

  const stripTags = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  async function roundBreak(roundId) {
    const round = VHC.rounds.find(r => r.id === roundId);
    const entries = roundEntries(roundId);
    const stage = $("#stage");
    stage.innerHTML = "";

    const card = el("div", "card coach");
    card.innerHTML = `<div class="dec-head"><span class="tag">Sprint review</span>
      <h3>${esc(round.title)} — debrief</h3></div>
      <div id="coach-body" class="coach-body"><div class="spinner"></div><span class="muted">Consulting your AI coach…</span></div>`;
    stage.appendChild(card);

    let coaching;
    if (cfg.mode === "offline") {
      coaching = VHC.offlineCoach.round(entries, round.title);
    } else {
      try {
        const txt = await VHC.llm.complete(cfg, {
          system: VHC.prompts.system,
          user: VHC.prompts.round({ roundTitle: round.title, transcript: transcriptFor(entries) }),
          maxTokens: 2000
        });
        coaching = VHC.llm.parseJSON(txt) || { headline: "Coach response could not be parsed.", strong: [], sharpen: [txt.slice(0, 600)], probe: "" };
      } catch (e) {
        coaching = VHC.offlineCoach.round(entries, round.title);
        coaching.error = e.message;
      }
    }
    S.coach[roundId] = coaching;
    save();

    const body = card.querySelector("#coach-body");
    body.innerHTML = `
      ${coaching.error ? `<div class="warn-note">AI coach unavailable (${esc(coaching.error)}) — showing the built-in expert debrief.</div>` : ""}
      ${coaching.offline ? `<div class="muted small">Built-in expert debrief (offline mode).</div>` : ""}
      <div class="coach-headline">${esc(coaching.headline || "")}</div>
      ${listBlock("What worked", coaching.strong, "good")}
      ${listBlock("Sharpen this", coaching.sharpen, "warn")}
      ${coaching.probe ? `<div class="probe"><b>Think about it:</b> ${esc(coaching.probe)}</div>` : ""}`;
    annotateAbbr(body);

    const refl = VHC.reflections[roundId];
    if (refl) {
      const rc = el("div", "card reflect");
      rc.innerHTML = `
        <div class="dec-head"><span class="tag">Write it down</span><h3>Reflection</h3></div>
        <p class="reflect-q">${esc(refl.prompt)}</p>
        <textarea id="refl-input" rows="5" placeholder="Your answer…"></textarea>
        <div class="dec-actions">
          <button class="btn primary" id="refl-submit">Submit</button>
          <button class="btn ghost" id="refl-skip">Skip</button>
        </div>
        <div id="refl-result"></div>`;
      stage.appendChild(rc);
      rc.querySelector("#refl-skip").onclick = () => continueAfterBreak();
      rc.querySelector("#refl-submit").onclick = async () => {
        const answer = rc.querySelector("#refl-input").value.trim();
        if (!answer) return;
        const out = rc.querySelector("#refl-result");
        out.innerHTML = `<div class="spinner"></div>`;
        let grade = null;
        if (cfg.mode !== "offline") {
          try {
            const txt = await VHC.llm.complete(cfg, {
              system: VHC.prompts.system,
              user: VHC.prompts.reflection({ prompt: refl.prompt, rubric: refl.rubric, answer }),
              maxTokens: 1500
            });
            grade = VHC.llm.parseJSON(txt);
          } catch (e) { grade = null; }
        }
        S.reflections[roundId] = { answer, grade };
        save();
        out.innerHTML = grade
          ? `<div class="grade"><div class="grade-score">${grade.score}<span>/10</span></div>
             <div><div class="grade-verdict">${esc(grade.verdict || "")}</div>
             ${(grade.missing || []).length ? `<div class="small"><b>Missing:</b> ${grade.missing.map(esc).join("; ")}</div>` : ""}
             ${grade.rewrite ? `<div class="rewrite"><b>A model answer:</b> ${esc(grade.rewrite)}</div>` : ""}</div></div>`
          : `<div class="muted small">Saved. It will be included in your final report.<div class="rewrite"><b>What a strong answer contains:</b> ${esc(refl.rubric)}</div></div>`;
        rc.querySelector("#refl-submit").disabled = true;
        const cont = el("div", "dec-actions");
        cont.innerHTML = `<button class="btn primary" id="refl-cont">Continue →</button>`;
        out.appendChild(cont);
        cont.querySelector("#refl-cont").onclick = () => continueAfterBreak();
      };
    } else {
      const cont = el("div", "dec-actions");
      cont.innerHTML = `<button class="btn primary" id="cont">Next sprint →</button>`;
      card.appendChild(cont);
      cont.querySelector("#cont").onclick = () => continueAfterBreak();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function listBlock(title, items, tone) {
    if (!items || !items.length) return "";
    return `<div class="coach-block ${tone}"><h4>${esc(title)}</h4><ul>${items.map(i => `<li>${typeof i === "string" && /<[a-z]/i.test(i) ? i : esc(i)}</li>`).join("")}</ul></div>`;
  }

  function continueAfterBreak() {
    if (!deck()[S.idx]) finish(); else renderGame();
  }

  /* ---------- final report ---------- */

  async function finish() {
    S.finished = true;
    save();
    show("report");

    const t = tally();
    const badges = earnedBadges(t);
    const gold = badges.filter(b => b.tier !== "demerit");
    const demerits = badges.filter(b => b.tier === "demerit");
    const rank = VHC.ranks.find(r => t.overall >= r.min);
    const role = VHC.company.roles.find(r => r.id === S.roleId);

    $("#report-body").innerHTML = `
      <div class="report-hero">
        <div class="score-ring" style="--p:${t.overall}">
          <div class="score-num">${t.overall}<span>%</span></div>
        </div>
        <div>
          <div class="rank-title">${esc(rank.title)}</div>
          <div class="rank-note">${esc(rank.note)}</div>
          <div class="muted small">Played as ${esc(role.name)} · ${t.answered} decisions ·
            ${t.bestCount} best-available · lightning ${t.lightningCorrect}/${t.lightningTotal}</div>
        </div>
      </div>

      <div class="panel">
        <h3>Dimension scores</h3>
        ${DIMS.map(d => `
          <div class="dimrow">
            <span class="dimname">${esc(DIM_LABEL[d])}</span>
            <div class="bar"><i class="${t.pct[d] >= 66 ? "good" : t.pct[d] >= 40 ? "warn" : "bad"}" style="width:${t.pct[d]}%"></i></div>
            <b>${t.pct[d]}%</b>
          </div>`).join("")}
      </div>

      <div class="panel">
        <h3>Final state of Veritas Health Credit</h3>
        <div id="report-meters" class="meters"></div>
      </div>

      <div class="panel">
        <h3>Badges earned <span class="muted">(${gold.length} of ${VHC.badges.filter(b => b.tier !== "demerit").length})</span></h3>
        <div class="badge-grid">
          ${VHC.badges.filter(b => b.tier !== "demerit").map(b => {
            const got = gold.includes(b);
            return `<div class="badge ${got ? "earned " + b.tier : "locked"}">
              <div class="badge-icon">${b.icon}</div>
              <div class="badge-name">${esc(b.name)}</div>
              <div class="badge-blurb">${esc(b.blurb)}</div></div>`;
          }).join("")}
        </div>
        ${demerits.length ? `<h3 class="demerit-head">Demerits</h3>
          <div class="badge-grid">${demerits.map(b => `<div class="badge earned demerit">
            <div class="badge-icon">${b.icon}</div><div class="badge-name">${esc(b.name)}</div>
            <div class="badge-blurb">${esc(b.blurb)}</div></div>`).join("")}</div>` : ""}
      </div>

      <div class="panel" id="ai-report">
        <h3>Your examiner's report</h3>
        <div class="loading"><div class="spinner"></div><span class="muted">Writing your report…</span></div>
      </div>

      <div class="panel">
        <h3>Decision log</h3>
        <table class="log">
          <tr><th>Sprint</th><th>Decision</th><th>Your choice</th><th></th></tr>
          ${deck().filter(d => S.picks[d.id]).map(d => {
            const o = d.options.find(x => x.id === S.picks[d.id]);
            const q = quality(d, o);
            return `<tr><td>${VHC.rounds.find(r => r.id === d.round).n}</td>
              <td>${esc(d.title)}</td><td>${esc(o.label)}</td>
              <td><span class="pill ${["poor", "weak", "good", "best"][q]}">${["Costly", "Partial", "Solid", "Best"][q]}</span></td></tr>`;
          }).join("")}
        </table>
      </div>

      <div class="report-actions">
        <button class="btn" id="dl-json">Download results (JSON)</button>
        <button class="btn" id="print">Print / save as PDF</button>
        <button class="btn ghost" id="replay">Play again</button>
      </div>`;

    const mw = $("#report-meters");
    Object.entries(METERS).forEach(([k, m]) => {
      const v = clamp(S.meters[k], 0, 100);
      const n = el("div", "meter");
      n.innerHTML = `<div class="meter-top"><span>${m.icon} ${esc(m.label)}</span><b>${v}</b></div>
        <div class="bar"><i class="${v >= 66 ? "good" : v >= 33 ? "warn" : "bad"}" style="width:${v}%"></i></div>`;
      mw.appendChild(n);
    });

    annotateAbbr($("#report-body"));
    $("#dl-json").onclick = () => downloadResults(t, gold, demerits, rank);
    $("#print").onclick = () => window.print();
    $("#replay").onclick = () => { localStorage.removeItem(STORE_KEY); location.reload(); };

    renderAIReport(t, gold, demerits, role);
  }

  async function renderAIReport(t, gold, demerits, role) {
    const box = $("#ai-report");
    if (cfg.mode === "offline") {
      box.innerHTML = `<h3>Your examiner's report</h3>
        <div class="muted">Offline mode — no AI examiner. Your dimension scores, badges and the
        decision log above give you the full rubric-based assessment. To get written coaching,
        replay with an API key or the local proxy.</div>
        ${offlineImprove(t)}`;
      return;
    }

    const entries = deck().filter(d => S.picks[d.id]).map(d => {
      const o = d.options.find(x => x.id === S.picks[d.id]);
      const b = bestOption(d);
      return { title: d.title, tag: d.tag, optionLabel: o.label, note: o.note, bestLabel: b.id === o.id ? null : b.label, bestNote: b.note };
    });
    const reflText = Object.entries(S.reflections).map(([rid, r]) =>
      `[${VHC.rounds.find(x => x.id === rid).title}] Q: ${VHC.reflections[rid].prompt}\nA: ${r.answer}`).join("\n\n");

    try {
      const txt = await VHC.llm.complete(cfg, {
        system: VHC.prompts.system,
        user: VHC.prompts.final({
          role: role.name, meters: S.meters, totals: t.pct, maxPerDim: 100,
          lightningCorrect: t.lightningCorrect, lightningTotal: t.lightningTotal,
          badges: gold.map(b => b.name), demerits: demerits.map(b => b.name),
          transcript: transcriptFor(entries), reflections: reflText
        }),
        maxTokens: 4000
      });
      const r = VHC.llm.parseJSON(txt);
      if (!r) { box.innerHTML = `<h3>Your examiner's report</h3><div class="prose">${esc(txt)}</div>`; return; }

      const dimKeys = [["method", "Problem-solving method"], ["methods_algorithms", "Choice of methods & algorithms"],
        ["fairness", "Fairness"], ["ethics", "Ethical principles & vulnerabilities"], ["governance", "Governance"]];

      box.innerHTML = `
        <h3>Your examiner's report <span class="muted small">— ${esc(VHC.providers[cfg.provider].label)} · ${esc(cfg.model)}</span></h3>
        <div class="verdict-box">${esc(r.verdict || "")}</div>
        <div class="grade-grid">
          ${dimKeys.map(([k, lab]) => {
            const d = (r.dimensions || {})[k] || {};
            return `<div class="grade-card"><div class="grade-letter">${esc(d.grade || "—")}</div>
              <div><div class="grade-dim">${esc(lab)}</div><div class="small">${esc(d.comment || "")}</div></div></div>`;
          }).join("")}
        </div>
        ${r.best_moment ? `<div class="moment good"><b>Best moment — ${esc(r.best_moment.decision || "")}:</b> ${esc(r.best_moment.why || "")}</div>` : ""}
        ${r.worst_moment ? `<div class="moment bad"><b>Costliest moment — ${esc(r.worst_moment.decision || "")}:</b> ${esc(r.worst_moment.why || "")}
           ${r.worst_moment.should_have ? `<div class="small"><b>Instead:</b> ${esc(r.worst_moment.should_have)}</div>` : ""}</div>` : ""}
        ${r.blind_spot ? `<div class="blindspot"><h4>Your blind spot</h4><p>${esc(r.blind_spot)}</p></div>` : ""}
        ${(r.improve || []).length ? `<div class="coach-block warn"><h4>How to improve</h4>
           <ul>${r.improve.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>` : ""}
        ${r.next_scenario ? `<div class="probe"><b>Try this next:</b> ${esc(r.next_scenario)}</div>` : ""}`;
      annotateAbbr(box);
      S.finalReport = r;
      save();
    } catch (e) {
      box.innerHTML = `<h3>Your examiner's report</h3>
        <div class="warn-note">AI examiner unavailable (${esc(e.message)}).</div>${offlineImprove(t)}`;
    }
  }

  function offlineImprove(t) {
    const weak = DIMS.slice().sort((a, b) => t.pct[a] - t.pct[b]).slice(0, 2);
    const recs = {
      rigor: "Practise separating <i>what question am I answering?</i> from <i>what tool do I know?</i> Re-read the target-variable and construct-validity material (Obermeyer et al. 2019 is the canonical case).",
      fairness: "Work through the impossibility results by hand (Chouldechova 2017; Kleinberg, Mullainathan & Raghavan 2016) until you can derive why calibration and equalized odds conflict at unequal base rates.",
      ethics: "Re-examine the recourse decisions. Read Ustun et al. on actionable recourse and Wachter et al. on counterfactual explanations, then rewrite the adverse-action notice yourself.",
      governance: "Map VHC onto the NIST AI RMF (Govern/Map/Measure/Manage) and the three-lines-of-defense model. Identify, for each of your decisions, who could have blocked it.",
      ops: "Design the monitoring stack for a model whose labels mature in 24 months. List every leading indicator, its threshold, its owner and its runbook."
    };
    return `<div class="coach-block warn"><h4>Where to focus</h4><ul>
      ${weak.map(d => `<li><b>${esc(DIM_LABEL[d])} (${t.pct[d]}%)</b> — ${recs[d]}</li>`).join("")}
    </ul></div>`;
  }

  function downloadResults(t, gold, demerits, rank) {
    const payload = {
      simulation: "Veritas Health Credit — The Underwriting Dilemma",
      completedAt: new Date().toISOString(),
      role: VHC.company.roles.find(r => r.id === S.roleId).name,
      mode: S.mode,
      overallPercent: t.overall,
      rank: rank.title,
      dimensionPercent: t.pct,
      finalMeters: S.meters,
      lightning: `${t.lightningCorrect}/${t.lightningTotal}`,
      badges: gold.map(b => b.name),
      demerits: demerits.map(b => b.name),
      decisions: deck().filter(d => S.picks[d.id]).map(d => {
        const o = d.options.find(x => x.id === S.picks[d.id]);
        return { id: d.id, decision: d.title, choice: o.label, quality: ["Costly", "Partial", "Solid", "Best"][quality(d, o)] };
      }),
      reflections: S.reflections,
      aiReport: S.finalReport || null,
      llm: cfg.mode === "offline" ? "offline" : `${cfg.provider}/${cfg.model}`
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vhc-simulation-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ---------------- boot ---------------- */

  document.addEventListener("DOMContentLoaded", () => {
    renderSetup();
    $("#start").onclick = () => {
      readCfg();
      if (cfg.mode === "browser" && !cfg.apiKey) {
        if (!confirm("No API key entered. Start in offline mode (built-in expert notes, no AI coach)?")) return;
        cfg.mode = "offline"; saveCfg();
      }
      S = newState($("#roles").dataset.role, document.querySelector('input[name="len"]:checked').value);
      save();
      renderGame();
      show("game");
    };
    $("#open-glossary").onclick = () => openGlossary();
    $("#gloss-close").onclick = closeGlossary;
    $("#glossary").onclick = e => { if (e.target.id === "glossary") closeGlossary(); };
    $("#gloss-search").oninput = e => renderGlossary(e.target.value);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeGlossary(); });
    document.addEventListener("click", e => {
      const a = e.target.closest && e.target.closest("abbr.gloss");
      if (a) openGlossary(a.dataset.term);
    });

    $("#restart").onclick = () => {
      if (confirm("Abandon this run and return to setup?")) { localStorage.removeItem(STORE_KEY); location.reload(); }
    };
  });
})();
