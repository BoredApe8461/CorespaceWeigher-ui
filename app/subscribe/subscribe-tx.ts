import { Chain } from "@/common/chaindata"
import { Network } from "@/common/types"
import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsicFunction } from "@polkadot/api/types"
import { AccountId } from "@polkadot/types/interfaces"
import {
  AnyTuple,
  Callback,
  IKeyringPair,
  ISubmittableResult,
} from "@polkadot/types/types"
import { BN, bnToBn } from "@polkadot/util"
import {
  TransferBalanceResult,
  checkIfBalanceSufficient,
  getExtrinsicErrorMessage,
} from "@scio-labs/use-inkathon"
import { toast } from "sonner"

import { siteConfig } from "@/config/site"
import { uppercaseFirstLetter } from "@/lib/utils"

export type SubmitSubscriptionResult = TransferBalanceResult & {
  toastId?: string | number
  chain?: Chain
  network?: Network
}

/**
 * Transfers a given amount of tokens from one account to another.
 */
export const subscribeTx = async (
  api: ApiPromise,
  fromAccount: IKeyringPair | string,
  network: Network,
  chainDecimals: number,
  chain: Chain,
  allowDeath?: boolean,
  statusCb?: Callback<ISubmittableResult>
): Promise<SubmitSubscriptionResult> => {
  const amount: bigint | BN | string | number = siteConfig.subscriptionCost

  const hasSufficientBalance = await checkIfBalanceSufficient(
    api,
    fromAccount,
    amount
  )

  if (!hasSufficientBalance) {
    return Promise.reject({
      errorMessage: "TokenBelowMinimum",
    } satisfies SubmitSubscriptionResult)
  }

  const toAddress =
    "1C8BPSDDuaK2Rk8LgjFKpm9BsuFva7EfJWZ6s8XGg7FVwPn"

  const toastId = toast.loading(
    `Awaiting signature for subscribing to ${
      chain.name
    } on ${uppercaseFirstLetter(network)}...`
  )

  return new Promise(async (resolve, reject) => {
    try {
      const remarkFn = api.tx.system.remark(
        `regionx-weigher::${uppercaseFirstLetter(network)}:${chain.paraId}`
      )

      const transferFn = (api.tx.balances[
        allowDeath ? "transferAllowDeath" : "transferKeepAlive"
      ] || api.tx.balances["transfer"]) as SubmittableExtrinsicFunction<
        "promise",
        AnyTuple
      >

      const batchAll = api.tx.utility.batchAll([
        transferFn(toAddress, bnToBn(amount)),
        remarkFn,
      ])

      const unsub = await batchAll.signAndSend(
        fromAccount,
        async (result: ISubmittableResult) => {
          statusCb?.(result)
          const { status, dispatchError, events = [], txHash } = result

          if (status.isReady) {
            toast.loading(`Sending transaction`, {
              id: toastId,
            })
            console.log(`Sending transaction with hash ${txHash}`)
          } else if (status.isInBlock) {
            toast.loading(`Transaction in block. Waiting for finalization...`, {
              id: toastId,
            })
            console.log(`Transaction in block with hash ${txHash}`)
          } else if (status.isFinalized) {
            console.log(`Transaction included at blockHash ${txHash}`)

            if (dispatchError) {
              console.error("Error while transferring balance:", dispatchError)
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api?.registry.findMetaError(
                  dispatchError.asModule
                )
                const { docs, name, section } = decoded || {}

                console.error(
                  `Error while transferring balance: ${docs?.join(" ")}`
                )
                reject(docs?.join(" "))
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                console.error(
                  "Error while transferring balance:",
                  dispatchError
                )
                reject({ status: "error", message: dispatchError.toString() })
              }
            }

            resolve({ result, toastId, chain, network })

            unsub?.()
          }
        }
      )
    } catch (e: any) {
      console.error("Error while transferring balance:", e)
      reject({
        errorMessage: getExtrinsicErrorMessage(e),
        errorEvent: e,
      } satisfies TransferBalanceResult)
    }
  })
}
