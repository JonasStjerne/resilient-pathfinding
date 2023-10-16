import search from "../algo/AStarSearch.js";
import { grid, setTypeOfNode } from "../algo/grid.js";
import { Grid } from "../algo/models/Grid.js";
import { Node, NodeType } from "../algo/models/Node.js";

export default function clientInit() {
  drawGrid(canvasSize, grid);
}

// const wallBtn = document.getElementById("wall" satisfies drawType)!;
const startBtn = document.getElementById("start" satisfies drawType)!;
const goalBtn = document.getElementById("goal" satisfies drawType)!;
const waterBtn = document.getElementById("water" satisfies drawType)!;
const runAlgoBtn = document.getElementById("run-algo")!;
// wallBtn.addEventListener("click", () => selectDrawType("wall" satisfies drawType));
startBtn.addEventListener("click", () => selectDrawType("start" satisfies drawType));
goalBtn.addEventListener("click", () => selectDrawType("goal" satisfies drawType));
waterBtn.addEventListener("click", () => selectDrawType("water" satisfies drawType));
runAlgoBtn.addEventListener("click", () => runPathFinding());

type drawType = "start" | "goal" | "water";
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

  const cellPadding = 2;

let selectedType: drawType = "water";
function selectDrawType(id: drawType) {
	[startBtn, goalBtn, waterBtn].forEach((elm) => elm.classList.remove("selected"));
	selectedType = id;
	document.getElementById(id)!.classList.add("selected");
}


const canvasSize = 500;

// const gridNumber = 10;
const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
const ctx = canvas.getContext("2d")!;


export const drawGrid = (canvasSize: number, grid: Grid) => {
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
  // drawObstacles();
  enableContinuousDrawing(canvas, gridSize);
  drawIds();
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

  //There can only be one start and goal. Delete the previous start/finish if exists
  if(type == "goal" && endNode) {
    setTypeOfNode({x: endNode.x, y: endNode.y}, "road")
    drawSquareInGrid(endNode.x, endNode.y, "road")
  } else if(type == "start" && startNode) {
    setTypeOfNode({x: startNode.x, y: startNode.y}, "road")
    drawSquareInGrid(startNode.x, startNode.y, "road")
  }

  type == "start" ? startNode = {x: col, y: row} : null
  type == "goal" ? endNode = {x: col, y: row} : null
}
const drawObstacles = () => {
  const gridLength = grid.length;
  for (let x = 0; x < gridLength; x++) {
    for (let y = 0; y < gridLength; y++) {
        drawSquareInGrid(x, y, grid[x][y].type);
    }
  }
};

export const drawIds = () => {
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
		isDrawing = true;
		const col = Math.floor(event.offsetX / cellSize);
		const row = Math.floor(event.offsetY / cellSize);
    console.log({col, row}, selectedType)
		drawSquareInGrid(col, row, selectedType);
	});

	canvas.addEventListener("mousemove", (event) => {
		if (isDrawing && ["wall", "water"].includes(selectedType)) {
			const col = Math.floor(event.offsetX / cellSize);
			const row = Math.floor(event.offsetY / cellSize);
			drawSquareInGrid(col, row, selectedType);
		}
	});

	canvas.addEventListener("mouseup", () => {
		isDrawing = false;
	});
}

function runPathFinding() {
  console.log("Ran")
  if (!startNode || !endNode) {return}
  console.log("Ran2")

  const nodes = grid.flat();
  const path = search(startNode, endNode, grid);
  const cellSize = canvas.width / grid.length;

  nodes.forEach((node) => {
    if (path.includes(node.id)) {
      // Calculate the size of each grid cell
      console.log("cell size ", cellSize);
      const gridLength = grid.length;
      ctx.fillStyle = "yellow"; // Set the fill color
      ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
    }
  });
}


	// Function to draw a square in the cell at the given row and column
