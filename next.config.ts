import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  outputFileTracingIncludes: {
    '/api/orders/request': ['./node_modules/@sparticuz/chromium/**/*'],
    '/api/admin/activate': ['./node_modules/@sparticuz/chromium/**/*'],
    '/api/webhooks/wave':  ['./node_modules/@sparticuz/chromium/**/*'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);
      config.externals = [...existing, '@sparticuz/chromium', 'puppeteer-core'];
    }
    return config;
  },
};

export default nextConfig;