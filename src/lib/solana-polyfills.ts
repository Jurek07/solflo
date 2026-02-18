// Ensure Buffer is globally available for Solana libraries
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
}

export {};
