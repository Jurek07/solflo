'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { PaymentLink } from '@/types';
import { getPaymentLinksByWallet } from '@/lib/supabase';
import { CreateLinkModal } from '@/components/CreateLinkModal';
import { LinkCard } from '@/components/LinkCard';
import Link from 'next/link';

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    const data = await getPaymentLinksByWallet(publicKey.toString());
    setLinks(data);
    setLoading(false);
  }, [publicKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !connected) {
      router.push('/');
    }
  }, [connected, mounted, router]);

  useEffect(() => {
    if (mounted && connected && publicKey) {
      fetchLinks();
    }
  }, [mounted, connected, publicKey, fetchLinks]);

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

  const handleLinkCreated = () => {
    setShowCreateModal(false);
    fetchLinks();
  };

  const handleLinkDeleted = () => {
    fetchLinks();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#262626] px-6 py-4 backdrop-blur-sm bg-[#0a0a0a]/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold gradient-text">
              Solflo
            </h1>
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
            <p className="text-gray-500">Manage your payment links</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Create Link
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="text-gray-400 text-sm mb-1">Payment Links</div>
            <div className="text-3xl font-bold">{links.length}</div>
          </div>
          <div className="card">
            <div className="text-gray-400 text-sm mb-1">Total Payments</div>
            <div className="text-3xl font-bold">{totalPayments}</div>
          </div>
          <div className="card">
            <div className="text-gray-400 text-sm mb-1">Total Received</div>
            <div className="text-3xl font-bold gradient-text">
              {totalReceived.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Links List */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-[#9945FF] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-gray-400">Loading your payment links...</div>
          </div>
        ) : links.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">💸</div>
            <h3 className="text-xl font-semibold mb-2">No payment links yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first payment link to start receiving SOL or USDC
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Link
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} onDeleted={handleLinkDeleted} />
            ))}
          </div>
        )}
      </main>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleLinkCreated}
          merchantWallet={publicKey.toString()}
        />
      )}
    </div>
  );
}
