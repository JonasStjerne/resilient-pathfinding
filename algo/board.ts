import { node } from "./node";

class board {
    width: number;
    height: number;
    nodes: node[][];

    constructor(width: number, height: number){
        this.width = width;
        this.height = height;
        this.nodes = this.#initNodes(width, height);
    }

    getNodeAt(x: number, y: number): node {
        return this.nodes[x][y];
    }

    getNeighbors(x: number, y: number): node[] {
        const neighbors = [];
        if (x > 0){
            neighbors.push(this.getNodeAt(x - 1, y));
        }
        if (x < this.width - 1){
            neighbors.push(this.getNodeAt(x + 1, y));
        }
        if (y > 0){
            neighbors.push(this.getNodeAt(x, y - 1));
        }
        if (y < this.height - 1){
            neighbors.push(this.getNodeAt(x, y + 1));
        }
        return neighbors;
    }

    #initNodes(width: number, height: number): node[][] {
        const nodes = new Array(width);
        for (let x = 0; x < width; x++){
            nodes[x] = new Array(height);
        }
        for (let x = 0; x < width; x++){
            for (let y = 0; y < height; y++){
                nodes[x][y] = new node(x, y);
            }
        }
        return nodes;
    }
}

export { board };