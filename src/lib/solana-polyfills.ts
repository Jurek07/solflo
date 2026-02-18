// Polyfill for @solana/web3.js compatibility with Privacy Cash SDK
// Some libraries call PublicKey.toBuffer() which may not exist in some web3.js versions

import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Ensure Buffer is globally available
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
}

// Patch PublicKey.prototype.toBuffer if missing or broken
const originalToBuffer = PublicKey.prototype.toBuffer;
PublicKey.prototype.toBuffer = function(): Buffer {
  // If original exists and works, use it
  if (originalToBuffer) {
    try {
      const result = originalToBuffer.call(this);
      if (result && result.length === 32) {
        return result;
      }
    } catch {
      // Fall through to polyfill
    }
  }
  // Polyfill: convert toBytes() result to Buffer
  return Buffer.from(this.toBytes());
};

// Also export a function to re-apply the patch (useful after dynamic imports)
export function ensureToBufferExists() {
  if (!PublicKey.prototype.toBuffer) {
    PublicKey.prototype.toBuffer = function(): Buffer {
      return Buffer.from(this.toBytes());
    };
  }
}

export {};
