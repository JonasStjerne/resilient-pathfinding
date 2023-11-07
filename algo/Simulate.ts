import { Grid } from "./models/Grid";
import { Node } from "./models/Node";
import { Edge } from "./models/Edge";

export interface Position {
  x: number;
  y: number;
}

export interface results{
    grid: Grid;
    idealPath: Node[];
    pushProp: number;   
    successProp: number;

    didReachGoal: boolean;
    fallInWater: boolean;   
    pathtaken: Node[];  
    distTouched:number;
    distTaken: number;
    gotPushedHere: Node[];
} 

// Produces true with prop -> Work that out !!!!
const randomBool = (prop: number): boolean => {
  return Math.random() < prop;
};

function timeoutPathfinding (
    grid: Grid,
    startPos: Position,
    endPos: Position,
    pathFindingAlgo: (startPos: Position,endPos: Position,grid: Grid, w:number) => number[],
    w:number,
    timeoutTime: number,
): Promise<number[] | undefined> {

    return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
            resolve(undefined); // Resolve with undefined if the timeout occurs
        }, timeoutTime);

        try {
            const result = pathFindingAlgo(startPos,endPos,grid, w);
            clearTimeout(timeoutId); 
            resolve(result);
        } catch (error) {
            clearTimeout(timeoutId); 
            resolve(undefined);
        }
    });

}


export const simulateRoute = (
    grid: Grid,
    path:number[], 
    startPos: Position,
    endPos: Position,
    pathFindingAlgo: (startPos: Position,endPos: Position,grid: Grid, w:number) => number[],
    pushProp:number, 
    w:number,

): void  => {

    // iterate over path
    // walk the edges that are foreseen by the path 
    // If for a given node there are dist edges -> radnom event if pushed
    // If pushed recompute the path -> and start again
    // Check if mu zero reached -> return false 
    let noPath: boolean = false;
    grid.forEach(row => {
        row.forEach(cell => { if (cell.id === path[0]) {startPos = { x: cell.x, y: cell.y };}
            if (cell.id === path[path.length - 1]) {endPos = { x: cell.x, y: cell.y };} }); 
    });

    let currentPos: Position | undefined;
    startPos && (currentPos = startPos);
    let iter: number = 0;
    while(currentPos != undefined && currentPos != startPos){

        let next:Node | undefined;

        // If dist edges det if one is taken?
        if(grid[currentPos.x][currentPos.y].distEdges.length != 0){
            grid[currentPos.x][currentPos.y].distEdges.forEach(distedge => {if(Math.random() < (pushProp)){next = distedge.adjacent;}});
            if(next != undefined){
                currentPos = {x: next.x, y: next.y};
                if(grid[currentPos.x][currentPos.y].mue != 0 && endPos != undefined){
                    const timeoutTime:number = 2000;
                    const pathPromis = timeoutPathfinding(grid, currentPos, endPos,pathFindingAlgo,w,timeoutTime)
                    pathPromis.then((result) => {
                        if (result !== undefined){
                            path = result;
                            iter = 0;
                        } else {
                            // Function was timed out => no path 
                            noPath = true;
                        }
                    })
                }
                else{noPath = true; break;}
            }             
        }
        if(noPath){break;}
        //if no dist edge was triggered
        if(next == undefined ){

            // do a "normal" walk
            grid[currentPos.x][currentPos.y].edges.forEach(edge => { 
                if(edge.adjacent.id == path[iter]){next = grid[edge.adjacent.x][edge.adjacent.y]; currentPos = {x:next.x, y:next.y};}
            });            
            iter ++;
        }
    }
}
