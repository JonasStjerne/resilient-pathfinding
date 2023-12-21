#! /usr/bin/env node
import { runCli } from './cli.js'
import { options } from './models'
import { evalResults } from './services/TspEval.js'
import { FileService } from './services/fileService.js'
import { SimulationService } from './services/simulationService.js'

export let projectRootPath: string

const main = async () => {
  const options = await runCli()
  if (options.runType == 'Algorithm simulation') {
    console.info('Running simulations... This may take a little while.')
    const results = await runSimulations(options)
    console.info(results.statsGlobal)
  } else {
    runTspEvaluation()
    console.log('Finished evaluating TSP')
  }
}

const runSimulations = async (options: options) => {
  const simulationService = new SimulationService(options)
  const results = await simulationService.runSimulation()
  FileService.saveResults(results, options)
  return results
}

const runTspEvaluation = () => {
  const results = evalResults()
  FileService.saveResults(results)
  return results
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
