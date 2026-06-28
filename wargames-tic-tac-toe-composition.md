# WarGames-Style Tic-Tac-Toe Composition Specification

Create a retro military-computer tic-tac-toe interface inspired by the visual language of *WarGames*: austere, ominous, analog, and slightly degraded, as though displayed on a Cold War command-center CRT.

## Overall Composition

The image is nearly square, approximately 386 × 336 pixels, viewed straight-on. A large CRT display occupies roughly the upper 85% of the frame, with a narrow instrument panel running along the bottom.

Everything is enclosed in a heavy, almost-black monitor housing. The screen is centered but subtly imperfect: its outer border is not mathematically square, and the right edge leans outward slightly. This tiny distortion should feel optical or analog, not like careless layout.

The visual hierarchy is:

1. Dark monitor casing
2. Thin glowing rectangular screen border
3. Oversized tic-tac-toe grid and symbols
4. Four tiny status readouts beneath the screen

There are no menus, buttons, logos, decorative icons, instructions, or modern interface controls.

## Monitor Housing

The casing is deep blue-black, charcoal, and nearly pure black. It should feel thick, industrial, recessed, and built into a military console.

The outermost background is almost black: approximately `#03090E` to `#071019`.

Use several subtle layers around the screen:

- A thick black outer frame
- A narrow blue-black inner bevel
- Slightly lighter vertical rails on the left and right
- A shallow horizontal lip above the screen
- A dark lower ledge separating the CRT from the status panel

The housing should not be crisply visible everywhere. Most of its form is revealed only by faint blue edge reflections.

Add restrained physical texture:

- Fine horizontal scanlines
- Uneven darkness around the edges
- Soft corner vignetting
- Slight vertical streaks in the bezel
- Very faint reflected blue highlights
- Mild analog blur
- A trace of film grain or electronic noise

Avoid obvious rust, scratches, cyberpunk decoration, neon trim, or futuristic glossy materials. It is a practical Cold War machine, not a modern “retro-themed” gaming cabinet.

## CRT Screen

The active display is a very dark navy-black rectangle, approximately:

- Left edge: 8% of the image width
- Right edge: 92%
- Top edge: 12%
- Bottom edge: 85%

The screen interior is approximately `#07111B`, becoming slightly lighter and bluer near its center. Corners are darker due to CRT falloff.

The screen is framed by a thin luminous off-white border. This border is one of the brightest elements in the image.

Border characteristics:

- About 2–3 pixels thick at the reference resolution
- Cool white with a faint blue cast
- Approximately `#E4EBEA`
- Mild bloom around the line
- Slight softness rather than vector-perfect sharpness
- Tiny geometric irregularity suggesting lens distortion or an old display
- No rounded UI-card styling

The inner screen should appear almost flat, but a very subtle convex CRT distortion is welcome.

## Tic-Tac-Toe Board

The board dominates the display. It is centered horizontally and sits slightly above the screen’s vertical midpoint.

The board occupies approximately:

- 58% of the full image width
- 65% of the active screen height

Its visible bounds are roughly:

- Left: 21% of the image width
- Right: 79%
- Top: 15%
- Bottom: 81%

The board contains the standard four grid strokes:

- Two vertical lines
- Two horizontal lines

The lines are thick, pale blue, and softly luminous. They are about 6–7 pixels thick at a 386-pixel image width.

Approximate grid-line placement:

- First vertical line: 40% of image width
- Second vertical line: 59% of image width
- First horizontal line: 36% of image height
- Second horizontal line: 58% of image height

The grid is not enclosed by an outer square.

The horizontal strokes extend slightly beyond the outer columns. The vertical strokes similarly extend a little above the top row and below the bottom row. This gives the board the look of four intersecting luminous strokes rather than nine boxed cells.

The grid is subtly irregular:

- Horizontal lines are not perfectly level
- Vertical lines are not perfectly parallel
- Stroke ends are blunt but softened by bloom
- Intersections are slightly brighter
- Alignment feels hand-plotted by an old vector terminal

Do not make the board perfectly crisp, thin, or geometrically sterile.

## Exact Game State

The nine cells contain:

| Row | Left | Center | Right |
| --- | --- | --- | --- |
| Top | X | O | Empty |
| Middle | X | X | O |
| Bottom | O | X | O |

Represented compactly:

```text
X | O |
--+---+--
X | X | O
--+---+--
O | X | O
```

Preserve this exact reference state rather than “correcting” it into a winning board.

## X Symbols

The X marks are formed from two broad diagonal strokes. Their proportions are tall and fairly narrow, resembling a utilitarian vector-terminal glyph rather than handwritten chalk.

Characteristics:

- Same pale icy blue as the grid
- Approximately 7–9 pixels thick
- Square or blunt stroke ends
- Slightly rounded by CRT bloom
- Almost the full height of each cell
- Mild asymmetry between individual marks
- No outline, shadow, fill texture, or animation trail

There are four X marks:

- Top-left
- Middle-left
- Center
- Bottom-center

Some X strokes nearly touch the grid lines. The marks should feel crowded and oversized.

## O Symbols

The O marks are thick oval rings rather than perfect geometric circles.

Characteristics:

- Vertically oriented or nearly circular
- Heavy monoline stroke
- Hollow dark center
- Approximately 8–10 pixels thick
- Soft luminous edge
- Slight shape irregularity
- Similar overall visual weight to the X marks

There are four O marks:

- Top-center
- Middle-right
- Bottom-left
- Bottom-right

The bottom-left O is especially broad and slightly squat. The right-column O marks are close to the right vertical grid line and feel tightly fitted within their cells.

## Color and Glow

Use a restrained two-color display palette.

Primary display blue:

- Core stroke: approximately `#91B9EF`
- Bright edge: approximately `#A9CBF7`
- Bloom: muted `#547DAA` at low opacity

Screen and housing:

- Screen center: `#08131E`
- Screen edges: `#030A11`
- Bezel: `#02070B` to `#0A1620`

The glow must remain soft and modest. The symbols should look phosphorescent, not like modern saturated neon.

Recommended effects:

- 1–2 pixel bright core
- 2–5 pixel subtle blue bloom
- Very slight chromatic bleed
- Gentle horizontal smearing
- Low-opacity scanlines across the entire screen
- Tiny brightness fluctuations or flicker if animated

Avoid cyan, electric blue, purple, magenta, green phosphor, or multicolored RGB glitching.

## Bottom Status Panel

Below the screen is a narrow black instrument strip. It begins just beneath the lower white screen border and runs to the bottom of the image.

Four small readout groups are evenly distributed across this strip. Each group contains:

1. A tiny white uppercase label
2. A larger orange-red four-digit number beneath it

Approximate horizontal centers:

- 12%
- 38%
- 63%
- 89%

The labels are extremely small, condensed, blocky, and slightly blurred. They resemble abbreviated system or strategic-status identifiers. Exact wording is less important than the visual effect, but the reference appears approximately like:

- `GNR STS`
- `APL STS`
- `EOT STS`
- `PAC STS`

The values appear approximately as:

- `3603`
- `9071`
- `4531`
- `8838`

Use the numbers exactly if reproducing the composition.

Label styling:

- Off-white or pale gray
- Condensed uppercase bitmap font
- About one-third the height of the number
- Tight tracking
- Dimmer than the main display

Number styling:

- Orange-red phosphor, around `#F06B49`
- Narrow segmented or bitmap terminal numerals
- Mild red bloom
- Roughly 10–12 pixels tall at the reference size
- Centered beneath each label

Each group sits in a subtly recessed dark compartment, separated by almost invisible vertical shadows. Do not add visible cards or boxes around them.

## Typography

Use a font that resembles:

- A compact seven-segment display
- A narrow bitmap terminal face
- An early military computer readout
- A degraded technical stencil at very small sizes

Do not use polished modern sans-serif fonts, rounded UI fonts, serif typography, or prominent title text.

## Image Treatment

The final image should feel like a photographed or filmed physical CRT—not a clean screenshot.

Apply:

- Soft global focus
- Low-resolution texture
- Fine horizontal scanlines
- Mild phosphor bloom
- Slight barrel distortion
- Dark edge vignette
- Subtle analog noise
- Very weak brightness variation
- Faint blue-black reflections in the bezel
- Tiny red bleed around the numeric readouts

Keep the degradation tasteful. The board and game state must remain immediately legible.

## Mood

The emotional tone is quiet, tense, clinical, and ominous. It should evoke an autonomous defense computer presenting a deceptively simple game during a high-stakes strategic simulation.

The strongest stylistic principle is contrast: a childishly simple tic-tac-toe board presented with the grave visual authority of a nuclear command-and-control system.

## Concise Generation Prompt

> Create a nearly square, straight-on close-up of a recessed Cold War military CRT console in the visual style of *WarGames*. The thick housing is almost black with faint navy-blue bevels and a narrow bottom instrument panel. Inside the CRT is a dark blue-black screen surrounded by a thin, softly glowing off-white rectangular border. Center an oversized pale icy-blue tic-tac-toe board made from four thick, slightly imperfect luminous strokes, with blunt ends and mild CRT bloom. Exact cells: top row X, O, empty; middle row X, X, O; bottom row O, X, O. Make the X and O glyphs very large, crowded, heavy, and slightly irregular, like old vector-terminal graphics. Beneath the screen, place four tiny military status readouts: small condensed white labels over glowing orange-red numbers 3603, 9071, 4531, and 8838. Add subtle scanlines, analog blur, phosphor glow, corner vignetting, low-resolution grain, faint barrel distortion, and subdued bezel reflections. No modern UI, no buttons, no title, no saturated cyberpunk neon. Quiet, clinical, ominous nuclear-command atmosphere.
