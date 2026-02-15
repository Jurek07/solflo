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
  const isExpired = link.singleUse && link.used;

  const copyLink = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this payment link?')) return;
    
    setDeleting(true);
    const success = await deletePaymentLink(link.id);
    if (success) {
      onDeleted();
    }
    setDeleting(false);
  };

  return (
    <div className={`card ${isExpired ? 'opacity-50' : ''} hover:border-[#1A1A1A] transition-colors duration-200`}>
      {/* Header Row */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{link.title}</span>
            {link.singleUse && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isExpired 
                  ? 'bg-[#E85454]/10 text-[#E85454]' 
                  : 'bg-[#00D26A]/10 text-[#00D26A]'
              }`}>
                {isExpired ? 'Used' : '1-time'}
              </span>
            )}
            {link.privatePayment && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Private
              </span>
            )}
          </div>
          {link.description && (
            <div className="text-sm text-[#6B6B6B] mt-0.5">{link.description}</div>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold">{link.amount} {link.currency}</div>
          {link.payments.length > 0 && (
            <div className="text-sm text-[#00D26A]">+{totalReceived} received</div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      {link.payments.length > 0 && (
        <div className="mb-3 space-y-1">
          {link.payments.slice(-2).reverse().map((payment) => (
            <div 
              key={payment.id}
              className="flex justify-between text-sm py-2 px-3 bg-black rounded-lg"
            >
              <span className="text-[#6B6B6B] font-mono text-xs flex items-center gap-1">
                {payment.isPrivate ? (
                  <>
                    <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-purple-400">Private</span>
                  </>
                ) : shortenAddress(payment.payerWallet)}
              </span>
              <span className="text-[#00D26A]">
                +{payment.amount}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={copyLink}
          disabled={isExpired}
          className="btn-primary flex-1 text-sm py-2.5"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-secondary px-4 text-sm py-2.5 hover:border-[#E85454] hover:text-[#E85454]"
        >
          {deleting ? '...' : '×'}
        </button>
      </div>
    </div>
  );
}
