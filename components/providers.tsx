"use client"

import { ChainProvider } from "@/providers/chain-provider"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { UseInkathonProvider } from "@scio-labs/use-inkathon"
import { QueryClient, QueryClientProvider } from "react-query"

import { siteConfig } from "@/config/site"

import { ThemeProvider } from "./theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ChainProvider>
          <UseInkathonProvider
            appName="Polkadot Weigher"
            defaultChain={siteConfig.defaultChain}
            // connectOnInit={true}
          >
            <TooltipProvider>{children}</TooltipProvider>
          </UseInkathonProvider>
        </ChainProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
