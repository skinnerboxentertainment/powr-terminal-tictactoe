# Auto-Build Spec: WarGames Terminal Tic-Tac-Toe

## Phase 1 Fields

| Field | Value |
|-------|-------|
| **Genre** | puzzle (tic-tac-toe) |
| **Core mechanic** | click empty cell to place X, AI responds with O |
| **Player** | X, clicks 3x3 grid cells |
| **Enemy** | AI O, minimax with alpha-beta pruning, first move randomized among optimal positions |
| **World layout** | 3x3 grid rendered as 4 intersecting luminous strokes, no outer bounding square, strokes extend ~2px past outer cells |
| **Win condition** | three in a row (horizontal/vertical/diagonal), draw when all 9 cells filled, auto-return to title after 8s |
| **Progression** | BootScreen -> TitleScreen -> GameScreen -> TitleScreen. Hidden WOPR simulation on TitleScreen via keyboard chord |
| **UI screens** | TitleScreen (logo + terminal frame + prompt + OIA footer + phosphor ghost banner), GameScreen (board + status panel + overlay), SimulationScreen (self-play + flash + typewriter reveal) |
| **Audio cues** | place_x.ogg, place_o.ogg, bg_loop.ogg, terminal_loop.ogg, procedural jsfxr win/draw |
| **Rules** | minimax with alpha-beta; score = 10-depth for win, depth-10 for loss, 0 for draw |
| **Theme** | Cold War military CRT terminal, WarGames WOPR supercomputer |
| **Tone** | ominous, clinical, retro-technological. A childishly simple game presented with the grave visual authority of a nuclear command-and-control system |

## Aesthetic Techniques (Appendix)

This appendix defines the layer-by-layer rendering pipeline. The builder must implement these as ordered compositing passes, not as isolated visual features.

### Layer Stack (back to front)

All elements are positioned within a centered square `compo` of size `cs = min(screenW, screenH)`, with origin `(compoX, compoY)`. The CRT screen area is inset from the compo at fractions: left=8%, top=12%, right=92%, bottom=85%.

```
Layer 0: Housing background
  - Full-compo rect filled with screen_color (#07182B)
  - This is the base canvas. Everything else renders on top.

Layer 1: CRT screen fill
  - Rect from screenLeft/Top to screenRight/Bottom
  - Filled with screen_color (#07182B). Creates the CRT display surface.

Layer 2: Phosphor banner (behind)
  - TerminalGrid(50, 22) covering the CRT screen area
  - Cell size = min(screenW/50, screenH/22)
  - Each cell cycles through `#BC_fg_bg_cycle` using simplex noise: cycle[(noise2D(x*scale + phase) * 6 + 6) % 6]
  - base alpha = 0.06, hover ramp target alpha = 0.5
  - Independent ramp per cell: ramp_up = 0.04/frame, ramp_down = 0.004/frame
  - Ramp triggered by cursor proximity: mouseX/Y -> cell (row, col)

Layer 3: Grid lines
  - 4 thick strokes: 2 vertical at col*cellW, 2 horizontal at row*cellH
  - Line width = 11px from config
  - Color = grid_color (#00B7C7) at alpha 0.85
  - Extend beyond outer cells by grid_line_extension * cs pixels (~2px)
  - Compensated for line width: shifted outward by width/6 so visible cells are equal
  - Secondary glow pass: same lines at width+4, glow_color (#087F8C), alpha 0.12

Layer 4: X/O marks
  - X: two diagonal strokes per cell, mark_line_width = 14px, mark_color (#00B7C7) alpha 0.85
  - O: ellipse per cell, same width/color
  - Per-mark asymmetry via deterministic offsets based on cell index
  - Secondary glow pass same as grid lines

Layer 5: Winning line highlight
  - Fill rects over winning cells with glow_color at alpha 0.18

Layer 6: Terminal frame (TitleScreen only)
  - CP437 box-drawn border on TerminalGrid(50, 22):
    - Top row: `-` with `i % 7 === 3 -> opt_middle_dot` and `i % 11 === 7 -> gap`
    - Bottom row: same pattern shifted by 3
    - Side columns: `|` with gaps at `(r*3) % 11 === 0`
    - No corner characters (chamfered)
    - Center markers: `small_up_tick` at top center, `small_down_tick` at bottom center
    - Side ticks: `small_left_tick` at row 1 col 0, `small_right_tick` at row 1 col 49
  - Drop shadow: copy of border on shadowGrid offset (+3px, +1px), black at alpha 0.35

Layer 7: Extruded "TIC TAC TOE" logo (TitleScreen only)
  - 7 stacked Text objects, all `fontFamily: "Orbitron, monospace"`, fontSize = cs * 0.104
  - Text string: "TIC   TAC   TOE" with triple spaces for wide word separation
  - All positioned per-character (11 chars x 7 layers = 77 Text objects) using identical charW
  - Layers: glow (blur strength 16, alpha 0.2) -> shadow (+5,+5, alpha 0.4) -> extDeep (+3,+3, dark cyan) -> extMid (+2,+2, darker cyan) -> face (stroke width 3) -> core (stroke width 1, alpha 0.8) -> rim (-1,-1, alpha 0.45)
  - Build animation: layers fade in sequentially over 30 frames
  - Cursor proximity: logoContainer receives random +/-1-2px horizontal offset for 2 frames every 180-420 frames

Layer 8: Typewriter text overlays
  - "GAME OVER." then "AGAIN?" on separate lines, centered below grid
  - fontFamily: monospace, fontSize = max(12, cs * 0.032), fill = grid_color
  - Typing rate: 1 char per 3 frames (60fps)
  - 30-frame pause after newline before "AGAIN?" begins
  - Cursor block baked into the text string: reveal `prefix + block`, hide cursor on completion
  - After completion: last char blinks every 30 frames
  - Same system used for "A STRANGE GAME." / "THE ONLY WINNING MOVE IS NOT TO PLAY." in simulation mode

Layer 9: Status panel (both screens)
  - Background: rect from screenBottom to compoBottom, filled with screen_color
  - 4 groups centered at compo fractions [0.12, 0.38, 0.63, 0.89]
  - Labels small monospace, values larger orange-red (#F06B49)
  - Border: thin rect stroke + 3 vertical dividers at midpoints between centers
  - Labels: MOVE / X WIN / O WIN / DRAW

Layer 10: Scanlines
  - Horizontal 1px black rects every 2px across the CRT screen area
  - Alpha = scanline_opacity (0.066)

Layer 11: Vignette
  - Single full-compo rect at black, alpha = vignette_strength * 0.08
  - Subtle center-to-edge CRT falloff
```

### Color Palette

```
background/screen  #07182B  (dark navy)
housing/bezel      #020712  (near black — only visible as frame drop shadow)
grid cyan          #00B7C7  (main phosphor)
ice blue           #77E6F2  (bright edge, hover alpha)
dark cyan          #087F8C  (glow, shadow extrusion)
hot white          #D9FBFF  (innermost hotspot)
status labels      #77E6F2  (same ice blue)
status numbers     #F06B49  (orange-red missile-command)
```

### Wave/Noise Systems

- **NoiseFilter** on screenContent: noise = 0.06, seed randomized every frame
- **Simplex noise** for banner: 2D noise with domain warping, scale 0.06
- **Banner cycle**: 6-element array cycling through block and shade characters
- **Per-cell alpha**: derived from noise2D with independent offset, mapped to 0.0-0.12 range
- **Glitch timer**: fires every 180 + random(0..240) frames, duration 2 frames

### Font Loading

- Orbitron Black (Google Font) — download WOFF2 from Google Fonts, self-host at `assets/ui/fonts/orbitron-black.woff2`
- Used only for "TIC TAC TOE" logo text
- All other text uses `fontFamily: "monospace"` (system monospace)
- Load via `@font-face` in HTML: `font-family: "Orbitron"; src: url(...) format("woff2"); font-weight: 900`

### Structural Config (assets/data/gameplay-config.json)

All layout fractions, colors, line widths, and timing values in one JSON file. Key layout params:

```
screen_inset_left: 0.08,  screen_inset_top: 0.12
screen_inset_right: 0.92, screen_inset_bottom: 0.85
grid_left: 0.21, grid_top: 0.15, grid_right: 0.79, grid_bottom: 0.73
grid_line_width: 11, mark_line_width: 14, grid_line_extension: 0.003
game_over_delay_frames: 60, ai_think_delay: 30
```

## Hidden Simulation Mode

Triggered by typing WOPR on the title screen (keyboard buffer, 6-char sliding window). AI plays both X and O at accelerating speed. Phase sequence:

1. **Ramp-up** (0-8s): move interval decreases 32->1 frame per move
2. **Exhaustion** (8-14s): 1 move/frame, noise ramps 0.06->0.20, status ticks frantically
3. **Flash** (~0.5s): full-viewport grid_bright rect ramps up then down, audio cuts at peak
4. **Stillness** (1s): frozen board, dead silence
5. **Revelation** (4s): typewriter "A STRANGE GAME." then "THE ONLY WINNING MOVE IS NOT TO PLAY."
6. **Exit**: 0.5s fade -> title screen
