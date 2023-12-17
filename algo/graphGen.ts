// Experimental radius is bugged. And its use cases are commented out.

import { disableContinuousDrawing, drawGrid, enableContinuousDrawing } from '../client/index.js'
import search from './AStarSearch.js'
import { addDisturbance, makeGrid, setGrid } from './grid.js'
import { Grid } from './models/Grid.js'
import { Position } from './models/Position.js'
import { computeMue } from './mue.js'

interface Size {
  width: number
  height: number
}

enum Direction {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
}

class DrawingAgent {
  private _maxMoves
  private _maxRadius
  private _movesLeft
  private _originalPos: Position
  private _pos: Position

  constructor(maxMoves: number, maxRadius: number, pos: Position) {
    this._maxMoves = maxMoves
    this._maxRadius = maxRadius
    this._movesLeft = maxMoves
    this._originalPos = pos
    this._pos = pos
  }

  private reduceMoves() {
    this._movesLeft--
  }

  public get maxMoves(): number {
    return this._maxMoves
  }

  public get maxRadius(): number {
    return this._maxRadius
  }

  public get movesLeft(): number {
    return this._movesLeft
  }

  public get originalPos(): Position {
    return this._originalPos
  }

  public get pos(): Position {
    return this._pos
  }

  public move(pos: Position) {
    this._pos = { x: pos.x, y: pos.y }
    this.reduceMoves()
  }

  public addMoves() {
    this._movesLeft++
  }

  public exceedsRadius(newPos: Position) {
    const x = this.originalPos.x - newPos.x
    const y = this.originalPos.y - newPos.y
    return Math.sqrt(x * x + y * y) > this._maxRadius
  }
}

class DisturbanceCluster {
  private _position: Position
  private _size: Size
  private _direction: Direction

  constructor(position: Position, size: Size, direction: Direction) {
    this._position = position
    this._size = size
    this._direction = direction
  }

  public get position() {
    return this._position
  }

  public get size() {
    return this._size
  }

  public get direction() {
    return this._direction
  }
}

/* Good map
 * GRID_SIZE = 100
 * DRAWING_AGENTS_NUMBER = 9
 * MAX_MOVES = 500
 * writingOnExistingWaterNodes = true
 * distanceBetweenAgents = 22
 * MIN_CLUSTER_WIDTH_HEIGHT = 20
 * MAX_CLUSTER_WIDTH_HEIGHT = 50
 * AMOUNT_OF_CLUSTERS = 6
 */
const GRID_SIZE = 100
const DRAWING_AGENTS_NUMBER = 9
const MAX_MOVES = 500
const MAX_RADIUS_FACTOR = 1.3

function writeGeneratingGraph(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  ctx.font = '26px Arial'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const x = canvas.width / 2
  const y = canvas.height / 2
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillText('Generating graph', x, y)
}

export function generateOneGraph() {
  const canvas = <HTMLCanvasElement>document.getElementById('canvas')!
  writeGeneratingGraph(canvas)
  const newGrid = makeGrid(GRID_SIZE)
  setTimeout(() => {
    const drawingAgents = generateWater(newGrid)
    setGrid(newGrid)
    console.debug('WATER nodes: ', newGrid.flat().filter((node) => node.type === 'water').length)
    generateDisturbances(newGrid)
    computeMue(newGrid)
    drawGrid()

    disableContinuousDrawing(canvas)
    enableContinuousDrawing(canvas)
  }, 100)

  // DEBUG: Mark starting point of each water drawing agent
  // drawingAgents.forEach((agent) => {
  //   const canvas = <HTMLCanvasElement>document.getElementById('canvas')!
  //   const cellSize = canvas.width / GRID_SIZE
  //   const ctx = canvas.getContext('2d')!
  //   ctx.fillStyle = 'rgb(255, 51, 85)'
  //   ctx.fillRect(agent.originalPos.x * cellSize, agent.originalPos.y * cellSize, cellSize, cellSize)
  // })
}

export function generateRandomMaps(mapsCount: number) {
  const maps: Grid[] = []
  for (let i = 0; i < mapsCount; i++) {
    const newGrid = makeGrid(GRID_SIZE)
    generateWater(newGrid)
    generateDisturbances(newGrid)
    computeMue(newGrid)
    setStartAndEnd(newGrid)
    maps.push(newGrid)
  }
  return maps
}

function setStartAndEnd(grid: Grid) {
  const minDistanceBetweenPoints = grid.length / 2 - 10
  let path: undefined | (number | undefined)[] | null
  let startX, startY, goalX, goalY

  do {
    if (startX && startY && goalX && goalY) {
      grid[startX][startY].type = 'road'
      grid[goalX][goalY].type = 'road'
    }
    startX = Math.floor(Math.random() * grid.length)
    startY = Math.floor(Math.random() * grid[0].length)
    grid[startX][startY].type = 'start'

    goalX = Math.floor(Math.random() * grid.length)
    goalY = Math.floor(Math.random() * grid[0].length)
    grid[goalX][goalY].type = 'goal'

    if (euclideanDistance({ x: startX, y: startY }, { x: goalX, y: goalY }) < minDistanceBetweenPoints) {
      path = undefined
    } else {
      path = search({ x: startX, y: startY }, { x: goalX, y: goalY }, grid)
    }
  } while (!path)
}

export function euclideanDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
  const dx = point1.x - point2.x
  const dy = point1.y - point2.y
  return Math.sqrt(dx * dx + dy * dy)
}

function arePointsFarEnough(newPoint: Position, existingPoints: Position[], minDistance: number): boolean {
  for (const point of existingPoints) {
    if (euclideanDistance(newPoint, point) < minDistance) {
      return false
    }
  }
  return true
}

function generatePointsWithMinDistance(numPoints: number, minDistance: number): Position[] {
  const points: Position[] = []

  while (points.length < numPoints) {
    const newPoint = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }

    if (arePointsFarEnough(newPoint, points, minDistance)) {
      points.push(newPoint)
    }
  }

  return points
}

/**
 * Modifies random nodes of grid to be of type "water" by random walk of agents starting in random positions.
 * @param grid
 * @param writingOnExistingWaterNodes specifies whether a new move should be found if the node already is of type "water"
 */
function generateWater(grid: Grid, writingOnExistingWaterNodes = true): DrawingAgent[] {
  const MAX_RADIUS = Math.ceil(Math.sqrt(MAX_MOVES) * MAX_RADIUS_FACTOR)
  const agentPositions = generatePointsWithMinDistance(DRAWING_AGENTS_NUMBER, 22)
  const drawingAgents = Array.from(
    { length: DRAWING_AGENTS_NUMBER },
    (_, i) => new DrawingAgent(MAX_MOVES, MAX_RADIUS, { x: agentPositions[i].x, y: agentPositions[i].y }),
  )

  while (drawingAgents.some((agent) => agent.movesLeft > 0)) {
    drawingAgents.forEach((agent) => {
      if (agent.movesLeft > 0) {
        // Make move
        const edgesFromCurrentNodeLength = grid[agent.pos.x][agent.pos.y].edges.length
        let randomEdge
        let foundLegalMove = false
        while (!foundLegalMove) {
          randomEdge = grid[agent.pos.x][agent.pos.y].edges[Math.floor(Math.random() * edgesFromCurrentNodeLength)]
          // Experimental radius
          // if (!agent.exceedsRadius({ x: randomEdge.adjacent.x, y: randomEdge.adjacent.y })) foundLegalMove = true
          foundLegalMove = true // This needs to be commented if experimental radius is used
        }
        if (!randomEdge) return
        agent.move({ x: randomEdge.adjacent.x, y: randomEdge.adjacent.y })

        // Set node type to water
        if (writingOnExistingWaterNodes) {
          grid[agent.pos.x][agent.pos.y].type = 'water'
        } else {
          if (grid[agent.pos.x][agent.pos.y].type === 'water') agent.addMoves()
          else grid[agent.pos.x][agent.pos.y].type = 'water'
        }
      }
    })
  }
  return drawingAgents
}

/**
 * Generates rectangular clusters on the grid, and creates disturbances with one random direction per cluster.
 * @param grid
 */
function generateDisturbances(grid: Grid) {
  const MIN_CLUSTER_WIDTH_HEIGHT = 30
  const MAX_CLUSTER_WIDTH_HEIGHT = 50
  const AMOUNT_OF_CLUSTERS = 6
  const directionValues = Object.values(Direction)
  const clusters = new Array(AMOUNT_OF_CLUSTERS).fill(null).map(() => {
    const randX = Math.floor(Math.random() * GRID_SIZE)
    const randY = Math.floor(Math.random() * GRID_SIZE)
    let randWidth = Math.floor(
      Math.random() * (MAX_CLUSTER_WIDTH_HEIGHT - MIN_CLUSTER_WIDTH_HEIGHT + 1) + MIN_CLUSTER_WIDTH_HEIGHT,
    )
    let randHeight = Math.floor(
      Math.random() * (MAX_CLUSTER_WIDTH_HEIGHT - MIN_CLUSTER_WIDTH_HEIGHT + 1) + MIN_CLUSTER_WIDTH_HEIGHT,
    )

    if (randX + randWidth > GRID_SIZE - 1) {
      randWidth = randWidth - (randX + randWidth - GRID_SIZE)
    }
    if (randY + randHeight > GRID_SIZE - 1) {
      randHeight = randHeight - (randY + randHeight - GRID_SIZE)
    }

    const randomDirection = directionValues[Math.floor(Math.random() * directionValues.length)]

    return new DisturbanceCluster({ x: randX, y: randY }, { width: randWidth, height: randHeight }, randomDirection)
  })

  // DEBUG: Visualize clusters
  // const canvas = <HTMLCanvasElement>document.getElementById('canvas')!
  // const cellSize = canvas.width / GRID_SIZE
  // const ctx = canvas.getContext('2d')!
  // const CLUSTER_COLORS = ['60, 59, 156, ', '187, 34, 204, ', '187, 34, 51, ', '170, 153, 34, ', '170, 238, 34, '] // needs as many colors as number of clusters defined
  // clusters.forEach((cluster, index) => {
  //   ctx.beginPath()
  //   ctx.fillStyle = `rgba(${CLUSTER_COLORS[index] + '0.75'})` // Set the fill color
  //   ctx.fillRect(
  //     cluster.position.x * cellSize,
  //     cluster.position.y * cellSize,
  //     cluster.size.width * cellSize,
  //     cluster.size.height * cellSize,
  //   )
  // })

  const CLUSTER_ARROW_COLORS = {
    top: 'rgb(60, 59, 156)',
    left: 'rgb(187, 34, 204)',
    bottom: 'rgb(187, 34, 51)',
    right: 'rgb(170, 153, 34)',
    'top-left': 'rgb(174, 217, 191)',
    'bottom-left': 'rgb(245, 176, 109)',
    'bottom-right': 'rgb(8, 163, 6)',
    'top-right': 'rgb(146, 119, 117)',
  }

  clusters.forEach((cluster) => {
    const dir = cluster.direction
    if (dir === Direction.LEFT) {
      // <---------------X  /\
      // <---------------X  ||
      // <---------------X  ||
      // <---------------X  ||
      // <---------------X  ||
      for (let x = cluster.position.x + cluster.size.width - 1; x > cluster.position.x; x--) {
        for (let y = cluster.position.y + cluster.size.height - 1; y >= cluster.position.y; y--) {
          addDisturbance(grid[x][y], grid[x - 1][y])
          // drawDisturbance(grid[x][y], grid[x - 1][y], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    } else if (dir === Direction.BOTTOM) {
      // X-------------->
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // \/\/\/\/\/\/\/\/
      for (let x = cluster.position.x; x < cluster.position.x + cluster.size.width; x++) {
        for (let y = cluster.position.y; y < cluster.position.y + cluster.size.height - 1; y++) {
          addDisturbance(grid[x][y], grid[x][y + 1])
          // drawDisturbance(grid[x][y], grid[x][y + 1], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    } else if (dir === Direction.RIGHT) {
      // || X--------------->
      // || X--------------->
      // || X--------------->
      // || X--------------->
      // \/ X--------------->
      for (let x = cluster.position.x; x < cluster.position.x + cluster.size.width - 1; x++) {
        for (let y = cluster.position.y; y < cluster.position.y + cluster.size.height; y++) {
          addDisturbance(grid[x][y], grid[x + 1][y])
          // drawDisturbance(grid[x][y], grid[x + 1][y], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    } else if (dir === Direction.TOP) {
      // /\/\/\/\/\/\/\/\
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // X-------------->
      for (let x = cluster.position.x; x < cluster.position.x + cluster.size.width; x++) {
        for (let y = cluster.position.y + cluster.size.height - 1; y > cluster.position.y; y--) {
          addDisturbance(grid[x][y], grid[x][y - 1])
          // drawDisturbance(grid[x][y], grid[x][y - 1], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    } else if (dir === Direction.TOP_LEFT) {
      // /\/\/\/\/\/\/\
      // \\\\\\\\\\\\\\\
      // \\\\\\\\\\\\\\\
      // \\\\\\\\\\\\\\\
      // \\\\\\\\\\\\\\\
      // <-------------X
      for (let x = cluster.position.x + cluster.size.width - 1; x > cluster.position.x; x--) {
        for (let y = cluster.position.y + cluster.size.height - 1; y > cluster.position.y; y--) {
          addDisturbance(grid[x][y], grid[x - 1][y - 1])
          // drawDisturbance(grid[x][y], grid[x - 1][y - 1], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    } else if (dir === Direction.BOTTOM_LEFT) {
      // <-----------X
      // /////////////
      // /////////////
      // /////////////
      // /////////////
      // /\/\/\/\/\/\/
      for (let x = cluster.position.x + cluster.size.width - 1; x > cluster.position.x; x--) {
        for (let y = cluster.position.y; y < cluster.position.y + cluster.size.height - 1; y++) {
          addDisturbance(grid[x][y], grid[x - 1][y + 1])
          // drawDisturbance(grid[x][y], grid[x - 1][y + 1], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    } else if (dir === Direction.BOTTOM_RIGHT) {
      // X----------->
      // \\\\\\\\\\\\
      // \\\\\\\\\\\\
      // \\\\\\\\\\\\
      // \\\\\\\\\\\\
      // /\/\/\/\/\/\/
      for (let x = cluster.position.x; x < cluster.position.x + cluster.size.width - 1; x++) {
        for (let y = cluster.position.y; y < cluster.position.y + cluster.size.height - 1; y++) {
          addDisturbance(grid[x][y], grid[x + 1][y + 1])
          // drawDisturbance(grid[x][y], grid[x + 1][y + 1], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    } else if (dir === Direction.TOP_RIGHT) {
      // /\/\/\/\/\/\/\
      // /////////////
      // /////////////
      // /////////////
      // /////////////
      // X----------->
      for (let x = cluster.position.x; x < cluster.position.x + cluster.size.width - 1; x++) {
        for (let y = cluster.position.y + cluster.size.height - 1; y > cluster.position.y; y--) {
          addDisturbance(grid[x][y], grid[x + 1][y - 1])
          // drawDisturbance(grid[x][y], grid[x + 1][y - 1], CLUSTER_ARROW_COLORS[cluster.direction])
        }
      }
    }
  })
}
