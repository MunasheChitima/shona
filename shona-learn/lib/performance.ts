// Performance monitoring utilities
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
      performance.mark(`${label}-start`);
    }
  }
  
  endTimer(label: string) {
    if (typeof window !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
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
    return resources.reduce((total, resource) => {
      // Use transferSize if available, otherwise use encodedBodySize or 0
      const size = (resource as PerformanceResourceTiming).transferSize || 
                   (resource as PerformanceResourceTiming).encodedBodySize || 0;
      return total + size;
    }, 0);
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
export const performanceConfig = {
  "bundleOptimization": {
    "codeSplitting": true,
    "treeShaking": true,
    "minification": true,
    "compression": true
  },
  "caching": {
    "staticAssets": {
      "maxAge": 31536000,
      "immutable": true
    },
    "apiResponses": {
      "maxAge": 3600,
      "staleWhileRevalidate": 86400
    },
    "lessonContent": {
      "maxAge": 86400,
      "staleWhileRevalidate": 604800
    }
  },
  "images": {
    "formats": [
      "webp",
      "avif"
    ],
    "sizes": [
      640,
      750,
      828,
      1080,
      1200
    ],
    "quality": 75
  },
  "audio": {
    "formats": [
      "mp3",
      "ogg"
    ],
    "quality": "medium",
    "preload": "metadata"
  }
};
