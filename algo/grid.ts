import { Edge } from "./models/Edge.js";
import { Grid } from "./models/Grid.js";
import { Node, NodeType } from "./models/Node.js";

// Create Grid
const gridSize = 10;
export const grid: Grid = new Array(gridSize);

export function makeGrid(): Grid {
  for (let x = 0; x < gridSize; x++) {
    grid[x] = new Array(gridSize);
  }

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      grid[x][y] = new Node(x, y, "road");
    }
  }
  // Set the edges of the grid
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      // Set left edge
      if (x != 0) {
        const newEdge = new Edge(grid[x - 1][y], 1);
        grid[x][y].edges.push(newEdge);
      }

      //Set right neighbor
      if (x != gridSize - 1) {
        const newEdge = new Edge(grid[x + 1][y], 1);
        grid[x][y].edges.push(newEdge);
      }

      //Set upper neighbor
      if (y != 0) {
        const newEdge = new Edge(grid[x][y - 1], 1);
        grid[x][y].edges.push(newEdge);
      }

      //Set lower neighbor
      if (y != gridSize - 1) {
        const newEdge = new Edge(grid[x][y + 1], 1);
        grid[x][y].edges.push(newEdge);
      }
    }
  }

  // Make test grid hardcode
  // grid[0][2].type = "water";
  // grid[0][4].type = "water";
  // grid[0][6].type = "water";
  // grid[0][8].type = "water";
  // grid[1][0].type = "water";
  // grid[1][2].type = "water";
  // grid[1][5].type = "water";
  // grid[2][6].type = "water";
  // grid[2][7].type = "water";
  // grid[2][8].type = "water";
  // grid[3][4].type = "water";
  // grid[3][5].type = "water";
  // grid[4][1].type = "water";
  // grid[4][3].type = "water";
  // grid[4][7].type = "water";
  // grid[5][0].type = "water";
  // grid[6][6].type = "water";
  // grid[6][8].type = "water";
  // grid[7][4].type = "water";
  // grid[7][6].type = "water";
  // grid[8][7].type = "water";
  // grid[9][3].type = "water";
  // grid[9][4].type = "water";
  // grid[9][8].type = "water";
  // grid[9][6].type = "water";
  return grid satisfies Grid;
}

const getRiskNode = (node: Node, windDirection: number) => {
    node.edges.forEach((edge) => {
      edge.adjacent;
    });
  };

  export function setTypeOfNode(coordinates: Pick<Node, "x" | "y">, type: NodeType) {
    grid[coordinates.x][coordinates.y].type = type;
  }
  export function setGrid(newGrid: Grid) {
    grid.length = 0;
    console.log("ran")
    newGrid.forEach(col => grid.push(col));
  }

  function removeTypeFromGrid(type: NodeType) {
    grid.forEach(column => {
      column.forEach(rowElm => {
        if (rowElm.type === type) {
          rowElm.type = "road";
        }
      })
    })
  }

  export function addEdge(fromNode: Node, toNode: Node) {
    if (fromNode.edges.find(edge => edge.adjacent.id == fromNode.id)) {return}

    const newEdge: Edge = new Edge(toNode, 1)
    fromNode.edges.push(newEdge);
  }

  export function deleteEdge(fromNode: Node, toNode: Node) {
    console.log("Deleting node edge from", {x: fromNode.x, y: fromNode.y}, {x: toNode.x, y: toNode.y})
    fromNode.edges = fromNode.edges.filter(edge => edge.adjacent.id != toNode.id);
    console.log(grid)
  }