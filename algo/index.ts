import { grid, makeGrid } from "./grid.js";
import { computeMue } from "./mue.js";
import { gridSize } from "./grid.js"

export default function algoInit() {
  makeGrid(gridSize);
  computeMue(grid);
}
