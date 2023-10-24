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

const heuristic = (startPos: Position, endPos: Position): number => {
  return Math.abs(endPos.x - startPos.x) + Math.abs(endPos.y - startPos.y);
};

const search = (
  startPos: Position,
  endPos: Position,
  graph: Grid,
  riskTradeoff?: number
) => {
  const searchTable: SearchTable = {};
  graph.forEach((graphRow) =>
    graphRow.forEach((graphCol) => {
      if (["road", "start", "goal"].includes(graphCol.type))
        searchTable[graphCol.id] = {};
    })
  );

  // tradeoff between risk and distance
  // 0 = only risk (take the safest path)
  // 1 = only distance (take the shortest path)
  const w = riskTradeoff ? riskTradeoff : 0.5;

  let openList: Array<Node> = [];
  const closedList: Array<Node> = [];
  let currentNode = graph[startPos.x][startPos.y];
  let destinationNode = graph[endPos.x][endPos.y];
  const legalMoveNodeTypes = ["road", "start", "goal"];

  while (currentNode !== destinationNode) {
    currentNode.edges.forEach((edge) => {
      if (!legalMoveNodeTypes.includes(edge.adjacent.type)) return;
      if (
        !closedList.includes(edge.adjacent) &&
        !openList.includes(edge.adjacent)
      ) {
        openList.push(edge.adjacent);

        const prevNodeG = searchTable[currentNode.id]?.g;
        const g = prevNodeG ? prevNodeG + edge.weight : edge.weight;
        const h = heuristic(edge.adjacent, endPos);
        //const f = g + w * h + (1 - w) * edge.adjacent.mue;
        //const f = g + (w * h + w * (1 - edge.adjacent.mue));
        //const f = g * w + h * (1 - w) + edge.adjacent.mue;
        //const f = g * w + h * (1 - w) * (1 - edge.adjacent.mue);

        //const f = g * w + h + (1 - w) * edge.adjacent.mue;
        const f = g * w + h - (1 - w) * edge.adjacent.mue;

        // console.log(`Node (${edge.adjacent.x}, ${edge.adjacent.y}): f = ${f}`);

        const prevF = searchTable[edge.adjacent.id]?.f;
        if (!prevF || f < prevF)
          searchTable[edge.adjacent.id] = {
            ...searchTable[edge.adjacent.id],
            g: g,
            f: f,
            prevNode: currentNode.id,
          };
      }
    });
    closedList.push(currentNode);
    const openListSearchTableEntries = openList.map((node) => {
      return { id: node.id, entry: searchTable[node.id] };
    });
    let entryWithLowestF = openListSearchTableEntries[0];

    openListSearchTableEntries.forEach((entry) => {
      if (
        typeof entry.entry.f !== "undefined" &&
        typeof entryWithLowestF.entry.f !== "undefined" &&
        entry.entry.f < entryWithLowestF.entry.f
      )
        entryWithLowestF = entry;
    });
    const newCurrentNode = openList.find(
      (node) => node.id === entryWithLowestF.id
    );
    openList = openList.filter((node) => node.id !== entryWithLowestF.id);

    if (newCurrentNode) currentNode = newCurrentNode;
  }

  // console.log("searchTable: ", searchTable);

  const route = backtrackPath(currentNode, searchTable);
  console.log("route: ", route);

  return route;
};

const backtrackPath = (endNode: Node, searchTable: SearchTable) => {
  let path = [];
  let curNodeId: number | undefined = endNode.id;
  path.push(curNodeId);
  while (
    curNodeId !== undefined &&
    searchTable[curNodeId] &&
    searchTable[curNodeId].prevNode !== undefined
  ) {
    curNodeId = searchTable[curNodeId].prevNode;
    path.push(curNodeId);
  }
  path = path.reverse();
  return path;
};

export default search;
