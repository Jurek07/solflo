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

// Get the PublicKey class
const { PublicKey } = originalWeb3;

// Flag to prevent double-patching
const PATCHED_FLAG = '__toBufferPatched';

if (!PublicKey.prototype[PATCHED_FLAG]) {
  // Patch the prototype - this affects ALL PublicKey instances
  PublicKey.prototype.toBuffer = function(): Buffer {
    // Use toBytes() which is always available, wrap in Buffer
    const bytes = this.toBytes();
    return Buffer.from(bytes);
  };
  
  // Mark as patched
  PublicKey.prototype[PATCHED_FLAG] = true;
  console.log('[web3-patched] PublicKey.toBuffer patched successfully');
}

// Re-export everything
export { PublicKey };
// @ts-ignore
export * from '@solana/web3.js/lib/index.esm.js';
