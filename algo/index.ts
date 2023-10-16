import { makeGrid } from "./grid.js";
import { Grid } from "./models/Grid.js";

export default function algoInit() {
  makeGrid();
}

// Create Grid
const gridSize = 10;
export const grid: Grid = new Array(gridSize);
