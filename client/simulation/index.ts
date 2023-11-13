import { drawBarPlot } from './graphs.js'
import { simulationService } from './simulationService.js'

const form = <HTMLFormElement>document.getElementById('simulation-form')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  simulationService.setLoadingState(0, false)
  simulationService.runSimulation()
  simulationService.setLoadingState(0, true)
})

drawBarPlot()
