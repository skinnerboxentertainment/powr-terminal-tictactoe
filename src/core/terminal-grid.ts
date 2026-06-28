import { Container, Graphics, Text } from "pixi.js"

export interface CellStyle {
  fg: number
  bg: number | null
}

export class TerminalGrid {
  readonly container = new Container()
  private cols: number
  private rows: number
  private cellW = 0
  private cellH = 0
  private fontSize = 14
  private gridX = 0
  private gridY = 0
  private cells: CellStyle[][] = []
  private chars: string[][] = []
  private textPool: Text[][] = []
  private bgG = new Graphics()
  private dirty = true

  constructor(cols: number, rows: number) {
    this.cols = cols
    this.rows = rows
    this.container.addChild(this.bgG)
    for (let r = 0; r < rows; r++) {
      this.cells[r] = []
      this.chars[r] = []
      this.textPool[r] = []
      for (let c = 0; c < cols; c++) {
        this.cells[r][c] = { fg: 0x00b7c7, bg: null }
        this.chars[r][c] = " "
        const t = new Text({
          text: " ",
          style: { fontFamily: "monospace", fontSize: 14, fill: 0x00b7c7 },
        })
        t.visible = false
        this.container.addChild(t)
        this.textPool[r][c] = t
      }
    }
  }

  setCellSize(w: number, h: number): void {
    this.cellW = w
    this.cellH = h
    this.fontSize = Math.max(8, h | 0)
    this.markDirty()
  }

  setPosition(x: number, y: number): void {
    this.gridX = x
    this.gridY = y
    this.container.position.set(x, y)
  }

  markDirty(): void {
    this.dirty = true
  }

  setChar(row: number, col: number, char: string, fg?: number, bg?: number | null): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return
    this.chars[row][col] = char
    if (fg !== undefined) this.cells[row][col].fg = fg
    if (bg !== undefined) this.cells[row][col].bg = bg
    this.dirty = true
  }

  setText(row: number, col: number, text: string, fg?: number, bg?: number | null): void {
    for (let i = 0; i < text.length; i++) {
      this.setChar(row, col + i, text[i], fg, bg)
    }
  }

  fillRect(top: number, left: number, h: number, w: number, char: string, fg?: number, bg?: number | null): void {
    for (let r = top; r < top + h && r < this.rows; r++) {
      for (let c = left; c < left + w && c < this.cols; c++) {
        this.setChar(r, c, char, fg, bg)
      }
    }
  }

  clear(fg?: number, bg?: number | null): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.chars[r][c] = " "
        if (fg !== undefined) this.cells[r][c].fg = fg
        if (bg !== undefined) this.cells[r][c].bg = bg
      }
    }
    this.dirty = true
  }

  render(): void {
    if (!this.dirty) return

    const w = this.cellW
    const h = this.cellH
    if (w <= 0 || h <= 0) return

    this.bgG.clear()
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const style = this.cells[r][c]
        const ch = this.chars[r][c]
        const t = this.textPool[r][c]
        const x = c * w
        const y = r * h

        if (style.bg !== null) {
          this.bgG.rect(x, y, w, h)
          this.bgG.fill({ color: style.bg })
        }

        if (ch !== " ") {
          t.visible = true
          t.text = ch
          t.style = { fontFamily: "monospace", fontSize: this.fontSize, fill: style.fg }
          t.position.set(x, y)
        } else {
          t.visible = false
        }
      }
    }

    this.dirty = false
  }
}
