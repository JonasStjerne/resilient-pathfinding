import search from './AStarSearch.js'
import { Edge } from './models/Edge.js'
import { Grid } from './models/Grid.js'
import { Node } from './models/Node.js'
import { computeMue } from './mue.js'

export interface Position {
  x: number
  y: number
}

interface results {
  ordering: Node[]
  pathlength: number
  tspPath: Position[]
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

  // Results seach table
  const bitmapTable: { [key: number]: { [current: number]: number } } = {}

  // Add an entry to the seach table
  const addBitmapTableEnty = (visited: Node[], cost: number, current: number): boolean => {
    let key: number = 0
    for (let i = 0; i < visited.length; i++) {
      key = key | (1 << indexTable[visited[i].id])
    }

    // Check and update
    if (!bitmapTable[key]) {
      bitmapTable[key] = {}
    }

    if (bitmapTable[key]?.[current] != undefined) {
      if (bitmapTable[key][current] > cost) {
        bitmapTable[key][current] = cost
        return true
      } else {
        return false
      }
    } else {
      bitmapTable[key][current] = cost
      return true
    }
  }

  // Lookup entry in the seach table
  const bitmapTableLookUp = (visited: Node[], current: number): number | undefined => {
    let key: number = 0
    for (let i = 0; i < visited.length; i++) {
      key = key | (1 << indexTable[visited[i].id])
    }

    return bitmapTable[key]?.[current]
  }

  // Finde ordering
  let length: number | undefined = 0
  let tspPath: Position[] = []
  let ordering: Node[] = []
  let foundtsp: boolean = false

  // Rekursic TSP optimizer
  const TspOpt = (S: Node[], currentNode: Node, cost: number, prevNode?: Node): { ordering: Node[]; cost: number } => {
    //implicitly started from v_0 and no nodes visited
    if (S.length < destinations.length - 2) {
      let bestOrdering: Node[] = []
      let bestCost: number = -1

      // Base case Try to add a new next node
      destinations.forEach((newNode) => {
        if (
          newNode.id != destinations[0].id &&
          newNode.id != currentNode.id &&
          !S.some((node) => newNode.id === node.id)
        ) {
          //iterate over all not in S
          let lookupval: number | undefined = bitmapTableLookUp(S.concat(currentNode), newNode.id)
          if (
            (lookupval != undefined &&
              lookupval < cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[newNode.id]].length) ||
            lookupval == undefined
          ) {
            //check if is the current best for combination
            addBitmapTableEnty(
              S.concat(currentNode),
              cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[newNode.id]].length,
              newNode.id,
            )
            let bestset: { ordering: Node[]; cost: number }
            if (currentNode.id != destinations[0].id) {
              bestset = TspOpt(
                S.concat(currentNode),
                newNode,
                cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[newNode.id]].length,
              )
            } else {
              bestset = TspOpt(
                S,
                newNode,
                cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[newNode.id]].length,
              )
            }
            if (bestCost == -1 && bestset.cost != -1) {
              bestOrdering = bestset.ordering
              bestCost = bestset.cost
            } else {
              if (bestCost > bestset.cost && bestset.cost != -1) {
                bestOrdering = bestset.ordering
                bestCost = bestset.cost
              }
            }
          } else {
            if (false && lookupval == undefined) {
              addBitmapTableEnty(
                S.concat(currentNode),
                cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[newNode.id]].length,
                newNode.id,
              )
            }
          }
        }
      })
      //Check which of the returned ordering was the best
      if (bestCost != -1 && bestOrdering != undefined) {
        return { ordering: bestOrdering, cost: bestCost }
      } else {
        return { ordering: [], cost: -1 }
      }
    } else {
      //End case
      // Adding v_o and check if the best roundtrip
      let endval = cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[destinations[0].id]].length
      let best = bitmapTableLookUp(S.concat(currentNode), destinations[0].id)
      if (best != undefined && endval < best) {
        addBitmapTableEnty(S.concat(currentNode), endval, destinations[0].id)
        return { ordering: S.concat(currentNode, destinations[0]), cost: endval }
      } else if (best == undefined) {
        addBitmapTableEnty(S.concat(currentNode), endval, destinations[0].id)
        return { ordering: S.concat(currentNode, destinations[0]), cost: endval }
      }
    }
    // default should not be reached
    return { ordering: [], cost: -1 }
  }

  // start rekursion
  let temp = TspOpt([], destinations[0], 0)

  //Cleaning up the return
  ordering = temp.ordering
  ordering.unshift(destinations[0])
  length = temp.cost

  // If valied ordering was found that includes all destinations
  if (ordering.length == destinations.length + 1) {
    foundtsp = true

    //Set TSP path from orderin
    for (let i = 0; i < ordering.length - 1; i++) {
      let current: Node = ordering[i]
      let next: Node = ordering[i + 1]
      let temp2 = adjacentMatrix[indexTable[current.id]][indexTable[next.id]].path
      const posArr: Position[] = temp2.map((node) => {
        const pos = { x: node.x, y: node.y }
        return pos
      })
      tspPath = [...tspPath, ...posArr]
      tspPath.pop()
    }
    const { x, y } = ordering[ordering.length - 1]
    tspPath.push({ x, y })
  }

  // Give undefined value
  if (length == undefined) {
    length = -1
  }
  //Here
  return { ordering: ordering, pathlength: length, tspPath: tspPath, foundpath: foundtsp }
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
  let startX = x
  let startY = y
  // Finde ordering
  let ordering: Node[] = [destinations[x]] //Ordering in which nodes will be visited
  let length: number = 0 // length of computed path
  let tspPath: Node[] = [] //computed TSP path
  let newMin: number | undefined
  let xNew: number = x
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
    if (x == xNew) {
      //Something wrong here!
      // Must safe the starting node
      ordering.push(ordering[0])
      let pathid: (number | undefined)[] | null = pathFindingAlgo(
        { x: ordering[ordering.length - 2].x, y: ordering[ordering.length - 2].y },
        { x: ordering[ordering.length - 1].x, y: ordering[ordering.length - 1].y },
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
        length = length + calculatePathLength(path, grid)
        path.shift()
        for (let k = 0; k < path.length; k++) {
          tspPath.push(path[k])
        }
      }
    }
  } while (x != xNew)

  let foundpath: boolean = false
  if (ordering.length == destinations.length + 1) {
    foundpath = true
  }
  const posArr: Position[] = tspPath.map((node) => {
    const pos = { x: node.x, y: node.y }
    return pos
  })
  return { ordering: ordering, pathlength: length, tspPath: posArr, foundpath: foundpath }
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
  //Node is fucked
  console.log(results)
}
