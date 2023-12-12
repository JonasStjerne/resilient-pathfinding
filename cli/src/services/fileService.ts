import fs from 'fs-extra'
import zlib from 'zlib'
import { Grid } from '../../../algo/models/Grid'
import { Results } from '../../../shared/models'
import { PROCESS_PATH } from '../utils/consts.js'
import { GridJSON, recreateNodeCircularReference } from './saveService.js'

export class FileService {
  static async getMaps(filename: string) {
    const fileContent = fs.readFileSync(`${PROCESS_PATH}/${filename}`)
    //  const test = fs.createReadStream(`${PROCESS_PATH}/${filename}`).pipe(zlib.createGunzip());
    const result = await new Promise((resolve, reject) => {
      zlib.gunzip(fileContent, (err, uncompressedData) => {
        if (err) {
          reject(new Error('Error decompressing gzip file:' + err))
        }
        // Parse the uncompressed data as JSON
        try {
          const maps: Grid[] = []
          const jsonData = <GridJSON[]>JSON.parse(uncompressedData.toString())
          jsonData.forEach((gridJSON) => {
            const grid = recreateNodeCircularReference(gridJSON)
            maps.push(grid)
          })
          resolve(maps)
        } catch (jsonError) {
          reject(new Error('Error parsing JSON:' + jsonError))
        }
      })
    })
    return result as Grid[]
  }

  static async saveResults(results: Results) {
    const savesDir = `${PROCESS_PATH}/saves`
    if (!fs.existsSync(savesDir)) {
      fs.emptyDirSync(savesDir)
    }
    const content = JSON.stringify(results)
    zlib.gzip(content, (err, compressedData) => {
      if (err) {
        console.error('Error compressing JSON data:', err)
        return
      }

      const fileName = new Date().toLocaleTimeString()
      fs.writeFile(`${savesDir}/${fileName}.gzip`, compressedData)
    })
  }
}
