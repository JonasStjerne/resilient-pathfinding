import fs from 'fs-extra'
import { Grid } from '../../../algo/models/Grid.js'
import { GridJSON, recreateNodeCircularReference } from '../../../client/save/saveService.js'
import { Results } from '../../../shared/models'
import { PROCESS_PATH } from '../utils'

export class FileService {
  static async getMaps(filename: string) {
    const fileContent = fs.readFileSync(`${PROCESS_PATH}/${filename}`)
    const stream = new Blob([new Uint8Array(fileContent)], { type: 'application/x-gzip' }).stream()
    const compressedReadableStream = stream.pipeThrough(new DecompressionStream('gzip'))
    const compressedResponse = new Response(compressedReadableStream)

    const blob = await compressedResponse.blob()
    const result: Grid[] = []
    const dataJson = <GridJSON[]>JSON.parse(await blob.text())
    dataJson.forEach((dataJson) => {
      const grid = recreateNodeCircularReference(dataJson)
      result.push(grid)
    })
    return result
  }

  static async saveResults(results: Results) {
    const savesDir = `${PROCESS_PATH}/saves`
    if (!fs.existsSync(savesDir)) {
      fs.emptyDirSync(savesDir)
    }
    const content = JSON.stringify(results)
    const stream = new Blob([content], { type: 'application/x-gzip' }).stream()

    const compressedReadableStream = stream.pipeThrough(new CompressionStream('gzip'))
    const compressedResponse = new Response(compressedReadableStream)
    const blob = await compressedResponse.blob()

    const fileName = new Date().toLocaleTimeString()
    fs.writeFile(`${savesDir}/${fileName}.gzip`, blob.toString())
  }
}
