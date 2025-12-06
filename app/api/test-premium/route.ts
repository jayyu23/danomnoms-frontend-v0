import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import { monadTestnet } from "thirdweb/chains";
import { NextResponse } from "next/server";

const client = createThirdwebClient({ secretKey: process.env.THIRDWEB_SECRET_KEY || "" });

const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || "",
});

export async function GET(request: Request) {
    try {
        const paymentData = request.headers.get("x-payment");

        const result: any = await settlePayment({
            resourceUrl: "http://localhost:3000/api/test-premium",
            method: "GET",
            paymentData: paymentData,
            network: monadTestnet, // payable on monad testnet
            price: "$0.0001", // Amount per request
            payTo: process.env.SERVER_WALLET_ADDRESS || "", // payment receiver
            facilitator: thirdwebX402Facilitator,
        });

        if (result.status === 200) {
            // If payment is settled, return paid response
            return NextResponse.json({ message: "Paid! Monad is blazing fast ⚡", tx: result.paymentReceipt });
        } else {
            // send payment status
            return new NextResponse(
            JSON.stringify(result.responseBody),
                {
                    status: result.status,
                    headers: { "Content-Type": "application/json", ...(result.responseHeaders || {}) },
                }
            );
        }
    } catch(error) {
        console.error(error);
        
        return new NextResponse(
            JSON.stringify({ error: "server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
