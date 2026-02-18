// Polyfill for @solana/web3.js compatibility with Privacy Cash SDK
// Some libraries call PublicKey.toBuffer() which may not exist in newer web3.js versions

import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Make Buffer available globally (needed for some Solana libraries)
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Patch PublicKey.prototype.toBuffer if missing
if (!PublicKey.prototype.toBuffer) {
  PublicKey.prototype.toBuffer = function(): Buffer {
    return Buffer.from(this.toBytes());
  };
}

export {};
