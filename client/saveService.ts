import { Edge } from "../algo/models/Edge.js";
import { Grid } from "../algo/models/Grid.js";
import { Node } from "../algo/models/Node.js";
import { drawType } from "./index.js";

const CONTROLS_DATA_LS_KEY = "controlsData";
const ACTIVE_GRID_LS_KEY = "activeGrid";

export type ControlsData = {
    "drawType": drawType
    "options": {
        "directedEdges": boolean,
        "disturbances": boolean
        "mu": boolean
        "nodeId": boolean
    }
}

export function saveControlsToLocalStorage(controlsData: ControlsData) {
    const data = JSON.stringify(controlsData);
    localStorage.setItem(CONTROLS_DATA_LS_KEY, data);
}

export function getControlsFromLocalStorage() {
    const data = localStorage.getItem(CONTROLS_DATA_LS_KEY);
    if (!data) {return}
    const dataJSON = <ControlsData>JSON.parse(data);
    return dataJSON;
}

//This doesn't work. stringify return undefined. Maybe because the grid has circular dependencies
export function saveActiveGridToLocalStorage(grid: Grid) {
    const jsonSafeGrid= removeNodeCircularReference(grid);
    const data = JSON.stringify(jsonSafeGrid);
    localStorage.setItem(ACTIVE_GRID_LS_KEY, data);
}


//Doesn't work. Grid contains circular dependencies which JSON doesn't like
export function getActiveGridFromLocalStorage(): Grid |undefined {
    const data = localStorage.getItem(ACTIVE_GRID_LS_KEY);
    if (!data) {return}
    const dataJSON = <NodeJSON[][]>JSON.parse(data);

    const newGrid = recreateNodeCircularReference(dataJSON)

    return newGrid;
}

export function addGridToSavesInLocalStorage() {

}

export function removeGridFromSavesInLocalStorage() {

}

export function getGridsFromSavesInLocalStorage() {

}

function removeCircularRefEdges(edges: Edge[]): EdgeJSON[] {
    const jsonSafeEdges: EdgeJSON[] = [];
    edges.forEach(edge => {jsonSafeEdges.push({adjacent: {x: edge.adjacent.x, y: edge.adjacent.y}, weight: edge.weight})})
    return jsonSafeEdges;
}

function recreateEdgeCircularReference(edgesJson: EdgeJSON[], newGrid: Grid): Edge[] {
    const edges = edgesJson.map(edgeJson => {return {...edgeJson, adjacent: newGrid[edgeJson.adjacent.x][edgeJson.adjacent.y]}})
    return edges;
}

function removeNodeCircularReference(grid: Grid): NodeJSON[][] {
    //Make new empty JSON safe grid
    const jsonSafeGrid: NodeJSON[][] = new Array(grid.length);
    grid.forEach((col, x) => jsonSafeGrid[x] = new Array(grid[0].length))

    //Remove circular deps
    grid.forEach((col, x) => col.forEach((node, y) => {
        const safeNode: NodeJSON = {
            ...node,
            edges: removeCircularRefEdges(node.edges),
            distEdges: removeCircularRefEdges(node.distEdges),
            incomingDistEdges: node.incomingDistEdges.map(incomingDistEdge => {return {x: incomingDistEdge.x, y: incomingDistEdge.y}}),
            incomingEdges: node.incomingEdges.map(incomingEdge => {return {x: incomingEdge.x, y: incomingEdge.y}}),
        }
        jsonSafeGrid[x][y] = safeNode;
    }))
    return jsonSafeGrid;
}

function recreateNodeCircularReference(jsonSafeGrid: NodeJSON[][]): Grid {
    //Create empty grid
    const newGrid: Node[][] = new Array(jsonSafeGrid.length);
    jsonSafeGrid.forEach((col, x) => newGrid[x] = new Array(jsonSafeGrid[0].length))

    //Recreate nodes
    jsonSafeGrid.forEach((col, x) => col.forEach((space, y) => {
        newGrid[x][y] = new Node(x, y, jsonSafeGrid[x][y].type)
    }))

    //Recreate edges and disturbances
    jsonSafeGrid.forEach((col, x) => col.forEach((node, y) => {
        newGrid[x][y].edges = recreateEdgeCircularReference(jsonSafeGrid[x][y].edges, newGrid);
        newGrid[x][y].distEdges = recreateEdgeCircularReference(jsonSafeGrid[x][y].distEdges, newGrid);
        newGrid[x][y].incomingEdges = jsonSafeGrid[x][y].incomingEdges.map(nodeJson => newGrid[x][y]);
        newGrid[x][y].incomingDistEdges = jsonSafeGrid[x][y].incomingDistEdges.map(nodeJson => newGrid[x][y])
    }))

    return newGrid;
}

type EdgeJSON = Omit<Edge, "adjacent"> & {"adjacent": {x: number, y: number}};
type NodeJSON = Omit<Node, "edges" |"incomingEdges" | "distEdges" | "incomingDistEdges"> & {edges: EdgeJSON[], incomingEdges: NodeLookup[], distEdges: EdgeJSON[], incomingDistEdges: NodeLookup[] }
type NodeLookup = Pick<Node, "x" | "y">