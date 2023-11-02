import { Edge } from "./models/Edge.js";
import { Grid } from "./models/Grid.js";
import { Node, NodeType } from "./models/Node.js";

// Create Grid
export const grid = makeGrid();

export function makeGrid(gridSize: number = 10): Grid {
  Node._id = 0;
  const grid: Grid = new Array(gridSize);
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
          addEdge(grid[x][y], grid[x - 1][y - 1], 1.4)
        }
        //Set right
        if (x != gridSize - 1) {
          addEdge(grid[x][y], grid[x + 1][y - 1], 1.4)
        }
      }
      
      //Set bottom diagonally edges
      if (y != gridSize - 1) {
        //Set left
        if (x != 0) {
          addEdge(grid[x][y], grid[x - 1][y + 1], 1.4)
        }
        //Set right
        if (x != gridSize - 1) {
          addEdge(grid[x][y], grid[x + 1][y + 1], 1.4)
        }
      }
    }
  }

  return grid;
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

  export function addEdge(fromNode: Node, toNode: Node, weight = 1) {
    if (fromNode.edges.find(edge => edge.adjacent.id == fromNode.id)) {return}

    const newEdge: Edge = new Edge(toNode, weight)
    fromNode.edges.push(newEdge);

    toNode.incomingEdges.push(fromNode);
  }

  export function deleteEdge(fromNode: Node, toNode: Node) {
    fromNode.edges = fromNode.edges.filter(edge => edge.adjacent.id != toNode.id);
    toNode.incomingEdges = toNode.incomingEdges.filter(node => node.id != fromNode.id)
  }

  export function addDisturbance(fromNode: Node, toNode: Node) {
    if (fromNode.distEdges.find(edge => edge.adjacent.id == fromNode.id)) {return}

    const newEdge: Edge = new Edge(toNode, 1)
    fromNode.distEdges.push(newEdge);

    toNode.incomingDistEdges.push(fromNode);
  }

  export function deleteDisturbance(fromNode: Node, toNode: Node) {
    fromNode.distEdges = fromNode.distEdges.filter(edge => edge.adjacent.id != toNode.id);
    toNode.incomingDistEdges = toNode.incomingDistEdges.filter(node => node.id != fromNode.id)
  }
  