import { Grid } from './models/Grid.js'
import { Node } from './models/Node.js'
import { Edge } from './models/Edge.js'
import { Position } from './Simulate.js'
import { addEdge } from './grid.js'

// Compute the distance of every node to goal
export const SetDistFromGoal = (grid: Grid, endNodePos: Position): void => {
  let endNode: Node = grid[endNodePos.x][endNodePos.y]
  endNode.GoalDistance = 0
  let Attr: Node[] = [endNode]
  let AttrRprev: Node[] = []

  do {
    AttrRprev = Attr
    Attr = []
    // Iterate over all nodes AttrRprev
    for (let i = 0; i < AttrRprev.length; i++) {
      let distCurrent = AttrRprev[i].GoalDistance
      for (let j = 0; j < AttrRprev[i].incomingEdges.length; j++) {
        let distToCurrent: number | undefined
        AttrRprev[i].incomingEdges[j].edges.forEach((outEdge) => {
          if (outEdge.adjacent.id == AttrRprev[i].id) {
            distToCurrent = AttrRprev[i].incomingEdges[j].GoalDistance

            if (
              distToCurrent != undefined &&
              distCurrent != undefined &&
              AttrRprev[i].incomingEdges[j].type != 'water' &&
              distToCurrent > distCurrent + outEdge.weight
            ) {
              AttrRprev[i].incomingEdges[j].GoalDistance = distCurrent + outEdge.weight
              Attr.push(AttrRprev[i].incomingEdges[j])
            } else {
              if (
                distToCurrent == undefined &&
                distCurrent != undefined &&
                AttrRprev[i].incomingEdges[j].type != 'water'
              ) {
                AttrRprev[i].incomingEdges[j].GoalDistance = distCurrent + outEdge.weight
                Attr.push(AttrRprev[i].incomingEdges[j])
              }
            }
          }
        })
      }
    }
  } while (Attr.length != 0)
}

export const testDistanceFunktion = (): void => {
  const gridSize = 10
  Node._id = 0
  const grid: Grid = new Array(gridSize)
  for (let x = 0; x < gridSize; x++) {
    grid[x] = new Array(gridSize)
  }

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      grid[x][y] = new Node(x, y, 'road')
    }
  }
  grid[1][1].type = 'water'
  grid[1][2].type = 'water'
  grid[1][3].type = 'water'
  grid[1][4].type = 'water'
  grid[1][5].type = 'water'
  grid[1][6].type = 'water'
  grid[1][7].type = 'water'
  grid[1][8].type = 'water'
  grid[1][0].type = 'water'

  // Set the edges of the grid
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      // Set left edge
      if (x != 0) {
        addEdge(grid[x][y], grid[x - 1][y])
      }

      //Set right neighbor
      if (x != gridSize - 1) {
        addEdge(grid[x][y], grid[x + 1][y])
      }

      //Set upper neighbor
      if (y != 0) {
        addEdge(grid[x][y], grid[x][y - 1])
      }

      //Set lower neighbor
      if (y != gridSize - 1) {
        addEdge(grid[x][y], grid[x][y + 1])
      }

      //Set top diagonally edges
      if (y != 0) {
        //Set left
        if (x != 0) {
          addEdge(grid[x][y], grid[x - 1][y - 1], Math.SQRT2)
        }
        //Set right
        if (x != gridSize - 1) {
          addEdge(grid[x][y], grid[x + 1][y - 1], Math.SQRT2)
        }
      }

      //Set bottom diagonally edges
      if (y != gridSize - 1) {
        //Set left
        if (x != 0) {
          addEdge(grid[x][y], grid[x - 1][y + 1], Math.SQRT2)
        }
        //Set right
        if (x != gridSize - 1) {
          addEdge(grid[x][y], grid[x + 1][y + 1], Math.SQRT2)
        }
      }
    }
  }

  SetDistFromGoal(grid, { x: 0, y: 0 })
  console.log(grid)
}
