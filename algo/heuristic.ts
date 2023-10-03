function manhattan(xDiff: number, yDiff: number) {
    return xDiff + yDiff;
}

function euclidean(xDiff: number, yDiff: number) {
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

export { manhattan, euclidean };