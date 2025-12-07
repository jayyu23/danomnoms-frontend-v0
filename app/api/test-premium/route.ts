import { NextResponse } from "next/server";
import "server-only";

async function getThirdwebModules() {
  const thirdweb = await import("thirdweb");
  const x402 = await import("thirdweb/x402");
  const chains = await import("thirdweb/chains");
  return { thirdweb, x402, chains };
}

// Create client at module level (like x402.chat example)
// This ensures the client is properly initialized before any requests
let serverClient: any = null;
let serverFacilitator: any = null;

async function getServerClient() {
  if (!serverClient) {
    const { thirdweb } = await getThirdwebModules();
    const secretKey = process.env.THIRDWEB_SECRET_KEY?.trim();
    if (!secretKey) {
      throw new Error("THIRDWEB_SECRET_KEY is required");
    }
    console.log("=== CREATING SERVER CLIENT ===");
    console.log("Secret key length:", secretKey.length);
    console.log("Secret key prefix:", secretKey.substring(0, 15));
    console.log("Thirdweb module:", thirdweb);
    console.log("createThirdwebClient function:", typeof thirdweb.createThirdwebClient);
    
    serverClient = thirdweb.createThirdwebClient({
      secretKey: secretKey,
    });
    
    console.log("Server client created:", {
      type: typeof serverClient,
      keys: Object.keys(serverClient || {}),
    });
  }
  return serverClient;
}

async function getServerFacilitator() {
  if (!serverFacilitator) {
    const { x402 } = await getThirdwebModules();
    const client = await getServerClient();
    const serverWallet = process.env.SERVER_WALLET_ADDRESS;
    if (!serverWallet) {
      throw new Error("SERVER_WALLET_ADDRESS is required");
    }
    console.log("=== CREATING SERVER FACILITATOR ===");
    console.log("X402 module:", x402);
    console.log("facilitator function:", typeof x402.facilitator);
    console.log("Client passed to facilitator:", {
      type: typeof client,
      isNull: client === null,
      keys: Object.keys(client || {}),
    });
    console.log("Server wallet address:", serverWallet);
    
    serverFacilitator = x402.facilitator({
      client,
      serverWalletAddress: serverWallet,
    });
    
    console.log("Server facilitator created:", {
      type: typeof serverFacilitator,
      keys: Object.keys(serverFacilitator || {}),
      url: serverFacilitator?.url,
      address: serverFacilitator?.address,
    });
  }
  return serverFacilitator;
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
        const { x402, chains } = await getThirdwebModules();

        // Get client and facilitator (created at module level for proper initialization)
        const client = await getServerClient();
        const thirdwebX402Facilitator = await getServerFacilitator();

        console.log("=== CLIENT REQUEST DEBUG ===");
        console.log("Request URL:", request.url);
        console.log("Request method:", request.method);
        
        // Log all headers
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = value;
        });
        console.log("All request headers:", JSON.stringify(headers, null, 2));
        
        // Get payment data from headers (sent by wrapFetchWithPayment)
        const paymentData = request.headers.get("x-payment");
        console.log("Payment data header (x-payment):", paymentData ? `${paymentData.substring(0, 100)}... (truncated, full length: ${paymentData.length})` : "null/undefined");
        
        // Try to parse payment data if it exists
        if (paymentData) {
            try {
                const parsedPayment = JSON.parse(paymentData);
                console.log("Parsed payment data structure:", {
                    hasSignature: !!parsedPayment.signature,
                    hasMessage: !!parsedPayment.message,
                    hasPayment: !!parsedPayment.payment,
                    keys: Object.keys(parsedPayment),
                    signaturePreview: parsedPayment.signature ? `${parsedPayment.signature.substring(0, 50)}...` : "none",
                });
            } catch (e) {
                console.log("Payment data is not JSON, raw value:", paymentData.substring(0, 200));
            }
        }
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const resourceUrl = `${baseUrl}/api/test-premium`;
        console.log("Resource URL:", resourceUrl);
        console.log("Base URL:", baseUrl);

        // Log facilitator details
        console.log("Facilitator object:", {
            type: typeof thirdwebX402Facilitator,
            isNull: thirdwebX402Facilitator === null,
            isUndefined: thirdwebX402Facilitator === undefined,
            constructor: thirdwebX402Facilitator?.constructor?.name,
            keys: thirdwebX402Facilitator ? Object.keys(thirdwebX402Facilitator) : "N/A",
        });
        
        // Try to inspect facilitator's internal state
        if (thirdwebX402Facilitator) {
            console.log("Facilitator URL:", thirdwebX402Facilitator.url);
            console.log("Facilitator address:", thirdwebX402Facilitator.address);
            
            // Try to call createAuthHeaders to see if it works
            try {
                const authHeaders = thirdwebX402Facilitator.createAuthHeaders?.();
                console.log("Facilitator createAuthHeaders result:", authHeaders);
                if (authHeaders) {
                    console.log("Auth headers keys:", Object.keys(authHeaders));
                    // Don't log actual auth values for security, but check if they exist
                    Object.keys(authHeaders).forEach(key => {
                        const value = authHeaders[key];
                        console.log(`Auth header ${key}:`, value ? `${typeof value} (length: ${String(value).length})` : "null/undefined");
                    });
                }
            } catch (e: any) {
                console.log("Facilitator createAuthHeaders error:", e?.message);
                console.log("createAuthHeaders error stack:", e?.stack);
            }
            
            // Check if accepts method exists and what it expects
            console.log("Facilitator accepts method type:", typeof thirdwebX402Facilitator.accepts);
            if (thirdwebX402Facilitator.accepts) {
                console.log("Facilitator accepts method signature:", thirdwebX402Facilitator.accepts.toString().substring(0, 300));
            }
            
            // Try to manually call accepts to see what happens
            try {
                console.log("=== TESTING FACILITATOR.ACCEPTS() MANUALLY ===");
                const acceptsResult = await thirdwebX402Facilitator.accepts?.({
                    network: chains.monadTestnet,
                    price: "$0.0001",
                    payTo: serverWallet || "",
                });
                console.log("Manual accepts() result:", acceptsResult);
            } catch (acceptsError: any) {
                console.log("Manual accepts() error:", acceptsError?.message);
                console.log("Manual accepts() error stack:", acceptsError?.stack);
                console.log("Manual accepts() error details:", {
                    name: acceptsError?.name,
                    cause: acceptsError?.cause,
                    keys: Object.keys(acceptsError || {}),
                });
            }
        }

        // Log client details
        console.log("Client object:", {
            type: typeof client,
            isNull: client === null,
            isUndefined: client === undefined,
            constructor: client?.constructor?.name,
        });
        
        // Try to inspect client's internal state
        if (client) {
            console.log("Client keys:", Object.keys(client));
            // Try to access client's internal properties (they might be private)
            const clientAny = client as any;
            console.log("Client internal properties:", {
                secretKey: clientAny.secretKey ? `${typeof clientAny.secretKey} (length: ${String(clientAny.secretKey).length})` : "not found",
                _secretKey: clientAny._secretKey ? `${typeof clientAny._secretKey} (length: ${String(clientAny._secretKey).length})` : "not found",
                config: clientAny.config ? Object.keys(clientAny.config) : "not found",
                options: clientAny.options ? Object.keys(clientAny.options) : "not found",
            });
            
            // Check if client has a method to get secret key
            if (typeof clientAny.getSecretKey === 'function') {
                try {
                    const sk = clientAny.getSecretKey();
                    console.log("Client.getSecretKey() result:", sk ? `${typeof sk} (length: ${String(sk).length})` : "null/undefined");
                } catch (e: any) {
                    console.log("Client.getSecretKey() error:", e?.message);
                }
            }
        }

        // Log network details
        console.log("Network (chains.monadTestnet):", {
            id: chains.monadTestnet?.id,
            name: chains.monadTestnet?.name,
            chainId: chains.monadTestnet?.chainId,
        });

        // Prepare settlePayment arguments
        const settlePaymentArgs = {
            resourceUrl: resourceUrl,
            routeConfig: {
                resource: resourceUrl,
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
            method: "GET",
            paymentData: paymentData,
            network: chains.monadTestnet,
            price: "$0.0001",
            payTo: serverWallet || "",
            facilitator: thirdwebX402Facilitator,
        };

        console.log("=== SETTLE PAYMENT ARGUMENTS ===");
        console.log("settlePayment args:", {
            resourceUrl: settlePaymentArgs.resourceUrl,
            method: settlePaymentArgs.method,
            paymentData: settlePaymentArgs.paymentData ? `${settlePaymentArgs.paymentData.substring(0, 50)}... (length: ${settlePaymentArgs.paymentData.length})` : "null/undefined",
            network: settlePaymentArgs.network?.name || settlePaymentArgs.network?.id,
            price: settlePaymentArgs.price,
            payTo: settlePaymentArgs.payTo,
            routeConfig: settlePaymentArgs.routeConfig,
            facilitatorType: typeof settlePaymentArgs.facilitator,
        });

        // Call settlePayment directly (matching x402.chat pattern exactly)
        // It handles both cases: no payment data (returns 402) or with payment data (settles)
        console.log("=== CALLING SETTLE PAYMENT ===");
        const result: any = await x402.settlePayment(settlePaymentArgs);
        
        console.log("=== SETTLE PAYMENT RESULT ===");
        console.log("Result status:", result?.status);
        console.log("Result keys:", result ? Object.keys(result) : "null");
        console.log("Result responseBody:", result?.responseBody ? JSON.stringify(result.responseBody, null, 2).substring(0, 500) : "null/undefined");
        console.log("Result responseHeaders:", result?.responseHeaders);
        console.log("Result paymentReceipt:", result?.paymentReceipt);

        // settlePayment returns status 200 if payment settled, 402 if payment required
        console.log("=== PROCESSING RESULT ===");
        if (result.status === 200) {
            console.log("Payment successfully settled! Returning success response.");
            // Payment successfully settled on-chain
            return NextResponse.json({ 
                message: "Paid! Monad is blazing fast ⚡", 
                tx: result.paymentReceipt 
            });
        } else {
            console.log(`Result status is ${result.status}, returning response body`);
            // Return the response from settlePayment (402 Payment Required or error)
            return NextResponse.json(
                result.responseBody || { error: "Payment required" },
                {
                    status: result.status,
                    headers: {
                        "Content-Type": "application/json",
                        ...(result.responseHeaders || {}),
                    },
                }
            );
        }
    } catch(error: any) {
        console.error("=== ERROR IN TEST-PREMIUM ROUTE ===");
        console.error("Error type:", error?.constructor?.name);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);
        console.error("Error cause:", error?.cause);
        console.error("Error keys:", Object.keys(error || {}));
        
        // Log additional error details if available
        if (error?.response) {
            console.error("Error response:", error.response);
        }
        if (error?.request) {
            console.error("Error request:", error.request);
        }
        
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
