export type ConsumptionDatum = {
  group: string
  ref_time: {
    normal: number
    operational: number
    mandatory: number
  }
  proof_size: {
    normal: number
    operational: number
    mandatory: number
  }
  count: number
}

export type ConsumptionDataSeries = {
  label: string
  data: ConsumptionDatum[]
}

export type Consumption = {
  normal: number
  operational: number
  mandatory: number
  total: number
}

export type DataDisplay = "ref_time" | "proof_size" | "both"

export type Network = "polkadot" | "kusama"
export type DateRange = "day" | "week" | "month" | "year" | "all"
export type Grouping = "day" | "minute" | "week" | "month" | "year"
