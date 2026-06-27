<p align="center">
  <h1 align="center">AutoMagically</h1>
  <p align="center">
    <em>PixiJS v8 + TypeScript browser game studio for OpenCode</em>
    <br />
    Describe a game. Get a running build. Iterate.
    <br />
    36 agents. 77 commands. PixiJS v8 rendering.
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href=".opencode/agents"><img src="https://img.shields.io/badge/agents-36-blueviolet" alt="36 Agents"></a>
  <a href=".opencode/commands"><img src="https://img.shields.io/badge/commands-77-green" alt="77 Commands"></a>
  <a href=".opencode/rules"><img src="https://img.shields.io/badge/rules-12-red" alt="12 Rules"></a>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/built%20for-OpenCode-f5f5f5" alt="Built for OpenCode"></a>
</p>

---

## Two Ways to Use

### 🚀 Auto-Build — Fast

Describe your game in a sentence. Get a working build.

```bash
/auto-build "2D platformer where you collect gems and jump on enemies"
```

The command:
1. Parses your spec (genre, mechanics, theme, tone)
2. Matches it to a genre pattern (platformer, top-down, shmup, runner, puzzle, or minimal)
3. Generates complete scaffold: core engine, gameplay, scenes, audio, tests, assets
4. Verifies with `tsc --noEmit` and `vitest run`
5. Asks once: write to disk?

Zero intermediate questions. One command to a running build.

### 🧭 Guided Setup — Thorough

Start with a question and work through the full production pipeline:

```bash
/start
```

Guides you through concept → systems design → architecture → pre-production →
production → polish → release. 36 specialized agents handle design, art, audio,
QA, narrative, and production as you go.

---

## What's Included

| Category | Count | Description |
|----------|-------|-------------|
| **Agents** | 36 | Specialized agents across design, programming, art, audio, narrative, QA, and production |
| **Commands** | 77 | Commands for every workflow phase (`/auto-build`, `/start`, `/design-system`, `/dev-story`, etc.) |
| **Rules** | 12 | Path-scoped coding standards enforced per file path |
| **Templates** | 41 | Document templates for GDDs, UX specs, ADRs, sprint plans, HUD design, accessibility, and more |
| **Skills** | 34 | Installed AI skills: 26 PixiJS v8 reference skills + 4 project architecture skills + 4 process skills |

## Studio Hierarchy

Agents are organized into three tiers:

```
Tier 1 — Directors
  creative-director    technical-director    producer

Tier 2 — Department Leads
  game-designer        lead-programmer       art-director
  audio-director       narrative-director    qa-lead
  release-manager      localization-lead

Tier 3 — Specialists
  gameplay-programmer  engine-programmer     ai-programmer
  network-programmer   tools-programmer      ui-programmer
  systems-designer     level-designer        economy-designer
  technical-artist     sound-designer        writer
  world-builder        ux-designer           prototyper
  performance-analyst  devops-engineer       analytics-engineer
  security-engineer    qa-tester             accessibility-specialist
  live-ops-designer    community-manager     pixijs-specialist
```

## Commands

Type `/` in OpenCode to access all 77 commands:

**Auto-Build**
`/auto-build`

**Onboarding & Navigation**
`/start` `/help` `/project-stage-detect` `/setup-engine` `/adopt`

**Game Design**
`/brainstorm` `/map-systems` `/design-system` `/quick-design` `/review-all-gdds` `/propagate-design-change`

**Art & Assets**
`/art-bible` `/asset-spec` `/asset-audit`

**UX & Interface Design**
`/ux-design` `/ux-review`

**Architecture**
`/create-architecture` `/architecture-decision` `/architecture-review` `/create-control-manifest`

**Stories & Sprints**
`/create-epics` `/create-stories` `/dev-story` `/sprint-plan` `/sprint-status` `/story-readiness` `/story-done` `/estimate`

**Reviews & Analysis**
`/design-review` `/code-review` `/balance-check` `/content-audit` `/scope-check` `/perf-profile` `/tech-debt` `/gate-check` `/consistency-check` `/security-audit`

**QA & Testing**
`/qa-plan` `/smoke-check` `/soak-test` `/regression-suite` `/test-setup` `/test-helpers` `/test-evidence-review` `/test-flakiness` `/skill-test` `/skill-improve`

**Production**
`/milestone-review` `/retrospective` `/bug-report` `/bug-triage` `/reverse-document` `/playtest-report`

**Release**
`/release-checklist` `/launch-checklist` `/changelog` `/patch-notes` `/hotfix` `/day-one-patch`

**Creative & Content**
`/prototype` `/onboard` `/localize`

**Team Orchestration**
`/team-combat` `/team-narrative` `/team-ui` `/team-release` `/team-polish` `/team-audio` `/team-level` `/team-live-ops` `/team-qa`

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [OpenCode](https://opencode.ai) (`npm install -g opencode-ai`)
- [Node.js](https://nodejs.org/) 18+

### Setup

```bash
git clone <repo-url> my-game
cd my-game
npm install
npm run dev              # http://localhost:5173
```

OpenCode session:

```bash
opencode
```

### Quick Start

**Have an idea?**
```
/auto-build "2D top-down survival game where you fight zombies at night"
```
One command. Running build. Iterate from there.

**No idea yet?**
```
/start
```
Guided onboarding. Discovers what you need, routes you to the right workflow.

## Project Structure

```
AGENTS.md                           # Master configuration
opencode.json                       # OpenCode config (permissions, models, etc.)
.opencode/
  agents/                           # 36 agent definitions
  commands/                         # 77 commands (one .md per command)
  rules/                            # 12 path-scoped coding standards
  skills/                           # 4 project-specific architecture skills
  docs/
    pixijs-reference/               # PixiJS v8 version reference
    workflow-catalog.yaml           # 7-phase pipeline definition
    templates/                      # 41 document templates
    shared-protocols.md             # Canonical error recovery, file write, collaboration
    genre-patterns/                 # 6 genre patterns for /auto-build
.agents/skills/                     # 34 installed AI skills
src/                                # Game source code (TypeScript)
assets/                             # Art, audio, VFX, shaders, data files
design/                             # GDDs, narrative docs, level designs
docs/                               # Technical documentation and ADRs
tests/                              # Test suites (Vitest)
prototypes/                         # Throwaway prototypes (isolated from src/)
production/                         # Sprint plans, milestones, release tracking
public/                             # Static assets (HTML, favicon, etc.)
```

## Customization

- **Add/remove agents** — delete or create agent files in `.opencode/agents/`
- **Add genre patterns** — create `.opencode/docs/genre-patterns/[name].md` — `/auto-build` discovers them automatically
- **Add rules** — create path-scoped rule files in `.opencode/rules/`
- **Pick your tech stack** — PixiJS v8 + Howler.js pre-configured; add Matter.js, etc.
- **Set review intensity** — `full`, `lean`, or `solo` via `/start` or `production/review-mode.txt`

## Platform Support

Primary development and testing on **Windows 11** with PowerShell 7+.
OpenCode is cross-platform (Windows, macOS, Linux).

## License

MIT License. See [LICENSE](LICENSE) for details.

---

*Built for [OpenCode](https://opencode.ai).*

Derived from [OpenCode PixiJS Game Studio](https://github.com/skinnerboxentertainment/AutoMagically)
by skinnerboxentertainment, which was itself derived from
[Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) by Donchitos.
