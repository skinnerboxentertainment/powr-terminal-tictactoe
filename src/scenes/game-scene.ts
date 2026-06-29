import { Container, type Application } from "pixi.js"
import type { Scene } from "../core/types"
import type { SceneManager } from "../core/scene-manager"
import type { InputManager as InputManagerType } from "../core/input-manager"
import { getConfig } from "../core/config"
import { audioManager } from "../audio/audio-manager"
import { TicTacToeState } from "../gameplay/tic-tac-toe-state"
import { getBestMove } from "../gameplay/ai"
import { BoardRenderer } from "../gameplay/board-renderer"
import type { StatusValues } from "../gameplay/board-renderer"
import { sessionStats } from "../core/session-stats"
import { TitleScene } from "./title-scene"

export class GameScene implements Scene {
  private container = new Container()
  private app: Application
  private stage: Container
  private sceneManager: SceneManager
  private input: InputManagerType
  private state = new TicTacToeState()
  private renderer = new BoardRenderer()
  private aiThinkTimer = 0
  private gameOver = false
  private gameOverTimer = 0
  private gameOverClicked = false
  private gameOverLinger = 0
  private gameResult: "win" | "draw" | null = null

  constructor(app: Application, stage: Container, sceneManager: SceneManager, input: InputManagerType) {
    this.app = app
    this.stage = stage
    this.sceneManager = sceneManager
    this.input = input
  }

  enter(): void {
    const cfg = getConfig()
    this.state = new TicTacToeState()
    this.gameOver = false
    this.gameOverTimer = 0
    this.gameOverClicked = false
    this.gameResult = null
    this.gameOverLinger = 0
    this.aiThinkTimer = 0

    this.renderer = new BoardRenderer()
    this.container.addChild(this.renderer.container)
    this.stage.addChild(this.container)
    this.renderer.layout(this.app.screen.width, this.app.screen.height)
    this.renderer.update(this.state)
    this.pushStatus()
    audioManager.playMusic("bg")
  }

  update(_dt: number): void {
    this.renderer.tickNoise()
    if (this.gameOver) {
      if (this.gameOverClicked) return

      this.gameOverTimer++
      const cfg = getConfig()
      if (this.gameOverTimer >= cfg.game_over_delay_frames) {
        if (this.gameOverTimer === cfg.game_over_delay_frames) {
          this.renderer.showOverlay(true)
        }
        const typing = this.renderer.tickOverlay()
        if (!typing) {
          this.gameOverLinger++
          if (this.input.mouse.leftClicked) {
            this.input.mouse.leftClicked = false
            this.gameOverClicked = true
            this.renderer.showOverlay(false)
            this.state.reset()
            this.gameOver = false
            this.gameOverTimer = 0
            this.gameOverLinger = 0
            this.aiThinkTimer = 0
            this.renderer.update(this.state)
            this.pushStatus()
          } else if (this.gameOverLinger >= 480) {
            this.sceneManager.replace(new TitleScene(this.app, this.stage, this.sceneManager, this.input))
          }
        }
      }
      return
    }

    if (this.state.status !== "playing") {
      this.finishGame()
      return
    }

    if (this.state.currentPlayer === "X") {
      if (this.input.mouse.leftClicked) {
        this.input.mouse.leftClicked = false
        const cell = this.renderer.getCellAt(this.input.mouse.x, this.input.mouse.y)
        if (cell) {
          const index = cell.row * 3 + cell.col
          if (this.state.makeMove(index)) {
            sessionStats.moveCount++
            audioManager.playSfx("place_x")
            this.renderer.update(this.state)
            this.pushStatus()
            if (this.state.status !== "playing") {
              this.finishGame()
            }
          }
        }
      }
    } else {
      this.aiThinkTimer++
      const cfg = getConfig()
      if (this.aiThinkTimer >= cfg.ai_think_delay) {
        this.aiThinkTimer = 0
        const move = getBestMove(this.state, "O")
        if (move !== null) {
          this.state.makeMove(move)
          sessionStats.moveCount++
          audioManager.playSfx("place_o")
          this.renderer.update(this.state)
          this.pushStatus()
          if (this.state.status !== "playing") {
            this.finishGame()
          }
        }
      }
    }
  }

  private finishGame(): void {
    if (this.state.status === "won") {
      if (this.state.winner === "X") {
        sessionStats.xWins++
        this.gameResult = "win"
      } else {
        sessionStats.oWins++
        this.gameResult = null
      }
    } else {
      sessionStats.draws++
      this.gameResult = "draw"
    }
    this.renderer.update(this.state)
    this.pushStatus()
    this.gameOver = true
    this.gameOverTimer = 0
    this.gameOverClicked = false
  }

  private pushStatus(): void {
    const values: StatusValues = {
      moveCount: sessionStats.moveCount,
      xWins: sessionStats.xWins,
      oWins: sessionStats.oWins,
      draws: sessionStats.draws,
    }
    this.renderer.setStatusValues(values)
  }

  exit(): void {
    audioManager.stopAll()
    this.container.removeFromParent()
    this.container.destroy({ children: true })
  }
}
