"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useChain } from "@/providers/chain-provider"
import { bnToBn } from "@polkadot/util"
import { formatBalance, useBalance, useInkathon } from "@scio-labs/use-inkathon"
import { toast } from "sonner"

import { siteConfig } from "@/config/site"
import { uppercaseFirstLetter } from "@/lib/utils"
import { useRegisteredChains } from "@/hooks/use-registered-chains"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import ChainSelect from "@/components/chain-select"
import { ConnectButton } from "@/components/connect-button"
import NetworkSelect from "@/components/network-select"

import { registerWithServer } from "./post-tx"
import { subscribeTx } from "./subscribe-tx"

type ChainStatus = {
  registered: boolean
  expiryInDays?: number | undefined
}

export default function SubscribePage() {
  const { activeAccount, api, isConnected } = useInkathon()
  const { tokenDecimals, freeBalance } = useBalance(
    activeAccount?.address,
    true
  )

  const { chain: selectedChain, network: selectedNetwork } = useChain()
  const { data: registeredChains, isLoading, isError } = useRegisteredChains()

  const [chainStatus, setChainStatus] = useState<ChainStatus>({
    registered: false,
    expiryInDays: undefined,
  })

  function getTimeLeft(expiryTimestamp: string): number | undefined {
    const expiry = new Date(parseInt(expiryTimestamp) * 1000) // Convert Unix timestamp to milliseconds
    const now = new Date()
    const diffInMilliseconds = expiry.getTime() - now.getTime()

    if (diffInMilliseconds <= 0) {
      return -1
    }

    const diffInSeconds = Math.floor(diffInMilliseconds / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    let timeLeftString = ""

    if (diffInDays > 0) {
      timeLeftString += `${diffInDays} day${diffInDays > 1 ? "s" : ""} `
    }

    return diffInDays
  }

  useEffect(() => {
    const registeredChain = registeredChains?.find(
      (chain) =>
        chain.relay_chain.toLowerCase() ===
          selectedChain?.relay?.id.toLowerCase() &&
        chain.para_id === selectedChain?.paraId
    )

    const chainStatus: ChainStatus = {
      registered: !!registeredChain,
      expiryInDays: registeredChain?.expiry_timestamp
        ? getTimeLeft(registeredChain.expiry_timestamp.toString())
        : undefined,
    }

    setChainStatus(chainStatus)
  }, [selectedChain, registeredChains])

  async function handleSubscribe() {
    if (!api || !activeAccount || !selectedNetwork || !selectedChain?.paraId) {
      return
    }

    const { result, toastId, chain, network } = await subscribeTx(
      api,
      activeAccount.address,
      selectedNetwork,
      tokenDecimals,
      selectedChain
    )

    console.log("resultssss from subscribeTx", result)

    //@ts-ignore
    const blockNumber = result?.blockNumber.toString()

    if (!blockNumber) {
      console.error("error getting the block number")
      return
    }

    try {
      const res2 = await registerWithServer(
        parseInt(blockNumber),
        selectedChain.paraId,
        selectedNetwork
      )
    } catch (e) {
      //@ts-ignore
      toast.error(e.message, { id: toastId })
      return
    }

    toast.success(
      `Subscription of ${chain?.name} on ${uppercaseFirstLetter(
        network || ""
      )} successful!`,
      {
        id: toastId,
        duration: 5000,
        action: {
          label: "↗ Subscan",
          onClick: () =>
            window.open(
              `${siteConfig.blockExplorer}${result?.txHash}`,
              "_blank"
            ),
        },
      }
    )
  }

  const isAccountBalanceInsufficient = freeBalance?.lt(
    bnToBn(siteConfig.subscriptionCost)
  )

  return (
    <section className="">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-white">
            Register a Parachain
          </h2>
          <p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
            Register your chain to start tracking its consumption. This will
            allow you to see the consumption of your chain on the historic
            consumption page.
          </p>
        </div>

        <div className="mb-4 flex gap-4 justify-center">
          <NetworkSelect />
          <ChainSelect />
        </div>

        {selectedChain && (
          <div className="registry-info text-center">
            {chainStatus && chainStatus.registered ? (
              <div>
                <h2>
                  {selectedChain.name} is already registered and will expire in:{" "}
                  <b>{chainStatus.expiryInDays}</b> days
                </h2>
                {chainStatus.expiryInDays && chainStatus.expiryInDays < 70 && (
                  <div className="flex flex-row gap-2 mt-4 items-center justify-center">
                    <ConnectButton size="lg" />
                    <Button size="lg" className="" disabled={!isConnected}>
                      Renew Subscription for
                      <Image
                        src={selectedChain.logo}
                        alt="logo"
                        width={32}
                        height={32}
                        className="mx-2 inline-block"
                      />
                      <span>{selectedChain.name}</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <section className="bg-blue-100 dark:bg-gray-900 mt-8 rounded-sm">
                <div className="py-8 px-4 mx-auto sm:py-16 lg:px-6">
                  <div className="mx-auto flex items-center flex-col">
                    <h2 className="mb-4 text-2xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-white">
                      {selectedChain.name} is not registered yet. Registering a
                      chain will allow:
                    </h2>
                    <div className="m">
                      <ul className="list-disc ml-2 text-left">
                        <li>Computational consumption tracking</li>
                        <li>Storage consumption tracking</li>
                        <li>Identify moments of peak consumption</li>
                        <li>Identify periods of high and low usage</li>
                        <li>Data categorization across dispatch classes</li>
                        <li>Data displayed on the historic consumption page</li>
                      </ul>
                    </div>
                    <div className="flex flex-row mt-8 gap-2">
                      <ConnectButton size="lg" />
                      <AlertDialog>
                        <AlertDialogTrigger disabled={!isConnected}>
                          <Button
                            size="lg"
                            className=""
                            disabled={!isConnected}
                          >
                            Register{" "}
                            <Image
                              src={selectedChain.logo}
                              alt="logo"
                              width={32}
                              height={32}
                              className="mx-2 inline-block"
                            />
                            <span className="mr-1">{selectedChain.name}</span>
                            for 0.01ROC now!
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {selectedChain.name} Subscription
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <div>
                            <p>
                              Registering {selectedChain.name} on
                              PolkadotWeigher will allow you to track its
                              consumption and view historic consumption data.
                            </p>
                            <p className="mt-4">
                              The subscription will cost <b>30 DOT</b> per
                              90days.
                            </p>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="flex-1"
                              onClick={handleSubscribe}
                              disabled={isAccountBalanceInsufficient}
                            >
                              Subscribe
                            </AlertDialogAction>
                          </AlertDialogFooter>
                          {isAccountBalanceInsufficient && (
                            <div className="text-orange-500 text-xs text-right">
                              ⚠️ Your account balance is too low to subscribe
                            </div>
                          )}
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
