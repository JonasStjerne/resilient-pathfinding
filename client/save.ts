import { grid, setGrid } from "../algo/grid.js";
import { drawGrid } from "./index.js";
import { addGridToSavesInLocalStorage, getGridsFromSavesInLocalStorage, removeGridFromSavesInLocalStorage } from "./saveService.js";

export const initSaveControl = () => {
    const saveList = <HTMLSelectElement>document.getElementById("save-list")!;
    populateSavesList(saveList);

    const saveBtn = document.getElementById("save-grid")!;
    const saveGridInput = <HTMLInputElement>document.getElementById("save-grid-input")!;

    saveBtn.addEventListener("click", () => validateSaveGrid(saveGridInput));
    
    const loadBtn = document.getElementById("load-btn")!;
    const savesList = <HTMLSelectElement>document.getElementById("save-list")!;

    loadBtn.addEventListener("click", () => loadGridFromSaves(savesList));

    const deleteBtn = document.getElementById("delete-btn")!;

    deleteBtn.addEventListener("click", () => deleteGridFromSave(savesList));
    
}

function validateSaveGrid(saveGridInput: HTMLInputElement) {
    const title = saveGridInput.value;
    if (!title) {
        saveGridInput.classList.add("is-invalid");
        return
    }

    addGridToSavesInLocalStorage(grid, title)
    saveGridInput.classList.remove("is-invalid")
    saveGridInput.classList.add("is-valid")
    setTimeout(() => {saveGridInput.classList.remove("is-valid");saveGridInput.value = "";}, 1000)
}

function populateSavesList(savesInputEl: HTMLSelectElement) {
    const saves = getGridsFromSavesInLocalStorage();

    saves.forEach(save => savesInputEl.appendChild(generateOptionHtmlElement(save.title, save.id)))
}

function resetSavesList(savesInputEl: HTMLSelectElement) {
    savesInputEl.childNodes.forEach((child, index) => {
        if (index != 0) {savesInputEl.options.remove(index)}
    })
}

function generateOptionHtmlElement(text: string, value: number) {
    const el = document.createElement("option");
    el.value = value.toString();
    el.innerHTML = text;
    return el;
}

function loadGridFromSaves(listEl: HTMLSelectElement) {
    if (listEl.value == "") {listEl.classList.add("is-invalid"); return}

    const gridsFromSave = getGridsFromSavesInLocalStorage();
    const selectedGrid = gridsFromSave.find(grid => grid.id.toString() == listEl.value);

    if (!selectedGrid) {throw new Error("Selected grid not found in saves")}

    setGrid(selectedGrid.grid);
    drawGrid();

    listEl.classList.remove("is-invalid")
    listEl.classList.add("is-valid")
    setTimeout(() => {listEl.classList.remove("is-valid");}, 1000)
}

function deleteGridFromSave(listEl: HTMLSelectElement) {
    if (listEl.value == "") {listEl.classList.add("is-invalid"); return}

    removeGridFromSavesInLocalStorage(Number(listEl.value));
    resetSavesList(listEl);
    populateSavesList(listEl);
    
    listEl.classList.remove("is-invalid")
    listEl.classList.add("is-valid")
    listEl.selectedIndex = 0;
    setTimeout(() => {listEl.classList.remove("is-valid");}, 1000)
}