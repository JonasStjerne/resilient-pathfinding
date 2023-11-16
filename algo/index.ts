import { grid, makeGrid } from "./grid.js";
import { computeMue } from "./mue.js";

export default function algoInit() {
  const gridSize = 10
  makeGrid(gridSize);
  computeMue(grid);
//   test_funktion();
}
