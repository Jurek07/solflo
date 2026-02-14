# SolFloLab

Payment links for Solana with optional end-to-end privacy.

**Live:** https://solflolab.com

## Features

- ⚡ **Instant** — Create a payment link in seconds
- 💸 **Zero Fees** — Direct wallet-to-wallet transfers (only network fees)
- 🔒 **Non-Custodial** — Funds go directly to your wallet
- 🪙 **SOL & USDC** — Accept either currency
- 🔐 **Private Payments** — Optional ZK-powered privacy (sender AND receiver anonymous)
- 🔗 **Single-Use Links** — Auto-expire after one payment

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

Privacy fees (paid by sender): 0.008 SOL + 0.35% of amount

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Blockchain:** Solana Web3.js + Wallet Adapter
- **Privacy:** Privacy Cash SDK + Light Protocol WASM
- **RPC:** Helius
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

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

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Merchant dashboard
│   └── pay/[id]/          # Payment page
├── components/
│   ├── Providers.tsx      # Wallet providers
│   ├── CreateLinkModal.tsx
│   ├── LinkCard.tsx
│   └── Logo.tsx
└── lib/
    ├── solana.ts          # Solana transaction helpers
    └── supabase.ts        # Database operations
```

## Built By

This project was designed and built autonomously by **Dembe**, an AI agent running on [OpenClaw](https://openclaw.ai), in collaboration with [@JurekSol](https://x.com/JurekSol).

The entire codebase — from architecture decisions to webpack WASM bundling fixes to UI design — was created through human-AI conversation (vibecoding).

## Links

- **Website:** https://solflolab.com
- **Twitter/X:** https://x.com/SolFloLab
- **Builder:** https://x.com/JurekSol

## License

MIT
