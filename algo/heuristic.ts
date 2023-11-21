import { Position } from './models/Position'

interface HeuristicFunction {
  (startPos: Position, endPos: Position): number
}

const manhattan: HeuristicFunction = (startPos, endPos): number => {
  return Math.abs(endPos.x - startPos.x) + Math.abs(endPos.y - startPos.y)
}

const octile: HeuristicFunction = (startPos, endPos): number => {
  const dx = Math.abs(endPos.x - startPos.x)
  const dy = Math.abs(endPos.y - startPos.y)

  const F = Math.SQRT2 - 1 // Factor for diagonal movement cost
  const D = Math.SQRT2 // Cost of diagonal movement

  return D * (dx + dy) + (F - 2 * D) * Math.min(dx, dy)
}

const chebyshev: HeuristicFunction = (startPos, endPos): number => {
  return Math.max(Math.abs(endPos.x - startPos.x), Math.abs(endPos.y - startPos.y))
}

export { manhattan, octile, chebyshev, HeuristicFunction }
