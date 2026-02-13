# Solflo

Simple payment links for Solana. Create a link, share it, get paid in SOL or USDC.

## Features

- ⚡ **Instant Setup** — Connect wallet, create link, share
- 💸 **Zero Fees** — Direct wallet-to-wallet transfers (only network fees)
- 🔒 **Non-Custodial** — We never touch your funds
- 🌐 **SOL & USDC** — Accept either currency

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd solflo
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment

The app uses Solana devnet by default. To switch to mainnet, update `src/components/Providers.tsx`:

```typescript
const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
```

And update the USDC mint address in `src/lib/solana.ts`:

```typescript
// Use USDC_MINT_MAINNET instead of USDC_MINT_DEVNET
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** Zustand (with localStorage persistence)
- **Blockchain:** Solana Web3.js + Wallet Adapter

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Merchant dashboard
│   └── pay/[id]/          # Payment page
├── components/
│   ├── Providers.tsx      # Wallet & connection providers
│   ├── CreateLinkModal.tsx
│   └── LinkCard.tsx
├── lib/
│   ├── store.ts           # Zustand store
│   └── solana.ts          # Solana helpers
└── types/
    └── index.ts           # TypeScript types
```

## Roadmap

- [ ] Database backend (Supabase/Postgres)
- [ ] User authentication
- [ ] Custom branding
- [ ] Invoicing with due dates
- [ ] Recurring payments
- [ ] Payment notifications (email/webhook)
- [ ] Fiat conversion display

## License

MIT
