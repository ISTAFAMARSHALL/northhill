import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  outputFileTracingIncludes: {
    '/api/orders/request': ['./node_modules/@sparticuz/chromium-min/**/*'],
    '/api/admin/activate': ['./node_modules/@sparticuz/chromium-min/**/*'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);
      config.externals = [...existing, '@sparticuz/chromium-min', 'puppeteer-core'];
    }
    return config;
  },
};

export default nextConfig;