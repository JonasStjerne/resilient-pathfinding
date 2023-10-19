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
  //const w = riskTradeoff ? riskTradeoff : 0.5;
  const w = 0.4;

  let openList: Array<Node> = [];
  const closedList: Array<Node> = [];
  let currentNode = graph[startPos.x][startPos.y];
  let destinationNode = graph[endPos.x][endPos.y];
  let ctr = 0; // Protection against endless loop

  while (currentNode !== destinationNode && ctr != 200) {
    const edgesFromCurrentNode = currentNode.edges.filter((ne) =>
      ["road", "start", "goal"].includes(ne.adjacent.type)
    );
    edgesFromCurrentNode.forEach((edge) => {
      if (
        !closedList.includes(edge.adjacent) &&
        !openList.includes(edge.adjacent)
      ) {
        openList.push(edge.adjacent);

        const prevNodeG = searchTable[currentNode.id]?.g;
        const g = prevNodeG ? prevNodeG + edge.weight : edge.weight;
        const h = manhattan(
          edge.adjacent.x,
          endPos.x,
          edge.adjacent.y,
          endPos.y
        );
        //const f = g + w * h + (1 - w) * edge.adjacent.mue;
        //const f = g + (w * h + w * (1 - edge.adjacent.mue));
        //const f = g * w + h * (1 - w) + edge.adjacent.mue;
        //const f = g * w + h * (1 - w) * (1 - edge.adjacent.mue);

        //const f = g * w + h + (1 - w) * edge.adjacent.mue;
        const f = g * w + h - (1 - w) * edge.adjacent.mue;

        console.log(`Node (${edge.adjacent.x}, ${edge.adjacent.y}): f = ${f}`);

        const prevF = searchTable[edge.adjacent.id]?.f;
        if (!prevF || f < prevF) {
          searchTable[edge.adjacent.id] = {
            ...searchTable[edge.adjacent.id],
            g: g,
            f: f,
            prevNode: currentNode.id,
          };
        }
      }
    });
    // add current vertex to closed
    closedList.push(currentNode);
    const openListNodesIds = openList.map((node) => node.id);
    const openListNodesFValues: Array<NodeIdAndDistanceTuple> =
      openListNodesIds.map((nodeId) => {
        return { id: nodeId, distance: searchTable[nodeId].f };
      });
    const nodeWithLowestFValue = openListNodesFValues.reduce(
      (minTuple, currentTuple) => {
        // Compare the second elements of the current tuple and the minimum tuple found so far
        if (
          currentTuple.distance &&
          minTuple.distance &&
          currentTuple.distance < minTuple.distance
        ) {
          return currentTuple;
        } else {
          return minTuple;
        }
      },
      openListNodesFValues[0]
    ); // Initialize with the first tuple
    // console.log(nodeWithLowestFValue);
    const newCurrentNode = openList.find(
      (node) => node.id === nodeWithLowestFValue.id
    );
    openList = openList.filter((node) => node.id !== nodeWithLowestFValue.id);

    if (newCurrentNode) currentNode = newCurrentNode;
    ctr++;
  }
  // console.log(searchTable)

  // construct path backwards
  let path = [];
  let curNodeId: number | undefined = currentNode.id;
  path.push(curNodeId);
  while (typeof curNodeId !== "undefined" && searchTable[curNodeId].prevNode) {
    curNodeId = searchTable[curNodeId].prevNode;
    path.push(curNodeId);
  }
  path.push(graph[startPos.x][startPos.y].id);
  // reverse path and log
  path = path.reverse();
  return path;
};

function manhattan(
  ajdX: number,
  endX: number,
  adjY: number,
  endY: number
): number {
  return Math.abs(ajdX - endX) + Math.abs(adjY - endY);
}

export default search;
