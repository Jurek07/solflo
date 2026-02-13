'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sol-purple to-sol-green bg-clip-text text-transparent">
            Solflo
          </h1>
          <WalletMultiButton />
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <h2 className="text-5xl font-bold text-center mb-6">
          Get paid in{' '}
          <span className="bg-gradient-to-r from-sol-purple to-sol-green bg-clip-text text-transparent">
            Solana
          </span>
        </h2>
        <p className="text-xl text-gray-400 text-center mb-10 max-w-2xl">
          Create a payment link in 30 seconds. Share it anywhere. 
          Accept SOL or USDC — no fees, no middlemen.
        </p>
        
        {connected ? (
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold text-lg hover:opacity-90 transition"
          >
            Go to Dashboard →
          </Link>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Connect your wallet to get started</p>
            <WalletMultiButton />
          </div>
        )}
      </section>

      {/* Features */}
      <section className="border-t border-gray-800 px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-sol-gray rounded-xl">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Setup</h3>
            <p className="text-gray-400">
              Connect wallet, create link, share. No signup forms, no waiting.
            </p>
          </div>
          <div className="p-6 bg-sol-gray rounded-xl">
            <div className="text-3xl mb-4">💸</div>
            <h3 className="text-xl font-semibold mb-2">Zero Fees</h3>
            <p className="text-gray-400">
              Direct wallet-to-wallet transfers. Only pay Solana network fees (~$0.001).
            </p>
          </div>
          <div className="p-6 bg-sol-gray rounded-xl">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Non-Custodial</h3>
            <p className="text-gray-400">
              We never touch your funds. Payments go directly to your wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          Built on Solana 🟣
        </div>
      </footer>
    </main>
  );
}
