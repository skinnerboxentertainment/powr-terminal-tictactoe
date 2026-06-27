import { Application } from "pixi.js"

let _app: Application

export async function boot(app: Application): Promise<void> {
  _app = app

  const { SceneManager } = await import("./core/scene-manager")
  const { InputManager } = await import("./core/input-manager")
  const { GameLoop } = await import("./core/game-loop")
  const { BootScene } = await import("./scenes/boot-scene")
  const inputManager = new InputManager()
  const sceneManager = new SceneManager(app.stage)
  const gameLoop = new GameLoop(inputManager, sceneManager)

  sceneManager.push(new BootScene())
  app.ticker.add((ticker) => gameLoop.update(ticker.deltaTime))
}

export function getApp(): Application {
  return _app
}
