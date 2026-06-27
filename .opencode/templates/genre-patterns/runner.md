# Genre Pattern: Runner

Endless runner with auto-scrolling horizontal movement, jump/duck, procedurally spawned obstacles, and distance-based score.

## Player
- Movement: auto-runs right, Space/W/Up to jump, S/Down to duck/slide
- Physics: gravity (980 px/s²), ground check, jump velocity -550 px/s, variable jump height
- Speed: constant 300 px/s horizontal (increases slowly with distance: +2 px/s per 10s)
- Visual: colored rectangle (0x00aaff, 24x32 px standing, 24x16 px ducking)
- State: running → jumping → ducking → dead
- Health: 1 HP (one hit = game over)

## World
- Infinite horizontal scroll, procedurally generated
- Ground: baseline (0x8B4513), 32px tall at bottom of screen
- Background: sky gradient (0x87CEEB), scrolling parallax hills (0x228B22)
- Obstacle spawn rate: increases with distance

## Objects
- Obstacle: static rectangle (0xff3333, 24x32 px) on ground, player must jump over
- Obstacle (high): floating rectangle (0xff6666, 32x24 px) at head height, player must duck under
- Obstacle (gap): missing ground tile, player must jump across
- Collectible: coin (0xFFD700, 16x16) floating at varying heights, +50 score

## Win Condition
- Survive as long as possible (distance-based score, no ending)

## Camera
- Follow player horizontally, player fixed at 30% from left edge

## Audio (stubs)
- Jump: play on jump
- Duck: play on duck
- Hit: play on collision
- Score milestone: play every 1000 points

## Test Strategy
- Unit: player jump arc, duck hitbox change, obstacle collision, coin overlap
- Integration: procedural spawn spacing increases with distance
- Browser: auto-run, jump/duck work, obstacles appear and scroll

## Generated Files
```
src/gameplay/player.ts
src/gameplay/player-state.ts
src/gameplay/obstacle.ts
src/gameplay/collectible.ts
src/gameplay/obstacle-spawner.ts
src/gameplay/score-manager.ts
src/gameplay/collision-system.ts
tests/unit/gameplay/player.test.ts
tests/unit/gameplay/obstacle.test.ts
tests/unit/gameplay/obstacle-spawner.test.ts
```
