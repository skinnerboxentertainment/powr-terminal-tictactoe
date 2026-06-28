export class AnsiMask {
  readonly rows: number
  readonly cols: number
  private data: boolean[][]

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.data = []
    for (let r = 0; r < rows; r++) {
      this.data[r] = []
      for (let c = 0; c < cols; c++) this.data[r][c] = false
    }
  }

  static fromStrings(lines: string[]): AnsiMask {
    const rows = lines.length
    const cols = Math.max(...lines.map((l) => l.length))
    const m = new AnsiMask(rows, cols)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < lines[r].length; c++) {
        m.data[r][c] = lines[r][c] !== " "
      }
    }
    return m
  }

  get(r: number, c: number): boolean {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false
    return this.data[r][c]
  }

  dilate(n: number): AnsiMask {
    const out = new AnsiMask(this.rows, this.cols)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.data[r][c]) {
          for (let dr = -n; dr <= n; dr++) {
            for (let dc = -n; dc <= n; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                out.data[nr][nc] = true
              }
            }
          }
        }
      }
    }
    return out
  }

  erode(n: number): AnsiMask {
    const out = new AnsiMask(this.rows, this.cols)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.data[r][c]) continue
        let all = true
        for (let dr = -n; dr <= n; dr++) {
          for (let dc = -n; dc <= n; dc++) {
            if (!this.get(r + dr, c + dc)) { all = false; break }
          }
          if (!all) break
        }
        out.data[r][c] = all
      }
    }
    return out
  }

  shift(dr: number, dc: number): AnsiMask {
    const out = new AnsiMask(this.rows, this.cols)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          out.data[nr][nc] = this.data[r][c]
        }
      }
    }
    return out
  }

  subtract(other: AnsiMask): AnsiMask {
    const out = new AnsiMask(this.rows, this.cols)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        out.data[r][c] = this.data[r][c] && !other.data[r][c]
      }
    }
    return out
  }
}
