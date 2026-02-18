// Patched re-export of @solana/web3.js with working toBuffer
// All imports of @solana/web3.js should be redirected here via webpack

import { Buffer } from 'buffer';

// Make Buffer global immediately
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
}

// Import everything from the direct ESM file path to avoid circular alias
// @ts-ignore
import * as originalWeb3 from '@solana/web3.js/lib/index.esm.js';

// Get the PublicKey class and patch it
const { PublicKey, ...rest } = originalWeb3;

// Patch the prototype - this affects ALL PublicKey instances
PublicKey.prototype.toBuffer = function(): Buffer {
  const bn = (this as any)._bn;
  if (bn) {
    if (typeof bn.toArrayLike === 'function') {
      return bn.toArrayLike(Buffer, 'be', 32);
    }
    if (typeof bn.toArray === 'function') {
      return Buffer.from(bn.toArray('be', 32));
    }
  }
  const bytes = (this as any)._key || (this as any).bytes;
  if (bytes) {
    return Buffer.from(bytes);
  }
  throw new Error('Cannot convert PublicKey to Buffer');
};

console.log('[web3-patched] PublicKey.toBuffer patched successfully');

// Re-export everything with our patched PublicKey
export { PublicKey };
// @ts-ignore
export * from '@solana/web3.js/lib/index.esm.js';
