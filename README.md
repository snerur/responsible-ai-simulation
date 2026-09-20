# Veritas Health Credit — The Underwriting Dilemma

An interactive simulation game for **Building Responsible AI Systems**.

Students take the role of the first Head of Responsible AI at *Veritas Health Credit*, a
fictional lender that finances medical procedures with an ML underwriting model. Over six
sprints and a lightning round they make 22–28 decisions spanning MLOps, AIOps, AI ethics,
explainability and governance — then an LLM of their choice writes them a report card.

**▶ Play it: <https://snerur.github.io/responsible-ai-simulation/>**

<p align="center"><i>"Veritas Health Credit is fictional. The failure modes are not."</i></p>

---

## Quick start

### Option 0 — just send the link

<https://snerur.github.io/responsible-ai-simulation/> is already live from this repository. Students open it, paste their own
API key (or pick Offline), and play. Push to `main` and the site updates within a minute.

### Option 1 — run it yourself locally

```bash
cd simulation
python3 -m http.server 8000
# open http://localhost:8000
```

Or host the folder anywhere static: GitHub Pages, Netlify, your LMS, a shared drive.
There is no build step and no backend. Each student picks a provider, pastes their own API
key (stored only in their browser's `localStorage`, sent only to that provider), and plays.

> Serving the folder is the most reliable option, but not the only one: `node build.mjs`
> produces `dist/veritas-simulation.html`, a single self-contained file that students can
> simply double-click. See **[SHARING.md](SHARING.md)** for all four distribution routes.

### Option 2 — you host one key for the whole class

```bash
cd simulation/server
npm install
ANTHROPIC_API_KEY=sk-ant-... node server.mjs
# → http://localhost:8787   (serves the app AND proxies the LLM calls)
```

Set any or all of `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`. Students choose
**"Instructor's proxy server"** and never handle a key. Check `GET /api/health` to see which
providers are configured. Deploy it anywhere Node 20+ runs.

### Option 3 — no LLM at all

Choose **"Offline — no AI coach"**. Students still get every scenario, every expert note,
per-sprint debriefs, dimension scores, badges, ranks and the decision log — just no
AI-written coaching. Useful for exam conditions, flaky wifi, or a zero-budget section.

---

## What students actually do

| Sprint | Title | Concepts exercised |
|---|---|---|
| 1 | Framing the Problem | Target-variable construct validity, fairness through unawareness, proxy variables, label audits |
| 2 | Interpretability vs. Explainability | Intrinsic vs. post-hoc, glass-box models (EBM/GAM, monotone constraints), the accuracy trade, champion–challenger |
| 3 | The Explanation Toolbox | SHAP, LIME, Anchors, counterfactuals, algorithmic recourse, fidelity vs. stability, adverse-action notices |
| 4 | Fairness Under Pressure | Demographic parity, equal opportunity, equalized odds, calibration, the impossibility results, pre/in/post-processing mitigation, intersectionality |
| 5 | Ship It and Keep It Alive | Shadow & canary deployment, PSI/drift under label latency, fairness monitoring, a 3am incident, reject inference & feedback loops |
| 6 | Governance and the Crisis | Press + AG crisis, three lines of defense, model cards / Annex IV / NIST AI RMF, an LLM in a regulated pipeline |
| 7 | The Explainability Clinic | Six rapid-fire "match the method to the question" items |

Every decision moves four live meters — **patient & public trust**, **regulatory safety
margin**, **business performance**, **program runway** — and scores silently on five
dimensions: problem-solving method, choice of methods & algorithms, fairness, ethics, and
governance. Choices are final, and the app shows the strongest option and why immediately
after you commit.

Three sprints end with a **free-text reflection** that the LLM grades 0–10 against a rubric
and rewrites as a model answer.

### The AI coach

After each sprint, the chosen LLM sees the student's actual choices plus the designers'
expert notes, and returns *what worked / sharpen this / one Socratic probe*. It is explicitly
instructed to disagree with the designers where the student's reasoning is defensible.

At the end it writes a full report: an honest verdict, a letter grade and comment per
dimension, best and costliest moment, a named **blind spot**, 4–6 specific study actions,
and a suggested next scenario.

### Acronyms

Every abbreviation is spelled out on first use in the prose, and each one is also decorated
automatically wherever it appears: hover it on desktop or tap it on a phone. A searchable
**📖 Glossary** in the top bar lists all 44 terms — AUC, PSI, TPR/FPR, DPD, WOE, EBM, GA²M,
SHAP/TreeSHAP, LIME, Anchors, DiCE, PDP, ICE, SLO, SRE, ECOA, Regulation B, GDPR, BISG,
Annex IV, NIST AI RMF, SR 11-7 and the rest — each with a plain-language definition, not just
an expansion. The decoration also runs over the LLM's own coaching text, and the coach is
instructed to expand abbreviations on first use itself.

Add or edit terms in `VHC.glossary` at the bottom of `js/content.js`; nothing else needs to
change, the detection picks them up automatically.

### Gamification

20 badges (**Glass-Box Guardian**, **Anchor Hunter**, **Recourse Architect**, **Metric
Realist**, **Night Shift Hero**, **Three Lines of Defense**, **LLM Wrangler**…) and 5
demerits (**Fairness Washing**, **Black-Box Gambler**, **Move Fast, Break People**, **The
Cover-Up**, **Wilfully Unaware**), plus six ranks from *Deposition Witness* up to *Chief
Responsible AI Officer*.

---

## Collecting work for grading

At the end students can **Download results (JSON)** or **Print / save as PDF** (the report
has a dedicated print stylesheet). The JSON contains the role, mode, overall and per-dimension
percentages, final meters, badges, demerits, every decision with a quality rating, the
free-text reflections with their LLM grades, and the full AI report — enough to grade from
directly or to aggregate across a cohort.

A good assignment: play once, then write 500 words on the single decision you would now
reverse and why.

---

## Choosing a provider and model

| Provider | Default | Notes |
|---|---|---|
| Anthropic | `claude-opus-5` | Strongest coaching. Sprint debriefs take ~20s, the final report ~45s. |
| OpenAI | `gpt-5` | Comparable quality and latency. |
| Google | `gemini-2.5-pro` | |

For a live classroom where latency matters more than depth, have students pick
`claude-sonnet-5` or `gemini-2.5-flash` — noticeably snappier, still good coaching. Model
lists live in `js/llm.js` (`VHC.providers`) if you want to pin or add one.

A full playthrough is roughly 10 LLM calls (6 sprint debriefs + 3 reflection grades + 1 final
report), so cost per student is small but non-zero. If a call fails for any reason — bad key,
exhausted quota, no network — the app shows the error and falls back to the built-in expert
debrief rather than breaking the run.

---

## Files

```
index.html          the whole UI
styles.css          dark theme + print stylesheet for the report
js/content.js       ← all scenarios, options, scores, expert notes and the glossary. Edit this.
js/badges.js        badge predicates and rank thresholds
js/llm.js           three providers, browser-direct or via proxy, plus the prompts
js/app.js           game engine, scoring, rendering, report
server/server.mjs   optional instructor proxy + static server (Node 20+)
server/package.json one dependency: @anthropic-ai/sdk
build.mjs           bundles everything into dist/veritas-simulation.html (one file, no server)
SHARING.md          how to distribute this to a class
```

## Customizing it

Everything pedagogical lives in **`js/content.js`**. A decision looks like this:

```js
{
  id: "d4.1", round: "r4", core: true,        // core:false → Full Campaign only
  title: "Pick the fairness metric",
  tag: "Fairness metrics",
  scenario: `...HTML; blank lines become paragraphs...`,
  concept: `...optional "Concept refresher" panel...`,
  options: [{
    id: "b",
    label: "Equal opportunity (TPR parity) as primary…",
    detail: "The longer explanation shown under the label.",
    scores:  { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },  // -3..+3 each
    effects: { trust: 10, compliance: 12, performance: -3, budget: -5 },   // meter deltas
    note: "Why this is right or wrong — shown after committing, and sent to the LLM."
  }, /* … */]
}
```

The option with the highest total `scores` is automatically treated as the strongest, so you
never declare a "correct answer" separately — just score honestly. To swap in your own
industry, rewrite `VHC.company` and the scenarios; the engine, scoring, badges and reporting
need no changes.

One sanity check worth re-running after edits: no decision should have two options tied for
the top total score, or the "strongest option" callout becomes arbitrary.

---

## Privacy

The static app has no backend and no analytics. API keys live in `localStorage` on the
student's machine and are sent only to the provider they selected. If you run the proxy, the
key stays on your server and student prompts pass through it — the prompts contain only
simulation choices, never personal data.
