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
    incomingEdges: node[] = [];
    distEdges: edge[] = [];
    incomingDistEdges: node[] = []; 
    type: nodeType;
    mue: number;

    constructor(x:number,y:number,type: nodeType, mue?: number){
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

class edge{
    adjacent: node;
    weight = 1;

    constructor(adjacent: node, weight?:number, from?:node){
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
            // Set left edge
            if (x != 0){
                const newEdge = new edge(grid[x-1][y], 1);
                grid[x][y].edges. push(newEdge)
                grid[x-1][y].incomingEdges.push(grid[x][y])
            }
            
            //Set right neighbor
            if(x != (gridSize-1)){
                const newEdge = new edge(grid[x+1][y], 1);
                grid[x][y].edges.push(newEdge)
                grid[x+1][y].incomingEdges.push(grid[x][y])
            }
            
            //Set upper neighbor
            if(y != 0){
                const newEdge = new edge(grid[x][y-1], 1);
                grid[x][y].edges.push(newEdge)
                grid[x][y-1].incomingEdges.push(grid[x][y])
            }
            
            //Set lower neighbor
            if (y != (gridSize - 1)){
                const newEdge = new edge(grid[x][y+1], 1);
                grid[x][y].edges.push(newEdge)
                grid[x][y+1].incomingEdges.push(grid[x][y])
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

// Check if the sets contain the same nodes, given no duplicats
const compare = (Q_i: node[], Q_i_1: node[]):boolean =>{

    let result: boolean = true; 
    const setA = new Set(Q_i);
    const setB = new Set(Q_i_1);

    if(setA.size != setB.size){

        return false;

    }else{
        
        for(let element of Q_i_1){

            if(!Q_i.includes(element)){

                result = false;
                break;
            }
        }
    }

    return result;
}

// Function to find a cycle for a given graph recursively
const findCycle = (startNode: node, set: node[]): boolean =>{

    // Already visited node
    if(startNode.mue == -2){

        startNode.mue = -1;
        return true;
    }

    // No cycle on this branche
    if(startNode.mue == 0 || startNode.type == 'water' || set.includes(startNode)){
        
        return false;
    }

    // Node was not visited jet and no end
    if(startNode.mue == -1){

        let cycle: boolean = false;
        startNode.mue = -2;
        for(let next of startNode.edges){
            cycle = findCycle(next.adjacent, set)
            if(cycle == true){
                startNode.mue = -1;
                break;
            }
        }

        if (cycle == true){
            // Reset mue value
            startNode.mue = -1;
        }

        if(cycle == false){
            startNode.mue = 0; 
            
            if (!set.includes(startNode)){
                set.push(startNode);
            }          
        }

        return cycle; 
    }
    // Default return so Ts will not complain
    return false;
    
} 

//Computes a set R from the set of sets Q_i
const computeR = (Q_i: node[][], Q:node[], i:number ):node[] =>{

    let R:node[] = [];

    let D:node[] = [];

    for(let x = 0; x < Q_i.length; x++){

        for(const current of Q_i[x]){

            for(const current_node of current.incomingDistEdges){
                
                if (!D.includes(current_node)){

                    D.push(current_node)
                }
            }            
        }
    }

    // Union with Q_(i-1)
    R = D;
    for(const b of Q_i[i-1]){
            
        if(!R.includes(b)){
            R.push(b);
        }
    }

    return R;
}

//computes Attractor for a given set
const Attr = (R: node[], i:number):node[] =>{

    let AttrR:node[] = R;
    let AttrRprev: node[] = []; 

    do{

        AttrRprev = AttrR;

        for(const current of AttrRprev){

            for(const prev of current.incomingEdges){

                let element:boolean = true;
                for(const adjacent of prev.edges){

                    if(!AttrRprev.includes(adjacent.adjacent) || !(AttrR.includes(adjacent.adjacent))){

                        if (adjacent.adjacent.mue != 0){

                            //mark nodes
                            adjacent.adjacent.mue = -2;
                            element = findCycle(adjacent.adjacent, AttrR);
                            adjacent.adjacent.mue = -1; 
                        }
                    }
                }

                if(element == true){

                    if(! AttrR.includes(prev)){

                        AttrR.push(prev);
                    }
                }
            }
        }

    }while(!compare(AttrR, AttrRprev));

    return AttrR;
}

// Function to compute the mue values 
const computeMue = (grid: grid) => {

    const Q_i: node [][] = [];
    Q_i.push([]);
    let i: number = 0;

    //Collect water nodes
    for (let x = 0; x < grid.length ; x++){
        for(let y = 0; y < grid[x].length; y++){

            if(grid[x][y].type == 'water'){
                Q_i[i].push(grid[x][y])
                grid[x][y].mue = 0;
            }
        }
    }

    //Add nodes from which there is no way to avoid the water
    let initSet:node[] = Q_i[0];
    for(let x = 0; x < initSet.length; x++){ 
        
        // Expand set Q_0
        for (let y = 0; y < initSet[x].incomingEdges.length; y++ ){ 
            
            let in_Q_0: boolean = true;
            if (initSet[x].incomingEdges[y].type != 'water') {  

                for(const adjacent of initSet[x].incomingEdges[y].edges){
                    if(adjacent.adjacent.type != 'water' || adjacent.adjacent.mue != 0 ){

                        //Start rekursion to check if might still element Q_0 
                        initSet[x].incomingEdges[y].mue = -2;
                        in_Q_0 = (!findCycle(adjacent.adjacent, Q_i[0]));
                        initSet[x].incomingEdges[y].mue = -1;
                    }
                    if(in_Q_0 == false){

                        break;
                    }
                }
            }

            if(in_Q_0 == true){

                //Check if already in
                if(initSet[x].incomingEdges[y].mue != 0){
                    Q_i[0].push(initSet[x].incomingEdges[y])
                    initSet[x].incomingEdges[y].mue = 0;
                }
            }
        }      
    }

    // Recursively computing Q_i
    do{
        i = i + 1;
        Q_i.push([]);

        let R:node[] = computeR(Q_i, Q_i[i-1], i) 
    
        let Attr_1 = Attr(R, i);
        for(const elem of Attr_1){
            Q_i[i].push(elem);
        }

    }while(!compare(Q_i[i], Q_i[i-1])); // while Q_i+1 != Q_i

    //Set the mue values 
    for(let x = 1; x < Q_i.length; x++ ){
        
        for(let y  = 0; y < Q_i[x].length; y++){

            if(Q_i[x][y].mue < 0){

                Q_i[x][y].mue = x;
        
            }
        }
    }
}

// Funktion to test a given graph
export const test_funktion = (): void => {

    // Create Test Grid 
    let v1 = new node(1,0,'road')
    let v2 = new node(2,0, 'water')
    let v3 = new node(3,0,'road')
    let v4 = new node(4,0,'road')
    let v5 = new node(5,0,'road')
    let v6 = new node(6,0,'road')
    let v7 = new node(7,0,'road')
    let v8 = new node(8,0,'road')

    let grid: grid = new Array(1);
    grid[0] = new Array(8);

    grid[0][0] = v1;
    grid[0][1] = v2;
    grid[0][2] = v3;
    grid[0][3] = v4;
    grid[0][4] = v5;
    grid[0][5] = v6;
    grid[0][6] = v7;
    grid[0][7] = v8;

    // Add edges -> New edge automatically sets the destination
    grid[0][1].edges.push(new edge(grid[0][0], 1,grid[0][1]));

    grid[0][0].edges.push(new edge(grid[0][1], 1,grid[0][0]));

    grid[0][2].edges.push(new edge(grid[0][1], 1,grid[0][2]));
    grid[0][2].edges.push(new edge(grid[0][3],1 ,grid[0][2]));
    grid[0][2].edges.push(new edge(grid[0][0], 1,grid[0][2]))

    grid[0][3].edges.push(new edge(grid[0][5], 1, grid[0][3]));

    grid[0][4].edges.push(new edge(grid[0][5], 1, grid[0][4]));
    grid[0][4].distEdges.push(new edge(grid[0][1], 1));
    grid[0][1].incomingDistEdges.push(grid[0][4])

    grid[0][5].edges.push(new edge(grid[0][4], 1, grid[0][5]));
    grid[0][5].distEdges.push(new edge(grid[0][2], 1));
    grid[0][2].incomingDistEdges.push(grid[0][5])
    grid[0][5].distEdges.push(new edge(grid[0][7], 1));
    grid[0][7].incomingDistEdges.push(grid[0][5]);

    grid[0][6].edges.push(new edge(grid[0][5], 1, grid[0][6]));

    grid[0][7].edges.push(new edge(grid[0][7], 1, grid[0][7]));
    grid[0][7].distEdges.push(new edge(grid[0][5], 1));
    grid[0][5].incomingDistEdges.push(grid[0][7]);

    computeMue(grid);
}
