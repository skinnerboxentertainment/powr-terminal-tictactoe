# Genre Pattern: SHMUP

Shoot-em-up with 360-degree player movement, auto-scrolling or static screen, projectile systems, enemy waves, and score.

## Player
- Movement: WASD / arrow keys, 8-directional, no gravity
- Speed: 300 px/s
- Visual: triangle or arrow shape (0x00ff00, 20x20 px), pointing up
- State: active → invincible → dead
- Health: 1 HP (classic) or 3 HP (modern), 1s invincibility on hit, blink during invincibility
- Attack: Space or Z to fire, cooldown 250ms, projectile speed 600 px/s upward

## World
- Auto-scroll upward (speed varies: 40-80 px/s) or screen-locked arena
- Background: space (0x0a0a2e) with randomly placed star dots (0xffffff, 1px, ~100 dots)
- No tiles — open space. Screen edges are boundaries.
- Viewport: 800x600 px (or fill window)

## Camera
- Static (screen-locked) for arena mode
- Upward auto-scroll for scrolling mode — camera Y increases at scroll speed
- No follow needed (player position independent of camera)

## Objects
- Enemy: spawn in waves from top of screen, move in patterns (sine, straight, dive), 1-3 HP
  - Wave 1: 5 enemies, straight down, 1 HP, 800ms spawn interval
  - Wave 2: 8 enemies, sine pattern, 1 HP, 600ms spawn interval
  - Wave 3: 3 enemies, 3 HP, dive at player, 1200ms spawn interval
  - Boss (optional): 60x40 px, 20 HP, pattern attack (aimed shots), appears after wave 3
- Projectile: player bullets (0x00ff00, 4x12 px), enemy bullets (0xff0000, 6x6 px)
- Power-up: rare drop from enemies (10% chance), temporary fire rate boost (2x for 5s) or spread shot (3-way), (0xffff00, 12x12)
- Explosion: brief VFX on enemy death — expanding circle (0xff8800, radius 2→20, 200ms)

## Wave Generation
- Enemy count per wave: wave_number × 3 + 2
- Spawn interval decreases with wave number: max(300, 800 - wave_number * 100) ms
- Enemy HP increases with wave: wave_number (capped at 5)
- 3 waves before boss. If no boss, loop waves with increasing difficulty.
- Enemy patterns cycle: straight, sine, dive, random (avoid clustering)

## Win Condition
- Survive all waves OR defeat boss

## Collision
- Circle-based collision for simplicity (player and bullets are roughly circular)
- Player bullet vs enemy: destroy bullet, damage enemy
- Enemy bullet vs player: destroy bullet, damage player
- Enemy vs player: damage player on overlap
- Collision radius: player=10px, bullet=3px, enemy=12px, boss=25px

## Data File Schema
Waves defined in `assets/data/waves.json`:
- Array of wave configs: enemy count, HP, pattern, spawn interval, scroll speed
- Boss config: HP, attack patterns, phase transitions

Gameplay values in `assets/data/gameplay-config.json`.

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
tests/unit/gameplay/player.test.ts
tests/unit/gameplay/enemy.test.ts
tests/unit/gameplay/projectile.test.ts
tests/unit/gameplay/wave-manager.test.ts
```

Note: `collision-system.ts` is intentionally omitted — collision logic is
inlined in gameplay classes. Extract to a standalone system when needed.
