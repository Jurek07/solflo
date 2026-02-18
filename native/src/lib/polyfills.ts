// Must be imported before any @solana/* packages.
// React Native (Hermes) does not have Node.js globals — polyfill Buffer here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Buffer } = require('buffer');

if (typeof global.Buffer === 'undefined') {
  // @ts-ignore
  global.Buffer = Buffer;
}
