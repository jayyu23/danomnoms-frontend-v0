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
      console.log("=== CLIENT: Starting payment flow ===");
      console.log("Client ID:", process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID);
      console.log("Client object:", client);
      
      const wallet = createWallet("io.metamask");
      console.log("Wallet created, connecting...");
      await wallet.connect({ client });
      console.log("Wallet connected, address:", await wallet.getAccount()?.address);
      setMessage("Wallet connected — paying...");

      const fetchPay = wrapFetchWithPayment(fetch, client, wallet);
      console.log("wrapFetchWithPayment created, making request to /api/test-premium");
      
      // payable endpoint - pings test-premium
      const res = await fetchPay("/api/test-premium"); // relative URL = no CORS
      
      console.log("=== CLIENT: Response received ===");
      console.log("Response status:", res.status);
      console.log("Response statusText:", res.statusText);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));
      console.log("Response ok:", res.ok);
      
      const json = await res.json();
      console.log("Response JSON:", json);
      
      setMessage("PAID SUCCESSFULLY! 🎉\n\n" + JSON.stringify(json, null, 2));

    } catch (e: any) {
      console.error("=== CLIENT: Error occurred ===");
      console.error("Error type:", e?.constructor?.name);
      console.error("Error message:", e?.message);
      console.error("Error stack:", e?.stack);
      console.error("Error details:", e);
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
