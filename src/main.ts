import { Application, Container, Text, Graphics } from "pixi.js"

const app = new Application()

async function init(): Promise<void> {
  await app.init({ resizeTo: window, background: 0x1a1a2e })
  document.body.appendChild(app.canvas)

  const hasGameCode = await checkForGameCode()
  if (hasGameCode) {
    const { boot } = await import("./main-boot")
    boot(app)
  } else {
    showWelcome(app)
  }
}

async function checkForGameCode(): Promise<boolean> {
  try {
    const scenes = import.meta.glob("./scenes/*.ts")
    const keys = Object.keys(scenes)
    return keys.length > 0
  } catch {
    return false
  }
}

function showWelcome(app: Application): void {
  const bg = new Graphics()
  bg.rect(0, 0, app.screen.width, app.screen.height)
  bg.fill({ color: 0x1a1a2e })
  app.stage.addChild(bg)

  const title = new Text({
    text: "AutoMagically",
    style: { fontFamily: "monospace", fontSize: 48, fill: 0x00aaff, fontWeight: "bold" },
  })
  title.anchor.set(0.5)
  title.position.set(app.screen.width / 2, app.screen.height / 3)
  app.stage.addChild(title)

  const subtitle = new Text({
    text: "Describe a game. Get a running build.",
    style: { fontFamily: "monospace", fontSize: 18, fill: 0x888888 },
  })
  subtitle.anchor.set(0.5)
  subtitle.position.set(app.screen.width / 2, app.screen.height / 3 + 50)
  app.stage.addChild(subtitle)

  const instructions = new Text({
    text: "Run  /auto-build \"your game idea\"  in the terminal",
    style: { fontFamily: "monospace", fontSize: 16, fill: 0xcccccc },
  })
  instructions.anchor.set(0.5)
  instructions.position.set(app.screen.width / 2, app.screen.height * 0.6)
  app.stage.addChild(instructions)

  const start = new Text({
    text: "Or run  /start  for guided setup",
    style: { fontFamily: "monospace", fontSize: 14, fill: 0x666666 },
  })
  start.anchor.set(0.5)
  start.position.set(app.screen.width / 2, app.screen.height * 0.65)
  app.stage.addChild(start)

  const pulse = () => {
    title.alpha = 0.7 + Math.sin(Date.now() / 500) * 0.3
    requestAnimationFrame(pulse)
  }
  pulse()
}

init()
