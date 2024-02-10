import ChainSelect from "@/components/chain-select"
import { HistoricConsumption } from "@/components/historic-consumption"
import NetworkSelect from "@/components/network-select"
import { TooltipTitle } from "@/components/tooltip-title"

export default async function HistoryPage() {
  return (
    <section className="">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-white">
            Historic Consumption
          </h2>
          <p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
            <TooltipTitle />
          </p>
        </div>
        <div className="mb-4 flex gap-4 justify-center">
          <NetworkSelect />
          <ChainSelect onlyRegistered={true} />
        </div>
        <HistoricConsumption />
      </div>
    </section>
  )
}
