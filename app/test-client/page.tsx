"use client";

import { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

export default function TestClientPage() {
  const [message, setMessage] = useState("Click to pay $0.0001 USDC (zero gas on Monad testnet)");

  const payAndFetch = async () => {
    setMessage("Connecting wallet...");
    try {
      const wallet = createWallet("io.metamask");
      await wallet.connect({ client });
      setMessage("Wallet connected — paying...");

      const fetchPay = wrapFetchWithPayment(fetch, client, wallet);
      
      // payable endpoint - pings test-premium
      const res = await fetchPay("/api/test-premium"); // relative URL = no CORS

      const json = await res.json();
      setMessage("PAID SUCCESSFULLY! 🎉\n\n" + JSON.stringify(json, null, 2));

    } catch (e: any) {
      setMessage("ERROR: " + e.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
            <h1>Monad testnet x402 — Thirdweb</h1>

            {/* Button to pay and fetch the premium content */}
            <button onClick={payAndFetch} style={{ padding: 12, fontSize: 16 }}>
                Pay & Unlock Content
            </button>

            {/* Once paid, the content will be fetched and displayed here: */}
            <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 12 }}>
                {message}
            </pre>
        </div>
    </main>
  </div>
  )
}
