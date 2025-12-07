"use client";

import { useState } from "react";
import { useActiveWallet, ConnectButton } from "thirdweb/react";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { client } from "@/lib/thirdweb.client";

export default function TestClientPage() {
  const [message, setMessage] = useState("Click to pay $0.0001 USDC");
  const [loading, setLoading] = useState(false);
  const wallet = useActiveWallet();

  const payAndFetch = async () => {
    if (!wallet) {
      setMessage("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setMessage("Paying on Monad…");

    try {
      const fetchWithPayment = wrapFetchWithPayment(fetch, client, wallet);

      const res = await fetchWithPayment("/api/test-premium", {
        method: "GET",
      });

      const json = await res.json();

      if (res.ok) {
        setMessage("PAID SUCCESSFULLY!\n\n" + JSON.stringify(json, null, 2));
      } else {
        setMessage("Error from server:\n" + JSON.stringify(json, null, 2));
      }
    } catch (e: any) {
      setMessage("Client error: " + (e?.message || "Unknown error"));
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Test Premium Payment</h1>
        
        <div className="flex justify-center">
          <ConnectButton client={client} />
        </div>

        <div className="bg-secondary rounded-lg p-4 min-h-[100px]">
          <pre className="text-sm whitespace-pre-wrap break-words">{message}</pre>
        </div>

        <button
          onClick={payAndFetch}
          disabled={loading || !wallet}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Pay & Unlock Monad Premium"}
        </button>
      </div>
    </div>
  );
}