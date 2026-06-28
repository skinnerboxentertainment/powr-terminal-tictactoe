import { GraphRegistry } from "../core/graph-registry"

export type Cell = "X" | "O" | null
export type Player = "X" | "O"
export type GameStatus = "playing" | "won" | "draw"

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export class TicTacToeState {
  board: Cell[] = Array(9).fill(null)
  currentPlayer: Player = "X"
  status: GameStatus = "playing"
  winner: Player | null = null
  winLine: number[] | null = null

  makeMove(index: number): boolean {
    if (this.board[index] !== null || this.status !== "playing") return false
    this.board[index] = this.currentPlayer
    this.checkGameOver()
    if (this.status === "playing") {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X"
    }
    return true
  }

  checkGameOver(): void {
    for (const line of WIN_LINES) {
      const [a, b, c] = line
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.status = "won"
        this.winner = this.board[a] as Player
        this.winLine = [...line]
        return
      }
    }
    if (this.board.every((cell) => cell !== null)) {
      this.status = "draw"
    }
  }

  getValidMoves(): number[] {
    const moves: number[] = []
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) moves.push(i)
    }
    return moves
  }

  reset(): void {
    this.board = Array(9).fill(null)
    this.currentPlayer = "X"
    this.status = "playing"
    this.winner = null
    this.winLine = null
  }

  clone(): TicTacToeState {
    const s = new TicTacToeState()
    s.board = [...this.board]
    s.currentPlayer = this.currentPlayer
    s.status = this.status
    s.winner = this.winner
    s.winLine = this.winLine ? [...this.winLine] : null
    return s
  }
}

GraphRegistry.register("tic-tac-toe", {
  schema: "NarrativeDocumentV2",
  metadata: { id: "tic-tac-toe", title: "Tic Tac Toe", version: "1.0.0", createdAt: "", modifiedAt: "" },
  environment: {
    variables: {
      current_player: { id: "current_player", name: "Current Player", type: "string", defaultValue: "X", scope: "session" },
      game_status: { id: "game_status", name: "Game Status", type: "string", defaultValue: "playing", scope: "session" },
    },
  },
  topology: {
    nodes: {
      PLAYER_TURN: { id: "PLAYER_TURN", sceneId: "game" },
      AI_TURN: { id: "AI_TURN", sceneId: "game" },
      GAME_OVER: { id: "GAME_OVER", sceneId: "game" },
    },
    transitions: [
      { id: "player_move", source: "PLAYER_TURN", target: "AI_TURN" },
      { id: "ai_move", source: "AI_TURN", target: "PLAYER_TURN" },
      { id: "player_wins", source: "PLAYER_TURN", target: "GAME_OVER" },
      { id: "ai_wins", source: "AI_TURN", target: "GAME_OVER" },
      { id: "draw", source: "PLAYER_TURN", target: "GAME_OVER" },
    ],
  },
  content: { scenes: {}, arcs: {} },
  presentation: { scenes: {}, characters: {}, themes: {}, cinematics: {} },
  runtime: { config: { startNodeId: "PLAYER_TURN" } },
  editor: {},
  audio: { cues: {} },
  plugins: { registry: {}, state: {} },
})
