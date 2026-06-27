# Genre Pattern: Runner

Endless runner with auto-scrolling horizontal movement, jump/duck, procedurally spawned obstacles, and distance-based score.

## Player
- Movement: auto-runs right, Space/W/Up to jump, S/Down to duck/slide
- Physics: gravity (980 px/s²), ground check, jump velocity -550 px/s, variable jump height
  (holding jump extends ascent, releasing cuts vy by 40%)
- Speed: constant 300 px/s horizontal (increases by +2 px/s per 10s survived, max +100 px/s)
- Visual: colored rectangle (0x00aaff, 24x32 px standing, 24x16 px ducking)
- State: running → jumping → ducking → dead
- Health: 1 HP (one hit = game over)

## World
- Infinite horizontal scroll, procedurally generated
- Ground: baseline (0x8B4513), 32px tall at bottom of screen, always present
- Background: sky gradient approximation (0x87CEEB to 0xE0F0FF as solid 0x87CEEB),
  scrolling parallax hills (two layers: far=0x336633 at 0.2x speed, near=0x228B22 at 0.5x speed)
- Obstacle spawn rate: starts at one every 2 seconds, decreases to one every 0.8 seconds
  over 60 seconds. After 60s, stays at max density.

## Camera
- Follow player horizontally, player fixed at 30% from left edge
- Y-locked — camera never scrolls vertically
- No horizontal bounds (infinite scroll)

## Objects
- Obstacle (ground): solid rectangle (0xff3333, 24x32 px) on ground, player must jump over
  - Min spacing: 3 tile-widths between obstacles (increases by 1 tile-width per 30s)
  - Height varies: 24-32 px
- Obstacle (high): floating rectangle (0xff6666, 32x24 px) at head height, player must duck under
  - First appears after 15s, increasing frequency over time
  - Only spawns when player is on the ground (not mid-air)
- Obstacle (gap): missing ground tile, 1-2 tiles wide, player must jump across
  - First appears after 10s
  - Width: 1 tile (60% chance) or 2 tiles (40% chance)
- Collectible: coin (0xFFD700, 16x16) floating at varying heights (1-4 tiles above ground)
  - Spawned in clusters of 3-5, one cluster per obstacle spawn cycle
  - +50 score per coin

## Obstacle Generation Rules
- Sequence: ground obstacle → high obstacle → gap → (repeat)
- After any obstacle, a safe zone of 2-4 tiles before next obstacle
- Never spawn two of the same type in a row
- Gap is always preceded by a ground platform of at least 3 tiles
- High obstacle never spawns immediately after a gap (player needs recovery time)

## Win Condition
- Survive as long as possible (distance-based score, no ending)

## Collision
- Per-axis AABB (same as platformer)
- Player hitbox changes when ducking (24x16 instead of 24x32)
- Ground obstacle and gap: collision with player feet
- High obstacle: collision with player head
- Coin overlap: AABB check, disappears on collection

## Data File Schema
Difficulty curve in `assets/data/difficulty.json`:
- Speed increase per 10s, spawn interval curve, high obstacle delay, gap delay

Gameplay values in `assets/data/gameplay-config.json`.

## Audio (stubs)
- Jump: play on jump
- Duck: play on duck
- Hit: play on collision
- Score milestone: play every 1000 points

## Test Strategy
- Unit: player jump arc, duck hitbox change, obstacle collision, coin overlap, variable jump height
- Integration: procedural spawn spacing increases with distance, safe zone enforcement
- Browser: auto-run, jump/duck work, obstacles appear and scroll

## Generated Files
```
src/gameplay/player.ts
src/gameplay/player-state.ts
src/gameplay/obstacle.ts
src/gameplay/collectible.ts
src/gameplay/obstacle-spawner.ts
src/gameplay/score-manager.ts
tests/unit/gameplay/player.test.ts
tests/unit/gameplay/obstacle.test.ts
tests/unit/gameplay/obstacle-spawner.test.ts
```

Note: `collision-system.ts` is intentionally omitted — collision logic is
inlined in `player.ts` and `game-scene.ts`. Extract when needed.
