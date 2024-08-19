import { DateRange } from "@/common/types"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Polkadot Weigher",
  description: "Displays utilization of Polkadot parachains.",
  backendUrl: "https://api.polkadot-weigher.com",
  blockExplorer: "https://polkadot.subscan.io//extrinsic/",
  subscriptionCost: "100000000000", // cost to register a parachain

  mainNav: [
    {
      title: "Historic Consumption",
      href: "/history",
    },
    {
      title: "Parachain Registration",
      href: "/subscribe",
    },
  ],
  links: {
    github: "https://github.com/RegionX-Labs/CorespaceWeigher-ui",
  },
  defaultDateRange: "week" as DateRange,
  rangeGroupingMap: {
    hour: "minute",
    day: "hour",
    week: "hour",
    month: "day",
    year: "month",
    all: "month",
  } as Record<DateRange, "block" | "minute" | "hour" | "day" | "month">,
}
