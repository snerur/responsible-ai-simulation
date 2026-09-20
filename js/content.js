/* =====================================================================
   Veritas Health Credit — The Underwriting Dilemma
   Scenario content for "Building Responsible AI Systems"
   ---------------------------------------------------------------------
   Scoring dimensions (per option), range -3 .. +3
     rigor      = appropriateness of the problem-solving method
     fairness   = fairness metrics, bias diagnosis & mitigation
     ethics     = ethical principles, harms, autonomy, vulnerability
     governance = accountability, documentation, oversight, compliance
     ops        = MLOps / AIOps discipline
   Meter effects, range -25 .. +25  (trust, compliance, performance, budget)
     trust       = customer / public / clinician confidence
     compliance  = regulatory safety margin (higher = safer)
     performance = business & model performance
     budget      = remaining runway for the program
   ===================================================================== */

window.VHC = window.VHC || {};

VHC.company = {
  name: "Veritas Health Credit",
  ticker: "VHC",
  tagline: "Care now. Pay over time.",
  brief: `Veritas Health Credit (VHC) lends money to patients so they can afford
elective and semi-elective medical procedures — fertility treatment, orthopedic
surgery, dental reconstruction, bariatric surgery, hearing implants. A patient
applies on a tablet in the clinic waiting room and gets an answer in 40 seconds.

VHC's model, CARENOW-3, decides three things: approve or decline, the credit
limit, and the interest rate (the annual percentage rate, or APR). Last year it
made 2.4 million decisions. Roughly 38% of applicants are declined. VHC is
regulated as a consumer lender (in the US, by the Equal Credit Opportunity Act,
ECOA, and its implementing Regulation B — every decline requires a specific,
accurate "adverse action" reason) and its EU subsidiary must treat the system as a
high-risk AI system under the EU AI Act.

You have just been hired as VHC's first Head of Responsible AI. You report to
the Chief Risk Officer and you have a dotted line to the board's Technology &
Ethics Committee. CARENOW-4 ships in six months.`,
  roles: [
    { id: "rai", name: "Head of Responsible AI", perk: "Balanced start. No bonuses, no penalties.",
      meters: { trust: 60, compliance: 60, performance: 60, budget: 100 } },
    { id: "cro", name: "Chief Risk Officer", perk: "+10 compliance, −10 performance. Regulators take your calls.",
      meters: { trust: 60, compliance: 70, performance: 50, budget: 100 } },
    { id: "cds", name: "Chief Data Scientist", perk: "+10 performance, −10 compliance. Your team ships fast.",
      meters: { trust: 60, compliance: 50, performance: 70, budget: 100 } },
    { id: "adv", name: "Patient Advocate on the Board", perk: "+15 trust, −15 budget. You have moral authority, not resources.",
      meters: { trust: 75, compliance: 60, performance: 60, budget: 85 } }
  ]
};

/* ------------------------------------------------------------------ */
/* Rounds                                                              */
/* ------------------------------------------------------------------ */

VHC.rounds = [
  {
    id: "r1",
    n: 1,
    title: "Sprint 1 — Framing the Problem",
    subtitle: "Weeks 1–4 · Data & target definition",
    concepts: ["Problem framing", "Construct validity", "Proxy variables", "Fairness through unawareness"],
    intro: `Your first design review for CARENOW-4 is Thursday. Before anyone
trains anything, three framing decisions land on your desk. These are the
decisions that will still be haunting VHC in two years — most AI ethics
failures are committed here, in a room with no model in it.`
  },
  {
    id: "r2",
    n: 2,
    title: "Sprint 2 — Interpretability vs. Explainability",
    subtitle: "Weeks 5–10 · Model class selection",
    concepts: ["Intrinsic interpretability", "Post-hoc explainability", "Glass-box models", "Performance trade-offs"],
    intro: `The modeling team has three candidate architectures on the wall and a
VP who keeps using "interpretable" and "explainable" as synonyms. What you
choose here determines whether every downstream explanation is a description of
the model or a story about the model.`
  },
  {
    id: "r3",
    n: 3,
    title: "Sprint 3 — The Explanation Toolbox",
    subtitle: "Weeks 11–16 · SHAP, LIME, Anchors, Counterfactuals",
    concepts: ["SHAP", "LIME", "Anchors", "Counterfactual explanations", "Algorithmic recourse", "Fidelity & stability"],
    intro: `Three different audiences want three different explanations of the
same decision: a declined patient, a regulator, and your own risk analyst. They
are not the same question, and they do not have the same answer. Pick your
instruments.`
  },
  {
    id: "r4",
    n: 4,
    title: "Sprint 4 — Fairness Under Pressure",
    subtitle: "Weeks 17–22 · Metrics, impossibility, mitigation",
    concepts: ["Demographic parity", "Equal opportunity", "Equalized odds", "Calibration", "Impossibility theorem", "Intersectionality"],
    intro: `The fairness audit is back. CARENOW-4 approves 71% of one demographic
group and 54% of another. Your CEO wants a single number that says "we are
fair." There isn't one — and explaining why is now your job.`
  },
  {
    id: "r5",
    n: 5,
    title: "Sprint 5 — Ship It and Keep It Alive",
    subtitle: "Weeks 23–26 · MLOps, AIOps, incidents",
    concepts: ["Shadow deployment", "Canary release", "Drift (PSI)", "Fairness monitoring", "Incident response", "Feedback loops"],
    intro: `Launch week. A model that is fair in a notebook and unmonitored in
production is not a fair model — it is a fair model's obituary. Everything from
here is operations.`
  },
  {
    id: "r6",
    n: 6,
    title: "Sprint 6 — Governance and the Crisis",
    subtitle: "Month 7 · Board, regulator, press",
    concepts: ["Model cards", "EU AI Act Annex IV", "NIST AI RMF", "Three lines of defense", "Human oversight", "LLM risk"],
    intro: `A reporter has the numbers. A state Attorney General has questions.
Your board wants to know who, exactly, is accountable. Governance is not the
paperwork you do after the model — it is the reason anyone should believe the
model.`
  },
  {
    id: "r7",
    n: 7,
    title: "Lightning Round — The Explainability Clinic",
    subtitle: "Rapid fire · Match the method to the need",
    concepts: ["Method selection"],
    intro: `Six colleagues, six questions, sixty seconds each. Pick the right
tool for each job. No partial credit, no meter effects — pure knowledge.`
  }
];

/* ------------------------------------------------------------------ */
/* Decisions                                                           */
/* core: true  -> included in Quick Play (≈12 decisions)               */
/* ------------------------------------------------------------------ */

VHC.decisions = [

  /* ======================= ROUND 1 ======================= */
  {
    id: "d1.1", round: "r1", core: true,
    title: "What are we actually predicting?",
    tag: "Problem framing",
    scenario: `The ML lead proposes the target variable for CARENOW-4. VHC's
historical data has several candidate labels, and the one you pick becomes the
definition of "risk" for 2.4 million people a year.

"Honestly," she says, "let's just use what correlates best with revenue."`,
    concept: `Construct validity: the thing you can measure is rarely the thing
you care about. The gap between your <em>target variable</em> and the
<em>real-world construct</em> is where a surprising share of algorithmic harm
originates (see Obermeyer et al. 2019, where healthcare cost was used as a
proxy for healthcare need).`,
    options: [
      {
        id: "a", label: "Predict 'contacted by collections within 18 months'",
        detail: "Plentiful, clean, well-populated label. Operationally convenient.",
        scores: { rigor: -2, fairness: -3, ethics: -2, governance: -1, ops: 1 },
        effects: { trust: -5, compliance: -8, performance: 3, budget: 0 },
        note: `This is a <b>proxy for a proxy</b>. Collections contact reflects
VHC's own past collection policy — which groups were pursued aggressively, which
were quietly written off. You will train the model to reproduce the
discretionary behavior of the collections department, then call it "risk."`
      },
      {
        id: "b", label: "Predict expected profitability per applicant",
        detail: "Directly optimizes the business objective the CFO cares about.",
        scores: { rigor: -1, fairness: -2, ethics: -3, governance: -2, ops: 1 },
        effects: { trust: -8, compliance: -10, performance: 8, budget: 3 },
        note: `Profit-maximizing underwriting on a medically vulnerable
population invites exactly the harm regulators look for: it rewards lending the
<i>most</i> to people who will pay the most interest — i.e. those who struggle
to repay. It also mixes pricing objectives into an eligibility decision, which
makes your adverse action notices nearly impossible to write honestly.`
      },
      {
        id: "c", label: "Predict 90 days past due (90-DPD) within 24 months, as-is",
        detail: "Industry-standard credit default definition. Defensible, conventional.",
        scores: { rigor: 2, fairness: 0, ethics: 1, governance: 1, ops: 2 },
        effects: { trust: 2, compliance: 4, performance: 4, budget: -2 },
        note: `A solid, defensible default. 90 days past due is the conventional credit
construct and it will survive a regulatory conversation. What it does not do is
interrogate whether the historical label itself is contaminated — a good choice
that stops one step short of a great one.`
      },
      {
        id: "d", label: "90 days past due within 24 months, plus a documented label audit",
        detail: "Same target, but first audit the label for policy contamination, servicing differences, and missingness by segment. Bring in two clinicians and a patient advocate to review the definition.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 1 },
        effects: { trust: 8, compliance: 10, performance: 0, budget: -8 },
        note: `Best answer. You keep the defensible construct <i>and</i> you
check whether the historical label encodes past policy rather than borrower
behavior. Documenting who participated in defining the target is also the
cheapest governance artifact you will ever produce — and the EU AI Act expects
exactly this kind of record.`
      }
    ]
  },

  {
    id: "d1.2", round: "r1", core: true,
    title: "Do we collect race and gender?",
    tag: "Fairness through unawareness",
    scenario: `Legal is nervous. "If we never collect race, we can't discriminate
on it, and we can't be accused of it either."

Your fairness lead disagrees, loudly. The compliance officer points out that
in US mortgage lending, collecting demographics is mandatory; in medical
lending it is optional; in the EU, special-category data has its own rules.`,
    concept: `<b>Fairness through unawareness</b> — excluding protected
attributes from the feature set — is the single most common fairness mistake in
industry. It does not remove bias (proxies carry it) and it destroys your ability
to <i>measure</i> bias. You generally need protected attributes for
<i>measurement</i> even when you must not use them for <i>prediction</i>.`,
    options: [
      {
        id: "a", label: "Don't collect it at all — unawareness is the safest legal posture",
        detail: "No protected attributes anywhere in the pipeline.",
        scores: { rigor: -2, fairness: -3, ethics: -1, governance: -2, ops: 0 },
        effects: { trust: -4, compliance: -10, performance: 0, budget: 4 },
        note: `You have just made bias undetectable, not absent. ZIP code,
employer, device type and procedure type will carry protected information into
the model anyway. When the AG asks for your disparity numbers, "we don't collect
that" is not a defense — it is an admission that you never looked.`
      },
      {
        id: "b", label: "Use race and gender directly as model features",
        detail: "If they're predictive, use them. Maximum accuracy.",
        scores: { rigor: -1, fairness: -3, ethics: -3, governance: -3, ops: 0 },
        effects: { trust: -15, compliance: -25, performance: 5, budget: 0 },
        note: `This is <b>disparate treatment</b> — per-se illegal in US credit
under the Equal Credit Opportunity Act (ECOA), and prohibited processing under
Article 9 of the EU General Data Protection Regulation (GDPR) without a lawful basis.
Not a trade-off; a violation.`
      },
      {
        id: "c", label: "Collect for measurement only, in a firewalled fairness datastore",
        detail: "Protected attributes are collected with consent, stored separately with strict access control, never available to the training pipeline, used solely for disparity testing and audit.",
        scores: { rigor: 3, fairness: 3, ethics: 2, governance: 3, ops: 2 },
        effects: { trust: 6, compliance: 15, performance: 0, budget: -6 },
        note: `Best answer. This is the standard responsible-AI pattern: separate
the <i>measurement</i> plane from the <i>decision</i> plane. Document the lawful
basis, the consent language, the access controls, and the retention period — and
you now have the ability to answer "is this fair?" with evidence.`
      },
      {
        id: "d", label: "Buy inferred ethnicity from a data broker (Bayesian Improved Surname Geocoding)",
        detail: "Cheaper than asking. Industry vendors do this all the time.",
        scores: { rigor: 0, fairness: 0, ethics: -2, governance: -2, ops: 0 },
        effects: { trust: -8, compliance: -5, performance: 0, budget: -3 },
        note: `Proxy methods like BISG — Bayesian Improved Surname Geocoding, which infers
race from surname and location — are legitimate <i>audit</i> tools when
self-reported data is genuinely unavailable — regulators use them. But buying
inferred ethnicity without consent when you could simply ask is an ethics and
privacy problem, and BISG's error rates are badly uneven across groups, which
biases the very disparity estimates you are trying to produce.`
      }
    ]
  },

  {
    id: "d1.3", round: "r1", core: false,
    title: "The ZIP code question",
    tag: "Proxy variables",
    scenario: `Feature engineering has produced 340 candidate features. Three of
the top ten by information value are: <b>5-digit ZIP</b>, <b>hospital network
ID</b>, and <b>type of device used to apply</b> (an Android phone on a clinic
network predicts default better than income does).

"It's not race," says the modeler. "It's geography."`,
    concept: `A <b>proxy variable</b> is a legitimate-looking feature that
encodes a protected attribute. Redlining was done with maps, not with race
fields. Testing for proxies means asking: <i>how well can I predict the
protected attribute from this feature?</i> and <i>is there a causal story for
why this should predict repayment?</i>`,
    options: [
      {
        id: "a", label: "Keep everything — the model decides what matters",
        detail: "Let regularization sort it out.",
        scores: { rigor: -2, fairness: -3, ethics: -2, governance: -2, ops: 0 },
        effects: { trust: -6, compliance: -12, performance: 6, budget: 0 },
        note: `Digital redlining. 5-digit ZIP in the US is close to a race
variable in many metros; device type is close to an income variable. "The model
decided" is not a legal defense — you chose the feature set.`
      },
      {
        id: "b", label: "Drop ZIP and device type; keep everything else",
        detail: "Remove the obviously dangerous ones and move on.",
        scores: { rigor: 1, fairness: 1, ethics: 1, governance: 0, ops: 1 },
        effects: { trust: 2, compliance: 3, performance: -2, budget: 0 },
        note: `Better, but unprincipled. You removed two features you happened to
notice; you did not establish a <i>method</i> for finding the next one. Hospital
network ID is still in there, and it is highly correlated with payer mix and
therefore with race and income.`
      },
      {
        id: "c", label: "Run a proxy audit: predict each protected attribute from each feature, require a causal justification for every retained feature",
        detail: "Train a probe model for each protected attribute. Any feature the probe can predict above an agreed accuracy threshold (measured as AUC, the area under the ROC curve) goes to a review panel that must articulate why it causes repayment behavior, not merely correlates.",
        scores: { rigor: 3, fairness: 3, ethics: 2, governance: 3, ops: 2 },
        effects: { trust: 6, compliance: 12, performance: -3, budget: -8 },
        note: `Best answer. This converts an ad-hoc judgement into a repeatable,
auditable control with a documented threshold. It is also the thing you can hand
a regulator: "here is our proxy test, here is the threshold, here is the review
record for each retained feature."`
      },
      {
        id: "d", label: "Replace ZIP with a published Area Deprivation Index (ADI)",
        detail: "Use a transparent, externally maintained socioeconomic index instead of raw geography.",
        scores: { rigor: 2, fairness: 1, ethics: 1, governance: 2, ops: 1 },
        effects: { trust: 3, compliance: 4, performance: -2, budget: -3 },
        note: `A thoughtful, partially-correct move: an area deprivation index is transparent and
interpretable, which beats a 5-digit ZIP dummy. But deprivation indices are
themselves strongly correlated with race, so you have made the proxy
<i>visible</i>, not harmless. Good — if paired with a proxy audit.`
      }
    ]
  },

  /* ======================= ROUND 2 ======================= */
  {
    id: "d2.1", round: "r2", core: true,
    title: "Choose the model class",
    tag: "Interpretability vs explainability",
    scenario: `Four candidates are on the whiteboard. Every declined applicant
must receive a specific and accurate principal reason for the decline. The EU
subsidiary must produce technical documentation and enable human oversight.

<div class="mini-table">
<table>
<tr><th>Candidate</th><th>Test AUC <span class="th-note">(area under the ROC curve — ranking quality; 0.5 = coin flip)</span></th></tr>
<tr><td>Logistic-regression scorecard (weight-of-evidence binned)</td><td>0.741</td></tr>
<tr><td>Monotone-constrained explainable boosting machine, EBM (glass box)</td><td>0.768</td></tr>
<tr><td>XGBoost, 1,400 trees, + TreeSHAP</td><td>0.779</td></tr>
<tr><td>Deep tabular transformer + post-hoc SHAP</td><td>0.786</td></tr>
</table></div>`,
    concept: `<b>Interpretability</b> is a property of the model: you can read
the mechanism itself (a scorecard, a shallow tree, a generalized additive model). <b>Explainability</b>
is a property of an added layer: a separate method that approximates or
attributes the behavior of a model you cannot read. Interpretability is
<i>faithful by construction</i>; explainability is <i>faithful only to the
degree the approximation holds</i>.`,
    options: [
      {
        id: "a", label: "Deep tabular transformer + SHAP",
        detail: "Highest AUC. SHAP gives us explanations anyway.",
        scores: { rigor: -2, fairness: -1, ethics: -1, governance: -2, ops: -1 },
        effects: { trust: -5, compliance: -10, performance: 8, budget: -5 },
        note: `+0.018 AUC over a glass box, bought with: unfaithful post-hoc
explanations, a harder EU AI Act documentation burden, expensive SHAP at
inference time, and no ability to reason about the mechanism during an incident.
On tabular credit data this is almost never the right trade.`
      },
      {
        id: "b", label: "XGBoost + TreeSHAP",
        detail: "Strong performance; TreeSHAP — the exact SHAP algorithm for tree ensembles — is fast and deterministic.",
        scores: { rigor: 1, fairness: 1, ethics: 0, governance: 1, ops: 1 },
        effects: { trust: 1, compliance: 0, performance: 6, budget: -2 },
        note: `A defensible industry answer. TreeSHAP is exact and fast for tree
ensembles, which removes the sampling-instability objection. You still have a
model whose mechanism no human can read, and Shapley attributions are not the
same thing as the model's reasoning — but this is a real, common, workable
choice.`
      },
      {
        id: "c", label: "Monotone-constrained explainable boosting machine (glass box)",
        detail: "Within 0.018 AUC of the best model, and every shape function is directly readable and plottable. Monotonic constraints encode domain knowledge (more income never hurts you).",
        scores: { rigor: 3, fairness: 2, ethics: 2, governance: 3, ops: 3 },
        effects: { trust: 10, compliance: 12, performance: 3, budget: -3 },
        note: `Best answer. When an intrinsically interpretable model is within a
rounding error of the black box — which, on tabular credit data, it almost
always is — choosing interpretability is not a sacrifice, it is free risk
reduction. Monotonic constraints additionally make the model <i>defensible</i>:
you can prove no applicant is penalized for earning more.`
      },
      {
        id: "d", label: "Logistic-regression scorecard",
        detail: "Maximum transparency, the traditional credit answer, 0.045 AUC behind.",
        scores: { rigor: 1, fairness: 1, ethics: 1, governance: 3, ops: 2 },
        effects: { trust: 6, compliance: 8, performance: -6, budget: 2 },
        note: `Safe and transparent, but you are leaving real predictive accuracy
on the table for no additional interpretability benefit over an EBM. Lower
accuracy is not ethically neutral: it means declining people who would have
repaid.`
      }
    ]
  },

  {
    id: "d2.2", round: "r2", core: true,
    title: "\"We'll make it interpretable by adding SHAP\"",
    tag: "Concept check",
    scenario: `In the steering committee, the VP of Product says: <i>"I don't see
the issue. We'll use the deep model and make it interpretable by adding SHAP.
Same outcome, better accuracy."</i>

Eleven people are watching you. What do you say?`,
    concept: `This is the central conceptual distinction of the course. Adding a
post-hoc explainer to an opaque model gives you <b>explainability</b>, not
<b>interpretability</b>. The explanation is a second model of the first model,
and the gap between them is where liability lives.`,
    options: [
      {
        id: "a", label: "\"Agreed — SHAP makes any model interpretable.\"",
        detail: "Keep the peace, keep the accuracy.",
        scores: { rigor: -3, fairness: -1, ethics: -1, governance: -2, ops: 0 },
        effects: { trust: -4, compliance: -8, performance: 4, budget: 0 },
        note: `Conceptually wrong and organizationally expensive: you just taught
eleven decision-makers a falsehood they will repeat for years.`
      },
      {
        id: "b", label: "\"SHAP gives us explainability, not interpretability. It's a post-hoc approximation of a mechanism we still can't read — and under Reg B our reason codes must be accurate, not approximate.\"",
        detail: "Name the distinction, tie it to the legal requirement, offer the glass-box alternative.",
        scores: { rigor: 3, fairness: 1, ethics: 2, governance: 3, ops: 1 },
        effects: { trust: 8, compliance: 10, performance: 0, budget: 0 },
        note: `Best answer. Interpretability is intrinsic and faithful by
construction; explainability is an added approximation layer. Anchoring the
distinction to a concrete obligation (accurate adverse-action reasons) turns a
philosophy argument into a risk argument, which is what wins in a steering
committee.`
      },
      {
        id: "c", label: "\"Explanations are always approximations anyway, so it doesn't matter which model we use.\"",
        detail: "Epistemic humility as an argument-ender.",
        scores: { rigor: -2, fairness: 0, ethics: -1, governance: -1, ops: 0 },
        effects: { trust: -2, compliance: -4, performance: 0, budget: 0 },
        note: `A nihilism that flattens a real and important gradient. A GAM's
shape function <i>is</i> the model; a SHAP value <i>approximates</i> a model.
Those are not equally approximate.`
      },
      {
        id: "d", label: "\"Let's measure it: run both, and report explanation fidelity and stability for the deep model before we decide.\"",
        detail: "Convert the disagreement into an experiment with a pre-registered acceptance threshold.",
        scores: { rigor: 2, fairness: 1, ethics: 1, governance: 2, ops: 2 },
        effects: { trust: 4, compliance: 5, performance: 1, budget: -4 },
        note: `Strong and grown-up — evidence beats assertion, and a fidelity
threshold agreed in advance is a genuine governance control. Slightly weaker
than (b) only because it defers the conceptual correction that the room
needs today.`
      }
    ]
  },

  {
    id: "d2.3", round: "r2", core: false,
    title: "The 1.8-point question",
    tag: "Performance trade-off",
    scenario: `The CFO runs the numbers: the deep model's extra 0.018 AUC is worth
roughly <b>$14M of annual loss reduction</b>. The glass box costs that money.

"Fourteen million dollars," she says, "to make a chart easier to read."`,
    concept: `Interpretability trades are rarely "accuracy vs. ethics" — they are
usually "accuracy vs. accuracy-under-audit-and-incident." A model you cannot
diagnose degrades faster and fails more expensively.`,
    options: [
      {
        id: "a", label: "Take the $14M. Ship the deep model.",
        detail: "Fiduciary duty is real.",
        scores: { rigor: -1, fairness: -1, ethics: -2, governance: -2, ops: -1 },
        effects: { trust: -6, compliance: -10, performance: 10, budget: 8 },
        note: `You bought $14M of modeled benefit with unmodeled regulatory,
incident and reputational cost. Note that the $14M is itself a point estimate
from a backtest with no confidence interval attached.`
      },
      {
        id: "b", label: "Refuse. Interpretability is non-negotiable for a high-risk system.",
        detail: "Draw the line and hold it.",
        scores: { rigor: 0, fairness: 1, ethics: 2, governance: 1, ops: 0 },
        effects: { trust: 4, compliance: 5, performance: -4, budget: 0 },
        note: `Ethically clean but strategically brittle. A principle you cannot
cost out gets overridden the moment you leave the company. You also didn't test
whether the $14M number survives scrutiny.`
      },
      {
        id: "c", label: "Glass box decides; deep model runs as a shadow challenger, with the gap monitored and reported to the board quarterly",
        detail: "The EBM makes every live decision. The transformer scores every application in parallel without acting. Where they disagree materially, the cases are sampled and reviewed — those disagreements become the research agenda for CARENOW-5.",
        scores: { rigor: 3, fairness: 2, ethics: 2, governance: 3, ops: 3 },
        effects: { trust: 8, compliance: 10, performance: 4, budget: -6 },
        note: `Best answer. Champion–challenger converts an unresolvable argument
into a measurement program: you keep the auditable model in production, you keep
the option value of the stronger model, and you learn exactly where the
interpretable model actually loses money. Most of the time the real gap in
production is far smaller than the backtest gap.`
      },
      {
        id: "d", label: "Ask for the confidence interval on the $14M, and for the loss estimate under a drift or incident scenario",
        detail: "Interrogate the number before trading against it.",
        scores: { rigor: 3, fairness: 1, ethics: 1, governance: 2, ops: 2 },
        effects: { trust: 3, compliance: 4, performance: 0, budget: -1 },
        note: `Excellent instinct — a single-point backtest estimate is not a
business case, and the comparison ignores the cost of an incident you cannot
diagnose. Pair this with (c) and you have the complete answer.`
      }
    ]
  },

  /* ======================= ROUND 3 ======================= */
  {
    id: "d3.1", round: "r3", core: true,
    title: "Adverse action notices at scale",
    tag: "SHAP / LIME / Counterfactuals",
    scenario: `912,000 people were declined last year. Each must receive a notice
stating the <b>principal reasons</b> for the decline. Today VHC sends: <i>"Your
application did not meet our credit criteria."</i> Compliance says that is
indefensible.

You must pick the engine behind the new notice.`,
    concept: `Different XAI methods answer different questions.
<b>SHAP</b> (SHapley Additive exPlanations): how much did each feature contribute to <i>this</i> prediction,
relative to a baseline? (additive attribution, game-theoretic, consistent)
<b>LIME</b> (Local Interpretable Model-agnostic Explanations): what local linear surrogate approximates the model near this point?
(fast, intuitive, sampling-dependent, unstable)
<b>Counterfactual</b>: what is the smallest change that would flip the outcome?
(actionable — this is <i>recourse</i>)`,
    options: [
      {
        id: "a", label: "LIME on every declined application",
        detail: "Fast, well-known, intuitive local explanations.",
        scores: { rigor: -1, fairness: 0, ethics: 0, governance: -1, ops: -1 },
        effects: { trust: 0, compliance: -6, performance: 0, budget: -3 },
        note: `LIME's perturbation sampling makes it <b>unstable</b>: two runs on
the same applicant can yield different top features. A legally binding notice
that changes when you re-run it is a compliance incident waiting to be
discovered. LIME is a good <i>exploration</i> tool, a poor <i>notice</i> engine.`
      },
      {
        id: "b", label: "TreeSHAP local values mapped to a fixed library of reason codes",
        detail: "Exact Shapley values for the tree model, deterministic, mapped through a reviewed reason-code dictionary.",
        scores: { rigor: 2, fairness: 1, ethics: 1, governance: 2, ops: 2 },
        effects: { trust: 4, compliance: 8, performance: 0, budget: -4 },
        note: `Strong. Deterministic, auditable, and the reason-code mapping is
reviewable. The limitation: a SHAP value tells the applicant what
<i>contributed</i>, not what to <i>do</i>. "Your credit utilization contributed
−0.31 to your score" is accurate and useless.`
      },
      {
        id: "c", label: "SHAP reason codes for the 'why', plus an actionable counterfactual for the 'what now'",
        detail: "The notice states the principal reasons (SHAP → reason codes, deterministic and auditable) AND a nearest actionable counterfactual: 'If your reported monthly income had been $310 higher, or your existing revolving balance $1,400 lower, this application would have been approved.'",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },
        effects: { trust: 12, compliance: 12, performance: 0, budget: -8 },
        note: `Best answer. This is the attribution/recourse pairing: SHAP
satisfies the legal duty to state principal reasons; the counterfactual
satisfies the <i>ethical</i> duty to give the person a path forward. Recourse is
what turns an explanation from a disclosure into a form of respect for autonomy.`
      },
      {
        id: "d", label: "Anchors — give each applicant the IF-THEN rule that governed their case",
        detail: "High-precision rule extraction per applicant.",
        scores: { rigor: 0, fairness: 0, ethics: 0, governance: 0, ops: -1 },
        effects: { trust: 0, compliance: -2, performance: 0, budget: -5 },
        note: `Anchors are excellent for auditing and for describing model
behavior over a <i>region</i>, but as consumer-facing notices they are
expensive to compute, frequently produce rules with very low coverage, and read
like a legal trap: "IF utilization > 0.62 AND tenure < 14 months THEN decline"
tells the applicant they were caught by a rule, not what to do about it.`
      }
    ]
  },

  {
    id: "d3.2", round: "r3", core: true,
    title: "The regulator's question",
    tag: "Anchors",
    scenario: `A state examiner writes:

<blockquote>"For applicants aged 62 and over applying for hearing-implant
financing, please describe the <b>specific decision rule</b> the model applies.
We are not asking for average feature importance across your portfolio. We want
to know: in this segment, what conditions are sufficient for a decline, and how
often does that rule hold?"</blockquote>`,
    concept: `<b>Anchors</b> (Ribeiro et al. 2018) produce high-precision IF-THEN
rules: "IF these conditions hold, the model predicts X with ≥95% precision,"
along with a <b>coverage</b> figure (how much of the input space the rule
applies to). Anchors answer "what rule governs this region?" — which is exactly
a regulator's question, and exactly what a global SHAP summary plot cannot say.`,
    options: [
      {
        id: "a", label: "Send the global SHAP summary plot for the whole portfolio",
        detail: "It's the standard artifact everyone sends.",
        scores: { rigor: -2, fairness: 0, ethics: 0, governance: -2, ops: 0 },
        effects: { trust: -2, compliance: -8, performance: 0, budget: 0 },
        note: `The examiner explicitly excluded this. A global mean-|SHAP| plot
describes the average behavior of the whole portfolio and says nothing about the
rule governing one segment. Sending it reads as either evasion or
incomprehension.`
      },
      {
        id: "b", label: "Compute Anchors on the segment and report the rules with precision and coverage",
        detail: "Fit anchors restricted to the 62+ hearing-implant cohort; report each rule, its precision, and the share of segment decisions it covers; flag any rule where an age-correlated feature appears.",
        scores: { rigor: 3, fairness: 3, ethics: 2, governance: 3, ops: 2 },
        effects: { trust: 6, compliance: 15, performance: 0, budget: -6 },
        note: `Best answer. Anchors are the right instrument for "what rule
applies in this region," and reporting precision <i>and</i> coverage is what
makes the answer honest — a 99%-precision rule covering 2% of the segment is a
very different claim from one covering 60%. Proactively flagging age-correlated
features converts a defensive reply into a credibility-building one.`
      },
      {
        id: "c", label: "Send 50 individual LIME explanations from the segment",
        detail: "Concrete, case-level, lots of detail.",
        scores: { rigor: 0, fairness: 0, ethics: 0, governance: 0, ops: 0 },
        effects: { trust: 0, compliance: -2, performance: 0, budget: -3 },
        note: `Fifty local linear surrogates are fifty anecdotes. They neither
generalize to a rule nor come with a precision guarantee, and their instability
means the examiner can regenerate them and get different answers.`
      },
      {
        id: "d", label: "Extract a surrogate decision tree for the segment and send that",
        detail: "A global surrogate is readable and gives rule-like structure.",
        scores: { rigor: 1, fairness: 1, ethics: 1, governance: 1, ops: 1 },
        effects: { trust: 2, compliance: 3, performance: 0, budget: -3 },
        note: `Reasonable and readable, and better than (a) or (c). But a
surrogate tree's fidelity is global-average and unreported per-branch — you must
disclose the surrogate's fidelity, or you are describing a different model than
the one that declined these people. Anchors come with a per-rule precision
guarantee, which is why they are the stronger answer here.`
      }
    ]
  },

  {
    id: "d3.3", round: "r3", core: false,
    title: "The explanation that changed its mind",
    tag: "Stability & fidelity",
    scenario: `An analyst reruns LIME on applicant #88213 for a QA check.

<div class="mini-table"><table>
<tr><th>Run</th><th>Top reason</th><th>Second reason</th></tr>
<tr><td>Monday 10:04</td><td>Credit utilization</td><td>Employment tenure</td></tr>
<tr><td>Monday 10:07</td><td>Number of recent inquiries</td><td>Credit utilization</td></tr>
</table></div>

The applicant's notice has already been mailed. It cites employment tenure.`,
    concept: `Two properties to distinguish: <b>fidelity</b> (does the explanation
match the underlying model's behavior?) and <b>stability</b> (does it match
itself across runs?). LIME's perturbation sampling makes it vulnerable on both.
An unstable explanation is a scientific problem <i>and</i>, once mailed, a
compliance problem.`,
    options: [
      {
        id: "a", label: "It's within noise. Don't mention it.",
        detail: "Nobody reruns explanations.",
        scores: { rigor: -3, fairness: -1, ethics: -3, governance: -3, ops: -1 },
        effects: { trust: -6, compliance: -15, performance: 0, budget: 0 },
        note: `Concealment of a known defect in a legally mandated disclosure.
This is the single fastest route from "model problem" to "personal liability."`
      },
      {
        id: "b", label: "Fix the seed so it's reproducible",
        detail: "Determinism solves the audit problem.",
        scores: { rigor: -1, fairness: 0, ethics: -1, governance: -1, ops: 1 },
        effects: { trust: 0, compliance: -5, performance: 0, budget: 0 },
        note: `You made the instability <i>invisible</i>, not absent. A fixed
seed produces the same arbitrary answer every time. The underlying issue — that
the local surrogate is not identified by the data — is untouched.`
      },
      {
        id: "c", label: "Switch the notice engine to TreeSHAP; keep LIME for exploration only; log a compliance issue and review affected notices",
        detail: "Exact, deterministic attributions for anything legally binding. Raise the mailed-notice discrepancy through the incident process and sample affected cases.",
        scores: { rigor: 3, fairness: 2, ethics: 3, governance: 3, ops: 3 },
        effects: { trust: 5, compliance: 12, performance: 0, budget: -7 },
        note: `Best answer. TreeSHAP is exact for tree ensembles, so the
instability disappears for real rather than being hidden. Equally important: you
self-reported. Regulators penalize concealment far more harshly than defects.`
      },
      {
        id: "d", label: "Increase LIME's sample size and publish a stability metric (top-k Jaccard across reruns) as a monitored SLO",
        detail: "Keep LIME, but quantify and monitor its instability.",
        scores: { rigor: 2, fairness: 1, ethics: 2, governance: 2, ops: 3 },
        effects: { trust: 3, compliance: 6, performance: 0, budget: -5 },
        note: `Genuinely good engineering — measuring explanation stability as an
SLO is a practice too few teams have. It is second-best only because for a tree
model an exact method already exists; you are paying compute to stabilize an
approximation you didn't need.`
      }
    ]
  },

  {
    id: "d3.4", round: "r3", core: true,
    title: "Counterfactuals that insult people",
    tag: "Algorithmic recourse",
    scenario: `The counterfactual generator ships. QA pulls its first ten
outputs:

<div class="cf-list">
<div>"If you were <b>11 years younger</b>, you would be approved."</div>
<div>"If you were <b>married</b>, you would be approved."</div>
<div>"If your <b>diagnosis code</b> were not E66.01, you would be approved."</div>
<div>"If your income were <b>$41,000 higher</b>, you would be approved."</div>
</div>

All four are mathematically valid nearest counterfactuals.`,
    concept: `A counterfactual is only useful if it is <b>actionable</b>. The
literature (Wachter et al.; Ustun et al. on actionable recourse; Mothilal et al.
on DiCE — Diverse Counterfactual Explanations) constrains generation by <b>mutability</b> (can the person change it?),
<b>plausibility</b> (is the counterfactual point on the data manifold?),
<b>sparsity</b> (few changes), and <b>cost</b> (effort-weighted distance).`,
    options: [
      {
        id: "a", label: "Ship them — they're mathematically correct",
        detail: "Accuracy over tact.",
        scores: { rigor: -2, fairness: -2, ethics: -3, governance: -3, ops: 0 },
        effects: { trust: -20, compliance: -18, performance: 0, budget: 0 },
        note: `"Be younger" and "be married" are immutable/protected attributes —
mailing them is a self-authored discrimination exhibit. The diagnosis-code
counterfactual additionally discloses that a health condition drove a credit
decision.`
      },
      {
        id: "b", label: "Suppress any counterfactual mentioning a protected attribute; send the rest",
        detail: "Filter the output; keep the pipeline.",
        scores: { rigor: 0, fairness: -1, ethics: 0, governance: 0, ops: 1 },
        effects: { trust: -2, compliance: -4, performance: 0, budget: -2 },
        note: `You suppressed the <i>symptom</i>. If age and marital status are
generating the nearest counterfactuals, they are <i>driving the decisions</i> —
filtering the notice hides a finding you urgently needed to act on. The $41,000
counterfactual also still goes out, and it is cruel.`
      },
      {
        id: "c", label: "Constrain the generator: mutable features only, plausibility-bounded, sparse, effort-weighted — and escalate the protected-attribute finding as a fairness incident",
        detail: "Only actionable features may vary; counterfactuals must stay on the data manifold; prefer ≤2 changes; weight by realistic effort. Separately, the fact that immutable attributes produced nearest counterfactuals becomes a bias investigation.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },
        effects: { trust: 12, compliance: 12, performance: 0, budget: -9 },
        note: `Best answer. You fix the recourse mechanism <i>and</i> treat the
bad counterfactuals as the diagnostic signal they are. Note the second half —
most teams only do the first, and lose the most valuable fairness finding they
will get all year.`
      },
      {
        id: "d", label: "Drop counterfactuals; send SHAP reason codes only",
        detail: "Avoid the problem entirely.",
        scores: { rigor: 0, fairness: 0, ethics: -1, governance: 0, ops: 1 },
        effects: { trust: -4, compliance: 0, performance: 0, budget: 4 },
        note: `Legally survivable, ethically thinner. You had a mechanism for
giving 912,000 people a path forward and you retired it because the first
version was badly constrained.`
      }
    ]
  },

  /* ======================= ROUND 4 ======================= */
  {
    id: "d4.1", round: "r4", core: true,
    title: "Pick the fairness metric",
    tag: "Fairness metrics",
    scenario: `The audit lands. For Group A vs Group B on CARENOW-4:

<div class="mini-table"><table>
<tr><th>Quantity</th><th>Group A</th><th>Group B</th></tr>
<tr><td>Approval rate</td><td>71%</td><td>54%</td></tr>
<tr><td>True positive rate (qualified applicants approved)</td><td>88%</td><td>73%</td></tr>
<tr><td>False positive rate</td><td>19%</td><td>17%</td></tr>
<tr><td>Calibration (predicted probability of default vs realized)</td><td>well calibrated</td><td>well calibrated</td></tr>
<tr><td>Base rate of repayment</td><td>0.81</td><td>0.74</td></tr>
</table></div>

You must nominate the <b>primary</b> fairness metric for CARENOW-4 and justify
it in writing to the board.`,
    concept: `<b>Demographic parity</b>: equal approval rates. Ignores merit;
appropriate when the base-rate difference is itself suspect.
<b>Equal opportunity</b>: equal true positive rate (TPR) — among people who <i>would</i> repay, equal
chance of approval. The harm here is denying credit to someone who deserved it.
<b>Equalized odds</b>: equal TPR <i>and</i> equal false positive rate (FPR).
<b>Predictive parity / calibration</b>: a predicted 8% risk means 8% in both
groups.`,
    options: [
      {
        id: "a", label: "Demographic parity — equalize approval rates at 71%",
        detail: "The disparity the press will report is the approval gap.",
        scores: { rigor: 0, fairness: 1, ethics: 1, governance: 0, ops: 1 },
        effects: { trust: 6, compliance: 2, performance: -8, budget: -2 },
        note: `Defensible if you believe the base-rate gap (0.81 vs 0.74) is
itself a product of historical injustice — that is a real, arguable position.
But applied mechanically it approves applicants the model believes will default,
which in medical lending means saddling vulnerable patients with unpayable debt.
Optically strong, substantively contestable.`
      },
      {
        id: "b", label: "Equal opportunity (TPR parity) as primary, with calibration monitored as a secondary guardrail — rationale documented",
        detail: "The 88% vs 73% TPR gap means qualified Group B applicants are being denied credit they would have repaid. Target that gap; monitor calibration so you don't fix one harm by creating another; write down why.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },
        effects: { trust: 10, compliance: 12, performance: -3, budget: -5 },
        note: `Best answer. The relevant harm in lending is <i>denying credit to
someone who would have repaid</i>, which is precisely what TPR disparity
measures — and a 15-point gap is large. Naming a primary metric, naming the
guardrail, and documenting the reasoning is what a board and a regulator can
actually evaluate.`
      },
      {
        id: "c", label: "Calibration — the model is already well calibrated in both groups, so it's fair",
        detail: "Predictive parity holds. Declare victory.",
        scores: { rigor: -1, fairness: -2, ethics: -2, governance: -1, ops: 1 },
        effects: { trust: -6, compliance: -8, performance: 2, budget: 4 },
        note: `Calibration is a genuine fairness criterion, but choosing the one
metric you already pass and declaring the question closed is
<b>fairness-washing</b>. Calibration is compatible with enormous error-rate
disparities — which is exactly what the 88%/73% TPR gap shows.`
      },
      {
        id: "d", label: "Equalized odds — equalize both TPR and FPR",
        detail: "The stricter criterion; harder to game.",
        scores: { rigor: 2, fairness: 2, ethics: 2, governance: 2, ops: 1 },
        effects: { trust: 5, compliance: 6, performance: -6, budget: -4 },
        note: `A strong and rigorous choice. Here the FPR gap is already small
(19% vs 17%), so most of the work equalized odds does is the TPR work — you pay
extra accuracy for a constraint that is nearly non-binding. Right family,
slightly over-specified for this evidence.`
      }
    ]
  },

  {
    id: "d4.2", round: "r4", core: true,
    title: "\"Just satisfy all of them\"",
    tag: "Impossibility theorem",
    scenario: `The CEO reads your memo and replies:

<blockquote>"I don't want to choose. Make the model satisfy demographic parity
<b>and</b> equalized odds <b>and</b> calibration. I don't want to be the guy who
picked which kind of fairness we're going for."</blockquote>`,
    concept: `The <b>impossibility results</b> (Kleinberg–Mullainathan–Raghavan;
Chouldechova, 2016–17): when base rates differ across groups and the classifier
is imperfect, calibration and equalized odds cannot both hold, except in
degenerate cases. Fairness is not a box to tick — it is a <i>choice among
incompatible goods</i>, and the choice must be made by accountable humans, in
writing.`,
    options: [
      {
        id: "a", label: "\"Yes — we'll tune until all three pass.\"",
        detail: "Take the action item. Figure it out later.",
        scores: { rigor: -3, fairness: -2, ethics: -2, governance: -3, ops: -1 },
        effects: { trust: -4, compliance: -10, performance: 0, budget: -8 },
        note: `You have committed to something mathematically impossible. In six
weeks you will either report failure or quietly redefine a metric — and the
second is how fairness-washing begins.`
      },
      {
        id: "b", label: "\"That's provably impossible when base rates differ. Here are the three achievable frontiers and what each costs — the board must choose one and record why.\"",
        detail: "Explain the impossibility result, present the actual trade-off frontier with dollar and disparity numbers for each option, and escalate the decision to the accountable body.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },
        effects: { trust: 10, compliance: 15, performance: 0, budget: -4 },
        note: `Best answer. You did three things at once: corrected a technical
misconception, converted an abstract dilemma into a priced menu, and placed the
value judgement with the body that has the authority and the accountability to
make it. That written rationale is the most protective governance artifact VHC
will own.`
      },
      {
        id: "c", label: "\"Let's pick whichever metric makes our numbers look best.\"",
        detail: "Metric shopping, quietly.",
        scores: { rigor: -2, fairness: -3, ethics: -3, governance: -3, ops: 0 },
        effects: { trust: -8, compliance: -15, performance: 4, budget: 0 },
        note: `Textbook fairness-washing. It is also discoverable: an auditor who
sees you evaluated five metrics and reported one will ask for the other four.`
      },
      {
        id: "d", label: "\"Fairness is subjective, so any choice is as good as any other.\"",
        detail: "Relativism as a shield.",
        scores: { rigor: -2, fairness: -2, ethics: -2, governance: -2, ops: 0 },
        effects: { trust: -5, compliance: -6, performance: 0, budget: 0 },
        note: `The choice among metrics is value-laden, but the values are not
arbitrary: they follow from who is harmed, how badly, and how reversibly. "It's
all subjective" abandons the reasoning precisely where it is most needed.`
      }
    ]
  },

  {
    id: "d4.3", round: "r4", core: true,
    title: "Where in the pipeline do you fix it?",
    tag: "Bias mitigation",
    scenario: `The board picks equal opportunity. Now: <b>how</b>? Your team
offers four mitigation strategies. Legal is in the room and is specifically
worried about one of them.`,
    concept: `Three intervention points:
<b>Pre-processing</b> (reweighing, resampling, representation repair) — fix the
data. <b>In-processing</b> (fairness-constrained optimization, adversarial
debiasing) — fix the objective. <b>Post-processing</b> (group-specific
thresholds, reject-option classification) — fix the decision. Post-processing is
statistically efficient and, in US credit, legally hazardous: an explicit
per-race threshold is facially disparate treatment.`,
    options: [
      {
        id: "a", label: "Post-processing: lower the approval threshold for Group B until TPRs match",
        detail: "The most direct, most effective, cheapest intervention.",
        scores: { rigor: 1, fairness: 2, ethics: 0, governance: -3, ops: 2 },
        effects: { trust: 2, compliance: -18, performance: -2, budget: 4 },
        note: `Statistically the most efficient route to TPR parity, and in some
domains the right answer. In US consumer credit, applying a different threshold
by protected class is explicit disparate treatment under ECOA — the remedy
becomes the violation. Legal was right to worry.`
      },
      {
        id: "b", label: "Pre-processing: reweigh training data to correct historical under-approval, then retrain",
        detail: "Attack the label/sample bias at the source.",
        scores: { rigor: 2, fairness: 2, ethics: 2, governance: 2, ops: 2 },
        effects: { trust: 4, compliance: 6, performance: -2, budget: -4 },
        note: `Solid and legally clean — no protected attribute touches the
decision function. Reweighing is blunt, though: it can shift TPR without you
understanding <i>which</i> mechanism was distorting outcomes.`
      },
      {
        id: "c", label: "In-processing: train with an equal-opportunity constraint, plus a root-cause investigation of the TPR gap",
        detail: "Optimize accuracy subject to a TPR-parity constraint (no protected attribute at inference). In parallel, investigate why the gap exists — thin files? differential data quality? a proxy feature? — and fix the cause where you find one.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },
        effects: { trust: 8, compliance: 12, performance: -2, budget: -10 },
        note: `Best answer. The constraint is applied to the objective rather
than the decision rule, so there is no per-group treatment at inference. And the
root-cause work is what distinguishes bias <i>mitigation</i> from bias
<i>cosmetics</i>: if the gap comes from thin credit files, the durable fix is
alternative data, not a constraint term.`
      },
      {
        id: "d", label: "Do nothing to the model; fund a financial-counseling program for declined applicants instead",
        detail: "Address the harm downstream, socially rather than technically.",
        scores: { rigor: 0, fairness: 0, ethics: 1, governance: 0, ops: 1 },
        effects: { trust: 4, compliance: -6, performance: 2, budget: -8 },
        note: `A genuinely valuable complement and a poor substitute. It leaves
the disparity in the decision system fully intact — and a regulator will read
"we knew about the 15-point gap and funded a counseling program" as knowing
inaction.`
      }
    ]
  },

  {
    id: "d4.4", round: "r4", core: false,
    title: "The subgroup with 214 people in it",
    tag: "Intersectionality",
    scenario: `Group-level parity now holds. An intern runs the audit
intersectionally and finds that <b>women over 55 applying for fertility-adjacent
procedures</b> — n = 214 in the test set — have a TPR of 0.42.

The 95% confidence interval is wide: [0.29, 0.56]. "It's not significant," says
the modeler. "n is tiny."`,
    concept: `<b>Fairness gerrymandering</b>: a model can satisfy parity on every
marginal group while badly violating it on intersections. Small-n subgroups
create a real statistical problem — but "not statistically significant" and
"not happening" are different claims, and the burden of proof matters when the
downside is discrimination.`,
    options: [
      {
        id: "a", label: "Ignore it — not statistically significant",
        detail: "Don't chase noise.",
        scores: { rigor: -2, fairness: -3, ethics: -2, governance: -2, ops: 0 },
        effects: { trust: -4, compliance: -10, performance: 0, budget: 2 },
        note: `Absence of evidence is not evidence of absence, and here the
entire CI sits below the portfolio TPR of ~0.80. You have a low-power test, not
a clean result. "Not significant at n=214" is also an argument that conveniently
never resolves.`
      },
      {
        id: "b", label: "Gather more data on the subgroup, add it to the monitoring dashboard with a widened alert band, and manually review declines in this cohort until n supports a conclusion",
        detail: "Treat it as an open finding with an interim human control rather than a closed question.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 3 },
        effects: { trust: 6, compliance: 10, performance: -1, budget: -7 },
        note: `Best answer. You respect the statistics (don't over-claim at n=214)
<i>and</i> the ethics (don't let people absorb the cost of your uncertainty).
The interim human review is the key move — a control that operates while the
evidence accumulates.`
      },
      {
        id: "c", label: "Run the intersectional audit across all subgroup combinations and report every gap",
        detail: "Maximum thoroughness.",
        scores: { rigor: 1, fairness: 2, ethics: 1, governance: 1, ops: 0 },
        effects: { trust: 2, compliance: 2, performance: 0, budget: -10 },
        note: `Admirable, but with dozens of attributes you are running thousands
of tests and will find "disparities" everywhere by chance. Without
multiple-comparison correction or a pre-registered subgroup list, exhaustive
auditing manufactures noise and exhausts the team's credibility.`
      },
      {
        id: "d", label: "Drop procedure type from the model so the subgroup can't be targeted",
        detail: "Remove the feature that defines the cohort.",
        scores: { rigor: -1, fairness: -1, ethics: 0, governance: -1, ops: 0 },
        effects: { trust: -2, compliance: -4, performance: -4, budget: 0 },
        note: `Unawareness again, one level down. The cohort still exists, the
model will reconstruct procedure type from amount, provider and diagnosis, and
you have lost both accuracy and your ability to measure the disparity.`
      }
    ]
  },

  /* ======================= ROUND 5 ======================= */
  {
    id: "d5.1", round: "r5", core: true,
    title: "How do we roll out?",
    tag: "Deployment strategy",
    scenario: `CARENOW-4 is approved for release. 2,100 clinics. The VP of
Engineering wants to cut over Friday night — "the old model's infrastructure
contract expires Sunday."`,
    concept: `Responsible deployment is staged: <b>shadow mode</b> (new model
scores live traffic but takes no action — compare distributions and
disagreements), then <b>canary</b> (small real traffic slice with pre-agreed
guardrail metrics and an automated rollback trigger), then progressive rollout.
Guardrails must include fairness metrics, not just accuracy and latency.`,
    options: [
      {
        id: "a", label: "Full cutover Friday night",
        detail: "Contract deadline. The model tested fine.",
        scores: { rigor: -3, fairness: -1, ethics: -2, governance: -3, ops: -3 },
        effects: { trust: -8, compliance: -12, performance: -5, budget: 6 },
        note: `Big-bang deployment of a high-risk decision system, with no
reversal path, timed for when nobody is watching. Offline test performance tells
you almost nothing about live pipeline behavior.`
      },
      {
        id: "b", label: "Two weeks shadow, then 5% canary with fairness + accuracy + latency guardrails and automated rollback",
        detail: "Score live traffic without acting; compare score distributions, approval rates, and per-segment TPR against champion. Then 5% → 25% → 100%, with pre-agreed abort thresholds and a one-click rollback that is tested before launch.",
        scores: { rigor: 3, fairness: 3, ethics: 2, governance: 3, ops: 3 },
        effects: { trust: 8, compliance: 12, performance: 4, budget: -8 },
        note: `Best answer. Shadow mode catches pipeline and training/serving
skew problems with zero customer harm; the canary catches the rest at 5% blast
radius. Including <i>fairness</i> in the guardrail set — not just AUC and p99
latency — is what makes this a responsible-AI rollout rather than a normal one.`
      },
      {
        id: "c", label: "50/50 A/B test starting immediately",
        detail: "Fastest route to statistically meaningful comparison.",
        scores: { rigor: 1, fairness: -1, ethics: -1, governance: 0, ops: 1 },
        effects: { trust: -2, compliance: -4, performance: 2, budget: -3 },
        note: `Statistically efficient, ethically careless: half of a million
patients are randomized into an untested credit model without consent or an
ethics review of the experiment. A/B testing consequential decisions on
vulnerable populations needs the same scrutiny as a trial.`
      },
      {
        id: "d", label: "Extend the old infrastructure contract and take four more weeks of offline validation",
        detail: "Test more before touching production.",
        scores: { rigor: 0, fairness: 0, ethics: 1, governance: 1, ops: 0 },
        effects: { trust: 1, compliance: 2, performance: -2, budget: -10 },
        note: `Cautious, but more offline validation has sharply diminishing
returns — the failures you are worried about (skew, drift, upstream schema
changes) are only observable in production. Shadow mode <i>is</i> the safe way
to test in production.`
      }
    ]
  },

  {
    id: "d5.2", round: "r5", core: true,
    title: "What do we monitor?",
    tag: "MLOps / AIOps",
    scenario: `You have budget for one monitoring stack. The platform team asks
for a definitive list of what gets a dashboard, an alert, and an owner. Note
that repayment labels take <b>18–24 months</b> to mature — you cannot monitor
accuracy in anything close to real time.`,
    concept: `The label-latency problem is the defining constraint of credit
MLOps. When ground truth is two years away, you monitor <b>proxies</b>: input
drift (the population stability index, PSI, or Kullback–Leibler divergence per feature), prediction drift, segment-level approval rates,
explanation drift (are the top SHAP features changing?), data quality and schema
integrity, and per-segment fairness metrics — plus classic service-level objectives (SLOs).`,
    options: [
      {
        id: "a", label: "Model accuracy, reviewed quarterly",
        detail: "The classic model risk management cadence.",
        scores: { rigor: -2, fairness: -2, ethics: -1, governance: -1, ops: -3 },
        effects: { trust: -4, compliance: -8, performance: -4, budget: 6 },
        note: `Accuracy is unmeasurable for two years, so this dashboard will be
blank when you need it. Quarterly review of a system making 200,000 decisions a
month means a failure can run for 90 days before anyone looks.`
      },
      {
        id: "b", label: "Latency, uptime, throughput — the standard site reliability engineering (SRE) golden signals",
        detail: "The service is healthy; that's the platform team's job.",
        scores: { rigor: -1, fairness: -2, ethics: -1, governance: -1, ops: 0 },
        effects: { trust: -2, compliance: -6, performance: 0, budget: 4 },
        note: `A model can be 100% available, sub-100ms, and catastrophically
wrong. Infrastructure monitoring is necessary and nowhere near sufficient for an
ML system — this is the core difference between AIOps, which watches what the
model decides, and classic infrastructure operations, which watches whether the
service is up.`
      },
      {
        id: "c", label: "Full stack: feature PSI, prediction drift, per-segment approval rates and fairness metrics, explanation drift, data-quality/schema checks, SLOs — each with an owner and an alert threshold",
        detail: "Layered monitoring designed around label latency. Every alert has a named owner and a documented runbook. Fairness metrics are first-class alerts, not a quarterly report.",
        scores: { rigor: 3, fairness: 3, ethics: 2, governance: 3, ops: 3 },
        effects: { trust: 8, compliance: 15, performance: 4, budget: -12 },
        note: `Best answer. The critical insight is that <i>fairness drift is an
operational alert</i>, not an annual audit item. Explanation drift is the
underused one: if the top reason codes shift suddenly, something upstream
changed even if the score distribution looks stable.`
      },
      {
        id: "d", label: "Drift monitoring on the top 20 features only",
        detail: "Cover the features that matter, control the cost.",
        scores: { rigor: 1, fairness: 0, ethics: 0, governance: 0, ops: 1 },
        effects: { trust: 1, compliance: 2, performance: 1, budget: -3 },
        note: `A reasonable cost-constrained start and much better than (a) or
(b). But no fairness monitoring means the disparity you spent Sprint 4 fixing
can silently return, and you will learn about it from a journalist.`
      }
    ]
  },

  {
    id: "d5.3", round: "r5", core: true,
    title: "03:14 — the page",
    tag: "Incident response",
    scenario: `<div class="alert-box">
<b>PAGERDUTY · P1 (highest severity) · 03:14</b><br>
<code>ALERT: approval_rate_by_segment — segment=SPANISH_LANG_APP
current=0.31 · 7d_avg=0.53 · z=-6.2</code><br>
<code>ALERT: feature_psi — income_verified_monthly PSI=0.41 (threshold 0.15)</code>
</div>

<p class="plain-read">In plain language: approvals in the Spanish-language segment have
collapsed to 31% against a seven-day average of 53% — a six-sigma deviation — and the
population stability index (PSI) on the verified-income feature has passed its drift
threshold nearly threefold.</p>

Slack, 03:19, from the data platform on-call: <i>"heads up, the income
verification vendor pushed a schema change at midnight — <code>monthly_income</code>
now returns <b>annual</b> figures for a subset of partners. We didn't get a
deprecation notice."</i>

Roughly 4,000 applications have been decided since midnight.`,
    concept: `An AI incident is not only a systems incident: there are affected
<i>people</i>. Mature ML incident response has five parts — stop the harm
(rollback/freeze), bound the blast radius, diagnose with the right instruments,
<b>remediate affected individuals</b>, and write a blameless postmortem with a
detection gap analysis.`,
    options: [
      {
        id: "a", label: "Wait until business hours — it's 3am and this needs careful analysis",
        detail: "Don't make 3am decisions on a credit system.",
        scores: { rigor: -2, fairness: -2, ethics: -3, governance: -2, ops: -3 },
        effects: { trust: -12, compliance: -15, performance: -4, budget: 0 },
        note: `Six more hours at ~170 decisions/hour is roughly 1,000 additional
people wrongly declined for a medical procedure, in one identified language
segment. The alert fired correctly; the failure is now organizational.`
      },
      {
        id: "b", label: "Retrain immediately on the last 24 hours so the model adapts to the new income scale",
        detail: "Fast, automated, adaptive.",
        scores: { rigor: -3, fairness: -2, ethics: -2, governance: -2, ops: -2 },
        effects: { trust: -8, compliance: -12, performance: -8, budget: -6 },
        note: `You would be training the model to treat corrupted data as truth,
baking the vendor's bug permanently into CARENOW-4 and destroying your clean
champion. Retraining is never the response to a data-integrity incident.`
      },
      {
        id: "c", label: "Roll back to champion, freeze the affected feature pipeline, quarantine and re-decide the 4,000 affected applications, notify them, then postmortem",
        detail: "Immediate rollback. Circuit-break the income feature and fall back to the documented degraded-mode policy. Pull all decisions since midnight, re-score them on clean data, proactively reverse wrongful declines and contact those applicants. Blameless postmortem covering the missing vendor contract term and the detection gap.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 3 },
        effects: { trust: 15, compliance: 18, performance: -2, budget: -10 },
        note: `Best answer — and the remediation step is what separates it from a
merely competent one. Most teams stop the bleeding and never go back for the
4,000 people. Proactive re-decisioning and notification is the ethical core of
AI incident response, and it is also what turns a regulatory finding into a
regulatory footnote.`
      },
      {
        id: "d", label: "Roll back to champion and open a ticket with the vendor",
        detail: "Stop the bleeding, chase the root cause.",
        scores: { rigor: 2, fairness: 0, ethics: 0, governance: 1, ops: 2 },
        effects: { trust: 2, compliance: 0, performance: 0, budget: -2 },
        note: `Correct first move, incomplete response. The 4,000 people decided
on corrupted data are still declined, still don't know why, and are not coming
back. A rollback protects the <i>system</i>; only remediation protects the
<i>people</i>.`
      }
    ]
  },

  {
    id: "d5.4", round: "r5", core: false,
    title: "The feedback loop nobody drew",
    tag: "Selection bias",
    scenario: `CARENOW-4 has been live nine months. The retraining pipeline is
scheduled to refresh the model on "all decisions with matured outcomes."

A junior analyst raises a hand: <i>"We only observe repayment for people we
approved. Every retrain, the training set gets more and more like the people the
previous model liked. Isn't that... a loop?"</i>

The room goes quiet.`,
    concept: `<b>Selection bias / reject inference</b>: you only see outcomes for
approved applicants, so each retrain narrows the model's world to its own past
approvals. Classic remedies: reject inference (parcelling, bivariate probit),
randomized exploration (approve a small random sample outside policy), and
monitoring the drift of the approved population against the applicant
population.`,
    options: [
      {
        id: "a", label: "Keep auto-retraining monthly on approved-and-matured outcomes",
        detail: "It's working. Fresh data is good data.",
        scores: { rigor: -3, fairness: -2, ethics: -1, governance: -2, ops: -1 },
        effects: { trust: -4, compliance: -8, performance: -6, budget: 0 },
        note: `This is a runaway feedback loop. Each generation encodes the last
one's blind spots more confidently, and the metrics will look <i>better</i> the
whole way down, because you are evaluating on the same narrowing population.`
      },
      {
        id: "b", label: "Stop retraining; freeze the model",
        detail: "A stable model can't spiral.",
        scores: { rigor: 0, fairness: 0, ethics: 0, governance: 1, ops: -1 },
        effects: { trust: 0, compliance: 2, performance: -6, budget: 4 },
        note: `Trades a feedback-loop problem for a drift problem. A frozen model
in a changing economy decays — and the decay is silent.`
      },
      {
        id: "c", label: "Reject inference + a small randomized exploration cohort + gated champion–challenger retraining with human sign-off",
        detail: "Apply reject-inference methods to the declined population; approve a small, capped, consented, closely monitored random sample below policy to generate unbiased counterfactual outcome data; promote a challenger only after fairness and performance review with a named approver.",
        scores: { rigor: 3, fairness: 3, ethics: 2, governance: 3, ops: 3 },
        effects: { trust: 6, compliance: 10, performance: 6, budget: -12 },
        note: `Best answer. The exploration cohort is the only way to get genuinely
unbiased outcome data, and it must be capped, consented and monitored because
you are deliberately lending to people the model declined. The human-gated
promotion step is what keeps automation from quietly shipping a worse model.`
      },
      {
        id: "d", label: "Retrain quarterly instead of monthly",
        detail: "Slow the loop down.",
        scores: { rigor: 0, fairness: 0, ethics: 0, governance: 0, ops: 1 },
        effects: { trust: 0, compliance: 0, performance: -1, budget: 2 },
        note: `Slowing a feedback loop does not break it; it just takes longer to
reach the same place. No diagnosis, no fix.`
      }
    ]
  },

  /* ======================= ROUND 6 ======================= */
  {
    id: "d6.1", round: "r6", core: true,
    title: "The reporter has the numbers",
    tag: "Crisis & transparency",
    scenario: `A national outlet emails. They have the Sprint 4 audit — the
88%/73% TPR gap — apparently from a former contractor. They also have two
patient interviews. Publication is in 48 hours.

Comms drafts: <i>"VHC's models are rigorously tested and fully compliant with
all applicable regulations."</i>

Thirty minutes later, a state AG opens an inquiry.`,
    concept: `Transparency under pressure is where stated AI principles are
actually tested. The choice is rarely "disclose vs. conceal" — it is between a
true, contextualized, remediation-centered account and a technically-true
non-answer that fails the moment someone reads the audit.`,
    options: [
      {
        id: "a", label: "Run the comms line. Say nothing further.",
        detail: "Never expand the story.",
        scores: { rigor: -1, fairness: -1, ethics: -3, governance: -2, ops: 0 },
        effects: { trust: -18, compliance: -10, performance: 0, budget: -4 },
        note: `"Rigorously tested and fully compliant" next to your own audit
showing a 15-point TPR gap reads as a lie even where it is literally true. The
story becomes the cover-up, and the AG now has a credibility question as well as
a fairness question.`
      },
      {
        id: "b", label: "Deny, and consider legal action over the leaked document",
        detail: "Defend the perimeter.",
        scores: { rigor: -2, fairness: -1, ethics: -3, governance: -3, ops: 0 },
        effects: { trust: -25, compliance: -20, performance: 0, budget: -8 },
        note: `Attacking a whistleblower while a regulator watches converts a
fairness problem into a retaliation problem, and destroys the internal culture
that generated the audit in the first place. Nobody will run the next audit.`
      },
      {
        id: "c", label: "Confirm the finding, explain that you found it in your own audit, publish what you changed, commit to an independent third-party audit, and brief the AG before publication",
        detail: "On the record: yes, we measured this, here is the metric and why we chose it, here is the mitigation shipped in Sprint 4, here is the residual gap today, here is the independent auditor and the date. Contact the AG proactively rather than being contacted.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },
        effects: { trust: 18, compliance: 18, performance: -2, budget: -12 },
        note: `Best answer. The strongest possible position in an AI fairness
story is "we found it ourselves, we measured it, we fixed part of it, here is
the residual and the deadline." Proactively briefing the regulator is the move
most companies skip and most regret skipping — it reframes you from subject of
an inquiry to a cooperating party.`
      },
      {
        id: "d", label: "Say nothing publicly; cooperate fully and privately with the AG",
        detail: "Handle it in the proper forum.",
        scores: { rigor: 1, fairness: 0, ethics: 0, governance: 2, ops: 0 },
        effects: { trust: -6, compliance: 6, performance: 0, budget: -3 },
        note: `Legally sound, publicly damaging. Silence for 48 hours cedes the
entire narrative, and the patients in the article get no acknowledgement at all.
Regulatory cooperation and public honesty are not substitutes.`
      }
    ]
  },

  {
    id: "d6.2", round: "r6", core: true,
    title: "Who signs?",
    tag: "Accountability",
    scenario: `The board's Technology & Ethics Committee asks a simple question:

<blockquote>"When CARENOW-5 goes live, whose signature is on it? And who could
have stopped it?"</blockquote>

Today the honest answer is: the model was promoted by whoever merged the PR.`,
    concept: `<b>Three lines of defense</b>: (1) the model owners who build and
control, (2) an independent risk/validation function that challenges — different
reporting line, real authority to block, (3) internal audit that tests whether
lines 1 and 2 actually work. The EU AI Act's human-oversight requirement is not
satisfied by a human who lacks the authority or information to say no.`,
    options: [
      {
        id: "a", label: "The Chief Data Scientist signs off on their own team's models",
        detail: "Clear, single point of accountability. They know the model best.",
        scores: { rigor: 0, fairness: 0, ethics: 0, governance: -2, ops: 1 },
        effects: { trust: -2, compliance: -8, performance: 2, budget: 2 },
        note: `Accountability without independence. Builders approving their own
work is the control failure at the heart of nearly every model-risk scandal;
this is precisely what SR 11-7, the US Federal Reserve's model risk management
guidance, was written to prevent.`
      },
      {
        id: "b", label: "Legal signs off",
        detail: "Put it with the people who own regulatory risk.",
        scores: { rigor: -1, fairness: -1, ethics: 0, governance: 0, ops: 0 },
        effects: { trust: 0, compliance: 2, performance: -2, budget: 0 },
        note: `Legal can assess legal exposure. Legal cannot evaluate whether your
TPR-parity constraint is binding, whether the PSI thresholds are calibrated, or
whether the counterfactual generator is plausibility-constrained. A sign-off
nobody is technically competent to give is theater.`
      },
      {
        id: "c", label: "An AI Review Board with independent validation authority, a documented risk tier, a named accountable executive, and a real power to block",
        detail: "Cross-functional board (risk, legal, clinical, data science, patient advocate) with an independent validation function reporting to the CRO, not to engineering. Models are risk-tiered; high-risk models need board approval; the board can and has blocked releases; internal audit tests the process annually. One named executive is accountable to the board.",
        scores: { rigor: 3, fairness: 3, ethics: 3, governance: 3, ops: 2 },
        effects: { trust: 10, compliance: 18, performance: -2, budget: -10 },
        note: `Best answer. The load-bearing details are the ones people omit: an
<i>independent reporting line</i>, a <i>real</i> power to block (a board that
has never blocked anything is a rubber stamp), risk-tiering so the process
scales, and a <i>single named accountable human</i> — a committee cannot be
accountable.`
      },
      {
        id: "d", label: "Add an AI ethics checklist to the release pipeline",
        detail: "Lightweight, automated, no new headcount.",
        scores: { rigor: 0, fairness: 0, ethics: 0, governance: 0, ops: 1 },
        effects: { trust: 1, compliance: 2, performance: 0, budget: -1 },
        note: `Useful as a floor, useless as governance. A checklist with no
independent reviewer and no authority to block becomes a box-ticking ritual
within two quarters — and produces documentary evidence that you knew what to
check and shipped anyway.`
      }
    ]
  },

  {
    id: "d6.3", round: "r6", core: false,
    title: "The documentation question",
    tag: "AI governance frameworks",
    scenario: `The EU subsidiary's notified body wants technical documentation.
The US regulator wants model risk documentation. Your enterprise customers want
to know what you do. Your own on-call engineer wants to know what the model does
at 3am.

You have one documentation budget.`,
    concept: `Key artifacts: <b>model cards</b> (intended use, performance by
segment, limitations), <b>datasheets for datasets</b> (provenance, collection,
consent), <b>EU AI Act Annex IV</b> technical documentation for high-risk
systems, the <b>NIST AI RMF</b> — the US National Institute of Standards and
Technology AI Risk Management Framework (Govern / Map / Measure / Manage) — as an
organizing framework, and <b>SR 11-7</b>, the US Federal Reserve's model risk
management guidance for financial services.`,
    options: [
      {
        id: "a", label: "A polished public AI Principles page",
        detail: "Signals values to customers and candidates.",
        scores: { rigor: -1, fairness: -1, ethics: -1, governance: -2, ops: 0 },
        effects: { trust: 3, compliance: -8, performance: 0, budget: -2 },
        note: `Ethics-washing if it stands alone: principles with no artifacts,
no owners and no evidence. It also creates liability — you can be held to public
commitments you have no mechanism to keep.`
      },
      {
        id: "b", label: "One layered documentation set: model cards + datasheets + Annex IV pack, mapped to NIST AI RMF, generated from the pipeline",
        detail: "A single source of truth with audience-specific views. Performance and fairness tables are auto-generated from the evaluation pipeline at each release so the docs cannot silently go stale. A crosswalk maps each artifact to EU AI Act, NIST AI RMF and SR 11-7 requirements.",
        scores: { rigor: 3, fairness: 2, ethics: 2, governance: 3, ops: 3 },
        effects: { trust: 6, compliance: 18, performance: 0, budget: -10 },
        note: `Best answer. Two ideas do the work: <i>auto-generation from the
pipeline</i> (hand-maintained model cards are stale within one release) and the
<i>crosswalk</i> (write once, satisfy three regimes). This is how documentation
becomes a control rather than a chore.`
      },
      {
        id: "c", label: "Whatever the EU notified body strictly requires, nothing more",
        detail: "Minimum viable compliance.",
        scores: { rigor: 0, fairness: 0, ethics: -1, governance: 0, ops: -1 },
        effects: { trust: -2, compliance: 4, performance: 0, budget: 4 },
        note: `Passes one audit, fails the 3am test and the US examiner. Also the
most expensive path over three years: you will rebuild it per jurisdiction,
every time.`
      },
      {
        id: "d", label: "Detailed internal engineering runbooks only",
        detail: "Document for the people who actually operate it.",
        scores: { rigor: 1, fairness: 0, ethics: 0, governance: 0, ops: 3 },
        effects: { trust: 0, compliance: -4, performance: 2, budget: -2 },
        note: `Genuinely valuable and frequently neglected — but invisible to
every external stakeholder, and Annex IV is not optional for a high-risk system
in the EU.`
      }
    ]
  },

  {
    id: "d6.4", round: "r6", core: true,
    title: "The LLM that explains the model",
    tag: "LLM risk & human oversight",
    scenario: `A vendor pitches "ExplainBot": an LLM that turns CARENOW-4's SHAP
values into warm, empathetic, plain-language explanations for declined
applicants. The demo is genuinely impressive.

In the demo, one output reads: <i>"Unfortunately your application wasn't
approved this time — mainly because your recent credit activity suggests some
financial pressure right now. <b>Many customers in your situation find that
waiting about six months and keeping balances low leads to approval.</b>"</i>

Nobody computed that six months.`,
    concept: `An LLM in an explanation pipeline is a second model with its own
failure mode: it will produce fluent, confident, <b>unfaithful</b> text. In a
legally binding adverse-action notice, a hallucinated reason or an invented
promise of future approval is a compliance violation and a false promise to a
vulnerable person.`,
    options: [
      {
        id: "a", label: "Buy it. Empathetic explanations are a real improvement for patients.",
        detail: "Better customer experience, immediately.",
        scores: { rigor: -2, fairness: -1, ethics: -2, governance: -3, ops: -1 },
        effects: { trust: -6, compliance: -18, performance: 2, budget: -6 },
        note: `You just put an unconstrained generative model in the legally
binding notice path. The "six months" sentence is a hallucinated, unverifiable
promise — in a regulated communication, to someone who could not afford a
medical procedure.`
      },
      {
        id: "b", label: "Reject it. LLMs have no place in a regulated decision pipeline.",
        detail: "The risk is not worth it.",
        scores: { rigor: 0, fairness: 0, ethics: 1, governance: 1, ops: 0 },
        effects: { trust: 0, compliance: 4, performance: -2, budget: 4 },
        note: `Safe and a bit reflexive. Plain-language explanation is a real
accessibility problem — VHC's current notices are written at a reading level
much of its customer base cannot parse. A blanket ban forgoes a genuine equity
benefit that a constrained design could deliver.`
      },
      {
        id: "c", label: "Constrain it: the LLM may only paraphrase pre-approved reason codes and validated counterfactuals, with no new facts, automated faithfulness + forbidden-claim checks, full logging, human review sampling, and no promises of future outcomes",
        detail: "SHAP → reviewed reason-code library → LLM paraphrase within a closed vocabulary. An automated checker rejects any output containing numbers, timelines or commitments not present in the input. Every generation is logged with its input, a sample is human-reviewed weekly, and applicants can request the unparaphrased version.",
        scores: { rigor: 3, fairness: 2, ethics: 3, governance: 3, ops: 3 },
        effects: { trust: 12, compliance: 12, performance: 2, budget: -10 },
        note: `Best answer. The LLM is demoted from a source of truth to a
<i>rendering layer</i> over facts computed by an auditable method — the correct
architecture for generative models in regulated pipelines. The forbidden-claim
checker, the logging, and the right to the unparaphrased version are the three
controls that make it defensible.`
      },
      {
        id: "d", label: "Pilot it on the internal agent-assist tool only; agents review before anything is sent",
        detail: "Human in the loop, internal use first.",
        scores: { rigor: 2, fairness: 1, ethics: 2, governance: 2, ops: 2 },
        effects: { trust: 3, compliance: 6, performance: 1, budget: -4 },
        note: `A sensible, low-risk pilot. Watch for <b>automation bias</b>,
though: agents handling 80 notices an hour approve fluent text almost
automatically, so "human in the loop" degrades into "human rubber-stamping the
loop" unless you measure the override rate.`
      }
    ]
  },

  /* ======================= ROUND 7 — LIGHTNING ======================= */
  {
    id: "d7.1", round: "r7", core: true, lightning: true,
    title: "A patient asks: \"What do I need to do to get approved next time?\"",
    tag: "Method match",
    scenario: `Which method answers <i>this</i> question?`,
    options: [
      { id: "a", label: "Global SHAP summary plot", scores: { rigor: -1 }, effects: {}, note: "Global importance says what matters on average across the portfolio — not what <i>you</i> should do." },
      { id: "b", label: "Actionable counterfactual explanation", scores: { rigor: 3 }, effects: {}, note: "Correct. Counterfactuals answer 'what minimal, actionable change flips the outcome' — this is algorithmic recourse.", best: true },
      { id: "c", label: "Partial dependence plot (PDP)", scores: { rigor: -1 }, effects: {}, note: "PDPs show average marginal effect of a feature across the dataset — global, not individual, and not actionable." },
      { id: "d", label: "Anchors", scores: { rigor: 0 }, effects: {}, note: "Anchors tell you which rule caught you, not the cheapest route out of it." }
    ]
  },
  {
    id: "d7.2", round: "r7", core: true, lightning: true,
    title: "\"Which features drive our model overall, and in what direction?\"",
    tag: "Method match",
    scenario: `The board wants a portfolio-level picture.`,
    options: [
      { id: "a", label: "SHAP summary (beeswarm) plot", scores: { rigor: 3 }, effects: {}, note: "Correct. SHAP aggregates local attributions into a consistent global view, showing both magnitude and direction per feature.", best: true },
      { id: "b", label: "LIME on 20 random applicants", scores: { rigor: -1 }, effects: {}, note: "Local surrogates don't aggregate into a reliable global picture, and LIME's instability compounds across cases." },
      { id: "c", label: "A single counterfactual", scores: { rigor: -2 }, effects: {}, note: "One counterfactual describes one applicant's nearest boundary crossing. Not a global statement." },
      { id: "d", label: "Model accuracy by segment", scores: { rigor: -1 }, effects: {}, note: "That's a performance breakdown, not an explanation of what drives predictions." }
    ]
  },
  {
    id: "d7.3", round: "r7", core: true, lightning: true,
    title: "\"Give me an IF-THEN rule with a precision guarantee for this region.\"",
    tag: "Method match",
    scenario: `An examiner wants a rule, plus how often it holds.`,
    options: [
      { id: "a", label: "Anchors", scores: { rigor: 3 }, effects: {}, note: "Correct. Anchors produce high-precision IF-THEN rules with explicit precision and coverage — a rule plus a guarantee.", best: true },
      { id: "b", label: "SHAP values", scores: { rigor: 0 }, effects: {}, note: "SHAP gives continuous additive attributions, not discrete rules with precision bounds." },
      { id: "c", label: "Individual conditional expectation (ICE) plots", scores: { rigor: -1 }, effects: {}, note: "ICE shows how one instance's prediction varies as a feature varies — a curve, not a rule." },
      { id: "d", label: "Permutation importance", scores: { rigor: -1 }, effects: {}, note: "A global ranking of how much the model relies on each feature. No rules, no regions." }
    ]
  },
  {
    id: "d7.4", round: "r7", core: true, lightning: true,
    title: "\"Our two explanation runs disagree. What's the property we failed?\"",
    tag: "Concept check",
    scenario: `Same applicant, same model, different top feature.`,
    options: [
      { id: "a", label: "Fidelity", scores: { rigor: 1 }, effects: {}, note: "Close — fidelity is whether the explanation matches the model. Here the explanation doesn't even match itself." },
      { id: "b", label: "Stability", scores: { rigor: 3 }, effects: {}, note: "Correct. Stability (robustness) is consistency across runs or near-identical inputs. LIME's perturbation sampling is the usual culprit.", best: true },
      { id: "c", label: "Sparsity", scores: { rigor: -1 }, effects: {}, note: "Sparsity is how few features the explanation cites — unrelated to run-to-run disagreement." },
      { id: "d", label: "Calibration", scores: { rigor: -1 }, effects: {}, note: "Calibration is a property of predicted probabilities, not of explanations." }
    ]
  },
  {
    id: "d7.5", round: "r7", core: true, lightning: true,
    title: "\"Base rates differ between groups. Can we have calibration AND equalized odds?\"",
    tag: "Concept check",
    scenario: `The CRO wants a one-word answer and a reason.`,
    options: [
      { id: "a", label: "Yes, with enough tuning", scores: { rigor: -2 }, effects: {}, note: "No amount of tuning defeats a theorem." },
      { id: "b", label: "No — impossibility results (Kleinberg et al.; Chouldechova) rule it out except in degenerate cases", scores: { rigor: 3 }, effects: {}, note: "Correct. With unequal base rates and an imperfect classifier, calibration and equalized odds are mutually incompatible. You must choose and document.", best: true },
      { id: "c", label: "Yes, if we remove protected attributes", scores: { rigor: -2 }, effects: {}, note: "Fairness through unawareness again — it changes neither base rates nor the theorem." },
      { id: "d", label: "Only for binary classifiers", scores: { rigor: -1 }, effects: {}, note: "The results are stated for binary classification and extend in spirit; the constraint is base rates, not arity." }
    ]
  },
  {
    id: "d7.6", round: "r7", core: true, lightning: true,
    title: "\"Labels take two years. What do we monitor on day one?\"",
    tag: "Concept check",
    scenario: `Your first production dashboard.`,
    options: [
      { id: "a", label: "Accuracy and AUC", scores: { rigor: -2 }, effects: {}, note: "Both require matured labels. These panels will be empty for two years." },
      { id: "b", label: "Nothing until labels mature", scores: { rigor: -3 }, effects: {}, note: "Two unmonitored years on a high-risk system is not a monitoring strategy." },
      { id: "c", label: "Input drift (population stability index), prediction drift, per-segment approval rates and fairness metrics, data-quality checks", scores: { rigor: 3 }, effects: {}, note: "Correct. When ground truth is delayed you monitor leading indicators — distributional and fairness proxies — not lagging accuracy.", best: true },
      { id: "d", label: "Latency and uptime", scores: { rigor: -1 }, effects: {}, note: "Necessary, nowhere near sufficient. A fast, available, silently biased model still passes." }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Reflection prompts (free-text, LLM-graded)                          */
/* ------------------------------------------------------------------ */

VHC.reflections = {
  r2: {
    prompt: "In 2–4 sentences: explain the difference between interpretability and explainability to a non-technical board member, and say which you chose for CARENOW-4 and why.",
    rubric: "Should distinguish intrinsic/mechanism-readable from post-hoc/approximation; should connect to a concrete VHC obligation (adverse action accuracy, EU AI Act, incident diagnosis); should state and justify a choice rather than hedge."
  },
  r4: {
    prompt: "In 2–4 sentences: the CEO asks why you can't just 'make the model fair.' Give your answer, naming the specific fairness criterion you chose and the specific harm it targets.",
    rubric: "Should reference the impossibility result or the incompatibility of criteria under unequal base rates; should name a specific metric (e.g. equal opportunity / TPR parity) and tie it to a specific harm (denying credit to someone who would have repaid); should locate the value judgement with an accountable body."
  },
  r6: {
    prompt: "In 3–5 sentences: write the opening of the memo to VHC's board explaining what went wrong, what you changed, and what would stop it recurring.",
    rubric: "Should be concrete and non-defensive; should name a specific failure, a specific control added (monitoring, independent validation, remediation process), and a mechanism for recurrence prevention; should avoid vague commitments to 'principles'."
  }
};

/* ------------------------------------------------------------------ */
/* Glossary                                                            */
/* Every key here is auto-detected in rendered scenario, option and    */
/* coaching text: first mention per block becomes a hoverable/tappable */
/* <abbr>, and the whole list is browsable from the Glossary button.   */
/* ------------------------------------------------------------------ */

VHC.glossary = {
  /* --- explainability methods --- */
  SHAP: { full: "SHapley Additive exPlanations", group: "Explainability",
    def: "Local feature attributions derived from cooperative game theory: how much each feature pushed this one prediction away from a baseline. Consistent, and exactly computable for tree models." },
  TreeSHAP: { full: "Tree SHAP", group: "Explainability",
    def: "The exact, fast SHAP algorithm for tree ensembles. Because it is exact rather than sampled, it is deterministic — the same input always yields the same attribution." },
  KernelSHAP: { full: "Kernel SHAP", group: "Explainability",
    def: "Model-agnostic, sampling-based approximation of SHAP values. Works on any model, but is slower and less stable than TreeSHAP." },
  LIME: { full: "Local Interpretable Model-agnostic Explanations", group: "Explainability",
    def: "Fits a simple linear surrogate in the neighbourhood of one prediction by perturbing the input. Intuitive and model-agnostic, but the perturbation sampling makes it unstable across runs." },
  Anchors: { full: "Anchor explanations (Ribeiro et al., 2018)", group: "Explainability",
    def: "High-precision IF-THEN rules: 'if these conditions hold, the model predicts X with at least 95% precision', reported together with coverage — the share of cases the rule applies to." },
  DiCE: { full: "Diverse Counterfactual Explanations", group: "Explainability",
    def: "A method and library for generating several actionable counterfactuals per case, under feasibility, sparsity and diversity constraints." },
  PDP: { full: "partial dependence plot", group: "Explainability",
    def: "The average predicted outcome as one feature is varied across the dataset. A global view; it can hide opposing effects in subgroups." },
  ICE: { full: "individual conditional expectation", group: "Explainability",
    def: "Like a partial dependence plot, but one line per instance rather than an average — so heterogeneous effects stay visible." },
  XAI: { full: "explainable AI", group: "Explainability",
    def: "The umbrella term for methods that make model behaviour intelligible to a human." },

  /* --- models & metrics --- */
  AUC: { full: "area under the ROC curve", group: "Models & metrics",
    def: "Ranking quality: the probability the model scores a random defaulter above a random repayer. 0.5 is a coin flip, 1.0 is perfect. Typical credit models land around 0.75." },
  ROC: { full: "receiver operating characteristic curve", group: "Models & metrics",
    def: "A plot of true positive rate against false positive rate across every possible decision threshold." },
  EBM: { full: "explainable boosting machine", group: "Models & metrics",
    def: "A glass-box generalized additive model fitted by boosting. Accuracy close to gradient-boosted trees, but every feature's contribution is a readable, plottable shape function." },
  "GA²M": { full: "generalized additive model with pairwise interactions", group: "Models & metrics",
    def: "A generalized additive model extended with selected two-way interaction terms — the model family behind the explainable boosting machine." },
  GAM: { full: "generalized additive model", group: "Models & metrics",
    def: "A model built as a sum of per-feature shape functions. Intrinsically interpretable: you can read each feature's effect directly off a curve." },
  WOE: { full: "weight of evidence", group: "Models & metrics",
    def: "A binning transform standard in credit scorecards: each bin of a feature is replaced by the log-odds of the outcome within that bin." },
  TPR: { full: "true positive rate", group: "Models & metrics",
    def: "Also called recall or sensitivity. Among applicants who would have repaid, the share the model approves. Equalizing it across groups is 'equal opportunity'." },
  FPR: { full: "false positive rate", group: "Models & metrics",
    def: "Among applicants who would have defaulted, the share the model approves." },
  PD: { full: "probability of default", group: "Models & metrics",
    def: "The model's predicted chance that a borrower fails to repay. Calibration means a predicted 8% really does default 8% of the time." },
  CI: { full: "confidence interval", group: "Models & metrics",
    def: "The range of values consistent with the data at a stated confidence level. A wide interval means low statistical power, not evidence of no effect." },
  PSI: { full: "population stability index", group: "MLOps & AIOps",
    def: "A measure of how much a feature's distribution has shifted since training. Rules of thumb: below 0.1 stable, 0.1–0.25 investigate, above 0.25 a significant shift." },
  KL: { full: "Kullback–Leibler divergence", group: "MLOps & AIOps",
    def: "An information-theoretic measure of how far one probability distribution has moved from another. Used, like the population stability index, to detect drift." },

  /* --- lending & operations --- */
  DPD: { full: "days past due", group: "Lending",
    def: "How long a payment has been missed. '90-DPD within 24 months' is the conventional definition of default in consumer credit." },
  APR: { full: "annual percentage rate", group: "Lending",
    def: "The yearly cost of a loan including fees, expressed as a percentage." },
  MLOps: { full: "machine learning operations", group: "MLOps & AIOps",
    def: "The engineering discipline of getting models into production and keeping them correct there: pipelines, versioning, testing, deployment, retraining." },
  AIOps: { full: "AI operations", group: "MLOps & AIOps",
    def: "Operating AI systems in production — monitoring, alerting, incident response and remediation for model behaviour, not just infrastructure health." },
  SLO: { full: "service-level objective", group: "MLOps & AIOps",
    def: "A measurable target for a system property (latency, availability — or, here, explanation stability) with an agreed threshold and an owner." },
  SRE: { full: "site reliability engineering", group: "MLOps & AIOps",
    def: "The operations discipline behind the 'golden signals' — latency, traffic, errors, saturation. Necessary for ML systems, and nowhere near sufficient." },
  P1: { full: "priority-1 incident", group: "MLOps & AIOps",
    def: "The highest severity tier: something is actively causing harm and someone is paged immediately, at any hour." },
  QA: { full: "quality assurance", group: "MLOps & AIOps",
    def: "The review function that tests outputs before and after release." },
  PR: { full: "pull request", group: "MLOps & AIOps",
    def: "A proposed code change submitted for review and merge. 'Promoted by whoever merged the PR' means no governance gate existed." },
  LLM: { full: "large language model", group: "MLOps & AIOps",
    def: "A generative text model. In a regulated pipeline it is a second model with its own failure mode: fluent, confident and sometimes unfaithful output." },

  /* --- law & governance --- */
  ECOA: { full: "Equal Credit Opportunity Act", group: "Law & governance",
    def: "US law prohibiting credit discrimination on protected characteristics. It requires that every declined applicant receive the specific principal reasons for the decision." },
  "Regulation B": { full: "Regulation B", group: "Law & governance",
    def: "The regulation implementing the Equal Credit Opportunity Act, including the adverse-action notice requirements." },
  "Reg B": { full: "Regulation B", group: "Law & governance",
    def: "The regulation implementing the Equal Credit Opportunity Act, including the adverse-action notice requirements." },
  GDPR: { full: "General Data Protection Regulation", group: "Law & governance",
    def: "The EU data protection regulation. Article 9 restricts processing of special-category data such as race, health and biometrics." },
  "EU AI Act": { full: "European Union Artificial Intelligence Act", group: "Law & governance",
    def: "The EU's risk-tiered AI regulation. Credit scoring for consumers is a high-risk system, which triggers technical documentation, human oversight, data governance and post-market monitoring duties." },
  "Annex IV": { full: "EU AI Act, Annex IV", group: "Law & governance",
    def: "The annex specifying the technical documentation a high-risk AI system must maintain: design, data, performance, risk management and oversight measures." },
  "NIST AI RMF": { full: "US National Institute of Standards and Technology AI Risk Management Framework", group: "Law & governance",
    def: "A voluntary framework organised into four functions — Govern, Map, Measure, Manage — widely used as the backbone for AI governance programmes." },
  "AI RMF": { full: "AI Risk Management Framework", group: "Law & governance",
    def: "See NIST AI RMF: the Govern / Map / Measure / Manage framework." },
  "SR 11-7": { full: "Supervisory Letter SR 11-7", group: "Law & governance",
    def: "US Federal Reserve and OCC guidance on model risk management. It is the source of the expectation that model validation be independent of model development." },
  BISG: { full: "Bayesian Improved Surname Geocoding", group: "Law & governance",
    def: "A statistical method that infers race from surname and location. Used by regulators for fairness auditing when self-reported data is unavailable; its error rates differ sharply across groups." },
  ADI: { full: "Area Deprivation Index", group: "Law & governance",
    def: "A published, transparent socioeconomic index for a small geographic area. More interpretable than a raw ZIP code, but still strongly correlated with race." },
  AG: { full: "Attorney General", group: "Law & governance",
    def: "A US state's chief legal officer, with authority to investigate and sue over unfair or discriminatory business practices." },
  CRO: { full: "Chief Risk Officer", group: "Law & governance",
    def: "The executive accountable for the firm's risk management, typically with a reporting line independent of the business units that create the risk." }
};
