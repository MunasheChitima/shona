const fs = require('fs');
const path = require('path');

// Performance optimization configuration
const performanceConfig = {
  // Bundle optimization
  bundleOptimization: {
    codeSplitting: true,
    treeShaking: true,
    minification: true,
    compression: true
  },
  
  // Caching strategies
  caching: {
    staticAssets: {
      maxAge: 31536000, // 1 year
      immutable: true
    },
    apiResponses: {
      maxAge: 3600, // 1 hour
      staleWhileRevalidate: 86400 // 24 hours
    },
    lessonContent: {
      maxAge: 86400, // 24 hours
      staleWhileRevalidate: 604800 // 1 week
    }
  },
  
  // Image optimization
  images: {
    formats: ['webp', 'avif'],
    sizes: [640, 750, 828, 1080, 1200],
    quality: 75
  },
  
  // Audio optimization
  audio: {
    formats: ['mp3', 'ogg'],
    quality: 'medium',
    preload: 'metadata'
  }
};

// Create Next.js configuration for performance
function createNextConfig() {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
  
  const nextConfigContent = `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons', 'framer-motion'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (optional)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      )
      return config
    },
  }),
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Code splitting optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    // Bundle size optimization
    config.optimization.minimize = !dev
    
    return config
  },
}

export default nextConfig
`;
  
  fs.writeFileSync(nextConfigPath, nextConfigContent);
  
  console.log('✅ Created optimized Next.js configuration');
}

// Create performance monitoring utilities
function createPerformanceUtils() {
  const utilsPath = path.join(__dirname, '..', 'lib', 'performance.ts');
  
  const utilsContent = `// Performance monitoring utilities
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  cacheHitRate: number;
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    cacheHitRate: 0
  };
  
  startTimer(label: string) {
    if (typeof window !== 'undefined') {
      performance.mark(\`\${label}-start\`);
    }
  }
  
  endTimer(label: string) {
    if (typeof window !== 'undefined') {
      performance.mark(\`\${label}-end\`);
      performance.measure(label, \`\${label}-start\`, \`\${label}-end\`);
      
      const measure = performance.getEntriesByName(label)[0];
      this.metrics.loadTime = measure.duration;
    }
  }
  
  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }
  
  logMetrics() {
    console.log('Performance Metrics:', this.metrics);
  }
}

// Cache utilities
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map();
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  set(key: string, value: any, ttl: number = 3600000) {
    const item = {
      value,
      expiry: Date.now() + ttl
    };
    this.cache.set(key, item);
  }
  
  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Bundle size monitoring
export function getBundleSize(): number {
  if (typeof window !== 'undefined') {
    // Estimate bundle size based on loaded resources
    const resources = performance.getEntriesByType('resource');
    return resources.reduce((total, resource) => total + resource.transferSize, 0);
  }
  return 0;
}

// Lazy loading utilities
export function lazyLoad<T>(importFn: () => Promise<{ default: T }>) {
  return importFn().then(module => module.default);
}

// Preload utilities
export function preloadResource(href: string, as: string = 'fetch') {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
}

// Performance configuration
export const performanceConfig = ${JSON.stringify(performanceConfig, null, 2)};
`;
  
  fs.writeFileSync(utilsPath, utilsContent);
  
  console.log('✅ Created performance monitoring utilities');
}

// Create environment variables for performance
function createEnvConfig() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  const envContent = `# Performance Configuration
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_BUNDLE_ANALYZER=false

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-in-production

# Database Configuration
DATABASE_URL="file:./dev.db"

# Audio Configuration
NEXT_PUBLIC_AUDIO_CACHE_SIZE=50
NEXT_PUBLIC_AUDIO_PRELOAD=true

# Lesson Configuration
NEXT_PUBLIC_LESSON_CACHE_SIZE=20
NEXT_PUBLIC_VOCABULARY_CACHE_SIZE=100
`;
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Created environment configuration');
}

// Main optimization function
function optimizePerformance() {
  console.log('🚀 Optimizing application performance...');
  
  createNextConfig();
  createPerformanceUtils();
  createEnvConfig();
  
  console.log('✅ Performance optimization completed!');
  console.log('📊 Added bundle optimization and caching strategies');
  console.log('🔍 Performance monitoring utilities ready');
}

optimizePerformance(); 