import search from '../../algo/AStarSearch.js'

import { simulateRoute } from '../../algo/Simulate.js'
import { Grid } from '../../algo/models/Grid.js'
import { Position } from '../../algo/models/Position.js'
import { trackTime } from '../../utils/telemetry.js'
import { endNode } from '../index.js'
import { GridJSON, recreateNodeCircularReference } from '../save/saveService.js'
import { SimulationOptions, Stats } from './models.js'

export class simulationService {
  static setLoadingState(percent: number, done: boolean) {
    const runningSpinner = <HTMLSpanElement>document.getElementById('sim-running-spinner')
    done ? runningSpinner.classList.add('d-none') : runningSpinner.classList.remove('d-none')
    const submitBtn = <HTMLInputElement>document.getElementById('run-sim')!
    submitBtn.disabled = done ? false : true

    const progressBar = <HTMLSpanElement>document.getElementById('sim-progress-bar')
    progressBar.hidden = done
    progressBar.style.width = `${percent.toString()}%`
  }

  static async runSimulation() {
    const options = await this.#getSimOptions()
    const statsByMap: Array<{ name: string; stats: Stats }> = []
    const globalStats: Stats = { comptime: 0, traveledDistance: 0, pushover: 0, successRate: 0 }

    for (let mapIndex = 0; mapIndex < options.maps.length; mapIndex++) {
      const startPos = this.#getStartOrEndPos(options.maps[mapIndex], 'start')
      const endPos = this.#getStartOrEndPos(options.maps[mapIndex], 'goal')
      const statsMap: Stats = { comptime: 0, traveledDistance: 0, pushover: 0, successRate: 0 }
      const { result: path, deltaTime } = trackTime(() =>
        search(startPos!, endPos!, options.maps[mapIndex], options.riskFactor, options.algoVersion),
      )
      for (let i = 0; i < options.runCount; i++) {
        path?.filter((nodeId) => nodeId)
        const simResult = simulateRoute(
          options.maps[mapIndex],
          path as number[],
          startPos!,
          endNode!,
          search,
          0.5,
          options.riskFactor,
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
        stats: { ...this.#getAverageStats(options.runCount, 1, statsMap) },
      })
      ;(Object.keys(globalStats) as Array<keyof Stats>).forEach((key) => {
        globalStats[key] += statsMap[key]
      })
    }

    const averageStats = this.#getAverageStats(options.runCount, options.maps.length, globalStats)
    this.#setStats(averageStats)
    return statsByMap
  }

  static async #getMaps() {
    const maps = await this.#getSaveFiles()
    return maps
  }

  static async #getSimOptions() {
    const algoVersion = <'v1' | 'v2'>(
      (<HTMLInputElement>document.querySelector('input[name="algo-version-sim"]:checked')).value
    )
    const riskFactor = Number((<HTMLInputElement>document.getElementById('risk-factor-sim')).value)
    const runCount = Number((<HTMLInputElement>document.getElementById('iteration-count')).value)

    const maps = <Grid[]>await this.#getMaps()

    const options: SimulationOptions = {
      maps,
      runCount,
      algoVersion,
      riskFactor,
    }
    return options
  }

  static #setStats(stats: Stats) {
    this.#setStat('comp-time', `${stats.comptime.toFixed(1)}ms`)
    this.#setStat('traveledDistance', `${stats.traveledDistance.toFixed(1)}m`)
    this.#setStat('pushover', `${(stats.pushover * 100).toFixed(0)}%`)
    this.#setStat('success-rate', `${(stats.successRate * 100).toFixed(0)}%`)
  }

  static #setStat(id: string, value: string) {
    ;(<HTMLHeadElement>document.getElementById(id)).innerHTML = value
  }

  static #getStartOrEndPos(grid: Grid, type: 'start' | 'goal'): Position | undefined {
    for (let col = 0; col < grid.length; col++) {
      for (let row = 0; row < grid.length; row++) {
        if (grid[col][row].type == type) {
          return { x: col, y: row }
        }
      }
    }
  }

  static #getAverageStat(runCount: number, mapsCount: number, value: number) {
    const average = value / (runCount * mapsCount)
    return average
  }

  static #getAverageStats(runCount: number, mapsCount: number, stats: Stats) {
    const averageStats: Stats = { comptime: 0, traveledDistance: 0, pushover: 0, successRate: 0 }
    ;(Object.keys(stats) as Array<keyof Stats>).forEach((key) => {
      averageStats[key] =
        key == 'traveledDistance'
          ? this.#getAverageStat(stats['successRate'], 1, stats[key])
          : (averageStats[key] = this.#getAverageStat(runCount, mapsCount, stats[key]))
    })

    return averageStats
  }

  static #getSaveFiles() {
    const input = <HTMLInputElement>document.getElementById('map-upload')
    if (input?.files && input.files.length > 0) {
      const file = input.files[0]
      if (file.type === 'application/json') {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()

          reader.onload = (e) => {
            const fileContent = e.target?.result as string
            const saves: Grid[] = []
            const dataJSON = <GridJSON[]>JSON.parse(fileContent)
            dataJSON.forEach((gridJSON) => {
              const grid = recreateNodeCircularReference(gridJSON)
              saves.push(grid)
            })
            resolve(saves)
          }

          reader.onerror = () => {
            reject(new Error('Error reading file'))
          }

          reader.readAsText(file)
        })
      } else {
        alert('Please select a JSON file.')
      }
    }
  }
}
