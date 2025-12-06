# x402 Payment Integration Setup

This guide will help you set up x402 payments using Thirdweb on Monad testnet.

## Prerequisites

1. Node.js 18+
2. An EVM wallet (MetaMask recommended)
3. Access to Monad testnet funds

## Getting Testnet Tokens

### USDC on Monad Testnet
1. Visit [Circle's Faucet](https://faucet.circle.com)
2. Select **USDC** as the token
3. Select **Monad Testnet** from the Network dropdown
4. Enter your wallet address
5. Click **Send 1 USDC**

**Limit:** One request per (stablecoin, testnet) pair per hour

### MON for Gas Fees
Get testnet MON tokens from the [Monad faucet](https://faucet.monad.xyz)

## Environment Variables

Create a `.env.local` file in the `danomnoms-frontend-v0` directory with the following variables:

\`\`\`env
# Thirdweb Configuration
# Get these from https://thirdweb.com/dashboard
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
THIRDWEB_SECRET_KEY=your_secret_key_here

# Server Wallet Address (from Thirdweb dashboard > Wallets > Server Wallets)
SERVER_WALLET_ADDRESS=0xYourServerWalletAddress

# Base URL for your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

## Setting Up Thirdweb

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Sign in (wallet or email/Google)
3. Create a project
4. Go to **Settings → API Keys**
5. Copy your **Client ID** and **Secret Key**
6. Go to **Wallets → Server Wallets**
7. Copy your server wallet address (or create a new one)

## How It Works

1. User places an order through the chat interface
2. When user confirms the order, the app requests x402 payment
3. User's wallet is prompted to connect (if not already)
4. Payment is processed via x402 protocol on Monad testnet
5. Once payment is confirmed, the order is processed

## Payment Flow

- **Client-side**: Uses `wrapFetchWithPayment` to automatically handle payment requests
- **Server-side**: API route at `/api/payment` processes payments using Thirdweb's facilitator
- **Network**: Monad Testnet (configured in `app/api/payment/route.ts`)

## Resources

- [x402 on Monad Guide](https://docs.monad.xyz/guides/x402-guide)
- [Thirdweb x402 Documentation](https://portal.thirdweb.com/x402)
- [Monad Developer Discord](https://discord.gg/monad)
