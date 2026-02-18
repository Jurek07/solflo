// Must be imported before any @solana/* packages.
// React Native (Hermes) does not have Node.js globals — polyfill Buffer here.
// Also patches PublicKey.toBuffer() for compatibility with Privacy Cash SDK.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Buffer } = require('buffer');

if (typeof global.Buffer === 'undefined') {
  // @ts-ignore
  global.Buffer = Buffer;
}

// Patch PublicKey.prototype.toBuffer if missing (needed for some Solana libraries)
// This runs after web3.js is loaded, so we do it lazily on first payment
export function ensureToBufferPolyfill() {
  try {
    const { PublicKey } = require('@solana/web3.js');
    if (!PublicKey.prototype.toBuffer) {
      PublicKey.prototype.toBuffer = function(): Buffer {
        return Buffer.from(this.toBytes());
      };
    }
  } catch {
    // web3.js not loaded yet, will be patched later
  }
}

// Try to patch immediately
ensureToBufferPolyfill();
