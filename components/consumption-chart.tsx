import React, { useMemo, useState } from "react"
import { ChevronDown, ChevronRightIcon } from "lucide-react"
// Assuming this is where your type is defined
import moment from "moment"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ConsumptionDatum } from "../common/types"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

// You might need to install moment for date manipulation

type Grouping = "block_number" | "day" | "month" | "year"
const groupingOptions: Grouping[] = ["block_number", "day", "month", "year"]

type DateRange = "1d" | "7d" | "30d" | "90d" | "1y" | "all"
const dateRangeOptions: DateRange[] = ["1d", "7d", "30d", "90d", "1y", "all"]

type Props = {
  data: ConsumptionDatum[]
  grouping: Grouping
}

type GroupedData = {
  [key: string]: {
    timestamp: number
    normal: number
    operational: number
    mandatory: number
    total: number
    count: number
    label?: string
  }
}

const formatData = (data: ConsumptionDatum[], grouping: Props["grouping"]) => {
  const grouped: GroupedData = data.reduce((acc, cur) => {
    let key, label
    switch (grouping) {
      case "day":
        key = moment(cur.timestamp).format("YYYY-MM-DD") // Group by day
        label = moment(cur.timestamp).format("MMM D, YYYY") // Format label as Month Day, Year
        break
      case "year":
        key = moment(cur.timestamp).format("YYYY") // Group by year
        label = moment(cur.timestamp).format("YYYY") // Format label as Year
        break
      case "month":
        key = moment(cur.timestamp).format("YYYY-MM") // Group by month
        label = moment(cur.timestamp).format("MMM, YYYY") // Format label as Month, Year
        break
      default:
        key = cur.block_number.toString()
    }

    if (!acc[key]) {
      acc[key] = {
        timestamp: cur.timestamp,
        normal: 0,
        operational: 0,
        mandatory: 0,
        count: 0,
        total: 0,
        label,
      }
    }

    acc[key].normal += cur.ref_time.normal
    acc[key].operational += cur.ref_time.operational
    acc[key].mandatory += cur.ref_time.mandatory
    acc[key].total +=
      cur.ref_time.normal + cur.ref_time.operational + cur.ref_time.mandatory
    acc[key].count += 1

    return acc
  }, {} as GroupedData)

  return Object.values(grouped)
    .map((group) => ({
      ...group,
      normal: group.normal / group.count,
      operational: group.operational / group.count,
      mandatory: group.mandatory / group.count,
      total: group.total / group.count,
    }))
    .sort((a, b) => (a.timestamp as number) - (b.timestamp as number)) // Sorting as numbers for timestamps
}

const ConsumptionChart: React.FC<Props> = ({ data, grouping = "day" }) => {
  const [group, setGroup] = useState<Grouping>(grouping)
  const [range, setRange] = useState<DateRange>("30d")

  const formattedData = useMemo(() => formatData(data, group), [data, group])

  const formatYAxisTick = (value: any) => `${(value * 100).toFixed(2)}%`
  const formatTooltip = (value: any, name: any) => {
    return `${(value * 100).toFixed(2)}%`
  }

  console.log("data points", formattedData.length)

  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-md dark:bg-gray-900 dark:text-white ">
      <div className="filters mb-4 flex items-end justify-end gap-2">
        <div>
          <span className="text-right text-xs">Group By</span>
          <Select
            onValueChange={(val: Grouping) => setGroup(val)}
            value={group}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent>
              {groupingOptions.map((grouping) => (
                <SelectItem value={grouping} key={grouping}>
                  {grouping}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <span className="text-right text-xs">Range</span>
          <Select
            onValueChange={(val: DateRange) => setRange(val)}
            value={range}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((range) => (
                <SelectItem value={range} key={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="flex items-end">
            <Button className="h-8 rounded-none rounded-s-sm">
              Export JSON
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  // variant="outline"
                  size="icon"
                  className="h-8 rounded-none rounded-e-sm"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuItem>
                  Reftime Consumption & POV Consumption
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Reftime Consumption over all Dispatch classes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          height={550}
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          style={{ fontSize: "13px" }}
        >
          <CartesianGrid strokeDasharray="2 2" />
          <XAxis dataKey="label" />
          <YAxis tickFormatter={formatYAxisTick} />
          <Tooltip
            formatter={formatTooltip}
            wrapperStyle={{ background: "#f2" }}
            wrapperClassName="rounded-md text-black dark:text-white bg-white !dark:bg-gray-900 p-2 shadow-md dark:shadow-lg"
            labelClassName="mb-2 p-0"
            itemStyle={{ padding: "0" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="normal"
            stroke="#8884d8"
            activeDot={{ r: 5 }}
          />
          <Line type="monotone" dataKey="operational" stroke="#82ca9d" />
          <Line type="monotone" dataKey="mandatory" stroke="#ffc658" />
          <Line type="monotone" dataKey="total" stroke="#ff0000" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ConsumptionChart
