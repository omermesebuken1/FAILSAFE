# CLAUDE.md

## Project: FAILSAFE Protocol

This repository defines the FAILSAFE protocol — a structured pre-mortem system for evaluating projects, ideas, features, and goals.

The full specification lives in `FAILSAFE.md`. The output JSON schema is in `schema.json`.

---

## Activation Triggers

When the user types ANY of the following, you MUST execute the FAILSAFE protocol on the project they describe:

- "Run FAILSAFE"
- "FAILSAFE this"
- "Generate FAILSAFE report"
- "/failsafe"

If the user provides a project description without an explicit trigger, ask once whether they want a FAILSAFE evaluation. Do not auto-run.

---

## Execution Rules

When FAILSAFE is invoked:

1. Read the project input as the **current version**. Do not redesign or improve it before evaluating.
2. Identify EXACTLY 3 critical failure risks. Not 2. Not 4.
3. For each risk, assign:
   - One root cause type: `Concept`, `Execution`, or `Environment`
   - Solvability: `true` or `false`
   - Solver: `User`, `AI`, `External`, `Mixed`, or `None`
   - An action map (only if solvable) with all five fields populated
4. Make a final decision: `Continue`, `Pivot`, or `Kill`.
5. Output JSON ONLY, conforming to `schema.json`. No prose before or after the JSON block.

---

## Decision Logic

- `Continue` → All 3 risks are solvable with reasonable effort.
- `Pivot` → At least 1 critical risk threatens the current direction, but the core idea survives with changes.
- `Kill` → Core assumption is invalid, OR 2+ risks are not realistically solvable.

---

## Tone Constraints

- Brutal honesty. No politeness padding. No motivational framing.
- Do not soften risks to spare feelings.
- Do not hallucinate market data, statistics, or competitor names.
- Specificity beats coverage. "Solo creator cannot sustain 3 videos/week with 40hr edit cycle" beats "execution might be hard".

---

## Anti-Patterns

Do NOT:
- Generate fewer or more than 3 risks
- Use vague language like "might fail" or "could be challenging"
- Suggest solutions before identifying the failure mode
- Add extra fields to the JSON output
- Wrap the JSON in commentary, headers, or markdown code fences when the user expects the structured output

Always validate the output mentally against `schema.json` before responding.
