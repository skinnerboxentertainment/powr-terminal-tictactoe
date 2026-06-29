import { TicTacToeState, type Player } from "./tic-tac-toe-state"

export function getBestMove(state: TicTacToeState, aiPlayer: Player): number | null {
  const humanPlayer: Player = aiPlayer === "X" ? "O" : "X"
  let bestScore = -Infinity
  let bestMoves: number[] = []
  const validMoves = state.getValidMoves()

  for (const move of validMoves) {
    const clone = state.clone()
    clone.board[move] = aiPlayer
    clone.currentPlayer = humanPlayer
    clone.checkGameOver()
    const score = minimax(clone, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer)
    if (score > bestScore) {
      bestScore = score
      bestMoves = [move]
    } else if (score === bestScore) {
      bestMoves.push(move)
    }
  }

  if (bestMoves.length === 0) return null
  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}

function minimax(
  state: TicTacToeState,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  humanPlayer: Player,
): number {
  if (state.status === "won") {
    return state.winner === aiPlayer ? 10 - depth : depth - 10
  }
  if (state.status === "draw") return 0

  const validMoves = state.getValidMoves()

  if (isMaximizing) {
    let maxScore = -Infinity
    for (const move of validMoves) {
      const clone = state.clone()
      clone.board[move] = aiPlayer
      clone.currentPlayer = humanPlayer
      clone.checkGameOver()
      const score = minimax(clone, depth + 1, false, alpha, beta, aiPlayer, humanPlayer)
      maxScore = Math.max(score, maxScore)
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break
    }
    return maxScore
  } else {
    let minScore = Infinity
    for (const move of validMoves) {
      const clone = state.clone()
      clone.board[move] = humanPlayer
      clone.currentPlayer = aiPlayer
      clone.checkGameOver()
      const score = minimax(clone, depth + 1, true, alpha, beta, aiPlayer, humanPlayer)
      minScore = Math.min(score, minScore)
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return minScore
  }
}
