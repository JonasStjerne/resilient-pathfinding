import { Grid } from '../../algo/models/Grid'

export type SimulationOptions = SimulationOptionsBase

type SimulationOptionsBase = {
  algoVersion: 'v1' | 'v2'
  maps: Grid[]
  runCount: number
  riskFactor: number
}

// type v01Algo = SimulationOptionsBase & {
//   algoVersion: 'v1'
// }

// type v02Algo = SimulationOptionsBase & {
//   algoVersion: 'v2'
//   riskFactor: number
// }

export type Stats = {
  comptime: number
  traveledDistance: number
  pushover: number
  successRate: number
}
