/*

Outdated version with react-charts
 just here for reference if that path is used in the future

*/

import React from "react"
import { demoData } from "@/common/demo-data"
import { ConsumptionDatum } from "@/common/types"
import { Chart } from "react-charts"

// Adjust the import path to where your demoData is defined

const ConsumptionChart = ({ data }: { data: ConsumptionDatum[] }) => {
  const series = React.useMemo(() => {
    // Transforming demoData into three series for the chart
    const mandatorySeries = {
      label: "Mandatory",
      data: data.map((datum) => ({
        primary: datum.block_number,
        secondary: datum.ref_time.mandatory * 100,
      })),
    }

    const normalSeries = {
      label: "Normal",
      data: data.map((datum) => ({
        primary: datum.block_number,
        secondary: datum.ref_time.normal * 100,
      })),
    }

    const operationalSeries = {
      label: "Operational",
      data: data.map((datum) => ({
        primary: datum.block_number,
        secondary: datum.ref_time.operational * 100,
      })),
    }

    return [mandatorySeries, normalSeries, operationalSeries]
  }, [])

  const primaryAxis = React.useMemo(
    () => ({
      getValue: (datum: any) => datum.primary,
    }),
    []
  )

  const secondaryAxes = React.useMemo(
    () => [
      {
        getValue: (datum: any) => datum.secondary,
        format: (value: any) => `${value.toFixed(2)}%`, // Format as percentage
      },
    ],
    []
  )

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Chart
        options={{
          data: series,
          primaryAxis,
          secondaryAxes,
        }}
      />
    </div>
  )
}

export default ConsumptionChart
