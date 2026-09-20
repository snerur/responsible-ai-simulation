/* =====================================================================
   Badges & achievements
   Each badge has: id, name, icon, blurb, tier ('gold'|'silver'|'demerit'),
   and test(ctx) where ctx = { picks, totals, meters, lightningCorrect,
   bestCount, decisionsAnswered }
     picks   : { decisionId: optionId }
     totals  : { rigor, fairness, ethics, governance, ops }
   ===================================================================== */

window.VHC = window.VHC || {};

const chose = (ctx, d, o) => ctx.picks[d] === o;

VHC.badges = [
  {
    id: "glass-box-guardian", name: "Glass-Box Guardian", icon: "🔍", tier: "gold",
    blurb: "Chose an intrinsically interpretable model for a high-risk credit decision instead of buying 1.8 AUC points of opacity.",
    test: ctx => chose(ctx, "d2.1", "c")
  },
  {
    id: "vocabulary-police", name: "Vocabulary Police", icon: "📖", tier: "gold",
    blurb: "Corrected the interpretability/explainability conflation in front of the whole steering committee.",
    test: ctx => chose(ctx, "d2.2", "b")
  },
  {
    id: "recourse-architect", name: "Recourse Architect", icon: "🪜", tier: "gold",
    blurb: "Built explanations that tell people what to do next — mutable, plausible, sparse, effort-weighted.",
    test: ctx => chose(ctx, "d3.4", "c") || chose(ctx, "d3.1", "c")
  },
  {
    id: "anchor-hunter", name: "Anchor Hunter", icon: "⚓", tier: "gold",
    blurb: "Knew that a regulator asking for a rule wants Anchors, with precision and coverage attached.",
    test: ctx => chose(ctx, "d3.2", "b") || chose(ctx, "d7.3", "a")
  },
  {
    id: "lime-skeptic", name: "LIME Skeptic", icon: "🍋", tier: "silver",
    blurb: "Recognized explanation instability as a compliance defect and did something honest about it.",
    test: ctx => chose(ctx, "d3.3", "c") || chose(ctx, "d3.3", "d") || chose(ctx, "d7.4", "b")
  },
  {
    id: "proxy-detective", name: "Proxy Detective", icon: "🕵️", tier: "gold",
    blurb: "Turned proxy-hunting from a hunch into a repeatable, documented, auditable control.",
    test: ctx => chose(ctx, "d1.3", "c")
  },
  {
    id: "metric-realist", name: "Metric Realist", icon: "⚖️", tier: "gold",
    blurb: "Explained the fairness impossibility result and handed the value judgement to an accountable body.",
    test: ctx => chose(ctx, "d4.2", "b") || chose(ctx, "d7.5", "b")
  },
  {
    id: "root-causer", name: "Root Causer", icon: "🌱", tier: "gold",
    blurb: "Fixed the cause of the disparity, not just the symptom — and kept the remedy legally clean.",
    test: ctx => chose(ctx, "d4.3", "c")
  },
  {
    id: "shadow-operator", name: "Shadow Operator", icon: "🌓", tier: "gold",
    blurb: "Shadow, then canary, with fairness in the guardrail set and a rollback you actually tested.",
    test: ctx => chose(ctx, "d5.1", "b")
  },
  {
    id: "drift-sentinel", name: "Drift Sentinel", icon: "📡", tier: "gold",
    blurb: "Monitored leading indicators under two-year label latency — and made fairness a live alert.",
    test: ctx => chose(ctx, "d5.2", "c") || chose(ctx, "d7.6", "c")
  },
  {
    id: "night-shift", name: "Night Shift Hero", icon: "🌙", tier: "gold",
    blurb: "Rolled back, froze the pipeline, and went back for the 4,000 people nobody else would have re-decided.",
    test: ctx => chose(ctx, "d5.3", "c")
  },
  {
    id: "loop-breaker", name: "Loop Breaker", icon: "🔁", tier: "silver",
    blurb: "Saw the reject-inference feedback loop and bought unbiased data to break it.",
    test: ctx => chose(ctx, "d5.4", "c")
  },
  {
    id: "truth-teller", name: "Truth Teller", icon: "📣", tier: "gold",
    blurb: "Confirmed the finding, published the remediation, and briefed the regulator before the story ran.",
    test: ctx => chose(ctx, "d6.1", "c")
  },
  {
    id: "three-lines", name: "Three Lines of Defense", icon: "🏛️", tier: "gold",
    blurb: "Built independent validation with a real power to block and one named accountable human.",
    test: ctx => chose(ctx, "d6.2", "c")
  },
  {
    id: "paper-trail", name: "Paper Trail", icon: "🗂️", tier: "silver",
    blurb: "Auto-generated layered documentation with a crosswalk across EU AI Act, NIST AI RMF and SR 11-7.",
    test: ctx => chose(ctx, "d6.3", "b")
  },
  {
    id: "llm-wrangler", name: "LLM Wrangler", icon: "🤖", tier: "gold",
    blurb: "Demoted the generative model to a rendering layer over facts computed by an auditable method.",
    test: ctx => chose(ctx, "d6.4", "c")
  },
  {
    id: "clinic-perfect", name: "Perfect Clinic", icon: "🎯", tier: "gold",
    blurb: "Swept the lightning round. Every method matched to the question it actually answers.",
    test: ctx => ctx.lightningTotal > 0 && ctx.lightningCorrect === ctx.lightningTotal
  },
  {
    id: "measurement-plane", name: "Measurement Plane", icon: "🧭", tier: "gold",
    blurb: "Separated the measurement plane from the decision plane — collected protected attributes for audit only.",
    test: ctx => chose(ctx, "d1.2", "c")
  },
  {
    id: "whole-hog", name: "Full Six Sprints", icon: "🏁", tier: "silver",
    blurb: "Completed the full campaign — every sprint, every decision.",
    test: ctx => ctx.decisionsAnswered >= 28
  },
  {
    id: "balanced-scorecard", name: "Balanced Scorecard", icon: "🧮", tier: "gold",
    blurb: "Ended with every dimension positive — no dimension sacrificed for another.",
    test: ctx => ["rigor", "fairness", "ethics", "governance", "ops"].every(k => ctx.totals[k] > 0)
  },

  /* ---------------- demerits ---------------- */
  {
    id: "move-fast", name: "Move Fast, Break People", icon: "💥", tier: "demerit",
    blurb: "Big-bang deployment or a 3am delay — you optimized for the calendar over the customer.",
    test: ctx => chose(ctx, "d5.1", "a") || chose(ctx, "d5.3", "a") || chose(ctx, "d5.3", "b")
  },
  {
    id: "fairness-washing", name: "Fairness Washing", icon: "🧼", tier: "demerit",
    blurb: "Reported the metric you already passed, or shopped for the one that flattered you.",
    test: ctx => chose(ctx, "d4.1", "c") || chose(ctx, "d4.2", "c") || chose(ctx, "d4.2", "a")
  },
  {
    id: "black-box-gambler", name: "Black-Box Gambler", icon: "🎲", tier: "demerit",
    blurb: "Bought accuracy with opacity on a high-risk system, then explained it with a post-hoc story.",
    test: ctx => chose(ctx, "d2.1", "a") || chose(ctx, "d2.2", "a")
  },
  {
    id: "unaware", name: "Wilfully Unaware", icon: "🙈", tier: "demerit",
    blurb: "Fairness through unawareness — you made bias undetectable, not absent.",
    test: ctx => chose(ctx, "d1.2", "a") || chose(ctx, "d4.4", "d")
  },
  {
    id: "cover-up", name: "The Cover-Up", icon: "🤐", tier: "demerit",
    blurb: "Concealed a known defect in a legally mandated disclosure, or attacked the messenger.",
    test: ctx => chose(ctx, "d3.3", "a") || chose(ctx, "d6.1", "a") || chose(ctx, "d6.1", "b")
  }
];

/* Ranks by total weighted score percentage */
VHC.ranks = [
  { min: 90, title: "Chief Responsible AI Officer", note: "Board-ready. You would survive an audit, a journalist, and a 3am page." },
  { min: 78, title: "Head of Responsible AI", note: "Strong, defensible practice with a few exposed edges." },
  { min: 64, title: "Senior AI Risk Lead", note: "You know the tools. Sharpen when and why you reach for each one." },
  { min: 50, title: "Responsible AI Practitioner", note: "Solid instincts, inconsistent follow-through. The gaps are learnable." },
  { min: 34, title: "AI Ethics Apprentice", note: "You can name the concepts. Now practise choosing between them under pressure." },
  { min: 0,  title: "Deposition Witness", note: "Several choices here would be read aloud to you by opposing counsel." }
];
