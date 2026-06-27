# OpenCode PixiJS Game Studio -- Game Studio Agent Architecture

Indie game development managed through 36 coordinated OpenCode agents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

## Technology Stack

- **Renderer**: PixiJS v8 (WebGL2/WebGPU/Canvas)
- **Language**: TypeScript (strict)
- **Build**: Vite + tsc
- **Testing**: Vitest
- **Physics**: Matter.js (optional)
- **Audio**: Howler.js (optional)
- **Version Control**: Git with trunk-based development

## Project Structure

@.opencode/docs/directory-structure.md

## PixiJS Version Reference

@.opencode/docs/pixijs-reference/VERSION.md

## Technical Preferences

@.opencode/docs/technical-preferences.md

## Coordination Rules

@.opencode/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** If the project has no engine configured and no game concept,
> run `/start` to begin the guided onboarding flow.

## Coding Standards

@.opencode/docs/coding-standards.md

## Context Management

@.opencode/docs/context-management.md
