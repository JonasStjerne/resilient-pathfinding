import { generateOneGraph } from "./graphGen.js";
import { grid, makeGrid } from "./grid.js";
import { computeMue } from "./mue.js";

export default function algoInit() {
  makeGrid();
  computeMue(grid);
//   test_funktion();

  generateOneGraph(); // For testing purposes, this generates and draws a new graph on each page load
}
