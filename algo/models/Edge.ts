import { Node } from "./Node.js";

export class Edge {
  adjacent: Node;
  weight = 1;

  constructor(adjacent: Node, weight: number, from?:Node) {
    this.adjacent = adjacent;
        if(weight){
            this.weight = weight;
        }else{
            this.weight = 1;
        }
         
        if(from){
            adjacent.incomingEdges.push(from);
        }
  }
}
