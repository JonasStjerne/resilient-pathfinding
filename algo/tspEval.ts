import { trackTime } from '../utils/telemetry.js'
import search from './AStarSearch.js'
import { generateRandomMaps } from './graphGen.js'
import { Grid } from './models/Grid.js'
import { Node } from './models/Node.js'
import { Position, tSPApproximation, tSPExact } from './tsp.js'
//Random map generation is imported

interface results {
  ordering: Node[]
  pathlength: number
  tspPath: Position[]
  foundpath: boolean
}

// Set n destinations on the given grid that are reachable form each other
export const setDestinations = (grid: Grid, n: number): Node[] => {
  const minDistanceBetweenPoints = grid.length / 2 - 10
  let destination: Node[] = []

  // Finde new
  for (let i = 0; i < n; i++) {
    let destX = -1
    let destY = -1
    let reachable: boolean
    do {
      reachable = true

      destX = Math.floor(Math.random() * grid.length)
      destY = Math.floor(Math.random() * grid[0].length)

      // Check reachbility for boath directions for only one node (for all the same!)
      if (destination.length != 0) {
        let path: undefined | (number | undefined)[] | null = search(
          { x: grid[destX][destY].x, y: grid[destX][destY].y },
          { x: destination[0].x, y: destination[0].y },
          grid,
        )
        if (path) {
          path = search(
            { x: destination[0].x, y: destination[0].y },
            { x: grid[destX][destY].x, y: grid[destX][destY].y },
            grid,
          )
          if (!path) {
            reachable = false
          }
        } else {
          reachable = false
        }
      } else {
        if (grid[destX][destY].type == 'water') {
          reachable = false
        }
      }
      if (destX != -1 && destY != -1 && reachable == true) {
        grid[destX][destY].type = 'road'
      }
    } while (!reachable)
    destination.push(grid[destX][destY])
    grid[destX][destY].type = 'road'
  }
  return destination
}
const timeTspExact = (
  grid: Grid,
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
  grid: Grid,
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
  grid: Grid,
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
): {
  grid: Grid
  destinations: number[]
  resultsExact: results
  deltaTimeExact: number
  resultsApprox: results
  deltaTimeApprox: number
} => {
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
  let destinations_id: number[] = []
  for (let i = 0; i < destinations.length; i++) {
    destinations_id.push(destinations[i].id)
  }
  return {
    grid,
    destinations: destinations_id,
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
  numberOfTests: number,
  mapPool?: Grid[],
): {
  grid: Grid
  destinations: number[]
  resultsExact: results
  deltaTimeExact: number
  resultsApprox: results
  deltaTimeApprox: number
}[] => {
  // Generate a set of maps
  console.log('Start Grid generation')
  let testGridSet: Grid[] = []
  if (mapPool) {
    testGridSet = mapPool
  } else {
    testGridSet = generateRandomMaps(numberOfMaps, false)
  }
  console.log('Grids generated ', testGridSet.length)
  let results: {
    grid: Grid
    destinations: number[]
    resultsExact: results
    deltaTimeExact: number
    resultsApprox: results
    deltaTimeApprox: number
  }[] = []
  testGridSet.forEach((testGrid) => {
    // For different maps try different number of destinations
    for (let j = 0; j < numberOfTests; j++) {
      for (let i = 3; i <= numberOfDestiations; i++) {
        // Set destinations
        let destinations = setDestinations(testGrid, i)
        // Run TSP Exact and Approx and safe results (ordering, time and map)
        // May need to timeout here -> Hardcode limit by trial and error
        results.push(testTspAlgo(testGrid, destinations, pathFindingAlgo, w, algoVersion, heuristic, drawList))
      }
      console.log('Map ', results.length, '.', j, 'finished')
    }
  })
  return results
}

//Function to eval results
export const evalResults = (mapPool?: Grid[]) => {
  /*
   ----- Test parameters settings ------
   */
  let w: number = 0
  let algoVersion: string = 'v1'
  let heuristic: string = 'manhattan'
  let drawList: boolean = false

  const numberOfDestiations: number = 4 //never lower than 3
  const numberOfMaps: number = 1
  const numberOfTests: number = 1 // How many different destinations sets per map and destination number

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
  console.log('Start TSP Main')
  let results = tspMainTest(
    numberOfMaps,
    numberOfDestiations,
    pathFindingAlgo,
    w,
    algoVersion,
    heuristic,
    drawList,
    numberOfTests,
    mapPool,
  )

  let toExport: ExportResultsTsp = []
  // Preparing results for analysis!
  for (let i = 0; i < results.length; i++) {
    if (results[i].resultsApprox.foundpath && results[i].resultsExact.foundpath) {
      toExport.push({
        gridSize: results[i].grid.length,
        destinations: results[i].destinations,
        numberOfDestiations: results[i].resultsApprox.ordering.length,
        timeTspApprox: results[i].deltaTimeApprox,
        lengthApprox: results[i].resultsApprox.pathlength,
        tspPathApprox: results[i].resultsApprox.tspPath,
        timeTspExact: results[i].deltaTimeExact,
        lengthExact: results[i].resultsExact.pathlength,
        algoVersion: algoVersion,
        tspPathExact: results[i].resultsExact.tspPath,
        heuristic: heuristic,
        mapId: i,
      })
    }
  }
  return toExport
}

export type ExportResultsTsp = {
  gridSize: number
  destinations: number[]
  numberOfDestiations: number
  timeTspApprox: number
  lengthApprox: number
  tspPathApprox: Position[]
  timeTspExact: number
  lengthExact: number
  tspPathExact: Position[]
  algoVersion: string
  heuristic: string
  mapId: number
}[]

// const exportEvalData = (evalData: ExportResultsTsp): void =>{
//   const savesDir = `${PKG_ROOT}/results`
//   if (!fs.existsSync(savesDir)) {
//     fs.emptyDirSync(savesDir)
//   }

//   const fileNameDate = new Date().toLocaleTimeString()
//   const jsonResults = JSON.stringify(evalData)
//   fs.writeFile(`${savesDir}/${fileNameDate}_TSP.json`, jsonResults)
// }
