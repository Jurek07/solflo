'use client';

import { useState } from 'react';
import { PaymentLink } from '@/types';
import { useStore } from '@/lib/store';
import { shortenAddress } from '@/lib/solana';

interface LinkCardProps {
  link: PaymentLink;
}

export function LinkCard({ link }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const deleteLink = useStore((s) => s.deleteLink);
  
  const linkUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pay/${link.id}`
    : `/pay/${link.id}`;

  const totalReceived = link.payments.reduce((sum, p) => sum + p.amount, 0);

  const copyLink = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this payment link?')) {
      deleteLink(link.id, link.merchantWallet);
    }
  };

  return (
    <div className="bg-sol-gray rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{link.title}</h3>
          {link.description && (
            <p className="text-gray-400 text-sm mt-1">{link.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {link.amount} {link.currency}
          </div>
          <div className="text-sm text-gray-400">
            {link.payments.length} payment{link.payments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Stats */}
      {link.payments.length > 0 && (
        <div className="bg-sol-dark rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-400 mb-1">Total Received</div>
          <div className="text-lg font-semibold text-sol-green">
            {totalReceived} {link.currency}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      {link.payments.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Recent Payments</div>
          <div className="space-y-2">
            {link.payments.slice(-3).reverse().map((payment) => (
              <div 
                key={payment.id}
                className="flex justify-between items-center text-sm bg-sol-dark rounded-lg px-3 py-2"
              >
                <span className="text-gray-300">
                  {shortenAddress(payment.payerWallet)}
                </span>
                <span className="text-sol-green">
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
          className="flex-1 px-4 py-2 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold text-sm hover:opacity-90 transition"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-600 transition"
        >
          Preview
        </a>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-gray-700 rounded-lg font-semibold text-sm hover:bg-red-600/50 transition"
        >
          Delete
        </button>
      </div>

      {/* Link URL */}
      <div className="mt-4 text-xs text-gray-500 break-all">
        {linkUrl}
      </div>
    </div>
  );
}
