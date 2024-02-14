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

import { extendWithServer, registerWithServer } from "./post-tx"
import { subscribeTx } from "./subscribe-tx"

type ChainStatus = {
  registered: boolean
  expiryInDays?: number | undefined
}

enum Operation {
  Register,
  Extend
};

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

  async function handleSubscribe(op: Operation) {
    if (!api || !activeAccount || !selectedNetwork || 
      selectedChain?.paraId == null || selectedChain?.paraId == undefined) {
      return
    }

    const { result, toastId, chain, network } = await subscribeTx(
      api,
      activeAccount.address,
      selectedNetwork,
      tokenDecimals,
      selectedChain
    )

    //@ts-ignore
    const blockNumber = result?.blockNumber.toString()

    if (!blockNumber) {
      console.error("error getting the block number")
      return
    }

    try {
      if(op == Operation.Extend) {
        const _ = await extendWithServer(
          parseInt(blockNumber),
          selectedChain.paraId,
          selectedNetwork
        );
      }else if(op == Operation.Register) {
        const _ = await registerWithServer(
          parseInt(blockNumber),
          selectedChain.paraId,
          selectedNetwork
        );
      }
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
                {chainStatus.expiryInDays && chainStatus.expiryInDays < 30 && (
                  <div className="flex flex-row gap-2 mt-4 items-center justify-center">
                    <ConnectButton size="lg" />
                    <AlertDialog>
                      <AlertDialogTrigger disabled={!isConnected}>
                        <Button
                          size="lg"
                          className=""
                          disabled={!isConnected}
                        >
                          Extend {" "}
                          <Image
                            src={selectedChain.logo}
                            alt="logo"
                            width={32}
                            height={32}
                            className="mx-2 inline-block"
                          />
                          <span className="mr-1">{selectedChain.name}</span>
                          subscription for 20 DOT
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
                            Extending {selectedChain.name} subscription
                            PolkadotWeigher will allow you to track its
                            consumption for the upcoming period of 90 days.
                          </p>
                          <p className="mt-4">
                            The subscription renewal costs <b>20 DOT</b> and will expire
                            in 90days.
                          </p>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="flex-1"
                            onClick={() => handleSubscribe(Operation.Extend)}
                            disabled={isAccountBalanceInsufficient}
                          >
                            Renew
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
                )}
              </div>
            ) : (
              <section className="bg-blue-100 dark:bg-gray-900 mt-8 rounded-sm">
                <div className="py-8 px-4 mx-auto sm:py-16 lg:px-6">
                  <div className="mx-auto flex items-center flex-col">
                    <h2 className="mb-4 text-2xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-white">
                      {selectedChain.name} is not registered yet. Registering a chain will allow:
                    </h2>
                    <div className="grid grid-cols-3 gap-6 my-12">
                      <Fetaure 
                        title="Computational Consumption Tracking" 
                        content="Gain precise insights into the computational demands of processing and validating blocks within your network."
                      />
                      <Fetaure 
                        title="Detailed Proof Size Analysis" 
                        content="Analyze the size of validation proofs to of blocks within your network."
                      />
                      <Fetaure 
                        title="Identification of Peak Consumption Periods" 
                        content="Discover exact moments when your network experiences maximum load."
                      />
                      <Fetaure 
                        title="Insights into Usage Patterns" 
                        content="Uncover patterns of high and low network activity over time."
                      />
                      <Fetaure 
                        title="Data Categorization" 
                        content="Categorization of data for over all dispatch classes."
                      />
                      <Fetaure 
                        title="Historical Consumption Data Visualization" 
                        content="Access comprehensive visualizations of historical network consumption on a dedicated page."
                      />
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
                            for 20 DOT now!
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
                              consumption for the upcoming period of 90 days.
                            </p>
                            <p className="mt-4">
                              The subscription costs <b>20 DOT</b> and will expire
                              in 90days.
                            </p>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="flex-1"
                              onClick={() => handleSubscribe(Operation.Register)}
                              disabled={isAccountBalanceInsufficient}
                            >
                              Register
                            </AlertDialogAction>
                          </AlertDialogFooter>
                          {isAccountBalanceInsufficient && (
                            <div className="text-orange-500 text-xs text-right">
                              ⚠️ Your account balance is too low to register
                            </div>
                          )}
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </section>
            )}
            <ReportIssue />
          </div>
        )}
      </div>
    </section>
  )
}

interface FeatureProps {
  title: string,
  content: string,
}

const Fetaure = ({title, content}: FeatureProps) => {
  return (
    <div className="border-dashed border-2 border-sky-500 p-2 hover:border-solid rounded">
      <h3 className="text-xl m-2 font-normal">{title}</h3>
      <p className="m-2 font-light">
        {content}
      </p>
    </div>
  )
}

const ReportIssue = () => {
  return (
    <div id="alert-additional-content-5" className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800" role="alert">
      <div className="flex items-center">
        <svg className="flex-shrink-0 w-4 h-4 me-2 dark:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
        </svg>
        <span className="sr-only">Info</span>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-300">Help</h3>
      </div>
      <div className="mt-2 mb-4 text-sm text-gray-800 dark:text-gray-300 text-left">
        Need help? Having issues registering a parachain? Reach out to 
        <a href="mailto:support@regionx.tech" className="text-blue-500 hover:text-blue-700"> support@regionx.tech </a>
         to get help and get the issue resolved.
      </div>
  </div>
  )
}
