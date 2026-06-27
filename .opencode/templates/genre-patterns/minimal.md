# Genre Pattern: Minimal

Fallback when the spec genre is not recognized. Produces a movable character on a blank canvas with a colored background. Guarantees `/auto-build` never fails.

## Player
- Movement: WASD / arrow keys, 4-directional
- Speed: 200 px/s
- Visual: colored rectangle (0x00aaff, 32x32 px)
- No health, no physics, no gravity

## World
- Single screen, viewport-sized canvas
- Background: solid color (0x333333)
- No tiles, no obstacles, no scroll

## Objects
- None

## Win Condition
- None (free-roam placeholder)

## Camera
- None (single screen)

## Audio
- No audio generated

## Test Strategy
- Unit: player state move-and-stop
- Browser: canvas renders, player responds to input

## Generated Files
```
src/gameplay/player.ts
tests/unit/gameplay/player.test.ts
```
