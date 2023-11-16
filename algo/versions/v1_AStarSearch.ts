import { HeuristicFunction } from '../heuristic'
import { Grid } from '../models/Grid'
import { Node } from '../models/Node'
import { Position } from '../models/Position'

interface SearchTable {
  [index: number]: {
    g?: number
    h?: number
    f?: number
    prevNode?: number
  }
}

const run = (startPos: Position, endPos: Position, graph: Grid, heuristic: HeuristicFunction) => {
  const searchTable: SearchTable = {}
  graph.forEach((graphRow) =>
    graphRow.forEach((graphCol) => {
      if (['road', 'start', 'goal'].includes(graphCol.type)) searchTable[graphCol.id] = {}
    }),
  )

  let openList: Array<Node> = []
  const closedList: Array<Node> = []
  let currentNode = graph[startPos.x][startPos.y]
  const destinationNode = graph[endPos.x][endPos.y]
  const legalMoveNodeTypes = ['road', 'start', 'goal']

  while (currentNode !== destinationNode) {
    currentNode.edges.forEach((edge) => {
      if (!legalMoveNodeTypes.includes(edge.adjacent.type)) return
      if (!closedList.includes(edge.adjacent) && !openList.includes(edge.adjacent)) {
        openList.push(edge.adjacent)

        const prevNodeG = searchTable[currentNode.id]?.g
        const g = prevNodeG ? prevNodeG + edge.weight : edge.weight
        const h = heuristic(edge.adjacent, endPos)
        const s = edge.adjacent.mue === -1 ? Number.MAX_VALUE : edge.adjacent.mue
        const f = g + h

        const prevF = searchTable[edge.adjacent.id]?.f
        if (prevF == undefined || f < prevF)
          searchTable[edge.adjacent.id] = {
            ...searchTable[edge.adjacent.id],
            g: g,
            f: f,
            prevNode: currentNode.id,
          }
      }
    })
    closedList.push(currentNode)
    const openListSearchTableEntries = openList.map((node) => {
      return { id: node.id, entry: searchTable[node.id] }
    })
    let entryWithLowestF = openListSearchTableEntries[0]

    openListSearchTableEntries.forEach((entry) => {
      if (
        entry.entry.f !== undefined &&
        entryWithLowestF.entry.f !== undefined &&
        entry.entry.f < entryWithLowestF.entry.f
      )
        entryWithLowestF = entry
    })
    const newCurrentNode = openList.find((node) => node.id === entryWithLowestF.id)
    openList = openList.filter((node) => node.id !== entryWithLowestF.id)
    if (openList.length == 0) {
      return null
    }
    if (newCurrentNode) currentNode = newCurrentNode
  }

  // console.log("searchTable: ", searchTable);

  const route = backtrackPath(currentNode, searchTable)
  console.log('route: ', route)

  return route
}

const backtrackPath = (endNode: Node, searchTable: SearchTable) => {
  let path = []
  let curNodeId: number | undefined = endNode.id
  path.push(curNodeId)
  while (curNodeId !== undefined && searchTable[curNodeId] && searchTable[curNodeId].prevNode !== undefined) {
    curNodeId = searchTable[curNodeId].prevNode
    path.push(curNodeId)
  }
  path.reverse()
  return path
}

export default run
