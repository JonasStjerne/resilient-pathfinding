import { grid } from "../algo/grid.js";
import { addGridToSavesInLocalStorage } from "./saveService.js";

export const initSaveControl = () => {
    const saveBtn = document.getElementById("save-grid")!;
    saveBtn.addEventListener("click", () => validateSaveGrid(saveGridInput));
    
    const saveGridInput = <HTMLInputElement>document.getElementById("save-grid-input")!;
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