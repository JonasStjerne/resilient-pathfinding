import { createBarPlot } from './graphs.js'
import { Stats } from './models.js'
import { simulationService } from './simulationService.js'

const form = <HTMLFormElement>document.getElementById('simulation-form')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  simulationService.setLoadingState(0, false)
  setTimeout(() => {
    const result = simulationService.runSimulation()
    simulationService.setLoadingState(0, true)
    createBarPlot(result)
  }, 50)
})
const data: Array<{ name: string; stats: Stats }> = [
  { name: 'Category A', stats: { comptime: 10, traveledDistance: 20, pushover: 5, successRate: 0.8 } },
  { name: 'Category B', stats: { comptime: 15, traveledDistance: 25, pushover: 8, successRate: 0.6 } },
  // Add more data as needed
]
