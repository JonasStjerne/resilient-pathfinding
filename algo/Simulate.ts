import search from './AStarSearch.js'
import { Edge } from './models/Edge.js'
import { Grid } from './models/Grid.js'
import { Node } from './models/Node.js'
import { computeMue } from './mue.js'
export interface Position {
  x: number
  y: number
}

export interface results {
  grid: Grid
  idealPath: number[]
  pushProp: number
  successProp: number

  didReachGoal: boolean
  fallInWater: boolean
  pathtaken: Node[]
  distTouched: number
  distTaken: number
  gotPushedHere: Node[]
}

const randomBool = (prop: number): boolean => {
  return Math.random() < prop
}

export const simulateRoute = (
  grid: Grid,
  path: number[],
  startPos: Position,
  endPos: Position,
  pathFindingAlgo: (
    startPos: Position,
    endPos: Position,
    grid: Grid,
    w?: number,
    algoVersion?: string,
  ) => (number | undefined)[] | null,
  pushProp: number,
  w?: number,
  algoVersion?: string,
): results => {
  let noPath: boolean = false
  let results: results
  let didReachGoal: boolean = false
  let fallInWater: boolean = false
  let pathtaken: Node[] = []
  let distTouched: number = 0
  let distTaken: number = 0
  let gotPushedHere: Node[] = []
  let successProp: number = 0

  grid.forEach((row) => {
    row.forEach((cell) => {
      if (path.some((obj) => obj == cell.id && obj != path[path.length - 1])) {
        successProp += cell.mue
      }
    })
  })
  successProp = Math.pow(1 - pushProp, successProp)
  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.id === path[0]) {
        startPos = { x: cell.x, y: cell.y }
      }
      if (cell.id === path[path.length - 1]) {
        endPos = { x: cell.x, y: cell.y }
      }
    })
  })

  let currentPos: Position | undefined
  startPos && (currentPos = startPos)
  pathtaken.push(grid[startPos.x][startPos.y])
  let iter: number = 1

  while (currentPos != undefined && !(currentPos.x == endPos.x && currentPos.y == endPos.y)) {
    let next: Node | undefined
    if (grid[currentPos.x][currentPos.y].distEdges.length != 0) {
      distTouched += grid[currentPos.x][currentPos.y].distEdges.length
      grid[currentPos.x][currentPos.y].distEdges.forEach((distedge) => {
        if (Math.random() < pushProp) {
          next = distedge.adjacent
          currentPos && gotPushedHere.push(grid[currentPos.x][currentPos.y])
        }
      })
      if (next != undefined) {
        distTaken++
        currentPos = { x: next.x, y: next.y }
        if (grid[currentPos.x][currentPos.y].mue != 0 && endPos != undefined) {
          iter = 1
          const temp = pathFindingAlgo(currentPos, endPos, grid, w, algoVersion)
          if (temp != null) {
            path = temp.filter((num: number | undefined): num is number => num !== undefined)
          } else {
            noPath = true
          }
          if (path.length == 0) {
            noPath = true
          }
        } else {
          noPath = true
          fallInWater = true
          break
        }
      }
    }
    if (noPath) {
      break
    }
    if (next == undefined) {
      grid[currentPos.x][currentPos.y].edges.forEach((edge) => {
        if (edge.adjacent.id == path[iter]) {
          next = grid[edge.adjacent.x][edge.adjacent.y]
          currentPos = { x: next.x, y: next.y }
        }
      })

      iter++
    }
    next && pathtaken.push(next)
  }
  if (currentPos && currentPos.x == endPos.x && currentPos.y == endPos.y) {
    didReachGoal = true
  }
  results = {
    grid: grid,
    idealPath: path,
    pathtaken: pathtaken,
    didReachGoal: didReachGoal,
    gotPushedHere: gotPushedHere,
    fallInWater: fallInWater,
    pushProp: pushProp,
    successProp: successProp,
    distTaken: distTaken,
    distTouched: distTouched,
  }
  return results
}

export const testPushBackTest = (): void => {
  let v1 = new Node(0, 0, 'road')
  let v2 = new Node(0, 1, 'road')
  let v3 = new Node(0, 2, 'road')

  let grid: Grid = new Array(1)
  grid[0] = new Array(3)

  grid[0][0] = v1
  grid[0][1] = v2
  grid[0][2] = v3

  grid[0][0].edges.push(new Edge(grid[0][1], 1, grid[0][0]))
  grid[0][1].edges.push(new Edge(grid[0][2], 1, grid[0][1]))
  grid[0][1].distEdges.push(new Edge(grid[0][1], 1))
  grid[0][0].incomingDistEdges.push(grid[0][1])

  let path: number[] = [grid[0][0].id, grid[0][1].id, grid[0][2].id]
  let pushProp: number = 0.7
  computeMue(grid)

  let results: results = simulateRoute(
    grid,
    path,
    { x: grid[0][0].x, y: grid[0][0].y },
    { x: grid[0][2].x, y: grid[0][2].y },
    search,
    pushProp,
  )
}

export const simTestFunktion = (): void => {
  let v1 = new Node(0, 0, 'road')
  let v2 = new Node(0, 1, 'road')
  let v3 = new Node(0, 2, 'road')
  let v4 = new Node(0, 3, 'road')
  let v5 = new Node(0, 4, 'road')
  let v6 = new Node(0, 5, 'water')

  let grid: Grid = new Array(1)
  grid[0] = new Array(6)

  grid[0][0] = v1
  grid[0][1] = v2
  grid[0][2] = v3
  grid[0][3] = v4
  grid[0][4] = v5
  grid[0][5] = v6

  grid[0][0].edges.push(new Edge(grid[0][1], 1, grid[0][0]))
  grid[0][0].distEdges.push(new Edge(grid[0][4], 1))
  grid[0][4].incomingDistEdges.push(grid[0][0])

  grid[0][1].edges.push(new Edge(grid[0][2], 1, grid[0][1]))
  grid[0][1].distEdges.push(new Edge(grid[0][5], 1))
  grid[0][5].incomingDistEdges.push(grid[0][1])

  grid[0][2].edges.push(new Edge(grid[0][3], 1, grid[0][2]))
  grid[0][2].distEdges.push(new Edge(grid[0][5], 1))
  grid[0][5].incomingDistEdges.push(grid[0][2])

  grid[0][4].edges.push(new Edge(grid[0][5], 1, grid[0][4]))

  let path: number[] = [grid[0][0].id, grid[0][1].id, grid[0][2].id, grid[0][3].id]
  let pushProp: number = 0.5
  computeMue(grid)

  let results: results = simulateRoute(
    grid,
    path,
    { x: grid[0][0].x, y: grid[0][0].y },
    { x: grid[0][3].x, y: grid[0][3].y },
    search,
    pushProp,
  )
}
