import { FormControl, FormLabel, ListItem, ListItemIcon, ListItemText, MenuItem, TextField } from "@mui/material"
import { useEffect, useState } from "react";
import { Chain, getChains } from "@/common/chaindata";
import Image from "next/image";

const ChainSelect = ({setChain, network}: {setChain: any, network: string}) => {
    const [chains, setChains]: [Array<Chain>, any] = useState([]);
    const [chainId, setChainId] = useState(0);

    useEffect(() => {
      getChains(network).then((chains) => {
          setChains(chains);
      });
    }, [network]);

  return (
    <FormControl sx={{ m: 2, width: 400 }}>
      <FormLabel>Chain</FormLabel>
      <TextField
            label='Select chain'
            select
            sx={{ mt: '8px' }}
            required
            value={chainId === undefined ? chains[0] : chains[chainId]}
            onChange={(e) => {
                setChainId(Number(e.target.value));
                setChain(chains[Number(e.target.value)])
            }}
          >
        {chains.map((chain: Chain, index) => 
            <MenuItem
                value={index}
                key={index}
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <ListItem>
                <ListItemIcon sx={{ mr: '8px' }}>
                  <Image src={chain.logo} alt='logo' width={32} height={32} />
                </ListItemIcon>
                <ListItemText>
                  {chain.name}
                </ListItemText>
              </ListItem>
            </MenuItem>
            )
        }
      </TextField>
    </FormControl>
  );
};

export default ChainSelect;
