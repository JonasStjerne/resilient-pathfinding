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

const search = (
  startPos: Position,
  endPos: Position,
  graph: Grid,
  // tradeoff between risk and distance
  // 0 = only risk (take the safest path)
  // 1 = only distance (take the shortest path)
  heuristic: HeuristicFunction,
  w: number = 0.5,
  drawLists = false,
) => {
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
        //const f = g + w * h + (1 - w) * edge.adjacent.mue;
        //const f = g + (w * h + w * (1 - edge.adjacent.mue));
        //const f = g * w + h * (1 - w) + edge.adjacent.mue;
        //const f = g * w + h * (1 - w) * (1 - edge.adjacent.mue);

        //const f = g * w + h + (1 - w) * edge.adjacent.mue;
        const f = g * w + h - (1 - w) * s

        // console.log(`Node (${edge.adjacent.x}, ${edge.adjacent.y}): f = ${f}`);

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
    if (openList.length == 0) {
      return null
    }
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
    if (newCurrentNode) currentNode = newCurrentNode
  }

  const route = backtrackPath(currentNode, searchTable)

  const canvas = <HTMLCanvasElement>document.getElementById('canvas')!
  const ctx = canvas.getContext('2d')!
  const gridSize = graph.length
  ctx.lineWidth = 2

  if (drawLists) {
    const openListToDraw = openList.filter((node) => !route.includes(node.id))
    openListToDraw.forEach((node) => {
      ctx.strokeStyle = '#57fa57' // Set fill color to color
      const cellSize = canvas.width / gridSize
      ctx.beginPath()
      // Top border
      let fromX = node.x * cellSize
      let fromY = node.y * cellSize
      let toX = node.x * cellSize + cellSize
      let toY = node.y * cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      //Left border
      fromX = node.x * cellSize
      fromY = node.y * cellSize
      toX = node.x * cellSize
      toY = node.y * cellSize + cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      // Bottom border
      fromX = node.x * cellSize
      fromY = node.y * cellSize + cellSize
      toX = node.x * cellSize + cellSize
      toY = node.y * cellSize + cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      // Right border
      fromX = node.x * cellSize + cellSize
      fromY = node.y * cellSize + cellSize
      toX = node.x * cellSize + cellSize
      toY = node.y * cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()
    })

    const closedListToDraw = closedList.filter((node) => !route.includes(node.id))
    closedListToDraw.forEach((node) => {
      ctx.strokeStyle = '#9e1515' // Set fill color to color
      const cellSize = canvas.width / gridSize
      ctx.beginPath()
      // Top border
      let fromX = node.x * cellSize
      let fromY = node.y * cellSize
      let toX = node.x * cellSize + cellSize
      let toY = node.y * cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      // Left border
      fromX = node.x * cellSize
      fromY = node.y * cellSize
      toX = node.x * cellSize
      toY = node.y * cellSize + cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      // Bottom border
      fromX = node.x * cellSize
      fromY = node.y * cellSize + cellSize
      toX = node.x * cellSize + cellSize
      toY = node.y * cellSize + cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()

      // Right border
      fromX = node.x * cellSize + cellSize
      fromY = node.y * cellSize + cellSize
      toX = node.x * cellSize + cellSize
      toY = node.y * cellSize
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
      ctx.stroke()
    })
  }
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

export default search
