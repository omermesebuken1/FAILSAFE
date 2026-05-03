# FAILSAFE

A structured pre-mortem protocol for AI-assisted project evaluation.

> Instead of asking "Is this a good idea?", FAILSAFE asks "If this fails, why will it fail?"

## What It Is

FAILSAFE evaluates the **current version** of a project and decides whether it can survive real-world execution. It produces:

- A short project summary
- Exactly 3 critical failure risks with root cause types
- Solvability + solver assignment per risk
- A concrete action map for each solvable risk
- A final decision: **Continue**, **Pivot**, or **Kill**

It is a survival system, not a motivation tool. Output is brutally honest.

## Files

| File | Purpose |
|------|---------|
| `FAILSAFE.md` | Full protocol specification |
| `CLAUDE.md` | Execution rules for Claude Code |
| `schema.json` | JSON Schema for the report output |
| `examples/diy-youtube-patreon.json` | Example FAILSAFE report |

## Usage

In Claude Code (or any compatible AI agent), invoke the protocol with one of:

- `Run FAILSAFE`
- `FAILSAFE this`
- `Generate FAILSAFE report`

Then describe the project. Example:

```
Project:
AI-powered mechanical DIY YouTube + Patreon business

Run FAILSAFE.
```

The agent returns a JSON report conforming to `schema.json`.

## Output Contract

```json
{
  "failsafe_version": "0.1",
  "project_summary": "...",
  "failure_risks": [
    {
      "risk": "...",
      "root_cause_type": "Concept | Execution | Environment",
      "solvable": true,
      "solver": "User | AI | External | Mixed | None",
      "action_map": {
        "validation_step": "...",
        "minimum_test": "...",
        "success_metric": "...",
        "failure_threshold": "...",
        "next_action": "..."
      }
    }
  ],
  "final_recommendation": "Continue | Pivot | Kill"
}
```

Constraints:
- Exactly 3 risks. Not 2. Not 4.
- If `solvable: false`, then `solver: "None"` and the `action_map` fields are empty strings.
- If `solvable: true`, all five action map fields must be populated.

## Decision Logic

| Condition | Recommendation |
|-----------|----------------|
| All 3 risks solvable with reasonable effort | Continue |
| ≥1 critical risk threatens direction, core idea survives changes | Pivot |
| Core assumption invalid OR ≥2 risks unsolvable | Kill |

## Version

FAILSAFE v0.1
