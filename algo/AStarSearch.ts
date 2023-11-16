import { manhattan } from './heuristic.js'
import { Grid } from './models/Grid'
import { Position } from './models/Position'
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
) => {
  switch (algoVersion) {
    case 'v1': {
      console.log('Running v1')
      return runv1(startPos, endPos, graph, manhattan)
    }
    case 'v2': {
      console.log('Running v2')
      return runv2(startPos, endPos, graph, manhattan, w)
    }
    default: {
      console.log('Invalid algo version. Got ' + algoVersion)
    }
  }
}

export default search
