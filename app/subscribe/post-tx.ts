import { error } from "console"

import { siteConfig } from "@/config/site"

import { uppercaseFirstLetter } from "../../lib/utils"

export async function registerWithServer(
  paymentBlockNumber: number,
  paraId: number,
  relayChain: string
) {
  const postData = {
    payment_block_number: paymentBlockNumber,
    para: [uppercaseFirstLetter(relayChain), paraId],
  }

  const endpoint = siteConfig.backendUrl + "/register_para"

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })

  const responseBody = await response.text()

  if (!response.ok) {
    throw new Error(`Failed to register chain: ${responseBody}`)
  }

  return responseBody
}

export async function extendWithServer(
  paymentBlockNumber: number,
  paraId: number,
  relayChain: string
) {
  const postData = {
    payment_block_number: paymentBlockNumber,
    para: [uppercaseFirstLetter(relayChain), paraId],
  }

  const endpoint = siteConfig.backendUrl + "/extend-subscription"

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })

  const responseBody = await response.text()

  if (!response.ok) {
    throw new Error(`Failed to register chain: ${responseBody}`)
  }

  return responseBody
}
