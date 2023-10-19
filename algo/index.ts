import { grid, makeGrid } from "./grid.js";
import { Edge } from "./models/Edge.js";
import { computeMue } from "./mue.js";

export default function algoInit() {
  makeGrid();
  grid[0][5].distEdges.push(new Edge(grid[0][6], 1));
  grid[0][6].incomingDistEdges.push(grid[0][5]);
  computeMue(grid);
//   test_funktion();
}