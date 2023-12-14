import inquirer from 'inquirer'
import { options } from '../models'

export const prompt = async <optionType>(promptOptions: {
  name: keyof options
  type: 'input' | 'confirm' | 'checkbox' | 'list' | 'number'
  message: string
  defaultOption?: optionType
  choices?: (inquirer.Separator | { name: string })[] | string[]
}) => {
  const { name, type, message, defaultOption, choices } = promptOptions
  const result = await inquirer.prompt<{ [name: string]: optionType }>({
    name: name,
    type: type,
    message: message,
    default: defaultOption,
    choices,
  })

  return result[name]
}
