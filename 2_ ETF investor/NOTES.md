# Working Notes

## Learner profile

- **Federico** — UK resident, invests through ISA and SIPP.
- Horizon: 10–20 years of wealth building running into financial independence. No near-term
  withdrawal need, so equity-heavy allocation is defensible. Confirmed 25 Aug 2026.
- Has both an existing lump sum to restructure **and** ongoing monthly contributions. This is
  the useful case: contributions can do most rebalancing without selling anything.
- Self-assessed as "bought some ETFs, no system."

## Stated preferences

- **Do not stay at beginner level.** Explicit request: "do not limit with basic knowledge,
  scaling up to advanced." Lessons should reach portfolio construction maths, factor evidence,
  fund-document forensics — not repeat what an index fund is.
- Wants to learn to **read ETF and market news effectively**, i.e. filter signal from noise
  in a way that changes (or correctly does not change) the portfolio.
- Comfortable being taught in English. Italian-language sources are welcome as supplements
  if any turn out to be strong, but the mission is UK-wrapper-specific so UK sources dominate.

## Teaching decisions

- **Sequencing.** Three arcs, interleaved rather than run to completion in turn:
  - **A — Instrument literacy:** read a fund the way a professional does. (Lesson 1.)
  - **B — Portfolio architecture:** weighting schemes, overlap, look-through, core/satellite.
  - **C — Policy and behaviour:** IPS, rebalancing bands, contribution routing, drawdown plan.
  Arc A first because there is no point weighting a portfolio built from leaky instruments,
  and because it delivers an immediate, checkable win on holdings already owned.
- **Every lesson must be UK-correct.** US-domiciled tickers are unavailable under UK PRIIPs.
  Never recommend VTI/VOO/SPY. Default to Ireland-domiciled UCITS and say why.
- **Never give personal financial advice.** Teach method, evidence and sourcing; the decision
  is Federico's. Every lesson carries a disclaimer.
- **Numbers date fast.** Allowance figures, TERs and tracking differences must be presented as
  "check this yourself, here is where" rather than memorised facts. Re-verify every April.

## Open threads

- **Holdings received** 25 Aug 2026 (`Portfolio DiY.png`, `Portfolio experiment.png`) and
  captured in [learning record 0001](./learning-records/0001-starting-portfolio.md). Eleven
  funds, £15,939, two sleeves, no global core. Targets already exist on the platform but were
  never built out — this reframes the problem from "no system" to "unimplemented system".
- **All five questions answered** 25 Aug 2026 — see
  [learning record 0002](./learning-records/0002-the-hidden-financials-bet.md). X7PP is the
  Europe 600 **Banks** sector fund; Europe tilt is deliberate; "experiment" is a learning pile;
  **ISA only**; no lump sum waiting.
- **Still unresolved — blocks Arc C:** whether there are **ongoing monthly contributions**.
  Answer 5 was "no" to a two-part question, so the monthly half is ambiguous. With new money,
  rebalancing is done by directing contributions and nothing is sold; without it, rebalancing
  requires selling. Ask before writing the rebalancing lesson.
- **Pending from Lesson 2's task:** verified XGSD and UC64 financials weights (mine are
  estimates at 30% and 20%), plus his one-sentence rationale for X7PP, NATP, and SGLN+COMX.
  The sentences he struggles to write are the agenda for Lesson 3.

## Delivered so far

| # | Lesson | Arc | Key win |
|---|---|---|---|
| 1 | What an ETF Really Costs You | A | TER ≠ cost; tracking difference; domicile withholding |
| 2 | The X-Ray | B | His equity is ~40% financials vs 17% ACWI; 64% of equity is non-broad |

Reference docs: `fund-forensics.html` (10-field extraction card).
- Glossary not yet started — by the skill's rule, terms get promoted only once used correctly.
  Candidates queued from Lesson 1: tracking difference, TER, domicile, accumulating,
  total cost of ownership.
- No community posting suggested yet. Worth raising once an IPS draft exists — that is the
  artefact worth having critiqued on Bogleheads.

## Asset library

- `assets/course.css` — Tufte-style shared stylesheet. Every lesson and reference doc links it.
- `assets/widgets.css` — quiz, numeric widget, task checklist, source card styles.
- `assets/quiz.js` — retrieval quiz. Shuffles options, gives immediate feedback, stores only
  the date and tally of the last attempt (deliberately not the answers).
- `assets/compound.js` — `window.Compound` maths helpers plus the `[data-costleak]` widget.
- `assets/checklist.js` — persistent real-world task checklists.
