"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Chain, getChains } from "@/common/chaindata"
import { useChain } from "@/providers/chain-provider"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ChainSelect = () => {
  const { chain, setChain, network } = useChain()

  const [chains, setChains]: [Array<Chain>, any] = useState([])
  const [chainId, setChainId] = useState<number | undefined>(
    chain?.paraId ?? undefined
  )

  useEffect(() => {
    getChains(network).then((chains) => {
      setChains(chains)
    })
  }, [network])

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
