// app/api/checkout/route.ts
import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import { monadTestnet } from "thirdweb/chains";

const client = createThirdwebClient({ secretKey: process.env.THIRDWEB_SECRET_KEY || "" });

const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || "",
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");

  if (!amount || !orderId) {
    return Response.json(
      { error: "Missing amount or orderId parameter" },
      { status: 400 }
    );
  }

  // Divide by 1000 for demo pricing (e.g., $24.42 -> $0.02442)
  const demoAmount = parseFloat(amount) / 1000;

  // process the payment
  const result = await settlePayment({
    resourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/checkout?amount=${amount}&orderId=${orderId}`,
    method: "GET",
    paymentData: request.headers.get("x-payment"),
    network: monadTestnet,
    price: `$${demoAmount.toFixed(5)}`,
    facilitator: thirdwebX402Facilitator,
  });

  if (result.status === 200) {
    // Payment successful, continue to app logic
    // Extract transaction hash from payment receipt
    // paymentReceipt.transaction is a string (transaction hash)
    const txHash = result.paymentReceipt?.transaction || null;
    
    return Response.json({
      success: true,
      message: "Payment successful! Order confirmed.",
      tx: txHash,
      orderId,
    });
  } else {
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
}
