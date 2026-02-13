'use client';

import { useState } from 'react';
import { createPaymentLink } from '@/lib/supabase';
import { Currency } from '@/types';

interface CreateLinkModalProps {
  onClose: () => void;
  onCreated: () => void;
  merchantWallet: string;
}

export function CreateLinkModal({ onClose, onCreated, merchantWallet }: CreateLinkModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('SOL');
  const [description, setDescription] = useState('');
  const [singleUse, setSingleUse] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const link = await createPaymentLink({
        merchantWallet,
        title,
        amount: parseFloat(amount),
        currency,
        description: description || undefined,
        singleUse,
      });

      if (link) {
        const linkUrl = `${window.location.origin}/pay/${link.id}`;
        setCreatedLink(linkUrl);
      } else {
        setError('Failed to create payment link. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create link:', err);
      setError('Failed to create payment link. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card w-full max-w-md">
        {createdLink ? (
          // Success state
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Link Created!</h2>
            <p className="text-gray-400 mb-6">Share this link to receive payments</p>
            
            <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 mb-4 break-all text-sm text-left font-mono">
              {createdLink}
            </div>

            {singleUse && (
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 mb-6">
                <span>⚡</span>
                <span>Single-use: expires after one payment</span>
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={copyLink} className="btn-primary flex-1">
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
              <button onClick={handleDone} className="btn-secondary flex-1">
                Done
              </button>
            </div>
          </div>
        ) : (
          // Form state
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Payment Link</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Logo Design, Consulting Hour"
                    className="input"
                    required
                  />
                </div>

                {/* Amount & Currency */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="input"
                      required
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm text-gray-400 mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="input"
                    >
                      <option value="SOL">SOL</option>
                      <option value="USDC">USDC</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Description <span className="text-gray-600">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about what this payment is for..."
                    className="input resize-none"
                    rows={3}
                  />
                </div>

                {/* Single Use Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#262626]">
                  <div>
                    <label className="text-sm font-medium">Single-use link</label>
                    <p className="text-xs text-gray-500 mt-0.5">Expires after one payment</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSingleUse(!singleUse)}
                    className={`w-12 h-7 rounded-full transition-all ${
                      singleUse 
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195]' 
                        : 'bg-[#262626]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-all shadow-lg ${
                        singleUse ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating || !title || !amount}
                className="btn-primary w-full mt-6"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating...
                  </span>
                ) : (
                  'Create Payment Link'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
