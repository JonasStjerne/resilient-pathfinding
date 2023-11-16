import { grid, setGrid } from '../algo/grid.js'
import { drawGrid } from './index.js'
import {
  addGridToSavesInLocalStorage,
  getGridsFromSavesInLocalStorage,
  removeGridFromSavesInLocalStorage,
  convertGridToJSONstring,
  recreateNodeCircularReference,
  NodeJSON,
} from './saveService.js'
import { saveLocalGrid } from './saveService.js'

export const initSaveControl = () => {
  const saveList = <HTMLSelectElement>document.getElementById('save-list')!

  populateSavesList(saveList)

  const saveBtn = document.getElementById('save-grid')!
  const saveGridInput = <HTMLInputElement>document.getElementById('save-grid-input')!

  const saveLocalBtn = document.getElementById('save-grid-local')!
  const saveGridLocalInput = <HTMLInputElement>document.getElementById('save-grid-local-input')!

  const loadLocalBtn = document.getElementById('load-local-btn')!
  const loadGridLocalInput = <HTMLInputElement>document.getElementById('load-local-grid-input')!

  saveBtn.addEventListener('mouseup', () => validateSaveGrid(saveGridInput, saveList))

  saveLocalBtn.addEventListener('mouseup', () => validateLocalGrid(saveGridLocalInput))

  loadLocalBtn.addEventListener('mouseup', () => loadLocalGrid(loadGridLocalInput))

  const loadBtn = document.getElementById('load-btn')!
  const savesList = <HTMLSelectElement>document.getElementById('save-list')!

  loadBtn.addEventListener('mouseup', () => loadGridFromSaves(savesList))

  const deleteBtn = document.getElementById('delete-btn')!

  deleteBtn.addEventListener('mouseup', () => deleteGridFromSave(savesList))
}

function loadLocalGrid(input: HTMLInputElement) {
  if (input?.files && input.files.length > 0) {
    const file = input.files[0]
    if (file.type === 'application/json') {
      const reader = new FileReader()

      reader.onload = (e) => {
        const fileContent = e.target?.result as string
        const dataJSON = <NodeJSON[][]>JSON.parse(fileContent)
        const newGrid = recreateNodeCircularReference(dataJSON)
        setGrid(newGrid)
        drawGrid()
      }

      reader.readAsText(file)
    } else {
      alert('Please select a JSON file.')
    }
  }
}

function validateLocalGrid(saveGridLocalInput: HTMLInputElement) {
  saveGridLocalInput.classList.remove('is-invalid')

  let fileName = saveGridLocalInput.value
  if (!fileName) {
    saveGridLocalInput.classList.add('is-invalid')
    return
  }

  fileName = fileName + '_' + grid.length

  const content = convertGridToJSONstring(grid)
  const contentType = 'application/json'

  saveLocalGrid(content, fileName, contentType)
}

function validateSaveGrid(saveGridInput: HTMLInputElement, savesList: HTMLSelectElement) {
  const title = saveGridInput.value
  if (!title) {
    saveGridInput.classList.add('is-invalid')
    return
  }

  addGridToSavesInLocalStorage(grid, title)
  saveGridInput.classList.remove('is-invalid')
  saveGridInput.classList.add('is-valid')
  resetSavesList(savesList)
  populateSavesList(savesList)
  setTimeout(() => {
    saveGridInput.classList.remove('is-valid')
    saveGridInput.value = ''
  }, 1000)
}

function populateSavesList(savesInputEl: HTMLSelectElement) {
  // const permanentSaves =
  const saves = getGridsFromSavesInLocalStorage()

  saves.forEach((save) => savesInputEl.appendChild(generateOptionHtmlElement(save.title, save.id)))
}

function resetSavesList(savesInputEl: HTMLSelectElement) {
  savesInputEl.childNodes.forEach((child, index) => {
    if (index != 0) {
      savesInputEl.options.remove(index)
    }
  })
}

function generateOptionHtmlElement(text: string, value: number) {
  const el = document.createElement('option')
  el.value = value.toString()
  el.innerHTML = text
  return el
}

function loadGridFromSaves(listEl: HTMLSelectElement) {
  if (listEl.value == '-1') {
    listEl.classList.add('is-invalid')
    return
  }

  const gridsFromSave = getGridsFromSavesInLocalStorage()
  const selectedGrid = gridsFromSave.find((grid) => grid.id.toString() == listEl.value)

  if (!selectedGrid) {
    listEl.classList.remove('is-invalid')
    throw new Error('Selected grid not found in saves')
  }

  setGrid(selectedGrid.grid)
  drawGrid()

  listEl.classList.remove('is-invalid')
  listEl.classList.add('is-valid')
  setTimeout(() => {
    listEl.classList.remove('is-valid')
  }, 1000)
}

function deleteGridFromSave(listEl: HTMLSelectElement) {
  if (listEl.value == '-1') {
    listEl.classList.add('is-invalid')
    return
  }

  removeGridFromSavesInLocalStorage(Number(listEl.value))
  resetSavesList(listEl)
  populateSavesList(listEl)

  listEl.classList.remove('is-invalid')
  listEl.classList.add('is-valid')
  listEl.selectedIndex = 0
  setTimeout(() => {
    listEl.classList.remove('is-valid')
  }, 1000)
}
