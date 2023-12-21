import { options } from './models'
import { prompt } from './utils/prompt.js'

export const runCli = async () => {
  const options: options = {}

  options['runType'] = await prompt<'Algorithm simulation' | 'TSP evaluation'>({
    name: 'runType',
    type: 'list',
    message: 'What do you want to run?',
    defaultOption: 'Algorithm simulation',
    choices: ['Algorithm simulation', 'TSP evaluation'],
  })

  if (options['runType'] == 'TSP evaluation') {
    return options
  }
  options['mapPoolFileName'] = await prompt<string>({
    name: 'mapPoolFileName',
    type: 'input',
    message: 'What is the path to the map pool?',
    defaultOption: 'test.gzip',
  })

  options['algoVersion'] = await prompt<'v1' | 'v2' | 'v2.1'>({
    name: 'algoVersion',
    type: 'list',
    message: 'Choose algorithm version to use',
    defaultOption: 'v2.1',
    choices: ['v1', 'v2', 'v2.1'],
  })

  if (options['algoVersion'] == 'v2' || options['algoVersion'] == 'v2.1') {
    options['riskFactor'] = await prompt<number>({
      name: 'riskFactor',
      type: 'number',
      message: 'Choose Risk Factor (0-1)',
      defaultOption: 0,
    })
  }

  options['iterationCount'] = await prompt<number>({
    name: 'iterationCount',
    type: 'number',
    message: 'How many times should the simulation run on EACH map?',
    defaultOption: 100,
  })

  return options
}
