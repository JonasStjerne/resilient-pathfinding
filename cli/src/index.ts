#! /usr/bin/env node
import { runCli } from './cli.js'
import { options } from './models'
import { FileService } from './services/fileService.js'
import { SimulationService } from './services/simulationService.js'

export let projectRootPath: string

const main = async () => {
  const options = await runCli()
  console.info('Running simulations... This may take a little while.')
  const results = await runSimulations(options)
  console.info(results.statsGlobal)
}

const runSimulations = async (options: options) => {
  const simulationService = new SimulationService(options)
  const results = await simulationService.runSimulation()
  FileService.saveResults(results, options)
  return results
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
