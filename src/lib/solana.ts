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
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// USDC token address on Solana (devnet and mainnet have different addresses)
export const USDC_MINT_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Devnet USDC
export const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC

export const USDC_DECIMALS = 6;

export async function createSolTransferTransaction(
  connection: Connection,
  from: PublicKey,
  to: PublicKey,
  amountSol: number
): Promise<Transaction> {
  const transaction = new Transaction();
  
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = from;

  return transaction;
}

export async function createUsdcTransferTransaction(
  connection: Connection,
  from: PublicKey,
  to: PublicKey,
  amountUsdc: number,
  usdcMint: PublicKey = USDC_MINT_DEVNET
): Promise<Transaction> {
  const transaction = new Transaction();

  const fromAta = await getAssociatedTokenAddress(usdcMint, from);
  const toAta = await getAssociatedTokenAddress(usdcMint, to);

  // Note: In production, you'd want to check if toAta exists and create it if not
  // For MVP, we assume the merchant has already created their USDC account

  transaction.add(
    createTransferInstruction(
      fromAta,
      toAta,
      from,
      Math.round(amountUsdc * Math.pow(10, USDC_DECIMALS)),
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = from;

  return transaction;
}

export async function confirmTransaction(
  connection: Connection,
  signature: string,
  timeoutMs: number = 30000
): Promise<boolean> {
  const start = Date.now();
  
  while (Date.now() - start < timeoutMs) {
    const status = await connection.getSignatureStatus(signature);
    
    if (status.value?.confirmationStatus === 'confirmed' || 
        status.value?.confirmationStatus === 'finalized') {
      return true;
    }
    
    if (status.value?.err) {
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
}

export function formatSol(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
