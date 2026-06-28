declare module "jsfxr" {
  interface WaveResult {
    data: number[]
    wav: number[]
    dataURI: string
    header: string[]
    Make: string
    clipping: number
    buffer: string
    getAudio: () => HTMLAudioElement
  }

  type ParamsLike = Record<string, number>

  export const sfxr: {
    toWave(params: ParamsLike): WaveResult
    toBuffer(params: ParamsLike): Buffer
  }
}
