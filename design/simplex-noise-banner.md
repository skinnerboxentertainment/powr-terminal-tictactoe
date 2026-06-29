# Simplex Noise Phosphor Banner

Replace the current per-cell random-seed banner with a simplex-noise-driven system that controls both character selection and alpha per cell, producing organic flowing CRT texture.

## Core module: `src/core/simplex-noise.ts`

A compact 2D simplex noise implementation (public domain, adapted from Stefan Gustavson). Single function:

```typescript
noise2D(x: number, y: number): number  // returns -1 to 1
```

No classes, no dependencies, ~40 lines.

## BoardRenderer banner

A single `TerminalGrid(50, 22)` behind the grid/marks, driven by simplex noise:

```typescript
private bannerGrid = new TerminalGrid(50, 22)
private bannerPhase = 0
private bannerTick = 0
private bannerScale = 0.06
private bgRampCells = new Map<string, { cur: number; tgt: number }>()
private bgHoveredCellKey: string | null = null
```

### Per-cell computation (every 5 frames)

For each cell `(r, c)`:

```
nx = c * bannerScale
ny = r * bannerScale
t  = bannerPhase * 0.015  // slow drift

warp = noise2D(nx * 0.3 + t * 0.1, ny * 0.3) * 0.5
cx = nx + warp
cy = ny + warp

// Character: 0-5 mapped to shade cycle
rawChar = noise2D(cx + t, cy)
charIdx = floor(abs(rawChar) * 5.99) % 6
char = cycle[charIdx]

// Alpha: 0.0–0.12 mapped from noise
rawAlpha = noise2D(cx + 5.3, cy + t * 0.8)
alpha = (rawAlpha + 1) * 0.06  // 0.0 to 0.12
```

### Hover ramp

Same per-cell ramp system as the title screen:

- Mouse over a cell → set ramp target to 0.6
- Each frame lerp toward target
- When mouse leaves, target back to noise-driven alpha
- Separate `bgRampCells` map tracks active cells

### Integration

- `layout()` creates and positions the banner grid behind grid/marks
- A new `tickBanner()` method called from `tickNoise()` (which runs every frame)
- `tickBanner()` handles both the 5-frame cycle update AND per-frame ramp updates

## Title scene migration

Replace the existing `bannerSeeds` random approach with simplex noise in `drawBanner` and `updateBannerCells`:

- `updateBannerCells()` uses `noise2D` instead of `cycle[(seed + phase) % len]`
- Foreground layer (`updateFgCells`) uses the same but with a different noise offset
- Ramp system stays unchanged

## Files

| File | Action | Lines |
|------|--------|-------|
| `src/core/simplex-noise.ts` | **New** | ~40 |
| `src/gameplay/board-renderer.ts` | Add banner grid, noise-driven update, hover ramp | ~80 |
| `src/scenes/title-scene.ts` | Switch banner to simplex noise | ~20 changed |

No new dependencies. No asset files.
