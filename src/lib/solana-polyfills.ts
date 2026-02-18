// Ensure Buffer is globally available for Solana libraries
import { Buffer } from 'buffer';
import { PublicKey } from '@solana/web3.js';

// Make Buffer global
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

// ALWAYS replace toBuffer - the built-in version may be broken in browser bundling
const originalToBuffer = PublicKey.prototype.toBuffer;
PublicKey.prototype.toBuffer = function(): Buffer {
  // Use internal _bn directly - this is the safest approach
  const bn = (this as any)._bn;
  if (bn) {
    if (typeof bn.toArrayLike === 'function') {
      return bn.toArrayLike(Buffer, 'be', 32);
    }
    if (typeof bn.toArray === 'function') {
      return Buffer.from(bn.toArray('be', 32));
    }
  }
  // If _bn doesn't exist, this is a newer web3.js structure
  // Try to get bytes directly without recursion
  const bytes = (this as any)._key || (this as any).bytes;
  if (bytes) {
    return Buffer.from(bytes);
  }
  // Last resort - but this might recurse if toBytes calls toBuffer
  throw new Error('Cannot convert PublicKey to Buffer - unknown internal structure');
};

console.log('PublicKey.toBuffer polyfill applied');

export {};
