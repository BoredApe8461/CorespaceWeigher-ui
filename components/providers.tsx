"use client"

import { ChainProvider } from "@/providers/chain-provider"
import { QueryClient, QueryClientProvider } from "react-query"

import { ThemeProvider } from "./theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ChainProvider>{children}</ChainProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
