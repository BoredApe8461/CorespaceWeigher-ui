"use client"

import { useEffect, useState } from "react"
import { ApiPromise, WsProvider } from '@polkadot/api';
import ChainSelect from "../components/ChainSelect";
import { Typography } from "@mui/material";
import Image from "next/image";
import { Chain } from "@/chaindata";

export default function Home() {
  const [consumption, setConsumption] = useState(0);
  const [blockNumber, setBlockNumber] = useState("");
  const [chain, setChain]: [any, any] = useState(null);
  const [api, setApi]: [any, any] = useState(null);

  useEffect(() => {
    if(!api) {
      createApi();
    }

    if(!api) {
      return;
    }

    const interval = setInterval(() => {
      getConsumption(api);
    }, 2000);

    return () => clearInterval(interval);

  }, [api]);

  const createApi = async () => { 
    const wsProvider = new WsProvider('wss://moonbeam.public.blastapi.io');
    const api = await ApiPromise.create({provider: wsProvider});

    setApi(api);
  }

  const getConsumption = async (api: any) => {
    const name = await api.rpc.system.chain();
    console.log(name.toHuman());

    const weightLimit: any = api.consts.system.blockWeights.toJSON();
    console.log(weightLimit);

    const blockConsumption: any = (await api.query.system.blockWeight()).toJSON();
    const blockNumber: any = (await api.query.system.number()).toHuman();
    const totalConsumption = blockConsumption.mandatory.refTime + blockConsumption.normal.refTime + blockConsumption.operational.refTime;
    console.log(totalConsumption / weightLimit.maxBlock.refTime);

    setConsumption(Number(parseFloat((totalConsumption / weightLimit.maxBlock.refTime).toString()).toPrecision(3)) * 100);
    setBlockNumber(blockNumber);
  }

  const handleChainChanged = async (chain: Chain) => {
    setChain(chain);
    const wsProvider = new WsProvider(chain.rpcs[0].url);
    const api = await ApiPromise.create({provider: wsProvider});

    setApi(api);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-betweenr p-24">
      {chain&& 
        <div className="flex items-center">
          <Image className="m-5" src={chain.logo} alt="" width="52" height="52" />
          <Typography variant="h2">
            {chain.name}
          </Typography>
        </div>
      }
      <h1 className="text-3xl">Weight consumed by block #{blockNumber}:</h1>
      <br />
      <h1 className="text-3xl">{consumption.toString().substring(0, 4)}%</h1>

      <div className="p-24">
        <ChainSelect setChain={handleChainChanged}/>
      </div>
    </main>
  )
}
