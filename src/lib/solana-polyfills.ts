// Polyfill for @solana/web3.js compatibility with Privacy Cash SDK
// Privacy Cash SDK calls PublicKey.toBuffer() which may cause issues

import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Ensure Buffer is globally available
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
}

// Patch toBuffer to access internal _bn directly (avoids toBytes() which may call toBuffer())
PublicKey.prototype.toBuffer = function(): Buffer {
  // Access the internal BigNumber and convert to 32-byte big-endian buffer
  const bn = (this as any)._bn;
  if (bn && typeof bn.toArrayLike === 'function') {
    return bn.toArrayLike(Buffer, 'be', 32);
  }
  // Fallback: use toArray if toArrayLike isn't available
  if (bn && typeof bn.toArray === 'function') {
    return Buffer.from(bn.toArray('be', 32));
  }
  // Last resort: try accessing _key directly (some versions store raw bytes)
  if ((this as any)._key) {
    return Buffer.from((this as any)._key);
  }
  throw new Error('Unable to convert PublicKey to Buffer');
};

export {};
