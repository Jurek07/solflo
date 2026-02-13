'use client';

import { useState } from 'react';
import { PaymentLink } from '@/types';
import { deletePaymentLink } from '@/lib/supabase';
import { shortenAddress } from '@/lib/solana';

interface LinkCardProps {
  link: PaymentLink;
  onDeleted: () => void;
}

export function LinkCard({ link, onDeleted }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const linkUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pay/${link.id}`
    : `/pay/${link.id}`;

  const totalReceived = link.payments.reduce((sum, p) => sum + p.amount, 0);

  const copyLink = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this payment link?')) return;
    
    setDeleting(true);
    const success = await deletePaymentLink(link.id);
    if (success) {
      onDeleted();
    } else {
      alert('Failed to delete link. Please try again.');
    }
    setDeleting(false);
  };

  const isExpired = link.singleUse && link.used;

  return (
    <div className={`card ${isExpired ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold">{link.title}</h3>
            {link.singleUse && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isExpired 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {isExpired ? 'Used' : 'Single-use'}
              </span>
            )}
          </div>
          {link.description && (
            <p className="text-gray-500 text-sm">{link.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text">
            {link.amount} <span className="text-lg text-gray-400">{link.currency}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-[#0a0a0a] rounded-xl p-4 border border-[#262626]">
          <div className="text-xs text-gray-500 mb-1">Payments</div>
          <div className="text-xl font-semibold">{link.payments.length}</div>
        </div>
        <div className="flex-1 bg-[#0a0a0a] rounded-xl p-4 border border-[#262626]">
          <div className="text-xs text-gray-500 mb-1">Received</div>
          <div className="text-xl font-semibold gradient-text">{totalReceived} {link.currency}</div>
        </div>
      </div>

      {/* Recent Payments */}
      {link.payments.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Recent payments</div>
          <div className="space-y-2">
            {link.payments.slice(-3).reverse().map((payment) => (
              <div 
                key={payment.id}
                className="flex justify-between items-center text-sm bg-[#0a0a0a] rounded-lg px-4 py-3 border border-[#262626]"
              >
                <span className="text-gray-400 font-mono">
                  {shortenAddress(payment.payerWallet)}
                </span>
                <span className="text-[#14F195] font-medium">
                  +{payment.amount} {payment.currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={copyLink}
          disabled={isExpired}
          className="btn-primary flex-1 py-3"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary px-6 py-3"
        >
          Preview
        </a>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary px-6 py-3 hover:!bg-red-500/20 hover:!border-red-500/30 hover:!text-red-400"
        >
          {deleting ? '...' : 'Delete'}
        </button>
      </div>

      {/* Link URL */}
      <div className="mt-4 text-xs text-gray-600 font-mono truncate">
        {linkUrl}
      </div>
    </div>
  );
}
