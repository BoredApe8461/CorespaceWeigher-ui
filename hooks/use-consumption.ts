import { Chain } from "@/common/chaindata"
import { ConsumptionDatum } from "@/common/types"
import { useChain } from "@/providers/chain-provider"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "react-query"

import { siteConfig } from "@/config/site"

export const useConsumption = () => {
  const { chain, network, api } = useChain()

  const chainId = chain?.paraId
  const endpoint = `${siteConfig.backendUrl}/consumption/${network}/${chainId}`

  return useQuery<ConsumptionDatum[], Error>({
    queryKey: ["consumption", network, chainId],
    enabled: !!chainId && !!network && !!api,
    queryFn: async () => {
      const res = await fetch(endpoint)
      if (!res.ok) {
        throw new Error("NotRegistered")
      }
      const consumption = await res.json()
      return consumption
    },
  })
}
