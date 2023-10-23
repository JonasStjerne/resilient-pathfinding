import { grid, makeGrid } from "./grid.js";
import { computeMue } from "./mue.js";

export default function algoInit() {
  makeGrid();
  // grid[9][3].type = "water";
  // grid[9][3].incomingDistEdges = [grid[9][4]];

  // grid[9][4].distEdges = [new Edge(grid[9][3], 1)];
  // grid[9][4].incomingDistEdges = [grid[9][5]];

  // grid[9][5].distEdges = [new Edge(grid[9][4], 1)];
  computeMue(grid);
//   test_funktion();
}