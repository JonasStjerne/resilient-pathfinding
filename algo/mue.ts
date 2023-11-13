import { Edge } from "./models/Edge.js";
import { Grid } from "./models/Grid.js";
import { Node } from "./models/Node.js";
// Check if the sets contain the same nodes, given no duplicats
const compare = (set1: Node[], set2: Node[]):boolean =>{

    let result: boolean = true; 
    const setA = new Set(set1);
    const setB = new Set(set2);

    if(setA.size != setB.size){

        return false;

    }else{
        
        for(let element of set2){

            if(!set1.includes(element)){

                result = false;
                break;
            }
        }
    }

    return result;
}

// Function to find a cycle for a given graph recursively
// Cycle that dont contain nodes from set
const findCycle = (startNode: Node, set: Node[]): boolean =>{

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
const computeR = (Q_i: Node[][], i:number ):Node[] =>{

    let R:Node[] = [];

    let D:Node[] = [];

    for(let x = 0; x < Q_i.length; x++){

        for(const current of Q_i[x]){

            for(const adjacentNode of current.incomingDistEdges){
                
                if (!D.includes(adjacentNode)){

                    D.push(adjacentNode)
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
const Attr = (R: Node[]):Node[] =>{

    // Initialize sets
    let AttrR:Node[] = R;
    let AttrRprev: Node[] = []; 

    do{

        AttrRprev = AttrR;

        for(const current of AttrRprev){

            for(const prev of current.incomingEdges){

                // element indicates if prev will be included in AttrR
                let element:boolean = true;
                for(const adjacent of prev.edges){

                    if(!AttrRprev.includes(adjacent.adjacent) && !(AttrR.includes(adjacent.adjacent))){

                        if (adjacent.adjacent.mue != 0){

                            //mark nodes and finde cycle
                            adjacent.adjacent.mue = -2;
                            element = !findCycle(adjacent.adjacent, AttrR);
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
    // Do until current and previus Attractor are the same
    }while(!compare(AttrR, AttrRprev));

    return AttrR;
}

// Function to compute the mue values 
export const computeMue = (grid: Grid) => {
    resetMu(grid);
    const Q_i: Node [][] = [];
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
    let initSet:Node[] = Q_i[0];
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

        let R:Node[] = computeR(Q_i, i) 
    
        let Attr_1 = Attr(R);
        for(const elem of Attr_1){
            Q_i[i].push(elem);
        }

    }while(!compare(Q_i[i], Q_i[i-1])); 

    //Set the mue values 
    for(let x = 1; x < Q_i.length; x++ ){
        
        for(let y  = 0; y < Q_i[x].length; y++){

            if(Q_i[x][y].mue < 0){

                Q_i[x][y].mue = x;
        
            }
        }
    }
    grid.forEach(coll => {coll.forEach(cell => {if(cell.mue == -1){cell.mue = grid.length + 15}})})
}

// Funktion to test a given graph
export const test_funktion = (): void => {

    // Create Test Grid 
    let v1 = new Node(1,0,'road')
    let v2 = new Node(2,0, 'water')
    let v3 = new Node(3,0,'road')
    let v4 = new Node(4,0,'road')
    let v5 = new Node(5,0,'road')
    let v6 = new Node(6,0,'road')
    let v7 = new Node(7,0,'road')
    let v8 = new Node(8,0,'road')

    let grid: Grid = new Array(1);
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
    grid[0][1].edges.push(new Edge(grid[0][0], 1,grid[0][1]));

    grid[0][0].edges.push(new Edge(grid[0][1], 1,grid[0][0]));

    grid[0][2].edges.push(new Edge(grid[0][1], 1,grid[0][2]));
    grid[0][2].edges.push(new Edge(grid[0][3],1 ,grid[0][2]));
    grid[0][2].edges.push(new Edge(grid[0][0], 1,grid[0][2]))

    grid[0][3].edges.push(new Edge(grid[0][5], 1, grid[0][3]));

    grid[0][4].edges.push(new Edge(grid[0][5], 1, grid[0][4]));
    grid[0][4].distEdges.push(new Edge(grid[0][1], 1));
    grid[0][1].incomingDistEdges.push(grid[0][4])

    grid[0][5].edges.push(new Edge(grid[0][4], 1, grid[0][5]));
    grid[0][5].distEdges.push(new Edge(grid[0][2], 1));
    grid[0][2].incomingDistEdges.push(grid[0][5])
    grid[0][5].distEdges.push(new Edge(grid[0][7], 1));
    grid[0][7].incomingDistEdges.push(grid[0][5]);

    grid[0][6].edges.push(new Edge(grid[0][5], 1, grid[0][6]));

    grid[0][7].edges.push(new Edge(grid[0][7], 1, grid[0][7]));
    grid[0][7].distEdges.push(new Edge(grid[0][5], 1));
    grid[0][5].incomingDistEdges.push(grid[0][7]);

    computeMue(grid);
    
}

function resetMu(grid: Grid) {
    grid.forEach(col => col.forEach(node => node.mue = -1));
}
