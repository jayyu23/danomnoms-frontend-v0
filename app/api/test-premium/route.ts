// app/api/test-premium/route.ts
import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import { monadTestnet } from "thirdweb/chains";

const client = createThirdwebClient({ secretKey: process.env.THIRDWEB_SECRET_KEY || "" });

const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: process.env.SERVER_WALLET_ADDRESS || "",
});

export async function GET(request: Request) {
  // process the payment
  const result = await settlePayment({
    resourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/test-premium`,
    method: "GET",
    paymentData: request.headers.get("x-payment"),
    network: monadTestnet,
    price: "$0.01",
    facilitator: thirdwebX402Facilitator,
  });

  if (result.status === 200) {
    // Payment successful, continue to app logic
    return Response.json({ data: "premium content" });
  } else {
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
}