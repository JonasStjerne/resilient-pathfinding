import { options } from './models'
import { prompt } from './utils/prompt.js'

export const runCli = async () => {
  const options: options = {}

  options['mapPoolFileName'] = await prompt<string>({
    name: 'mapPoolFileName',
    type: 'input',
    message: 'What is the path to the map pool?',
    defaultOption: 'my-maps.gzip',
  })

  options['algoVersion'] = await prompt<'v1' | 'v2'>({
    name: 'algoVersion',
    type: 'list',
    message: 'Choose algorithm version to use',
    defaultOption: 'v2',
    choices: ['v1', 'v2'],
  })

  if (options['algoVersion'] == 'v2') {
    options['riskFactor'] = await prompt<number>({
      name: 'riskFactor',
      type: 'list',
      message: 'Choose Risk Factor',
      choices: ['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'],
    })
  }

  options['iterationCount'] = await prompt<number>({
    name: 'iterationCount',
    type: 'number',
    message: 'How many times should the simulation run on EACH map?',
    defaultOption: 10,
  })

  return options
}
