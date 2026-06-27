---
description: "Pre-commit validation check. Verifies code compiles, tests pass, and no hardcoded values or TODOs are present. Run before every commit."
agent: build
---

# Validate Commit

Check the following before committing:

1. **TypeScript**: Run `npx tsc --noEmit` — zero errors required
2. **Tests**: Run `npx vitest run` — all tests must pass
3. **Hardcoded values**: Grep `src/gameplay/` for magic numbers not read from config —
   all tunable values should come from `assets/data/gameplay-config.json`
4. **TODOs**: Check for stale `TODO:` comments that should be resolved before commit
5. **Build**: Run `npx vite build` — must succeed

If any check fails, fix the issue before committing.
