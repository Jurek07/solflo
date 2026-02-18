const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve the 'buffer' polyfill for @solana/web3.js
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer'),
};

module.exports = config;
