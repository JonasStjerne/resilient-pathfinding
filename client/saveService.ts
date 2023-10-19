import { drawType } from "./index.js";

const CONTROLS_DATA_LS_KEY = "controlsData";

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

function saveCurrentGridToLocalStorage() {

}

function getCurrentGridFromLocalStorage() {

}

function addGridToSavesInLocalStorage() {

}

function removeGridFromSavesInLocalStorage() {

}

function getGridsFromSavesInLocalStorage() {

}