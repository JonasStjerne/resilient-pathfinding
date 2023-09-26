export default function algoInit() {
    makeGrid()
}
//Type definitions
type cellType = "road"|"water"
type gridType = node[][]

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
    // Set the edges of the grid 
    for (let x = 0; x < gridSize; x++){
            for(let y = 0; y < gridSize; y++){
                
                
                // Set left edge
                if (x != 0){
                    grid[x][y].edges.push(grid[x-1][y])
                }
                
                //Set right neighbor
                if(x != (gridSize-1)){
                    grid[x][y].edges.push(grid[x+1][y])
                }
                
                //Set upper neighbor
                if(y != 0){
                    grid[x][y].edges.push(grid[x][y-1])
                }
                
                //Set lower neighbor
                if (y != (gridSize - 1)){
                    grid[x][y].edges.push(grid[x][y+1])
                }
            
        }
    }
}

