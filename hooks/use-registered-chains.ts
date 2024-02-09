import { Network } from "@/common/types"
import { useQuery } from "react-query"

import { siteConfig } from "@/config/site"

export type TypeRegisteredChainQuery = {
  name: string
  rpcs: string[]
  para_id: number
  relay_chain: Network
  expiry_timestamp: Date
}[]

export function useRegisteredChains() {
  const endpoint = `${siteConfig.backendUrl}/registry`

  return useQuery<TypeRegisteredChainQuery, Error>({
    queryKey: "registeredChains",
    queryFn: async () => {
      const res = await fetch(endpoint)
      if (!res.ok) {
        throw new Error("Network response was not ok")
      }
      return res.json()
    },
  })
}
