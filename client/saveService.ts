import { Grid } from "../algo/models/Grid.js";
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
const testString = JSON.stringify(grid[0][0]);
    const data = JSON.stringify(grid);
    localStorage.setItem(ACTIVE_GRID_LS_KEY, data);
}

//Doesn't work. Grid contains circular dependencies which JSON doesn't like
export function getActiveGridFromLocalStorage() {
    const data = localStorage.getItem(ACTIVE_GRID_LS_KEY);
    if (!data) {return}
    const dataJSON = <Grid>JSON.parse(data);
    return dataJSON;
}

function addGridToSavesInLocalStorage() {

}

function removeGridFromSavesInLocalStorage() {

}

function getGridsFromSavesInLocalStorage() {

}