# Directory Structure

```text
/
├── AGENTS.md                    # Master configuration
├── opencode.json                # OpenCode config (permissions, models, etc.)
├── package.json                 # npm project (Vite + TypeScript + PixiJS)
├── tsconfig.json                # TypeScript strict config
├── vite.config.ts               # Vite dev server + build
├── index.html                   # Entry point HTML
├── .opencode/                   # Agent definitions, commands, rules, docs
│   ├── agents/                  # 36 agent definitions
│   ├── commands/                # 77 commands
│   ├── rules/                   # 12 path-scoped coding standards
│   └── docs/
│       ├── pixijs-reference/    # PixiJS v8 version reference
│       └── ...
├── src/                         # Game source code (TypeScript)
│   ├── main.ts                  # Entry point
│   ├── core/                    # Engine-layer code (app init, ticker, config)
│   ├── gameplay/                # Game logic, systems, components
│   ├── ai/                      # NPC behavior (if applicable)
│   ├── networking/              # Multiplayer (if applicable)
│   ├── ui/                      # HUD, menus, overlays
│   ├── rendering/               # Custom shaders, post-processing
│   └── tools/                   # Dev tools, debug overlays
├── public/                      # Static assets served directly
├── assets/                      # Game assets (sprites, audio, data)
├── design/                      # GDDs, narrative docs, level designs
├── docs/                        # Technical documentation and ADRs
├── tests/                       # Test suites (Vitest)
├── prototypes/                  # Throwaway prototypes (isolated from src/)
└── production/                  # Sprint plans, milestones, release tracking
    ├── session-state/           # Ephemeral session state (active.md — gitignored)
    └── session-logs/            # Session audit trail (gitignored)
```
