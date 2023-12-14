import fs from 'fs-extra'
import zlib from 'zlib'
import { Grid } from '../../../algo/models/Grid'
import { Results } from '../../../shared/models'
import { options } from '../models'
import { PKG_ROOT } from '../utils/consts.js'
import { GridJSON, recreateNodeCircularReference } from './saveService.js'

export class FileService {
  static async getMaps(filename: string) {
    const fileContent = fs.readFileSync(`${PKG_ROOT}maps/${filename}`)
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

  static async saveResults(results: Results, options: options) {
    const savesDir = `${PKG_ROOT}/results`
    if (!fs.existsSync(savesDir)) {
      fs.emptyDirSync(savesDir)
    }
    const content = JSON.stringify(results.statsByMap)
    const fileName = new Date().toLocaleTimeString()
    fs.writeFile(
      `${savesDir}/${fileName}_${options.algoVersion}${options.algoVersion == 'v2' ? '_ri' + options.riskFactor : ''}_${
        options.iterationCount
      }_byMaps.json`,
      content,
    )

    const contentGlobal = JSON.stringify(results.statsGlobal)
    fs.writeFile(
      `${savesDir}/${fileName}_${options.algoVersion}${options.algoVersion == 'v2' ? '_ri' + options.riskFactor : ''}_${
        options.iterationCount
      }_global.json`,
      contentGlobal,
    )
    // zlib.gzip(content, (err, compressedData) => {
    //   if (err) {
    //     console.error('Error compressing JSON data:', err)
    //     return
    //   }

    //   const fileName = new Date().toLocaleTimeString()
    //   fs.writeFile(`${savesDir}/${fileName}.gzip`, compressedData)
    // })
  }
}
