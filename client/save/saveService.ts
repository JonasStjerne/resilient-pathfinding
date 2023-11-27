import { Edge } from '../../algo/models/Edge.js'
import { Grid } from '../../algo/models/Grid.js'
import { Node } from '../../algo/models/Node.js'
import { drawType } from '../index.js'

const CONTROLS_DATA_LS_KEY = 'controlsData'
const ACTIVE_GRID_LS_KEY = 'activeGrid'
const SAVED_GRIDS_LS_KEY = 'savesGrid'

export type ControlsData = {
  drawType: drawType
  options: {
    directedEdges: boolean
    disturbances: boolean
    mu: string
    nodeId: boolean
    lists: boolean
    riskFactor: number
    algoVersion: string
    heuristic: string
  }
}

export function saveControlsToLocalStorage(controlsData: ControlsData) {
  const data = JSON.stringify(controlsData)
  localStorage.setItem(CONTROLS_DATA_LS_KEY, data)
}

export function getControlsFromLocalStorage() {
  const data = localStorage.getItem(CONTROLS_DATA_LS_KEY)
  if (!data) {
    return
  }
  const dataJSON = <ControlsData>JSON.parse(data)
  return dataJSON
}

export function convertGridToJSONstring(grid: Grid) {
  const jsonSafeGrid = removeNodeCircularReference(grid)
  const data = JSON.stringify(jsonSafeGrid)
  return data
}

export function convertGridsToJSONString(grids: Grid[]) {
  const jsonSafeGrids: GridJSON[] = []
  grids.forEach((grid) => jsonSafeGrids.push(removeNodeCircularReference(grid)))
  const json = JSON.stringify(jsonSafeGrids)
  return json
}

export function saveActiveGridToLocalStorage(grid: Grid) {
  const jsonSafeGrid = removeNodeCircularReference(grid)
  const data = JSON.stringify(jsonSafeGrid)
  localStorage.setItem(ACTIVE_GRID_LS_KEY, data)
}

export function getActiveGridFromLocalStorage(): Grid | undefined {
  const data = localStorage.getItem(ACTIVE_GRID_LS_KEY)
  if (!data) {
    return
  }
  const dataJSON = <NodeJSON[][]>JSON.parse(data)

  const newGrid = recreateNodeCircularReference(dataJSON)

  return newGrid
}

export function addGridToSavesInLocalStorage(grid: Grid, title: string) {
  const existingSavesJSON = localStorage.getItem(SAVED_GRIDS_LS_KEY)
  const existingSaves = existingSavesJSON ? <GridJSONSave[]>JSON.parse(existingSavesJSON) : <GridJSONSave[]>[]

  const jsonSafeGrid = removeNodeCircularReference(grid)

  let id = 0
  existingSaves.forEach((savedGrid) => (savedGrid.id >= id ? (id = savedGrid.id + 1) : null))

  const saveGrid: GridJSONSave = { title, id, grid: jsonSafeGrid }

  existingSaves.push(saveGrid)

  const data = JSON.stringify(existingSaves)

  localStorage.setItem(SAVED_GRIDS_LS_KEY, data)
}

export function removeGridFromSavesInLocalStorage(id: number) {
  const existingSavesJSON = localStorage.getItem(SAVED_GRIDS_LS_KEY)
  const existingSaves = existingSavesJSON ? <GridJSONSave[]>JSON.parse(existingSavesJSON) : <GridJSONSave[]>[]

  const newSaves = existingSaves.filter((grid) => grid.id != id)

  const newSavesJSON = JSON.stringify(newSaves)

  localStorage.setItem(SAVED_GRIDS_LS_KEY, newSavesJSON)
}

export function getGridsFromSavesInLocalStorage(): GridSave[] {
  const existingSavesJSON = localStorage.getItem(SAVED_GRIDS_LS_KEY)
  if (!existingSavesJSON) {
    return []
  }

  const existingSaves = <GridJSONSave[]>JSON.parse(existingSavesJSON)

  const saves: GridSave[] = []
  existingSaves.forEach((save) =>
    saves.push({ title: save.title, id: save.id, grid: recreateNodeCircularReference(save.grid) }),
  )

  return saves
}

function removeCircularRefEdges(edges: Edge[]): EdgeJSON[] {
  const jsonSafeEdges: EdgeJSON[] = []
  edges.forEach((edge) => {
    jsonSafeEdges.push({ adjacent: { x: edge.adjacent.x, y: edge.adjacent.y }, weight: edge.weight })
  })
  return jsonSafeEdges
}

function recreateEdgeCircularReference(edgesJson: EdgeJSON[], newGrid: Grid): Edge[] {
  const edges = edgesJson.map((edgeJson) => {
    return { ...edgeJson, adjacent: newGrid[edgeJson.adjacent.x][edgeJson.adjacent.y] }
  })
  return edges
}

function removeNodeCircularReference(grid: Grid): NodeJSON[][] {
  //Make new empty JSON safe grid
  const jsonSafeGrid: NodeJSON[][] = new Array(grid.length)
  grid.forEach((col, x) => (jsonSafeGrid[x] = new Array(grid[0].length)))

  //Remove circular deps
  grid.forEach((col, x) =>
    col.forEach((node, y) => {
      const safeNode: NodeJSON = {
        ...node,
        edges: removeCircularRefEdges(node.edges),
        distEdges: removeCircularRefEdges(node.distEdges),
        incomingDistEdges: node.incomingDistEdges.map((incomingDistEdge) => {
          return { x: incomingDistEdge.x, y: incomingDistEdge.y }
        }),
        incomingEdges: node.incomingEdges.map((incomingEdge) => {
          return { x: incomingEdge.x, y: incomingEdge.y }
        }),
      }
      jsonSafeGrid[x][y] = safeNode
    }),
  )
  return jsonSafeGrid
}

export function recreateNodeCircularReference(jsonSafeGrid: NodeJSON[][]): Grid {
  //Create empty grid
  const newGrid: Node[][] = new Array(jsonSafeGrid.length)
  jsonSafeGrid.forEach((col, x) => (newGrid[x] = new Array(jsonSafeGrid[0].length)))

  //Recreate nodes
  jsonSafeGrid.forEach((col, x) =>
    col.forEach((space, y) => {
      newGrid[x][y] = new Node(x, y, jsonSafeGrid[x][y].type, jsonSafeGrid[x][y].mue, jsonSafeGrid[x][y].id)
    }),
  )

  //Recreate edges and disturbances
  jsonSafeGrid.forEach((col, x) =>
    col.forEach((node, y) => {
      newGrid[x][y].edges = recreateEdgeCircularReference(jsonSafeGrid[x][y].edges, newGrid)
      newGrid[x][y].distEdges = recreateEdgeCircularReference(jsonSafeGrid[x][y].distEdges, newGrid)
      newGrid[x][y].incomingEdges = jsonSafeGrid[x][y].incomingEdges.map((nodeJson) => newGrid[nodeJson.x][nodeJson.y])
      newGrid[x][y].incomingDistEdges = jsonSafeGrid[x][y].incomingDistEdges.map(
        (nodeJson) => newGrid[nodeJson.x][nodeJson.y],
      )
    }),
  )

  return newGrid
}

export async function saveToFs(content: string, fileName: string, contentType = 'application/x-gzip') {
  const stream = new Blob([content], { type: contentType }).stream()

  const compressedReadableStream = stream.pipeThrough(new CompressionStream('gzip'))
  const compressedResponse = await new Response(compressedReadableStream)
  const blob = await compressedResponse.blob()
  const a = document.createElement('a')
  a.href = window.URL.createObjectURL(blob)
  a.download = fileName + '.gzip'
  a.click()
  a.remove()
  window.URL.revokeObjectURL(a.href)
}

export async function getFileFromFs<T>(inputElmId: string): Promise<T | undefined> {
  const input = <HTMLInputElement>document.getElementById(inputElmId)
  if (input?.files && input.files.length > 0) {
    const file = input.files[0]
    if (file.type === 'application/x-gzip') {
      return new Promise<T>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
          const fileContent = e.target?.result as ArrayBuffer
          const stream = new Blob([new Uint8Array(fileContent)], { type: 'application/x-gzip' }).stream()

          const compressedReadableStream = stream.pipeThrough(new DecompressionStream('gzip'))
          const compressedResponse = new Response(compressedReadableStream)

          const blob = await compressedResponse.blob()

          const dataJson = <GridJSON[] | GridJSON>JSON.parse(await blob.text())
          let result: any

          if (!isGridJson(dataJson)) {
            result = []
            dataJson.forEach((dataJson) => {
              const grid = recreateNodeCircularReference(dataJson)
              result.push(grid)
            })
          } else {
            result = recreateNodeCircularReference(dataJson)
          }
          resolve(result)
        }

        reader.onerror = () => {
          reject(new Error('Error reading file'))
        }

        reader.readAsArrayBuffer(file)
      })
    } else {
      alert('Please select a gzip file.')
    }
  }
}

function isGridJson(arr: GridJSON | GridJSON[]): arr is GridJSON {
  const isArray = Array.isArray(arr[0][0])
  return !isArray
}

export function isGrid(arr: Grid | Grid[]): arr is Grid {
  const isArray = Array.isArray(arr[0][0])
  return !isArray
}

type EdgeJSON = Omit<Edge, 'adjacent'> & { adjacent: { x: number; y: number } }
type NodeLookup = Pick<Node, 'x' | 'y'>

export type NodeJSON = Omit<Node, 'edges' | 'incomingEdges' | 'distEdges' | 'incomingDistEdges'> & {
  edges: EdgeJSON[]
  incomingEdges: NodeLookup[]
  distEdges: EdgeJSON[]
  incomingDistEdges: NodeLookup[]
}

export type GridJSON = NodeJSON[][]
export type GridJSONSave = { title: string; id: number; grid: GridJSON }
export type GridSave = { title: string; id: number; grid: Grid }