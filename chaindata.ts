import { gql, request } from "graphql-request"

const graphqlUrl = "https://squid.subsquid.io/chaindata/v/v4/graphql"

export type Chain = {
  id: string;
  name: string;
  paraId: number | null;
  relay: {
    id: string
  } | null;
  rpcs: Array<{ url: string }>,
  logo: string
}

const chainQuery = gql`
query Chains($relayId: String!) {
  chains(
    where: {
      relay: { id_eq: $relayId }
    }
  ) {
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


export const getChains = async (): Promise<Array<Chain>> => {
    const response: any = await request(graphqlUrl, chainQuery, {relayId: "polkadot"});

    const chains = response.chains;
    chains.sort((a: Chain, b: Chain) => a.name.localeCompare(b.name));

    return chains;
}
