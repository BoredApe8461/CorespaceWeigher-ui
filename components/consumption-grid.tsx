"use client"

import { Dispatch, useEffect, useState } from "react"
import Image from "next/image"
import { Chain } from "@/common/chaindata"
import { Consumption } from "@/common/types"
import { useChain } from "@/providers/chain-provider"
import { ApiPromise } from "@polkadot/api"

import { Icons } from "./icons"

const ConsumptionGrid = () => {
  const { chain, api } = useChain()

  const [consumption, setConsumption]: [Consumption, Dispatch<Consumption>] =
    useState({ normal: 0, operational: 0, mandatory: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [blockNumber, setBlockNumber] = useState("")

  useEffect(() => {
    if (!api) {
      return
    }

    const interval = setInterval(() => {
      getConsumption(api)
    }, 2000)

    return () => clearInterval(interval)
  }, [api])

  useEffect(() => {
    setLoading(true)
  }, [chain])

  const getConsumption = async (api: any) => {
    if (!chain) {
      return
    }

    const weightLimit: any = api.consts.system.blockWeights.toJSON()

    const blockConsumption: any = (
      await api.query.system.blockWeight()
    ).toJSON()
    const blockNumber: any = (await api.query.system.number()).toHuman()

    const totalConsumption = getTotalConsumption(blockConsumption)
    const maxBlockRefTime = weightLimit.maxBlock.refTime
      ? weightLimit.maxBlock.refTime
      : weightLimit.maxBlock

    const normal =
      blockConsumption.normal.refTime !== undefined
        ? blockConsumption.normal.refTime
        : blockConsumption.normal
    const operational =
      blockConsumption.operational.refTime !== undefined
        ? blockConsumption.operational.refTime
        : blockConsumption.operational
    const mandatory =
      blockConsumption.mandatory.refTime !== undefined
        ? blockConsumption.mandatory.refTime
        : blockConsumption.mandatory

    let updatedConsumption: Consumption = {
      total:
        Number(
          parseFloat(
            (totalConsumption / maxBlockRefTime).toString()
          ).toPrecision(3)
        ) * 100,
      normal:
        Number(
          parseFloat((normal / maxBlockRefTime).toString()).toPrecision(3)
        ) * 100,
      operational:
        Number(
          parseFloat((operational / maxBlockRefTime).toString()).toPrecision(3)
        ) * 100,
      mandatory:
        Number(
          parseFloat((mandatory / maxBlockRefTime).toString()).toPrecision(3)
        ) * 100,
    }
    setLoading(false)
    setConsumption(updatedConsumption)
    setBlockNumber(blockNumber)
  }

  const getTotalConsumption = (blockConsumption: any) => {
    if (blockConsumption.mandatory.refTime) {
      return (
        blockConsumption.mandatory.refTime +
        blockConsumption.normal.refTime +
        blockConsumption.operational.refTime
      )
    } else {
      return (
        blockConsumption.mandatory +
        blockConsumption.normal +
        blockConsumption.operational
      )
    }
  }

  const getDispatchClassConsumption = (dispatchClass: string): number => {
    // @ts-ignore
    return consumption[dispatchClass.toLowerCase()].toString().substring(0, 4)
  }

  const data = [
    {
      title: "Normal",
      content: `Dispatches in this class represent normal user-triggered transactions. These types of dispatches only consume a portion of a block's total weight limit. Normal dispatches are sent to the transaction pool.`,
    },
    {
      title: "Operational",
      content: `Unlike normal dispatches, which represent usage of network capabilities, operational dispatches are those that provide network capabilities. Operational dispatches can consume the entire weight limit of a block.`,
    },
    {
      title: "Mandatory",
      content: `The mandatory dispatches are included in a block even if they cause the block to surpass its weight limit. This dispatch class is intended to represent functions that are part of the block validation process. `,
    },
  ]

  if (!chain) {
    return (
      <section className="">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-4 flex flex-col items-center text-sm text-gray-500 ">
            Select a chain to view block consumption
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="">
        <div className="mx-auto max-w-screen-xl">
          <div className=" mb-4 flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center h-14">
              {chain && (
                <Image
                  className="m-2"
                  src={chain?.logo}
                  alt=""
                  width="52"
                  height="52"
                />
              )}
              {chain?.name}
            </div>
            Total weight consumed at block #{blockNumber}
            {loading ? (
              <Icons.loading className="mt-2 h-12" />
            ) : (
              <h1 className="mt-2 h-12 text-3xl font-bold">
                {consumption.total.toString().substring(0, 4)}%
              </h1>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.map((card, index) => (
              <div
                key={index}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-5 flex items-center justify-between text-gray-500"></div>
                <h2 className="mb-2 text-gray-900 dark:text-white">
                  {card.title}
                </h2>
                <p className="flex-1 mb-5 text-sm font-light text-gray-500 dark:text-gray-400">
                  {card.content}
                </p>
                {loading ? (
                  <Icons.loading className="" />
                ) : (
                  <p className="font-bold">
                    {getDispatchClassConsumption(card.title)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default ConsumptionGrid
