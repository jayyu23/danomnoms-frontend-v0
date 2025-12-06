import { NextResponse } from "next/server";

async function getThirdwebModules() {
  const thirdweb = await import("thirdweb");
  const x402 = await import("thirdweb/x402");
  const chains = await import("thirdweb/chains");
  return { thirdweb, x402, chains };
}

export async function GET(request: Request) {
    try {
        // Debug: Check environment variables
        const secretKey = process.env.THIRDWEB_SECRET_KEY;
        const serverWallet = process.env.SERVER_WALLET_ADDRESS;
        
        console.log("Environment check:", {
            hasSecretKey: !!secretKey,
            secretKeyLength: secretKey?.length || 0,
            secretKeyPrefix: secretKey?.substring(0, 10) || "none",
            hasServerWallet: !!serverWallet,
            serverWallet: serverWallet || "none",
        });

        // Check if we're in demo mode (missing secret key)
        const isDemoMode = !secretKey || secretKey === "";

        if (isDemoMode) {
            console.log("Running in demo mode - secret key missing");
            // Simulate payment processing for demo
            await new Promise((resolve) => setTimeout(resolve, 500));

            return NextResponse.json({
                message: "Paid! Monad is blazing fast ⚡ (Demo Mode)",
                tx: {
                    hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
                    network: "monad-testnet",
                    amount: 0.0001,
                    currency: "USDC",
                },
            });
        }

        // Real payment flow with thirdweb x402
        const { thirdweb, x402, chains } = await getThirdwebModules();

        // Ensure secret key is trimmed and not empty
        const trimmedSecretKey = secretKey?.trim();
        if (!trimmedSecretKey) {
            throw new Error("THIRDWEB_SECRET_KEY is empty or invalid");
        }

        const client = thirdweb.createThirdwebClient({
            secretKey: trimmedSecretKey,
        });

        console.log("Client created, creating facilitator...");

        const thirdwebX402Facilitator = x402.facilitator({
            client,
            serverWalletAddress: serverWallet || "",
        });

        console.log("Facilitator created, proceeding with payment settlement...");

        // Check if payment data exists in headers (sent by wrapFetchWithPayment)
        const paymentData = request.headers.get("x-payment");

        // If no payment data, return 402 Payment Required
        // wrapFetchWithPayment expects: { x402Version, accepts: [...] }
        // The accepts array contains payment options with required fields
        if (!paymentData) {
            console.log("No payment data, returning 402 Payment Required");
            // USDC has 6 decimals, so $0.0001 = 100 atomic units
            const amountInAtomicUnits = "100";
            
            return NextResponse.json(
                {
                    x402Version: 1,
                    accepts: [
                        {
                            scheme: "exact",
                            network: "eip155:10143", // Monad testnet chain ID in CAIP-2 format
                            maxAmountRequired: amountInAtomicUnits,
                            payTo: serverWallet || "",
                            asset: "0x534b2f3A21130d7a60830c2Df862319e593943A3", // USDC contract address on Monad testnet
                            resource: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/test-premium`,
                            description: "Access to premium content",
                            mimeType: "application/json",
                            maxTimeoutSeconds: 300,
                            outputSchema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string"
                                    },
                                    tx: {
                                        type: "object"
                                    }
                                }
                            },
                            extra: {
                                name: "USDC",
                                version: "2"
                            },
                        },
                    ],
                },
                {
                    status: 402,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        // Payment data exists, validate and settle the payment
        console.log("Payment data found, calling settlePayment...");
        const result: any = await x402.settlePayment({
            resourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/test-premium`,
            method: "GET",
            paymentData: paymentData,
            network: chains.monadTestnet, // payable on monad testnet
            price: "$0.0001", // Amount per request
            payTo: serverWallet || "", // payment receiver
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
    } catch(error: any) {
        console.error("Error in test-premium route:", error);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);
        
        return new NextResponse(
            JSON.stringify({ 
                error: "server error",
                message: error?.message || "Unknown error",
                details: process.env.NODE_ENV === "development" ? error?.stack : undefined,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
