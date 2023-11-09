import { simulationService } from './simulationService'

const form = <HTMLFormElement>document.getElementById('simulation-form')

const simService = new simulationService()

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const options = simService.getSimOptions()
})
