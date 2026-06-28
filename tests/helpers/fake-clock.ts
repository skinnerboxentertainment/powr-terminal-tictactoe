export class FakeClock {
  private _time = 0

  get time(): number {
    return this._time
  }

  advance(ms: number): void {
    this._time += ms
  }

  reset(): void {
    this._time = 0
  }
}
