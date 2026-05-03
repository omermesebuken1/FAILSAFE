# FAILSAFE — Canonical Specification

**Version:** 0.2
**One-liner:** *If it fails, why?*

FAILSAFE is a thinking primitive: a 3-risk pre-mortem ending in a binding decision. It is invoked by name, executes in seconds, and produces a strict, machine-readable report.

---

## 1. Core

```
FAILSAFE = 3 risks  →  3 action maps  →  1 decision
```

- **3 risks** — the most likely reasons this fails.
- **3 action maps** — for each solvable risk, the smallest test that resolves it.
- **1 decision** — Continue, Pivot, or Kill.

That is the entire protocol.

---

## 2. The Five Laws

A FAILSAFE is **valid** only if it obeys all five.

### Law 1 — Rule of Three
Exactly 3 risks. Force prioritization. More risks dilute. Fewer skip critical failure modes.

### Law 2 — Specificity
A risk must name a concrete failure mode in this project's terms. If the risk could be copy-pasted to a different project, it is invalid.

### Law 3 — Falsifiability
Every solvable risk must include a test that can produce a clear pass or fail with a defined success metric and failure threshold.

### Law 4 — Honesty
Optimize for survival, not optimism. Do not soften, hedge, or motivate. State failure modes plainly.

### Law 5 — Decision
Every FAILSAFE ends in exactly one of: **Continue**, **Pivot**, **Kill**. "Maybe" is not a decision.

---

## 3. Modes

### 3.1 Full Mode (default)

3 risks, full action maps, used for go/no-go decisions on meaningful commitments (launches, hires, multi-week features, business pivots).

### 3.2 Lite Mode

1 risk, 1 minimum test, 1 decision. Used for daily decisions: a feature you're about to spec, a side project you're about to start, a habit you're about to commit to.

Lite mode preserves Laws 2–5. It relaxes Law 1 to "Rule of One" by design.

---

## 4. Invocation

Any of these forms invokes the protocol:

```
FAILSAFE <project>
Run FAILSAFE on <project>
FAILSAFE this: <project>
/failsafe <project>
```

Lite mode:

```
FAILSAFE-lite <project>
/failsafe-lite <project>
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
| All 3 risks solvable with reasonable effort | **Continue** |
| ≥1 critical risk threatens the direction, but the core idea survives changes | **Pivot** |
| Core assumption invalid OR ≥2 risks unsolvable | **Kill** |

---

## 9. Output Contract

Output is JSON only, conforming to `schema.json`. No prose before or after.

### 9.1 Full Mode

```json
{
  "failsafe_version": "0.2",
  "mode": "full",
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

### 9.2 Lite Mode

```json
{
  "failsafe_version": "0.2",
  "mode": "lite",
  "project_summary": "",
  "failure_risk": {
    "risk": "",
    "root_cause_type": "Concept | Execution | Environment",
    "minimum_test": ""
  },
  "final_recommendation": "Continue | Pivot | Kill"
}
```

---

## 10. Anti-Patterns

A FAILSAFE is **invalid** if it falls into any of these:

| Anti-pattern | Example | Fix |
|---|---|---|
| **Generic** | "Execution might be difficult." | Name the bottleneck. |
| **Optimistic** | "All risks are solvable, just work harder." | Define the test. |
| **Bloated** | 7 risks. | Cut to 3. |
| **Indecisive** | "Maybe Continue, leaning Pivot." | Pick one. |
| **Unfalsifiable** | "Validate product-market fit." | Define the metric and threshold. |
| **Redesigned** | Evaluating an improved version of the project. | Evaluate as-is. |
| **Padding** | Restating the project as a "risk." | Risk must describe a failure mode, not the goal. |

Quality test: if the report could be copy-pasted to a different project without edits, it is wrong.

---

## 11. Behavior Constraints (for AI agents)

- Be brutally honest.
- Do not be polite or motivational.
- Do not soften risks.
- Do not hallucinate market data, statistics, or competitor names.
- Do not add extra risks beyond the count required by mode.
- Do not skip structure.
- Output JSON only when invoked.

---

## 12. Versioning

- `0.1` — Initial protocol (full mode only).
- `0.2` — Added Five Laws, Lite Mode, formal anti-patterns, callable invocation syntax.

The `failsafe_version` field in the output declares the protocol version used.
