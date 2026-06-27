# Genre Pattern: Puzzle

Grid-based puzzle game with tile matching, swapping, timer, and combo tracking.

## Player
- Input: click to select tile, click adjacent tile to swap, or drag
- No movement (top-down interaction with the grid)
- Visual: cursor highlights selected tile (0xffffff outline, 2px)

## World
- Grid: 8x8 square grid, 48x48 px per cell
- Tile types: 6 color types (red=0xff4444, blue=0x4444ff, green=0x44ff44,
  yellow=0xffff44, purple=0xff44ff, orange=0xff8800)
- Tile appearance: rounded rectangle (radius 4px) with subtle icon:
  dot, star, diamond, heart, crescent, hexagon
- Background: grid lines (0x444444, 1px) on dark surface (0x222222)
- Selected tile: bright border (0xffffff, 2px) + slight scale (1.05x)
- Matchable tile: subtle pulse animation when no matches exist

## Camera
- Static, centered on grid with margin
- No zoom, no scroll — entire grid visible at once

## Objects
- Special tile (bomb): random spawn (5% chance per new tile), on match destroys
  surrounding 3x3 area, visual: (0xff8800) with "💥" icon
- Special tile (wild): random spawn (3% chance), matches any color,
  visual: rainbow gradient (cycle through colors), with "★" icon

## Match Mechanics
- Match 3+ same-color tiles in a row or column → tiles disappear
- Tiles above collapse down to fill gaps
- New tiles spawn from top to fill empty cells
- Combo: chain reactions from falling tiles that create new matches
- Combo multiplier: 1x for first match, 2x for second, 4x for third, 8x for 4+

## Board Generation
- Initial board: randomly filled with 6 colors, guaranteed no pre-existing matches
- Algorithm: fill left-to-right, top-to-bottom. For each cell, pick a random color
  that doesn't create a horizontal match of 3 with the two cells to the left,
  AND doesn't create a vertical match of 3 with the two cells above.

## Win Condition
- Reach target score before timer expires OR survive as long as possible in endless mode
- Typical score target: 5000 points for 8x8 grid with 6 colors

## Collision
- No physics collision — tile matching is grid-index based
- Selection: click position mapped to grid cell via math.floor(mouseX / cellSize)
- Swap: valid if selected cell and target cell are adjacent (up/down/left/right, not diagonal)
- Match detection: scan each row and column for 3+ consecutive identical colors

## Data File Schema
Level config in `assets/data/level-01.json`:
- Grid width, height, tile size, colors, timer duration, target score
- Special tile probabilities (bomb, wild)

Gameplay values in `assets/data/gameplay-config.json`.

## Audio (stubs)
- Select: play on tile click
- Match: play on 3+ match (pitch varies by combo count)
- Combo: play on chain reaction (higher pitch for longer chains)
- Timer warning: play when <10s remain

## Test Strategy
- Unit: match detection (row, column, simultaneous), gravity (tiles fall after match),
  new tile spawn, swap validation (adjacent only), initial board no-match guarantee
- Integration: chain reaction detection, score accumulation with combo multiplier
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

Note: No collision system needed — puzzle games use grid-index math, not physics.
