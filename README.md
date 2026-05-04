# FAILSAFE

> If this fails, why?

An anti-failure pre-mortem you run **with your AI pair** before (or during) building something.

```
FAILSAFE = up to 3 critical risks  →  action map per solvable risk  →  1 decision
```

Built for the developer working alongside Claude, Codex, or any agentic AI. You invoke it by name. The agent does the rest.

---

## The Five Laws

1. **Up to Three** — produce 1 to 3 critical risks. No padding to reach 3. No omission to stay under it.
2. **Specificity** — name a concrete failure mode in this project's terms. *"Might be hard"* is not a risk.
3. **Falsifiability** — every solvable risk needs a test that can pass or fail.
4. **Honesty** — optimize for survival, not optimism. Soften nothing.
5. **Decision** — end in **Continue**, **Pivot**, or **Kill**. No "maybe."

A FAILSAFE that breaks any law is invalid.

---

## Quickstart

### Option A — Drop the skill into your AI tool

Pick the line that matches your setup; one-off command, no install.

```bash
# Claude Code (project-level skill)
npx failsafe-protocol init --claude

# Codex
npx failsafe-protocol init --codex

# Cursor
npx failsafe-protocol init --cursor

# All three at once
npx failsafe-protocol init --all
```

This drops `.failsafe/` into your repo and wires the protocol into the AI surface(s) you picked. Then say:

```
Run FAILSAFE on <one-line project description>
```

The agent returns a strict JSON report.

### Option B — Use it without installing anything

Copy [`skill.md`](skill.md) into your AI tool's instruction file. That's the entire setup.

| Tool | Where to drop `skill.md` |
|---|---|
| Claude Code | `.claude/skills/failsafe.md` |
| Codex | Append contents to `AGENTS.md` |
| Cursor | Append contents to `.cursorrules` |
| Custom GPT / system prompt | Paste contents into the system prompt |

---

## Invocation

Any of these triggers it:

```
FAILSAFE <project>
Run FAILSAFE on <project>
FAILSAFE this: <project>
/failsafe <project>
```

The protocol name is the verb. *"I FAILSAFE'd it"* is valid usage.

---

## Output Contract

```json
{
  "failsafe_version": "0.3",
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

`failure_risks` contains 1 to 3 items. If a risk is `solvable: false`, the `action_map` fields are empty strings and `solver` is `"None"`.

---

## Decision Logic

| State | Recommendation |
|---|---|
| All risks solvable with reasonable effort | **Continue** |
| ≥1 critical risk threatens the direction, core idea survives changes | **Pivot** |
| Core assumption invalid OR ≥2 risks unsolvable | **Kill** |

---

## Examples

| Domain | File | Risks | Decision |
|---|---|---|---|
| SaaS startup | [`examples/startup-resume-builder.json`](examples/startup-resume-builder.json) | 3 | Pivot |
| Product feature | [`examples/feature-realtime-collab.json`](examples/feature-realtime-collab.json) | 3 | Pivot |
| Solo dev project (AI-collab) | [`examples/extension-tab-summarizer.json`](examples/extension-tab-summarizer.json) | 2 | Pivot |

The 2-risk example demonstrates the *no padding* rule: only two risks were truly critical, so only two are listed.

---

## Anti-Patterns

A bad FAILSAFE looks like:

- **Generic** — *"Execution might be difficult."* → name the bottleneck.
- **Optimistic** — *"All risks are solvable, just work harder."* → not a test.
- **Padded** — a weak third risk to reach 3. → cut to the truly critical ones.
- **Indecisive** — *"Maybe Continue, leaning Pivot."* → pick one.
- **Unfalsifiable** — *"Validate product-market fit."* → define the metric and threshold.
- **Redesigned** — solving the project before evaluating it. → evaluate as-is.

If your FAILSAFE could be copy-pasted to any other project, it's wrong.

---

## Tooling (power users)

A zero-dependency Node CLI ships with the package.

```bash
npx failsafe-protocol lint <report.json>...   # lint one or more reports
npx failsafe-protocol init --all              # scaffold every supported surface
```

The linter enforces what `schema.json` cannot:

| Rule | Catches |
|---|---|
| `risk-count` | Reports outside the 1–3 risk range |
| `specificity-length` | Risk strings under 80 chars |
| `weasel` | "might be hard", "iterate until good", "validate PMF", "just work harder", etc. |
| `falsifiability` | `success_metric` / `failure_threshold` with no numeric or observable predicate |
| `independence` | Risks that share ≥50% non-stopword tokens |
| `structure` | Missing fields, wrong version, malformed report |

On the bundled labeled set (3 valid examples + 6 anti-pattern fixtures), the linter scores **precision 1.00, recall 1.00**.

---

## Files

| File | Purpose |
|---|---|
| `FAILSAFE.md` | Canonical spec |
| `CLAUDE.md` | Execution rules for AI agents |
| `skill.md` | Drop-in skill file with frontmatter |
| `schema.json` | Output contract |
| `examples/` | Reference reports |
| `bin/`, `src/` | CLI (init, lint) |
| `test/` | Test suite + anti-pattern fixtures |

## License

MIT — see [`LICENSE`](LICENSE).

## Version

FAILSAFE v0.3
