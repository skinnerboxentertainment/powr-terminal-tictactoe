---
description: "Auto-build a game from a spec. Reads a game description, matches the genre to a pattern, generates complete scaffold (core engine + gameplay + tests + audio + assets), verifies with tsc and vitest, then writes to disk on approval. Zero intermediate questions — one gate at the end."
agent: build
---

# Auto-Build

This command bypasses the normal collaborative protocol. It reads a game spec,
generates a complete working build, and asks exactly one question at the end.

**Usage:** `/auto-build <game description>`
Example: `/auto-build 2D platformer where you collect gems and avoid spikes`

---

## Phase 1: Parse Spec

Parse the user's game description into a structured spec object. Extract:

| Field | Extract from text | Default if missing |
|-------|-------------------|--------------------|
| Genre | platformer, top-down, shmup, runner, puzzle | minimal |
| Core mechanic | jump, shoot, collect, match, dodge | move around |
| Theme | forest, space, dungeon, city | generic |
| Tone | dark, moody, bright, casual, horror | neutral |
| Player description | character details | unnamed character |
| Win condition | reach end, survive, score target | none (free-roam) |
| Has enemies | yes / no | yes (if genre has them) |

If the genre is not one of the five named patterns, fall back to `minimal`.

---

## Phase 2: Load Patterns and Rules

1. **Read genre pattern**: `.opencode/templates/genre-patterns/[genre].md`
   - Extract player parameters, world layout, objects, camera, audio, test strategy
   - If genre is unknown, read `minimal.md`

2. **Read architecture rules**: `.opencode/skills/automagically-game-architecture/SKILL.md`
   - State ownership, scene lifecycle, update loop, input handling, composition model
   - Every generated file must conform to these rules

3. **Read test rules**: `.opencode/skills/automagically-testing/SKILL.md`
   - Testing pyramid, deterministic clocks, seeded RNG
   - Every generated test must follow these patterns

4. **Read audio rules**: `.opencode/skills/automagically-audio/SKILL.md`
   - AudioManager interface, Howler usage, scene cleanup
   - Every generated audio call must use these patterns

5. **Read asset rules**: `.opencode/skills/automagically-assets-and-build/SKILL.md`
   - PixiJS Assets bundles, manifest format, import convention
   - Every generated asset reference must use these patterns

---

## Phase 3: Generate Scaffold

Generate all files in this order. Each file must conform to the architecture,
testing, audio, and asset rules loaded in Phase 2.

### Core (always generated)

```
src/main.ts
```
- PixiJS v8 `Application` init with `app.init({ resizeTo: window })`
- Append canvas to `document.body`
- Init `InputManager` after first user gesture
- Create `SceneManager`, push `BootScene`
- `app.ticker.add((ticker) => gameLoop.update(ticker.deltaTime))`

```typescript
// src/core/scene-manager.ts
```
- Stack-based: `push(scene)`, `pop()`, `replace(scene)`
- `update(dt)` calls current scene only
- `enter()` on push, `exit()` on pop

```typescript
// src/core/input-manager.ts
```
- Captures keyboard state (`keys: Set<string>`, `keysJustPressed: Set<string>`)
- Mouse position + button state
- `update()` called once per frame before scene update
- Clears on blur (focus loss)

```typescript
// src/core/game-loop.ts
```
- Calls `inputManager.update()` then `sceneManager.update(dt)`
- Exports `dt` for use by systems

```typescript
// src/core/types.ts
```
- `Scene` interface: `enter(): void`, `update(dt: number): void`, `exit(): void`

### Scenes (always generated)

```
src/scenes/boot-scene.ts
```
- Minimal loading screen (text centered: "Loading...")
- `Assets.init({ manifest: "assets/manifest.json" })` on enter
- Load first scene's bundle
- Push `GameScene` when done

```
src/scenes/game-scene.ts
```
- Creates gameplay objects from genre pattern
- Delegates update to player, enemies, systems
- Handles game-over transition

### Gameplay (genre-dependent)

Generate the files listed in the genre pattern's `## Generated Files` section.
Each file must:
- Use the Scene interface and types from `src/core/types.ts`
- Read input from `InputManager` (never register DOM listeners)
- Keep state on plain classes (never on Sprite/Container properties)
- Use delta time for all movement
- Use seeded RNG from `src/utils/rng.ts` for any randomness

### Audio (interface + stub implementation)

```typescript
// src/audio/audio-manager.interface.ts
```
- `IAudioManager` interface with: `init()`, `playMusic(key)`, `playSfx(key)`,
  `stopAll()`, `setMusicVolume(v)`, `setSfxVolume(v)`, `mute()`, `unmute()`
- Generate the exact interface from the audio skill

```typescript
// src/audio/audio-manager.ts
```
- Implements `IAudioManager` with Howler.js stubs
- `init()`: mark as ready after first call (no actual Howl init yet — placeholder assets)
- `playSfx`/`playMusic`: log to console with the key name
- `stopAll()`: stop all active sounds
- Wrap in `// TODO: Replace stubs with real Howl instances when audio assets are added`

### Utilities (always generated)

```
src/utils/rng.ts
```
- Seeded PRNG (mulberry32 or similar)
- `createRng(seed: number): { next(): number, nextInt(min, max): number }`

### Tests (always generated)

```
tests/helpers/fake-clock.ts
```
- `FakeClock` class: `time`, `advance(ms)`, `reset()`

```
tests/helpers/seeded-rng.ts
```
- Same PRNG as `src/utils/rng.ts` for deterministic testing

```
tests/unit/core/scene-manager.test.ts
```
- Scene lifecycle: push calls enter, pop calls exit, replace swaps
- Current scene receives updates

```
tests/unit/core/input-manager.test.ts
```
- Keys captured on keydown, released on keyup, cleared on blur

Generate genre-specific tests from the pattern's `## Generated Files`.
Each test must:
- Use Vitest (`describe`, `it`, `expect`)
- Use `FakeClock` for time-dependent assertions
- Use `seeded-rng` for any randomness
- Test state logic, not pixels

```
tests/browser/startup.test.ts
```
- Playwright test: load page, wait for canvas, assert visible

### Assets

```
assets/manifest.json
```
- PixiJS v8 manifest format
- Bundle `core` with shared assets (empty for now — placeholder)
- Bundle per scene name from genre pattern

---

## Phase 4: Verify

After generating all file content (but before writing to disk):

1. **Dry-run check**: Parse all generated TypeScript for structural issues:
   - Import paths resolve correctly
   - No circular imports (`core` → `gameplay` → `core`)
   - No direct DOM event listeners in scenes
   - No state on display objects
   - No `any` type (strict mode)

2. **Write all files to disk**

3. **Run `npx tsc --noEmit`**:
   - If PASS → proceed
   - If FAIL → read the error output, fix all errors, re-run. Repeat up to 3 attempts.
   - If still FAIL after 3 attempts → report the failure and offer: retry, simplify, or cancel

4. **Run `npx vitest run`**:
   - If PASS → proceed
   - If FAIL → read the error output, fix all failing tests, re-run. Repeat up to 3 attempts.
   - If still FAIL after 3 attempts → report the failures and offer: retry, skip tests, or cancel

---

## Phase 5: Gate

Present the result with exactly one question:

```
## Build Complete

**Genre:** [genre]
**Files created:** [count]
**tsc:** PASS
**vitest:** [PASS / SKIPPED]

[A] Write to disk — save all files and confirm build
[B] Show summary — list every file and its purpose before deciding
[C] Cancel — discard everything, no files written
```

If the user picks [B]: show a bullet list of every file with a one-line
description of its purpose, then re-ask [A]/[B]/[C].

If the user picks [A]: write all files that were verified in Phase 4.
Do not re-write files that were already written during verification.

If the user picks [C]: delete any files that were written during verification.
Clean up completely. No trace.

---

## Behavior Contract

This command intentionally breaks the normal collaborative protocol:
- **No per-section approval** — generate everything before asking
- **No intermediate questions** — parse the spec and build
- **No director gates** — no creative-director, technical-director, or producer review
- **No "May I write?"** — write during verification, gate at the end

The one gate at Phase 5 is the only user interaction after the initial spec.
This is by design — the entire value of `/auto-build` is speed.

---

## Error Recovery

If any phase fails:

| Phase | Failure | Recovery |
|-------|---------|----------|
| 1 (Parse) | Spec unrecognizable | Adopt minimal genre, use spec text as theme name |
| 3 (Generate) | Cannot generate a file | Skip that file, note in summary, continue |
| 4 (Verify) | tsc fails after 3 retries | Show errors, offer retry/simplify/cancel |
| 4 (Verify) | vitest fails after 3 retries | Show failures, offer retry/skip/cancel |

Never fail the entire build because of one file or one test.
Always produce something runnable.
