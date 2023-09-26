export default function algoInit() {
    const grid = makeGrid()
    return grid;
}
//Type definitions
type cellType = "road"|"water"
export type gridType = node[][]

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
const gridSize = 10;
const grid = new Array(gridSize)

export function makeGrid(): gridType{
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

    // Make test grid hardcode
    grid[0][2].type = "water"
    grid[0][4].type = "water"
    grid[0][6].type = "water"
    grid[0][8].type = "water"
    grid[1][0].type = "water"
    grid[1][2].type = "water"
    grid[1][5].type = "water"
    grid[2][6].type = "water"
    grid[2][7].type = "water"
    grid[2][8].type = "water"
    grid[3][4].type = "water"
    grid[3][5].type = "water"
    grid[4][1].type = "water"
    grid[4][3].type = "water"
    grid[4][7].type = "water"
    grid[5][0].type = "water"
    grid[6][6].type = "water"
    grid[6][8].type = "water"
    grid[7][4].type = "water"
    grid[7][6].type = "water"
    grid[8][7].type = "water"
    grid[9][3].type = "water"
    grid[9][4].type = "water"
    grid[9][8].type = "water"
    grid[9][6].type = "water"

    return grid satisfies gridType
}

