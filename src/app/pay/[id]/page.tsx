'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { PaymentLink } from '@/types';
import { getPaymentLink, recordPayment } from '@/lib/supabase';
import { 
  createSolTransferTransaction, 
  createUsdcTransferTransaction,
  confirmTransaction,
  shortenAddress 
} from '@/lib/solana';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

type PaymentStatus = 'idle' | 'processing' | 'confirming' | 'success' | 'error';

export default function PayPage() {
  const params = useParams();
  const linkId = params.id as string;
  
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  
  const [mounted, setMounted] = useState(false);
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && linkId) {
      loadLink();
    }
  }, [mounted, linkId]);

  const loadLink = async () => {
    setLoading(true);
    const data = await getPaymentLink(linkId);
    setLink(data);
    setLoading(false);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#6B6B6B]">Loading...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <div className="card text-center max-w-sm w-full py-10">
          <div className="text-3xl mb-3">🔍</div>
          <div className="font-semibold mb-1">Not Found</div>
          <div className="text-sm text-[#6B6B6B] mb-5">This link doesn't exist</div>
          <Link href="/" className="btn-primary inline-block text-sm">
            Create a Link
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = link.singleUse && link.used;

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <div className="card text-center max-w-sm w-full py-10">
          <div className="w-12 h-12 bg-[#00D26A] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black text-xl">✓</span>
          </div>
          <div className="font-semibold mb-1">Already Paid</div>
          <div className="text-sm text-[#6B6B6B] mb-5">This link has been used</div>
          <Link href="/" className="btn-primary inline-block text-sm">
            Create a Link
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!publicKey || !connected) return;

    setStatus('processing');
    setError(null);

    try {
      const merchantPubkey = new PublicKey(link.merchantWallet);
      
      let transaction;
      if (link.currency === 'SOL') {
        transaction = await createSolTransferTransaction(
          connection,
          publicKey,
          merchantPubkey,
          link.amount
        );
      } else {
        transaction = await createUsdcTransferTransaction(
          connection,
          publicKey,
          merchantPubkey,
          link.amount
        );
      }

      const signature = await sendTransaction(transaction, connection);
      setTxSignature(signature);
      setStatus('confirming');

      const confirmed = await confirmTransaction(connection, signature);

      if (confirmed) {
        await recordPayment({
          linkId: link.id,
          payerWallet: publicKey.toString(),
          amount: link.amount,
          currency: link.currency,
          signature,
        });
        setStatus('success');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center">
        <Link href="/">
          <Logo />
        </Link>
        <WalletMultiButton />
      </header>

      {/* Payment */}
      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm animate-fade-in">
          {status === 'success' ? (
            <div className="card text-center py-10">
              <div className="w-14 h-14 bg-[#00D26A] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-2xl">✓</span>
              </div>
              <div className="text-xl font-semibold mb-1">Sent!</div>
              <div className="text-[#6B6B6B] mb-4">
                {link.amount} {link.currency} paid
              </div>
              
              {txSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00D26A] text-sm hover:underline"
                >
                  View transaction →
                </a>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="text-center mb-6">
                <div className="font-medium mb-1">{link.title}</div>
                {link.description && (
                  <div className="text-sm text-[#6B6B6B]">{link.description}</div>
                )}
              </div>

              {/* Amount */}
              <div className="bg-black rounded-xl p-6 mb-4 text-center">
                <div className="text-4xl font-bold mb-1">{link.amount}</div>
                <div className="text-[#6B6B6B]">{link.currency}</div>
              </div>

              {link.singleUse && (
                <div className="text-center text-sm text-[#00D26A] mb-4">
                  Single-use link
                </div>
              )}

              <div className="text-center text-sm text-[#6B6B6B] mb-4">
                To: {shortenAddress(link.merchantWallet)}
              </div>

              {error && (
                <div className="bg-[#E85454]/10 text-[#E85454] text-sm rounded-lg p-3 mb-4 text-center">
                  {error}
                </div>
              )}

              {!connected ? (
                <div className="text-center">
                  <div className="text-sm text-[#6B6B6B] mb-3">Connect wallet to pay</div>
                  <WalletMultiButton />
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={status === 'processing' || status === 'confirming'}
                  className="btn-primary w-full"
                >
                  {status === 'processing' && 'Processing...'}
                  {status === 'confirming' && 'Confirming...'}
                  {status === 'idle' && `Pay ${link.amount} ${link.currency}`}
                  {status === 'error' && 'Try Again'}
                </button>
              )}
            </div>
          )}

          <div className="text-center mt-4 text-xs text-[#6B6B6B]">
            Direct wallet-to-wallet · Solana
          </div>
        </div>
      </main>
    </div>
  );
}
