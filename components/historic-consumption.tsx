"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DataDisplay, DateRange } from "@/common/types"
import { useChain } from "@/providers/chain-provider"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { useConsumption, useEarliestConsumption } from "@/hooks/use-consumption"

import ConsumptionChart from "./consumption-chart"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import DownloadJSONButton from "./ui/download-json.button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Skeleton } from "./ui/skeleton"

const dateRangeOptions: DateRange[] = ["day", "week", "month", "year", "all"]

export function HistoricConsumption() {
  const [range, setRange] = useState<DateRange>("day")
  const [currentRangeStart, setCurrentRangeStart] = useState(() =>
    startOfDay(new Date())
  )
  const [currentRangeEnd, setCurrentRangeEnd] = useState(() =>
    endOfDay(new Date())
  )

  const [dataDisplay, setDataDisplay] = useState<DataDisplay>("ref_time")

  const [refTimeDisplayed, setRefTimeDisplayed] = useState(true)
  const [proofSizeDisplayed, setProofSizeDisplayed] = useState(false)

  const { chain } = useChain()
  const {
    data: historicConsumption,
    isLoading,
    isError,
    error,
    isFetching,
  } = useConsumption({ range, start: currentRangeStart, end: currentRangeEnd })

  const { data: earliestDataEntry } = useEarliestConsumption();
  const earliestDataDate = earliestDataEntry?.[0].group
    ? new Date(earliestDataEntry[0].group)
    : new Date("2020-01-01");

  const latestDataDate = new Date(); // Example latest data date, assuming it's today for simplicity

  const today = new Date();
  const endOfToday = endOfDay(today);

  //Determine if the "previous" or "next" buttons should be disabled
  const disablePrevious = isBefore(
    currentRangeStart,
    earliestDataDate
  )
  const disableNext = !isBefore(currentRangeEnd, endOfToday)

  const formatDateRangeDisplay = (range: DateRange, start: Date, end: Date) => {
    switch (range) {
      case "day":
        return format(start, "MMM dd, yyyy") // Single day
      case "week":
        return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}` // Week range within the same year
      case "month":
        return format(start, "MMMM yyyy") // Full month
      case "year":
        return format(start, "yyyy") // Full year
      case "all":
        return "All time" // All data available
      default:
        return "" // Fallback for unexpected range values
    }
  }

  const displayedDateRange = formatDateRangeDisplay(
    range,
    currentRangeStart,
    currentRangeEnd
  );

  // Handlers for changing the week/month
  const goToPrevious = () => {
    if (range === "day") {
      setCurrentRangeStart((prev) => subDays(prev, 1))
      setCurrentRangeEnd((prev) => subDays(prev, 1))
    } else if (range === "week") {
      setCurrentRangeStart((prev) => subWeeks(prev, 1))
      setCurrentRangeEnd((prev) => subWeeks(prev, 1))
    } else if (range === "month") {
      setCurrentRangeStart((prev) => subMonths(prev, 1))
      setCurrentRangeEnd((prev) => subMonths(prev, 1))
    } else if (range === "year") {
      setCurrentRangeStart((prev) => subYears(prev, 12))
      setCurrentRangeEnd((prev) => subYears(prev, 12))
    } else if (range === "all") {
      setCurrentRangeStart(earliestDataDate)
      setCurrentRangeEnd(latestDataDate)
    }
  }

  const goToNext = () => {
    if (range === "day") {
      setCurrentRangeStart((prev) => addDays(prev, 1))
      setCurrentRangeEnd((prev) => addDays(prev, 1))
    } else if (range === "week") {
      setCurrentRangeStart((prev) => addWeeks(prev, 1))
      setCurrentRangeEnd((prev) => addWeeks(prev, 1))
    } else if (range === "month") {
      setCurrentRangeStart((prev) => addMonths(prev, 1))
      setCurrentRangeEnd((prev) => addMonths(prev, 1))
    } else if (range === "year") {
      setCurrentRangeStart((prev) => addMonths(prev, 12))
      setCurrentRangeEnd((prev) => addMonths(prev, 12))
    } else if (range === "all") {
      setCurrentRangeStart(earliestDataDate)
      setCurrentRangeEnd(latestDataDate)
    }
  }

  // Effect to adjust range when `range` state changes
  useEffect(() => {
    if (range === "day") {
      setCurrentRangeStart(startOfDay(new Date()))
      setCurrentRangeEnd(endOfDay(new Date()))
    } else if (range === "week") {
      setCurrentRangeStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
      setCurrentRangeEnd(endOfWeek(new Date(), { weekStartsOn: 1 }))
    } else if (range === "month") {
      setCurrentRangeStart(startOfMonth(new Date()))
      setCurrentRangeEnd(endOfMonth(new Date()))
    }
  }, [range])

  if (!chain) {
    return (
      <section className="">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-4 flex flex-col items-center text-sm text-gray-500 ">
            Select a chain to view historic consumption charts
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-4 flex flex-col items-center text-sm text-gray-500 ">
            Error fetching historic consumption data. It seems the selected
            chain is not registered yet or there is no data yet.
            <Link href="/subscribe">
              <Button className="mt-4">Register Chain</Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="history w-full">
      <div className="controls flex flex-row justify-between items-end">
        <div className="flex flex-col">
          <div className="mb-2 text-start">
            <span>Viewing data for: </span>
            <strong>{displayedDateRange}</strong>
          </div>
          <div className="flex items-center">
            <Button
              onClick={goToPrevious}
              variant="default"
              className="mr-1"
              disabled={disablePrevious}
            >
              {" "}
              <ChevronLeftIcon />
              Previous {range}
            </Button>
            <Select
              onValueChange={(val: DateRange) => setRange(val)}
              value={range}
            >
              <SelectTrigger className="w-[180px] h-10">
                <CalendarIcon />
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((range) => (
                  <SelectItem value={range} key={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={goToNext}
              variant="default"
              disabled={disableNext}
              className="ml-1"
            >
              Next {range} <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <div>
          <div className="export flex flex-col items-start justify-start gap-2">
            <div className="flex items-end">
              <DownloadJSONButton
                className="rounded-md"
                jsonData={historicConsumption || []}
                fileName={`historic-consumption-${chain.name}-${displayedDateRange}.json`}
              >
                Export JSON
              </DownloadJSONButton>
            </div>
          </div>
        </div>
      </div>
      <div className="data-selection flex flex-col my-2 items-center">
        <div className="flex flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="refTime"
              checked={refTimeDisplayed}
              onCheckedChange={() => setRefTimeDisplayed(!refTimeDisplayed)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ref Time
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="refTime"
              checked={proofSizeDisplayed}
              onCheckedChange={() => setProofSizeDisplayed(!proofSizeDisplayed)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Proof Size
            </label>
          </div>
        </div>
      </div>
      <div>
        {error || isError ? (
          "error"
        ) : isLoading || !historicConsumption ? (
          <Skeleton className="h-[500px] w-full rounded-sm flex justify-center items-center">
            Loading Chart
          </Skeleton>
        ) : (
          <ConsumptionChart
            data={historicConsumption}
            grouping={range}
            refTimeDisplayed={refTimeDisplayed}
            proofSizeDisplayed={proofSizeDisplayed}
          />
        )}
      </div>
    </div>
  )
}
