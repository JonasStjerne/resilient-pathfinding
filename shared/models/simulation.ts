export type Stats = {
  comptime: number
  traveledDistance: number
  pushover: number
  successRate: number
}

export type StatsByMap = {
  name: string
  stats: Stats
}[]

export type Results = {
  statsGlobal: Stats
  statsByMap: StatsByMap
}
