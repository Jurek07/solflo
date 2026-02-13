'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { useStore } from '@/lib/store';
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
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  
  const link = useStore((s) => s.getLink(linkId));
  const recordPayment = useStore((s) => s.recordPayment);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Payment Link Not Found</h1>
        <p className="text-gray-400 mb-6">This link may have expired or been deleted.</p>
        <Link 
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold hover:opacity-90 transition"
        >
          Create Your Own Link
        </Link>
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
        // Record the payment
        recordPayment(link.id, {
          payerWallet: publicKey.toString(),
          amount: link.amount,
          currency: link.currency,
          signature,
          confirmedAt: new Date().toISOString(),
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
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold bg-gradient-to-r from-sol-purple to-sol-green bg-clip-text text-transparent">
              Solflo
            </h1>
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      {/* Payment Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-sol-gray rounded-2xl p-8">
            {status === 'success' ? (
              // Success state
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-2">Payment Sent!</h2>
                <p className="text-gray-400 mb-6">
                  Your payment of {link.amount} {link.currency} has been confirmed.
                </p>
                
                {txSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sol-purple hover:underline text-sm"
                  >
                    View on Solana Explorer →
                  </a>
                )}
              </div>
            ) : (
              // Payment form
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">{link.title}</h2>
                  {link.description && (
                    <p className="text-gray-400">{link.description}</p>
                  )}
                </div>

                <div className="bg-sol-dark rounded-xl p-6 mb-6 text-center">
                  <div className="text-sm text-gray-400 mb-1">Amount Due</div>
                  <div className="text-4xl font-bold">
                    {link.amount}
                    <span className="text-xl ml-2 text-gray-400">{link.currency}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-4 text-center">
                  Paying to: {shortenAddress(link.merchantWallet)}
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
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
                    className="w-full px-6 py-4 bg-gradient-to-r from-sol-purple to-sol-green rounded-lg font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {status === 'processing' && 'Processing...'}
                    {status === 'confirming' && 'Confirming...'}
                    {status === 'idle' && `Pay ${link.amount} ${link.currency}`}
                    {status === 'error' && 'Try Again'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Security note */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              🔒 Direct wallet-to-wallet transfer on Solana
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
