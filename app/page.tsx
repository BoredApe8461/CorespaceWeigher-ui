"use client"

import { useEffect, useState } from "react"
import { ApiPromise, WsProvider } from '@polkadot/api';
import ChainSelect from "../components/ChainSelect";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import Image from "next/image";
import { Chain } from "@/chaindata";
import CircularProgress from '@mui/material/CircularProgress';

type Consumption = {
  normal: number,
  operational: number,
  mandatory: number,
  total: number,
};

export default function Home() {
  const [consumption, setConsumption]: [Consumption, any] = useState({ normal: 0, operational: 0, mandatory: 0, total: 0 });
  const [blockNumber, setBlockNumber] = useState("");
  const [chain, setChain]: [any, any] = useState(null);
  const [api, setApi]: [any, any] = useState(null);
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
    if(paraId !== chain.paraId) {
      return;
    }

    const weightLimit: any = api.consts.system.blockWeights.toJSON();

    const blockConsumption: any = (await api.query.system.blockWeight()).toJSON();
    const blockNumber: any = (await api.query.system.number()).toHuman();
    const totalConsumption = blockConsumption.mandatory.refTime + blockConsumption.normal.refTime + blockConsumption.operational.refTime;

    let updatedConsumption: Consumption = {
      total: Number(parseFloat((totalConsumption / weightLimit.maxBlock.refTime).toString()).toPrecision(3)) * 100,
      normal: Number(parseFloat((blockConsumption.normal.refTime / weightLimit.maxBlock.refTime).toString()).toPrecision(3)) * 100,
      operational: Number(parseFloat((blockConsumption.operational.refTime / weightLimit.maxBlock.refTime).toString()).toPrecision(3)) * 100,
      mandatory: Number(parseFloat((blockConsumption.mandatory.refTime / weightLimit.maxBlock.refTime).toString()).toPrecision(3)) * 100,
    } 
    setLoading(false);
    setConsumption(updatedConsumption);
    setBlockNumber(blockNumber);
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

  const getDispatchClassConsumption = (dispatchClass: string): number => {
    // @ts-ignore
    return consumption[dispatchClass.toLowerCase()].toString().substring(0, 4);
  }

  const data = [
    { 
      title: 'Normal', 
      content: `Dispatches in this class represent normal user-triggered transactions. These types of dispatches only consume a portion of a block's total weight limit. Normal dispatches are sent to the transaction pool.`
    },
    { 
      title: 'Operational',
      content: `Unlike normal dispatches, which represent usage of network capabilities, operational dispatches are those that provide network capabilities. Operational dispatches can consume the entire weight limit of a block.` 
    },
    { 
      title: 'Mandatory', 
      content: `The mandatory dispatches are included in a block even if they cause the block to surpass its weight limit. This dispatch class is intended to represent functions that are part of the block validation process. ` 
    },
  ];

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
            <CircularProgress color="primary" size={52} />
            :
            <>
              <h2 className="text-3xl mt-2">Weight consumed by block #{blockNumber}:</h2>
                <br />

              <Grid className="mt-6" container spacing={2}>
              {data.map((card, index) => (
                <Grid item xs={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {card.title}
                      </Typography>
                      <Typography className="mt-6" variant="body2">
                        {card.content}
                      </Typography>
                      <Typography className="mt-6" variant="body1">
                        {getDispatchClassConsumption(card.title)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <h1 className="text-3xl mt-6">Total: {consumption.total.toString().substring(0, 4)}%</h1>
            </>
          }
      </>
      }

      <div className="p-12">
        <ChainSelect setChain={handleChainChanged}/>
      </div>
    </main>
  )
}
