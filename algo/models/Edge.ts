import node from "./Node.js";

class edge {
  adjacent: node;
  weight = 1;

  constructor(adjacent: node, weight: number) {
    this.adjacent = adjacent;
    this.weight = weight;
  }
}

export default edge;
