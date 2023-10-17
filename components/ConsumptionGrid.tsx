import { Card, CardContent, Grid, Typography } from "@mui/material"
import { Consumption } from "@/common/types";

type Props = {
  consumption: Consumption, 
  blockNumber: string
}

const ConsumptionGrid = ({ consumption, blockNumber }: Props) => {
  const getDispatchClassConsumption = (dispatchClass: string): number => {
    // @ts-ignore
    return consumption[dispatchClass.toLowerCase()].toString().substring(0, 4);
  }

  const data = [
    { 
      title: 'Normal', 
      content: `Dispatches in this class represent normal user-triggered transactions. These types of dispatches only consume a portion of a block's total weight limit. Normal dispatches are sent to the transaction pool.`
    },
    { 
      title: 'Operational',
      content: `Unlike normal dispatches, which represent usage of network capabilities, operational dispatches are those that provide network capabilities. Operational dispatches can consume the entire weight limit of a block.` 
    },
    { 
      title: 'Mandatory', 
      content: `The mandatory dispatches are included in a block even if they cause the block to surpass its weight limit. This dispatch class is intended to represent functions that are part of the block validation process. ` 
    },
  ];

  return (
    <>
      <h2 className="text-3xl mt-2">Weight consumed by block #{blockNumber}:</h2>
      <br />
      <Grid className="mt-6" container spacing={2}>
      {data.map((card, index) => (
        <Grid item xs={4} key={index}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {card.title}
              </Typography>
              <Typography className="mt-6" variant="body2">
                {card.content}
              </Typography>
              <Typography className="mt-6" variant="body1">
                {getDispatchClassConsumption(card.title)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <h1 className="text-3xl mt-6">Total: {consumption.total.toString().substring(0, 4)}%</h1>
    </>
  )
}

export default ConsumptionGrid;
