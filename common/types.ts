export type ConsumptionDatum = {
  block_number: number
  timestamp: number
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

export type Network = "polkadot" | "kusama"
