"use client"

import { ChainProvider } from "@/providers/chain-provider"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import {
  SubstrateChain,
  UseInkathonProvider,
  development,
} from "@scio-labs/use-inkathon";
import { QueryClient, QueryClientProvider } from "react-query"

import { ThemeProvider } from "./theme-provider"

const polkadotRelay: SubstrateChain = {
  network: "Polkadot",
  name: "Polkadot Relay Chain",
  rpcUrls: ["wss://rpc.polkadot.io"],
  ss58Prefix: 0,
  testnet: false,
}

const rococoTestnet: SubstrateChain = {
  network: "Rococo",
  name: "Rococo Testnet",
  rpcUrls: ["wss://rococo-rpc.polkadot.io"],
  ss58Prefix: 42,
  testnet: true,
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  const defaultChain = rococoTestnet || development

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ChainProvider>
          <UseInkathonProvider
            appName="Polkadot Weigher"
            defaultChain={defaultChain}
            // connectOnInit={true}
          >
            <TooltipProvider>{children}</TooltipProvider>
          </UseInkathonProvider>
        </ChainProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
