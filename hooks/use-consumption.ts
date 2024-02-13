import { ConsumptionDatum, DateRange } from "@/common/types"
import { useChain } from "@/providers/chain-provider"
import { useQuery } from "react-query"

import { siteConfig } from "@/config/site"

export const useConsumption = ({
  range,
  start,
  end,
  page,
  pageSize,
  grouping,
}: {
  range: DateRange
  start?: Date
  end?: Date
  page?: number
  pageSize?: number
  grouping?: string //used instead of range when provided
}) => {
  const { chain, network, api } = useChain()

  // Convert Date objects to Unix timestamp strings
  const startTimestamp = start?.getTime().toString()
  const endTimestamp = end?.getTime().toString()

  const desiredGrouping = grouping
    ? grouping
    : siteConfig.rangeGroupingMap[range]
  const chainId = chain?.paraId

  // Use URLSearchParams to construct query parameters with conditional values
  const params = new URLSearchParams({
    grouping: desiredGrouping,
    ...(start !== undefined && { start: startTimestamp }),
    ...(end !== undefined && { end: endTimestamp }),
    ...(page !== undefined && { page: page.toString() }),
    ...(pageSize !== undefined && { page_size: pageSize.toString() }),
  })

  // Construct the endpoint URL with query parameters
  const endpoint = `${
    siteConfig.backendUrl
  }/consumption/${network}/${chainId}?${params.toString()}`

  return useQuery<ConsumptionDatum[], Error>({
    queryKey: [
      "consumption",
      network,
      chainId,
      range,
      startTimestamp,
      endTimestamp,
      page,
      pageSize,
    ],
    enabled: !!(chainId !== null) && !!network && !!api && !!range,
    queryFn: async () => {
      const res = await fetch(endpoint)

      if (!res.ok) {
        // When not ok, throw an error to be caught by React Query error handling
        throw new Error("Network response was not ok")
      }

      const consumption = await res.json()
      return consumption
    },
    retry: false,
  })
}

export const useEarliestConsumption = () => {
  // make use of the useConsumption hook to get the earliest consumption
  // for the current chain
  return useConsumption({
    range: "day",
    pageSize: 1,
    page: 0,
    grouping: "minute",
  })
}
