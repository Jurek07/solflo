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
        <div className="w-8 h-8 border-2 border-[#9945FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card text-center max-w-md w-full p-12">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-gray-400 mb-6">This payment link may have expired or been deleted.</p>
          <Link href="/" className="btn-primary inline-block">
            Create Your Own Link
          </Link>
        </div>
      </div>
    );
  }

  // Check if single-use link is already used
  const isExpired = link.singleUse && link.used;

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card text-center max-w-md w-full p-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Already Paid</h1>
          <p className="text-gray-400 mb-6">This payment link has already been used.</p>
          <Link href="/" className="btn-primary inline-block">
            Create Your Own Link
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
        // Record the payment in database
        await recordPayment({
          linkId: link.id,
          payerWallet: publicKey.toString(),
          amount: link.amount,
          currency: link.currency,
          signature,
        });
        setStatus('success');
      } else {
        throw new Error('Transaction failed to confirm');
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
      <header className="border-b border-[#262626] px-6 py-4 backdrop-blur-sm bg-[#0a0a0a]/80">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-bold gradient-text">Solflo</span>
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      {/* Payment Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {status === 'success' ? (
            // Success state
            <div className="card-glow text-center p-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Sent!</h2>
              <p className="text-gray-400 mb-6">
                {link.amount} {link.currency} has been sent successfully.
              </p>
              
              {txSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9945FF] hover:underline text-sm"
                >
                  View on Solana Explorer →
                </a>
              )}
            </div>
          ) : (
            // Payment form
            <div className="card-glow">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{link.title}</h2>
                {link.description && (
                  <p className="text-gray-400">{link.description}</p>
                )}
              </div>

              {/* Amount Display */}
              <div className="bg-[#0a0a0a] rounded-2xl p-8 mb-6 text-center border border-[#262626]">
                <div className="text-sm text-gray-500 mb-2">Amount Due</div>
                <div className="text-5xl font-bold gradient-text mb-1">
                  {link.amount}
                </div>
                <div className="text-xl text-gray-400">{link.currency}</div>
              </div>

              {link.singleUse && (
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 mb-6">
                  <span>⚡</span>
                  <span>Single-use link — expires after payment</span>
                </div>
              )}

              <div className="text-sm text-gray-500 mb-6 text-center">
                Paying to <span className="font-mono text-gray-400">{shortenAddress(link.merchantWallet)}</span>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {!connected ? (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Connect your wallet to pay</p>
                  <WalletMultiButton />
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={status === 'processing' || status === 'confirming'}
                  className="btn-primary w-full py-4 text-lg"
                >
                  {status === 'processing' && (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </span>
                  )}
                  {status === 'confirming' && (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Confirming...
                    </span>
                  )}
                  {status === 'idle' && `Pay ${link.amount} ${link.currency}`}
                  {status === 'error' && 'Try Again'}
                </button>
              )}
            </div>
          )}

          {/* Security note */}
          <div className="mt-6 text-center text-sm text-gray-600">
            🔒 Direct wallet-to-wallet transfer on Solana
          </div>
        </div>
      </main>
    </div>
  );
}
