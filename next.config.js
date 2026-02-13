/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Provide empty fallbacks for Node.js built-in modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
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

      // Handle node: protocol by aliasing to polyfills
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:path': require.resolve('path-browserify'),
        'node:crypto': require.resolve('crypto-browserify'),
        'node:buffer': require.resolve('buffer/'),
        'node:stream': require.resolve('stream-browserify'),
        'node:util': require.resolve('util/'),
        'node:os': require.resolve('os-browserify/browser'),
        'node:url': require.resolve('url/'),
        'node:assert': require.resolve('assert/'),
        'node:http': require.resolve('stream-http'),
        'node:https': require.resolve('https-browserify'),
        'node:zlib': require.resolve('browserify-zlib'),
        'node:fs': false,
        'node:process': require.resolve('process/browser'),
      };
    }

    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
  transpilePackages: ['privacycash', '@lightprotocol/hasher.rs'],
};

module.exports = nextConfig;
