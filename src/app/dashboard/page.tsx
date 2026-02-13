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
import { Logo } from '@/components/Logo';
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
        <div className="text-[#6B6B6B]">Loading...</div>
      </div>
    );
  }

  const totalReceivedSOL = links.reduce((sum, link) => {
    return sum + link.payments
      .filter(p => p.currency === 'SOL')
      .reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);

  const totalReceivedUSDC = links.reduce((sum, link) => {
    return sum + link.payments
      .filter(p => p.currency === 'USDC')
      .reduce((pSum, p) => pSum + p.amount, 0);
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
      <header className="px-5 py-4 flex justify-between items-center border-b border-[#1A1A1A]">
        <Link href="/">
          <Logo />
        </Link>
        <WalletMultiButton />
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center py-4">
            <div className="text-2xl font-bold">{links.length}</div>
            <div className="text-xs text-[#6B6B6B]">Links</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-2xl font-bold">{totalPayments}</div>
            <div className="text-xs text-[#6B6B6B]">Payments</div>
          </div>
          <div className="card text-center py-4">
            <div className="text-lg font-bold text-[#00D26A]">
              {totalReceivedSOL > 0 && <span>{totalReceivedSOL.toFixed(2)} SOL</span>}
              {totalReceivedSOL > 0 && totalReceivedUSDC > 0 && <br />}
              {totalReceivedUSDC > 0 && <span>{totalReceivedUSDC.toFixed(2)} USDC</span>}
              {totalReceivedSOL === 0 && totalReceivedUSDC === 0 && <span>0</span>}
            </div>
            <div className="text-xs text-[#6B6B6B]">Received</div>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary w-full mb-6"
        >
          + Create Payment Link
        </button>

        {/* Links List */}
        {loading ? (
          <div className="text-center py-12 text-[#6B6B6B]">
            Loading...
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#6B6B6B] mb-2">No payment links yet</div>
            <div className="text-sm text-[#6B6B6B]">Create one to start receiving payments</div>
          </div>
        ) : (
          <div className="space-y-3">
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
