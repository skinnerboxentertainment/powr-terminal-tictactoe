export function createSeededRNG(seed: number) {
  let s = seed
  return {
    next(): number {
      s = (s * 16807 + 0) % 2147483647
      return (s - 1) / 2147483646
    },
  }
}
