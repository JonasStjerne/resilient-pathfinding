import { Grid } from '../../../algo/models/Grid.js'
import { Node } from '../../../algo/models/Node.js'
import search from '../../../algo/AStarSearch.js'
import { generateRandomMaps } from '../../../algo/graphGen.js'
import { grid } from '../../../algo/grid.js'
import { Position, tSPApproximation, tSPExact } from '../../../algo/tsp.js'
import { trackTime } from '../../../utils/telemetry.js'
//Random map generation is imported

interface results {
  ordering: Node[]
  length: number
  tspPath: Node[]
  foundpath: boolean
}

// Set n destinations on the given grid that are reachable form each other
export const setDestinations = (grid: Grid, n: number): Node[] => {
  const minDistanceBetweenPoints = grid.length / 2 - 10
  let destination: Node[] = []

  for (let i = 0; i < n; i++) {
    let destX = -1
    let destY = -1
    let reachable: boolean
    do {
      reachable = true
      if (destX && destY) {
        grid[destX][destY].type = 'road'
      }
      destX = Math.floor(Math.random() * grid.length)
      destY = Math.floor(Math.random() * grid[0].length)
      grid[destX][destY]
      // Check reachbility for boath directions for ever tuple of nodes
      for (let j = 0; j < destination.length; j++) {
        let path: undefined | (number | undefined)[] | null = search(
          { x: grid[destX][destY].x, y: grid[destX][destY].y },
          { x: destination[j].x, y: destination[j].y },
          grid,
        )
        if (path) {
          path = search(
            { x: destination[j].x, y: destination[j].y },
            { x: grid[destX][destY].x, y: grid[destX][destY].y },
            grid,
          )
          if (!path) {
            reachable = false
          }
        } else {
          reachable = false
        }
      }
    } while (!reachable)
    destination.push(grid[destX][destY])
    grid[destX][destY].type = 'road'
  }
  return destination
}
const timeTspExact = (
  gird: Grid,
  destinations: Node[],
  pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w: number,
    algoVersion: string,
    heuristic: string,
    drawLists: boolean,
  ) => (number | undefined)[] | null,
  w: number,
  algoVersion: string,
  heuristic: string,
  drawList: boolean,
): { results: results; deltaTime: number } => {
  const { result: resultExact, deltaTime } = trackTime(() =>
    tSPExact(grid, pathFindingAlgo, destinations, w, algoVersion, heuristic, drawList),
  )
  return { results: resultExact, deltaTime: deltaTime }
}

const timeTspApprox = (
  gird: Grid,
  destinations: Node[],
  pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w: number,
    algoVersion: string,
    heuristic: string,
    drawLists: boolean,
  ) => (number | undefined)[] | null,
  w: number,
  algoVersion: string,
  heuristic: string,
  drawList: boolean,
): { results: results; deltaTime: number } => {
  const { result: resultApprox, deltaTime } = trackTime(() =>
    tSPApproximation(grid, pathFindingAlgo, destinations, w, algoVersion, heuristic, drawList),
  )
  return { results: resultApprox, deltaTime: deltaTime }
}
//Function that generated ordering with boath TSP algos + timeing
const testTspAlgo = (
  gird: Grid,
  destinations: Node[],
  pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w: number,
    algoVersion: string,
    heuristic: string,
    drawLists: boolean,
  ) => (number | undefined)[] | null,
  w: number,
  algoVersion: string,
  heuristic: string,
  drawList: boolean,
): { grid: Grid; resultsExact: results; deltaTimeExact: number; resultsApprox: results; deltaTimeApprox: number } => {
  // Get the results and the execution times
  let resultsApprox: { results: results; deltaTime: number } = timeTspApprox(
    grid,
    destinations,
    pathFindingAlgo,
    w,
    algoVersion,
    heuristic,
    drawList,
  )
  let resultsExact: { results: results; deltaTime: number } = timeTspExact(
    grid,
    destinations,
    pathFindingAlgo,
    w,
    algoVersion,
    heuristic,
    drawList,
  )

  return {
    grid,
    resultsExact: resultsExact.results,
    deltaTimeExact: resultsExact.deltaTime,
    resultsApprox: resultsApprox.results,
    deltaTimeApprox: resultsApprox.deltaTime,
  }
}

// TSP Eval main hub
const tspMainTest = (
  numberOfMaps: number,
  numberOfDestiations: number,
  pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w: number,
    algoVersion: string,
    heuristic: string,
    drawLists: boolean,
  ) => (number | undefined)[] | null,
  w: number,
  algoVersion: string,
  heuristic: string,
  drawList: boolean,
): {
  grid: Grid
  resultsExact: results
  deltaTimeExact: number
  resultsApprox: results
  deltaTimeApprox: number
}[] => {
  // Generate a set of maps
  let testGridSet: Grid[] = generateRandomMaps(numberOfMaps)

  let results: {
    grid: Grid
    resultsExact: results
    deltaTimeExact: number
    resultsApprox: results
    deltaTimeApprox: number
  }[] = []
  testGridSet.forEach((testGrid) => {
    // For different maps try different number of destinations
    for (let i = 0; i < numberOfDestiations; i++) {
      // Set destinations
      let destinations = setDestinations(testGrid, i)
      // Run TSP Exact and Approx and safe results (ordering, time and map)
      // May need to timeout here -> Hardcode limit by trial and error
      results.push(testTspAlgo(testGrid, destinations, pathFindingAlgo, w, algoVersion, heuristic, drawList))
    }
  })
  return results
}

//Function to eval results
export const evalResults = () => {
  /*
   ----- Test parameters settings ------
   */
  let w: number = 0
  let algoVersion: string = 'v1'
  let heuristic: string = 'manhattan'
  let drawList: boolean = false

  let numberOfDestiations: number = 4 //Will usd from 0 - numberOfDestinations
  let numberOfMaps: number = 10

  /*
  ----- End Settings -------------------
  */

  let pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w: number,
    algoVersion: string,
    heuristic: string,
    drawLists: boolean,
  ) => (number | undefined)[] | null = search

  let results = tspMainTest(numberOfMaps, numberOfDestiations, pathFindingAlgo, w, algoVersion, heuristic, drawList)

  let toExport: {
    gridSize: number
    numberOfDestiations: number
    timeTspApprox: number
    lengthApprox: number
    timeTspExact: number
    lengthExact: number
    algoVersion: string
    heuristic: string
    mapId: number
  }[] = []
  // Preparing results for analysis!
  for (let i = 0; i < results.length; i++) {
    if (results[i].resultsApprox.foundpath && results[i].resultsExact.foundpath) {
      toExport.push({
        gridSize: results[i].grid.length,
        numberOfDestiations: results[i].resultsApprox.ordering.length,
        timeTspApprox: results[i].deltaTimeApprox,
        lengthApprox: results[i].resultsApprox.length,
        timeTspExact: results[i].deltaTimeExact,
        lengthExact: results[i].resultsExact.length,
        algoVersion: algoVersion,
        heuristic: heuristic,
        mapId: i,
      })
    }
  }
  return toExport
}

export type ExportResults = {
  gridSize: number
  numberOfDestiations: number
  timeTspApprox: number
  lengthApprox: number
  timeTspExact: number
  lengthExact: number
  algoVersion: string
  heuristic: string
  mapId: number
}[]
