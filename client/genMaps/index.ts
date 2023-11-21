import { generateRandomMaps } from '../../algo/graphGen.js'
import { convertGridsToJSONString, saveToFs } from '../save/saveService.js'

const mapsCountInput = <HTMLInputElement>document.getElementById('gernerate-maps-count-input')!
const generateMapsBtn = <HTMLButtonElement>document.getElementById('generate-maps-btn')!

generateMapsBtn.addEventListener('mouseup', () => {
  generateMapsBtn.disabled = true
  const maps = generateRandomMaps(Number(mapsCountInput.value))
  const jsonMaps = convertGridsToJSONString(maps)
  const timeStamp = new Date().toLocaleDateString()
  const mapsName = `${timeStamp}-generatedMaps-${mapsCountInput.value}`
  saveToFs(jsonMaps, mapsName)
  generateMapsBtn.disabled = false
})
