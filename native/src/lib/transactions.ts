import {
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js';
import {
  createTransferInstruction,
} from '@solana/spl-token';
import { RPC_ENDPOINT, USDC_MINT } from './constants';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

interface PaymentParams {
  payerPublicKey: PublicKey;
  recipientAddress: string;
  amount: number;
  currency: 'SOL' | 'USDC';
}

export async function buildPaymentTransaction(params: PaymentParams): Promise<VersionedTransaction> {
  const { payerPublicKey, recipientAddress, amount, currency } = params;
  const recipientPublicKey = new PublicKey(recipientAddress);

  const { blockhash } = await connection.getLatestBlockhash();
  const instructions = [];

  if (currency === 'SOL') {
    const lamports = Math.round(amount * LAMPORTS_PER_SOL);
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: payerPublicKey,
        toPubkey: recipientPublicKey,
        lamports,
      })
    );
  } else {
    // USDC — look up token accounts via RPC to avoid toBuffer() / PDA derivation issues
    const usdcDecimals = 6;
    const tokenAmount = Math.round(amount * Math.pow(10, usdcDecimals));

    const [payerAccounts, recipientAccounts] = await Promise.all([
      connection.getTokenAccountsByOwner(payerPublicKey, { mint: USDC_MINT }),
      connection.getTokenAccountsByOwner(recipientPublicKey, { mint: USDC_MINT }),
    ]);

    if (payerAccounts.value.length === 0) {
      throw new Error('You have no USDC balance');
    }
    if (recipientAccounts.value.length === 0) {
      throw new Error('Recipient has no USDC account');
    }

    const payerTokenAccount = payerAccounts.value[0].pubkey;
    const recipientTokenAccount = recipientAccounts.value[0].pubkey;

    instructions.push(
      createTransferInstruction(
        payerTokenAccount,
        recipientTokenAccount,
        payerPublicKey,
        tokenAmount,
      )
    );
  }

  // VersionedTransaction serializes with Uint8Array — no toBuffer() calls at all
  const message = new TransactionMessage({
    payerKey: payerPublicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  return new VersionedTransaction(message);
}

export async function getSOLBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

export async function getUSDCBalance(publicKey: PublicKey): Promise<number> {
  try {
    const accounts = await connection.getTokenAccountsByOwner(publicKey, { mint: USDC_MINT });
    if (accounts.value.length === 0) return 0;
    const info = await connection.getTokenAccountBalance(accounts.value[0].pubkey);
    return Number(info.value.amount) / Math.pow(10, 6);
  } catch {
    return 0;
  }
}

export async function confirmTransaction(signature: string): Promise<boolean> {
  try {
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    return !confirmation.value.err;
  } catch {
    return false;
  }
}
