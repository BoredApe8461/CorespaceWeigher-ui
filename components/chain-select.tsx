"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Chain, getChains } from "@/common/chaindata"
import { useChain } from "@/providers/chain-provider"
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  formatDistanceToNow,
} from "date-fns"

import { useRegisteredChains } from "@/hooks/use-registered-chains"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ChainSelect = ({
  onlyRegistered = false,
}: {
  onlyRegistered?: boolean
}) => {
  const { chain, setChain, network } = useChain()
  const { data: registeredChains, isLoading, isError } = useRegisteredChains()

  const [chains, setChains]: [Array<Chain>, any] = useState([])
  const [chainId, setChainId] = useState<number | undefined>(
    chain?.paraId ?? undefined
  )

  useEffect(() => {
    // Fetch chains based on the current network
    getChains(network).then((allChains) => {
      let filteredChains = allChains

      console.log("chains", allChains)

      // If onlyRegistered is true, further filter the chains to include only those that are registered
      if (onlyRegistered && registeredChains) {
        // filter chains to only include those that are registered on the current network i.e. relay and paraid are in the registeredChains array
        filteredChains = allChains.filter((chain) =>
          registeredChains.some(
            (regChain) =>
              regChain.relay_chain.toLowerCase() ===
                chain.relay?.id.toLowerCase() &&
              regChain.para_id === chain.paraId
          )
        )
      }

      setChains(filteredChains)
    })
  }, [network, registeredChains, onlyRegistered])

  return (
    <>
      <Select
        value={chainId ? chainId.toString() : undefined}
        onValueChange={(val) => {
          setChainId(Number(val))
          setChain(chains.find((c) => c.paraId === Number(val)))
        }}
      >
        <SelectTrigger className="h-14 w-[180px] text-left">
          <SelectValue placeholder="Select Chain" />
        </SelectTrigger>
        <SelectContent className="items-start !text-left">
          {chains.map((chain: Chain, index) => (
            <SelectItem
              value={chain.paraId ? chain.paraId.toString() : ""}
              key={chain.paraId}
              className="gap-2 text-left"
            >
              <Image
                src={chain.logo}
                alt="logo"
                width={32}
                height={32}
                className="mr-2 inline-block"
              />
              <span>{chain.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export default ChainSelect
