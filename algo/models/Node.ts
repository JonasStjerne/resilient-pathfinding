import { Edge } from "./Edge.js";

//Type definitions
export type NodeType = "road" | "water" | "goal" | "start";

export class Node {
  static _id: number = 0;
  id: number;
  x: number;
  y: number;
  edges: Edge[] = [];
  type: NodeType;

  constructor(x: number, y: number, type: NodeType) {
    this.id = Node._id++;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

