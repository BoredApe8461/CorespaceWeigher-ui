export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Polkadot Weigher",
  description: "Displays utilization of Polkadot parachains.",
  backendUrl: "http://34.154.231.249:8000",
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
}
