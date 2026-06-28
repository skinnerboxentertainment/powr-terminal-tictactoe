import { Container, Text, type Application } from "pixi.js"
import { loadConfig } from "../core/config"
import { audioManager } from "../audio/audio-manager"
import type { Scene } from "../core/types"
import type { SceneManager } from "../core/scene-manager"
import type { InputManager } from "../core/input-manager"
import { TitleScene } from "./title-scene"

export class BootScene implements Scene {
  private container = new Container()
  private loadingText = new Text({
    text: "Loading...",
    style: { fontFamily: "monospace", fontSize: 24, fill: 0x888888 },
  })
  private app: Application
  private stage: Container
  private sceneManager: SceneManager
  private input: InputManager
  private ready = false

  constructor(app: Application, stage: Container, sceneManager: SceneManager, input: InputManager) {
    this.app = app
    this.stage = stage
    this.sceneManager = sceneManager
    this.input = input
  }

  async enter(): Promise<void> {
    this.loadingText.anchor.set(0.5)
    this.loadingText.position.set(this.app.screen.width / 2, this.app.screen.height / 2)
    this.container.addChild(this.loadingText)
    this.stage.addChild(this.container)

    await loadConfig()
    audioManager.init()
    this.loadingText.text = "Ready!"
    this.ready = true
  }

  update(_dt: number): void {
    if (this.ready) {
      this.ready = false
      this.sceneManager.replace(new TitleScene(this.app, this.stage, this.sceneManager, this.input))
    }
  }

  exit(): void {
    this.container.removeFromParent()
    this.container.destroy({ children: true })
  }
}
