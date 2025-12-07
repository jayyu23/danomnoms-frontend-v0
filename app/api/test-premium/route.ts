// app/api/test-premium/route.ts
import { NextResponse } from "next/server";
import "server-only";

import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import { monadTestnet } from "thirdweb/chains";

const BASE_URL =
  (process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000") + "/api/test-premium";

export async function GET(request: Request) {
  try {
    const secretKey = process.env.THIRDWEB_SECRET_KEY?.trim();
    const serverWallet = process.env.SERVER_WALLET_ADDRESS?.trim();

    // Demo mode: no real thirdweb secret / server wallet configured
    const isDemoMode = !secretKey || !serverWallet;
    if (isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({
        message: "Paid! Monad is blazing fast ⚡ (Demo Mode)",
        tx: {
          hash: `0x${Math.random().toString(16).slice(2)}${Math.random()
            .toString(16)
            .slice(2)}`,
          network: "monad-testnet",
          amount: 0.0001,
          currency: "USDC",
        },
      });
    }

    // Real flow: use thirdweb x402 facilitator + settlePayment
    const client = createThirdwebClient({ secretKey });
    const twFacilitator = facilitator({
      client,
      serverWalletAddress: serverWallet!,
    });

    const paymentData = request.headers.get("x-payment");

    const result = await settlePayment({
      resourceUrl: BASE_URL,          // MUST match this exact endpoint URL
      method: "GET",
      paymentData,
      network: monadTestnet,          // Monad testnet
      price: "$0.0001",               // 0.0001 USDC
      payTo: serverWallet!,           // receiver
      facilitator: twFacilitator,
      routeConfig: {
        resource: BASE_URL,
        discoverable: true,
        description: "Access to premium content",
        outputSchema: {
          message: {
            type: "string",
            description: "Success message",
            required: true,
          },
          tx: {
            type: "object",
            description: "Transaction receipt",
          },
        },
      },
    });

    if (result.status === 200) {
      // Payment verified + settled
      return NextResponse.json({
        message: "Paid! Monad is blazing fast ⚡",
        tx: result.paymentReceipt,
      });
    }

    // Payment required / other non-200
    return new NextResponse(JSON.stringify(result.responseBody), {
      status: result.status,
      headers: {
        "Content-Type": "application/json",
        ...(result.responseHeaders || {}),
      },
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        error: "server error",
        message: error?.message || "Unknown error",
        details:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}