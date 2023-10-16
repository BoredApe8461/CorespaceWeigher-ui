import { FormControl, FormLabel, ListItem, ListItemIcon, ListItemText, MenuItem, TextField } from "@mui/material"

import Image from "next/image";

const NetworkSelect = ({setNetwork, network}: {setNetwork: any, network: string}) => {
  return (
    <FormControl sx={{ m: 2, width: 400 }}>
      <FormLabel>Network</FormLabel>
      <TextField
            label='Select network'
            select
            sx={{ mt: '8px' }}
            required
            value={network}
            onChange={(e) => {
                setNetwork(e.target.value)
            }}
          >
            <MenuItem value="polkadot">
            <ListItem>
                <ListItemIcon sx={{ mr: '8px' }}>
                  <Image src="/polkadot-logo.svg" alt='logo' width={32} height={32} />
                </ListItemIcon>
                <ListItemText>
                  Polkadot
                </ListItemText>
              </ListItem>
            </MenuItem>
            <MenuItem value="kusama">
              <ListItem>
                <ListItemIcon sx={{ mr: '8px' }}>
                  <Image src="/kusama-logo.svg" alt='logo' width={32} height={32} />
                </ListItemIcon>
                <ListItemText>
                   Kusama
                </ListItemText>
              </ListItem>
            </MenuItem>
      </TextField>
    </FormControl>
  );
};

export default NetworkSelect;
