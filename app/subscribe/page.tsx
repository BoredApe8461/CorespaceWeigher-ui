"use client"

import {
  SubstrateChain,
  useBalance,
  useInkathon,
} from "@scio-labs/use-inkathon"

import { useRegisteredChains } from "@/hooks/use-registered-chains"
import ChainSelect from "@/components/chain-select"
import NetworkSelect from "@/components/network-select"

export default function SubscribePage() {
  const {
    accounts,
    activeAccount,
    activeChain,
    activeExtension,
    activeSigner,
    setActiveAccount,
    api,
    isConnected,
    switchActiveChain,
    isConnecting,
  } = useInkathon()

  const { freeBalance } = useBalance(activeAccount?.address, true)

  const { data: registeredChains } = useRegisteredChains()

  return (
    <section className="">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-white">
            Register a Parachain
          </h2>
          <p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
            Some Subtitle on what users can do here
          </p>
        </div>

        <div>{JSON.stringify(registeredChains, null, 2)}</div>

        <div>
          accounts: {accounts?.map((account) => account.address).join(", ")}
          <br />
          activeAccount: {activeAccount?.address}
          <br />
          activeChain: {activeChain?.name}
          <br />
          activeExtension: {activeExtension?.name}
          <br />
          <br />
          isConnected: {isConnected ? "true" : "false"}
          <br />
          isConnecting: {isConnecting ? "true" : "false"}
          <br />
        </div>

        <div className="mb-4 flex gap-4 justify-center">
          <NetworkSelect />
          <ChainSelect />
        </div>
      </div>
    </section>
  )
}
