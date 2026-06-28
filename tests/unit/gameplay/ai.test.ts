import { describe, it, expect } from "vitest"
import { TicTacToeState } from "../../../src/gameplay/tic-tac-toe-state"
import { getBestMove } from "../../../src/gameplay/ai"

describe("AI", () => {
  it("test_ai_takesWinningMove", () => {
    const state = new TicTacToeState()
    state.board = ["O", "O", null, "X", "X", null, null, null, null]
    state.currentPlayer = "O"
    const move = getBestMove(state, "O")
    expect(move).toBe(2)
  })

  it("test_ai_blocksOpponentWin", () => {
    const state = new TicTacToeState()
    state.board = ["X", "X", null, "O", null, null, null, null, null]
    state.currentPlayer = "O"
    const move = getBestMove(state, "O")
    expect(move).toBe(2)
  })

  it("test_ai_returnsValidMoveOnEmptyBoard", () => {
    const state = new TicTacToeState()
    const move = getBestMove(state, "O")
    expect(move).not.toBeNull()
    expect(state.getValidMoves()).toContain(move)
  })

  it("test_ai_avoidsLosing", () => {
    const state = new TicTacToeState()
    state.board = ["X", "X", null, null, "O", null, null, null, null]
    state.currentPlayer = "O"
    const move = getBestMove(state, "O")
    expect(move).toBe(2)
  })

  it("test_ai_playsOnlyValidMoveOnAlmostFullBoard", () => {
    const state = new TicTacToeState()
    state.board = ["X", "O", "X", "O", "X", "O", "O", "X", null]
    state.currentPlayer = "O"
    const move = getBestMove(state, "O")
    expect(move).toBe(8)
  })

  it("test_ai_returnsNullOnFullBoard", () => {
    const state = new TicTacToeState()
    state.board = ["X", "O", "X", "O", "X", "O", "O", "X", "O"]
    state.status = "draw"
    const move = getBestMove(state, "O")
    expect(move).toBeNull()
  })
})
