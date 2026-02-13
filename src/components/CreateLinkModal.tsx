'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Currency } from '@/types';

interface CreateLinkModalProps {
  onClose: () => void;
  merchantWallet: string;
}

export function CreateLinkModal({ onClose, merchantWallet }: CreateLinkModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('SOL');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const createLink = useStore((s) => s.createLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const link = createLink(merchantWallet, {
        title,
        amount: parseFloat(amount),
        currency,
        description: description || undefined,
      });

      const linkUrl = `${window.location.origin}/pay/${link.id}`;
      setCreatedLink(linkUrl);
    } catch (err) {
      console.error('Failed to create link:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-sol-gray rounded-2xl p-6 w-full max-w-md">
        {createdLink ? (
          // Success state
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Link Created!</h2>
            <p className="text-gray-400 mb-6">Share this link to receive payments</p>
            
            <div className="bg-sol-dark rounded-lg p-3 mb-4 break-all text-sm">
              {createdLink}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold hover:opacity-90 transition"
              >
                Copy Link
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
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
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Logo Design, Consulting Hour"
                    className="w-full px-4 py-3 bg-sol-dark rounded-lg border border-gray-700 focus:border-sol-purple focus:outline-none"
                    required
                  />
                </div>

                {/* Amount & Currency */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-sol-dark rounded-lg border border-gray-700 focus:border-sol-purple focus:outline-none"
                      required
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-sm text-gray-400 mb-1">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-full px-4 py-3 bg-sol-dark rounded-lg border border-gray-700 focus:border-sol-purple focus:outline-none"
                    >
                      <option value="SOL">SOL</option>
                      <option value="USDC">USDC</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about what this payment is for..."
                    className="w-full px-4 py-3 bg-sol-dark rounded-lg border border-gray-700 focus:border-sol-purple focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating || !title || !amount}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Payment Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
