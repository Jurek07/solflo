'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { CreateLinkModal } from '@/components/CreateLinkModal';
import { LinkCard } from '@/components/LinkCard';

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const links = useStore((s) => 
    publicKey ? s.getLinksByWallet(publicKey.toString()) : []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !connected) {
      router.push('/');
    }
  }, [connected, mounted, router]);

  if (!mounted || !connected || !publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const totalReceived = links.reduce((sum, link) => {
    return sum + link.payments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);

  const totalPayments = links.reduce((sum, link) => sum + link.payments.length, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sol-purple to-sol-green bg-clip-text text-transparent">
            Solflo
          </h1>
          <WalletMultiButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-sol-gray rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Payment Links</div>
            <div className="text-3xl font-bold">{links.length}</div>
          </div>
          <div className="bg-sol-gray rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Total Payments</div>
            <div className="text-3xl font-bold">{totalPayments}</div>
          </div>
          <div className="bg-sol-gray rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Total Received</div>
            <div className="text-3xl font-bold text-sol-green">
              ${totalReceived.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Payment Links</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold hover:opacity-90 transition"
          >
            + Create Link
          </button>
        </div>

        {/* Links List */}
        {links.length === 0 ? (
          <div className="bg-sol-gray rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-semibold mb-2">No payment links yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first payment link to start receiving SOL or USDC
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold hover:opacity-90 transition"
            >
              Create Your First Link
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </main>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          merchantWallet={publicKey.toString()}
        />
      )}
    </div>
  );
}
