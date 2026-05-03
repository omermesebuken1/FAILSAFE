# FAILSAFE

> If it fails, why?

A 3-risk pre-mortem you run **before** you commit code, time, or money.

```
FAILSAFE = 3 risks  →  3 action maps  →  1 decision (Continue | Pivot | Kill)
```

Like SMART for goals or SOLID for code — a thinking primitive you can call by name.

---

## The Five Laws

1. **Rule of Three** — Exactly 3 risks. Not 2. Not 5. Force prioritization.
2. **Specificity** — Name a concrete failure mode. *"Might be hard"* is not a risk.
3. **Falsifiability** — Every solvable risk needs a test that can pass or fail.
4. **Honesty** — Optimize for survival, not optimism. Soften nothing.
5. **Decision** — End in **Continue**, **Pivot**, or **Kill**. No "maybe."

A FAILSAFE that breaks any law is invalid.

---

## Invocation

Any of these triggers it:

```
FAILSAFE [project]
Run FAILSAFE on [project]
FAILSAFE this: [project]
/failsafe [project]
```

Lightweight (1 risk, daily use):

```
FAILSAFE-lite [project]
```

The verb is the protocol. You should be able to say *"I FAILSAFE'd it"* and be understood.

---

## Output (Full Mode)

```json
{
  "failsafe_version": "0.2",
  "mode": "full",
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

## Output (Lite Mode)

```json
{
  "failsafe_version": "0.2",
  "mode": "lite",
  "project_summary": "...",
  "failure_risk": { "risk": "...", "minimum_test": "..." },
  "final_recommendation": "Continue | Pivot | Kill"
}
```

---

## Decision Logic

| State | Recommendation |
|---|---|
| All risks solvable with reasonable effort | **Continue** |
| ≥1 critical risk threatens the direction, core idea survives changes | **Pivot** |
| Core assumption invalid OR ≥2 risks unsolvable | **Kill** |

---

## Examples

| Domain | File |
|---|---|
| Startup | [`examples/startup-resume-builder.json`](examples/startup-resume-builder.json) |
| Software feature | [`examples/feature-realtime-collab.json`](examples/feature-realtime-collab.json) |
| Personal goal | [`examples/personal-novel.json`](examples/personal-novel.json) |
| Lite mode | [`examples/lite-novel.json`](examples/lite-novel.json) |

---

## Anti-Patterns

A bad FAILSAFE looks like:

- **Generic** — *"Execution might be difficult."* → name the bottleneck.
- **Optimistic** — *"All risks are solvable, just work harder."* → not a test.
- **Bloated** — 7 risks because you wanted to be thorough. → violates Rule of Three.
- **Indecisive** — *"Maybe Continue, leaning Pivot."* → pick one.
- **Unfalsifiable** — *"Validate product-market fit."* → define the metric and threshold.
- **Redesigned** — solving the project before evaluating it. → evaluate as-is.

If your FAILSAFE could be copy-pasted to any other project, it's wrong.

---

## Tooling

A zero-dependency Node CLI ships with the repo and as an npm package.

### Install FAILSAFE into any repo

```bash
npx failsafe-protocol init
```

Drops the protocol bundle into `.failsafe/` in the current directory:

```
.failsafe/
  FAILSAFE.md   ← canonical spec
  CLAUDE.md     ← AI agent instructions
  schema.json   ← output contract
```

Then wire it into your AI tool of choice:

| Tool | One-line setup |
|---|---|
| Claude Code | Add `@.failsafe/CLAUDE.md` to your `CLAUDE.md` |
| Cursor | Append `.failsafe/CLAUDE.md` contents to `.cursorrules` |
| Other agents | Include `.failsafe/CLAUDE.md` in the system prompt |

After that: `Run FAILSAFE on <project description>` produces a schema-valid report.

`init` is non-destructive — it only writes inside `.failsafe/` and skips existing files unless `--force` is passed.

### Lint a report

```bash
npx failsafe-protocol lint report.json
# or, from inside this repo:
node bin/failsafe.js lint examples/personal-novel.json
npm test                                       # run the full test suite
```

The linter enforces what `schema.json` cannot:

| Rule | Catches |
|---|---|
| `specificity-length` | Risk strings under 80 chars |
| `weasel` | "might be hard", "iterate until good", "validate PMF", "just work harder", etc. |
| `falsifiability` | `success_metric` / `failure_threshold` / `minimum_test` with no numeric or observable predicate |
| `independence` | Risks that share ≥50% non-stopword tokens (proxy for semantic overlap) |
| `rule-of-three` | Full-mode reports without exactly 3 risks |
| `structure` | Missing fields, wrong version, invalid mode |

On the bundled labeled set (4 valid examples + 6 anti-pattern fixtures), the linter scores **precision 1.00, recall 1.00** — well above the 0.85 bar set by the protocol's own pre-mortem.

## Files

| File | Purpose |
|---|---|
| `FAILSAFE.md` | Canonical spec |
| `CLAUDE.md` | Execution rules for AI agents |
| `schema.json` | Output contract (full + lite) |
| `examples/` | Reference reports |
| `bin/`, `src/` | Linter CLI |
| `test/` | Test suite + anti-pattern fixtures |

## Version

FAILSAFE v0.2
