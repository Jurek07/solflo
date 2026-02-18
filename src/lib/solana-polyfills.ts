// Polyfill for @solana/web3.js compatibility with Privacy Cash SDK
// Privacy Cash SDK calls PublicKey.toBuffer() which may not exist in some web3.js versions

import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Ensure Buffer is globally available
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
}

// Simple patch: always use toBytes() converted to Buffer
// Don't try to call original - that causes infinite recursion
PublicKey.prototype.toBuffer = function(): Buffer {
  return Buffer.from(this.toBytes());
};

export {};
