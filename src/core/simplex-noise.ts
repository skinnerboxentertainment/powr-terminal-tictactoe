const grad3: [number, number][] = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
]

const p = new Uint8Array(256)
for (let i = 0; i < 256; i++) p[i] = i
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  const t = p[i]; p[i] = p[j]; p[j] = t
}

const perm = new Uint8Array(512)
for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

function dot2(g: [number, number], x: number, y: number): number {
  return g[0] * x + g[1] * y
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

export function noise2D(x: number, y: number): number {
  const s = (x + y) * 0.5 * (Math.sqrt(3) - 1)
  const i = Math.floor(x + s) & 255
  const j = Math.floor(y + s) & 255
  const t = (i + j) * (3 - Math.sqrt(3)) / 6
  const x0 = x - (i - t)
  const y0 = y - (j - t)

  let i1 = 0, j1 = 0
  if (x0 > y0) { i1 = 1; j1 = 0 } else { i1 = 0; j1 = 1 }

  const x1 = x0 - i1 + (3 - Math.sqrt(3)) / 6
  const y1 = y0 - j1 + (3 - Math.sqrt(3)) / 6
  const x2 = x0 - 1 + 2 * (3 - Math.sqrt(3)) / 6
  const y2 = y0 - 1 + 2 * (3 - Math.sqrt(3)) / 6

  const ii = i & 255
  const jj = j & 255
  const gi0 = perm[ii + perm[jj]] % 8
  const gi1 = perm[ii + i1 + perm[jj + j1]] % 8
  const gi2 = perm[ii + 1 + perm[jj + 1]] % 8

  let n0 = 0, n1 = 0, n2 = 0
  const t0 = 0.5 - x0 * x0 - y0 * y0
  if (t0 >= 0) { const t0_ = t0 * t0; n0 = t0_ * t0_ * dot2(grad3[gi0], x0, y0) }
  const t1 = 0.5 - x1 * x1 - y1 * y1
  if (t1 >= 0) { const t1_ = t1 * t1; n1 = t1_ * t1_ * dot2(grad3[gi1], x1, y1) }
  const t2 = 0.5 - x2 * x2 - y2 * y2
  if (t2 >= 0) { const t2_ = t2 * t2; n2 = t2_ * t2_ * dot2(grad3[gi2], x2, y2) }

  return 70 * (n0 + n1 + n2)
}
