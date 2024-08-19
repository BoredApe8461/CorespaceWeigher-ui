"use client"

import { Network } from "@/common/types"
import { useChain } from "@/providers/chain-provider"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Icons } from "./icons"

const NetworkSelect = () => {
  const { network, setNetwork } = useChain()

  return (
    <Select onValueChange={(val: Network) => setNetwork(val)} value={network}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="polkadot">
          <Icons.polkadot
            width={30}
            height={30}
            className="mr-2 inline-block"
          />
          <span>Polkadot</span>
        </SelectItem>
        <SelectItem value="kusama">
          <Icons.kusama width={30} height={30} className="mr-2 inline-block" />
          <span>Kusama</span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default NetworkSelect
