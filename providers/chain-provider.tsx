import React, {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { Chain } from "@/common/chaindata"
import { Network } from "@/common/types"
import { ApiPromise, WsProvider } from "@polkadot/api"

interface ChainContextType {
  chain: Chain | undefined
  setChain: (chain: Chain | undefined) => void
  network: Network
  setNetwork: (network: Network) => void
  api: ApiPromise | undefined
  isApiLoading?: boolean
}

// Create a context with a default value
const ChainContext = createContext<ChainContextType | undefined>(undefined)

interface ChainProviderProps {
  children: ReactNode
}

// Create a provider component
export const ChainProvider: React.FC<ChainProviderProps> = ({
  children,
}: {
  children: ReactNode
}) => {
  const [chain, setChain]: [Chain | undefined, Dispatch<Chain | undefined>] =
    useState<Chain | undefined>()
  const [network, setNetwork] = useState<Network>("polkadot")
  const [api, setApi]: [
    ApiPromise | undefined,
    Dispatch<ApiPromise | undefined>
  ] = useState<ApiPromise | undefined>()
  const [isApiLoading, setIsApiLoading] = useState(true)

  useEffect(() => {
    const initApi = async () => {
      if (!chain) {
        return
      }
      setIsApiLoading(true)
      const wsProvider = new WsProvider(chain.rpcs[0].url)
      const newApi = await ApiPromise.create({ provider: wsProvider })
      setApi(newApi)
      setIsApiLoading(false)
    }

    initApi()

    return () => {
      api?.disconnect()
    }
  }, [chain])

  return (
    <ChainContext.Provider
      value={{ chain, setChain, network, setNetwork, api, isApiLoading }}
    >
      {children}
    </ChainContext.Provider>
  )
}

export const useChain = (): ChainContextType => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error("useChain must be used within a ChainProvider")
  }
  return context
}
