import { grid } from '../../algo/grid.js'
import { SimulationOptions, Stats } from './models.js'

export class simulationService {
  static getSimOptions() {
    const algoVersion = <'v0.1' | 'v0.2'>(
      (<HTMLInputElement>document.querySelector('input[name="algo-version"]:checked')).value
    )
    const riskFactor = Number((<HTMLInputElement>document.getElementById('risk-factor-sim')).value)
    const runCount = Number((<HTMLInputElement>document.getElementById('iteration-count')).value)

    const maps = this.#getMap()

    const options: SimulationOptions = {
      maps,
      runCount,
      algoVersion,
      riskFactor,
    }
    return options
  }

  static #getMap() {
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
}
