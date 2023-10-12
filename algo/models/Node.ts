import edge from "./Edge.js";

//Type definitions
type nodeType = "road" | "water";

class node {
  static _id: number = 0;
  id: number;
  x: number;
  y: number;
  edges: edge[] = [];
  type: nodeType;

  constructor(x: number, y: number, type: nodeType) {
    this.id = node._id++;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

export default node;
