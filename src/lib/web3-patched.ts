// Patched re-export of @solana/web3.js with working toBuffer
// All imports of @solana/web3.js should be redirected here via webpack alias
// We import from the direct ESM file to avoid circular alias

import { Buffer } from 'buffer';

// Make Buffer global immediately
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}
if (typeof global !== 'undefined' && !(global as any).Buffer) {
  (global as any).Buffer = Buffer;
}

// Import from the direct ESM file path to avoid circular alias resolution
// @ts-ignore - direct file import
import * as web3 from '@solana/web3.js/lib/index.esm.js';

// Get PublicKey class
const { PublicKey } = web3;

// Patch PublicKey.prototype.toBuffer with our working implementation
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
  // Try _key for newer versions  
  const bytes = (this as any)._key || (this as any).bytes;
  if (bytes) {
    return Buffer.from(bytes);
  }
  throw new Error('Cannot convert PublicKey to Buffer');
};

console.log('[web3-patched] PublicKey.toBuffer patched');

// Re-export everything from the original module
// @ts-ignore
export * from '@solana/web3.js/lib/index.esm.js';
