# Genre Pattern: Puzzle

Grid-based puzzle game with tile matching, swapping, timer, and combo tracking.

## Player
- Input: click to select tile, click adjacent tile to swap, or drag
- No movement (top-down interaction)
- Visual: cursor highlights selected tile

## World
- Grid: 8x8 square grid (adjustable based on spec), 48x48 px per cell
- Tiles: 6-8 color types (distinct colors: red, blue, green, yellow, purple, orange)
- Background: grid lines (0x444444) on dark surface (0x222222)
- Tile appearance: rounded rectangle with distinct color and subtle icon (dot, star, diamond, heart, crescent, hexagon)

## Objects
- Tile: grid cell with color type and icon type
- Special tile: bomb (destroy surrounding 3x3), wild (matches any color)
- No enemies

## Mechanics
- Match 3+ same-color tiles in a row or column → they disappear, tiles above fall down, new tiles spawn from top
- Combo: chain reactions from falling tiles that create new matches
- Timer: countdown from 60s (adjustable), game over at 0

## Win Condition
- Reach target score before timer expires OR survive as long as possible

## Camera
- Static, centered on grid

## Audio (stubs)
- Select: play on tile click
- Match: play on 3+ match
- Combo: play on chain reaction (pitch increases with combo count)
- Timer warning: play when <10s remain

## Test Strategy
- Unit: match detection (row, column, simultaneous), gravity (tiles fall after match), new tile spawn, swap validation (adjacent only)
- Integration: chain reaction detection, score accumulation
- Browser: click selects tile, click adjacent swaps, matched tiles disappear

## Generated Files
```
src/gameplay/tile.ts
src/gameplay/grid.ts
src/gameplay/match-detector.ts
src/gameplay/gravity-system.ts
src/gameplay/score-manager.ts
tests/unit/gameplay/grid.test.ts
tests/unit/gameplay/match-detector.test.ts
tests/unit/gameplay/gravity-system.test.ts
```
