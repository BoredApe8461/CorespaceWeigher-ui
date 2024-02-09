"use client"

import { ChainProvider } from "@/providers/chain-provider"
import {
  SubstrateChain,
  UseInkathonProvider,
  development,
  getSubstrateChain,
  rococo,
} from "@scio-labs/use-inkathon"
import { QueryClient, QueryClientProvider } from "react-query"

import { ThemeProvider } from "./theme-provider"

const polkadotRelay: SubstrateChain = {
  network: "Polkadot",
  name: "Polkadot Relay Chain",
  rpcUrls: ["wss://rpc.polkadot.io"],
  ss58Prefix: 0,
  testnet: false,
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  const defaultChain = polkadotRelay || development

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ChainProvider>
          <UseInkathonProvider
            appName="Polkadot Weigher"
            defaultChain={defaultChain}
            connectOnInit={true}
          >
            {children}
          </UseInkathonProvider>
        </ChainProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
