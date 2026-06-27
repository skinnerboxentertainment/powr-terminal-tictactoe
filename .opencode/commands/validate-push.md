---
description: "Pre-push validation check. Verifies branch state, CI status, and changelog before pushing to remote."
agent: build
---

# Validate Push

Check the following before pushing:

1. **Local branch**: Ensure you're on the correct branch (`master` for release, feature branch for development)
2. **Uncommitted changes**: Run `git status` — no uncommitted work
3. **CI status**: If pushing to `master`, verify the latest CI run on your branch passes
   (check GitHub Actions or run `npx tsc --noEmit && npx vitest run` locally)
4. **Changelog**: If this push includes user-facing changes, verify `CHANGELOG.md` is updated
5. **Tag**: If this is a release push, verify the version tag matches `package.json`
