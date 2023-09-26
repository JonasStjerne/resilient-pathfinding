//Type definitions
type cellType = "road"|"water"

class node{
    x: number;
    y: number;
    edges = [];
    type: cellType;

    constructor(x:number,y:number,type:cellType){
        this.type = type;
        this.x = x;
        this.y = y;
    }
}

class edge{
    adjacent: node;
    weight = 1;

    constructor(adjacent: node, weight :number){
        this.adjacent = adjacent;
        this.weight = weight;    
    }
}

// Create Grid
const gridSize = 50
const grid = new Array(gridSize)

export function makeGrid(){
    for(let x = 0; x < gridSize; x++){
        grid[x] = new Array(gridSize);
    }

    for(let x= 0; x < gridSize; x++){
        for(let y = 0; y < gridSize; y++){
            grid[x][y]= new node(x,y, 'road')
        }
    }
    console.log(grid)
}

