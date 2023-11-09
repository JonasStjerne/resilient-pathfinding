import { simulationService } from './simulationService'

const form = <HTMLFormElement>document.getElementById('simulation-form')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const options = simulationService.getSimOptions()
  //   simService.run(options)
})
