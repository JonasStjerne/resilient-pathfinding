import { drawDisturbance, drawGrid } from "../client/index.js";
import { Position } from "./AStarSearch.js";
import { addDisturbance, makeGrid, setGrid } from "./grid.js";

interface Size {
    width: number;
    height: number
}

enum Direction {
    TOP = "top",
    RIGHT = "right",
    BOTTOM = "bottom",
    LEFT = "left",
    TOP_LEFT = "top-left",
    TOP_RIGHT = "top-right",
    BOTTOM_LEFT = "bottom-left",
    BOTTOM_RIGHT = "bottom-right"
}

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
        this._pos = { x: pos.x, y: pos.y };
    }
}

class DisturbanceChunk {
    private _position: Position;
    private _size: Size;
    private _direction: Direction;

    constructor(position: Position, size: Size, direction: Direction) {
        this._position = position;
        this._size = size;
        this._direction = direction
    }

    public get position() {
        return this._position;
    }

    public get size() {
        return this._size;
    }

    public get direction() {
        return this._direction;
    }
}

// good maps
// grid size 100
// drawing agents 15
// max moves 500
export function generateOneGraph() {
    const GRID_SIZE = 100;
    const newGrid = makeGrid(GRID_SIZE);
    // const nodeTypes = ["water"];
    const DRAWING_AGENTS_NUMBER = 15;
    const MAX_MOVES = 500;

    // Generate water
    const drawingAgents = new Array(DRAWING_AGENTS_NUMBER).fill(null).map(() => new DrawingAgent(MAX_MOVES, { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }));
    while (drawingAgents.some(agent => agent.movesLeft > 0)) {
        drawingAgents.forEach(agent => {
            // Make move
            const edgesFromCurrentNode = newGrid[agent.pos.x][agent.pos.y].edges.length;
            const randomEdge = newGrid[agent.pos.x][agent.pos.y].edges[Math.floor(Math.random() * edgesFromCurrentNode)];
            agent.move({ x: randomEdge.adjacent.x, y: randomEdge.adjacent.y });
            // Set node type to water
            newGrid[agent.pos.x][agent.pos.y].type = "water";
            agent.reduceMoves();
        });
    }

    // Generate disturbances
    // Chunk grid into wind directions (not every node is in a chunk)
    const MIN_CHUNK_WIDTH_HEIGHT = 30;
    const MAX_CHUNK_WIDTH_HEIGHT = 50;
    const AMOUNT_OF_CHUNKS = 5;
    const directionValues = Object.values(Direction).filter(dir => !dir.includes("-"));
    const chunks = new Array(AMOUNT_OF_CHUNKS).fill(null).map(() => {
        const randX = Math.floor(Math.random() * GRID_SIZE);
        const randY = Math.floor(Math.random() * GRID_SIZE);
        let randWidth = Math.floor(Math.random() * (MAX_CHUNK_WIDTH_HEIGHT - MIN_CHUNK_WIDTH_HEIGHT + 1) + MIN_CHUNK_WIDTH_HEIGHT);
        let randHeight = Math.floor(Math.random() * (MAX_CHUNK_WIDTH_HEIGHT - MIN_CHUNK_WIDTH_HEIGHT + 1) + MIN_CHUNK_WIDTH_HEIGHT);

        if (randX + randWidth > GRID_SIZE - 1) {
            randWidth = randWidth - ((randX + randWidth) - GRID_SIZE);
        }
        if (randY + randHeight > GRID_SIZE - 1) {
            randHeight = randHeight - ((randY + randHeight) - GRID_SIZE);
        }

        // TODO REMOVE THROWS
        if (randX < 0) throw new Error("x < 0");
        if (randY < 0) throw new Error("y < 0");
        if (randWidth < 0) throw new Error("randWidth < 0");
        if (randHeight < 0) throw new Error("randHeight < 0");

        const randomDirection = directionValues[Math.floor(Math.random() * directionValues.length)];

        return new DisturbanceChunk({ x: randX, y: randY }, { width: randWidth, height: randHeight }, randomDirection);
    });

    // console.log(chunks);
    
    
    setGrid(newGrid);
    // console.log("ROAD nodes: ", newGrid.flat().filter(node => node.type === "road").length);
    // console.log("WATER nodes: ", newGrid.flat().filter(node => node.type === "water").length);
    drawGrid();
    // JUST FOR VISUALIZATION PURPOSES PICK COLOR FOR EACH CHUNK AND FILL ON MAP
    // const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
    // const cellSize = canvas.width / GRID_SIZE;
    // const ctx = canvas.getContext("2d")!;
    // const CHUNK_COLORS = ["60, 59, 156, ", "187, 34, 204, ", "187, 34, 51, ", "170, 153, 34, ", "170, 238, 34, "];
    // chunks.forEach((chunk, index) => {
    //     ctx.beginPath();
    //     ctx.fillStyle = `rgba(${(CHUNK_COLORS[index] + "0.75")})`; // Set the fill color
    //     ctx.fillRect(chunk.position.x * cellSize , chunk.position.y * cellSize, chunk.size.width * cellSize, chunk.size.height * cellSize);
    // })

    // For each chunk, based on chunk direction iterate over array and create disturbances (for now only cardinal)
    // Left
    // <---------------X
    // <---------------X
    // <---------------X
    // <---------------X
    // <---------------X

    // Bottom
    // XXXXXXXXXXXXXXXX
    // ||||||||||||||||
    // ||||||||||||||||
    // ||||||||||||||||
    // ||||||||||||||||
    // \/\/\/\/\/\/\/\/

    // Right
    // X--------------->
    // X--------------->
    // X--------------->
    // X--------------->
    // X--------------->

    // Top
    // /\/\/\/\/\/\/\/\
    // ||||||||||||||||
    // ||||||||||||||||
    // ||||||||||||||||
    // ||||||||||||||||
    // XXXXXXXXXXXXXXXX

    const CHUNK_ARROW_COLORS = {
        "top": "rgb(60, 59, 156)",
        "left": "rgb(187, 34, 204)", 
        "bottom": "rgb(187, 34, 51)", 
        "right": "rgb(170, 153, 34)",
        "top-left": "rgb()",
        "bottom-left": "rgb()",
        "bottom-right": "rgb()",
        "top-right": "rgb()",
    };

    chunks.forEach(chunk => {
        const dir = chunk.direction;
        if (dir === Direction.LEFT) {
            for (let x = chunk.position.x + chunk.size.width - 1; x > chunk.position.x; x--) {
                for (let y = chunk.position.y + chunk.size.height - 1; y >= chunk.position.y; y--) {
                    addDisturbance(newGrid[x][y], newGrid[x-1][y]);
                    drawDisturbance(newGrid[x][y], newGrid[x-1][y], CHUNK_ARROW_COLORS[chunk.direction]);
                }
            }
        } else if (dir === Direction.RIGHT) {
            for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width -1; x++) {
                for (let y = chunk.position.y; y < chunk.position.y + chunk.size.height; y++) { 
                    addDisturbance(newGrid[x][y], newGrid[x+1][y]);
                    drawDisturbance(newGrid[x][y], newGrid[x+1][y], CHUNK_ARROW_COLORS[chunk.direction]);
                }
            }
        } else if (dir === Direction.BOTTOM) {
            for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width; x++) {
                for (let y = chunk.position.y; y < chunk.position.y + chunk.size.height -1; y++) { 
                    addDisturbance(newGrid[x][y], newGrid[x][y+1]);
                    drawDisturbance(newGrid[x][y], newGrid[x][y+1], CHUNK_ARROW_COLORS[chunk.direction]);
                }
            }
        } else if (dir === Direction.TOP) {
            for (let x = chunk.position.x; x < chunk.position.x + chunk.size.width; x++) {
                for (let y = chunk.position.y + chunk.size.height -1; y > chunk.position.y; y--) { 
                    addDisturbance(newGrid[x][y], newGrid[x][y-1]);
                    drawDisturbance(newGrid[x][y], newGrid[x][y-1], CHUNK_ARROW_COLORS[chunk.direction]);
                }
            }
        }
    })
}