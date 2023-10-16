import { Node } from "./Node.js";

export class Edge {
  adjacent: Node;
  weight = 1;

  constructor(adjacent: Node, weight: number) {
    this.adjacent = adjacent;
    this.weight = weight;
  }
}
