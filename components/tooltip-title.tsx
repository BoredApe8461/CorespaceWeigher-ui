"use client"

import Link from "next/link"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

export function TooltipTitle() {
  return (
    <>
      See all the historic consumption data for{" "}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="underline">registered</span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col max-w-xs">
              Our service provides a way to see the historic consumption data
              for all the registered chains.{" "}
              <Link href="/subscribe" className="underline">
                ↪ Register a chain here.
              </Link>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>{" "}
      parachains
    </>
  )
}
