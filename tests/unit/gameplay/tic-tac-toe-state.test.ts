import { describe, it, expect } from "vitest"
import { TicTacToeState } from "../../../src/gameplay/tic-tac-toe-state"

describe("TicTacToeState", () => {
  it("test_state_initialBoard_allNull", () => {
    const state = new TicTacToeState()
    expect(state.board.every((cell) => cell === null)).toBe(true)
    expect(state.currentPlayer).toBe("X")
    expect(state.status).toBe("playing")
  })

  it("test_state_makeMove_placesMark", () => {
    const state = new TicTacToeState()
    const result = state.makeMove(4)
    expect(result).toBe(true)
    expect(state.board[4]).toBe("X")
    expect(state.currentPlayer).toBe("O")
  })

  it("test_state_makeMove_occupiedCellReturnsFalse", () => {
    const state = new TicTacToeState()
    state.makeMove(0)
    const result = state.makeMove(0)
    expect(result).toBe(false)
  })

  it("test_state_makeMove_gameOverReturnsFalse", () => {
    const state = new TicTacToeState()
    state.board = ["X", "X", "X", null, null, null, null, null, null]
    state.checkGameOver()
    expect(state.status).toBe("won")
    const result = state.makeMove(3)
    expect(result).toBe(false)
  })

  it("test_state_winDetection_horizontalTop", () => {
    const state = new TicTacToeState()
    state.board = ["X", "X", "X", null, null, null, null, null, null]
    state.checkGameOver()
    expect(state.status).toBe("won")
    expect(state.winner).toBe("X")
    expect(state.winLine).toEqual([0, 1, 2])
  })

  it("test_state_winDetection_horizontalMiddle", () => {
    const state = new TicTacToeState()
    state.board = [null, null, null, "O", "O", "O", null, null, null]
    state.checkGameOver()
    expect(state.status).toBe("won")
    expect(state.winner).toBe("O")
    expect(state.winLine).toEqual([3, 4, 5])
  })

  it("test_state_winDetection_verticalLeft", () => {
    const state = new TicTacToeState()
    state.board = ["X", null, null, "X", null, null, "X", null, null]
    state.checkGameOver()
    expect(state.status).toBe("won")
    expect(state.winner).toBe("X")
    expect(state.winLine).toEqual([0, 3, 6])
  })

  it("test_state_winDetection_diagonalMain", () => {
    const state = new TicTacToeState()
    state.board = ["O", null, null, null, "O", null, null, null, "O"]
    state.checkGameOver()
    expect(state.status).toBe("won")
    expect(state.winner).toBe("O")
    expect(state.winLine).toEqual([0, 4, 8])
  })

  it("test_state_winDetection_diagonalAnti", () => {
    const state = new TicTacToeState()
    state.board = [null, null, "X", null, "X", null, "X", null, null]
    state.checkGameOver()
    expect(state.status).toBe("won")
    expect(state.winner).toBe("X")
    expect(state.winLine).toEqual([2, 4, 6])
  })

  it("test_state_drawDetection_fullBoard", () => {
    const state = new TicTacToeState()
    state.board = ["X", "O", "X", "O", "X", "O", "O", "X", "O"]
    state.checkGameOver()
    expect(state.status).toBe("draw")
    expect(state.winner).toBeNull()
    expect(state.winLine).toBeNull()
  })

  it("test_state_reset_clearsBoard", () => {
    const state = new TicTacToeState()
    state.makeMove(0)
    state.makeMove(1)
    state.makeMove(2)
    state.reset()
    expect(state.board.every((cell) => cell === null)).toBe(true)
    expect(state.currentPlayer).toBe("X")
    expect(state.status).toBe("playing")
  })

  it("test_state_getValidMoves_returnsCorrectIndices", () => {
    const state = new TicTacToeState()
    state.board = ["X", null, "O", null, "X", null, null, "O", null]
    const moves = state.getValidMoves()
    expect(moves).toEqual([1, 3, 5, 6, 8])
  })

  it("test_state_getValidMoves_emptyBoard", () => {
    const state = new TicTacToeState()
    const moves = state.getValidMoves()
    expect(moves).toHaveLength(9)
  })

  it("test_state_clone_createsIndependentCopy", () => {
    const state = new TicTacToeState()
    state.makeMove(4)
    const clone = state.clone()
    expect(clone.board[4]).toBe("X")
    expect(clone.currentPlayer).toBe("O")
    clone.makeMove(0)
    expect(state.board[0]).toBeNull()
    expect(clone.board[0]).toBe("O")
    expect(clone.currentPlayer).toBe("X")
  })
})
