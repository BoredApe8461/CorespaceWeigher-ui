import { gql, request } from "graphql-request"

const graphqlUrl = "https://squid.subsquid.io/chaindata/v/v4/graphql"

export type Chain = {
  id: string
  name: string
  paraId: number | null
  relay: {
    id: string
  } | null
  rpcs: Array<{ url: string }>
  logo: string
}

const chainsQuery = gql`
  query Chains($relayId: String!) {
    chains(where: { relay: { id_eq: $relayId } }) {
      id
      name
      paraId
      relay {
        id
      }
      rpcs {
        url
      }
      logo
    }
  }
`;

const chainQuery = gql`
  query Chains($id: String!) {
    chains(where: { id_eq:  $id }) {
      id
      name
      rpcs {
        url
      }
      logo
    }
  }
`;

export const getChains = async (network: "polkadot" | "kusama"): Promise<Array<Chain>> => {
  const response: any = await request(graphqlUrl, chainsQuery, {
    relayId: network,
  })

  const chains = response.chains

  let relayChain = ((await request(graphqlUrl, chainQuery, {id: network})) as any).chains[0];
  // On the backend the relay chains are registered with paraId zero.
  relayChain.paraId = 0;
  relayChain.relay = { id: network };
  chains.push(relayChain);

  chains.sort((a: Chain, b: Chain) => a.name.localeCompare(b.name))

  return chains
}
