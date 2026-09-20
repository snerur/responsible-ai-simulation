# How to share this with students (and other faculty)

Four routes, easiest first. Pick one — they all deliver the same simulation.

| Route | Students need | You need | Best for |
|---|---|---|---|
| **A. One file** | To open an attachment | Nothing | Email, LMS upload, a USB stick, no internet at your institution |
| **B. GitHub Pages** | A link | A GitHub account (2 min) | A permanent URL you can update and share with other faculty |
| **C. Netlify Drop** | A link | Nothing, no account | A link in 30 seconds without touching git |
| **D. You host the key** | A link, no API key | A server + your API budget | Students who shouldn't or can't get their own API key |

---

## Route A — the single file (simplest)

```bash
node build.mjs          # → dist/veritas-simulation.html  (178 KB, self-contained)
```

Everything — scenarios, styles, glossary, all three LLM clients — is inlined into that one
file. No install, no server, no internet needed to *load* it. Students download it and
double-click; it opens in their browser and runs.

Attach it to a Canvas/Blackboard/Moodle assignment, email it, or drop it in Google Drive or
Dropbox and share the link.

Two things worth knowing:

- **Offline mode works with no internet at all.** Full scenarios, expert debriefs, badges,
  scores, decision log, glossary — everything except the AI coach.
- **The AI coach also works from a double-clicked file.** Anthropic, OpenAI and Google all
  accept the request from a local file (verified in Chrome/Edge/Chromium). If a student's
  browser blocks it — Safari and Firefox are stricter about local files — tell them to use
  Chrome, or use Route B/C, where it always works.

Rebuild the file any time you edit the scenarios.

---

## Route B — GitHub Pages (a permanent link)

Gives you something like `https://snerur.github.io/responsible-ai-simulation/`, which you can
put in a syllabus and reuse every semester. You have the GitHub CLI installed and logged in,
so it is four commands:

```bash
cd /Users/snerur/sridhar/emba/simulation
git init -b main && git add -A && git commit -m "Responsible AI simulation"
gh repo create responsible-ai-simulation --public --source=. --push
gh api -X POST repos/snerur/responsible-ai-simulation/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
```

The site is live about a minute later. To update it after editing scenarios:

```bash
git add -A && git commit -m "Revise Sprint 4" && git push
```

Use `--private` instead of `--public` if you want the source restricted — but note that
**GitHub Pages sites are public even from a private repo** on free plans, which is usually
exactly what you want here: private source, public game.

Other faculty can then fork it and rewrite `js/content.js` for their own industry.

---

## Route C — Netlify Drop (no account, 30 seconds)

Go to <https://app.netlify.com/drop> and drag the whole `simulation` folder onto the page.
You get a live URL immediately. Claim it with a free account if you want to keep it or give
it a nicer name. Cloudflare Pages (<https://pages.cloudflare.com>) and Vercel work the same way.

---

## Route D — you hold one API key for the whole class

Students never see a key, never sign up for anything, and never pay. You pay for roughly 10
model calls per completed playthrough.

Deploy `server/` to any Node host — Render, Railway, Fly.io, or a department VM:

- **Start command:** `node server.mjs`
- **Environment variables:** any of `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`
  (students can only pick the providers you configure)
- The same process serves the game *and* proxies the model calls, so one URL is all you share.

Students open your URL, choose **"Instructor's proxy server"**, and leave the proxy field at
its default. Check `https://your-url/api/health` to confirm which providers are live.

> The proxy has no authentication — anyone with the URL can spend your API budget. For a
> class that is usually fine if the URL isn't posted publicly. If you want it locked down,
> put it behind your institution's SSO, an IP allowlist, or your LMS's authenticated embed,
> and rotate the key at the end of term.

You can also just run it on your laptop during a live session and give students the LAN
address — no cloud account at all.

---

## Copy-paste text for your syllabus or LMS

> **Assignment: The Underwriting Dilemma**
>
> You are the first Head of Responsible AI at Veritas Health Credit, a lender that finances
> medical procedures using a machine learning underwriting model. Over six sprints you will
> make roughly 22 decisions about data, model choice, explanation methods, fairness,
> deployment and governance. Choices are final. An AI coach reviews each sprint and writes
> you a final report.
>
> **Time:** 30–45 minutes. Do it in one sitting.
>
> **To start:** [your link here]
>
> **You will need an API key** from OpenAI, Anthropic or Google — pick one, paste it into the
> setup screen. It stays in your own browser and is never sent anywhere except to the
> provider you chose. A full playthrough costs well under a dollar. If you'd rather not use a
> key, choose **"Offline"**: you still get every scenario and the expert debriefs, just not
> the AI coach.
>
> **To submit:** click **Download results (JSON)** on the final report and upload the file.
> Then write 500 words on the single decision you would now reverse, and why.

---

## Letting other instructors adapt it

Everything pedagogical is in `js/content.js` — scenarios, options, scores, expert notes and
the glossary. The engine, scoring, badges and reporting need no changes to swap the company
and industry entirely. `README.md` documents the data format.

If you plan to share it beyond your own students, add a `LICENSE` file so people know what
they may do with it. **MIT** if you want maximum reuse including commercial training use;
**CC BY 4.0** if you want attribution on a teaching artifact; **CC BY-NC-SA 4.0** if you want
adaptations kept non-commercial and shared alike. Drop the text in `LICENSE` and note it at
the bottom of the README.
