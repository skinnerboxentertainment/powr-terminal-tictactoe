import { Application } from "pixi.js"
import { InputManager } from "./core/input-manager"
import { SceneManager } from "./core/scene-manager"
import { GameLoop } from "./core/game-loop"
import { BootScene } from "./scenes/boot-scene"

const app = new Application()

async function init(): Promise<void> {
  await app.init({ resizeTo: window, background: 0x1a1a2e })
  document.body.appendChild(app.canvas)
  const loadingEl = document.getElementById("loading")
  if (loadingEl) loadingEl.style.display = "none"

  const input = new InputManager()
  const sceneManager = new SceneManager(app.stage)
  const gameLoop = new GameLoop(input, sceneManager)

  sceneManager.push(new BootScene(app, app.stage, sceneManager, input))

  app.ticker.add((ticker) => {
    gameLoop.update(ticker.deltaTime)
  })
}

init()
