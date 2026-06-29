import { Container, Graphics, Text, type Application, Rectangle } from "pixi.js"
import type { Scene } from "../core/types"
import type { InputManager as InputManagerType } from "../core/input-manager"
import type { SceneManager } from "../core/scene-manager"
import { BoardRenderer } from "../gameplay/board-renderer"
import type { StatusValues } from "../gameplay/board-renderer"
import { TicTacToeState } from "../gameplay/tic-tac-toe-state"
import { getBestMove } from "../gameplay/ai"
import { getConfig } from "../core/config"
import { audioManager } from "../audio/audio-manager"
import { sessionStats } from "../core/session-stats"
import { TitleScene } from "./title-scene"

export class SimulationScene implements Scene {
  private container = new Container()
  private app: Application
  private stage: Container
  private sceneManager: SceneManager
  private input: InputManagerType
  private renderer = new BoardRenderer()
  private state = new TicTacToeState()
  private phase: "ramp" | "exhaust" | "flash" | "still" | "reveal" | "exit" = "ramp"
  private frameCount = 0
  private moveTimer = 0
  private moveInterval = 32
  private simMoveCount = 0
  private exhaustFrames = 0
  private stillFrames = 0
  private revealLineIdx = 0
  private revealCharIdx = 0
  private revealTimer = 0
  private exitFade = 0
  private simOverlay: Text | null = null
  private revealLine1: Text | null = null
  private revealLine2: Text | null = null
  private revealHold = 0
  private simTypeIdx = 0
  private simTypeTick = 0
  private simFullText = "SIMULATING ALL POSSIBLE OUTCOMES..."
  private flashG = new Graphics()
  private flashAlpha = 0
  private flashDir: "up" | "down" = "up"

  constructor(app: Application, stage: Container, sceneManager: SceneManager, input: InputManagerType) {
    this.app = app
    this.stage = stage
    this.sceneManager = sceneManager
    this.input = input
  }

  enter(): void {
    const cfg = getConfig()
    this.renderer = new BoardRenderer()
    this.renderer.container.alpha = 1
    this.container.addChild(this.renderer.container)
    this.stage.addChild(this.container)
    this.renderer.layout(this.app.screen.width, this.app.screen.height)
    this.renderer.update(this.state)

    const cs = Math.min(this.app.screen.width, this.app.screen.height)
    const revealSize = Math.max(14, cs * 0.028)
    const revealStyle = { fontFamily: "monospace", fontSize: revealSize, fill: cfg.grid_color, letterSpacing: 3 }
    const cx = (this.renderer as any).compoX + cs * 0.5
    const cy = (this.renderer as any).compoY

    this.simOverlay = new Text({ text: "", style: { fontFamily: "monospace", fontSize: revealSize, fill: cfg.grid_color, letterSpacing: 3 } })
    this.simOverlay.anchor.set(0.5)
    this.simOverlay.position.set(cx, cy + cs * 0.76)
    this.simOverlay.alpha = 0
    this.container.addChild(this.simOverlay)

    this.revealLine1 = new Text({ text: "", style: revealStyle })
    this.revealLine1.anchor.set(0.5)
    this.revealLine1.position.set(cx, cy + cs * 0.76)
    this.revealLine1.alpha = 0
    this.container.addChild(this.revealLine1)

    this.revealLine2 = new Text({ text: "", style: revealStyle })
    this.revealLine2.anchor.set(0.5)
    this.revealLine2.position.set(cx, cy + cs * 0.80)
    this.revealLine2.alpha = 0
    this.container.addChild(this.revealLine2)
    this.container.addChild(this.flashG)

    this.pushStatus()
    audioManager.playMusic("bg")
  }

  update(_dt: number): void {
    this.renderer.tickNoise()

    switch (this.phase) {
      case "ramp": this.updateRamp(); break
      case "exhaust": this.updateExhaust(); break
      case "flash": this.updateFlash(); break
      case "still": this.updateStill(); break
      case "reveal": this.updateReveal(); break
      case "exit": this.updateExit(); break
    }
  }

  private updateRamp(): void {
    this.moveTimer++
    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer = 0
      this.runMove()

      this.moveInterval = Math.max(1, this.moveInterval - 0.3) | 0

      if (this.moveInterval <= 1 && this.simMoveCount > 120) {
        this.phase = "exhaust"
        this.exhaustFrames = 0
        this.simTypeIdx = 0
        this.simTypeTick = 0
      }
    }
  }

  private runMove(): void {
    const player = this.state.currentPlayer
    const move = getBestMove(this.state, player)
    if (move !== null) {
      this.state.makeMove(move)
      this.simMoveCount++
      sessionStats.moveCount++
      audioManager.playSfx(player === "X" ? "place_x" : "place_o")
      this.renderer.update(this.state)
      this.pushStatus()

      if (this.state.status !== "playing") {
        if (this.state.status === "won") {
          if (this.state.winner === "X") sessionStats.xWins++
          else sessionStats.oWins++
          audioManager.playSfx("win")
        } else {
          sessionStats.draws++
          audioManager.playSfx("draw")
        }
        this.state.reset()
        this.state.currentPlayer = Math.random() > 0.5 ? "X" : "O"
        this.renderer.update(this.state)
        this.pushStatus()
      }
    }
  }

  private updateExhaust(): void {
    this.runMove()
    this.exhaustFrames++

    const progress = Math.min(1, this.exhaustFrames / 240)
    this.renderer.setNoise(0.06 + progress * 0.14)

    if (this.exhaustFrames > 30) {
      this.simTypeTick++
      if (this.simTypeTick >= 3) {
        this.simTypeTick = 0
        if (this.simTypeIdx < this.simFullText.length) {
          if (this.simTypeIdx === 0) audioManager.startTypingLoop()
          this.simTypeIdx++
          const prefix = this.simFullText.slice(0, this.simTypeIdx)
          this.simOverlay!.text = this.simTypeIdx < this.simFullText.length ? prefix + "█" : prefix
          this.simOverlay!.alpha = 0.5
        }
      }
    }

    if (this.exhaustFrames >= 420) {
      audioManager.stopTypingLoop()
      this.phase = "flash"
      this.flashAlpha = 0
      this.flashDir = "up"
    }
  }

  private updateFlash(): void {
    if (this.flashDir === "up") {
      this.flashAlpha += 0.08
      if (this.flashAlpha >= 1) {
        this.flashAlpha = 1
        audioManager.stopAll()
        this.renderer.setNoise(0.06)
        if (this.simOverlay) this.simOverlay!.alpha = 0
        this.flashDir = "down"
      }
    } else {
      this.flashAlpha -= 0.04
      if (this.flashAlpha <= 0) {
        this.flashAlpha = 0
        this.phase = "still"
        this.stillFrames = 0
      }
    }

    this.flashG.clear()
    this.flashG.rect(0, 0, this.app.screen.width, this.app.screen.height)
    this.flashG.fill({ color: getConfig().grid_bright, alpha: this.flashAlpha })
  }

  private updateStill(): void {
    this.stillFrames++
    if (this.stillFrames >= 60) {
      this.phase = "reveal"
      this.revealLineIdx = 0
      this.revealCharIdx = 0
      this.revealTimer = 0
    }
  }

  private updateReveal(): void {
    this.revealTimer++
    const delay = this.revealLineIdx === 0 && this.revealCharIdx === 0 ? 60 : 3

    if (this.revealTimer >= delay) {
      this.revealTimer = 0
      const lines = ["A STRANGE GAME.", "THE ONLY WINNING MOVE IS NOT TO PLAY."]

      if (this.revealLineIdx < lines.length) {
        this.revealCharIdx++
        const line = this.revealLineIdx === 0 ? this.revealLine1 : this.revealLine2
        if (line) {
          if (this.revealCharIdx === 1) audioManager.startTypingLoop()
          const curLine = lines[this.revealLineIdx]
          const prefix = curLine.slice(0, this.revealCharIdx)
          line.text = this.revealCharIdx < curLine.length ? prefix + "█" : prefix
          line.alpha = 1
        }

        if (this.revealCharIdx >= lines[this.revealLineIdx].length) {
          this.revealCharIdx = 0
          this.revealLineIdx++
          if (this.revealLineIdx >= lines.length) {
            this.revealHold = 0
            audioManager.stopTypingLoop()
          }
        }
      } else {
        this.revealHold++
        if (this.input.mouse.leftClicked || this.revealHold >= 180) {
          this.input.mouse.leftClicked = false
          this.phase = "exit"
          this.exitFade = 0
        }
      }
    }
  }

  private updateExit(): void {
    this.exitFade++
    this.renderer.container.alpha = Math.max(0, 1 - this.exitFade / 30)
    if (this.exitFade >= 30) {
      this.sceneManager.replace(new TitleScene(this.app, this.stage, this.sceneManager, this.input))
    }
  }

  private pushStatus(): void {
    const values: StatusValues = {
      moveCount: sessionStats.moveCount,
      xWins: sessionStats.xWins,
      oWins: sessionStats.oWins,
      draws: sessionStats.draws,
      labels: ["MOVE", "X WIN", "O WIN", "DRAW"],
    }
    this.renderer.setStatusValues(values)
  }

  exit(): void {
    audioManager.stopTypingLoop()
    this.container.removeFromParent()
    this.container.destroy({ children: true })
  }
}
