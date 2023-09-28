export default function algoInit() {
    const grid = makeGrid()
    return grid;
}
//Type definitions
type nodeType = "road"|"water"
export type grid = node[][]

class node{
    x: number;
    y: number;
    edges: edge[] = [];
    type: nodeType;

    constructor(x:number,y:number,type: nodeType){
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
const grid: grid = new Array(gridSize)

export function makeGrid(): grid{
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
                    const newEdge = new edge(grid[x-1][y], 1);
                    grid[x][y].edges. push(newEdge)
                }
                
                //Set right neighbor
                if(x != (gridSize-1)){
                    const newEdge = new edge(grid[x+1][y], 1);
                    grid[x][y].edges.push(newEdge)
                }
                
                //Set upper neighbor
                if(y != 0){
                    const newEdge = new edge(grid[x][y-1], 1);
                    grid[x][y].edges.push(newEdge)
                }
                
                //Set lower neighbor
                if (y != (gridSize - 1)){
                    const newEdge = new edge(grid[x][y+1], 1);
                    grid[x][y].edges.push(newEdge)
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

    return grid satisfies grid
}

const getRiskNode = (node: node, windDirection: number) => {

    node.edges.forEach(edge => {
        edge.adjacent
    })
}
