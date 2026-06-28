import { Container, Graphics, Text, NoiseFilter, Rectangle } from "pixi.js"
import { getConfig, type GameplayConfig } from "../core/config"
import type { TicTacToeState } from "./tic-tac-toe-state"

export interface StatusValues {
  moveCount: number
  xWins: number
  currentTurn: string
  draws: number
}

export class BoardRenderer {
  readonly container = new Container()
  readonly screenContent = new Container()
  private noiseFilter = new NoiseFilter({ noise: 0.06, seed: 0 })

  private housingG = new Graphics()
  private screenG = new Graphics()
  private gridG = new Graphics()
  private marksG = new Graphics()
  private winG = new Graphics()
  private scanlineG = new Graphics()
  private vignetteG = new Graphics()
  private overlayG = new Graphics()
  private overlayText = new Text({
    text: "",
    style: { fontFamily: "monospace", fontSize: 18, fill: 0x91b9ef },
  })

  private statusLabels: Text[] = []
  private statusValues: Text[] = []
  private statusBg = new Graphics()

  private compoX = 0
  private compoY = 0
  private compoSize = 0
  private screenLeft = 0
  private screenTop = 0
  private screenRight = 0
  private screenBottom = 0
  private gridLeft = 0
  private gridTop = 0
  private gridRight = 0
  private gridBottom = 0
  private cellW = 0
  private cellH = 0
  private gridExt = 0

  constructor() {
    this.screenContent.filters = [this.noiseFilter]
    this.container.addChild(this.housingG)
    this.container.addChild(this.screenContent)
    this.screenContent.addChild(this.screenG)
    this.screenContent.addChild(this.gridG)
    this.screenContent.addChild(this.marksG)
    this.screenContent.addChild(this.winG)
    this.screenContent.addChild(this.scanlineG)
    this.container.addChild(this.statusBg)
    this.container.addChild(this.vignetteG)
    this.container.addChild(this.overlayG)
    this.container.addChild(this.overlayText)
  }

  tickNoise(): void {
    this.noiseFilter.seed = Math.random()
  }

  layout(screenWidth: number, screenHeight: number): void {
    const cfg = getConfig()
    this.compoSize = Math.min(screenWidth, screenHeight)
    this.compoX = (screenWidth - this.compoSize) / 2
    this.compoY = (screenHeight - this.compoSize) / 2

    const cx = this.compoX
    const cy = this.compoY
    const cs = this.compoSize

    this.screenLeft = cx + cs * cfg.screen_inset_left
    this.screenTop = cy + cs * cfg.screen_inset_top
    this.screenRight = cx + cs * cfg.screen_inset_right
    this.screenBottom = cy + cs * cfg.screen_inset_bottom
    this.gridLeft = cx + cs * cfg.grid_left
    this.gridTop = cy + cs * cfg.grid_top
    this.gridRight = cx + cs * cfg.grid_right
    this.gridBottom = cy + cs * cfg.grid_bottom
    this.cellW = (this.gridRight - this.gridLeft) / cfg.grid_size
    this.cellH = (this.gridBottom - this.gridTop) / cfg.grid_size
    this.gridExt = cs * cfg.grid_line_extension

    this.screenContent.filterArea = new Rectangle(
      this.screenLeft, this.screenTop,
      this.screenRight - this.screenLeft,
      this.screenBottom - this.screenTop,
    )

    this.drawHousing(cfg, cx, cy, cs)
    this.drawScreenFill(cfg, cx, cy, cs)
    this.drawGrid(cfg, cx, cy, cs)
    this.drawScanlines(cfg)
    this.drawStatusPanel(cfg, cx, cy, cs)
    this.drawVignette(cfg, cx, cy, cs)

    this.overlayText.text = "GAME OVER. AGAIN?"
    this.overlayText.style = { fontFamily: "monospace", fontSize: Math.max(12, cs * 0.032), fill: cfg.grid_color, letterSpacing: 2 }
    this.overlayText.anchor.set(0.5)
    this.overlayText.position.set(cx + cs * 0.5, this.gridBottom + cs * 0.015)
    this.overlayText.alpha = 0
  }

  private drawHousing(cfg: GameplayConfig, cx: number, cy: number, cs: number): void {
    const g = this.housingG
    g.clear()

    g.rect(cx, cy, cs, cs)
    g.fill({ color: cfg.housing_color })

    const bezelInset = cs * 0.02
    g.rect(cx + bezelInset, cy + bezelInset, cs - bezelInset * 2, cs - bezelInset * 2)
    g.fill({ color: cfg.bezel_color })

    const railW = cs * 0.015
    const railY = cy + cs * 0.06
    const railH = cs * 0.82
    g.rect(cx + cs * 0.04, railY, railW, railH)
    g.fill({ color: cfg.bezel_color, alpha: 0.5 })
    g.rect(cx + cs * 0.96 - railW, railY, railW, railH)
    g.fill({ color: cfg.bezel_color, alpha: 0.5 })
  }

  private drawScreenFill(cfg: GameplayConfig, _cx: number, _cy: number, _cs: number): void {
    const g = this.screenG
    g.clear()

    const sx = this.screenLeft
    const sy = this.screenTop
    const sw = this.screenRight - sx
    const sh = this.screenBottom - sy

    g.rect(sx, sy, sw, sh)
    g.fill({ color: cfg.screen_color })
  }

  private drawGrid(cfg: GameplayConfig, _cx: number, _cy: number, cs: number): void {
    const g = this.gridG
    g.clear()

    const lwShift = cfg.grid_line_width / 6
    const v1x = this.gridLeft + this.cellW - lwShift
    const v2x = this.gridLeft + this.cellW * 2 + lwShift
    const h1y = this.gridTop + this.cellH - lwShift
    const h2y = this.gridTop + this.cellH * 2 + lwShift
    const ext = this.gridExt

    const offsets = [0.003, -0.004, 0.005, -0.003]

    const lines: [number, number, number, number][] = [
      [v1x + cs * offsets[0], this.gridTop - ext, v1x + cs * offsets[0], this.gridBottom + ext],
      [v2x + cs * offsets[1], this.gridTop - ext, v2x + cs * offsets[1], this.gridBottom + ext],
      [this.gridLeft - ext, h1y + cs * offsets[2], this.gridRight + ext, h1y + cs * offsets[2]],
      [this.gridLeft - ext, h2y + cs * offsets[3], this.gridRight + ext, h2y + cs * offsets[3]],
    ]

    for (const [x1, y1, x2, y2] of lines) {
      g.moveTo(x1, y1)
      g.lineTo(x2, y2)
    }
    g.stroke({ width: cfg.grid_line_width, color: cfg.grid_color, alpha: 0.85 })

    for (const [x1, y1, x2, y2] of lines) {
      g.moveTo(x1, y1)
      g.lineTo(x2, y2)
    }
    g.stroke({ width: cfg.grid_line_width + 4, color: cfg.glow_color, alpha: 0.12 })
  }

  private drawScanlines(cfg: GameplayConfig): void {
    const g = this.scanlineG
    g.clear()

    const sx = this.screenLeft
    const sy = this.screenTop
    const sw = this.screenRight - sx
    const sh = this.screenBottom - sy

    for (let y = sy; y < sy + sh; y += 2) {
      g.rect(sx, y, sw, 1)
    }
    g.fill({ color: 0x000000, alpha: cfg.scanline_opacity })
  }

  private drawVignette(cfg: GameplayConfig, cx: number, cy: number, cs: number): void {
    const g = this.vignetteG
    g.clear()

    const v = cfg.vignette_strength
    const edgeW = cs * 0.08
    const alpha = v * 0.5

    g.rect(cx, cy, cs, edgeW)
    g.fill({ color: 0x000000, alpha })
    g.rect(cx, cy + cs - edgeW, cs, edgeW)
    g.fill({ color: 0x000000, alpha })
    g.rect(cx, cy, edgeW, cs)
    g.fill({ color: 0x000000, alpha })
    g.rect(cx + cs - edgeW, cy, edgeW, cs)
    g.fill({ color: 0x000000, alpha })

    g.rect(cx + edgeW, cy + edgeW, cs - edgeW * 2, cs - edgeW * 2)
    g.fill({ color: 0x000000, alpha: v * 0.08 })
  }

  private drawStatusPanel(cfg: GameplayConfig, cx: number, cy: number, cs: number): void {
    this.statusBg.clear()

    const panelY = this.screenBottom
    const panelH = (cy + cs) - panelY
    const centers = [0.12, 0.38, 0.63, 0.89]
    const labels = ["GNR STS", "APL STS", "EOT STS", "PAC STS"]

    this.statusBg.rect(cx, panelY, cs, panelH)
    this.statusBg.fill({ color: cfg.housing_color })

    const labelSize = Math.max(8, cs * 0.022)
    const valueSize = Math.max(10, cs * 0.034)

    this.statusLabels = []
    this.statusValues = []

    for (let i = 0; i < 4; i++) {
      const lab = new Text({
        text: labels[i],
        style: { fontFamily: "monospace", fontSize: labelSize, fill: cfg.status_label_color, letterSpacing: 1 },
      })
      lab.anchor.set(0.5, 0)
      lab.position.set(cx + cs * centers[i], panelY + cs * 0.012)
      this.statusLabels.push(lab)
      this.container.addChild(lab)

      const val = new Text({
        text: "0000",
        style: { fontFamily: "monospace", fontSize: valueSize, fill: cfg.status_number_color, letterSpacing: 2 },
      })
      val.anchor.set(0.5, 0)
      val.position.set(cx + cs * centers[i], panelY + cs * 0.034)
      this.statusValues.push(val)
      this.container.addChild(val)
    }
  }

  update(state: TicTacToeState): void {
    this.marksG.clear()
    this.winG.clear()

    const cfg = getConfig()

    if (state.winLine) {
      for (const idx of state.winLine) {
        const row = Math.floor(idx / cfg.grid_size)
        const col = idx % cfg.grid_size
        const rx = this.gridLeft + col * this.cellW
        const ry = this.gridTop + row * this.cellH
        this.winG.rect(rx, ry, this.cellW, this.cellH)
      }
      this.winG.fill({ color: cfg.glow_color, alpha: 0.18 })
    }

    const pad = this.cellW * 0.22

    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / cfg.grid_size)
      const col = i % cfg.grid_size
      const cx = this.gridLeft + col * this.cellW + this.cellW / 2
      const cy = this.gridTop + row * this.cellH + this.cellH / 2

      if (state.board[i] === "X") {
        const halfW = this.cellW / 2 - pad
        const halfH = this.cellH / 2 - pad
        const o = i * 4
        const offsets = [0.02, -0.015, 0.01, -0.025]

        this.marksG.moveTo(cx - halfW + this.cellW * offsets[o % 4], cy - halfH + this.cellH * offsets[(o + 1) % 4])
        this.marksG.lineTo(cx + halfW + this.cellW * offsets[(o + 2) % 4], cy + halfH + this.cellH * offsets[(o + 3) % 4])
        this.marksG.moveTo(cx + halfW + this.cellW * offsets[o % 4], cy - halfH + this.cellH * offsets[(o + 1) % 4])
        this.marksG.lineTo(cx - halfW + this.cellW * offsets[(o + 2) % 4], cy + halfH + this.cellH * offsets[(o + 3) % 4])
        this.marksG.stroke({ width: cfg.mark_line_width, color: cfg.mark_color, alpha: 0.85 })

        this.marksG.moveTo(cx - halfW, cy - halfH)
        this.marksG.lineTo(cx + halfW, cy + halfH)
        this.marksG.moveTo(cx + halfW, cy - halfH)
        this.marksG.lineTo(cx - halfW, cy + halfH)
        this.marksG.stroke({ width: cfg.mark_line_width + 3, color: cfg.glow_color, alpha: 0.08 })
      } else if (state.board[i] === "O") {
        const rx = this.cellW / 2 - pad * 0.7
        const ry = this.cellH / 2 - pad * 0.7
        const offX = (i % 3 - 1) * this.cellW * 0.015
        const offY = (Math.floor(i / 3) - 1) * this.cellH * 0.015

        this.marksG.ellipse(cx + offX, cy + offY, rx, ry)
        this.marksG.stroke({ width: cfg.mark_line_width, color: cfg.mark_color, alpha: 0.85 })

        this.marksG.ellipse(cx + offX, cy + offY, rx, ry)
        this.marksG.stroke({ width: cfg.mark_line_width + 3, color: cfg.glow_color, alpha: 0.08 })
      }
    }
  }

  setStatusValues(values: StatusValues): void {
    const cfg = getConfig()

    this.statusValues[0].text = String(values.moveCount).padStart(4, "0")
    this.statusValues[1].text = String(values.xWins).padStart(4, "0")
    this.statusValues[2].text = values.currentTurn
    this.statusValues[3].text = String(values.draws).padStart(4, "0")

    for (let i = 0; i < 4; i++) {
      this.statusValues[i].style = { fontFamily: "monospace", fontSize: this.statusValues[i].style.fontSize as number, fill: cfg.status_number_color, letterSpacing: 2 }
    }
  }

  showOverlay(visible: boolean): void {
    this.overlayText.alpha = visible ? 1 : 0
  }

  getCellAt(screenX: number, screenY: number): { row: number; col: number } | null {
    if (screenX < this.gridLeft || screenX > this.gridRight) return null
    if (screenY < this.gridTop || screenY > this.gridBottom) return null
    const col = Math.floor((screenX - this.gridLeft) / this.cellW)
    const row = Math.floor((screenY - this.gridTop) / this.cellH)
    if (row < 0 || row > 2 || col < 0 || col > 2) return null
    return { row, col }
  }
}
