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
  mue: number;
  incomingEdges: Node[] = [];
  distEdges: Edge[] = [];
  incomingDistEdges: Node[] = []; 

  constructor(x: number, y: number, type: NodeType, mue?: number) {
    this.id = Node._id++;
    this.type = type;
    this.x = x;
    this.y = y;

    if (typeof mue == 'undefined'){
        //negativ implies undefined
        this.mue = -1;
    }
    else
    {
        this.mue = mue;
    }
  }
}

