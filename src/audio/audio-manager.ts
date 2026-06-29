import { Howl, Howler } from "howler"
import { sfxr } from "jsfxr"
import type { IAudioManager } from "./audio-manager.interface"

interface SfxParams {
  [key: string]: number
  wave_type: number
  p_env_attack: number
  p_env_sustain: number
  p_env_punch: number
  p_env_decay: number
  p_base_freq: number
  p_freq_limit: number
  p_freq_ramp: number
  p_freq_dramp: number
  p_vib_strength: number
  p_vib_speed: number
  p_arp_mod: number
  p_arp_speed: number
  p_duty: number
  p_duty_ramp: number
  p_repeat_speed: number
  p_pha_offset: number
  p_pha_ramp: number
  p_lpf_freq: number
  p_lpf_ramp: number
  p_lpf_resonance: number
  p_hpf_freq: number
  p_hpf_ramp: number
  sound_vol: number
  sample_rate: number
  sample_size: number
}

function defaultParams(): SfxParams {
  return {
    wave_type: 0,
    p_base_freq: 0.3,
    p_freq_limit: 0,
    p_freq_ramp: 0,
    p_freq_dramp: 0,
    p_env_attack: 0,
    p_env_sustain: 0.3,
    p_env_decay: 0.4,
    p_env_punch: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0.5,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.5,
    sample_rate: 44100,
    sample_size: 16,
  }
}

const SFX_PRESETS: Record<string, Partial<SfxParams>> = {
}

function generateHowl(overrides: Partial<SfxParams>): Howl {
  const params = { ...defaultParams(), ...overrides } as SfxParams
  const wave = sfxr.toWave(params)
  const wavBytes = new Uint8Array(wave.wav)
  const blob = new Blob([wavBytes], { type: "audio/wav" })
  const url = URL.createObjectURL(blob)
  return new Howl({ src: [url], format: ["wav"] })
}

export class AudioManager implements IAudioManager {
  private _ready = false
  private _musicVolume = 0.7
  private _sfxVolume = 1.0
  private _muted = false
  private _sounds = new Map<string, Howl>()
  private _music: Howl | null = null
  private _musicPlaying = false
  private _typeLoop: Howl | null = null
  private _typeLoopPlaying = false

  init(): void {
    if (this._ready) return

    const fileKeys = ["place_x", "place_o"]
    for (const key of fileKeys) {
    const sound = new Howl({
      src: [`assets/audio/sfx/${key}.ogg`, `assets/audio/sfx/${key}.mp3`],
      volume: 0.3,
      onloaderror: () => {},
    })
      this._sounds.set(key, sound)
    }

    this._music = new Howl({
      src: ["assets/audio/sfx/bg_loop.ogg"],
      loop: true,
      volume: 0.5,
      onloaderror: () => {},
    })

    this._typeLoop = new Howl({
      src: ["assets/audio/sfx/terminal_loop.ogg"],
      loop: true,
      volume: 0.15,
      onloaderror: () => {},
    })

    for (const [key, preset] of Object.entries(SFX_PRESETS)) {
      this._sounds.set(key, generateHowl(preset))
    }

    this._ready = true
  }

  startTypingLoop(): void {
    if (this._typeLoop && !this._typeLoopPlaying) {
      this._typeLoop.play()
      this._typeLoopPlaying = true
    }
  }

  stopTypingLoop(): void {
    this._typeLoop?.stop()
    this._typeLoopPlaying = false
  }

  playMusic(key: string): void {
    if (!this._ready) return
    if (key === "bg" && this._music && !this._musicPlaying) {
      this._music.play()
      this._musicPlaying = true
    }
  }

  playSfx(key: string): void {
    if (!this._ready) return
    const sound = this._sounds.get(key)
    if (sound) sound.play()
  }

  stopAll(): void {
    this._music?.stop()
    this._musicPlaying = false
    this._typeLoop?.stop()
    this._typeLoopPlaying = false
    for (const sound of this._sounds.values()) {
      sound.stop()
    }
  }

  setMusicVolume(v: number): void { this._musicVolume = v }
  setSfxVolume(v: number): void { this._sfxVolume = v }

  mute(): void { Howler.mute(true) }
  unmute(): void { Howler.mute(false) }
}

export const audioManager = new AudioManager()
