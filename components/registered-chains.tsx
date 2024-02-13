"use client"

import * as React from "react"

import Image from "next/image"
import { Chain, getChains } from "@/common/chaindata"
import { useRegisteredChains } from "@/hooks/use-registered-chains";
import { useEffect, useState } from "react";


export function RegisteredChains() {
  const { data: registeredChains, isLoading, isError } = useRegisteredChains();
  const [chains, setChains]: [Array<Chain>, any] = useState([]);

  useEffect(() => {
    getRegisteredChains();
  }, [registeredChains])

  const getRegisteredChains = async () => {
    if(!registeredChains) return;

    // Fetch chains based on the current network
    const polkadotChains = await getChains("polkadot");
    const kusamaChains = await getChains("kusama");

    console.log(kusamaChains);

    let registered = polkadotChains.concat(kusamaChains).filter((chain) =>
        registeredChains.some(
          (regChain) =>
            regChain.relay_chain.toLowerCase() ===
              chain.relay?.id.toLowerCase() &&
            regChain.para_id === chain.paraId
        ));
    
    setChains(registered);
  }

  return (
    <div> 
        <h3 className="text-xl text-center">Registered chains:</h3>
        <div className="flex justify-center">
            {chains.map((chain) => (
                <Image className="m-6" src={chain.logo} alt={chain.name} width="50" height="50" />
            ))}
        </div>
    </div>
  )
}
