# Tic Tac Toe — WarGames Terminal

A single-player tic-tac-toe game that looks and feels like a Cold War military computer terminal. The player is X, the computer is O. You click an empty cell to place your mark, and the AI responds with a deeply analyzed countermove. Three in a row wins. A full board with no winner is a draw.

The computer uses a perfect strategy — it never loses. Every game is a hard-fought draw unless you make a mistake. It also randomizes its first move so every game starts differently.

## The Look

The whole thing is built inside a chunky CRT monitor housing made of deep navy-blue and near-black. The screen itself is a dark blue-black rectangle, recessed into the housing. Across the screen, fine horizontal scanlines are faintly visible.

The game board is drawn as four thick, pale icy-blue glowing lines — two vertical, two horizontal — that intersect to form a 3×3 grid. The lines are slightly imperfect and extend a little past the outermost cells. There is no box around the board; it is just four luminous strokes crossing.

X marks are two thick diagonal strokes in the same icy blue. O marks are thick oval rings. When someone wins, the three winning cells glow with a soft green highlight.

At the very bottom of the screen, below the board, is a narrow status panel with four small readouts: total moves, X wins, O wins, and draws. Each value is displayed in glowing orange-red numbers.

## The Title Screen

The title screen looks like a system terminal waiting for a command. A rectangular frame made of box-drawing characters surrounds the display area, with tiny gaps and broken segments that make it feel like a slightly degraded display. The top-left corner of the frame reads `NOVPR V1.0 | SIMULATION: TIC-TAC-TOE | NODE 0`. The bottom-left reads `CMD> | CELL---- | LN 12 COL 24 | ONLINE-----` with the line and column numbers updating as you move your mouse across the screen.

In the center of the screen, the words "TIC TAC TOE" sit in big, heavy, blocky industrial lettering with a glowing cyan halo. The letters appear to be extruded — you can see deep shadow layers behind them and a bright rim of light catching their top-left edges. They fade in slowly when the screen first appears.

Beneath the title, a blinking terminal cursor sits next to the words `> START GAME <`. A smaller line below reads `CLICK ANYWHERE TO BEGIN`. The whole screen has a quiet, waiting feel — like a simulation standing by.

Below the terminal frame, the same four status readouts appear: MOVE, X WIN, O WIN, DRAW, all showing zeroes. And just above the bottom status bar, faint text reads "SKINNERBOX ENTERTAINMENT."

Behind everything, the entire screen has a barely-visible animated texture — thousands of tiny shade characters quietly cycling through different fill levels, with independent layers in front of and behind the title. When you move your mouse around, the cells nearest your cursor glow slightly brighter, then slowly fade back.

Every few seconds, a brief glitch flashes across the screen — some characters in the header and footer scramble into garbage symbols, the logo shifts sideways by a pixel, and the whole thing flickers before snapping back to normal. It lasts only two frames.

## The Game Screen

The game screen keeps the same monitor housing and scanlines. The board appears in the center. Above it, a small "GAME OVER." message types out one character at a time when a game ends, pauses, then types "AGAIN?" on the next line. A block cursor follows each character as it appears. After the message completes, the last character blinks. You can click to play again, or after about eight seconds the screen returns to the title.

## The Simulation Mode

Typing W-O-P-R on the title screen triggers a hidden sequence. The computer begins playing itself at rapidly accelerating speed — the board fills with X and O marks faster and faster until the screen becomes a flickering blur of cyan light. The status counters tick up frantically. Noise grain intensifies. Then everything stops. A blinding white flash washes over the screen. Audio cuts. Silence.

A moment later, two lines of text type out across the frozen board:

> A STRANGE GAME.
> THE ONLY WINNING MOVE IS NOT TO PLAY.

Then the screen fades back to the title.

## The Sounds

- A short tone when you place your X, a slightly different one when the AI places its O
- A low ambient drone that plays in the background
- A soft looping hum that plays whenever text is typing out on screen
- Deep silence during the simulation mode's final moments

## The Colors

The entire visual language is built from one family of blue-cyan. The dark background is near-black navy. The lines, text, and marks are a bright teal-cyan. The brightest highlights are a pale ice blue. The only thing that breaks this palette is the status readouts, which glow in a warm orange-red — like missile-command telemetry.

The feeling is: a childishly simple game presented with the ominous visual authority of a nuclear defense computer. The simplicity of tic-tac-toe is contrasted against the gravity of the terminal that hosts it. It should feel quiet, clinical, and slightly menacing — like a machine is choosing to play a game with you while running more important calculations in the background.
