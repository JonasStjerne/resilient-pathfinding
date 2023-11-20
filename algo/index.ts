import { grid, makeGrid } from './grid.js'
import { computeMue } from './mue.js'

export default function algoInit() {
  makeGrid()
  computeMue(grid)
  //   test_funktion();
}
