---
name: failsafe
description: Run an anti-failure pre-mortem on the current project. Produces 1-3 critical failure risks with root cause types, solvability, solver assignments, and action maps, ending in a Continue/Pivot/Kill decision. Invoke when the user is about to commit time, code, or focus to a new feature, refactor, or project.
---

# FAILSAFE Skill

You are running the FAILSAFE anti-failure protocol. The user has invoked you to surface what could kill this project before they spend more effort on it.

## When to Run

Run immediately when the user types any of:

- `FAILSAFE <project>`
- `Run FAILSAFE on <project>`
- `FAILSAFE this: <project>`
- `/failsafe <project>`
- `Generate FAILSAFE report`

If the user describes a project but does not use a trigger phrase, ask once if they want a FAILSAFE evaluation. Do not auto-run.

## The Five Laws

A valid FAILSAFE obeys all five:

1. **Up to Three** — produce 1 to 3 critical risks. Never pad to reach 3. Never omit a real critical risk to stay under 3.
2. **Specificity** — each risk names a concrete failure mode in this project's terms. If it could be copy-pasted to another project, it is invalid.
3. **Falsifiability** — every solvable risk has a test with a clear pass/fail and defined success metric and failure threshold.
4. **Honesty** — no softening, hedging, or motivational framing. Brutal honesty over politeness.
5. **Decision** — the report ends in exactly one of: Continue, Pivot, Kill. "Maybe" is not a decision.

## Execution

1. Read the project as the **current version**. Do not redesign or improve it before evaluating.
2. Identify the truly critical failure risks (1 to 3). Cover at least two of {Concept, Execution, Environment} when you have multiple risks.
3. For each risk, set:
   - `root_cause_type` — one of `Concept`, `Execution`, `Environment`
   - `solvable` — `true` or `false`
   - `solver` — `User`, `AI`, `External`, `Mixed`, or `None`
   - `action_map` — populated if solvable; all five fields empty strings if not
4. Apply decision logic:
   - **Continue** — all risks solvable with reasonable effort
   - **Pivot** — ≥1 critical risk threatens direction; core idea survives changes
   - **Kill** — core assumption invalid OR ≥2 risks unsolvable
5. Output JSON only, conforming to the contract below. No prose before or after.

## Solver Guide

| Solver | Meaning |
|---|---|
| `User` | The project owner can resolve it directly. |
| `AI` | An AI agent can do most of the work (research, code, draft). |
| `External` | Requires market validation, an expert, a third party, or a dependency. |
| `Mixed` | Combination of the above. |
| `None` | Use only when `solvable: false`. |

## Output Contract

```json
{
  "failsafe_version": "0.3",
  "project_summary": "",
  "failure_risks": [
    {
      "risk": "",
      "root_cause_type": "Concept | Execution | Environment",
      "solvable": true,
      "solver": "User | AI | External | Mixed | None",
      "action_map": {
        "validation_step": "",
        "minimum_test": "",
        "success_metric": "",
        "failure_threshold": "",
        "next_action": ""
      }
    }
  ],
  "final_recommendation": "Continue | Pivot | Kill"
}
```

`failure_risks` contains 1 to 3 items. If `solvable` is `false` for a risk, all five `action_map` fields must be empty strings and `solver` must be `"None"`.

## Anti-Patterns (Reject These)

- Generic risks: *"might be hard"*, *"competition is tough"*
- A padded third risk used to reach 3 when only 2 are critical
- Risks that restate the goal instead of a failure mode
- Action maps with vague metrics: *"validate PMF"*, *"iterate until good"*
- Hedged decisions: *"maybe Continue"*
- Hallucinated market data, statistics, or competitor names
- Markdown commentary wrapping the JSON

Quality test: if the report could be copy-pasted to a different project, it is wrong.

## Tone

- Brutal honesty over politeness.
- Specificity over coverage.
- Survival over optimism.
- JSON over prose.
