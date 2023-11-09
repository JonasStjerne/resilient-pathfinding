import { Grid } from '../../algo/models/Grid'

export type SimulationOptions = v01Algo | v02Algo

type SimulationOptionsBase = {
  maps: Grid[]
  runCount: number
}

type v01Algo = SimulationOptionsBase & {
  algoVersion: 'v0.1'
}

type v02Algo = SimulationOptionsBase & {
  algoVersion: 'v0.2'
  riskFactor: number
}

export type Stats = {
  comptime: number
  traveledDistance: number
  pushover: number
  successRate: number
}
