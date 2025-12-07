"use client"

import { ConnectButton } from "thirdweb/react"
import { client } from "@/lib/thirdweb.client"

export function WalletButton() {
  return <ConnectButton client={client} />
}
