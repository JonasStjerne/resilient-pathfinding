import { HeuristicFunction } from '../heuristic'
import { Grid } from '../models/Grid'
import { Node } from '../models/Node'
import { Position } from '../models/Position'

interface SearchTable {
  [index: number]: {
    g: number
    h: number
    f: number
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
  cutoff: number = 8,
  drawLists = false,
) => {
  // Diagonal distance
  const gridMaxSize = Math.sqrt(graph.length * graph.length + graph[0].length * graph[0].length)

  const searchTable: SearchTable = {}
  graph.forEach((col) =>
    col.forEach((node) => {
      if (['road', 'start', 'goal'].includes(node.type)) {
        const h = heuristic({ x: node.x, y: node.y }, endPos)
        const g = 0
        const f = g + h
        searchTable[node.id] = { h, g, f }
      }
    }),
  )

  let openList: Array<Node> = []
  const closedList: Array<Node> = []
  let currentNode = graph[startPos.x][startPos.y]
  const destinationNode = graph[endPos.x][endPos.y]
  const legalMoveNodeTypes = ['road', 'start', 'goal']
  openList.push(currentNode)

  while (openList.length > 0) {
    let entryWithLowestF = searchTable[openList[0].id]
    currentNode = openList[0]
    openList.forEach((node) => {
      const entry = searchTable[node.id]
      if (entry.f < entryWithLowestF.f) {
        entryWithLowestF = entry
        currentNode = node
      }
    })
    if (currentNode == destinationNode) {
      return backtrackPath(currentNode, searchTable)
    }
    openList = openList.filter((node) => node.id !== currentNode.id)
    closedList.push(currentNode)

    //Add connected nodes to openlist if they are not already in open or closed list
    currentNode.edges.forEach((edge) => {
      const neighbor = edge.adjacent
      if (!legalMoveNodeTypes.includes(neighbor.type)) return
      if (closedList.includes(neighbor)) return

      const currentNodeEntry = searchTable[currentNode.id]
      const neighborNodeEntry = searchTable[neighbor.id]

      const g = currentNodeEntry.g + edge.weight + penalization(neighbor.mue, gridMaxSize, cutoff)
      const h = neighborNodeEntry.h
      const f = g + h

      if (!openList.includes(neighbor) || g < neighborNodeEntry.g) {
        neighborNodeEntry.prevNode = currentNode.id
        neighborNodeEntry.g = g
        neighborNodeEntry.f = f

        if (!openList.includes(neighbor)) {
          openList.push(neighbor)
        } else {
        }
      }
      // const prevF = searchTable[neighbor.id].f
      // if (f < prevF)
      //   searchTable[neighbor.id] = {
      //     h,
      //     g,
      //     f,
      //     prevNode: currentNode.id,
      //   }
    })
    // closedList.push(currentNode)
    // openList.filter((node) => node.id !== currentNode.id)

    // openList = openList.filter((node) => node !== currentNode)
  }
  return null

  // const canvas = <HTMLCanvasElement>document.getElementById('canvas')!
  // const ctx = canvas.getContext('2d')!
  // const gridSize = graph.length
  // ctx.lineWidth = 2

  // if (drawLists) {
  //   const openListToDraw = openList.filter((node) => !route.includes(node.id))
  //   openListToDraw.forEach((node) => {
  //     ctx.strokeStyle = '#57fa57' // Set fill color to color
  //     const cellSize = canvas.width / gridSize
  //     ctx.beginPath()
  //     // Top border
  //     let fromX = node.x * cellSize
  //     let fromY = node.y * cellSize
  //     let toX = node.x * cellSize + cellSize
  //     let toY = node.y * cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()

  //     //Left border
  //     fromX = node.x * cellSize
  //     fromY = node.y * cellSize
  //     toX = node.x * cellSize
  //     toY = node.y * cellSize + cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()

  //     // Bottom border
  //     fromX = node.x * cellSize
  //     fromY = node.y * cellSize + cellSize
  //     toX = node.x * cellSize + cellSize
  //     toY = node.y * cellSize + cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()

  //     // Right border
  //     fromX = node.x * cellSize + cellSize
  //     fromY = node.y * cellSize + cellSize
  //     toX = node.x * cellSize + cellSize
  //     toY = node.y * cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()
  //   })

  //   const closedListToDraw = closedList.filter((node) => !route.includes(node.id))
  //   closedListToDraw.forEach((node) => {
  //     ctx.strokeStyle = '#9e1515' // Set fill color to color
  //     const cellSize = canvas.width / gridSize
  //     ctx.beginPath()
  //     // Top border
  //     let fromX = node.x * cellSize
  //     let fromY = node.y * cellSize
  //     let toX = node.x * cellSize + cellSize
  //     let toY = node.y * cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()

  //     // Left border
  //     fromX = node.x * cellSize
  //     fromY = node.y * cellSize
  //     toX = node.x * cellSize
  //     toY = node.y * cellSize + cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()

  //     // Bottom border
  //     fromX = node.x * cellSize
  //     fromY = node.y * cellSize + cellSize
  //     toX = node.x * cellSize + cellSize
  //     toY = node.y * cellSize + cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()

  //     // Right border
  //     fromX = node.x * cellSize + cellSize
  //     fromY = node.y * cellSize + cellSize
  //     toX = node.x * cellSize + cellSize
  //     toY = node.y * cellSize
  //     ctx.moveTo(fromX, fromY)
  //     ctx.lineTo(toX, toY)
  //     ctx.stroke()
  //   })
  // }
  // return route
}

const backtrackPath = (endNode: Node, searchTable: SearchTable) => {
  let path: number[] = []
  let curNodeId: number | undefined = endNode.id
  path.push(curNodeId)
  while (curNodeId !== undefined && searchTable[curNodeId] && searchTable[curNodeId].prevNode !== undefined) {
    curNodeId = searchTable[curNodeId].prevNode!
    path.push(curNodeId)
  }
  path.reverse()
  return path
}

const penalization = (robustness: number, gridMaxSize: number, cutoff: number) => {
  const scale = 10
  const realCutoff = Math.min(robustness, 100)

  // Apply a logarithmic penalization function, normalized by the grid size
  const normalizedPenalization = Math.log(realCutoff - cutoff) / Math.log(gridMaxSize)
  const alternative = cutoff === 0 ? 0 : 2 * Math.pow(0.2, robustness - cutoff)
  return alternative
}

export default search

interface NodeWithFGH extends Node {
  f: number
  g: number
  h: number
}
