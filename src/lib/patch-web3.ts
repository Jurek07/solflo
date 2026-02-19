// Simple runtime patch for PublicKey.toBuffer
// Import this once at app startup

import { Buffer } from 'buffer';
import { PublicKey } from '@solana/web3.js';

// Make Buffer global
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

const PATCHED = '__toBufferPatched';

if (!(PublicKey.prototype as any)[PATCHED]) {
  (PublicKey.prototype as any).toBuffer = function(): Buffer {
    return Buffer.from(this.toBytes());
  };
  (PublicKey.prototype as any)[PATCHED] = true;
  console.log('[patch-web3] PublicKey.toBuffer patched');
}

export {};
