# Genre Pattern: Top-Down

Top-down view game with 4-directional movement, tile grid, item collection, enemy spawn zones, and scoring.

## Player
- Movement: WASD / arrow keys, 4-directional with diagonal support
- Speed: 200 px/s
- Visual: colored rectangle (0x00aaff, 24x24 px) or circle
- State: idle → moving → attacking → dead
- Health: 5 HP, damaged on enemy overlap (1 HP), 1s invincibility frames

## World
- Tiles: floor (0x555555), wall (0x333333), water/impassable (0x2244AA)
- Grid size: 32x32 px
- Static screen or scrolling tile map based on spec size estimate
- Background: dark earthy (0x2a2a2a)

## Objects
- Collectible: items (0xFFD700, 16x16), scattered across map, +50 score
- Enemy: spawns from designated zones, moves toward player when in range (200px), patrols otherwise, 2 HP
- Health pickup: red cross (0xFF0000), restores 2 HP

## Win Condition
- Collect all items OR survive for a time limit (spec-dependent)

## Camera
- Follow player centered, if world larger than viewport

## Audio (stubs)
- Pickup: play on item collect
- Hit: play on damage
- Enemy death: play on enemy destroyed

## Test Strategy
- Unit: player movement in 4 directions, enemy patrol boundaries, item overlap, damage invincibility
- Integration: spawn zone activation range
- Browser: canvas renders, WASD movement, enemy follows player

## Generated Files
```
src/gameplay/player.ts
src/gameplay/player-state.ts
src/gameplay/enemy.ts
src/gameplay/collectible.ts
src/gameplay/score-manager.ts
src/gameplay/collision-system.ts
src/gameplay/spawn-system.ts
tests/unit/gameplay/player.test.ts
tests/unit/gameplay/enemy.test.ts
tests/unit/gameplay/collectible.test.ts
```
