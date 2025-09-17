import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable linting and type checking for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'recharts', 'lucide-react'],
    ppr: false,
    webpackBuildWorker: true, // Enable webpack build worker for faster builds
    // Enable server actions optimizations
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Enable large page data optimization
    largePageDataBytes: 256 * 1000, // 256 KB
    // Enable gzip compression for static assets
    gzipSize: true,
    // Optimize server builds
    serverMinification: true,
  },
  // External packages configuration
  serverExternalPackages: ['bcrypt'],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // 1 hour
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Additional performance optimizations
  // Enable static optimization
  staticPageGenerationTimeout: 120,
  
  // Bundle optimization
  // swcMinify: true, // Removed deprecated option - now using compiler.removeConsole
  
  // Performance settings
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minute
    pagesBufferLength: 5,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          lucide: {
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 10,
          },
          recharts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 10,
          },
          framer: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'framer',
            chunks: 'all',
            priority: 10,
          },
          nextauth: {
            test: /[\\/]node_modules[\\/](next-auth)[\\/]/,
            name: 'nextauth',
            chunks: 'all',
            priority: 10,
          },
          // Split large libraries into smaller chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
          // Additional cache groups for better optimization
          zod: {
            test: /[\\/]node_modules[\\/](zod)[\\/]/,
            name: 'zod',
            chunks: 'all',
            priority: 15,
          },
        },
      },
      // Minimize in development as well for better performance testing
      minimize: !dev,
      // Enable module concatenation for smaller bundles
      concatenateModules: true,
    };
    
    // Bundle analyzer
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    
    if (!dev && !isServer) {
      // Remove console.log in production
      config.optimization.minimizer.push(
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.info', 'console.debug', 'console.warn'],
              // Additional compression options
              passes: 2,
              comparisons: false,
              // Reduce size by removing redundant code
              reduce_funcs: true,
              reduce_vars: true,
              // Optimize conditionals
              conditionals: true,
              // Optimize booleans
              booleans: true,
            },
            mangle: true,
            safari10: true,
            // Output options for smaller bundles
            output: {
              comments: false,
            },
          },
          parallel: true,
        })
      );
    }
    
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Output configuration for production
  output: 'standalone',
  
  // File tracing configuration
  outputFileTracingRoot: __dirname,
  
  // Performance optimizations
  reactStrictMode: false, // Disable in production for better performance
  
  // Additional performance optimizations
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
};

export default nextConfig;