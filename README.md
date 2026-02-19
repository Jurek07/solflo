# SolFloLab

Payment links for Solana with optional end-to-end privacy.

**Live:** https://solflolab.com  
**Android App:** Available on Solana dApp Store (Seeker)

## Features

- ⚡ **Instant** — Create a payment link in seconds
- 💸 **Zero Fees** — Direct wallet-to-wallet transfers (only network fees)
- 🔒 **Non-Custodial** — Funds go directly to your wallet
- 🪙 **SOL & USDC** — Accept either currency
- 🔐 **Private Payments** — Optional ZK-powered privacy for SOL (sender AND receiver anonymous)
- 🔗 **Single-Use Links** — Auto-expire after one payment
- 📱 **Native Mobile App** — React Native app for Android (Solana Mobile)

## How It Works

1. Connect your Solana wallet
2. Create a payment link (set amount, currency, optional privacy)
3. Share the link with your customer
4. They pay directly to your wallet

For private payments, funds flow through Privacy Cash's ZK pool — neither the sender's nor receiver's wallet is visible on-chain.

## Privacy Feature

SolFloLab is the first Solana payment link service with **privacy on both ends**:
- Sender wallet: Hidden
- Receiver wallet: Hidden
- Powered by zero-knowledge proofs via [Privacy Cash SDK](https://privacycash.org)

> **Note:** Private payments are currently available for **SOL only**. USDC support coming soon.

Privacy fees (paid by sender): 0.008 SOL + 0.35% of amount

## Tech Stack

### Web App
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Blockchain:** Solana Web3.js + Wallet Adapter
- **Privacy:** Privacy Cash SDK + Light Protocol WASM
- **RPC:** Helius
- **Hosting:** Vercel

### Mobile App
- **Framework:** React Native + Expo
- **Wallet:** Solana Mobile Wallet Adapter
- **Navigation:** React Navigation
- **Package:** `com.solflolab.app`

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Web App Installation

```bash
git clone https://github.com/Jurek07/solflo.git
cd solflo
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run `supabase-schema.sql` in your Supabase SQL editor to create the required tables.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Mobile App Development

```bash
cd native
npm install
npx expo start
```

### Building Android APK

```bash
cd native
npm install
npx expo prebuild --platform android
cd android
./gradlew app:assembleRelease
```

APK location: `native/android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
solflo/
├── src/                    # Next.js web app
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── dashboard/      # Merchant dashboard
│   │   └── pay/[id]/       # Payment page
│   ├── components/
│   └── lib/
├── native/                 # React Native mobile app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # UI components
│   │   ├── contexts/       # Wallet context
│   │   └── lib/            # Utils & Supabase
│   └── android/            # Android build files
├── android/                # Capacitor (legacy)
└── public/                 # Static assets & circuit files
```

## Built By

This project was designed and built autonomously by **Dembe**, an AI agent running on [OpenClaw](https://openclaw.ai), in collaboration with [@JurekSol](https://x.com/JurekSol).

The entire codebase — from architecture decisions to webpack WASM bundling fixes to UI design — was created through human-AI conversation (vibecoding).

## Links

- **Website:** https://solflolab.com
- **Twitter/X:** https://x.com/SolFloLab
- **Builder:** https://x.com/JurekSol
- **AI Agent:** Built with [OpenClaw](https://openclaw.ai)

## License

MIT
