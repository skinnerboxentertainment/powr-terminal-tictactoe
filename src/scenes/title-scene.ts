import { Container, Graphics, Text, NoiseFilter, BlurFilter, type Application, Rectangle } from "pixi.js"
import type { Scene } from "../core/types"
import type { SceneManager } from "../core/scene-manager"
import type { InputManager as InputManagerType } from "../core/input-manager"
import { getConfig, type GameplayConfig } from "../core/config"
import { audioManager } from "../audio/audio-manager"
import { TerminalGrid } from "../core/terminal-grid"
import { sessionStats } from "../core/session-stats"
import { GameScene } from "./game-scene"
import { SimulationScene } from "./simulation-scene"

export class TitleScene implements Scene {
  private container = new Container()
  private screenContent = new Container()
  private noiseFilter = new NoiseFilter({ noise: 0.06, seed: 0 })
  private logoNoise = new NoiseFilter({ noise: 0.2, seed: 0 })
  private logoContainer = new Container()
  private glowFilter = new BlurFilter({ strength: 16 })

  private housingG = new Graphics()
  private screenG = new Graphics()
  private scanlineG = new Graphics()
  private vignetteG = new Graphics()
  private fullNoiseBg = new Graphics()

  private ansiGrid = new TerminalGrid(50, 22)
  private promptText = new Text({ text: "", style: { fontFamily: "monospace", fontSize: 16, fill: 0x00b7c7 } })
  private cursorText = new Text({ text: "_", style: { fontFamily: "monospace", fontSize: 16, fill: 0x00b7c7 } })
  private subtitleText = new Text({ text: "", style: { fontFamily: "monospace", fontSize: 12, fill: 0x087f8c } })
  private bannerGrid = new TerminalGrid(50, 22)
  private fgGrid = new TerminalGrid(50, 22)
  private fgPhase = 0
  private fgTick = 0
  private fgRampCells = new Map<string, { cur: number; tgt: number }>()

  private glowChars: Text[] = []
  private shadowChars: Text[] = []
  private extDeepChars: Text[] = []
  private extMidChars: Text[] = []
  private coreChars: Text[] = []
  private rimChars: Text[] = []
  private faceChars: Text[] = []
  private charStates: { timer: number; corrupt: boolean; age: number }[] = []
  private bannerSeeds: number[][] = []

  private app: Application
  private stage: Container
  private sceneManager: SceneManager
  private input: InputManagerType

  private screenLeft = 0
  private screenTop = 0
  private screenRight = 0
  private screenBottom = 0
  private cursorVisible = true
  private cursorTimer = 0
  private animFrame = 0
  private animating = true
  private bannerPhase = 0
  private bannerTick = 0
  private glitchTimer = 0
  private glitching = false
  private headerStr = ""
  private footerStr = ""
  private bannerCellSize = 0
  private footerCellSize = 0
  private lastFooterCell = -1
  private creditHovered = false
  private creditRampingDown = false
  private creditAnimFrame = 0
  private creditCharStates: number[] = []
  private creditSpeeds: number[] = []
  private creditDownSpeeds: number[] = []
  private creditRow = 0
  private creditCol = 17
  private creditText = "SKINNERBOX ENTERTAINMENT"
  private keyBuffer = ""
  private rampCells = new Map<string, { cur: number; tgt: number }>()
  private static RAMP_UP = 0.06
  private static RAMP_DOWN = 0.0008
  private static BANNER_BASE_ALPHA = 0.12
  private static BANNER_HOVER_ALPHA = 1.0
  private static GLITCH_CHARS = "╪╬╫╨╥┴┬├┤┼╡╢╖╕╣║═╔╗╚╝░▒▓█"
  private static LOGO_TEXT = "TIC TAC TOE"
  private static GLITCH_VARIANTS: Record<string, string[]> = {
    T: ["Ŧ", "Ť", "Ţ", "Ṫ", "Ŧ"],
    I: ["Ɨ", "Ǐ", "Ĩ", "Ï", "Ḯ"],
    C: ["Ç", "Ĉ", "Č", "Ċ", "ç"],
    A: ["À", "Á", "Â", "Ã", "Ä", "Å", "Ă", "Ǎ"],
    O: ["Ò", "Ó", "Ô", "Õ", "Ö", "Ø", "Ő"],
    E: ["È", "É", "Ê", "Ë", "Ě", "Ē"],
  }
  private static BANNER_CYCLE = "█▓▒░▒▓"

  constructor(app: Application, stage: Container, sceneManager: SceneManager, input: InputManagerType) {
    this.app = app
    this.stage = stage
    this.sceneManager = sceneManager
    this.input = input
  }

  enter(): void {
    const cfg = getConfig()
    this.screenContent.filters = [this.noiseFilter]
    this.logoContainer.filters = [this.logoNoise]

    this.container.addChild(this.housingG)
    this.container.addChild(this.screenG)
    this.container.addChild(this.screenContent)
    this.screenContent.addChild(this.fullNoiseBg)
    this.screenContent.addChild(this.scanlineG)
    this.screenContent.addChild(this.ansiGrid.container)
    this.screenContent.addChild(this.logoContainer)
    this.screenContent.addChild(this.fgGrid.container)
    this.screenContent.addChild(this.promptText)
    this.screenContent.addChild(this.cursorText)
    this.screenContent.addChild(this.subtitleText)
    this.container.addChild(this.vignetteG)
    this.stage.addChild(this.container)

    this.animFrame = 0
    this.animating = true
    this.bannerPhase = 0
    this.bannerTick = 0
    this.fgPhase = 0
    this.fgTick = 0
    this.bannerSeeds = []
    for (let r = 0; r < 22; r++) {
      this.bannerSeeds[r] = []
      for (let c = 0; c < 50; c++) this.bannerSeeds[r][c] = Math.floor(Math.random() * 6)
    }
    this.glitchTimer = 0
    this.glitching = false
    this.charStates = []
    for (let i = 0; i < 11; i++) this.charStates.push({ timer: Math.random() * 200, corrupt: false, age: 0 })

    this.layout(cfg)
    audioManager.playMusic("bg")
  }

  private layout(cfg: GameplayConfig): void {
    const sw = this.app.screen.width
    const sh = this.app.screen.height
    const cs = Math.min(sw, sh)
    const cx = (sw - cs) / 2
    const cy = (sh - cs) / 2

    this.screenLeft = cx + cs * cfg.screen_inset_left
    this.screenTop = cy + cs * cfg.screen_inset_top
    this.screenRight = cx + cs * cfg.screen_inset_right
    this.screenBottom = cy + cs * cfg.screen_inset_bottom

    this.fullNoiseBg.clear()
    this.fullNoiseBg.rect(0, 0, sw, sh)
    this.fullNoiseBg.fill({ color: cfg.screen_color })

    this.drawHousing(cfg, cx, cy, cs)
    this.drawScreenFill(cfg)
    this.drawTerminalFrame(cfg, cs)
    this.drawBanner(cfg)
    this.drawFgBanner(cfg)
    this.drawLogo(cfg, cs)
    this.drawPrompt(cfg, cs)
    this.drawStatusPanel(cfg, cx, cy, cs)
    this.drawScanlines(cfg)
    this.drawVignette(cfg, cx, cy, cs)
  }

  private drawHousing(cfg: GameplayConfig, cx: number, cy: number, cs: number): void {
    const g = this.housingG
    g.clear()
    g.rect(cx, cy, cs, cs)
    g.fill({ color: cfg.screen_color })
    const bi = cs * 0.02
    g.rect(cx + bi, cy + bi, cs - bi * 2, cs - bi * 2)
    g.fill({ color: cfg.bezel_color })
  }

  private drawScreenFill(cfg: GameplayConfig): void {
    const g = this.screenG
    g.clear()
    const sx = this.screenLeft
    const sy = this.screenTop
    g.rect(sx, sy, this.screenRight - sx, this.screenBottom - sy)
    g.fill({ color: cfg.screen_color })
    this.screenContent.filterArea = new Rectangle(sx, sy, this.screenRight - sx, this.screenBottom - sy)
  }

  private drawBanner(cfg: GameplayConfig): void {
    if (this.bannerGrid.container.parent) this.bannerGrid.container.parent.removeChild(this.bannerGrid.container)

    const sw = this.screenRight - this.screenLeft
    const sh = this.screenBottom - this.screenTop
    const cellSize = Math.min(sw / 50, sh / 22)
    const cycle = TitleScene.BANNER_CYCLE

    this.bannerGrid.setCellSize(cellSize, cellSize)
    this.bannerGrid.setPosition(this.screenLeft, this.screenTop)
    this.bannerCellSize = cellSize
    this.updateBannerCells(this.bannerPhase, cfg.grid_color)
    this.bannerGrid.render()
    this.bannerGrid.setAllAlpha(TitleScene.BANNER_BASE_ALPHA)
    this.bannerGrid.container.alpha = 1
    this.screenContent.addChildAt(this.bannerGrid.container, 1)
  }

  private drawFgBanner(cfg: GameplayConfig): void {
    if (this.fgGrid.container.parent) this.fgGrid.container.parent.removeChild(this.fgGrid.container)

    const sw = this.screenRight - this.screenLeft
    const sh = this.screenBottom - this.screenTop
    const cellSize = Math.min(sw / 50, sh / 22)

    this.fgGrid.setCellSize(cellSize, cellSize)
    this.fgGrid.setPosition(this.screenLeft, this.screenTop)
    this.updateFgCells(this.fgPhase, cfg.grid_color)
    this.fgGrid.render()
    this.fgGrid.setAllAlpha(TitleScene.BANNER_BASE_ALPHA * 0.5)
    this.fgGrid.container.alpha = 1
  }

  private updateBannerCells(phase: number, color: number): void {
    const cycle = TitleScene.BANNER_CYCLE
    const len = cycle.length
    for (let r = 0; r < 22; r++) {
      for (let c = 0; c < 50; c++) {
        this.bannerGrid.setChar(r, c, cycle[(this.bannerSeeds[r][c] + phase) % len], color)
      }
    }
  }

  private updateFgCells(phase: number, color: number): void {
    const cycle = TitleScene.BANNER_CYCLE
    const len = cycle.length
    for (let r = 0; r < 22; r++) {
      for (let c = 0; c < 50; c++) {
        this.fgGrid.setChar(r, c, cycle[(this.bannerSeeds[r][c] + phase + 3) % len], color)
      }
    }
  }

  private drawTerminalFrame(cfg: GameplayConfig, cs: number): void {
    const grid = this.ansiGrid
    const sw = this.screenRight - this.screenLeft
    const sh = this.screenBottom - this.screenTop
    const cellSize = Math.min(sw / 50, sh / 22)
    this.footerCellSize = cellSize
    grid.setCellSize(cellSize, cellSize)
    grid.setPosition(this.screenLeft, this.screenTop)
    grid.clear()

    const w = 50; const h = 22
    grid.fillRect(0, 0, 1, w, "─", cfg.grid_color, cfg.screen_color)
    grid.setChar(0, 0, "┌", cfg.grid_color); grid.setChar(0, w - 1, "┐", cfg.grid_color)
    for (let r = 1; r < h - 1; r++) { grid.setChar(r, 0, "│", cfg.grid_color); grid.setChar(r, w - 1, "│", cfg.grid_color) }
    grid.fillRect(h - 1, 0, 1, w, "─", cfg.grid_color)
    grid.setChar(h - 1, 0, "└", cfg.grid_color); grid.setChar(h - 1, w - 1, "┘", cfg.grid_color)
    this.headerStr = `POWR v1.0  │  SKINNERBOX ENTERTAINMENT  │  NODE 01`
    this.footerStr = `CMD>   CELL _  │  LN 12 COL 24  │  ONLINE`
    grid.setText(0, 2, this.headerStr, cfg.glow_color)
    grid.setText(h - 1, 2, this.footerStr, cfg.glow_color)
    grid.render()
  }

  private drawLogo(cfg: GameplayConfig, cs: number): void {
    const text = "TIC TAC TOE"
    const fs = cs * 0.104
    const cx = (this.screenLeft + this.screenRight) / 2
    const cy = (this.screenTop + this.screenBottom) / 2 - 140
    const charW = fs * 0.6 + 8
    const totalW = 11 * charW
    const startX = cx - totalW / 2 + charW / 2
    const layers = [
      { name: "glow", fill: cfg.glow_color, dx: 0, dy: 0, stroke: null as null, filter: this.glowFilter, alpha: 0 },
      { name: "shadow", fill: 0x000000, dx: 5, dy: 5, stroke: null, filter: null, alpha: 0 },
      { name: "extDeep", fill: 0x022a33, dx: 3, dy: 3, stroke: null, filter: null, alpha: 0 },
      { name: "extMid", fill: 0x044a55, dx: 2, dy: 2, stroke: null, filter: null, alpha: 0 },
      { name: "face", fill: cfg.grid_color, dx: 0, dy: 0, stroke: { color: 0x043a4a, width: 3 }, filter: null, alpha: 0 },
      { name: "core", fill: cfg.grid_bright, dx: 0, dy: 0, stroke: { color: cfg.grid_color, width: 1 }, filter: null, alpha: 0 },
      { name: "rim", fill: cfg.border_color, dx: -1, dy: -1, stroke: null, filter: null, alpha: 0 },
    ]

    for (const layer of layers) {
      const arr: Text[] = []
      for (let i = 0; i < 11; i++) {
        const t = new Text({
          text: text[i],
          style: {
            fontFamily: "monospace",
            fontSize: fs,
            fill: layer.fill,
            stroke: layer.stroke ?? undefined,
          },
        })
        t.anchor.set(0.5)
        t.position.set(startX + i * charW + layer.dx, cy + layer.dy)
        t.alpha = layer.alpha
        if (layer.filter) t.filters = [layer.filter]
        this.logoContainer.addChild(t)
        arr.push(t)
      }
      if (layer.name === "glow") this.glowChars = arr
      else if (layer.name === "shadow") this.shadowChars = arr
      else if (layer.name === "extDeep") this.extDeepChars = arr
      else if (layer.name === "extMid") this.extMidChars = arr
      else if (layer.name === "face") this.faceChars = arr
      else if (layer.name === "core") this.coreChars = arr
      else if (layer.name === "rim") this.rimChars = arr
    }
  }

  private drawPrompt(cfg: GameplayConfig, cs: number): void {
    const ps = Math.max(12, cs * 0.025)
    this.promptText.text = ">  START GAME  <"
    this.promptText.style = { fontFamily: "monospace", fontSize: ps, fill: cfg.grid_color, letterSpacing: 3 }
    this.promptText.anchor.set(0.5)
    this.promptText.position.set((this.screenLeft + this.screenRight) / 2, this.screenTop + cs * 0.62)

    this.cursorText.style = { fontFamily: "monospace", fontSize: ps, fill: cfg.grid_color }
    this.cursorText.anchor.set(0, 0.5)
    this.cursorText.position.set(this.promptText.x + this.promptText.width / 2 + 4, this.promptText.y)

    this.subtitleText.text = "CLICK ANYWHERE TO BEGIN"
    this.subtitleText.style = { fontFamily: "monospace", fontSize: Math.max(10, cs * 0.016), fill: cfg.glow_color, letterSpacing: 2 }
    this.subtitleText.anchor.set(0.5)
    this.subtitleText.position.set(this.promptText.x, this.promptText.y + cs * 0.04)
  }

  private drawStatusPanel(cfg: GameplayConfig, cx: number, cy: number, cs: number): void {
    const panelY = this.screenBottom
    const panelH = (cy + cs) - panelY
    const g = new Graphics()
    g.rect(cx, panelY, cs, panelH)
    g.fill({ color: cfg.screen_color })
    this.container.addChildAt(g, 0)

    const centers = [0.12, 0.38, 0.63, 0.89]
    const labels = ["MOVE", "X WIN", "O WIN", "DRAW"]
    const vals = [
      String(sessionStats.moveCount).padStart(4, "0"),
      String(sessionStats.xWins).padStart(4, "0"),
      String(sessionStats.oWins).padStart(4, "0"),
      String(sessionStats.draws).padStart(4, "0"),
    ]
    const labelSize = Math.max(8, cs * 0.022)
    const valueSize = Math.max(10, cs * 0.034)

    for (let i = 0; i < 4; i++) {
      const lab = new Text({
        text: labels[i],
        style: { fontFamily: "monospace", fontSize: labelSize, fill: cfg.status_label_color, letterSpacing: 1 },
      })
      lab.anchor.set(0.5, 0)
      lab.position.set(cx + cs * centers[i], panelY + cs * 0.012)
      this.container.addChild(lab)

      const val = new Text({
        text: vals[i],
        style: { fontFamily: "monospace", fontSize: valueSize, fill: cfg.status_number_color, letterSpacing: 2 },
      })
      val.anchor.set(0.5, 0)
      val.position.set(cx + cs * centers[i], panelY + cs * 0.034)
      this.container.addChild(val)
    }
  }

  private drawScanlines(cfg: GameplayConfig): void {
    const g = this.scanlineG
    g.clear()
    const sx = this.screenLeft; const sy = this.screenTop
    const sw = this.screenRight - sx; const sh = this.screenBottom - sy
    for (let y = sy; y < sy + sh; y += 2) g.rect(sx, y, sw, 1)
    g.fill({ color: 0x000000, alpha: cfg.scanline_opacity })
  }

  private drawVignette(cfg: GameplayConfig, cx: number, cy: number, cs: number): void {
    const g = this.vignetteG
    g.clear()
    g.rect(cx, cy, cs, cs)
    g.fill({ color: 0x000000, alpha: cfg.vignette_strength * 0.08 })
  }

  update(_dt: number): void {
    this.noiseFilter.seed = Math.random()
    this.logoNoise.seed = Math.random()
    this.animateLogo()
    this.updateBanner()
    this.updateFgBanner()
    this.updateBannerHover()
    this.updateFgHover()
    this.updateRampCells()
    this.updateFgRampCells()
    this.updateCharGlitch()
    this.updateGlitch()
    this.updateCursor()
    this.updateFooterPos()
    this.updateCreditHover()

    for (const k of this.input.keysJustPressed) {
      if (k.startsWith("Key") && k.length === 4) {
        this.keyBuffer += k[3].toLowerCase()
        if (this.keyBuffer.length > 6) this.keyBuffer = this.keyBuffer.slice(-6)
        if (this.keyBuffer === "powr") {
          this.keyBuffer = ""
          this.sceneManager.replace(new SimulationScene(this.app, this.stage, this.sceneManager, this.input))
          return
        }
      }
    }

    if (this.input.mouse.leftClicked) {
      this.input.mouse.leftClicked = false
      this.sceneManager.replace(new GameScene(this.app, this.stage, this.sceneManager, this.input))
    }
  }

  private animateLogo(): void {
    if (!this.animating) return
    this.animFrame++
    const f = this.animFrame

    function setAlpha(arr: Text[], a: number) { for (const t of arr) t.alpha = a }

    setAlpha(this.shadowChars, f < 4 ? (f / 4) * 0.4 : 0.4)
    setAlpha(this.extDeepChars, f < 8 ? Math.max(0, (f - 4) / 4) : 1)
    setAlpha(this.extMidChars, f < 12 ? Math.max(0, (f - 8) / 4) : 1)
    setAlpha(this.faceChars, f < 16 ? Math.max(0, (f - 12) / 4) : 1)
    setAlpha(this.coreChars, f < 20 ? Math.max(0, (f - 16) / 4) * 0.8 : 0.8)
    setAlpha(this.rimChars, f < 24 ? Math.max(0, (f - 20) / 4) * 0.45 : 0.45)
    setAlpha(this.glowChars, f < 30 ? Math.max(0, (f - 22) / 8) * 0.2 : 0.2)

    if (f >= 30) this.animating = false
  }

  private updateBanner(): void {
    this.bannerTick++
    if (this.bannerTick < 5) return
    this.bannerTick = 0
    this.bannerPhase++
    this.updateBannerCells(this.bannerPhase, getConfig().grid_color)
    this.bannerGrid.render()
    this.bannerGrid.setAllAlpha(TitleScene.BANNER_BASE_ALPHA)
  }

  private updateBannerHover(): void {
    const mx = this.input.mouse.x - this.screenLeft
    const my = this.input.mouse.y - this.screenTop
    const col = Math.floor(mx / this.bannerCellSize)
    const row = Math.floor(my / this.bannerCellSize)

    const key = `${row},${col}`
    const onGrid = row >= 0 && row < 22 && col >= 0 && col < 50

    if (onGrid) {
      if (!this.rampCells.has(key)) {
        this.rampCells.set(key, { cur: TitleScene.BANNER_BASE_ALPHA, tgt: TitleScene.BANNER_HOVER_ALPHA })
      } else {
        const c = this.rampCells.get(key)!
        c.tgt = TitleScene.BANNER_HOVER_ALPHA
      }
    }

    for (const [k, c] of this.rampCells) {
      if (k === key) continue
      c.tgt = TitleScene.BANNER_BASE_ALPHA
    }
  }

  private updateRampCells(): void {
    for (const [key, c] of this.rampCells) {
      if (Math.abs(c.cur - c.tgt) < 0.001) {
        c.cur = c.tgt
        this.rampCells.delete(key)
        continue
      }
      const up = c.tgt > c.cur
      const rate = up ? TitleScene.RAMP_UP : TitleScene.RAMP_DOWN
      c.cur += up ? rate : -rate
      if ((up && c.cur > c.tgt) || (!up && c.cur < c.tgt)) c.cur = c.tgt
      const [r, co] = key.split(",")
      this.bannerGrid.setCellAlpha(Number(r), Number(co), c.cur)
    }
  }

  private updateFgBanner(): void {
    this.fgTick++
    if (this.fgTick < 5) return
    this.fgTick = 0
    this.fgPhase++
    this.updateFgCells(this.fgPhase, getConfig().grid_color)
    this.fgGrid.render()
    this.fgGrid.setAllAlpha(TitleScene.BANNER_BASE_ALPHA * 0.5)
  }

  private updateFgHover(): void {
    const mx = this.input.mouse.x - this.screenLeft
    const my = this.input.mouse.y - this.screenTop
    const col = Math.floor(mx / this.bannerCellSize)
    const row = Math.floor(my / this.bannerCellSize)
    const key = `${row},${col}`
    const onGrid = row >= 0 && row < 22 && col >= 0 && col < 50

    if (onGrid) {
      if (!this.fgRampCells.has(key)) {
        this.fgRampCells.set(key, { cur: TitleScene.BANNER_BASE_ALPHA * 0.5, tgt: TitleScene.BANNER_HOVER_ALPHA * 0.6 })
      } else {
        this.fgRampCells.get(key)!.tgt = TitleScene.BANNER_HOVER_ALPHA * 0.6
      }
    }
    for (const [k, c] of this.fgRampCells) {
      if (k === key) continue
      c.tgt = TitleScene.BANNER_BASE_ALPHA * 0.5
    }
  }

  private updateFgRampCells(): void {
    for (const [key, c] of this.fgRampCells) {
      if (Math.abs(c.cur - c.tgt) < 0.001) {
        c.cur = c.tgt
        this.fgRampCells.delete(key)
        continue
      }
      const up = c.tgt > c.cur
      const rate = up ? TitleScene.RAMP_UP * 0.5 : TitleScene.RAMP_DOWN * 0.5
      c.cur += up ? rate : -rate
      if ((up && c.cur > c.tgt) || (!up && c.cur < c.tgt)) c.cur = c.tgt
      const [r, co] = key.split(",")
      this.fgGrid.setCellAlpha(Number(r), Number(co), c.cur)
    }
  }

  private updateCharGlitch(): void {
    const chars = "TIC TAC TOE"
    const vars = TitleScene.GLITCH_VARIANTS
    for (let i = 0; i < 11; i++) {
      const s = this.charStates[i]
      if (s.corrupt) {
        if (++s.age > 2) {
          s.corrupt = false
          this.faceChars[i].text = chars[i]
        }
      } else {
        if (++s.timer > 200 + Math.random() * 400) {
          s.timer = 0
          s.corrupt = true
          s.age = 0
          const pool = vars[chars[i]]
          if (pool) {
            this.faceChars[i].text = pool[Math.floor(Math.random() * pool.length)]
          }
        }
      }
    }
  }

  private updateGlitch(): void {
    this.glitchTimer++
    if (this.glitching) {
      if (this.glitchTimer > 2) {
        this.glitching = false
        this.logoContainer.position.x = 0
        this.logoContainer.alpha = 1
        this.ansiGrid.setText(0, 2, this.headerStr, getConfig().glow_color)
        this.ansiGrid.setText(21, 2, this.footerStr, getConfig().glow_color)
        this.ansiGrid.markDirty()
        this.ansiGrid.render()
      }
    } else if (this.glitchTimer > 180 + Math.random() * 240) {
      this.glitchTimer = 0
      this.glitching = true

      const gc = TitleScene.GLITCH_CHARS
      const hdrLen = this.headerStr.length
      const ftrLen = this.footerStr.length
      const cfg = getConfig()

      for (let n = 0; n < 4 + Math.floor(Math.random() * 3); n++) {
        const ci = 2 + Math.floor(Math.random() * Math.min(hdrLen, 42))
        this.ansiGrid.setChar(0, ci, gc[Math.floor(Math.random() * gc.length)], cfg.glow_color)
      }
      for (let n = 0; n < 3 + Math.floor(Math.random() * 3); n++) {
        const ci = 2 + Math.floor(Math.random() * Math.min(ftrLen, 42))
        this.ansiGrid.setChar(21, ci, gc[Math.floor(Math.random() * gc.length)], cfg.glow_color)
      }

      this.ansiGrid.render()
      this.logoContainer.position.x = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2))
      this.logoContainer.alpha = 0.65
    }
  }

  private updateCursor(): void {
    this.cursorTimer++
    if (this.cursorTimer >= 30) {
      this.cursorTimer = 0
      this.cursorVisible = !this.cursorVisible
      this.cursorText.alpha = this.cursorVisible ? 1 : 0
    }
  }

  private updateFooterPos(): void {
    const mx = this.input.mouse.x - this.screenLeft
    const my = this.input.mouse.y - this.screenTop
    const col = Math.floor(mx / this.footerCellSize)
    const row = Math.floor(my / this.footerCellSize)
    const cell = row * 50 + col
    if (cell === this.lastFooterCell) return
    this.lastFooterCell = cell

    if (row >= 0 && row < 22 && col >= 0 && col < 50) {
      this.footerStr = `CMD>   CELL _  │  LN ${String(row + 1).padStart(2, "0")} COL ${String(col + 1).padStart(2, "0")}  │  ONLINE`
    } else {
      this.footerStr = `CMD>   CELL _  │  LN -- COL --  │  ONLINE`
    }
    this.ansiGrid.setText(21, 2, this.footerStr, getConfig().glow_color)
    this.ansiGrid.markDirty()
    this.ansiGrid.render()
  }

  private updateCreditHover(): void {
    const mx = this.input.mouse.x - this.screenLeft
    const my = this.input.mouse.y - this.screenTop
    const col = Math.floor(mx / this.footerCellSize)
    const row = Math.floor(my / this.footerCellSize)
    const onCredit = (row === 0 || row === 1) && col >= this.creditCol && col < this.creditCol + this.creditText.length
    const len = this.creditText.length

    if (!onCredit) {
      if (this.creditHovered) {
        this.creditHovered = false
        this.creditRampingDown = true
        document.body.style.cursor = "default"
        this.creditDownSpeeds = []
        for (let i = 0; i < len; i++) {
          this.creditDownSpeeds.push(0.003 + Math.random() * 0.012)
        }
      }
      if (this.creditRampingDown) {
        this.renderCreditRampDown()
      }
      return
    }

    if (!this.creditHovered) {
      this.creditHovered = true
      this.creditRampingDown = false
      this.creditAnimFrame = 0
      document.body.style.cursor = "pointer"
      this.creditSpeeds = []
      this.creditCharStates = []
      for (let i = 0; i < len; i++) {
        this.creditCharStates.push(0)
        this.creditSpeeds.push(0.008 + Math.random() * 0.025)
      }
    }

    this.creditAnimFrame++

    if (this.input.mouse.leftClicked) {
      this.input.mouse.leftClicked = false
      window.open("https://github.com/skinnerboxentertainment/powr-terminal-tictactoe", "_blank")
      return
    }

    this.renderCreditFrame(true)
  }

  private renderCreditRampDown(): void {
    let anyLit = false
    const cfg = getConfig()
    for (let i = 0; i < this.creditCharStates.length; i++) {
      this.creditCharStates[i] = Math.max(0, this.creditCharStates[i] - this.creditDownSpeeds[i])
      if (this.creditCharStates[i] > 0) anyLit = true
    }
    this.renderCreditFrame(false)
    if (!anyLit) {
      this.creditRampingDown = false
      this.ansiGrid.setText(0, 2, this.headerStr, cfg.glow_color)
      this.ansiGrid.markDirty()
      this.ansiGrid.render()
    }
  }

  private renderCreditFrame(allowLeet: boolean): void {
    const cfg = getConfig()
    const leet: Record<string, string[]> = {
      S: ["S", "5"], K: ["K"], I: ["I", "1", "!"], N: ["N"],
      E: ["E", "3", "€"], R: ["R"], B: ["B", "8"],
      O: ["O", "0"], X: ["X"], T: ["T", "7"],
      A: ["A", "4", "@"], M: ["M"],
    }
    const chars = this.creditText.split("")
    const c1 = cfg.glow_color, c2 = cfg.grid_bright
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff

    for (let i = 0; i < chars.length; i++) {
      const pct = this.creditCharStates[i]
      const ch = chars[i]
      const pool = leet[ch] || [ch]
      const showLeet = allowLeet && pool.length > 1 && Math.random() < pct * 0.5
      const display = showLeet ? pool[Math.floor(Math.random() * pool.length)] : ch
      const r = Math.round(r1 + (r2 - r1) * pct)
      const g = Math.round(g1 + (g2 - g1) * pct)
      const b = Math.round(b1 + (b2 - b1) * pct)
      this.ansiGrid.setChar(this.creditRow, this.creditCol + i, display, (r << 16) | (g << 8) | b)
    }

    this.ansiGrid.markDirty()
    this.ansiGrid.render()
  }

  exit(): void {
    this.container.removeFromParent()
    this.container.destroy({ children: true })
  }
}
