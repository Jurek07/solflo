// React Native doesn't have Node.js globals.
// @solana/web3.js needs Buffer — polyfill it before anything else loads.
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  // @ts-ignore
  global.Buffer = Buffer;
}
