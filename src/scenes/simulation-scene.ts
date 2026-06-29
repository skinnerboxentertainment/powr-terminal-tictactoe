import { Container, Text, type Application, Rectangle } from "pixi.js"
import type { Scene } from "../core/types"
import type { InputManager as InputManagerType } from "../core/input-manager"
import type { SceneManager } from "../core/scene-manager"
import { BoardRenderer } from "../gameplay/board-renderer"
import type { StatusValues } from "../gameplay/board-renderer"
import { TicTacToeState } from "../gameplay/tic-tac-toe-state"
import { getBestMove } from "../gameplay/ai"
import { getConfig } from "../core/config"
import { audioManager } from "../audio/audio-manager"
import { TitleScene } from "./title-scene"

export class SimulationScene implements Scene {
  private container = new Container()
  private app: Application
  private stage: Container
  private sceneManager: SceneManager
  private input: InputManagerType
  private renderer = new BoardRenderer()
  private state = new TicTacToeState()
  private phase: "ramp" | "exhaust" | "still" | "reveal" | "exit" = "ramp"
  private frameCount = 0
  private moveTimer = 0
  private moveInterval = 32
  private totalMoves = 0
  private xWins = 0
  private oWins = 0
  private draws = 0
  private exhaustFrames = 0
  private stillFrames = 0
  private revealLineIdx = 0
  private revealCharIdx = 0
  private revealTimer = 0
  private exitFade = 0
  private simOverlay: Text | null = null
  private revealLine1: Text | null = null
  private revealLine2: Text | null = null
  private gamesSinceAlternate = 0
  private startAsX = true
  private revealHold = 0

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
    const overlaySize = Math.max(10, cs * 0.018)
    this.simOverlay = new Text({
      text: "",
      style: { fontFamily: "monospace", fontSize: overlaySize, fill: cfg.glow_color, letterSpacing: 2 },
    })
    this.simOverlay.anchor.set(0.5)
    this.simOverlay.position.set((this.renderer as any).compoX + cs * 0.5, (this.renderer as any).compoY + cs * 0.76)
    this.simOverlay.alpha = 0
    this.container.addChild(this.simOverlay)

    const revealSize = Math.max(14, cs * 0.028)
    const revealStyle = { fontFamily: "monospace", fontSize: revealSize, fill: cfg.grid_color, letterSpacing: 3 }
    this.revealLine1 = new Text({ text: "", style: revealStyle })
    this.revealLine1.anchor.set(0.5)
    this.revealLine1.position.set((this.renderer as any).compoX + cs * 0.5, (this.renderer as any).compoY + cs * 0.60)
    this.revealLine1.alpha = 0
    this.container.addChild(this.revealLine1)

    this.revealLine2 = new Text({ text: "", style: revealStyle })
    this.revealLine2.anchor.set(0.5)
    this.revealLine2.position.set((this.renderer as any).compoX + cs * 0.5, (this.renderer as any).compoY + cs * 0.60 + cs * 0.04)
    this.revealLine2.alpha = 0
    this.container.addChild(this.revealLine2)

    this.pushStatus()
    audioManager.playMusic("bg")
  }

  update(_dt: number): void {
    this.renderer.tickNoise()

    switch (this.phase) {
      case "ramp": this.updateRamp(); break
      case "exhaust": this.updateExhaust(); break
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

      if (this.moveInterval <= 1 && this.totalMoves > 120) {
        this.phase = "exhaust"
        this.exhaustFrames = 0
      }
    }
  }

  private runMove(): void {
    const player = this.state.currentPlayer
    const move = getBestMove(this.state, player)
    if (move !== null) {
      this.state.makeMove(move)
      this.totalMoves++
      audioManager.playSfx(player === "X" ? "place_x" : "place_o")
      this.renderer.update(this.state)
      this.pushStatus()

      if (this.state.status !== "playing") {
        if (this.state.status === "won") {
          if (this.state.winner === "X") this.xWins++
          else this.oWins++
          audioManager.playSfx("win")
        } else {
          this.draws++
          audioManager.playSfx("draw")
        }
        this.state.reset()
        this.gamesSinceAlternate++
        if (this.gamesSinceAlternate >= 3) {
          this.startAsX = !this.startAsX
          this.gamesSinceAlternate = 0
        }
        this.state.currentPlayer = this.startAsX ? "X" : "O"
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

    if (this.exhaustFrames > 30 && this.simOverlay) {
      this.simOverlay.text = "SIMULATING ALL POSSIBLE OUTCOMES..."
      this.simOverlay.alpha = Math.min(0.5, (this.exhaustFrames - 30) / 60)
    }

    if (this.exhaustFrames >= 420) {
      this.phase = "still"
      this.stillFrames = 0
      audioManager.stopAll()
      this.renderer.setNoise(0.06)
      if (this.simOverlay) this.simOverlay.alpha = 0
    }
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
          line.text = lines[this.revealLineIdx].slice(0, this.revealCharIdx)
          line.alpha = 1
        }

        if (this.revealCharIdx >= lines[this.revealLineIdx].length) {
          this.revealCharIdx = 0
          this.revealLineIdx++
          if (this.revealLineIdx >= lines.length) {
            this.revealHold = 0
          }
        }
      } else {
        this.revealHold++
        if (this.revealHold >= 180) {
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
      moveCount: this.totalMoves,
      xWins: this.xWins,
      currentTurn: this.state.currentPlayer,
      draws: this.draws,
      labels: ["MOVE", "X WIN", "O WIN", "DRAW"],
    }
    this.renderer.setStatusValues(values)
  }

  exit(): void {
    this.container.removeFromParent()
    this.container.destroy({ children: true })
  }
}
