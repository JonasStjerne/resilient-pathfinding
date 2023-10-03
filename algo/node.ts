type nodeType = "normal"|"danger"|"blocked"

class node{
    x: number;
    y: number;
    type: nodeType;
    safetyScore: number;

    constructor(x:number,y:number,type: nodeType = "normal"){
        this.type = type;
        this.x = x;
        this.y = y;
        this.safetyScore = Number.MAX_VALUE
    }

    updateSafetyScore(safetyScore: number): void {
        this.safetyScore = safetyScore;
    }

    updateType(type: nodeType): void {
        this.type = type;
    }

    canVisit(): boolean {
        return this.type === "normal";
    }
}

export { node };