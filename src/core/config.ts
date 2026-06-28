export interface GameplayConfig {
  grid_size: number
  win_length: number
  game_over_delay_frames: number
  ai_think_delay: number
  housing_color: number
  bezel_color: number
  screen_color: number
  screen_center: number
  border_color: number
  grid_color: number
  grid_bright: number
  glow_color: number
  mark_color: number
  mark_bright: number
  status_label_color: number
  status_number_color: number
  status_number_glow: number
  scanline_opacity: number
  vignette_strength: number
  grid_line_width: number
  mark_line_width: number
  screen_inset_left: number
  screen_inset_top: number
  screen_inset_right: number
  screen_inset_bottom: number
  grid_left: number
  grid_top: number
  grid_right: number
  grid_bottom: number
  grid_line_extension: number
}

let _config: GameplayConfig | null = null

const DEFAULTS: GameplayConfig = {
  grid_size: 3,
  win_length: 3,
  game_over_delay_frames: 60,
  ai_think_delay: 30,
  housing_color: 0x020712,
  bezel_color: 0x07182b,
  screen_color: 0x07182b,
  screen_center: 0x07182b,
  border_color: 0x77e6f2,
  grid_color: 0x00b7c7,
  grid_bright: 0x77e6f2,
  glow_color: 0x087f8c,
  mark_color: 0x00b7c7,
  mark_bright: 0x77e6f2,
  status_label_color: 0x77e6f2,
  status_number_color: 0xf06b49,
  status_number_glow: 0xcc4422,
  scanline_opacity: 0.066,
  vignette_strength: 0.35,
  grid_line_width: 11,
  mark_line_width: 14,
  screen_inset_left: 0.08,
  screen_inset_top: 0.12,
  screen_inset_right: 0.92,
  screen_inset_bottom: 0.85,
  grid_left: 0.21,
  grid_top: 0.15,
  grid_right: 0.79,
  grid_bottom: 0.73,
  grid_line_extension: 0.003,
}

export async function loadConfig(): Promise<GameplayConfig> {
  if (_config) return _config
  try {
    const resp = await fetch("assets/data/gameplay-config.json")
    const data = await resp.json()
    _config = {
      grid_size: data.grid_size ?? DEFAULTS.grid_size,
      win_length: data.win_length ?? DEFAULTS.win_length,
      game_over_delay_frames: data.game_over_delay_frames ?? DEFAULTS.game_over_delay_frames,
      ai_think_delay: data.ai_think_delay ?? DEFAULTS.ai_think_delay,
      housing_color: Number(data.housing_color ?? DEFAULTS.housing_color),
      bezel_color: Number(data.bezel_color ?? DEFAULTS.bezel_color),
      screen_color: Number(data.screen_color ?? DEFAULTS.screen_color),
      screen_center: Number(data.screen_center ?? DEFAULTS.screen_center),
      border_color: Number(data.border_color ?? DEFAULTS.border_color),
      grid_color: Number(data.grid_color ?? DEFAULTS.grid_color),
      grid_bright: Number(data.grid_bright ?? DEFAULTS.grid_bright),
      glow_color: Number(data.glow_color ?? DEFAULTS.glow_color),
      mark_color: Number(data.mark_color ?? DEFAULTS.mark_color),
      mark_bright: Number(data.mark_bright ?? DEFAULTS.mark_bright),
      status_label_color: Number(data.status_label_color ?? DEFAULTS.status_label_color),
      status_number_color: Number(data.status_number_color ?? DEFAULTS.status_number_color),
      status_number_glow: Number(data.status_number_glow ?? DEFAULTS.status_number_glow),
      scanline_opacity: data.scanline_opacity ?? DEFAULTS.scanline_opacity,
      vignette_strength: data.vignette_strength ?? DEFAULTS.vignette_strength,
      grid_line_width: data.grid_line_width ?? DEFAULTS.grid_line_width,
      mark_line_width: data.mark_line_width ?? DEFAULTS.mark_line_width,
      screen_inset_left: data.screen_inset_left ?? DEFAULTS.screen_inset_left,
      screen_inset_top: data.screen_inset_top ?? DEFAULTS.screen_inset_top,
      screen_inset_right: data.screen_inset_right ?? DEFAULTS.screen_inset_right,
      screen_inset_bottom: data.screen_inset_bottom ?? DEFAULTS.screen_inset_bottom,
      grid_left: data.grid_left ?? DEFAULTS.grid_left,
      grid_top: data.grid_top ?? DEFAULTS.grid_top,
      grid_right: data.grid_right ?? DEFAULTS.grid_right,
      grid_bottom: data.grid_bottom ?? DEFAULTS.grid_bottom,
      grid_line_extension: data.grid_line_extension ?? DEFAULTS.grid_line_extension,
    }
  } catch {
    _config = { ...DEFAULTS }
  }
  return _config
}

export function getConfig(): GameplayConfig {
  if (!_config) throw new Error("Config not loaded — call loadConfig() first")
  return _config
}
