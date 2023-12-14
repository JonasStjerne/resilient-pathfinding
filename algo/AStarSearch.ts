import { HeuristicFunction, chebyshev, manhattan, octile } from './heuristic.js'
import { Grid } from './models/Grid'
import { Position } from './models/Position'
import runv2_1 from './versions/V2.1_AStarSearch.js'
import runv1 from './versions/v1_AStarSearch.js'
import runv2 from './versions/v2_AStarSearch.js'

const search = (
  startPos: Position,
  endPos: Position,
  graph: Grid,
  // tradeoff between risk and distance
  // 0 = only risk (take the safest path)
  // 1 = only distance (take the shortest path)
  w: number = 0.5,
  algoVersion: string = 'v2',
  heuristic: string = 'manhattan',
  drawLists = false,
  penMap?: number[],
) => {
  let selectedHeuristic: HeuristicFunction

  switch (heuristic) {
    case 'manhattan': {
      // console.log('Using manhattan')
      selectedHeuristic = manhattan
      break
    }
    case 'chebyshev': {
      // console.log('Using chebyshev')
      selectedHeuristic = chebyshev
      break
    }
    case 'octile': {
      // console.log('Using octile')
      selectedHeuristic = octile
      break
    }
    default: {
      // console.log('Invalid heuristic. Got ' + heuristic + '. Using manhattan')
      selectedHeuristic = manhattan
    }
  }

  switch (algoVersion) {
    case 'v1': {
      // console.log('Running v1')
      return runv1(startPos, endPos, graph, selectedHeuristic, drawLists)
    }
    case 'v2': {
      // console.log('Running v2')
      return runv2(startPos, endPos, graph, selectedHeuristic, w, drawLists)
    }
    case 'v2.1': {
      // console.log('Running v2.1')
      const inverseNormalizedValue = (1 - w) * 20
      return runv2_1(startPos, endPos, graph, selectedHeuristic, inverseNormalizedValue, drawLists, penMap)
    }
    default: {
      // console.log('Invalid algo version. Got ' + algoVersion + '. Using v2')
      return runv2(startPos, endPos, graph, selectedHeuristic, w, drawLists)
    }
  }
}

export default search
