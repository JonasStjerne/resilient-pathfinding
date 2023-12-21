import search from '../../../algo/AStarSearch.js'
import { Position, simulateRoute } from '../../../algo/Simulate.js'
import { Grid } from '../../../algo/models/Grid.js'
import { Stats } from '../../../shared/models'
import { options } from '../models/index.js'
import { trackTime } from '../utils/index.js'
import { FileService } from './fileService.js'

export class SimulationService {
  private _iterationCount
  private _algoVersion
  private _mapPoolFileName
  private _riskFactor

  constructor(options: options) {
    this._iterationCount = options.iterationCount!
    this._algoVersion = options.algoVersion!
    this._mapPoolFileName = options.mapPoolFileName!
    this._riskFactor = options.riskFactor!
  }

  async runSimulation() {
    const maps = await FileService.getMaps(this._mapPoolFileName!)
    const statsByMap: Array<{ name: string; stats: Stats }> = []
    const globalStats: Stats = { comptime: 0, traveledDistance: 0, pushover: 0, successRate: 0 }

    for (let mapIndex = 0; mapIndex < maps.length; mapIndex++) {
      console.log('Running simulation on map ' + (mapIndex + 1) + '/' + maps.length)
      const startPos = this.#getStartOrEndPos(maps[mapIndex], 'start')
      const endPos = this.#getStartOrEndPos(maps[mapIndex], 'goal')
      const statsMap: Stats = { comptime: 0, traveledDistance: 0, pushover: 0, successRate: 0 }
      const { result: path, deltaTime } = trackTime(() =>
        search(startPos!, endPos!, maps[mapIndex], this._riskFactor, this._algoVersion),
      )
      for (let i = 0; i < this._iterationCount; i++) {
        console.log('Running simulation iteration ' + (i + 1) + '/' + this._iterationCount + ' on map ' + mapIndex)
        path?.filter((nodeId) => nodeId)
        const simResult = simulateRoute(
          maps[mapIndex],
          path as number[],
          startPos!,
          endPos!,
          search,
          0.2,
          this._riskFactor,
          this._algoVersion,
        )

        statsMap.pushover += simResult.distTaken / (simResult.distTouched ? simResult.distTouched : 1)
        statsMap.comptime += deltaTime
        simResult.didReachGoal ? statsMap.successRate++ : null

        //If we reach the goal, calculate the distance of the path (could be different for same route because of disturbance pushovers)
        if (simResult.didReachGoal) {
          simResult.pathtaken.forEach((node, index, path) => {
            if (index < path.length - 1) {
              const possibleMoves = [...node.edges, ...node.distEdges]
              statsMap.traveledDistance += possibleMoves.find((edge) => edge.adjacent.id == path[index + 1].id)!.weight
            }
          })
        }
      }
      statsByMap.push({
        name: mapIndex.toString(),
        stats: { ...this.#getAverageStats(this._iterationCount, 1, statsMap) },
      })
      ;(Object.keys(globalStats) as Array<keyof Stats>).forEach((key) => {
        globalStats[key] += statsMap[key]
      })
    }

    const statsGlobal = this.#getAverageStats(this._iterationCount, maps.length, globalStats)
    return { statsGlobal, statsByMap }
  }

  #getStartOrEndPos(grid: Grid, type: 'start' | 'goal'): Position | undefined {
    for (let col = 0; col < grid.length; col++) {
      for (let row = 0; row < grid.length; row++) {
        if (grid[col][row].type == type) {
          return { x: col, y: row }
        }
      }
    }
  }

  #getAverageStat(runCount: number, mapsCount: number, value: number) {
    const average = value / (runCount * mapsCount)
    return average
  }

  #getAverageStats(runCount: number, mapsCount: number, stats: Stats) {
    const averageStats: Stats = { comptime: 0, traveledDistance: 0, pushover: 0, successRate: 0 }
    ;(Object.keys(stats) as Array<keyof Stats>).forEach((key) => {
      averageStats[key] =
        key == 'traveledDistance'
          ? this.#getAverageStat(stats['successRate'], 1, stats[key])
          : (averageStats[key] = this.#getAverageStat(runCount, mapsCount, stats[key]))
    })

    return averageStats
  }
}
