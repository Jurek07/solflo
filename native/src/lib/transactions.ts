import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import { RPC_ENDPOINT, USDC_MINT } from './constants';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

interface PaymentParams {
  payerPublicKey: PublicKey;
  recipientAddress: string;
  amount: number;
  currency: 'SOL' | 'USDC';
}

export async function buildPaymentTransaction(params: PaymentParams): Promise<Transaction> {
  const { payerPublicKey, recipientAddress, amount, currency } = params;
  const recipientPublicKey = new PublicKey(recipientAddress);

  const transaction = new Transaction();

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = payerPublicKey;

  if (currency === 'SOL') {
    // SOL transfer
    const lamports = Math.round(amount * LAMPORTS_PER_SOL);

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payerPublicKey,
        toPubkey: recipientPublicKey,
        lamports,
      })
    );
  } else {
    // USDC transfer (SPL Token)
    const usdcDecimals = 6;
    const tokenAmount = Math.round(amount * Math.pow(10, usdcDecimals));

    // Get token accounts
    const payerTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      payerPublicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      recipientPublicKey
    );

    // Check if recipient has a token account
    try {
      await getAccount(connection, recipientTokenAccount);
    } catch {
      // Recipient doesn't have a token account, create one
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payerPublicKey, // payer
          recipientTokenAccount, // associated token account
          recipientPublicKey, // owner
          USDC_MINT // mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        payerTokenAccount,
        recipientTokenAccount,
        payerPublicKey,
        tokenAmount
      )
    );
  }

  return transaction;
}

export async function getSOLBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

export async function getUSDCBalance(publicKey: PublicKey): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount) / Math.pow(10, 6);
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
