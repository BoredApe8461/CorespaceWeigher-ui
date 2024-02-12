"use client"

import { FC, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { InjectedAccount } from "@polkadot/extension-inject/types"
import { encodeAddress } from "@polkadot/util-crypto"
import {
  SubstrateWalletPlatform,
  allSubstrateWallets,
  isWalletInstalled,
  useInkathon,
} from "@scio-labs/use-inkathon"
import { ArrowUpRight, CheckCircle, ChevronDown } from "lucide-react"

import { truncateHash } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ConnectButtonProps {
  size?: "default" | "sm" | "lg" | "icon" | null | undefined
}

export const ConnectButton: FC<ConnectButtonProps> = ({ size }) => {
  const {
    activeChain,
    connect,
    disconnect,
    isConnecting,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()

  // Sort installed wallets first
  const [browserWallets] = useState([
    ...allSubstrateWallets.filter(
      (w) =>
        w.platforms.includes(SubstrateWalletPlatform.Browser) &&
        isWalletInstalled(w)
    ),
    ...allSubstrateWallets.filter(
      (w) =>
        w.platforms.includes(SubstrateWalletPlatform.Browser) &&
        !isWalletInstalled(w)
    ),
  ])

  // Connect Button
  if (!activeAccount)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className=""
            isLoading={isConnecting}
            disabled={isConnecting}
            translate="no"
            size={size}
          >
            Connect Wallet
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[14rem]">
          {!activeAccount &&
            browserWallets.map((w) =>
              isWalletInstalled(w) ? (
                <DropdownMenuItem
                  key={w.id}
                  className="cursor-pointer"
                  onClick={() => {
                    connect?.(undefined, w)
                  }}
                >
                  {w.name}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={w.id} className="opacity-50">
                  <Link href={w.urls.website}>
                    <div className="align-center flex justify-start gap-2">
                      <p>{w.name}</p>
                      <ArrowUpRight />
                    </div>
                    <p>Not installed</p>
                  </Link>
                </DropdownMenuItem>
              )
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    )

  // Account Menu & Disconnect Button
  return (
    <div className="flex select-none flex-wrap items-stretch justify-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="">
          <Button className="" translate="no" size={size}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center justify-center">
                <AccountName account={activeAccount} />
                <span className="text-xs font-normal">
                  {truncateHash(
                    encodeAddress(
                      activeAccount.address,
                      activeChain?.ss58Prefix || 42
                    ),
                    8
                  )}
                </span>
              </div>
              <ChevronDown size={16} />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="no-scrollbar max-h-[40vh] min-w-[14rem] overflow-scroll rounded-2xl"
        >
          {/* Available Accounts/Wallets */}
          <DropdownMenuSeparator />
          {(accounts || []).map((acc) => {
            const encodedAddress = encodeAddress(
              acc.address,
              activeChain?.ss58Prefix || 42
            )
            const truncatedEncodedAddress = truncateHash(encodedAddress, 10)

            return (
              <DropdownMenuItem
                key={encodedAddress}
                disabled={acc.address === activeAccount?.address}
                className={
                  acc.address !== activeAccount?.address ? "cursor-pointer" : ""
                }
                onClick={() => {
                  setActiveAccount?.(acc)
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <div>
                    <AccountName account={acc} />
                    <p className="text-xs">{truncatedEncodedAddress}</p>
                  </div>
                  {acc.address === activeAccount?.address && (
                    <CheckCircle size={16} />
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}

          {/* Disconnect Button */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => disconnect?.()}
          >
            <div className="flex gap-2">Disconnect</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export interface AccountNameProps {
  account: InjectedAccount
}

export const AccountName: FC<AccountNameProps> = ({ account, ...rest }) => {
  return <div>{account.name}</div>
}
