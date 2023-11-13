import search, { Position } from '../../algo/AStarSearch.js'
import { results, simulateRoute } from '../../algo/Simulate.js'
import { grid } from '../../algo/grid.js'
import { Grid } from '../../algo/models/Grid.js'
import { endNode } from '../index.js'
import { SimulationOptions, Stats } from './models.js'

export class simulationService {
  static getSimOptions() {
    const algoVersion = <'v0.1' | 'v0.2'>(
      (<HTMLInputElement>document.querySelector('input[name="algo-version"]:checked')).value
    )
    const riskFactor = Number((<HTMLInputElement>document.getElementById('risk-factor-sim')).value)
    const runCount = Number((<HTMLInputElement>document.getElementById('iteration-count')).value)

    const maps = this.#getMaps()

    const options: SimulationOptions = {
      maps,
      runCount,
      algoVersion,
      riskFactor,
    }
    return options
  }

  static #getMaps() {
    //Todo: hook up to save service when working with file system
    return [grid]
  }

  static setStats(stats: Stats) {
    this.#setStat('comp-time', stats.comptime)
    this.#setStat('traveledDistance', stats.traveledDistance)
    this.#setStat('pushover', stats.pushover)
    this.#setStat('success-rate', stats.successRate)
  }

  static #setStat(id: string, value: number) {
    ;(<HTMLHeadElement>document.getElementById(id)).innerHTML = value.toString()
  }

  static setLoadingState(percent: number, done: boolean) {
    const runningSpinner = <HTMLSpanElement>document.getElementById('sim-running-spinner')
    if (done) {
      runningSpinner.classList.add('d-none')
    }
    {
      runningSpinner.classList.remove('d-none')
    }

    const progressBar = <HTMLSpanElement>document.getElementById('sim-progress-bar')
    progressBar.hidden = done
    progressBar.style.width = `${percent.toString()}%`
  }

  static runSimulation() {
    const options = this.getSimOptions()
    const maps = this.#getMaps()
    const simResults: results[] = []
    for (let i = 0; i < options.runCount; i++) {
      const startPos = this.#getStartOrEndPos(maps[i], 'start')
      const endPos = this.#getStartOrEndPos(maps[i], 'goal')
      if (options.algoVersion == 'v0.2') {
        const path = search(startPos!, endPos!, maps[i], options.riskFactor)
        path.filter((nodeId) => nodeId)
        const simResult = simulateRoute(maps[i], path as number[], startPos!, endNode!, search, 0.5, options.riskFactor)
        simResults.push(simResult)
      }
    }
    console.log(simResults)
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
}
