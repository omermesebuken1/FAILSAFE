# CLAUDE.md

## Project: FAILSAFE Protocol

This repository defines the **FAILSAFE protocol** — an anti-failure pre-mortem that runs with your AI pair before (or during) building something. It produces 1-3 critical failure risks with action maps and a Continue / Pivot / Kill decision. Canonical spec is in `FAILSAFE.md`. Output schema is `schema.json`.

---

## Activation

Execute the protocol immediately when the user types any of these:

- `FAILSAFE <project>`
- `Run FAILSAFE on <project>`
- `FAILSAFE this: <project>`
- `/failsafe <project>`
- `Generate FAILSAFE report`

If the user describes a project without an explicit trigger, ask once whether they want a FAILSAFE evaluation. Do not auto-run.

---

## The Five Laws (Validity Rules)

Every output you produce must satisfy all five:

1. **Up to Three** — produce 1 to 3 critical risks. Do not pad to reach 3. Do not omit a real critical risk to stay under 3.
2. **Specificity** — each risk names a concrete failure mode in this project's terms.
3. **Falsifiability** — every solvable risk has a test with a clear pass/fail.
4. **Honesty** — no softening, hedging, or motivational framing.
5. **Decision** — final recommendation is exactly one of: Continue, Pivot, Kill.

If you cannot satisfy a law, fix the report — do not ship it.

---

## Execution Steps

1. Read the project as the **current version**. Do not redesign before evaluating.
2. Identify the truly critical failure risks. 1 risk if there is genuinely only one. 2 if there are two. 3 maximum. Cover at least two of {Concept, Execution, Environment} when you have multiple risks.
3. For each risk, set:
   - `root_cause_type` ∈ {Concept, Execution, Environment}
   - `solvable` ∈ {true, false}
   - `solver` ∈ {User, AI, External, Mixed, None}
   - `action_map` — populated if solvable, empty strings if not.
4. Apply decision logic:
   - **Continue** — all risks solvable with reasonable effort.
   - **Pivot** — ≥1 critical risk threatens direction; core survives changes.
   - **Kill** — core assumption invalid OR ≥2 risks unsolvable.
5. Output JSON only, conforming to `schema.json`. No prose before or after.

---

## Anti-Patterns (Reject These)

Do NOT produce:
- Generic risks ("might be hard", "competition is tough")
- A weak third risk just to reach 3
- A missing fourth risk that is genuinely critical (means you have not ranked the top 3 sharply)
- Risks that restate the project goal instead of a failure mode
- Action maps with vague metrics ("validate PMF", "iterate until good")
- Hedged decisions ("maybe Continue")
- Hallucinated market data, statistics, or competitor names
- Markdown commentary wrapping the JSON

If your output could be copy-pasted to a different project, it is wrong. Rewrite.

---

## Tone

- Brutal honesty over politeness.
- Specificity over coverage.
- Survival over optimism.
- JSON over prose.
