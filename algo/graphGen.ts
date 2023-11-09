import { drawDisturbance, drawGrid } from '../client/index.js'
import { Position } from './AStarSearch.js'
import { addDisturbance, makeGrid, setGrid } from './grid.js'
import { Grid } from './models/Grid.js'

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
  private _pos: Position

  constructor(maxMoves: number, maxRadius: number, pos: Position) {
    this._maxMoves = maxMoves
    this._maxRadius = maxRadius
    this._movesLeft = maxMoves
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

  public get pos(): Position {
    return this._pos
  }

  public move(pos: Position) {
    this._pos = { x: pos.x, y: pos.y }
    this.reduceMoves()
  }
}

class DisturbanceChunk {
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

/* Good maps
 * Grid size = 100
 * Drawing agents = 15
 * Max moves = 500
 */
const GRID_SIZE = 100
// const nodeTypes = ["water"];
const DRAWING_AGENTS_NUMBER = 15
const MAX_MOVES = 500
const MAX_RADIUS = 10

export function generateOneGraph() {
  const newGrid = makeGrid(GRID_SIZE)
  generateWater(newGrid)
  generateDisturbances(newGrid)
}

function generateWater(grid: Grid) {
  const drawingAgents = new Array(DRAWING_AGENTS_NUMBER).fill(null).map(
    () =>
      new DrawingAgent(MAX_MOVES, MAX_RADIUS, {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }),
  )
  while (drawingAgents.some((agent) => agent.movesLeft > 0)) {
    drawingAgents.forEach((agent) => {
      // Make move
      const edgesFromCurrentNode = grid[agent.pos.x][agent.pos.y].edges.length
      const randomEdge = grid[agent.pos.x][agent.pos.y].edges[Math.floor(Math.random() * edgesFromCurrentNode)]
      agent.move({ x: randomEdge.adjacent.x, y: randomEdge.adjacent.y })
      // Set node type to water
      grid[agent.pos.x][agent.pos.y].type = 'water'
    })
  }
}

function generateDisturbances(grid: Grid) {
  // Chunk grid into wind directions (not every node is in a chunk)
  const MIN_CHUNK_WIDTH_HEIGHT = 30
  const MAX_CHUNK_WIDTH_HEIGHT = 50
  const AMOUNT_OF_CHUNKS = 5
  const directionValues = Object.values(Direction).filter((dir) => !dir.includes('top-left'))
  const chunks = new Array(AMOUNT_OF_CHUNKS).fill(null).map(() => {
    const randX = Math.floor(Math.random() * GRID_SIZE)
    const randY = Math.floor(Math.random() * GRID_SIZE)
    let randWidth = Math.floor(
      Math.random() * (MAX_CHUNK_WIDTH_HEIGHT - MIN_CHUNK_WIDTH_HEIGHT + 1) + MIN_CHUNK_WIDTH_HEIGHT,
    )
    let randHeight = Math.floor(
      Math.random() * (MAX_CHUNK_WIDTH_HEIGHT - MIN_CHUNK_WIDTH_HEIGHT + 1) + MIN_CHUNK_WIDTH_HEIGHT,
    )

    if (randX + randWidth > GRID_SIZE - 1) {
      randWidth = randWidth - (randX + randWidth - GRID_SIZE)
    }
    if (randY + randHeight > GRID_SIZE - 1) {
      randHeight = randHeight - (randY + randHeight - GRID_SIZE)
    }

    const randomDirection = directionValues[Math.floor(Math.random() * directionValues.length)]

    return new DisturbanceChunk({ x: randX, y: randY }, { width: randWidth, height: randHeight }, randomDirection)
  })
  setGrid(grid)
  // console.log("ROAD nodes: ", grid.flat().filter(node => node.type === "road").length);
  // console.log("WATER nodes: ", grid.flat().filter(node => node.type === "water").length);
  drawGrid()

  // DEBUG: Visualize chunks
  {
    // const canvas = <HTMLCanvasElement>document.getElementById('canvas')!
    // const cellSize = canvas.width / GRID_SIZE
    // const ctx = canvas.getContext('2d')!
    // const CHUNK_COLORS = ['60, 59, 156, ', '187, 34, 204, ', '187, 34, 51, ', '170, 153, 34, ', '170, 238, 34, ']
    // chunks.forEach((chunk, index) => {
    //   ctx.beginPath()
    //   ctx.fillStyle = `rgba(${CHUNK_COLORS[index] + '0.75'})` // Set the fill color
    //   ctx.fillRect(
    //     chunk.position.x * cellSize,
    //     chunk.position.y * cellSize,
    //     chunk.size.width * cellSize,
    //     chunk.size.height * cellSize,
    //   )
    // })
  }

  const CHUNK_ARROW_COLORS = {
    top: 'rgb(60, 59, 156)',
    left: 'rgb(187, 34, 204)',
    bottom: 'rgb(187, 34, 51)',
    right: 'rgb(170, 153, 34)',
    'top-left': 'rgb(174, 217, 191)',
    'bottom-left': 'rgb(245, 176, 109)',
    'bottom-right': 'rgb(8, 163, 6)',
    'top-right': 'rgb(146, 119, 117)',
  }

  chunks.forEach((chunk) => {
    const dir = chunk.direction
    if (dir === Direction.LEFT) {
      // <---------------X  /\
      // <---------------X  ||
      // <---------------X  ||
      // <---------------X  ||
      // <---------------X  ||
      for (let x = chunk.position.x + chunk.size.width - 1; x > chunk.position.x; x--) {
        for (let y = chunk.position.y + chunk.size.height - 1; y >= chunk.position.y; y--) {
          addDisturbance(grid[x][y], grid[x - 1][y])
          // drawDisturbance(grid[x][y], grid[x - 1][y], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    } else if (dir === Direction.BOTTOM) {
      // X-------------->
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // \/\/\/\/\/\/\/\/
      for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width; x++) {
        for (let y = chunk.position.y; y < chunk.position.y + chunk.size.height - 1; y++) {
          addDisturbance(grid[x][y], grid[x][y + 1])
          // drawDisturbance(grid[x][y], grid[x][y + 1], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    } else if (dir === Direction.RIGHT) {
      // || X--------------->
      // || X--------------->
      // || X--------------->
      // || X--------------->
      // \/ X--------------->
      for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width - 1; x++) {
        for (let y = chunk.position.y; y < chunk.position.y + chunk.size.height; y++) {
          addDisturbance(grid[x][y], grid[x + 1][y])
          // drawDisturbance(grid[x][y], grid[x + 1][y], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    } else if (dir === Direction.TOP) {
      // /\/\/\/\/\/\/\/\
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // ||||||||||||||||
      // X-------------->
      for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width; x++) {
        for (let y = chunk.position.y + chunk.size.height - 1; y > chunk.position.y; y--) {
          addDisturbance(grid[x][y], grid[x][y - 1])
          // drawDisturbance(grid[x][y], grid[x][y - 1], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    } else if (dir === Direction.TOP_LEFT) {
      // /\/\/\/\/\/\/\
      // \\\\\\\\\\\\\\\
      // \\\\\\\\\\\\\\\
      // \\\\\\\\\\\\\\\
      // \\\\\\\\\\\\\\\
      // <-------------X
      for (let x = chunk.position.x + chunk.size.width - 1; x > chunk.position.x; x--) {
        for (let y = chunk.position.y + chunk.size.height - 1; y > chunk.position.y; y--) {
          addDisturbance(grid[x][y], grid[x - 1][y - 1])
          // drawDisturbance(grid[x][y], grid[x - 1][y - 1], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    } else if (dir === Direction.BOTTOM_LEFT) {
      // <-----------X
      // /////////////
      // /////////////
      // /////////////
      // /////////////
      // /\/\/\/\/\/\/
      for (let x = chunk.position.x + chunk.size.width - 1; x > chunk.position.x; x--) {
        for (let y = chunk.position.y; y < chunk.position.y + chunk.size.height - 1; y++) {
          addDisturbance(grid[x][y], grid[x - 1][y + 1])
          // drawDisturbance(grid[x][y], grid[x - 1][y + 1], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    } else if (dir === Direction.BOTTOM_RIGHT) {
      // X----------->
      // \\\\\\\\\\\\
      // \\\\\\\\\\\\
      // \\\\\\\\\\\\
      // \\\\\\\\\\\\
      // /\/\/\/\/\/\/
      for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width - 1; x++) {
        for (let y = chunk.position.y; y < chunk.position.y + chunk.size.height - 1; y++) {
          addDisturbance(grid[x][y], grid[x + 1][y + 1])
          // drawDisturbance(grid[x][y], grid[x + 1][y + 1], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    } else if (dir === Direction.TOP_RIGHT) {
      // /\/\/\/\/\/\/\
      // /////////////
      // /////////////
      // /////////////
      // /////////////
      // X----------->
      for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width - 1; x++) {
        for (let y = chunk.position.y + chunk.size.height - 1; y > chunk.position.y; y--) {
          addDisturbance(grid[x][y], grid[x + 1][y - 1])
          // drawDisturbance(grid[x][y], grid[x + 1][y - 1], CHUNK_ARROW_COLORS[chunk.direction])
        }
      }
    }
  })
}
