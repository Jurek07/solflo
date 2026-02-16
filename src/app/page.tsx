'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center">
        <Logo />
        <WalletMultiButton />
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 py-16">
        <div className="text-center max-w-lg animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Payment links for <span className="text-[#00D26A] glow-green">Solana</span>
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
            <div className="card flex items-center gap-4 cursor-pointer hover:border-[#00D26A]/30 transition-colors duration-200">
              <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Instant</div>
                <div className="text-sm text-[#6B6B6B]">Create links in seconds</div>
              </div>
            </div>
            
            <div className="card flex items-center gap-4 cursor-pointer hover:border-[#00D26A]/30 transition-colors duration-200">
              <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Non-custodial</div>
                <div className="text-sm text-[#6B6B6B]">Funds go directly to your wallet</div>
              </div>
            </div>
            
            <div className="card flex items-center gap-4 cursor-pointer hover:border-[#00D26A]/30 transition-colors duration-200">
              <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
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
        <div className="flex items-center justify-center gap-4 mb-3">
          <a
            href="https://x.com/SolFloLab"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a
            href="https://github.com/Jurek07/solflo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <Link href="/privacy" className="hover:text-white transition">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/license" className="hover:text-white transition">
            License
          </Link>
          <span>·</span>
          <Link href="/copyright" className="hover:text-white transition">
            Copyright
          </Link>
        </div>
        <div>
          Built by{' '}
          <a
            href="https://x.com/JurekSol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D9BF0] hover:underline"
          >
            @JurekSol
          </a>
        </div>
      </footer>
    </main>
  );
}
