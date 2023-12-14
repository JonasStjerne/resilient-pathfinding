import { Edge } from '../../../algo/models/Edge.js'
import { Grid } from '../../../algo/models/Grid.js'
import { Node } from '../../../algo/models/Node.js'

function recreateEdgeCircularReference(edgesJson: EdgeJSON[], newGrid: Grid): Edge[] {
  const edges = edgesJson.map((edgeJson) => {
    return { ...edgeJson, adjacent: newGrid[edgeJson.adjacent.x][edgeJson.adjacent.y] }
  })
  return edges
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
