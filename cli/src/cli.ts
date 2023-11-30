import { options } from './models'
import { prompt } from './utils'

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

  options['riskFactor'] = await prompt<number>({
    name: 'riskFactor',
    type: 'list',
    message: 'Choose algorithm version to use',
    defaultOption: 0.5,
    choices: new Array(10).map((el, index) => index.toString()),
  })

  options['iterationCount'] = await prompt<number>({
    name: 'iterationCount',
    type: 'number',
    message: 'How many times should the simulation run on EACH map?',
    defaultOption: 10,
  })

  return options
}
