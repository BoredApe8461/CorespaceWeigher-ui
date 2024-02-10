import "@/styles/globals.css"
import { Metadata } from "next"
import { Toaster } from "sonner"

import { siteConfig } from "@/config/site"
import { fontSans, inter } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.className
          )}
        >
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <Toaster richColors />
            </div>
            <TailwindIndicator />
          </Providers>
        </body>
      </html>
    </>
  )
}
