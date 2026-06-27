# Genre Pattern: Platformer

Side-scrolling platformer with gravity, jump, horizontal movement, collectibles, enemies, and score.

## Player
- Movement: A/D or arrow keys horizontal, Space/W/Up to jump
- Physics: gravity (980 px/s²), ground check, velocity-based movement, variable jump height
- Speed: 250 px/s horizontal, -500 px/s jump velocity
- Visual: colored rectangle (0x00aaff, 24x40 px) or placeholder circle
- State: id → running → jumping → falling → dead
- Health: 3 hits, invincibility frames (1.5s after hit)

## World
- Tiles: ground blocks (0x8B4513), platforms (0x654321), gaps (air)
- Level: horizontal scroll, ground with platforms at varying heights, occasional gaps, one exit flag
- Tile size: 32x32 px
- Background: gradient sky (0x87CEEB to 0xE0F0FF)

## Objects
- Collectible: coins/gems (0xFFD700, 16x16), float bobbing animation, +100 score on overlap
- Enemy: patrol horizontally between two points, damage on overlap (1 HP), can be stomped from above
- Exit flag: end-of-level trigger (0x00FF00), on overlap → "LEVEL CLEAR"

## Win Condition
- Reach the exit flag

## Camera
- Follow player horizontally, deadzone 25% from left edge
- Y locked to level height

## Audio (stubs)
- Jump: play on jump action
- Collect: play on coin overlap
- Hit: play on damage
- Death: play on health reaches 0

## Test Strategy
- Unit: player jump arc, enemy patrol bounds, collectible overlap, damage invincibility
- Integration: scene enter/exit, respawn flow
- Browser: canvas renders, player moves, jump works

## Generated Files
```
src/gameplay/player.ts
src/gameplay/player-state.ts
src/gameplay/enemy.ts
src/gameplay/collectible.ts
src/gameplay/score-manager.ts
src/gameplay/collision-system.ts
tests/unit/gameplay/player.test.ts
tests/unit/gameplay/enemy.test.ts
tests/unit/gameplay/collectible.test.ts
```
