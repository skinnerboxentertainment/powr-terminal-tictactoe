# Shared Protocols

> Referenced by commands via `@.opencode/docs/shared-protocols.md`.
> These are canonical protocols. Commands may add file-specific rules
> (scoped to their domain) but must not redefine these base protocols.

---

## Error Recovery Protocol

If any spawned agent (via Task) returns BLOCKED, errors, or cannot complete:

1. **Surface immediately** — Report `[AgentName]: BLOCKED — [reason]` to the user before continuing to dependent phases
2. **Assess dependencies** — Check whether the blocked agent's output is required by subsequent phases. If yes, do not proceed past that dependency point without user input.
3. **Offer options** via a question widget:
   - Skip this agent and note the gap in the final report
   - Retry with narrower scope
   - Stop here and resolve the blocker first
4. **Always produce a partial report** — output whatever was completed. Never discard work because one agent blocked.

### Common blockers

```
- Input file missing → redirect to the command that creates it
- ADR status is Proposed → do not implement; run /architecture-decision first
- Scope too large → split via /create-stories
- Conflicting instructions between ADR and story → surface the conflict, do not guess
```

---

## File Write Protocol

All file writes in team or pipeline commands are delegated to sub-agents spawned via Task. Each sub-agent enforces the **"May I write to [path]?"** protocol individually. This orchestrator does not write files directly.

Rule: **never overwrite existing files without explicit approval.** If a file already exists, report the path and ask before modifying.

---

## Collaborative Protocol Base

1. **Read silently** — complete analysis before presenting findings
2. **Show before write** — always display the content that will be written before requesting approval
3. **Ask before write** — use a question widget for write approval, not plain text. Multi-file changesets must list every file and what changes, then ask once
4. **Offer, don't force** — findings and verdicts are advisory; the user decides
5. **Never auto-generate without approval** — present drafts, get sign-off, then write
6. **Non-blocking** — verdicts are recommendations. Document risks and let the user decide
