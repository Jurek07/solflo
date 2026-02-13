'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
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

type PaymentStatus = 'idle' | 'initializing' | 'processing' | 'confirming' | 'success' | 'error';

export default function PayPage() {
  const params = useParams();
  const linkId = params.id as string;
  
  const { publicKey, signMessage, signTransaction, sendTransaction, connected } = useWallet();
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
      if (link.privatePayment) {
        // Private payment flow
        await handlePrivatePayment();
      } else {
        // Regular payment flow
        await handleRegularPayment();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  const handleRegularPayment = async () => {
    if (!publicKey || !signTransaction) return;

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
        isPrivate: false,
      });
      setStatus('success');
    } else {
      throw new Error('Transaction failed');
    }
  };

  const handlePrivatePayment = async () => {
    if (!publicKey || !signMessage || !signTransaction) {
      throw new Error('Wallet does not support signing');
    }

    setStatus('initializing');

    try {
      // Dynamic import Privacy Cash SDK - exports are in privacycash/utils
      const utils: any = await import('privacycash/utils');
      const hasher: any = await import('@lightprotocol/hasher.rs');
      
      const { EncryptionService, deposit, withdraw, depositSPL, withdrawSPL } = utils;
      const WasmFactory = hasher.WasmFactory || hasher.default?.WasmFactory;

      const lightWasm = await WasmFactory.getInstance();

      // Sign message to derive encryption key
      const encodedMessage = new TextEncoder().encode('Privacy Money account sign in');
      let signature = await signMessage(encodedMessage);

      // Handle signature format
      if ((signature as any).signature) {
        signature = (signature as any).signature;
      }

      const encryptionService = new EncryptionService();
      encryptionService.deriveEncryptionKeyFromSignature(signature);

      setStatus('processing');

      const amountInSmallestUnit = link.currency === 'SOL' 
        ? Math.round(link.amount * LAMPORTS_PER_SOL)
        : Math.round(link.amount * 1_000_000); // USDC decimals

      // Circuit files served from /public folder
      const circuitBasePath = '/circuit2';
      
      // Step 1: Deposit to private pool
      if (link.currency === 'SOL') {
        await deposit({
          lightWasm,
          connection,
          amount_in_lamports: amountInSmallestUnit,
          keyBasePath: circuitBasePath,
          publicKey,
          transactionSigner: async (tx: any) => {
            return await signTransaction(tx);
          },
          storage: localStorage,
          encryptionService,
        });
      } else {
        const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        await depositSPL({
          referrer: '',
          lightWasm,
          connection,
          base_units: amountInSmallestUnit,
          keyBasePath: circuitBasePath,
          publicKey,
          transactionSigner: async (tx: any) => {
            return await signTransaction(tx);
          },
          storage: localStorage,
          encryptionService,
          mintAddress: USDC_MINT,
        });
      }

      setStatus('confirming');

      // Step 2: Withdraw to merchant (anonymously)
      let withdrawResult;
      if (link.currency === 'SOL') {
        withdrawResult = await withdraw({
          amount_in_lamports: amountInSmallestUnit,
          connection,
          encryptionService,
          keyBasePath: circuitBasePath,
          publicKey,
          storage: localStorage,
          recipient: link.merchantWallet,
          lightWasm,
        });
      } else {
        const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        withdrawResult = await withdrawSPL({
          connection,
          encryptionService,
          keyBasePath: circuitBasePath,
          publicKey,
          storage: localStorage,
          recipient: link.merchantWallet,
          lightWasm,
          mintAddress: USDC_MINT,
          amount: amountInSmallestUnit,
        });
      }

      const sig = withdrawResult?.signature || 'private-payment';
      setTxSignature(sig);

      // Record payment (wallet hidden)
      await recordPayment({
        linkId: link.id,
        payerWallet: 'private',
        amount: link.amount,
        currency: link.currency,
        signature: sig,
        isPrivate: true,
      });

      setStatus('success');
    } catch (err: any) {
      console.error('Private payment error:', err);
      throw new Error(err.message || 'Private payment failed');
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
              <div className="text-xl font-semibold mb-1">
                {link.privatePayment ? 'Private Payment Sent!' : 'Sent!'}
              </div>
              <div className="text-[#6B6B6B] mb-4">
                {link.amount} {link.currency} paid
                {link.privatePayment && ' anonymously'}
              </div>
              
              {txSignature && txSignature !== 'private-payment' && (
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

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {link.singleUse && (
                  <span className="text-xs px-2 py-1 rounded-full bg-[#00D26A]/10 text-[#00D26A]">
                    Single-use
                  </span>
                )}
                {link.privatePayment && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
                    🔒 Private Payment
                  </span>
                )}
              </div>

              {link.privatePayment ? (
                <div className="text-center text-sm text-purple-400 mb-4">
                  Your identity will be hidden
                </div>
              ) : (
                <div className="text-center text-sm text-[#6B6B6B] mb-4">
                  To: {shortenAddress(link.merchantWallet)}
                </div>
              )}

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
                  disabled={status !== 'idle' && status !== 'error'}
                  className={`w-full py-3 rounded-full font-semibold transition ${
                    link.privatePayment 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                      : 'btn-primary'
                  } disabled:opacity-50`}
                >
                  {status === 'initializing' && 'Initializing privacy...'}
                  {status === 'processing' && 'Processing...'}
                  {status === 'confirming' && 'Confirming...'}
                  {status === 'idle' && (link.privatePayment 
                    ? `🔒 Pay ${link.amount} ${link.currency} Privately`
                    : `Pay ${link.amount} ${link.currency}`
                  )}
                  {status === 'error' && 'Try Again'}
                </button>
              )}
            </div>
          )}

          <div className="text-center mt-4 text-xs text-[#6B6B6B]">
            {link.privatePayment 
              ? 'Powered by Privacy Cash · Solana' 
              : 'Direct wallet-to-wallet · Solana'
            }
          </div>
        </div>
      </main>
    </div>
  );
}
