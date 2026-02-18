// Ensure Buffer is globally available for Solana libraries
import { Buffer } from 'buffer';
import { PublicKey } from '@solana/web3.js';

// Make Buffer global
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

// Only patch if toBuffer is truly missing (not if it exists but is broken)
if (typeof PublicKey.prototype.toBuffer !== 'function') {
  console.warn('Patching PublicKey.toBuffer - method was missing');
  PublicKey.prototype.toBuffer = function(): Buffer {
    // Use internal _bn directly to avoid any potential recursion
    const bn = (this as any)._bn;
    if (bn && typeof bn.toArray === 'function') {
      return Buffer.from(bn.toArray('be', 32));
    }
    // Fallback: use toBytes if _bn is not available
    return Buffer.from(this.toBytes());
  };
}

export {};
