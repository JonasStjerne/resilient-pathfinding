import { drawGrid } from "../client/index.js";
import { Position } from "./AStarSearch.js";
import { makeGrid, setGrid } from "./grid.js";

class DrawingAgent {
    private _maxMoves;
    private _movesLeft;
    private _pos: Position;

    constructor(maxMoves: number, pos: Position) {
        this._maxMoves = maxMoves;
        this._movesLeft = maxMoves;
        this._pos = pos;
    }

    public get maxMoves(): number {
        return this._maxMoves;
    }

    public get movesLeft(): number {
        return this._movesLeft;
    }

    public get pos(): Position {
        return this._pos;
    }

    public reduceMoves() {
        this._movesLeft--;
    }

    public move(pos: Position) {
        this._pos = {x: pos.x, y: pos.y};
    }
}

export function generateOneGraph() {
    const newGrid = makeGrid();
    const nodeTypes = ["water"];
    const GRID_SIZE = 10;
    const DRAWING_AGENTS_NUMBER = 4;
    const MAX_MOVES = 14;
    
    const drawingAgents = new Array(DRAWING_AGENTS_NUMBER).fill(null).map(() => new DrawingAgent(MAX_MOVES, {x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE)}));
    while (drawingAgents.some(agent => agent.movesLeft > 0)) {
        drawingAgents.forEach(agent => {
            // Make move
            const edgesFromCurrentNode = newGrid[agent.pos.x][agent.pos.y].edges.length;
            const randomEdge = newGrid[agent.pos.x][agent.pos.y].edges[Math.floor(Math.random() * edgesFromCurrentNode)];
            agent.move({x: randomEdge.adjacent.x, y: randomEdge.adjacent.y});
            // Set node type to water
            newGrid[agent.pos.x][agent.pos.y].type = "water";
            agent.reduceMoves();
        });
    }
    
    setGrid(newGrid);
    drawGrid();
}