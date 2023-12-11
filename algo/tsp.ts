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
  const bitmapTable: { [key: number]: { [current: number]: number } } = {}

  // Set of visited nodes, the computed cost and the id of the current node
  const addBitmapTableEnty = (visited: Node[], cost: number, current: number): boolean => {
    let key: number = 0
    for (let i = 0; i < visited.length; i++) {
      key = key | (1 << indexTable[visited[i].id])
    }

    // Check and update
    if (bitmapTable[key][current] != undefined) {
      if (!(bitmapTable[key][current] > cost)) {
        //Does this do the right thing
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

  // Set of visited nodes and the node id of the current node
  const bitmapTableLookUp = (visited: Node[], current: number): number | undefined => {
    let key: number = 0
    for (let i = 0; i < visited.length; i++) {
      key = key | (1 << indexTable[visited[i].id])
    }
    return bitmapTable[key][current]
  }

  // Finde ordering
  let length: number | undefined = 0
  let tspPath: Node[] = []
  let ordering: Node[] = []
  let foundtsp: boolean = false

  // Rekursic TSP optimizer
  // Fills Lookuptable -> path can be computed via lookup table!
  const TspOpt = (S: Node[], currentNode: Node, cost:number, prevNode?:Node): {ordering:Node[], cost:number} => {

    if(S.length != destinations.length -1){
    //For all nodes that could still be added to S check if its current best 
    let bestOrdering: Node[]
    let bestCost:number = -1
    // Base case
    destinations.forEach((newNode) => {if(S.some((node)=> newNode.id != node.id)){//iterate over all not in S
      let lookupval:number | undefined = bitmapTableLookUp(S.concat(currentNode), newNode.id)
      if(lookupval != undefined && lookupval < cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[newNode.id]].length){//check if is the current best for combination
        //if current best for S end continue TSP
        let bestset = TspOpt(S.concat(currentNode), newNode, cost + adjacentMatrix[indexTable[currentNode.id]][indexTable[newNode.id]].length)
        if(bestCost == -1 && bestset.cost != -1){
          bestOrdering = bestset.ordering
          bestCost = bestset.cost
        }else{
          if(bestCost > bestset.cost && bestset.cost != -1){
            bestOrdering = bestset.ordering
            bestCost = bestset.cost
          }
        }
      }
    }
    //Check which best => return ordering and cost => is in order (guess yes) 
    if(bestCost != -1){
      return {ordering: bestOrdering, cost: bestCost}
    }
  })

    }else{// try adding x_0 and check if best return appropriatly

    }
    
  }

  // Needs to be revamped
  // start rekursion
  TspOpt([], destinations[1], 0)

  //Extract data from lookup
  let key: number = 0
  for (let i = 0; i < destinations.length; i++) {
    if (i != 0) {
      key = key | (1 << indexTable[destinations[i].id])
    }
  }

  let lastNode: Node | undefined
  for (let i = 1; i < destinations.length; i++) {
    if (length == 0 || length == undefined) {
      length = bitmapTableLookUp(destinations, destinations[i].id)
      lastNode = destinations[i]
    } else {
      let temp = bitmapTableLookUp(destinations, destinations[i].id)
      if (temp != undefined && temp < length) {
        length = temp
        lastNode = destinations[i]
      }
    }
  }
  // trace back the path! -> by calculating
  lastNode && ordering.push(lastNode)
  // While not found all elements
  if (length == undefined){length = -1}
  let templength = length
  while (ordering.length != destinations.length) {
    // Finde new D element by iteratin matrix
    let distance = 0
    for (let i = 0; i < ordering.length; i++) {
      distance = adjacentMatrix[][]
      if (templength == templength - distance ) {
        
        break
      }
    }
    templength = templength - distance
  }

  if (length == undefined) {
    length = -1
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
