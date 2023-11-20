import algoInit from './algo/index.js'
import clientInit from './client/index.js'

const initImports = [algoInit, clientInit]

initImports.forEach((init) => init())

// const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
// const ctx = canvas.getContext("2d")!;

// const startNode = { x: 8, y: 8 };
// const endNode = { x: 0, y: 3 };

// const path = search(startNode, endNode, grid);

// const nodes = grid.flat();
// const cellSize = canvas.width / grid.length;

// nodes.forEach((node) => {
//   if (path.includes(node.id)) {
//     // Calculate the size of each grid cell
//     console.log("cell size ", cellSize);
//     const gridLength = grid.length;
//     ctx.fillStyle = "yellow"; // Set the fill color
//     ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
//   }
// });

// drawIds(grid);
// ctx.font = "14px Arial"; // Set the font and font size
// ctx.fillStyle = "blue"; // Set the fill color
// ctx.fillText(
//   "Start",
//   startNode.x * cellSize + cellSize / 5,
//   startNode.y * cellSize + cellSize / 1.7
// );
// ctx.fillStyle = "red"; // Set the fill color
// ctx.fillText(
//   "End",
//   endNode.x * cellSize + cellSize / 5,
//   endNode.y * cellSize + cellSize / 1.7
// );
