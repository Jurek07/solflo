'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00D26A] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-semibold">
            <span className="text-white">sol</span>
            <span className="text-[#00D26A]">flo</span>
          </span>
        </div>
        <WalletMultiButton />
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 py-16">
        <div className="text-center max-w-lg animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Payment links for <span className="text-[#00D26A]">Solana</span>
          </h1>
          
          <p className="text-[#6B6B6B] text-lg mb-8">
            Accept SOL & USDC. No fees. Direct to wallet.
          </p>
          
          {connected ? (
            <Link href="/dashboard" className="btn-primary inline-block">
              Open Dashboard
            </Link>
          ) : (
            <WalletMultiButton />
          )}
        </div>

        {/* Stats */}
        <div className="mt-16 flex gap-12 text-center">
          <div>
            <div className="text-2xl font-bold text-[#00D26A]">0%</div>
            <div className="text-sm text-[#6B6B6B]">Fees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">&lt;1s</div>
            <div className="text-sm text-[#6B6B6B]">Settlement</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">$0.001</div>
            <div className="text-sm text-[#6B6B6B]">Network cost</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-12 border-t border-[#1A1A1A]">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center text-lg">
                ⚡
              </div>
              <div>
                <div className="font-medium">Instant</div>
                <div className="text-sm text-[#6B6B6B]">Create links in seconds</div>
              </div>
            </div>
            
            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center text-lg">
                🔒
              </div>
              <div>
                <div className="font-medium">Non-custodial</div>
                <div className="text-sm text-[#6B6B6B]">Funds go directly to your wallet</div>
              </div>
            </div>
            
            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center text-lg">
                🔗
              </div>
              <div>
                <div className="font-medium">Single-use links</div>
                <div className="text-sm text-[#6B6B6B]">Auto-expire after payment</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 text-center text-sm text-[#6B6B6B]">
        Built on Solana
      </footer>
    </main>
  );
}
