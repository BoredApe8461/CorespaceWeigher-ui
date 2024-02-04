"use client"

import { useChain } from "@/providers/chain-provider"

import { useConsumption } from "@/hooks/use-consumption"

import ConsumptionChart from "./consumption-chart"
import { Skeleton } from "./ui/skeleton"

export function HistoricConsumption() {
  const { chain } = useChain()
  const {
    data: historicConsumption,
    isLoading,
    error,
    isFetching,
  } = useConsumption()

  if (isLoading || (chain && !historicConsumption)) {
    return (
      <Skeleton className="h-[500px] w-full rounded-sm flex justify-center items-center">
        Loading Chart
      </Skeleton>
    )
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  if (!chain) {
    return (
      <section className="">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-4 flex flex-col items-center text-sm text-gray-500 ">
            Select a chain to view historic consumption charts
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="history w-full">
      {historicConsumption && (
        <ConsumptionChart data={historicConsumption} grouping="day" />
      )}
      {/* <pre className="text-xs">
        {JSON.stringify(historicConsumption, null, 2)}
      </pre> */}
    </div>
  )
}
