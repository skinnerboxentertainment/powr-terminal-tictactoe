# ANSI / Terminal Aesthetic Reference

**Project:** WarGames Tic Tac Toe  
**Research date:** 2026-06-27

## Executive direction

The strongest target is a hybrid of three historically distinct systems:

1. **ANSI/BBS composition:** CP437 block glyphs, 16 colors, hard character-cell geometry, extruded logos.
2. **Institutional terminal hierarchy:** fixed 80-column logic, protected fields, terse labels, bottom operator/status line.
3. **Physical CRT behavior:** luminance-dependent bloom, scan structure, persistence, and slight geometric instability.

The game should therefore look as though a BBS artist designed a tactical application *inside* an old command terminal—not like a modern HUD with a generic CRT overlay.

Recommended hierarchy:

```text
┌─ WOPR / GAME THEORY SUBSYSTEM ─────────────── NODE 01 ─┐
│ DEFCON: 5       SIMULATION: TIC-TAC-TOE      CPU: READY │
├──────────────────────┬──────────────────────────────────┤
│                      │ MOVE LOG                         │
│     TIC TAC TOE      │ 01 X:A1                         │
│     ▄████████▄       │ 02 O:B2                         │
│       [GRID]         ├──────────────────────────────────┤
│                      │ OUTCOME PROJECTION               │
│                      │ X  00%   O  00%   DRAW 100%      │
├──────────────────────┴──────────────────────────────────┤
│ CMD> SELECT CELL _                 LN 24 COL 18   ONLINE │
└──────────────────────────────────────────────────────────┘
```

This is a design synthesis, not a reconstruction of one historical screen.

## Vocabulary

| Term | Practical meaning |
|---|---|
| **Character cell** | The indivisible rectangular unit of the design; historically often an 8×16-ish glyph box. |
| **CP437** | Original IBM PC code page containing box drawing, half blocks, and `░▒▓█`; the core shape vocabulary of BBS ANSI. |
| **Block / half-block** | `█`, `▀`, `▄`, `▌`, `▐`; used as coarse pixels or two-color subcells. |
| **Shade ramp** | ` ` → `░` → `▒` → `▓` → `█`, or ASCII punctuation ordered by visual density. |
| **Ice color** | BBS usage in which the blink attribute is repurposed as bright background colors; visually, saturated “high” colors on dark grounds. |
| **Sauce / footer metadata** | Pack-era authorship and file metadata; useful inspiration for a tiny system/version footer. |
| **OIA** | IBM 3270 Operator Information Area: a dedicated bottom status line for session and keyboard state. |
| **Protected field** | A fixed label or output region that contrasts with editable/input fields. |
| **Prompt cursor** | Blinking block/underline that establishes the screen as live and addressable. |
| **Ansi-mation** | Animation made by cursor movement, selective overwrite, color changes, or frame-like redraw—not fluid sprite animation. |
| **Phosphor persistence** | Light remaining briefly after excitation; the physical basis for trails and afterglow. |
| **Bloom** | Bright strokes spreading and thickening more than dim strokes. |

## 1. ANSI art

### What defines it

ANSI art is based on IBM PC text cells and ANSI cursor/color control, not arbitrary pixels. CP437 supplies 256 characters, including single/double box lines and the block/shade glyphs used to draw fills, contours, and menus. Contemporary explanations and the original code-page table make the critical point: the drawing vocabulary includes presentation glyphs specifically suited to frames, boxes, gradients, and block construction ([CP437 table](https://www.ascii-codes.com/), [ANSI overview](https://www.howtogeek.com/781276/what-is-ansi-art-and-why-was-it-popular-in-the-1990s/)).

Typical logo construction:

- silhouette in `█`, `▄`, and `▀`;
- one-cell dark outline;
- face fill in a midtone;
- bright top/left highlight;
- dark bottom/right bevel;
- one- or two-cell down-right extrusion/drop shadow;
- `░▒▓` transitions at curved or lit edges.

The palette is more structural than decorative: black/navy negative space, a restrained main hue, a bright edge color, and white only at the hottest points. ANSI.SYS exposed 16 foreground colors and eight normal backgrounds, plus blink; “iCE colors” conventionally use that high bit for bright backgrounds instead of blinking ([ANSI.SYS capabilities](https://en.wikipedia.org/wiki/ANSI.SYS), [iCE history](https://www.ice.org/about/)).

### Concrete references

- **ACiD Productions packs:** a broad chronological corpus of board ads, logos, menus, and long-form pieces. The [ACiD archive at Sixteen Colors](https://16colo.rs/group/acid) spans the formative BBS era and is the best general logo-composition library.
- **iCE Advertisements:** founded in 1991 and initially focused on BBS ANSI; use the [iCE gallery](https://www.ansigallery.com/group/ice) to study saturated high-color work and dark backgrounds.
- **TheDraw:** Ian E. Davis’s DOS editor (1986–1993), designed for ANSI, ASCII, and animation. The [TheDraw overview and screenshot](https://en.wikipedia.org/wiki/TheDraw) shows the text-cell editing environment; the modern [AnsiDraw](https://ansidraw.com/) is useful for interactively testing equivalent cell-based construction.

### PixiJS v8 translation

- Create a logical **80×25 or 80×30 cell grid**, then scale it by an integer where possible.
- Use a bitmap CP437 font, or a `BitmapText` atlas made from an IBM VGA font. Never mix proportional type into the terminal surface.
- Represent each cell as `{glyph, fg, bg, flags}`. This makes selective redraw and ansi-mation natural.
- Build the title from glyph data, not vector paths. For a procedural logo: threshold a bitmap, dilate it by one cell for the outline, offset the mask `(1,1)` for extrusion, then map edge/interior brightness to `░▒▓█`.
- Use `Graphics` for background cells and the tic-tac-toe geometry only if the lines are snapped to the same cell lattice. PixiJS’s scene graph supports containers, text, graphics, and sprites; cache static panel/title layers as textures ([PixiJS scene overview](https://pixijs.download/dev/docs/scene.html)).

### Direct style target

Use cyan as the dominant face, pale blue/white as the upper-left highlight, dark blue as the lower-right bevel, and near-black navy as the shadow:

```text
background  #020712
panel navy  #07182B
dark cyan   #087F8C
cyan        #00B7C7
ice blue    #77E6F2
hot white   #D9FBFF
```

This is a project palette inspired by bright-background “ice” usage, not a claim of one canonical historical RGB table; actual VGA output varied by hardware and capture.

## 2. ASCII art

### What defines it

ASCII art works with printable characters rather than CP437 blocks and color attributes. Two major modes matter here:

- **Line art:** `/\_|()'` describe contours, joints, and silhouettes.
- **Density art:** glyph coverage maps luminance to a ramp such as ` .:-=+*#%@`.

Character aspect ratio is decisive: terminal glyphs are taller than they are wide, so uncorrected image sampling stretches the result. A practical conversion guide recommends rectangular sampling and identifies the ten-character density ramp as suitable for simple images ([ASCII rendering guide](https://lumitree.art/blog/ascii-art)). Research on synthesis likewise treats ASCII art as a character matrix reproducing grayscale or local image structure ([character-art generation paper](https://www.cs.hiroshima-u.ac.jp/cs/_media/ascii_art-final.pdf)).

### Concrete references

- **Remorse ASCII:** ACiD’s ASCII-focused sub-label; use its pack work as the monochrome counterpoint to ACiD ANSI.
- **Joan G. Stark (“jgs”):** compact line-art silhouettes with economical character choices; valuable for small terminal emblems rather than shaded portraits.
- **Christopher Johnson’s ASCII Art Collection:** useful for large logos, objects, and scene-scale silhouette composition ([collection](https://asciiart.website/)).

### PixiJS v8 translation

- For portraits/logos, downsample a source mask into character-sized cells, calculate luminance, then map through a calibrated glyph-coverage lookup—not merely the literal ramp order.
- Add edge awareness: Sobel direction can favor `/`, `\`, `_`, or `|`; use the density ramp only in flatter interior regions.
- Correct for the font’s measured glyph aspect ratio before sampling.
- Keep monochrome ASCII art on its own `Container`; a faint duplicate with additive/screen-like compositing can supply phosphor glow without softening the primary glyphs.
- For live background portraits, update only a fraction of cells per tick in a stable ordered pattern. That reads as terminal computation instead of video noise.

## 3. Terminal / TUI design

### What defines it

Terminal hierarchy comes from spatial rules:

- a fixed column grid;
- aligned label/value pairs;
- ruled regions made from box glyphs;
- reverse-video or color bars for selection;
- short uppercase labels and colon-delimited values;
- a persistent command line;
- a separate status row;
- whitespace as the principal separator.

The IBM 3270 is especially relevant. Its screen was defined as fields with position, display attributes, and content; subsequent writes could update only changed fields ([IBM 3270 field model](https://www.ibm.com/docs/en/cics-ts/5.5.0?topic=terminals-3270-display-fields)). Its bottom OIA exposed session, system, keyboard state, and cursor row/column, creating hierarchy without a graphic HUD ([IBM 3270 status-line reference](https://publib.boulder.ibm.com/netcom/html/mainhelp3270.htm)). The VT100 adds the canonical 80-column terminal, block/underline cursor choices, tabs, reverse screen, and cursor-addressed updates ([DEC VT100 User Guide](https://bitsavers.org/pdf/dec/terminal/vt100/EK-VT100-UG-001_VT100_User_Guide_Aug78.pdf)).

Teletext contributes chunkier information architecture: a page header, colored section labels, large mosaic headings, and strong horizontal bands. Its block mosaics are sixel-like 2×3 cell subdivisions rather than ANSI CP437, so borrow the layout rhythm, not the exact glyph mechanics.

### Concrete references

- **IBM 3270 / ISPF-style forms:** labels remain stationary while protected/unprotected fields communicate input affordance.
- **VT100 SET-UP screens:** sparse full-screen controls, ruler lines, tabs, and an unmistakable active cursor.
- **BBC/Ceefax teletext pages:** page number/time header, dense but aligned columns, colored categorical bands, and mosaic headings.

### PixiJS v8 translation

- Divide the surface into explicit rows: header `0–1`, system state `2–3`, game body `4–20`, prompt `21–22`, OIA `23`.
- Use a `Container` per panel and one data model for field labels/values. Update values without reconstructing borders.
- Give interactive cells a protected-field grammar: dim label, bright bracketed value, reverse-video hover, solid block cursor on keyboard focus.
- Preserve tab stops: all right-panel values begin at the same x-coordinate; all numeric fields right-align.
- Use no more than three border weights: single line, double line for system boundary, solid/reverse bar for alerts.

## 4. CRT / phosphor aesthetic

### What defines it

A CRT image is emitted light with time and intensity behavior. The electron beam scans a phosphor surface; brighter excitation produces stronger glow, and phosphor persistence is the decay after the beam leaves. A CRT technical reference explicitly notes that beam strength controls brightness, the complete image is not physically present at once, and persistence is the duration of continued phosphor emission ([CRT system reference](https://www.crt-mon.com/pdf/_CRT-Data/CRT-System.pdf)).

Therefore:

- scanlines should be modulated, not opaque black stripes;
- bloom should increase with source luminance;
- trails should decay, not blur equally in every direction;
- curvature should distort geometry and luminance near edges;
- noise should be low-amplitude and partly temporally coherent;
- cyan/white phosphor should have a bright near-white core and colored halo.

### Concrete references

- **P1 green / P3 amber / white terminal phosphors:** dark field, narrow luminous strokes, slight persistence.
- **Vector and radar displays:** intense points and lines with localized bloom and trails; useful for win-line and cursor emphasis.
- **WarGames WOPR/NORAD displays:** restrained type, tactical readouts, maps, and bright linework. The [HP 9845 “Screen Art: WarGames” reconstruction](https://www.hp9845.net/9845/software/screenart/wargames/) is a particularly useful production reference; the film’s tic-tac-toe sequence is documented in this [scene reference](https://www.filmsite.org/wargames.html).

### PixiJS v8 translation

Use separate passes:

1. **Sharp phosphor source:** nearest-neighbor cell rendering.
2. **Bloom:** downsample, blur, tint, and composite beneath the source using additive or screen-like blending.
3. **Persistence:** retain the previous frame in a render texture and decay it by roughly `0.86–0.94` per frame; add the new luminous frame. Clamp or tone-map to prevent washout.
4. **Scan:** custom shader with soft horizontal modulation in output pixels; make the effect weaker where bloom is strongest.
5. **Curvature:** mild barrel warp, maximum displacement around 1–2% at corners.
6. **Signal character:** tiny x-jitter on occasional frames, slow vertical brightness roll, and fine noise below 3% opacity.

PixiJS v8 supports filter chains including `BlurFilter`, `ColorMatrixFilter`, `DisplacementFilter`, and `NoiseFilter`, plus custom filters via `Filter.from`; filter order matters ([PixiJS filters guide](https://pixijs.com/8.x/guides/components/filters)). Keep distortion last so glow and primary image bend together.

Avoid chromatic aberration on a nominal monochrome terminal except as a very rare fault. It signals color television more than military data terminal.

## 5. BBS door-game splash screens and HUDs

### What defines them

Door games typically separate a spectacular first impression from economical play screens:

- title art consumes much of the splash screen;
- version/byline and “press a key” prompt anchor the bottom;
- play screens become dense lists of colored commands;
- hotkeys appear inside parentheses or brackets;
- status is expressed as aligned label/value columns;
- the final row carries command prompt, time, node, or connection data.

Their “dark sci-fi utilitarian” quality comes less from decoration than from terse nouns, live counters, commodity tables, and the feeling that every key has a system function.

### Concrete references

- **TradeWars 2002:** the title screen combines a large block logo, station/starfield image, and minimal continue prompt; the [Qodem screenshot](https://qodem.sourceforge.io/screenshots.html) is a clean target. Its trading screens arrange commodity, quantity, price, credits, and prompt as a compact data transaction; see this [color terminal example](https://cyan.garamon.de/color/).
- **Legend of the Red Dragon:** a theatrical title gives way to colored command lists and aligned player statistics. The [MobyGames screenshot set](https://www.mobygames.com/game/21738/legend-of-the-red-dragon/screenshots/) includes splash, main menu, character status, shops, and combat. The [status screen](https://www.mobygames.com/game/21738/legend-of-the-red-dragon/screenshots/dos/156588/) is especially useful for two-column label/value rhythm.
- **Operation: Overkill II:** use as a tonal reference for hostile post-apocalyptic terminology, scarcity readouts, and command-driven exploration. Accessible screenshot documentation is thinner than for TW2002 and LORD; do not let reconstructions outrank captured originals.

### PixiJS v8 translation

- Splash: 60–70% title/art, one version/byline row, one blinking prompt.
- Play: reserve the right 25–32 columns for `MOVE LOG`, `TACTICAL`, and `OUTCOME` panels.
- Color only the hotkey or changing value, not the whole sentence.
- Animate numeric updates by briefly flashing the changed glyphs to “hot white,” then decaying to cyan.
- Put connection fiction in the OIA: `WOPR LINK`, `NODE 01`, `ONLINE`, `LN 24 COL 18`.
- Treat audio/visual pauses as modem-era pacing: print short lines in bursts, then reveal the prompt. Do not type every paragraph character-by-character.

## 6. Faking 3D in 2D terminal art

### What defines it

ANSI depth is built from adjacency rather than perspective rendering:

- **bevel:** bright top/left, dark bottom/right;
- **extrusion:** repeat the silhouette one or two cells down-right and connect exposed corners;
- **drop shadow:** black or dark-blue duplicate offset `(1,1)`;
- **dithered plane:** change `░▒▓` density across a face;
- **isometric edge:** stair-step diagonals with `/`, `\`, half blocks, and alternating cell widths;
- **occlusion:** allow a logo or panel tab to interrupt a border;
- **cast shadow:** a sparse dark field that expands away from the object.

Box and block characters were explicitly used for fills and drop shadows in text interfaces ([box-drawing reference](https://en.wikipedia.org/wiki/Box-drawing_characters)).

### Concrete references

- **ACiD/iCE BBS advertisements:** large board names commonly use outline → face → highlight → extrusion.
- **TradeWars 2002 title screen:** logo and space-station art combine block silhouettes with sparse stars and a strong foreground/background split.
- **Blocktronics long-form ANSI:** modern work extends the same cell logic into elaborate lighting and perspective; [Sixteen Colors / Blocktronics](https://blocktronics.org/) is the entry point.

### PixiJS v8 translation

- Generate title masks in cell space. Use morphological dilation for outline, translated masks for shadow/extrusion, and a directional edge test for highlight.
- Quantize faux lighting to 4–5 bands. Smooth gradients break the ANSI illusion.
- Use half-block glyphs to gain vertical subcell resolution while retaining authentic text texture.
- Keep shadows opaque and cell-shaped in the source layer; reserve blur for the phosphor pass.
- For the board, use a one-cell dark extrusion under/right of pale grid strokes. On hover, brighten only the top/left rim of the selected cell.

## 7. Animation language

Historical ANSI animation relies on cursor positioning and overwriting cells. TheDraw supported both ANSI and animation, and Roy/SAC’s [ANSI animation collection](https://www.roysac.com/ansianim.html) provides converted examples.

Recommended motifs:

- cursor: `█` on/off at 2 Hz, with a soft persistence tail;
- thinking prompt: cycle `| / - \` at 8–10 fps;
- loading: overwrite `░▒▓█`, one cell at a time;
- alert: alternate normal/reverse video two or three times, then settle;
- scan: brighten one table row as a selector or diagnostic sweep;
- boot: reveal by line bursts with irregular 30–120 ms pauses;
- modem fault: one-frame horizontal displacement of 1–3 cells, very infrequently;
- win analysis: rapidly play several ghost boards, then freeze on `A STRANGE GAME`.

Animate at deliberately quantized rates. The primary glyph plane can update at 8–15 fps while the phosphor decay runs every display frame.

## 8. Specific-reference audit

### “TIC TAC TOE” ANSI title

No clearly attributable BBS art-pack ANSI title reading exactly **TIC TAC TOE** was verified in the indexed archives during this research. A useful period near-match is the 1982 DOS text-mode game shown by [RetroGames.cz](https://www.retrogames.cz/play_1648-DOS.php): large plain title, numbered character grid, and direct keyboard prompt. Treat it as layout evidence, not ACiD/iCE-style ANSI.

For the actual project title, construct a new CP437 block logo using the verified ACiD/iCE/TheDraw grammar above. This is preferable to presenting an unattributed web image as historical evidence.

### TheDraw construction

The available screenshot demonstrates the editor and an ANSI loaded in it, but not a formal step-by-step logo tutorial. The historically grounded construction sequence is:

`mask → one-cell outline → face fill → top/left highlight → bottom/right shade → offset extrusion`.

Recreate this sequence in the modern AnsiDraw editor or directly in the game’s cell renderer and save each stage as an internal design plate.

### Best HUD targets

1. LORD player status: two-column labeled statistics.
2. TradeWars commerce: table + current resources + immediate prompt.
3. IBM 3270 OIA: persistent bottom operational status.
4. WarGames tactical displays: restrained, institutional nomenclature and alert pacing.

## 9. Implementation recipe

### Layer stack

```text
CRT glass / reflection (very subtle)
barrel warp + edge vignette
scan modulation + noise
sharp terminal render texture
bloom render texture
persistence history texture
navy screen field
```

### Component plan

- `TerminalGrid`: 80×25 cell buffer and dirty-cell updates.
- `GlyphAtlas`: CP437 bitmap atlas with normal and bright palette indices.
- `AnsiLogo`: generated masks for face, outline, highlight, and extrusion.
- `PanelLayout`: borders, tab stops, labels, protected fields.
- `TerminalAnimator`: overwrite operations and quantized timelines.
- `PhosphorFilter`: scan, barrel distortion, vignette, brightness-weighted bloom.
- `PersistencePass`: ping-pong render textures with exponential decay.

### Restraint rules

- Keep 80–90% of the screen near black.
- Use one main phosphor family; reserve amber/red for warnings.
- No smooth UI tweening; move or replace whole cells.
- No rounded cards, glassmorphism, or modern iconography.
- No continuous heavy glitch. A stable machine makes rare faults more convincing.
- Do not blur the source glyphs. Glow a duplicate underneath.

## Reference shortlist

- [Sixteen Colors: ACiD archive](https://16colo.rs/group/acid)
- [iCE Advertisements gallery](https://www.ansigallery.com/group/ice)
- [TheDraw overview and screenshot](https://en.wikipedia.org/wiki/TheDraw)
- [ANSI animation examples](https://www.roysac.com/ansianim.html)
- [TradeWars 2002 in Qodem](https://qodem.sourceforge.io/screenshots.html)
- [Legend of the Red Dragon screenshot set](https://www.mobygames.com/game/21738/legend-of-the-red-dragon/screenshots/)
- [IBM 3270 field model](https://www.ibm.com/docs/en/cics-ts/5.5.0?topic=terminals-3270-display-fields)
- [IBM 3270 OIA/status line](https://publib.boulder.ibm.com/netcom/html/mainhelp3270.htm)
- [DEC VT100 User Guide](https://bitsavers.org/pdf/dec/terminal/vt100/EK-VT100-UG-001_VT100_User_Guide_Aug78.pdf)
- [WarGames HP 9845 screen-art reconstruction](https://www.hp9845.net/9845/software/screenart/wargames/)
- [PixiJS v8 filters and blend modes](https://pixijs.com/8.x/guides/components/filters)

