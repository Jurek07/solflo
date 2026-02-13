/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle node: protocol and polyfills
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

    // Ignore privacycash and lightprotocol during build
    // They will be loaded dynamically at runtime via eval
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules\/(privacycash|@lightprotocol)/,
      use: 'null-loader',
    });

    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

module.exports = nextConfig;
