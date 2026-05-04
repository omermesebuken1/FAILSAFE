# FAILSAFE — Canonical Specification

**Version:** 0.3
**One-liner:** *If this fails, why?*

FAILSAFE is an anti-failure pre-mortem you run **with your AI pair** before (or during) building something. It surfaces the critical failure modes, decides which are solvable, and produces a strict, machine-readable report ending in **Continue / Pivot / Kill**.

Built for the developer working alongside Claude, Codex, or any agentic AI. Invoke it by name. The agent does the rest.

---

## 1. Core

```
FAILSAFE = up to 3 critical risks  →  action map per solvable risk  →  1 decision
```

- **Up to 3 risks** — only the *truly critical* failure modes. No padding to reach 3. No omission to stay under it. Minimum 1, maximum 3.
- **Action map** — for each solvable risk, the smallest test that resolves it.
- **1 decision** — Continue, Pivot, or Kill.

That is the entire protocol.

---

## 2. The Five Laws

A FAILSAFE is **valid** only if it obeys all five.

### Law 1 — Up to Three
Generate up to 3 critical risks. Stop when you reach a non-critical one. Do not pad to reach 3. Do not skip a real fourth — if you have a real fourth, you have not yet ranked the top 3 sharply enough.

### Law 2 — Specificity
A risk must name a concrete failure mode in this project's terms. If the risk could be copy-pasted to a different project, it is invalid.

### Law 3 — Falsifiability
Every solvable risk must include a test that can produce a clear pass or fail with a defined success metric and failure threshold.

### Law 4 — Honesty
Optimize for survival, not optimism. Do not soften, hedge, or motivate. State failure modes plainly.

### Law 5 — Decision
Every FAILSAFE ends in exactly one of: **Continue**, **Pivot**, **Kill**. "Maybe" is not a decision.

---

## 3. Audience

FAILSAFE is built for a specific moment: **you are about to commit time, code, or focus to a project, and you are working with an AI agent.** That includes:

- Spinning up a new feature with Claude Code as primary engineer
- Pair-programming a refactor with Codex
- Greenfielding a side project before it eats a weekend
- Deciding whether to keep building or stop

It is not an enterprise risk register. It is not a board document. It is a primitive you call by name in your editor.

---

## 4. Invocation

Any of these forms invokes the protocol:

```
FAILSAFE <project>
Run FAILSAFE on <project>
FAILSAFE this: <project>
/failsafe <project>
```

The protocol name is the verb. *"I FAILSAFE'd it"* is valid usage.

---

## 5. Risk Taxonomy

Every risk has exactly one root cause type:

| Type | Definition |
|---|---|
| **Concept** | The idea, audience, value proposition, or strategy is flawed. |
| **Execution** | The idea is valid but implementation may fail (scope, skills, time, process). |
| **Environment** | External factors may cause failure (market, platform, cost, legal, dependencies, user behavior). |

---

## 6. Solvability and Solver

| Field | Values |
|---|---|
| `solvable` | `true` \| `false` |
| `solver` | `User`, `AI`, `External`, `Mixed`, `None` |

Rules:
- If `solvable: false` → `solver: "None"` and the action map fields are empty strings.
- If `solvable: true` → `solver` is one of {User, AI, External, Mixed} and all action map fields are populated.

Solver guide:
- **User** — the project owner can resolve it directly.
- **AI** — an AI agent can do most of the work (research, code, draft).
- **External** — requires market validation, an expert, a third party, or a dependency to ship.
- **Mixed** — combination of the above.

---

## 7. Action Map

Every solvable risk has all five fields populated:

| Field | Purpose |
|---|---|
| `validation_step` | The assumption that must be tested. |
| `minimum_test` | The smallest experiment that tests it. |
| `success_metric` | Quantitative or observable indicator of pass. |
| `failure_threshold` | Quantitative or observable indicator of fail. |
| `next_action` | What to do after the result, branched on pass/fail. |

If a field cannot be filled with a concrete answer, the risk is not solvable in its current framing.

---

## 8. Decision Logic

| Condition | Recommendation |
|---|---|
| All risks solvable with reasonable effort | **Continue** |
| ≥1 critical risk threatens the direction, but the core idea survives changes | **Pivot** |
| Core assumption invalid OR ≥2 risks unsolvable | **Kill** |

---

## 9. Output Contract

Output is JSON only, conforming to `schema.json`. No prose before or after.

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

`failure_risks` contains 1 to 3 items.

---

## 10. Anti-Patterns

A FAILSAFE is **invalid** if it falls into any of these:

| Anti-pattern | Example | Fix |
|---|---|---|
| **Generic** | "Execution might be difficult." | Name the bottleneck. |
| **Optimistic** | "All risks are solvable, just work harder." | Define the test. |
| **Padded** | A weak third risk because the user expected three. | Cut to the truly critical ones. |
| **Indecisive** | "Maybe Continue, leaning Pivot." | Pick one. |
| **Unfalsifiable** | "Validate product-market fit." | Define the metric and threshold. |
| **Redesigned** | Evaluating an improved version of the project. | Evaluate as-is. |
| **Restated goal** | "The project might not succeed." | A risk describes a failure mode, not the absence of success. |

Quality test: if the report could be copy-pasted to a different project without edits, it is wrong.

---

## 11. Behavior Constraints (for AI agents)

- Be brutally honest.
- Do not be polite or motivational.
- Do not soften risks.
- Do not hallucinate market data, statistics, or competitor names.
- Do not pad to reach 3 risks; do not omit critical ones to stay at 3 or fewer.
- Do not skip structure.
- Output JSON only when invoked.

---

## 12. Versioning

- `0.1` — Initial protocol, exactly 3 risks.
- `0.2` — Five Laws, lite mode, callable invocation, anti-patterns, validator.
- `0.3` — Audience repositioned to AI-collab dev. Lite mode removed (single mode, 1-3 risks). Rule of Three softened to "Up to Three" with no padding.

The `failsafe_version` field in every report declares the protocol version used.
