'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#262626] px-6 py-4 backdrop-blur-sm bg-[#0a0a0a]/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">
            Solflo
          </h1>
          <WalletMultiButton />
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="animate-fade-in text-center max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#262626] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"></span>
            <span className="text-sm text-gray-400">Powered by Solana</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Get paid in{' '}
            <span className="gradient-text">seconds</span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Create payment links and accept SOL or USDC instantly. 
            No fees, no middlemen — direct to your wallet.
          </p>
          
          {connected ? (
            <Link href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard →
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <WalletMultiButton />
              <p className="text-sm text-gray-500">Connect wallet to get started</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-3 gap-8 md:gap-16 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div>
            <div className="text-3xl md:text-4xl font-bold gradient-text">~$0.001</div>
            <div className="text-sm text-gray-500 mt-1">Network fee</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold gradient-text">&lt;1s</div>
            <div className="text-sm text-gray-500 mt-1">Settlement</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold gradient-text">0%</div>
            <div className="text-sm text-gray-500 mt-1">Platform fee</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#262626] px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16">
            Why <span className="gradient-text">Solflo</span>?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Instant Setup</h4>
              <p className="text-gray-400 leading-relaxed">
                Connect your wallet, create a link, and share it. No sign-up forms, no waiting.
              </p>
            </div>
            
            <div className="card group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💸</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Zero Fees</h4>
              <p className="text-gray-400 leading-relaxed">
                Direct wallet-to-wallet transfers. Only pay Solana network fees (~$0.001).
              </p>
            </div>
            
            <div className="card group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Non-Custodial</h4>
              <p className="text-gray-400 leading-relaxed">
                We never touch your funds. Payments go directly to your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-glow p-12 animate-pulse-glow">
            <h3 className="text-3xl font-bold mb-4">Ready to get paid?</h3>
            <p className="text-gray-400 mb-8">
              Create your first payment link in under 30 seconds.
            </p>
            {connected ? (
              <Link href="/dashboard" className="btn-primary inline-block">
                Create Payment Link
              </Link>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#262626] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">
            Built on <span className="gradient-text font-semibold">Solana</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition">Twitter</a>
            <a href="#" className="hover:text-white transition">Discord</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
