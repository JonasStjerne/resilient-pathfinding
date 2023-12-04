import { Grid } from './models/Grid.js'
import { Node } from './models/Node.js'
import { Edge } from './models/Edge.js'
import search from './AStarSearch.js'
import { computeMue } from './mue.js'

export interface Position {
  x: number
  y: number
}

interface results {
  ordering: Node[]
  length: number
  tspPath: Node[]
  foundpath: boolean
}

interface adjacent {
  path: Node[]
  length: number
}

const calculatePathLength = (path: Node[], grid: Grid): number => {
  let pathLenght: number = 0
  path.forEach((node, index, path) => {
    if (index < path.length - 1) {
      const possibleMoves = [...node.edges]
      pathLenght += possibleMoves.find((edge) => edge.adjacent.id == path[index + 1].id)!.weight
    }
  })

  return pathLenght
}

// Held–Karp algorithm
export const tSPExact = (
  grid: Grid,
  pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w: number,
    algoVersion: string,
    heuristic: string,
    drawLists: boolean,
  ) => (number | undefined)[] | null,
  destinations: Node[],
  w: number,
  algoVersion: string,
  heuristic: string,
  drawLists: boolean,
): results => {
  // Adjacent matrix
  const adjacentMatrix: adjacent[][] = new Array(destinations.length)
  for (let i = 0; i < destinations.length; i++) {
    adjacentMatrix[i] = new Array(destinations.length)
  }

  // Set up seach table
  const SearchTable: { [key: number]: Node } = {}
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      SearchTable[grid[i][j].id] = grid[i][j]
    }
  }

  // Fill adjacents matrix
  for (let i = 0; i < destinations.length; i++) {
    for (let j = 0; j < destinations.length; j++) {
      if (i != j) {
        let pathid: (number | undefined)[] | null = pathFindingAlgo(
          { x: destinations[i].x, y: destinations[i].y },
          { x: destinations[j].x, y: destinations[j].y },
          grid,
          w,
          algoVersion,
          heuristic,
          drawLists,
        )
        let path: Node[] = []
        if (pathid != null) {
          pathid = pathid.filter((num: number | undefined): num is number => num !== undefined)
          pathid.forEach((id) => {
            if (id != undefined) {
              path.push(SearchTable[id])
            }
          })
          adjacentMatrix[i][j] = { path: path, length: calculatePathLength(path, grid) }
        }
      } else {
        adjacentMatrix[i][j] = { path: [], length: 0 }
      }
    }
  }

  // Seach table to finde index of a node
  const indexTable: { [key: number]: number } = {}
  for (let i = 0; i < destinations.length; i++) {
    indexTable[destinations[i].id] = i
  }

  // Results Table -> No dubble computation
  const bitmapTable: { [key: number]: number } = {}

  const addBitmapTableEnty = (visited: Node[], cost: number): void => {
    let key: number = 0
    for (let i = 0; i < visited.length; i++) {
      key = key | (1 << indexTable[visited[i].id])
    }

    // Check and update
    if (!(bitmapTable[key] > cost)) {
      bitmapTable[key] = cost
    }
  }

  const bitmaoTableLookUp = (visited: Node[]): number => {
    let key: number = 0
    for (let i = 0; i < visited.length; i++) {
      key = key | (1 << indexTable[visited[i].id])
    }
    return bitmapTable[key]
  }

  // Finde ordering
  let length: number = 0
  let tspPath: Node[] = []
  let ordering: Node[] = []
  let foundtsp: boolean = false

  // Rekursion funktion
  // visited in order
  const findOpt = (visited: Node[], currentcost: number): void => {
    // Assume that we were or are optimal!
    for (let i = 0; i < destinations.length; i++) {
      if (visited.some((node) => node.id != destinations[i].id)) {
        //found node that is not in visited
        let newCost: number = currentcost + adjacentMatrix[indexTable[visited[visited.length - 1].id]][i].length
        let setCost: number = bitmaoTableLookUp(visited.concat(destinations[i]))
        if (newCost < setCost) {
          // Is best ordeing for the nodes so fare
          addBitmapTableEnty(visited, newCost)
          findOpt(visited, newCost)
        }
      } else {
        // no nodes left => found some ordering => check if best and safe!
        if (bitmaoTableLookUp(visited) > currentcost) {
          addBitmapTableEnty(visited, currentcost)
          ordering = visited
        }
      }
    }
    if (bitmaoTableLookUp(visited) < currentcost) {
      destinations.forEach((elem) => {
        if (!visited.some((node) => node.id != elem.id)) {
          findOpt
        }
      })
    } else {
      return
    }
  }

  // start rekursion
  findOpt([destinations[0]], 0)

  if (ordering.length == destinations.length) {
    foundtsp = true
    for (let i = 0; i < ordering.length - 1; i++) {
      tspPath.concat(adjacentMatrix[indexTable[ordering[i].id]][indexTable[ordering[i + 1].id]].path.splice(0, 1))
    }
    length = bitmaoTableLookUp(ordering)
  }

  return { ordering: ordering, length: length, tspPath: tspPath, foundpath: foundtsp }
}

// Greedy algo for TSP
export const tSPApproximation = (
  grid: Grid,
  pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w: number,
    algoVersion: string,
    heuristic: string,
    drawLists: boolean,
  ) => (number | undefined)[] | null,
  destinations: Node[],
  w: number,
  algoVersion: string,
  heuristic: string,
  drawLists: boolean,
): results => {
  // Adjacent matrix
  const adjacentMatrix: adjacent[][] = new Array(destinations.length)
  for (let i = 0; i < destinations.length; i++) {
    adjacentMatrix[i] = new Array(destinations.length)
  }

  // Set up seach table
  const SearchTable: { [key: number]: Node } = {}
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      SearchTable[grid[i][j].id] = grid[i][j]
    }
  }

  // Fill adjacents matrix
  let x: number = -1
  let y: number = -1
  let min: number | undefined
  //Missing one element per row!
  for (let i = 0; i < destinations.length; i++) {
    for (let j = 0; j < destinations.length; j++) {
      if (i != j) {
        let pathid: (number | undefined)[] | null = pathFindingAlgo(
          { x: destinations[i].x, y: destinations[i].y },
          { x: destinations[j].x, y: destinations[j].y },
          grid,
          w,
          algoVersion,
          heuristic,
          drawLists,
        )
        let path: Node[] = []
        if (pathid != null) {
          pathid = pathid.filter((num: number | undefined): num is number => num !== undefined)
          pathid.forEach((id) => {
            if (id != undefined) {
              path.push(SearchTable[id])
            }
          })
          adjacentMatrix[i][j] = { path: path, length: calculatePathLength(path, grid) }
          if (min == undefined) {
            min = adjacentMatrix[i][j].length
            x = i
            y = j
          } else {
            if (adjacentMatrix[i][j].length < min) {
              min = adjacentMatrix[i][j].length
              x = i
              y = j
            }
          }
        }
      } else {
        adjacentMatrix[i][j] = { path: [], length: -1 }
      }
    }
  }

  // Finde ordering
  let ordering: Node[] = [destinations[x]] //Ordering in which nodes will be visited
  let length: number = 0 // length of computed path
  let tspPath: Node[] = [] //computed TSP path
  let newMin: number | undefined
  let xNew: number = x
  console.log(adjacentMatrix) // works until here
  for (let i = 0; i < adjacentMatrix.length; i++) {
    adjacentMatrix[i][x].length = -1
  }
  do {
    //iter 1
    x = xNew
    newMin = undefined
    newMin = undefined
    for (let i = 0; i < adjacentMatrix[x].length; i++) {
      if (newMin == undefined && adjacentMatrix[x][i].length != -1) {
        //does not trigger
        xNew = i
        newMin = adjacentMatrix[x][i].length
      } else if (adjacentMatrix[x][i].length > 0 && newMin != undefined && adjacentMatrix[x][i].length < newMin) {
        xNew = i
        newMin = adjacentMatrix[x][i].length
      }
    }

    if (x != xNew) {
      ordering.push(destinations[xNew])
      length += adjacentMatrix[x][xNew].length //might be wrong
      if (tspPath.length != 0) {
        tspPath = tspPath.concat(adjacentMatrix[x][xNew].path.slice(1))
      } else {
        tspPath = adjacentMatrix[x][xNew].path
      }
    }

    for (let i = 0; i < adjacentMatrix.length; i++) {
      adjacentMatrix[i][xNew].length = -1
    }
  } while (x != xNew)

  let foundpath: boolean = false
  if (ordering.length == destinations.length) {
    foundpath = true
  }
  return { ordering: ordering, length: length, tspPath: tspPath, foundpath: foundpath }
}

export const TestFunctionTSPapprox = (): void => {
  let v1 = new Node(0, 0, 'road')
  let v2 = new Node(0, 1, 'road')
  let v3 = new Node(0, 2, 'road')
  let v4 = new Node(0, 3, 'road')

  let grid: Grid = new Array(1)
  grid[0] = new Array(4)

  grid[0][0] = v1
  grid[0][1] = v2
  grid[0][2] = v3
  grid[0][3] = v4

  // set edges
  grid[0][0].edges.push(new Edge(grid[0][1], 10, grid[0][0]))
  grid[0][1].edges.push(new Edge(grid[0][0], 10, grid[0][1]))

  grid[0][0].edges.push(new Edge(grid[0][2], 15, grid[0][0]))
  grid[0][2].edges.push(new Edge(grid[0][0], 15, grid[0][2]))

  grid[0][2].edges.push(new Edge(grid[0][3], 20, grid[0][2]))
  grid[0][3].edges.push(new Edge(grid[0][2], 20, grid[0][3]))

  grid[0][3].edges.push(new Edge(grid[0][1], 15, grid[0][3]))
  grid[0][1].edges.push(new Edge(grid[0][3], 15, grid[0][1]))
  computeMue(grid)

  let results: results = tSPApproximation(
    grid,
    search,
    [grid[0][0], grid[0][1], grid[0][2], grid[0][3]],
    0.5,
    'v1',
    'manhattan',
    false,
  )
  //Node is are fucked
  console.log(results)
}
