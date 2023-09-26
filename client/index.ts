import { gridType } from "../algo/index";

export default function clientInit(grid: gridType) {
    drawGrid(canvasSize, grid);
}

const canvasSize = 500;
const gridNumber = 10;
const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;

export const drawGrid = (canvasSize: number, grid: gridType) => {
	// Get the canvas element by its ID
	const gridSize = grid.length;

	// Ensure the canvas and its 2d context exist
	if (!canvas) {
		console.error("Canvas element not found.");
		return;
	}

	const ctx = canvas.getContext("2d")!;

	// Calculate the size of each grid cell
	const cellSize = canvasSize / gridSize;

	// Set the canvas size
	canvas.width = canvasSize;
	canvas.height = canvasSize;

	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the grid
	ctx.strokeStyle = "#000"; // Set grid line color to black

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
};

function drawSquareInGrid(col: number, row: number, color: string) {
	const ctx = canvas.getContext("2d")!;

	// Calculate the size of each grid cell
	const cellSize = canvas.width / gridNumber;

	// Calculate the coordinates of the top-left corner of the grid cell
	const x = col * cellSize;
	const y = row * cellSize;

	// Draw a black square in the specified grid cell
	ctx.fillStyle = color; // Set fill color to color
	ctx.fillRect(x, y, cellSize, cellSize);
}
