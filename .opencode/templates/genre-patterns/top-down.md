# Genre Pattern: Top-Down

Top-down view game with 4-directional movement, tile grid, item collection, enemy spawn zones, and scoring.

## Player
- Movement: WASD / arrow keys, 4-directional with diagonal support
- Speed: 200 px/s
- Visual: colored rectangle (0x00aaff, 24x24 px) or circle
- State: idle → moving → attacking → dead
- Health: 5 HP, damaged on enemy overlap (1 HP), 1s invincibility frames, blink during invincibility

## World
- Tiles: floor (0x555555), wall (0x333333), water/impassable (0x2244AA), spawn-zone marker (0x553333)
- Grid size: 32x32 px
- Map size: 40x30 tiles (about 1.5 screens)
- Wall density: 20-30% of tiles (scattered walls, not mazes)
- Background: solid color (0x2a2a2a)

## Camera
- Follow player centered on screen
- Clamped to map bounds — never shows area outside the tile grid
- No deadzone (for top-down, the player is always centered)

## Objects
- Collectible: items (0xFFD700, 16x16), scattered across map in open areas, 10-20 per level, +50 score
- Enemy: spawns from marked spawn zones, moves toward player when in range (200px), patrols small area otherwise, 2 HP, 5-10 per level
- Health pickup: red cross (0xFF0000), restores 2 HP, 3-5 per level in safe areas

## Win Condition
- Collect all items OR survive for a time limit (spec-dependent)

## Collision
- Per-axis AABB: same as platformer (resolve X first, then Y)
- Player collides with walls and water tiles (impassable)
- Enemies do not collide with walls — they patrol in open areas
- Collectible overlap: AABB check, disappears on overlap

## Data File Schema
Levels stored in `assets/data/level-01.json`:
- `tiles`: flat array where 0=floor, 1=wall, 2=water, 3=spawn_zone
- `spawns`: array of entity spawns with type, position, patrol radius, aggro range
- Width and height in tiles

Gameplay values in `assets/data/gameplay-config.json`.

## Audio (stubs)
- Pickup: play on item collect
- Hit: play on damage
- Enemy death: play on enemy destroyed

## Test Strategy
- Unit: player movement in 4 directions, enemy patrol boundaries, item overlap, damage invincibility
- Integration: spawn zone activation range, health pickup respawn
- Browser: canvas renders, WASD movement, enemy follows player

## Generated Files
```
src/gameplay/player.ts
src/gameplay/player-state.ts
src/gameplay/enemy.ts
src/gameplay/collectible.ts
src/gameplay/score-manager.ts
tests/unit/gameplay/player.test.ts
tests/unit/gameplay/enemy.test.ts
tests/unit/gameplay/collectible.test.ts
```

Note: `collision-system.ts` and `spawn-system.ts` are intentionally omitted —
collision logic is inlined in `player.ts` and spawn logic in `game-scene.ts`.
Extract to standalone systems when the project needs them.
