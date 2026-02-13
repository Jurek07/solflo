'use client';

import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

// Privacy Cash SDK types
interface PrivacyConfig {
  connection: Connection;
  publicKey: PublicKey;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}

interface PrivacyState {
  lightWasm: any;
  encryptionService: any;
  signature: Uint8Array | null;
}

let privacyState: PrivacyState | null = null;

// Initialize Privacy Cash SDK
export async function initPrivacy(config: PrivacyConfig): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Dynamic import for browser only
    const { WasmFactory } = await import('@lightprotocol/hasher.rs');
    const { EncryptionService } = await import('privacycash');

    const lightWasm = await WasmFactory.getInstance();

    // Sign message to derive encryption key
    const encodedMessage = new TextEncoder().encode('Privacy Money account sign in');
    const signature = await config.signMessage(encodedMessage);

    // Handle signature format
    let sig = signature;
    if ((signature as any).signature) {
      sig = (signature as any).signature;
    }

    const encryptionService = new EncryptionService();
    encryptionService.deriveEncryptionKeyFromSignature(sig);

    privacyState = {
      lightWasm,
      encryptionService,
      signature: sig,
    };
  } catch (error) {
    console.error('Failed to initialize Privacy Cash:', error);
    throw new Error('Failed to initialize private payments');
  }
}

// Deposit SOL to private pool
export async function privateDeposit(
  connection: Connection,
  publicKey: PublicKey,
  amountLamports: number,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string> {
  if (!privacyState) {
    throw new Error('Privacy not initialized. Call initPrivacy first.');
  }

  const { deposit } = await import('privacycash');

  const result = await deposit({
    lightWasm: privacyState.lightWasm,
    connection,
    amount_in_lamports: amountLamports,
    keyBasePath: '/circuit2',
    publicKey,
    transactionSigner: async (tx: VersionedTransaction) => {
      return await signTransaction(tx);
    },
    storage: localStorage,
    encryptionService: privacyState.encryptionService,
  });

  return result.signature || 'private-deposit';
}

// Withdraw SOL from private pool to recipient
export async function privateWithdraw(
  connection: Connection,
  publicKey: PublicKey,
  recipient: string,
  amountLamports: number
): Promise<string> {
  if (!privacyState) {
    throw new Error('Privacy not initialized. Call initPrivacy first.');
  }

  const { withdraw } = await import('privacycash');

  const result = await withdraw({
    amount_in_lamports: amountLamports,
    connection,
    encryptionService: privacyState.encryptionService,
    keyBasePath: '/circuit2',
    publicKey,
    storage: localStorage,
    recipient,
    lightWasm: privacyState.lightWasm,
  });

  return result.signature || 'private-withdraw';
}

// Deposit USDC to private pool
export async function privateDepositUSDC(
  connection: Connection,
  publicKey: PublicKey,
  amount: number,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string> {
  if (!privacyState) {
    throw new Error('Privacy not initialized. Call initPrivacy first.');
  }

  const { depositSPL } = await import('privacycash');

  // USDC mint address on mainnet
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  const result = await depositSPL({
    referrer: '',
    lightWasm: privacyState.lightWasm,
    connection,
    base_units: amount * 1_000_000, // USDC has 6 decimals
    keyBasePath: '/circuit2',
    publicKey,
    transactionSigner: async (tx: VersionedTransaction) => {
      return await signTransaction(tx);
    },
    storage: localStorage,
    encryptionService: privacyState.encryptionService,
    mintAddress: USDC_MINT,
  });

  return result.signature || 'private-deposit-usdc';
}

// Withdraw USDC from private pool to recipient
export async function privateWithdrawUSDC(
  connection: Connection,
  publicKey: PublicKey,
  recipient: string,
  amount: number
): Promise<string> {
  if (!privacyState) {
    throw new Error('Privacy not initialized. Call initPrivacy first.');
  }

  const { withdrawSPL } = await import('privacycash');

  // USDC mint address on mainnet
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  const result = await withdrawSPL({
    connection,
    encryptionService: privacyState.encryptionService,
    keyBasePath: '/circuit2',
    publicKey,
    storage: localStorage,
    recipient,
    lightWasm: privacyState.lightWasm,
    mintAddress: USDC_MINT,
    amount: amount * 1_000_000, // USDC has 6 decimals
  });

  return result.signature || 'private-withdraw-usdc';
}

// Get private balance
export async function getPrivateBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<{ sol: number; usdc: number }> {
  if (!privacyState) {
    return { sol: 0, usdc: 0 };
  }

  try {
    const { getPrivateBalance, getPrivateBalanceSpl } = await import('privacycash');

    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    const solBalance = await getPrivateBalance({
      connection,
      encryptionService: privacyState.encryptionService,
      storage: localStorage,
      lightWasm: privacyState.lightWasm,
    });

    const usdcBalance = await getPrivateBalanceSpl({
      connection,
      encryptionService: privacyState.encryptionService,
      storage: localStorage,
      lightWasm: privacyState.lightWasm,
      mintAddress: USDC_MINT,
    });

    return {
      sol: (solBalance || 0) / 1_000_000_000,
      usdc: (usdcBalance || 0) / 1_000_000,
    };
  } catch (error) {
    console.error('Failed to get private balance:', error);
    return { sol: 0, usdc: 0 };
  }
}

// Check if privacy is initialized
export function isPrivacyInitialized(): boolean {
  return privacyState !== null;
}

// Reset privacy state (on wallet disconnect)
export function resetPrivacy(): void {
  privacyState = null;
}
