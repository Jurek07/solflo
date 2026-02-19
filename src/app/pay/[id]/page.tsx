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

    const result = await confirmTransaction(connection, signature);

    if (result.success) {
      await recordPayment({
        linkId: link.id,
        payerWallet: publicKey.toString(),
        amount: link.amount,
        currency: link.currency,
        signature,
        isPrivate: false,
        merchantWallet: link.merchantWallet,
      });
      setStatus('success');
    } else {
      throw new Error(result.error || 'Transaction failed');
    }
  };

  const handlePrivatePayment = async () => {
    if (!publicKey || !signMessage || !signTransaction) {
      throw new Error('Wallet does not support signing');
    }

    setStatus('initializing');

    try {
      const { Buffer } = await import('buffer');
      if (typeof window !== 'undefined') (window as any).Buffer = Buffer;
      
      // Nuclear option: patch Object.prototype.toBuffer as catch-all for any PublicKey
      // This catches any webpack chunk's PublicKey that we might miss
      if (!(Object.prototype as any)._toBufferPatched) {
        Object.defineProperty(Object.prototype, 'toBuffer', {
          value: function() {
            if (this._bn) {
              return this._bn.toArrayLike(Buffer, 'be', 32);
            }
            throw new Error('toBuffer called on non-PublicKey object');
          },
          writable: true,
          configurable: true,
          enumerable: false,
        });
        (Object.prototype as any)._toBufferPatched = true;
        console.log('[pay] Nuclear toBuffer patch applied to Object.prototype');
      }
      
      // Dynamic import Privacy Cash SDK
      const utils: any = await import('privacycash/utils');
      const hasher: any = await import('@lightprotocol/hasher.rs');
      
      // Patch PublicKey prototype - get the class from SDK's token
      const SDKPublicKey = utils.tokens?.[0]?.pubkey?.constructor;
      if (SDKPublicKey && !SDKPublicKey.prototype._patched) {
        SDKPublicKey.prototype.toBuffer = function(): Buffer {
          // Use _bn directly - do NOT call toBytes() as it calls toBuffer() internally!
          const b = this._bn.toArrayLike(Buffer, 'be', 32);
          return b;
        };
        SDKPublicKey.prototype._patched = true;
        console.log('[pay] Patched SDK PublicKey.prototype.toBuffer');
      }

      // ALSO patch the PublicKey from our direct import (might be different class in webpack chunks)
      const { PublicKey: LocalPK } = await import('@solana/web3.js');
      if (!(LocalPK.prototype as any)._patched) {
        (LocalPK.prototype as any).toBuffer = function(): Buffer {
          const b = (this as any)._bn.toArrayLike(Buffer, 'be', 32);
          return b;
        };
        (LocalPK.prototype as any)._patched = true;
        console.log('[pay] Patched local PublicKey.prototype.toBuffer');
      }

      // Also try to patch any PublicKey from spl-token (might be yet another instance)
      try {
        const splToken = await import('@solana/spl-token');
        // spl-token re-exports or uses PublicKey internally - try to find it
        const anyPK = (splToken as any).PublicKey;
        if (anyPK && !(anyPK.prototype as any)._patched) {
          (anyPK.prototype as any).toBuffer = function(): Buffer {
            const b = (this as any)._bn.toArrayLike(Buffer, 'be', 32);
            return b;
          };
          (anyPK.prototype as any)._patched = true;
          console.log('[pay] Patched spl-token PublicKey.prototype.toBuffer');
        }
      } catch (e) {
        console.log('[pay] spl-token patch skipped:', e);
      }
      
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
        // Use token.pubkey from SDK's tokens array (same class, already patched)
        const usdcToken = utils.tokens.find((t: any) => t.name === 'usdc');
        if (!usdcToken) throw new Error('USDC token not found in SDK');
        
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
          mintAddress: usdcToken.pubkey,
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
        // Use token.pubkey from SDK's tokens array (same class, already patched)
        const usdcToken = utils.tokens.find((t: any) => t.name === 'usdc');
        if (!usdcToken) throw new Error('USDC token not found in SDK');
        
        withdrawResult = await withdrawSPL({
          connection,
          encryptionService,
          keyBasePath: circuitBasePath,
          publicKey,
          storage: localStorage,
          recipient: link.merchantWallet,
          lightWasm,
          mintAddress: usdcToken.pubkey,
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
        merchantWallet: link.merchantWallet,
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
                  href={`https://explorer.solana.com/tx/${txSignature}`}
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
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Private Payment
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
                    ? `Pay ${link.amount} ${link.currency} Privately`
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
