import search from '../algo/AStarSearch.js'
import { generateOneGraph } from '../algo/graphGen.js'
import {
  addDisturbance,
  addEdge,
  deleteDisturbance,
  deleteEdge,
  grid,
  makeGrid,
  setGrid,
  setTypeOfNode,
} from '../algo/grid.js'
import { Node, NodeType } from '../algo/models/Node.js'
import { computeMue } from '../algo/mue.js'
import { initSaveControl } from './save.js'
import {
  ControlsData,
  getActiveGridFromLocalStorage,
  getControlsFromLocalStorage,
  saveActiveGridToLocalStorage,
  saveControlsToLocalStorage,
} from './saveService.js'

export default function clientInit() {
  let savedGrid = getActiveGridFromLocalStorage()
  if (savedGrid) {
    setGrid(savedGrid)
  }
  // grid[0][0].edges = [];
  // grid[0][1].edges = [];
  // grid[1][0].edges = [];
  // grid[2][1].edges = [];
  setControls()
  drawGrid()
  enableContinuousDrawing(canvas)
  initSaveControl()
}

const cellPadding = 2

let riskFactor = 0.0

const riskFactorSlider = <HTMLInputElement>document.getElementById('risk-factor')!
const riskFactorView = <HTMLSpanElement>document.getElementById('risk-factor-view')!

// const wallBtn = document.getElementById("wall" satisfies drawType)!;
const startBtn = document.getElementById('start' satisfies drawType)!
const goalBtn = document.getElementById('goal' satisfies drawType)!
const waterBtn = document.getElementById('water' satisfies drawType)!
const roadBtn = document.getElementById('road' satisfies drawType)!
const edgeBtn = document.getElementById('edge' satisfies drawType)!
const disturbanceBtn = document.getElementById('disturbance' satisfies drawType)!

let selectedType: drawType = 'water'
let multiSelectedCells: Node[] = []

const runAlgoBtn = <HTMLButtonElement>document.getElementById('run-algo')!
const resetGridBtn = <HTMLButtonElement>document.getElementById('reset-grid-btn')!
const genGridBtn = <HTMLButtonElement>document.getElementById('gen-grid-btn')!

const showMuRadios = <NodeListOf<HTMLInputElement>>document.getElementsByName('mu-options')!
const showIdsCheckbox = <HTMLInputElement>document.getElementById('show-node-id')!
const showOpenAndClosedListsCheckbox = <HTMLInputElement>document.getElementById('show-open-and-closed-lists')!
const showDisturbancesCheckbox = <HTMLInputElement>document.getElementById('show-disturbances')!
const showDirectedEdgesCheckbox = <HTMLInputElement>document.getElementById('show-directed-edges')!
const deleteModeCheckbox = <HTMLInputElement>document.getElementById('delete-mode')!

startBtn.addEventListener('mouseup', () => selectDrawType('start' satisfies drawType))
goalBtn.addEventListener('mouseup', () => selectDrawType('goal' satisfies drawType))
waterBtn.addEventListener('mouseup', () => selectDrawType('water' satisfies drawType))
roadBtn.addEventListener('mouseup', () => selectDrawType('road' satisfies drawType))
edgeBtn.addEventListener('mouseup', () => selectDrawType('edge' satisfies drawType))
disturbanceBtn.addEventListener('mouseup', () => selectDrawType('disturbance' satisfies drawType))

runAlgoBtn.addEventListener('mouseup', runPathFinding)
resetGridBtn.addEventListener('mouseup', resetGrid)
genGridBtn.addEventListener('mouseup', generateOneGraph)

for (var i = 0; i < showMuRadios.length; i++) {
  showMuRadios.item(i).addEventListener('change', drawGrid)
}
showIdsCheckbox.addEventListener('change', drawGrid)
showOpenAndClosedListsCheckbox.addEventListener('change', runPathFinding)
showDisturbancesCheckbox.addEventListener('change', drawGrid)
showDirectedEdgesCheckbox.addEventListener('change', drawGrid)

window.addEventListener('unload', () => {
  saveControls()
  if (grid[0][0]) {
    saveActiveGridToLocalStorage(grid)
  }
})

riskFactorSlider.addEventListener('input', () => {
  riskFactor = Number(riskFactorSlider.value)

  riskFactorView.textContent = 'Risk factor set to: ' + riskFactor.toString()

  console.log('RiskFactor set to: ' + riskFactor)
})

function setControls() {
  const controls = getControlsFromLocalStorage()
  if (!controls) {
    return
  }
  showMuRadios.item(0).checked = controls.options.mu === 'number'
  showMuRadios.item(1).checked = controls.options.mu === 'color'
  showMuRadios.item(2).checked = controls.options.mu === 'both'
  showMuRadios.item(3).checked = controls.options.mu === 'none'
  showIdsCheckbox.checked = controls.options.nodeId
  showOpenAndClosedListsCheckbox.checked = controls.options.lists
  showDisturbancesCheckbox.checked = controls.options.disturbances
  showDirectedEdgesCheckbox.checked = controls.options.directedEdges
  riskFactorView.textContent = 'Risk factor set to: ' + controls.options.riskFactor.toString()
  riskFactorSlider.value = controls.options.riskFactor.toString()
  riskFactor = controls.options.riskFactor
  selectDrawType(controls.drawType)
  // selectedType = controls.drawType
}

function saveControls() {
  let muVal: string = 'none'
  if ((<HTMLInputElement>document.getElementById('show-mu-number'))?.checked) {
    muVal = (<HTMLInputElement>document.getElementById('show-mu-number'))?.value
  } else if ((<HTMLInputElement>document.getElementById('show-mu-color'))?.checked) {
    muVal = (<HTMLInputElement>document.getElementById('show-mu-color'))?.value
  } else if ((<HTMLInputElement>document.getElementById('show-mu-both'))?.checked) {
    muVal = (<HTMLInputElement>document.getElementById('show-mu-both'))?.value
  }

  const controlsData: ControlsData = {
    drawType: selectedType,
    options: {
      directedEdges: showDirectedEdgesCheckbox.checked,
      disturbances: showDisturbancesCheckbox.checked,
      mu: muVal,
      nodeId: showIdsCheckbox.checked,
      lists: showOpenAndClosedListsCheckbox.checked,
      riskFactor: riskFactor,
    },
  }
  saveControlsToLocalStorage(controlsData)
}
export type drawType = 'start' | 'goal' | 'water' | 'road' | 'disturbance' | 'edge'
type color = 'blue' | 'black' | 'green' | 'red' | 'white'
export let startNode: Pick<Node, 'x' | 'y'> | null = null
export let endNode: Pick<Node, 'x' | 'y'> | null = null

const colorMap: Record<color, string> = {
  black: '#000',
  blue: '#3260a8',
  green: '#4dff00',
  red: '#ff0000',
  white: '#ffffff',
}

const drawTypeToColor: Record<NodeType, color> = {
  road: 'white',
  start: 'green',
  goal: 'red',
  water: 'blue',
}
const gradientMaxColor = 120

function selectDrawType(id: drawType) {
  if (selectedType == id) {
    return
  }
  ;[startBtn, goalBtn, waterBtn, roadBtn, edgeBtn, disturbanceBtn].forEach((elm) => elm.classList.remove('selected'))
  selectedType = id
  if (['edge', 'disturbance'].includes(id)) {
    multiSelectedCells = []
  }
  document.getElementById(id)!.classList.add('selected')
}

const canvasSize = 600

// const gridNumber = 10;
const canvas = <HTMLCanvasElement>document.getElementById('canvas')!
const ctx = canvas.getContext('2d')!
const gridSize = grid.length
const cellSize = canvasSize / gridSize

//Find maximum mu value

function findMaxMu() {
  return Math.max(...grid.flat().map((node) => node.mue))
}

let muMax = 0

export function drawGrid() {
  muMax = findMaxMu()
  // Get the canvas element by its ID
  const gridSize = grid.length

  // Ensure the canvas and its 2d context exist
  if (!canvas) {
    console.error('Canvas element not found.')
    return
  }

  // Calculate the size of each grid cell
  const cellSize = canvasSize / gridSize

  // Set the canvas size
  canvas.width = canvasSize
  canvas.height = canvasSize

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw the grid
  ctx.strokeStyle = 'black' // Set grid line color to black

  // Vertical lines
  for (let x = 0; x <= canvasSize; x += cellSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasSize)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y <= canvasSize; y += cellSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasSize, y)
    ctx.stroke()
  }

  drawObstacles()
  if (showIdsCheckbox.checked) drawIds()

  let muVal: string = 'none'
  if ((<HTMLInputElement>document.getElementById('show-mu-number'))?.checked) {
    muVal = (<HTMLInputElement>document.getElementById('show-mu-number'))?.value
  } else if ((<HTMLInputElement>document.getElementById('show-mu-color'))?.checked) {
    muVal = (<HTMLInputElement>document.getElementById('show-mu-color'))?.value
  } else if ((<HTMLInputElement>document.getElementById('show-mu-both'))?.checked) {
    muVal = (<HTMLInputElement>document.getElementById('show-mu-both'))?.value
  }

  drawMuValues(muVal)
  if (showDisturbancesCheckbox.checked) drawAllDisturbances()
  if (showDirectedEdgesCheckbox.checked) drawDirectedEdges()
  // drawEdgeArrow(grid[0][0], grid[0][1])
  // drawEdgeArrow(grid[0][0], grid[1][0])
}

//Calculate the color for road cells
function gradientCellColor(color: string, col: number, row: number) {
  let mueValue = grid[col][row].mue
  if (mueValue > 0) {
    let hue = 0
    if (mueValue == 1) {
      // if muMax = 1 we want the cell color to be red(0). In all other cases MuMax should be green (120)
      hue = 0
    } else {
      const gradientStep = gradientMaxColor / (muMax - 1)
      hue = gradientStep * (mueValue - 1)
    }
    return 'hsl(' + hue + ',100%,80%)'
  } else {
    return color
  }
}

function drawSquareInGrid(col: number, row: number, type: NodeType) {
  // To disallow the path to "jump" diagonal water cells, we remove those edges.
  //If the water cell is overwritten by something else than water, we want to restore those edges
  if (type == 'water') {
    removeEdgesJumpingDiagonalWater(grid[col][row])
  } else if (grid[col][row].type == 'water') {
    recreateDiagonalEdges(grid[col][row])
  }

  const ctx = canvas.getContext('2d')!
  let hexColor = colorMap[drawTypeToColor[type]]

  // Sets the color for road cells if Mu value > 0
  if (type == 'road' && (showMuRadios.item(1).checked || showMuRadios.item(2).checked)) {
    hexColor = gradientCellColor(hexColor, col, row)
  }

  // Calculate the size of each grid cell
  const cellSize = canvas.width / grid.length

  // Calculate the coordinates of the top-left corner of the grid cell
  const x = col * cellSize
  const y = row * cellSize

  // Draw a black square in the specified grid cell
  ctx.fillStyle = hexColor // Set fill color to color
  ctx.fillRect(x + cellPadding / 2, y + cellPadding / 2, cellSize - cellPadding, cellSize - cellPadding)
  setTypeOfNode({ x: col, y: row }, type)

  // There can only be one start and goal. Delete the previous start/finish if exists and not in the same pos
  if (type == 'goal' && endNode && !(col == endNode.x && row == endNode.y)) {
    setTypeOfNode({ x: endNode.x, y: endNode.y }, 'road')
    drawSquareInGrid(endNode.x, endNode.y, 'road')
  } else if (type == 'start' && startNode && !(col == startNode.x && row == startNode.y)) {
    setTypeOfNode({ x: startNode.x, y: startNode.y }, 'road')
    drawSquareInGrid(startNode.x, startNode.y, 'road')
  }

  // If the draw type were of type start or goal save the new position of the node
  type == 'start' ? (startNode = { x: col, y: row }) : null
  type == 'goal' ? (endNode = { x: col, y: row }) : null

  // If a cell of type start or goal gets overridden by another type unset the start and the goal
  if (!['start', 'goal'].includes(type)) {
    col == startNode?.x && row == startNode.y ? (startNode = null) : null
    col == endNode?.x && row == endNode.y ? (endNode = null) : null
  }
}

const drawObstacles = () => {
  const gridLength = grid.length
  for (let x = 0; x < gridLength; x++) {
    for (let y = 0; y < gridLength; y++) {
      drawSquareInGrid(x, y, grid[x][y].type)
    }
  }
}

function drawIds() {
  const ctx = canvas.getContext('2d')!

  // Calculate the size of each grid cell
  const cellSize = canvas.width / grid.length

  const gridLength = grid.length
  for (let x = 0; x < gridLength; x++) {
    for (let y = 0; y < gridLength; y++) {
      ctx.font = '14px Arial' // Set the font and font size
      ctx.fillStyle = 'black' // Set the fill color
      ctx.fillText(grid[x][y].id.toString(), x * cellSize, y * cellSize + 10)
    }
  }
}

export let isDrawing = false

export const mouseDownHandler = (event: MouseEvent) => {
  // Calculate the size of each grid cell
  const cellSize = canvas.width / grid.length

  const col = Math.floor(event.offsetX / cellSize)
  const row = Math.floor(event.offsetY / cellSize)

  if (selectedType == 'disturbance' || selectedType == 'edge') {
    multiSelectedCells.push(grid[col][row])
    if (multiSelectedCells.length < 2) {
      return
    }

    if (!checkIfNeighbor(multiSelectedCells[0], multiSelectedCells[1])) {
      multiSelectedCells = []
      return
    }

    if (selectedType == 'disturbance') {
      deleteModeCheckbox.checked
        ? deleteDisturbance(multiSelectedCells[0], multiSelectedCells[1])
        : addDisturbance(multiSelectedCells[0], multiSelectedCells[1])
    } else {
      deleteModeCheckbox.checked
        ? deleteEdge(multiSelectedCells[0], multiSelectedCells[1])
        : addEdge(multiSelectedCells[0], multiSelectedCells[1])
    }
    computeMue(grid)
    drawGrid()
    multiSelectedCells = []
    return
  }

  isDrawing = true
  drawSquareInGrid(col, row, selectedType)
}

export const mouseMoveHandler = (event: MouseEvent) => {
  // Calculate the size of each grid cell
  const cellSize = canvas.width / grid.length

  if (isDrawing && ['wall', 'water', 'road'].includes(selectedType)) {
    const col = Math.floor(event.offsetX / cellSize)
    const row = Math.floor(event.offsetY / cellSize)
    drawSquareInGrid(col, row, <NodeType>selectedType)
  }
}

export const mouseUpHandler = () => {
  isDrawing = false
}

export function disableContinuousDrawing(canvas: HTMLCanvasElement) {
  canvas.removeEventListener('mousedown', mouseDownHandler)
  canvas.removeEventListener('mousemove', mouseMoveHandler)
  canvas.removeEventListener('mouseup', mouseUpHandler)
}

export function enableContinuousDrawing(canvas: HTMLCanvasElement) {
  canvas.addEventListener('mousedown', mouseDownHandler)

  canvas.addEventListener('mousemove', mouseMoveHandler)

  canvas.addEventListener('mouseup', mouseUpHandler)
}

function runPathFinding() {
  if (!startNode || !endNode) {
    return
  }

  //Redraw the grid to remove previous pathfinding path
  drawGrid()

  const nodes = grid.flat()
  const path = search(startNode, endNode, grid, riskFactor, showOpenAndClosedListsCheckbox.checked)
  const cellSize = canvas.width / grid.length

  //Keep the start and end node to preserve the colors
  const pathWithoutEnds = path.slice(1, -1)

  nodes.forEach((node) => {
    if (pathWithoutEnds.includes(node.id)) {
      // Calculate the size of each grid cell
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)' // Set the fill color
      ctx.fillRect(
        node.x * cellSize + cellPadding / 2,
        node.y * cellSize + cellPadding / 2,
        cellSize - cellPadding,
        cellSize - cellPadding,
      )
    }
  })
}

function resetGrid() {
  const newGrid = makeGrid()
  setGrid(newGrid)
  drawGrid()
}

function drawMuValues(muSelection: string) {
  computeMue(grid)
  if (['number', 'both'].includes(muSelection)) {
    ctx.font = '14px Arial'
    ctx.fillStyle = 'black'
    const cellSize = canvas.width / grid.length
    grid.forEach((col, colIndex) =>
      col.forEach((colEl, rowIndex) =>
        ctx.fillText(
          colEl.mue.toString(),
          colIndex * cellSize + cellSize / 2 - 10,
          rowIndex * cellSize + cellSize / 2 + 10,
        ),
      ),
    )
  }
}

function drawAllDisturbances() {
  grid.forEach((col) =>
    col.forEach((node) => {
      if (node.distEdges) {
        node.distEdges.forEach((distEdge) => {
          drawDisturbance(node, distEdge.adjacent)
        })
      }
    }),
  )
}

export function drawDisturbance(fromNode: Node, toNode: Node, color = 'red') {
  const fromCord = posToCanvasCoordinates(fromNode.x, fromNode.y)
  const toCord = posToCanvasCoordinates(toNode.x, toNode.y)
  drawArrow(fromCord.x, fromCord.y, toCord.x, toCord.y, color)
}

// function getDirectionBetweenNodes(fromNode: Node, toNode: Node) {
//   const
// }

function drawArrow(fromX: number, fromY: number, toX: number, toY: number, color: string) {
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.strokeStyle = color
  ctx.beginPath()
  var headlen = 3 // length of head in pixels
  var dx = toX - fromX
  var dy = toY - fromY
  var angle = Math.atan2(dy, dx)
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
  ctx.stroke()
}

function posToCanvasCoordinates(col: number, row: number) {
  const cellSize = canvas.width / grid.length
  const pos = {
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2,
  }
  return pos
}

//Function to get direction of neighboring cell
function getDirectionOfNode(fromNode: Node, toNode: Node) {
  const diffPos = { x: toNode.x - fromNode.x, y: toNode.y - fromNode.y }
  const direction = offsetMap[JSON.stringify(diffPos)]
  return direction
}

type Direction = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

type DiagonalDirection = Extract<Direction, 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right'>

const offsetMap: Record<string, Direction> = {
  '{"x":0,"y":-1}': 'top',
  '{"x":-1,"y":-1}': 'top-right',
  '{"x":-1,"y":0}': 'right',
  '{"x":-1,"y":1}': 'bottom-right',
  '{"x":0,"y":1}': 'bottom',
  '{"x":1,"y":1}': 'bottom-left',
  '{"x":1,"y":0}': 'left',
  '{"x":1,"y":-1}': 'top-left',
}

const directionToOffsetMap: Record<Direction, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  'top-left': { x: -1, y: -1 },
  'top-right': { x: 1, y: -1 },
  'bottom-left': { x: -1, y: 1 },
  'bottom-right': { x: 1, y: 1 },
}

//This function draws small triangles if a graph is only one directional or a thicker line if theres no edges connecting two nodes
function drawDirectedEdges() {
  const gridLength = grid.length
  for (let x = 0; x < gridLength; x++) {
    for (let y = 0; y < gridLength; y++) {
      const ownEdges = grid[x][y].edges

      // vertical edgeArrows
      if (y < gridLength - 1) {
        const belowEdges = grid[x][y + 1].edges
        const nodeHasEdgeToBelow = !!ownEdges.find((edge) => edge.adjacent.x == x && edge.adjacent.y == y + 1)
        const nodeBelowHasEdgeToNode = !!belowEdges.find(
          (edge) => edge.adjacent.x == x && edge.adjacent.y == grid[x][y].y,
        )

        nodeHasEdgeToBelow && !nodeBelowHasEdgeToNode ? drawEdgeArrow(grid[x][y], grid[x][y + 1]) : null
        !nodeHasEdgeToBelow && nodeBelowHasEdgeToNode ? drawEdgeArrow(grid[x][y + 1], grid[x][y]) : null
        !nodeHasEdgeToBelow && !nodeBelowHasEdgeToNode ? drawWallBetweenNodes(grid[x][y], 'bottom') : null
      }

      // horizontal edgeArrows
      if (x < gridLength - 1) {
        const rightEdges = grid[x + 1][y].edges
        const nodeHasEdgeToRight = !!ownEdges.find((edge) => edge.adjacent.x == x + 1 && edge.adjacent.y == y)
        const nodeRightHasEdgeToNode = !!rightEdges.find(
          (edge) => edge.adjacent.x == grid[x][y].x && edge.adjacent.y == y,
        )

        nodeHasEdgeToRight && !nodeRightHasEdgeToNode ? drawEdgeArrow(grid[x][y], grid[x + 1][y]) : null
        !nodeHasEdgeToRight && nodeRightHasEdgeToNode ? drawEdgeArrow(grid[x + 1][y], grid[x][y]) : null
        !nodeHasEdgeToRight && !nodeRightHasEdgeToNode ? drawWallBetweenNodes(grid[x][y], 'right') : null
      }

      // top-left diagonal edgeArrows
      if (x > 0 && y > 0) {
        const topLeftEdges = grid[x - 1][y - 1].edges
        const nodeHasEdgeToTopLeft = !!ownEdges.find((edge) => edge.adjacent.x === x - 1 && edge.adjacent.y === y - 1)
        const nodeTopLeftHasEdgeToNode = !!topLeftEdges.find((edge) => edge.adjacent.x === x && edge.adjacent.y === y)

        nodeHasEdgeToTopLeft && !nodeTopLeftHasEdgeToNode ? drawEdgeArrow(grid[x][y], grid[x - 1][y - 1]) : null
        !nodeHasEdgeToTopLeft && nodeTopLeftHasEdgeToNode ? drawEdgeArrow(grid[x - 1][y - 1], grid[x][y]) : null
        !nodeHasEdgeToTopLeft && !nodeTopLeftHasEdgeToNode ? drawWallBetweenNodes(grid[x][y], 'top-left') : null
      }

      // top-right diagonal edgeArrows
      if (x < gridLength - 1 && y > 0) {
        const topRightEdges = grid[x + 1][y - 1].edges
        const nodeHasEdgeToTopRight = !!ownEdges.find((edge) => edge.adjacent.x === x + 1 && edge.adjacent.y === y - 1)
        const nodeTopRightHasEdgeToNode = !!topRightEdges.find((edge) => edge.adjacent.x === x && edge.adjacent.y === y)

        nodeHasEdgeToTopRight && !nodeTopRightHasEdgeToNode ? drawEdgeArrow(grid[x][y], grid[x + 1][y - 1]) : null
        !nodeHasEdgeToTopRight && nodeTopRightHasEdgeToNode ? drawEdgeArrow(grid[x + 1][y - 1], grid[x][y]) : null
        !nodeHasEdgeToTopRight && !nodeTopRightHasEdgeToNode ? drawWallBetweenNodes(grid[x][y], 'top-right') : null
      }
    }
  }
}

function drawEdgeArrow(fromNode: Node, toNode: Node) {
  const direction = getDirectionOfNode(fromNode, toNode)
  const fromNodePos = posToCanvasCoordinates(fromNode.x, fromNode.y)
  const [topPoint, leftPoint, rightPoint] = getEdgeArrowPointsByDirection(direction)

  const path = new Path2D()
  ctx.fillStyle = 'black'

  path.moveTo(topPoint.x + fromNodePos.x, topPoint.y + fromNodePos.y)
  path.lineTo(leftPoint.x + fromNodePos.x, leftPoint.y + fromNodePos.y)
  path.lineTo(rightPoint.x + fromNodePos.x, rightPoint.y + fromNodePos.y)

  ctx.fill(path)
}

function getEdgeArrowPointsByDirection(direction: Direction) {
  const edgeArrowHeight = 20
  const distanceScale = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(direction) ? 1.4 : 1

  const arrowDownPoints = [
    { x: 0, y: (cellSize / 2) * distanceScale + edgeArrowHeight / 2 },
    {
      x: -edgeArrowHeight / 2,
      y: (cellSize / 2) * distanceScale - edgeArrowHeight / 2,
    },
    {
      x: +edgeArrowHeight / 2,
      y: (cellSize / 2) * distanceScale - edgeArrowHeight / 2,
    },
  ]
  let angle = directionToAngleMap[direction]

  if (angle > 180) {
    angle -= 360
  }

  const A = (angle * Math.PI) / 180
  const rotate = (x: number, y: number) => {
    return {
      x: x * Math.cos(A) - y * Math.sin(A),
      y: y * Math.cos(A) + x * Math.sin(A),
    }
  }
  const offsetPositions = [
    rotate(arrowDownPoints[0].x, arrowDownPoints[0].y),
    rotate(arrowDownPoints[1].x, arrowDownPoints[1].y),
    rotate(arrowDownPoints[2].x, arrowDownPoints[2].y),
  ]
  return offsetPositions
}

const directionToAngleMap: Record<Direction, number> = {
  bottom: 0,
  top: 180,
  right: 90,
  left: 270,
  'top-left': 225,
  'top-right': 135,
  'bottom-left': 315,
  'bottom-right': 45,
}

function drawWallBetweenNodes(fromNode: Node, direction: Direction) {
  const nodePos = posToCanvasCoordinates(fromNode.x, fromNode.y)
  //orthogonal lengths
  const oLength = cellSize * 0.08 // 4 if cellSize is 50.

  //diagonal lengths
  const dShortLength = cellSize * 0.04 // 2 if cellSize is 50
  const dLongLength = cellSize * 0.3 // 15 if cellSize is 50

  ctx.fillStyle = 'black'
  if (direction == 'bottom') {
    ctx.fillRect(nodePos.x - cellSize / 4, nodePos.y + cellSize / 2 - oLength / 2, cellSize / 2, oLength)
  }
  if (direction == 'right') {
    ctx.fillRect(nodePos.x + cellSize / 2 - oLength / 2, nodePos.y - cellSize / 4, oLength, cellSize / 2)
  }

  const neighborNode = ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(direction)
    ? GetNeighboringNode(fromNode, direction)
    : null

  if (neighborNode) {
    const neighborNodePos = posToCanvasCoordinates(neighborNode.x, neighborNode.y)

    if (direction === 'top-left') {
      ctx.fillRect(nodePos.x - cellSize / 2, nodePos.y - cellSize / 2, dShortLength, dLongLength)
      ctx.fillRect(nodePos.x - cellSize / 2, nodePos.y - cellSize / 2, dLongLength, dShortLength)
      ctx.fillRect(
        neighborNodePos.x + cellSize / 2 - dShortLength,
        neighborNodePos.y + cellSize / 2 - dLongLength,
        dShortLength,
        dLongLength,
      )
      ctx.fillRect(
        neighborNodePos.x + cellSize / 2 - dLongLength,
        neighborNodePos.y + cellSize / 2 - dShortLength,
        dLongLength,
        dShortLength,
      )
    }

    if (direction === 'top-right') {
      ctx.fillRect(nodePos.x + cellSize / 2 - dShortLength, nodePos.y - cellSize / 2, dShortLength, dLongLength)
      ctx.fillRect(nodePos.x + cellSize / 2 - dLongLength, nodePos.y - cellSize / 2, dLongLength, dShortLength)
      ctx.fillRect(
        neighborNodePos.x - cellSize / 2,
        neighborNodePos.y + cellSize / 2 - dLongLength,
        dShortLength,
        dLongLength,
      )
      ctx.fillRect(
        neighborNodePos.x - cellSize / 2,
        neighborNodePos.y + cellSize / 2 - dShortLength,
        dLongLength,
        dShortLength,
      )
    }
  }
}

function checkIfNeighbor(fromNode: Node, toNode: Node) {
  //If its the same node also return false
  if (fromNode.x == toNode.x && fromNode.y == toNode.y) {
    return false
  }

  const distX = fromNode.x - toNode.x
  const distY = fromNode.y - toNode.y
  if (Math.abs(distX) > 1 || Math.abs(distY) > 1) {
    return false
  }
  return true
}

function GetNeighboringNode(node: Node, direction: Direction) {
  const { x, y } = node
  const offset = directionToOffsetMap[direction]
  const neighbor = grid[x + offset.x]?.[y + offset.y] ?? null
  return neighbor
}

function getDiagonalNodesOfTypeWater(node: Node) {
  const nodes = [
    GetNeighboringNode(node, 'top-right'),
    GetNeighboringNode(node, 'bottom-right'),
    GetNeighboringNode(node, 'bottom-left'),
    GetNeighboringNode(node, 'top-left'),
  ]

  const diagonalNodes = nodes.filter((diagonalNode) => diagonalNode?.type == 'water')

  return diagonalNodes
}

function removeEdgesJumpingDiagonalWater(newWaterNode: Node) {
  const diagonalWaterNodes = getDiagonalNodesOfTypeWater(newWaterNode)

  diagonalWaterNodes.forEach((diagonalNode) => {
    const [node1, node2] = getDividingDiagonalNodes(newWaterNode, diagonalNode)!
    deleteEdge(node1, node2)
    deleteEdge(node2, node1)
  })
}

function recreateDiagonalEdges(previousWaterNode: Node) {
  const diagonalWaterNodes = getDiagonalNodesOfTypeWater(previousWaterNode)

  diagonalWaterNodes.forEach((diagonalNode) => {
    const [node1, node2] = getDividingDiagonalNodes(previousWaterNode, diagonalNode)!
    addEdge(node1, node2)
    addEdge(node2, node1)
  })
}

//The function if provided by the nodes a1 and b2. will return the two nodes marked with X
// b2 | X |
// --+--+--
//  X |a1|
// --+--+--
//      |  |
function getDividingDiagonalNodes(fromNode: Node, toNode: Node) {
  if (!checkIfNeighbor(fromNode, toNode)) {
    return []
  }
  const direction = getDirectionOfNode(fromNode, toNode)

  switch (direction) {
    case 'bottom-right':
      return [GetNeighboringNode(fromNode, 'bottom'), GetNeighboringNode(fromNode, 'left')]
    case 'bottom-left':
      return [GetNeighboringNode(fromNode, 'bottom'), GetNeighboringNode(fromNode, 'right')]
    case 'top-right':
      return [GetNeighboringNode(fromNode, 'top'), GetNeighboringNode(fromNode, 'left')]
    case 'top-left':
      return [GetNeighboringNode(fromNode, 'top'), GetNeighboringNode(fromNode, 'right')]
  }
}
