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
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// USDC token address on Solana mainnet
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

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
  amountUsdc: number
): Promise<Transaction> {
  const transaction = new Transaction();

  const fromAta = await getAssociatedTokenAddress(USDC_MINT, from);
  const toAta = await getAssociatedTokenAddress(USDC_MINT, to);

  // Check if recipient has a USDC token account
  const toAtaInfo = await connection.getAccountInfo(toAta);
  
  // If recipient doesn't have a USDC account, create one (sender pays)
  if (!toAtaInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        from,           // payer
        toAta,          // associated token account
        to,             // owner
        USDC_MINT,      // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Add transfer instruction
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
