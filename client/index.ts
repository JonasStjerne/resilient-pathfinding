export default function clientInit() {
    drawGrid(canvasSize, gridNumber);
}

const canvasSize = 500;
const gridNumber = 10;
const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
const drawGrid = (canvasLength: number, gridSize: number) => {
	// Get the canvas element by its ID

	// Ensure the canvas and its 2d context exist
	if (!canvas) {
		console.error("Canvas element not found.");
		return;
	}

	const ctx = canvas.getContext("2d")!;

	// Calculate the size of each grid cell
	const cellSize = canvasLength / gridSize;

	// Set the canvas size
	canvas.width = canvasLength;
	canvas.height = canvasLength;

	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the grid
	ctx.strokeStyle = "#000"; // Set grid line color to black

	// Vertical lines
	for (let x = 0; x <= canvasLength; x += cellSize) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvasLength);
		ctx.stroke();
	}

	// Horizontal lines
	for (let y = 0; y <= canvasLength; y += cellSize) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(canvasLength, y);
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
