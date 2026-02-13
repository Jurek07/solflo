/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle node: protocol
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
      process: false,
      os: false,
      url: false,
      assert: false,
      util: false,
      http: false,
      https: false,
      zlib: false,
    };

    // Ignore node: prefix modules in browser
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:path': false,
        'node:fs': false,
        'node:crypto': false,
        'node:buffer': false,
        'node:stream': false,
        'node:util': false,
        'node:os': false,
        'node:url': false,
        'node:assert': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:process': false,
      };
    }

    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
  // Transpile the privacycash package
  transpilePackages: ['privacycash', '@lightprotocol/hasher.rs'],
};

module.exports = nextConfig;
