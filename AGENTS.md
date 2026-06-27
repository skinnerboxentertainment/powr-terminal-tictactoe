# AutoMagically Built Games — Game Studio Agent Architecture

Indie game development managed through 36 coordinated [OpenCode](https://opencode.ai) agents.
Each agent owns a specific domain, enforcing separation of concerns and quality.
OpenCode orchestrates the studio — it runs the agents, executes the commands,
and powers `/auto-build` from spec to running build.

Forked from [AutoMagically](https://github.com/skinnerboxentertainment/AutoMagically)
(skinnerboxentertainment), originally derived from
[Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) by Donchitos.
Refactored with `/auto-build`, document analysis, custom architecture skills,
engine drift cleanup, and tool-agnostic commands. Targeting the browser as the primary platform.

## Model Tier Configuration

Configure your actual model IDs below. The tiers abstract agent assignments
from concrete models so you can switch providers without editing 35 files.

- **opencode-go/deepseek-v4-pro** → `opencode-go/deepseek-v4-pro` — high-reasoning for planning, architecture, phase gates
- **opencode-go/deepseek-v4-flash** → `opencode-go/deepseek-v4-flash` — workhorse for implementation, code review, design authoring
- **opencode-go/deepseek-v4-flash** → `opencode-go/deepseek-v4-flash` — cheap lookups, status checks, simple tasks

Set in `opencode.json`:
```json
{
  "model": "opencode-go/deepseek-v4-pro",
  "small_model": "opencode-go/deepseek-v4-flash"
}
```

## Agents (36)

Defined in `.opencode/agents/` as markdown files with YAML frontmatter.
- **Tier 1 — Directors** (opencode-go/deepseek-v4-pro): creative-director, technical-director, producer
- **Tier 2 — Leads** (opencode-go/deepseek-v4-flash): game-designer, lead-programmer, art-director, audio-director, narrative-director, qa-lead, release-manager, localization-lead
- **Tier 3 — Specialists** (opencode-go/deepseek-v4-flash/Flash): gameplay-programmer, engine-programmer, ai-programmer, pixijs-specialist, etc.

Invoke agents with `@agent-name` in your message.

## Commands (77)

All commands are in `.opencode/commands/`.
Type `/command-name` in the TUI to use them:
- `/auto-build` — Generate a complete working build from a text spec
- `/start` — First-time onboarding
- `/brainstorm` — Explore game ideas
- `/setup-engine` — Configure engine
- `/design-system` — Write a GDD
- `/create-epics` — Map systems to epics
- `/dev-story` — Implement a story
- etc.

## Rules (12)

Path-scoped coding standards in `.opencode/rules/`. Loaded via `instructions` in `opencode.json`.
When applying rules, check the file path and apply the matching rule:

| Path | Rule File |
|------|-----------|
| `src/gameplay/**` | `.opencode/rules/gameplay-code.md` |
| `src/core/**` (engine) | `.opencode/rules/engine-code.md` |
| `src/ai/**` | `.opencode/rules/ai-code.md` |
| `src/networking/**` | `.opencode/rules/network-code.md` |
| `src/ui/**` | `.opencode/rules/ui-code.md` |
| `src/rendering/**` (shaders) | `.opencode/rules/shader-code.md` |
| `src/**` (general web) | `.opencode/rules/web-code.md` |
| `assets/**` | `.opencode/rules/data-files.md` |
| `design/gdd/**` | `.opencode/rules/design-docs.md` |
| `design/narrative/**` | `.opencode/rules/narrative.md` |
| `tests/**` | `.opencode/rules/test-standards.md` |
| `prototypes/**` | `.opencode/rules/prototype-code.md` |

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

## Technology Stack

Configured in `.opencode/docs/technical-preferences.md`:
- **Renderer**: PixiJS v8 (WebGL2/WebGPU/Canvas)
- **Language**: TypeScript (strict)
- **Build**: Vite + tsc
- **Testing**: Vitest
- **Physics**: Matter.js (optional)
- **Audio**: Howler.js (optional)

> Skills installed: 26 PixiJS v8 reference skills + 4 project architecture skills (`automagically-game-architecture`, `automagically-testing`, `automagically-audio`, `automagically-assets-and-build`) + 7 process skills (`diagnosing-bugs`, `prototype`, `tdd`, `writing-great-skills`, `grill-with-docs`, `handoff`, `improve-codebase-architecture`) + `playwright-best-practices`

## Project Structure

@.opencode/docs/directory-structure.md

## Technical Preferences

@.opencode/docs/technical-preferences.md

## Coordination Rules

@.opencode/docs/coordination-rules.md

## Context Management

@.opencode/docs/context-management.md

## Hook Instructions

CCGS hooks are not directly supported in OpenCode. Instead:
- **Pre-commit validation**: Run `/validate-commit` before committing
- **Asset validation**: Run `/validate-assets` after changing asset files
- **Pre-push check**: Run `/validate-push` before pushing
- Session state: Update `production/session-state/active.md` when starting/stopping work

## First Session?

If you have a game idea, type `/auto-build "your game description"` to get a running build immediately.
If you have no idea yet, type `/start` for guided onboarding.

