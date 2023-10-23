import search from "../algo/AStarSearch.js";
import { addDisturbance, addEdge, deleteDisturbance, deleteEdge, grid, setGrid, setTypeOfNode } from "../algo/grid.js";
import { Node, NodeType } from "../algo/models/Node.js";
import { computeMue } from "../algo/mue.js";
import { initSaveControl } from "./save.js";
import { ControlsData, getActiveGridFromLocalStorage, getControlsFromLocalStorage, saveActiveGridToLocalStorage, saveControlsToLocalStorage } from "./saveService.js";

export default function clientInit() {
  const savedGrid = getActiveGridFromLocalStorage();
  if (savedGrid) {setGrid(savedGrid)}
  // grid[0][0].edges = [];
  // grid[0][1].edges = [];
  // grid[1][0].edges = [];
  // grid[2][1].edges = [];
  setControls();
  drawGrid();
  enableContinuousDrawing(canvas, grid.length);
  initSaveControl();
  // drawDisturbance(grid[0][5], grid[0][6])
}

const cellPadding = 2;
// const wallBtn = document.getElementById("wall" satisfies drawType)!;
const startBtn = document.getElementById("start" satisfies drawType)!;
const goalBtn = document.getElementById("goal" satisfies drawType)!;
const waterBtn = document.getElementById("water" satisfies drawType)!;
const roadBtn = document.getElementById("road" satisfies drawType)!;
const edgeBtn = document.getElementById("edge" satisfies drawType)!;
const disturbanceBtn = document.getElementById("disturbance" satisfies drawType)!;

let selectedType: drawType = "water";
let multiSelectedCells: Node[] = [];

const runAlgoBtn = document.getElementById("run-algo")!;

const showMuCheckbox = <HTMLInputElement>document.getElementById("show-mu")!;
const showIdsCheckbox = <HTMLInputElement>document.getElementById("show-node-id")!;
const showDisturbancesCheckbox = <HTMLInputElement>document.getElementById("show-disturbances")!;
const showDirectedEdgesCheckbox = <HTMLInputElement>document.getElementById("show-directed-edges")!;
const deleteModeCheckbox = <HTMLInputElement>document.getElementById("delete-mode")!;


startBtn.addEventListener("mouseup", () => selectDrawType("start" satisfies drawType));
goalBtn.addEventListener("mouseup", () => selectDrawType("goal" satisfies drawType));
waterBtn.addEventListener("mouseup", () => selectDrawType("water" satisfies drawType));
roadBtn.addEventListener("mouseup", () => selectDrawType("road" satisfies drawType));
edgeBtn.addEventListener("mouseup", () => selectDrawType("edge" satisfies drawType));
disturbanceBtn.addEventListener("mouseup", () => selectDrawType("disturbance" satisfies drawType));


runAlgoBtn.addEventListener("mouseup", runPathFinding);

showMuCheckbox.addEventListener("change", drawGrid);
showIdsCheckbox.addEventListener("change", drawGrid);
showDisturbancesCheckbox.addEventListener("change", drawGrid);
showDirectedEdgesCheckbox.addEventListener("change", drawGrid);

window.addEventListener("unload", () => {
  saveControls();
  if (grid[0][0]) {
    saveActiveGridToLocalStorage(grid);
  }
});

function setControls() {
  const controls = getControlsFromLocalStorage();
  if (!controls) {return}
  showMuCheckbox.checked = controls.options.mu;
  showIdsCheckbox.checked = controls.options.nodeId;
  showDisturbancesCheckbox.checked = controls.options.disturbances;
  showDirectedEdgesCheckbox.checked = controls.options.directedEdges;
  selectDrawType(controls.drawType);
  // selectedType = controls.drawType
}

function saveControls() {
  const controlsData: ControlsData = {
    "drawType": selectedType,
    "options": {
        "directedEdges": showDirectedEdgesCheckbox.checked,
        "disturbances": showDisturbancesCheckbox.checked,
        "mu": showMuCheckbox.checked,
        "nodeId": showIdsCheckbox.checked
    }
}
  saveControlsToLocalStorage(controlsData);
}
export type drawType = "start" | "goal" | "water" | "road" | "disturbance" | "edge";
type color = "blue" | "black" | "green" | "red" | "white";
export let startNode: Pick<Node, "x" | "y"> | null = null;
export let  endNode: Pick<Node, "x" | "y"> | null = null;

const colorMap: Record<color, string> = {
  "black":"#000",
  "blue": "#3260a8",
  "green":"#4dff00",
  "red":"#ff0000",
  "white": "#ffffff"
}

const drawTypeToColor: Record<NodeType, color> = {
  "road": "white",
  "start": "green",
  "goal": "red",
  "water": "blue"
  }

function selectDrawType(id: drawType) {
  console.log("Ran")
  if (selectedType == id) {return}
	[startBtn, goalBtn, waterBtn, roadBtn, edgeBtn, disturbanceBtn].forEach((elm) => elm.classList.remove("selected"));
	selectedType = id;
  if (["edge", "disturbance"].includes(id)) {multiSelectedCells = [];}
	document.getElementById(id)!.classList.add("selected");
}


const canvasSize = 500;

// const gridNumber = 10;
const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
const ctx = canvas.getContext("2d")!;
const gridSize = grid.length;
const cellSize = canvasSize / gridSize;


export function drawGrid() {
  // Get the canvas element by its ID
  const gridSize = grid.length;

  // Ensure the canvas and its 2d context exist
  if (!canvas) {
    console.error("Canvas element not found.");
    return;
  }

  // Calculate the size of each grid cell
  const cellSize = canvasSize / gridSize;

  // Set the canvas size
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the grid
  ctx.strokeStyle = "black"; // Set grid line color to black

  // Vertical lines
  for (let x = 0; x <= canvasSize; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasSize);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= canvasSize; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasSize, y);
    ctx.stroke();
  }

  drawObstacles()
  showIdsCheckbox.checked ? drawIds() : null;
  showMuCheckbox.checked ? drawMuValues() : null;
  showDisturbancesCheckbox.checked ? drawAllDisturbances() : null;
  showDirectedEdgesCheckbox.checked ? drawDirectedEdges() : null;
  // drawEdgeArrow(grid[0][0], grid[0][1])
  // drawEdgeArrow(grid[0][0], grid[1][0])
};

function drawSquareInGrid(
  col: number,
  row: number,
  type: NodeType,
) {
  const ctx = canvas.getContext("2d")!;
  const hexColor = colorMap[drawTypeToColor[type]];

  // Calculate the size of each grid cell
  const cellSize = canvas.width / grid.length;

  // Calculate the coordinates of the top-left corner of the grid cell
  const x = col * cellSize;
  const y = row * cellSize;

  // Draw a black square in the specified grid cell
  ctx.fillStyle = hexColor; // Set fill color to color
  ctx.fillRect(x + cellPadding/2, y + cellPadding/2, cellSize - cellPadding, cellSize - cellPadding);
  setTypeOfNode({x: col, y: row}, type)

  //There can only be one start and goal. Delete the previous start/finish if exists and not in the same pos
  if(type == "goal" && endNode && !(col == endNode.x && row == endNode.y)) {
    setTypeOfNode({x: endNode.x, y: endNode.y}, "road")
    drawSquareInGrid(endNode.x, endNode.y, "road")
  } else if(type == "start" && startNode && !(col == startNode.x && row == startNode.y)) {
    setTypeOfNode({x: startNode.x, y: startNode.y}, "road")
    drawSquareInGrid(startNode.x, startNode.y, "road")
  }

  //If the draw type were of type start or goal save the new position of the node
  type == "start" ? startNode = {x: col, y: row} : null;
  type == "goal" ? endNode = {x: col, y: row} : null;

  //If a cell of type start or goal gets overridden by another type unset the start and the goal
  if (!["start", "goal"].includes(type)) {
    (col == startNode?.x && row == startNode.y) ? startNode = null : null;
    (col == endNode?.x && row == endNode.y) ? endNode = null : null;
  }
}

const drawObstacles = () => {
  const gridLength = grid.length;
  for (let x = 0; x < gridLength; x++) {
    for (let y = 0; y < gridLength; y++) {
        drawSquareInGrid(x, y, grid[x][y].type);
    }
  }
};

function drawIds() {
  const ctx = canvas.getContext("2d")!;

  // Calculate the size of each grid cell
  const cellSize = canvas.width / grid.length;

  const gridLength = grid.length;
  for (let x = 0; x < gridLength; x++) {
    for (let y = 0; y < gridLength; y++) {
      ctx.font = "14px Arial"; // Set the font and font size
      ctx.fillStyle = "black"; // Set the fill color
      ctx.fillText(grid[x][y].id.toString(), x * cellSize, y * cellSize + 10);
    }
  }
};

function enableContinuousDrawing(canvas: HTMLCanvasElement, gridNumber: number) {
	let isDrawing = false;

	// Calculate the size of each grid cell
	const cellSize = canvas.width / gridNumber;

	canvas.addEventListener("mousedown", (event) => {
    const col = Math.floor(event.offsetX / cellSize);
    const row = Math.floor(event.offsetY / cellSize);
    
    if (selectedType == "disturbance" || selectedType == "edge") {
      multiSelectedCells.push(grid[col][row]);
      if (multiSelectedCells.length < 2) { return }

      if (!checkIfNeighbor(multiSelectedCells[0], multiSelectedCells[1])) {multiSelectedCells = []; return}

      if (selectedType == "disturbance") {
        deleteModeCheckbox.checked ? deleteDisturbance(multiSelectedCells[0], multiSelectedCells[1]) : addDisturbance(multiSelectedCells[0], multiSelectedCells[1])
      } else {
        deleteModeCheckbox.checked ? deleteEdge(multiSelectedCells[0], multiSelectedCells[1]) : addEdge(multiSelectedCells[0], multiSelectedCells[1])
      }

      drawGrid();
      multiSelectedCells = [];
      return;
    }

		isDrawing = true;
		drawSquareInGrid(col, row, selectedType);
	});

	canvas.addEventListener("mousemove", (event) => {
		if (isDrawing && ["wall", "water", "road"].includes(selectedType)) {
			const col = Math.floor(event.offsetX / cellSize);
			const row = Math.floor(event.offsetY / cellSize);
			drawSquareInGrid(col, row, <NodeType>selectedType);
		}
	});

	canvas.addEventListener("mouseup", () => {
		isDrawing = false;
	});
}

function runPathFinding() {
  if (!startNode || !endNode) {return}

  //Redraw the grid to remove previous pathfinding path
  drawGrid()

  const nodes = grid.flat();
  const path = search(startNode, endNode, grid);
  const cellSize = canvas.width / grid.length;

  //Keep the start and end node to preserve the colors
  const pathWithoutEnds = path.slice(1, -1)

  nodes.forEach((node) => {
    if (pathWithoutEnds.includes(node.id)) {
      // Calculate the size of each grid cell
      ctx.fillStyle = "yellow"; // Set the fill color
      ctx.fillRect(node.x * cellSize + cellPadding/2 , node.y * cellSize + cellPadding/2, cellSize - cellPadding, cellSize - cellPadding);
    }
  });
}

function drawMuValues() {
  computeMue(grid)
  ctx.font = "14px Arial";
  ctx.fillStyle = "black"
  const cellSize = canvas.width / grid.length;
  grid.forEach((col, colIndex) => col.forEach((colEl, rowIndex) => ctx.fillText(colEl.mue.toString() , colIndex * cellSize + cellSize/2 - 10, rowIndex * cellSize + cellSize/2 + 10)));
}

function drawAllDisturbances() {
  grid.forEach(col => col.forEach(node => {
    if (node.distEdges) {
      node.distEdges.forEach(distEdge => {
        drawDisturbance(node, distEdge.adjacent);
      })
    }
  }))
}

function drawDisturbance(fromNode: Node, toNode: Node) {
  const fromCord = posToCanvasCoordinates(fromNode.x, fromNode.y);
  const toCord = posToCanvasCoordinates(toNode.x, toNode.y);
  drawArrow(fromCord.x, fromCord.y, toCord.x, toCord.y);
}

// function getDirectionBetweenNodes(fromNode: Node, toNode: Node) {
//   const 
// }

function drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = "red";
  ctx.beginPath();
  var headlen = 10; // length of head in pixels
  var dx = toX - fromX;
  var dy = toY - fromY;
  var angle = Math.atan2(dy, dx);
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function posToCanvasCoordinates(col: number, row: number) {
  const cellSize = canvas.width / grid.length;
  const pos = {x: col * cellSize + cellSize/2, y: row * cellSize + cellSize/2}
  return pos
}

//Function to get direction of neighboring cell
function getDirectionOfNode(fromNode: Node, toNode: Node) {
  const diffPos = {x: (toNode.x - fromNode.x), y: (toNode.y - fromNode.y)};
  const direction = offsetMap[JSON.stringify(diffPos)]
  return direction;
}
type direction = "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
const offsetMap: Record<string, direction> = {
	'{"x":0,"y":-1}' : "top",
  '{"x":1,"y":-1}' : "top-right",
  '{"x":-1,"y":0}' : "right",
	'{"x":1,"y":1}' : "bottom-right",
  '{"x":0,"y":1}' : "bottom",
  '{"x":-1,"y":1}' : "bottom-left",
  '{"x":1,"y":0}' : "left",
  '{"x":-1,"y":-1}' : "top-left",
};

//This function draws small triangles if a graph is only one directional or a thicker line if theres no edges connecting two nodes
function drawDirectedEdges() {
  const gridLength = grid.length;
  for (let x = 0; x < gridLength; x++) {
    for (let y = 0; y < gridLength; y++) {
      const ownEdges = grid[x][y].edges;
      
      if (y < gridLength - 1) {
        const belowEdges = grid[x][y + 1].edges;
        const nodeHasEdgeToBelow = !!ownEdges.find(edge => edge.adjacent.x == x && edge.adjacent.y == y + 1);
        const nodeBelowHasEdgeToNode = !!belowEdges.find(edge => edge.adjacent.x == x && edge.adjacent.y == grid[x][y].y);
        
        (nodeHasEdgeToBelow && !nodeBelowHasEdgeToNode) ? drawEdgeArrow(grid[x][y], grid[x][y + 1]) : null;
        (!nodeHasEdgeToBelow && nodeBelowHasEdgeToNode) ? drawEdgeArrow(grid[x][y + 1], grid[x][y]) : null;
        (!nodeHasEdgeToBelow && !nodeBelowHasEdgeToNode) ? drawWallBetweenNodes(grid[x][y], "bottom") : null
      }
      if (x < gridLength - 1) {
        const rightEdges = grid[x + 1][y].edges;
        const nodeHasEdgeToRight = !!ownEdges.find(edge => edge.adjacent.x == x + 1 && edge.adjacent.y == y);
        const nodeRightHasEdgeToNode = !!rightEdges.find(edge => edge.adjacent.x == grid[x][y].x && edge.adjacent.y == y);
        (nodeHasEdgeToRight && !nodeRightHasEdgeToNode) ? drawEdgeArrow(grid[x][y], grid[x + 1][y]) : null;
        (!nodeHasEdgeToRight && nodeRightHasEdgeToNode) ? drawEdgeArrow(grid[x + 1][y], grid[x][y]) : null;
        (!nodeHasEdgeToRight && !nodeRightHasEdgeToNode) ? drawWallBetweenNodes(grid[x][y], "right") : null
    }
  }
}
}
//grid[1][1] to grid[0][1]
function drawEdgeArrow(fromNode: Node, toNode: Node) {
  const direction = getDirectionOfNode(fromNode, toNode);
  const fromNodePos = posToCanvasCoordinates(fromNode.x, fromNode.y);
  const [topPoint, leftPoint, rightPoint] = getEdgeArrowPointsByDirection(direction);
  
  const path = new Path2D();
  ctx.fillStyle = "black";
  path.moveTo(topPoint.x + fromNodePos.x, topPoint.y + fromNodePos.y);
  path.lineTo(leftPoint.x + fromNodePos.x, leftPoint.y + fromNodePos.y);
  path.lineTo(rightPoint.x + fromNodePos.x, rightPoint.y + fromNodePos.y);
  ctx.fill(path);
}

function getEdgeArrowPointsByDirection(direction: direction) {
  const edgeArrowHeight = 20;
  const arrowDownPoints = [{x: 0, y: cellSize/2 + edgeArrowHeight/2},{x: -edgeArrowHeight/2, y: cellSize/2-edgeArrowHeight/2},{x: +edgeArrowHeight/2, y: cellSize/2-edgeArrowHeight/2}]
  let angle = directionToAngleMap[direction];
  
  if (angle > 180) {
    angle -= 360;
  }

  const A = angle * Math.PI / 180;
  const rotate = (x: number, y: number) => {return  {x: (x * Math.cos(A) - y * Math.sin(A)), y: (y * Math.cos(A) + x * Math.sin(A))}};
  const offsetPositions = [rotate(arrowDownPoints[0].x, arrowDownPoints[0].y), rotate(arrowDownPoints[1].x,arrowDownPoints[1].y), rotate(arrowDownPoints[2].x,arrowDownPoints[2].y)]
  return offsetPositions;
}

const directionToAngleMap: Record<direction, number> = {
  bottom: 0,
  top: 180,
	right: 90,
	left: 270,
	"top-left": 225,
	"top-right": 135,
	"bottom-left": 315,
	"bottom-right": 45,
}

function drawWallBetweenNodes(fromNode: Node, direction: direction) {
  const nodePos = posToCanvasCoordinates(fromNode.x, fromNode.y)
  const recWidth = 5;
  ctx.fillStyle = "black";
  if (direction == "bottom") { ctx.fillRect((nodePos.x - cellSize/2), (nodePos.y + cellSize/2 - recWidth/2), cellSize, recWidth )}
  if (direction == "right") {ctx.fillRect((nodePos.x + cellSize/2 - recWidth/2), (nodePos.y - cellSize/2), recWidth, cellSize )}
  if (direction == "top") {ctx.fillRect((nodePos.x - cellSize/2), (nodePos.y - cellSize/2 + recWidth/2), cellSize, recWidth )}
  if (direction == "left") {ctx.fillRect((nodePos.x - cellSize/2 + recWidth/2), (nodePos.y - cellSize/2), recWidth, cellSize )}
}

function checkIfNeighbor(fromNode: Node, toNode: Node) {
  //If its the same node also return false
  if (fromNode.x == toNode.x && fromNode.y == toNode.y) {return false;}

  const distX = fromNode.x - toNode.x;
  const distY = fromNode.y - toNode.y;
  if (Math.abs(distX) > 1 || Math.abs(distY) > 1) {return false}
  return true;
}
