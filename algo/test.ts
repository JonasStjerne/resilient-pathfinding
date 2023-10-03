import { board } from "./board";

const grid = new board(10, 10);

// change some random nodes to blocked
for (let i = 0; i < 10; i++){
    const x = Math.floor(Math.random() * grid.width);
    const y = Math.floor(Math.random() * grid.height);
    const node = grid.getNodeAt(x, y);
    node.updateType("blocked");
}

// change random nodes to danger
for (let i = 0; i < 10; i++){
    const x = Math.floor(Math.random() * grid.width);
    const y = Math.floor(Math.random() * grid.height);
    const node = grid.getNodeAt(x, y);
    node.updateType("danger");
}

// Update safety scores
// Danger nodes will have a safety score of 0
// Nodes neighboring danger nodes will have a safety score of 1
// Nodes neighboring nodes with safety score of 1 will have a safety score of 2 and etc.
for (let x = 0; x < grid.width; x++){
    for (let y = 0; y < grid.height; y++){
        const node = grid.getNodeAt(x, y);
        if (node.type === "danger"){
            node.updateSafetyScore(0);
        } else {
            let safetyScore = Number.MAX_VALUE;
            for (let i = 0; i < grid.width; i++){
                for (let j = 0; j < grid.height; j++){
                    const otherNode = grid.getNodeAt(i, j);
                    if (otherNode.type === "danger"){
                        const xDiff = Math.abs(x - i);
                        const yDiff = Math.abs(y - j);
                        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
                        if (distance < safetyScore){
                            safetyScore = distance;
                        }
                    }
                }
            }
            node.updateSafetyScore(safetyScore);
        }
    }
}

// Show in console using chars
for (let y = 0; y < 10; y++){
    let line = "";
    for (let x = 0; x < 10; x++){
        const node = grid.getNodeAt(x, y);
        line += node.type ==="blocked" ? "#" : node.type === "danger" ? "!" : ".";
    }
    console.log(line);
}