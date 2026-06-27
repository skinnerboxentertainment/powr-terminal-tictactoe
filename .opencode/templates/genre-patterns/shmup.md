# Genre Pattern: SHMUP

Shoot-em-up with 360-degree player movement, auto-scrolling or static screen, projectile systems, enemy waves, and score.

## Player
- Movement: WASD / arrow keys, 8-directional, no gravity
- Speed: 300 px/s
- Visual: triangle or arrow shape (0x00ff00, 20x20 px), pointing up
- State: active → invincible → dead
- Health: 1 HP (classic) or 3 HP (modern), 1s invincibility on hit
- Attack: Space or Z to fire, cooldown 250ms, projectile speed 600 px/s upward

## World
- Auto-scroll upward (speed varies, ~60 px/s) or screen-locked arena
- Background: space (0x0a0a2e) with starfield parallax
- No tiles — open space
- Screen edges are boundaries

## Objects
- Enemy: spawn in waves from top of screen, move in patterns (sine, straight, dive), 1-3 HP
- Projectile: player bullets (0x00ff00, 4x12 px), enemy bullets (0xff0000, 6x6 px)
- Power-up: rare drop from enemies, temporary fire rate boost or spread shot (0xffff00, 12x12)
- Explosion: brief VFX on enemy death (expanding circle, 0xff8800, 200ms)

## Waves
- Wave 1: 5 enemies, straight down, 1 HP
- Wave 2: 8 enemies, sine pattern, 1 HP
- Wave 3: 3 enemies, 3 HP, dive at player
- Boss (optional based on spec): large enemy (60x40 px), 20 HP, pattern attack

## Win Condition
- Survive all waves OR defeat boss

## Camera
- Static (screen-locked) or auto-scroll upward

## Audio (stubs)
- Shoot: play on fire (rapid, short sfx)
- Hit: play on damage
- Explosion: play on enemy death
- Power-up: play on collect

## Test Strategy
- Unit: projectile movement, enemy wave timing, collision damage, power-up effect
- Integration: wave completion triggers next wave, boss spawn
- Browser: player moves, firing works, enemies spawn

## Generated Files
```
src/gameplay/player.ts
src/gameplay/enemy.ts
src/gameplay/projectile.ts
src/gameplay/power-up.ts
src/gameplay/wave-manager.ts
src/gameplay/score-manager.ts
src/gameplay/collision-system.ts
tests/unit/gameplay/player.test.ts
tests/unit/gameplay/enemy.test.ts
tests/unit/gameplay/projectile.test.ts
tests/unit/gameplay/wave-manager.test.ts
```
