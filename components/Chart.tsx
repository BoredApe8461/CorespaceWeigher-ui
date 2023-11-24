import React, { useEffect, useState } from "react";
import { AxisOptions, Chart } from "react-charts";
import axios from "axios";

type Consumption = {
  blockNumber: number;
  consumed: number;
};

function ReftimeChart({
  normal,
  mandatory,
  operational,
}: {
  normal: Consumption[];
  operational: Consumption[];
  mandatory: Consumption[];
}) {
  const axes = React.useMemo(
    () => [
      {
        label: "Normal consumption",
        data: normal,
      },
      {
        label: "Operational consumption",
        data: operational,
      },
      {
        label: "Mandatory consumption",
        data: mandatory,
      },
    ],
    [],
  );

  const primaryAxis = React.useMemo(
    (): AxisOptions<Consumption> => ({
      getValue: (d) => d.blockNumber,
    }),
    [],
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<Consumption>[] => [
      {
        getValue: (d) => d.consumed,
      },
    ],
    [],
  );

  return (
    <div style={{ width: "800px", height: "300px" }}>
      <Chart
        options={{
          data: axes,
          primaryAxis,
          secondaryAxes,
        }}
      />
    </div>
  );
}

const DataProvider = () => {
  const [normalConsumption, setNormalConsumption]: [Consumption[], any] =
    useState([]);
  const [operationalConsumption, setOperationalConsumption]: [
    Consumption[],
    any,
  ] = useState([]);
  const [mandatoryConsumption, setMandatoryConsumption]: [Consumption[], any] =
    useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const result: any[] = (
      await axios.get("http://localhost:8000/consumption/polkadot/2004")
    ).data;

    const normal = result.map((record) => {
      return {
        blockNumber: record.block_number,
        consumed: record.normal * 100,
      };
    });
    const operational = result.map((record) => {
      return {
        blockNumber: record.block_number,
        consumed: record.operational * 100,
      };
    });
    const mandatory = result.map((record) => {
      return {
        blockNumber: record.block_number,
        consumed: record.mandatory * 100,
      };
    });

    setNormalConsumption(normal);
    setOperationalConsumption(operational);
    setMandatoryConsumption(mandatory);
  };

  return (
    <>
      {normalConsumption.length > 0 && (
        <ReftimeChart
          normal={normalConsumption}
          mandatory={mandatoryConsumption}
          operational={operationalConsumption}
        />
      )}
    </>
  );
};

export default DataProvider;
