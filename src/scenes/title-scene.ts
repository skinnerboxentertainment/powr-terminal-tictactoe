import { Container, Graphics, Text, NoiseFilter, BlurFilter, type Application, Rectangle } from "pixi.js"
import type { Scene } from "../core/types"
import type { SceneManager } from "../core/scene-manager"
import type { InputManager as InputManagerType } from "../core/input-manager"
import { getConfig, type GameplayConfig } from "../core/config"
import { audioManager } from "../audio/audio-manager"
import { TerminalGrid } from "../core/terminal-grid"
import { GameScene } from "./game-scene"

export class TitleScene implements Scene {
  private container = new Container()
  private screenContent = new Container()
  private noiseFilter = new NoiseFilter({ noise: 0.06, seed: 0 })
  private logoContainer = new Container()
  private glowFilter = new BlurFilter({ strength: 16 })

  private housingG = new Graphics()
  private screenG = new Graphics()
  private scanlineG = new Graphics()
  private vignetteG = new Graphics()

  private ansiGrid = new TerminalGrid(50, 22)
  private promptText = new Text({ text: "", style: { fontFamily: "monospace", fontSize: 16, fill: 0x00b7c7 } })
  private cursorText = new Text({ text: "_", style: { fontFamily: "monospace", fontSize: 16, fill: 0x00b7c7 } })
  private subtitleText = new Text({ text: "", style: { fontFamily: "monospace", fontSize: 12, fill: 0x087f8c } })

  private glowLayer = new Text({ text: "TIC TAC TOE" })
  private shadowLayer = new Text({ text: "TIC TAC TOE" })
  private extDeep = new Text({ text: "TIC TAC TOE" })
  private extMid = new Text({ text: "TIC TAC TOE" })
  private faceLayer = new Text({ text: "TIC TAC TOE" })
  private coreLayer = new Text({ text: "TIC TAC TOE" })
  private rimLayer = new Text({ text: "TIC TAC TOE" })

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
  private glitchTimer = 0
  private glitching = false
  private headerStr = ""
  private footerStr = ""
  private static GLITCH_CHARS = "╪╬╫╨╥┴┬├┤┼╡╢╖╕╣║═╔╗╚╝░▒▓█"

  constructor(app: Application, stage: Container, sceneManager: SceneManager, input: InputManagerType) {
    this.app = app
    this.stage = stage
    this.sceneManager = sceneManager
    this.input = input
  }

  enter(): void {
    const cfg = getConfig()
    this.screenContent.filters = [this.noiseFilter]

    this.container.addChild(this.housingG)
    this.container.addChild(this.screenG)
    this.container.addChild(this.screenContent)
    this.screenContent.addChild(this.scanlineG)
    this.screenContent.addChild(this.ansiGrid.container)
    this.screenContent.addChild(this.logoContainer)
    this.screenContent.addChild(this.promptText)
    this.screenContent.addChild(this.cursorText)
    this.screenContent.addChild(this.subtitleText)
    this.container.addChild(this.vignetteG)
    this.stage.addChild(this.container)

    this.animFrame = 0
    this.animating = true
    this.glitchTimer = 0
    this.glitching = false

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

    this.drawHousing(cfg, cx, cy, cs)
    this.drawScreenFill(cfg)
    this.drawTerminalFrame(cfg, cs)
    this.drawLogo(cfg, cs)
    this.drawPrompt(cfg, cs)
    this.drawScanlines(cfg)
    this.drawVignette(cfg, cx, cy, cs)
  }

  private drawHousing(cfg: GameplayConfig, cx: number, cy: number, cs: number): void {
    const g = this.housingG
    g.clear()
    g.rect(cx, cy, cs, cs)
    g.fill({ color: cfg.housing_color })
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

  private drawTerminalFrame(cfg: GameplayConfig, cs: number): void {
    const grid = this.ansiGrid
    const sw = this.screenRight - this.screenLeft
    const sh = this.screenBottom - this.screenTop
    const cellSize = Math.min(sw / 50, sh / 22)
    grid.setCellSize(cellSize, cellSize)
    grid.setPosition(this.screenLeft, this.screenTop)
    grid.clear()

    const w = 50; const h = 22
    grid.fillRect(0, 0, 1, w, "─", cfg.grid_color, cfg.screen_color)
    grid.setChar(0, 0, "┌", cfg.grid_color); grid.setChar(0, w - 1, "┐", cfg.grid_color)
    for (let r = 1; r < h - 1; r++) { grid.setChar(r, 0, "│", cfg.grid_color); grid.setChar(r, w - 1, "│", cfg.grid_color) }
    grid.fillRect(h - 1, 0, 1, w, "─", cfg.grid_color)
    grid.setChar(h - 1, 0, "└", cfg.grid_color); grid.setChar(h - 1, w - 1, "┘", cfg.grid_color)
    this.headerStr = `WOPR v1.0  │  SIMULATION: TIC-TAC-TOE  │  NODE 01`
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

    const base = { fontFamily: "monospace", fontSize: fs, letterSpacing: 8, fill: cfg.grid_color }

    this.glowLayer.text = text
    this.glowLayer.style = { fontFamily: "monospace", fontSize: fs, letterSpacing: 8, fill: cfg.glow_color }
    this.glowLayer.anchor.set(0.5)
    this.glowLayer.position.set(cx, cy)
    this.glowLayer.alpha = 0
    this.glowLayer.filters = [this.glowFilter]
    this.logoContainer.addChild(this.glowLayer)

    this.shadowLayer.text = text
    this.shadowLayer.style = { ...base, fill: 0x000000 }
    this.shadowLayer.anchor.set(0.5)
    this.shadowLayer.position.set(cx + 5, cy + 5)
    this.shadowLayer.alpha = 0
    this.logoContainer.addChild(this.shadowLayer)

    this.extDeep.text = text
    this.extDeep.style = { ...base, fill: 0x022a33 }
    this.extDeep.anchor.set(0.5)
    this.extDeep.position.set(cx + 3, cy + 3)
    this.extDeep.alpha = 0
    this.logoContainer.addChild(this.extDeep)

    this.extMid.text = text
    this.extMid.style = { ...base, fill: 0x044a55 }
    this.extMid.anchor.set(0.5)
    this.extMid.position.set(cx + 2, cy + 2)
    this.extMid.alpha = 0
    this.logoContainer.addChild(this.extMid)

    this.faceLayer.text = text
    this.faceLayer.style = { ...base, fill: cfg.grid_color, stroke: { color: 0x043a4a, width: 3 } }
    this.faceLayer.anchor.set(0.5)
    this.faceLayer.position.set(cx, cy)
    this.faceLayer.alpha = 0
    this.logoContainer.addChild(this.faceLayer)

    this.coreLayer.text = text
    this.coreLayer.style = { ...base, fill: cfg.grid_bright, stroke: { color: cfg.grid_color, width: 1 } }
    this.coreLayer.anchor.set(0.5)
    this.coreLayer.position.set(cx, cy)
    this.coreLayer.alpha = 0
    this.logoContainer.addChild(this.coreLayer)

    this.rimLayer.text = text
    this.rimLayer.style = { ...base, fill: cfg.border_color }
    this.rimLayer.anchor.set(0.5)
    this.rimLayer.position.set(cx - 1, cy - 1)
    this.rimLayer.alpha = 0
    this.logoContainer.addChild(this.rimLayer)
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
    const ew = cs * 0.08; const a = cfg.vignette_strength * 0.5
    g.rect(cx, cy, cs, ew); g.fill({ color: 0x000000, alpha: a })
    g.rect(cx, cy + cs - ew, cs, ew); g.fill({ color: 0x000000, alpha: a })
    g.rect(cx, cy, ew, cs); g.fill({ color: 0x000000, alpha: a })
    g.rect(cx + cs - ew, cy, ew, cs); g.fill({ color: 0x000000, alpha: a })
  }

  update(_dt: number): void {
    this.noiseFilter.seed = Math.random()
    this.animateLogo()
    this.updateGlitch()
    this.updateCursor()

    if (this.input.mouse.leftClicked) {
      this.input.mouse.leftClicked = false
      this.sceneManager.replace(new GameScene(this.app, this.stage, this.input))
    }
  }

  private animateLogo(): void {
    if (!this.animating) return
    this.animFrame++
    const f = this.animFrame

    this.shadowLayer.alpha = f < 4 ? (f / 4) * 0.4 : 0.4
    this.extDeep.alpha = f < 8 ? Math.max(0, (f - 4) / 4) : 1
    this.extMid.alpha = f < 12 ? Math.max(0, (f - 8) / 4) : 1
    this.faceLayer.alpha = f < 16 ? Math.max(0, (f - 12) / 4) : 1
    this.coreLayer.alpha = f < 20 ? Math.max(0, (f - 16) / 4) * 0.8 : 0.8
    this.rimLayer.alpha = f < 24 ? Math.max(0, (f - 20) / 4) * 0.45 : 0.45
    this.glowLayer.alpha = f < 30 ? Math.max(0, (f - 22) / 8) * 0.2 : 0.2

    if (f >= 30) this.animating = false
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
        const ch = gc[Math.floor(Math.random() * gc.length)]
        this.ansiGrid.setChar(0, ci, ch, cfg.glow_color)
      }
      for (let n = 0; n < 3 + Math.floor(Math.random() * 3); n++) {
        const ci = 2 + Math.floor(Math.random() * Math.min(ftrLen, 42))
        const ch = gc[Math.floor(Math.random() * gc.length)]
        this.ansiGrid.setChar(21, ci, ch, cfg.glow_color)
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

  exit(): void {
    this.container.removeFromParent()
    this.container.destroy({ children: true })
  }
}
