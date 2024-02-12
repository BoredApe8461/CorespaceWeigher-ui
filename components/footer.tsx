import * as React from "react"
import Link from "next/link"

import Image from "next/image"

export function Footer() {
  return (
    <div className="flex justify-center my-6">
      <Link href="https://regionx.tech" className="flex items-center space-x-2">
        <h3 className="inline-block font-bold text-xl">Powered by RegionX</h3>
        <Image src="/regionx-logo.png" alt="RegionX" width="50" height="50" />
      </Link>
    </div>
  )
}
