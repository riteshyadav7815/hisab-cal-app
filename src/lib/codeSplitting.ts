// Utility functions for code splitting and dynamic imports

/**
 * Creates a dynamic import with loading and error states
 */
export function createDynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return importFn()
    .then(module => module.default)
    .catch(error => {
      console.error('Dynamic import failed:', error);
      return fallback;
    });
}

/**
 * Preload components that will be needed soon
 */
export function preloadComponent(importFn: () => Promise<any>) {
  // Start loading but don't wait for it
  importFn().catch(error => {
    console.warn('Preloading failed:', error);
  });
}

/**
 * Debounce function to limit how often expensive operations run
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}