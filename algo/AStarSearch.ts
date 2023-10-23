import { Grid } from "./models/Grid";
import { Node } from "./models/Node";

export interface Position {
  x: number;
  y: number;
}

interface SearchTable {
  [index: number]: {
    g?: number;
    h?: number;
    f?: number;
    prevNode?: number;
  };
}

interface NodeIdAndDistanceTuple {
  id: number;
  distance: number | undefined;
}

const heuristic = (startPos: Position, endPos: Position): number => {
  return Math.abs(endPos.x - startPos.x) + Math.abs(endPos.y - startPos.y);
}

const search = (startPos: Position, endPos: Position, graph: Grid, riskFactor?: number) => {
  console.log("Calculating with risk factor: " + riskFactor)
  const searchTable: SearchTable = {};
  let openList: Array<Node> = [];
  const closedList: Array<Node> = [];
  let currentNode = graph[startPos.x][startPos.y];
  let destinationNode = graph[endPos.x][endPos.y];
  const h = heuristic(startPos, endPos);
  const f = h;
  const legalMoveNodeTypes = ["road", "start", "goal"];

  while (currentNode !== destinationNode) {
    currentNode.edges.forEach(edge => {
      if (!legalMoveNodeTypes.includes(edge.adjacent.type)) return;
      if (!closedList.includes(edge.adjacent) && !openList.includes(edge.adjacent)) {
        openList.push(edge.adjacent);
        const prevNodeG = searchTable[currentNode.id]?.g;
        const g = prevNodeG ? prevNodeG + edge.weight : edge.weight;
        const h = heuristic(edge.adjacent, endPos);
        const f = g + h;
        const prevF = searchTable[edge.adjacent.id]?.f;
        if (!prevF || f < prevF)
          searchTable[edge.adjacent.id] = { ...searchTable[edge.adjacent.id], g: g, f: f, prevNode: currentNode.id };
      }
    });
    closedList.push(currentNode);
    const openListSearchTableEntries = openList.map(node => { return { id: node.id, entry: searchTable[node.id] } });
    let entryWithLowestF = openListSearchTableEntries[0];

    openListSearchTableEntries.forEach(entry => {
      if (entry.entry.f && entryWithLowestF.entry.f && entry.entry.f < entryWithLowestF.entry.f)
        entryWithLowestF = entry;
    })
    const newCurrentNode = openList.find(node => node.id === entryWithLowestF.id);
    openList = openList.filter(node => node.id !== entryWithLowestF.id);

    if (newCurrentNode) currentNode = newCurrentNode;
  }
  return backtrackPath(currentNode, searchTable);
};

const backtrackPath = (endNode: Node, searchTable: SearchTable) => {
  let path = [];
  let curNodeId: number | undefined = endNode.id;
  path.push(curNodeId);
  while (curNodeId !== undefined && searchTable[curNodeId] && searchTable[curNodeId].prevNode !== undefined) {
    curNodeId = searchTable[curNodeId].prevNode;
    path.push(curNodeId);
  }
  path = path.reverse();
  return path;
}

export default search;
