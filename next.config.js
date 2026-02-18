const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Provide empty fallbacks for Node.js built-in modules
      const emptyModule = require.resolve('./src/lib/empty-module.js');
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: emptyModule,
        net: emptyModule,
        tls: emptyModule,
        worker_threads: emptyModule,
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url/'),
        assert: require.resolve('assert/'),
        util: require.resolve('util/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
      };

      // Replace node-localstorage with browser localStorage
      config.resolve.alias = {
        ...config.resolve.alias,
        'node-localstorage': require.resolve('./src/lib/localstorage-stub.js'),
      };

      // Intercept ALL @solana/web3.js imports and redirect to our patched version
      // Use regex that catches both exact imports AND subpath imports
      const patchedWeb3Path = require.resolve('./src/lib/web3-patched.ts');
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@solana\/web3\.js(\/.*)?$/,
          (resource) => {
            // Don't redirect imports from our patched module (to avoid circular)
            if (resource.context && resource.context.includes('web3-patched')) {
              return;
            }
            // Don't redirect subpath imports (our patched module needs to import the real one)
            if (resource.request !== '@solana/web3.js') {
              return;
            }
            resource.request = patchedWeb3Path;
          }
        )
      );

      // Add plugin to provide Buffer and process globally
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );

      // Add plugin to handle node: protocol
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource) => {
            const mod = resource.request.replace(/^node:/, '');
            switch (mod) {
              case 'path':
                resource.request = 'path-browserify';
                break;
              case 'crypto':
                resource.request = 'crypto-browserify';
                break;
              case 'stream':
                resource.request = 'stream-browserify';
                break;
              case 'buffer':
                resource.request = 'buffer/';
                break;
              case 'util':
                resource.request = 'util/';
                break;
              case 'url':
                resource.request = 'url/';
                break;
              case 'os':
                resource.request = 'os-browserify/browser';
                break;
              case 'assert':
                resource.request = 'assert/';
                break;
              case 'http':
                resource.request = 'stream-http';
                break;
              case 'https':
                resource.request = 'https-browserify';
                break;
              case 'zlib':
                resource.request = 'browserify-zlib';
                break;
              case 'fs':
              case 'fs/promises':
              case 'net':
              case 'tls':
              case 'worker_threads':
                resource.request = require.resolve('./src/lib/empty-module.js');
                break;
              default:
                throw new Error(`Unknown node: module ${mod}`);
            }
          }
        )
      );
    }

    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Force @solana/web3.js into a single chunk to prevent multiple PublicKey classes
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            solanaWeb3: {
              test: /[\\/]node_modules[\\/]@solana[\\/]web3\.js[\\/]/,
              name: 'solana-web3',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },
  transpilePackages: ['privacycash', '@lightprotocol/hasher.rs', '@solana/web3.js', '@coral-xyz/anchor'],
};

module.exports = nextConfig;
