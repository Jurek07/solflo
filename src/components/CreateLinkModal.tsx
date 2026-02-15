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
  const [privatePayment, setPrivatePayment] = useState(false);
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
        privatePayment,
      });

      if (link) {
        const linkUrl = `${window.location.origin}/pay/${link.id}`;
        setCreatedLink(linkUrl);
      } else {
        setError('Failed to create link');
      }
    } catch (err) {
      console.error('Failed to create link:', err);
      setError('Failed to create link');
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

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-5 z-50">
      <div className="card w-full max-w-md animate-fade-in">
        {createdLink ? (
          // Success
          <div className="text-center">
            <div className="w-12 h-12 bg-[#00D26A] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-black text-xl">✓</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Link Created</h2>
            
            <div className="bg-black rounded-lg p-3 mb-4 text-sm font-mono text-[#6B6B6B] break-all text-left">
              {createdLink}
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {singleUse && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#00D26A]/10 text-[#00D26A]">
                  Single-use
                </span>
              )}
              {privatePayment && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button onClick={copyLink} className="btn-primary flex-1">
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={onCreated} className="btn-secondary flex-1">
                Done
              </button>
            </div>
          </div>
        ) : (
          // Form
          <>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">New Payment Link</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-[#1A1A1A] flex items-center justify-center text-[#6B6B6B] hover:text-white transition"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-[#E85454]/10 text-[#E85454] text-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6B6B6B] mb-1.5">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Design Work"
                    className="input"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-[#6B6B6B] mb-1.5">Amount</label>
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
                  <div className="w-24">
                    <label className="block text-sm text-[#6B6B6B] mb-1.5">Currency</label>
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

                <div>
                  <label className="block text-sm text-[#6B6B6B] mb-1.5">Description (optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this for?"
                    className="input"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {/* Single Use Toggle */}
                  <div className="flex items-center justify-between py-3 px-4 bg-black rounded-xl">
                    <div>
                      <div className="text-sm font-medium">Single-use</div>
                      <div className="text-xs text-[#6B6B6B]">Expires after 1 payment</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSingleUse(!singleUse)}
                      className={`w-11 h-6 rounded-full transition-colors ${
                        singleUse ? 'bg-[#00D26A]' : 'bg-[#1A1A1A]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          singleUse ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Private Payment Toggle */}
                  <div className={`py-3 px-4 bg-black rounded-xl border ${privatePayment ? 'border-purple-500/40' : 'border-purple-500/20'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Private Payment
                        </div>
                        <div className="text-xs text-[#6B6B6B]">Sender & receiver are anonymous</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPrivatePayment(!privatePayment)}
                        className={`w-11 h-6 rounded-full transition-colors ${
                          privatePayment ? 'bg-purple-500' : 'bg-[#1A1A1A]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            privatePayment ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    {privatePayment && (
                      <div className="mt-3 pt-3 border-t border-purple-500/20 text-xs text-[#6B6B6B]">
                        <div className="text-purple-400 mb-1">Privacy fees (paid by sender):</div>
                        <div>• 0.008 SOL + 0.35% of amount</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating || !title || !amount}
                className="btn-primary w-full mt-5"
              >
                {isCreating ? 'Creating...' : 'Create Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
