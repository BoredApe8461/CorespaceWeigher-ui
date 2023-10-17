"use client"

import { Dispatch, useEffect, useState } from "react"
import { ApiPromise, WsProvider } from '@polkadot/api';
import ChainSelect from "../components/ChainSelect";
import NetworkSelect from "../components/NetworkSelect";
import { Typography } from "@mui/material";
import Image from "next/image";
import { Chain } from "@/common/chaindata";
import CircularProgress from '@mui/material/CircularProgress';
import { Consumption } from "@/common/types";
import ConsumptionGrid from "@/components/ConsumptionGrid";

export default function Home() {
  const [consumption, setConsumption]: [Consumption, Dispatch<Consumption>] = useState({ normal: 0, operational: 0, mandatory: 0, total: 0 });
  const [blockNumber, setBlockNumber] = useState("");
  const [chain, setChain]: [Chain | null, Dispatch<Chain | null>] = useState<Chain | null>(null);
  const [network, setNetwork] = useState("polkadot");
  const [api, setApi]: [ApiPromise | null,  Dispatch<ApiPromise | null>] = useState<ApiPromise | null>(null);
  const [loading, setLoading]= useState(true);

  useEffect(() => {
    if(!api) {
      return;
    }

    const interval = setInterval(() => {
      getConsumption(api);
    }, 2000);

    return () => clearInterval(interval);

  }, [api]);

  const getConsumption = async (api: any) => {
    const paraId = (await api.query.parachainInfo.parachainId()).toJSON();
    console.log(paraId);
    if(!chain || paraId !== chain.paraId) {
      return;
    }

    const weightLimit: any = api.consts.system.blockWeights.toJSON();

    const blockConsumption: any = (await api.query.system.blockWeight()).toJSON();
    const blockNumber: any = (await api.query.system.number()).toHuman();

    const totalConsumption = getTotalConsumption(blockConsumption);
    const maxBlockRefTime = weightLimit.maxBlock.refTime? weightLimit.maxBlock.refTime : weightLimit.maxBlock;

    const normal = blockConsumption.normal.refTime !== undefined ? blockConsumption.normal.refTime : blockConsumption.normal;
    const operational = blockConsumption.operational.refTime !== undefined? blockConsumption.operational.refTime : blockConsumption.operational;
    const mandatory = blockConsumption.mandatory.refTime !== undefined? blockConsumption.mandatory.refTime : blockConsumption.mandatory;

    let updatedConsumption: Consumption = {
      total: Number(parseFloat((totalConsumption / maxBlockRefTime).toString()).toPrecision(3)) * 100,
      normal: Number(parseFloat((normal / maxBlockRefTime).toString()).toPrecision(3)) * 100,
      operational: Number(parseFloat((operational / maxBlockRefTime).toString()).toPrecision(3)) * 100,
      mandatory: Number(parseFloat((mandatory / maxBlockRefTime).toString()).toPrecision(3)) * 100,
    } 
    setLoading(false);
    setConsumption(updatedConsumption);
    setBlockNumber(blockNumber);
  }

  const getTotalConsumption = (blockConsumption: any) => {
    if(blockConsumption.mandatory.refTime) {
      return blockConsumption.mandatory.refTime + blockConsumption.normal.refTime + blockConsumption.operational.refTime; 
    }else {
      return blockConsumption.mandatory + blockConsumption.normal + blockConsumption.operational; 
    }
  }

  const handleChainChanged = async (_chain: Chain) => {
    setLoading(true);
    setChain(_chain);

    createApi(_chain);
  }

  const createApi = async(_chain: Chain) => {
    const wsProvider = new WsProvider(_chain.rpcs[0].url);
    const api = await ApiPromise.create({provider: wsProvider});
    setApi(api);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-betweenr p-12">
      {chain&& 
        <>
          <div className="flex items-center">
            <Image className="m-5" src={chain.logo} alt="" width="52" height="52" />
            <Typography variant="h2">
              {chain.name}
            </Typography>
          </div>
          {loading?
            <CircularProgress color="primary" size={32} />
            :
            <ConsumptionGrid consumption={consumption} blockNumber={blockNumber}/>
          }
      </>
      }

      <div className="p-12 flex items-center">
        <ChainSelect setChain={handleChainChanged} network={network}/>
        <NetworkSelect setNetwork={setNetwork} network={network}/>
      </div>
    </main>
  )
}
