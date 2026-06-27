---
description: Generate TypeScript test helper libraries for the project's Vitest test suite. Reads existing test patterns and produces tests/helpers/ with assertion utilities, factory functions, and mock objects tailored to the project's systems. Reduces boilerplate in new test files.
agent: build
---

# Test Helpers

Writing test cases is faster and more consistent when common setup, teardown,
and assertion patterns are abstracted into helpers. This skill generates a
`tests/helpers/` library tailored to the project's actual engine, language,
and systems — so every developer writes less boilerplate and more assertions.

**Output:** `tests/helpers/` directory with engine-specific helper files

**When to run:**
- After `/test-setup` scaffolds the framework (first time)
- When multiple test files repeat the same setup boilerplate
- When starting to write tests for a new system

---

## 1. Parse Arguments

**Modes:**
- `/test-helpers [system-name]` — generate helpers for a specific system
  (e.g., `/test-helpers combat`)
- `/test-helpers all` — generate helpers for all systems with test files
- `/test-helpers scaffold` — generate only the base helper library (no
  system-specific helpers); use this on first run
- No argument — run `scaffold` if no helpers exist, else `all`

---

## 2. Detect Stack

Read `.opencode/docs/technical-preferences.md` and extract:
- `Engine:` value
- `Language:` value
- `Framework:` from the Testing section

---

## 3. Load Existing Test Patterns

Scan the test directory for patterns already in use:

```
Glob pattern="tests/**/*_test.*" (all test files)
```

For a representative sample (up to 5 files), read the test files and extract:
- Setup patterns (how `before_each` / `setUp` / fixtures are written)
- Common assertion patterns (what is being asserted most often)
- Object creation patterns (how game objects or scenes are instantiated in tests)
- Mock/stub patterns (how dependencies are replaced)

This ensures generated helpers match the project's existing style, not a
generic template.

Also read:
- `design/gdd/systems-index.md` — to know which systems exist
- In-scope GDD(s) — to understand what data types and values need testing
- `docs/architecture/tr-registry.yaml` — to map requirements to tested systems

---

## 4. Generate Engine-Specific Helpers

### TypeScript (Vitest)

**Base helper** (`tests/helpers/game-assertions.ts`):

```typescript
import { expect } from "vitest"

export function expectInRange(value: number, min: number, max: number, label = "value") {
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}

export function expectNonNullable<T>(value: T | null | undefined, label = "value"): asserts value is T {
  expect(value, `Expected ${label} to be non-nullable`).not.toBeNull()
  expect(value, `Expected ${label} to be non-nullable`).not.toBeUndefined()
}
```

**Factory helper** (`tests/helpers/factories.ts`):

```typescript
import { HealthComponent } from "../../src/gameplay/health-component"

export function createHealth(overrides?: Partial<Pick<HealthComponent, "maxHealth" | "currentHealth">>) {
  const health = new HealthComponent()
  health.maxHealth = overrides?.maxHealth ?? 100
  health.currentHealth = overrides?.currentHealth ?? health.maxHealth
  return health
}
```

**Mock helper** (`tests/helpers/mocks.ts`):

```typescript
import { vi } from "vitest"

export function createMockEventBus() {
  const handlers: Record<string, (...args: unknown[]) => void> = {}
  return {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => { handlers[event] = handler }),
    off: vi.fn((event: string) => { delete handlers[event] }),
    emit: vi.fn((event: string, ...args: unknown[]) => handlers[event]?.(...args)),
  }
}
```

---

## 5. Generate System-Specific Helpers

For `[system-name]` or `all` modes, generate a helper per system:

Read the system's GDD to extract:
- Data types (entity types, component names)
- Formula variables and their bounds
- Common test scenarios mentioned in Edge Cases

Generate `tests/helpers/[system]-factory.ts` with factory functions
specific to that system's objects.

Example pattern for a `combat` system (TypeScript):

```typescript
import { createHealth } from "./factories"

export function createAttacker(attack = 10, critChance = 0) {
  return { attack, critChance }
}

export function createTarget(defense = 0, health = 100) {
  return { entity: createHealth({ maxHealth: health, currentHealth: health }), defense }
}
```

---

## 6. Write Output

Present a summary of what will be created:

```
## Test Helpers to Create

Base helpers (Vitest / TypeScript):
- tests/helpers/game-assertions.ts
- tests/helpers/factories.ts
- tests/helpers/mocks.ts

System helpers ([mode]):
- tests/helpers/[system]-factory.ts  ← from [system] GDD
```

Ask: "May I write these helper files to `tests/helpers/`?"

**Never overwrite existing files.** If a file already exists, report:
"Skipping `[path]` — already exists. Remove the file manually if you want it
regenerated."

After writing: Verdict: **COMPLETE** — helper files created.

"Helper files created. To use them in a test:
```typescript
import { expectInRange } from "../tests/helpers/game-assertions"
import { createHealth } from "../tests/helpers/factories"
```"

---

## Collaborative Protocol

- **Never overwrite existing helpers** — they may contain hand-written
  customisations. Only generate new files that don't exist yet
- **Generated code is a starting point** — the generated factory functions use
  metadata patterns for simplicity; adapt to the actual class structure once
  the code exists
- **Helpers should reflect the GDD** — bounds and constants in helpers should
  trace to GDD Formulas sections, not invented values
- **Ask before writing** — always confirm before creating files in `tests/`

## Next Steps

- Run `/test-setup` if the test framework has not been scaffolded yet.
- Use `/dev-story` to implement stories — helpers reduce boilerplate in new test files.
- Run `/skill-test` to validate other skills that may need helper coverage.
