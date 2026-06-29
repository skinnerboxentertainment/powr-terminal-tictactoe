# Zero-Player Simulation Mode

Captures the *WarGames* climax: WOPR exhausts every tic-tac-toe board state, discovers all outcomes lead to draw, and concludes "the only winning move is not to play."

## 1. Trigger

A hidden terminal command on the title screen. The `CMD>` prompt in the OIA footer is a lie — it just displays text. Instead, trigger via an invisible click target embedded in the phosphor banner.

**Approach:** A specific cell in the banner grid at a fixed coordinate (row 14, col 7 — arbitrary but consistent) acts as a hidden hotlink. When the player hovers over it, that cell glows brighter than normal (0.9 alpha instead of 0.8). When clicked, it transitions to `SimulationScene` instead of `GameScene`.

**Alternate:** A key chord — press any three keys simultaneously (e.g., `W`, `O`, `P`, `R` typed in sequence while on the title screen). Simpler to implement, more fitting for a terminal interface.

## 2. Scene flow

```
TitleScene
  ├── click anywhere → GameScene (normal flow)
  └── hidden trigger → SimulationScene (zero-player mode)
```

## 3. Scene: SimulationScene

### Phase breakdown

| Phase | Duration (approx) | Ticks | Description |
|-------|------------------|-------|-------------|
| 1 — Ramp-up | 0–8s | 1–480 | Accelerating self-play: move interval decreases 32→1 frame per move |
| 2 — Exhaustion | 8–14s | 480–840 | Peak saturation: 1 move/frame, noise max, scanlines intensify |
| 3 — Stillness | 14–16s | 840–960 | Abrupt stop. Silence. Frozen draw board. |
| 4 — Revelation | 16–22s | 960–1320 | Typewriter text: "A STRANGE GAME." then "THE ONLY WINNING MOVE IS NOT TO PLAY." |
| Exit | 22s+ | — | 3s pause → transition back to TitleScene |

### 3.1 Phase 1 — Accelerating self-play

**Visual:**
- AI plays both X and O using the existing `getBestMove()` with alternating player
- First move takes 32 frames (0.53s). After each move, the interval decreases:
  - `interval = max(1, 32 - Math.floor(moveCount * 0.3))`
  - At move ~103, interval reaches 1 frame per move
- Board redraws each move via existing `BoardRenderer.update()` and `BoardRenderer.setStatusValues()`
- Status panel increments:
  - GNR STS: total moves played (resets each game, but we don't show game count — show cumulative moves)
  - APL STS: X wins across all self-play games
  - EOT STS: O wins across all self-play games
  - PAC STS: draws across all self-play games

**Audio:**
- `place_x` and `place_o` fire on each move at accelerating rate
- `win`/`draw` tone at end of each self-play game

**State:**
- Once a game ends (win or draw), immediately reset state and start a new game
- Player alternates: first self-play game AI plays O (maximizing), then AI plays X (maximizing) — or just always let AI play both sides using `getBestMove()`

### 3.2 Phase 2 — Exhaustion

**Trigger:** Move interval reaches 1 frame per move. After 60 moves at peak rate (60 frames ≈ 1s), transition to Phase 2.

**Visual:**
- Board continues at 1 move/frame — a rapid strobe of X and O
- Noise filter on the screenContent ramps from 0.06 to 0.20 over 120 frames (2s)
- The grid becomes a flickering blur — intentionally unreadable as individual marks
- Scanlines layer remains

**Audio:**
- SFX collapse into a compressed texture — rapid beeps too fast to distinguish
- `bg_loop` begins fading out over 60 frames (1s)

**Duration:** 6 seconds (360 frames at 60fps).

A dim overlay text appears at the bottom of the screen area after 2s of Phase 2:

```
SIMULATING ALL POSSIBLE OUTCOMES...
```

This is a single `Text` object, monospace 0.018 * compoSize, cyan, alpha 0.4 — intentionally subtle, not a splash screen.

### 3.3 Phase 3 — Stillness

**Trigger:** Phase 2 duration expires.

**Visual:**
- Board freezes on a full draw board
- Status panel numbers freeze on their final values
- Noise filter snaps back to 0.06
- Scanlines remain
- Audio stops completely — `audioManager.stopAll()`

**Duration:** Exactly 60 frames (1s) of dead silence and stillness.

**Status freeze values:**
- After ~140 self-play games at ~9 moves each ≈ 1260 total moves
- ~78 draws (55%), ~31 X wins (22%), ~31 O wins (22%)
- Final EOT STS shows total simulation count: `001260` (moves) or the total games count

Actually, let's compute: each self-play game goes to completion (win or draw). Average game length is ~8 moves (since minimax plays optimally and most games end in draw at ~9 moves). At peak 1 move/frame after ~103 moves = ~13 games in the ramp-up. Then Phase 2 at 1 move/frame for 360 frames = 360 moves ≈ 45 games. Total ≈ 58 games × 8 moves = ~464 moves.

For the final display, I'll show total games simulated (58) and total moves (464). Keeps the number believable.

Actually, let me be more precise and just compute it at runtime. The simulation runs for a set time, and the final values are whatever was accumulated. That's more authentic than faking it.

### 3.4 Phase 4 — Revelation

**Trigger:** Stillness duration expires.

**Visual:**
Typewriter-style text appears centered on screen. Each line uses the same extruded text pipeline as the title logo — 6-line Text objects (shadow, extDeep, extMid, face, core, rim) for a glowing 3D terminal effect. But in this case, only the face + core layers are needed (fast to create).

Lines appear one at a time:

```
A STRANGE GAME.
THE ONLY WINNING MOVE IS NOT TO PLAY.
```

Each character types at 50ms delay. After the final character of each line, a 500ms pause before the next line begins.

**Positioning:** Centered on screen, slightly below the board area (so as not to overlap the frozen board). The board remains visible in the background — the text overlays it.

**Audio:** Silence. No music, no SFX.

**Duration:** ~4 seconds for typing, 3 seconds final hold.

### 3.5 Exit

**Trigger:** Phase 4 final hold expires.

**Transition:** A simple alpha fade over 30 frames (0.5s). The `screenContent` alpha drops to 0, then the SceneManager replaces with TitleScene. The bg_loop restarts via `TitleScene.enter()`.

## 4. BoardRenderer considerations

The existing `BoardRenderer` works for this scene. It handles:
- Drawing the grid (via `layout()`)
- Drawing X/O marks (via `update()`)
- Status panel updates (via `setStatusValues()`)
- Win line highlighting (already draws via `winG`)

**Potential issue:** `layout()` expects screenWidth/screenHeight and recomputes all positions. This is fine — call it once in the simulation scene's `enter()`.

**Potential issue:** The status panel labels are hardcoded as "GNR STS", "APL STS", "EOT STS", "PAC STS". For the simulation, I want EOT STS to show the total move count and re-label the others. I can pass different label values... actually, `setStatusValues()` only changes the values, not the labels. The labels are set once in `drawStatusPanel()`.

Fix: make the labels dynamic by adding a parameter to `drawStatusPanel()`, or setting them via a new method like `setStatusLabels(labels: string[])`.

Actually, for simplicity, I'll just use the existing status panel as-is. The labels are "GNR STS" etc. which is fine for the simulation too. The values map to:
- GNR STS → move count
- APL STS → X wins
- EOT STS → current turn (show "SIM" for simulation)
- PAC STS → draws

Or I could add a separate `setStatusLabels` method to BoardRenderer. That's a small change.

Let me keep it simpler: the status values already show moveCount, xWins, currentTurn, draws. For the simulation, I'll just set these to the simulation's accumulated values. EOT STS (which shows turn) can show "SIM" during the simulation, or I can repurpose it to show something else.

Actually, the cleanest approach: modify BoardRenderer to accept optional status labels as a parameter to `setStatusValues()`. Add a `labels` field to `StatusValues`:

```typescript
export interface StatusValues {
  moveCount: number
  xWins: number
  currentTurn: string
  draws: number
  labels?: [string, string, string, string]
}
```

Then in `setStatusValues()`, if `values.labels` is provided, update the text labels.

This is backward-compatible with the existing game scene (which doesn't pass labels).

I'll add this to the implementation plan.

## 5. New file: `src/scenes/simulation-scene.ts`

### Structure

```typescript
export class SimulationScene implements Scene {
  private container = new Container()
  private renderer = new BoardRenderer()
  private state = new TicTacToeState()
  private frameCount = 0
  private phase: 'ramp' | 'exhaust' | 'still' | 'reveal' | 'exit' = 'ramp'
  private moveTimer = 0
  private moveInterval = 32
  private totalMoves = 0
  private xWins = 0
  private oWins = 0
  private draws = 0
  private typewriterIndex = 0
  private typewriterTimer = 0
  private revealLines = [
    "A STRANGE GAME.",
    "THE ONLY WINNING MOVE IS NOT TO PLAY.",
  ]
  private revealTexts: Text[][] = []  // array of extruded text layers per line
  private simOverlay = new Text({ text: "" })
  
  constructor(app, stage)
  
  enter(): void
    - Create container, add to stage
    - Create BoardRenderer, layout
    - Create reveal Texts (face + core layers per character)
    - Set all reveal to alpha 0
    - Start bg_loop? Or don't — silence during simulation is more impactful
    - Actually: start bg_loop at very low volume, fade to silence during Phase 2
    - Set simOverlay style and position

  update(dt): void
    - Increment frameCount
    - Phase dispatch:
      - 'ramp': updateRamp()
      - 'exhaust': updateExhaust()
      - 'still': updateStill()
      - 'reveal': updateReveal()
      - 'exit': updateExit()

  private updateRamp(): void
    - moveTimer++ 
    - If moveTimer >= moveInterval:
      - Run AI move for current player
      - Increment totalMoves
      - Update status
      - If game over: record win/draw, reset state, alternate starting player
      - moveInterval = max(1, 32 - Math.floor(totalMoves * 0.3))
      - moveTimer = 0
    - If moveInterval <= 1 for 60 consecutive frames → transition to 'exhaust'

  private updateExhaust(): void
    - Continue at 1 move/frame
    - Ramp noise filter on screenContent
    - After 360 frames → transition to 'still'

  private updateStill(): void
    - 60 frames of silence → transition to 'reveal'

  private updateReveal(): void
    - Typewriter effect on reveal texts
    - When all lines complete → wait 180 frames → transition to 'exit'

  private updateExit(): void
    - Fade alpha over 30 frames
    - sceneManager.replace(TitleScene)

  exit(): void
    - Destroy container
```

### Audio considerations

- `place_x` / `place_o` fire during ramp/exhaust — they'll overlap and blur together at high speed, which is the intended effect
- `win` / `draw` fire at end of each self-play game
- `bg_loop` starts at enter(), starts fading out during exhaust phase, stops at still
- During still + reveal: complete silence

## 6. BoardRenderer modifications

Add `labels` field to `StatusValues` for dynamic status panel labels:

```typescript
export interface StatusValues {
  moveCount: number
  xWins: number
  currentTurn: string
  draws: number
  labels?: [string, string, string, string]
}
```

In `setStatusValues()`:
```typescript
if (values.labels) {
  for (let i = 0; i < 4; i++) {
    this.statusLabels[i].text = values.labels[i]
  }
}
```

## 7. SimulationScene renders

Uses the exact same CRT aesthetic:
- `NoiseFilter` on `screenContent` (same as title scene)
- Scanlines via the BoardRenderer's built-in scanline layer
- Standard CRT housing + screen fill from BoardRenderer.drawHousing/drawScreenFill

BoardRenderer already includes scanlines, housing, screen fill, vignette — everything is shared.

## 8. Typewriter text rendering

For the "A STRANGE GAME." and "THE ONLY WINNING MOVE IS NOT TO PLAY." text, I'll use a simple approach:

- Pre-compute: each character of each line as a single Text object (no extruded layers — too complex for temporary text)
- Position them centered on screen, spaced based on font size
- Set all to alpha = 0 initially
- In updateReveal(), increment typewriterIndex, set revealTexts[lineIdx][charIdx].alpha = 1 on each tick

Using the same monospace font, ice blue (#00B7C7) fill, fontSize 0.04 * compoSize.

## 9. Hidden trigger implementation

In TitleScene, add a keyboard listener:

```typescript
private keyBuffer = ""

// In update():
for (const k of this.input.keysJustPressed) {
  if (k.length === 1) {
    this.keyBuffer += k.toLowerCase()
    if (this.keyBuffer.length > 6) this.keyBuffer = this.keyBuffer.slice(-6)
    if (this.keyBuffer === "wopr") {
      this.sceneManager.replace(new SimulationScene(this.app, this.stage, this.input))
    }
  }
}
```

Typing `WOPR` anywhere on the title screen triggers the simulation. The buffer is never displayed — it's a hidden Konami-style code.

## 10. Summary of file changes

| File | Change |
|------|--------|
| `src/scenes/simulation-scene.ts` | **New** — the zero-player simulation scene (~200 lines) |
| `src/scenes/title-scene.ts` | Add keyboard buffer + WOPR trigger (~10 lines) |
| `src/gameplay/board-renderer.ts` | Add optional `labels` field to `StatusValues` + `setStatusValues()` update (~5 lines) |

No new dependencies. No asset files. No config changes.
