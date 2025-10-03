/**
 * PERFORMANCE OPTIMIZATION COMPONENTS
 * 
 * PURPOSE:
 * Provides performance optimization utilities including:
 * - Lazy loading components
 * - Virtual scrolling
 * - Memoization helpers
 * - Bundle optimization
 * - Image optimization
 */

import React, { Suspense, lazy, memo, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

// ============================================================================
// 1. LAZY LOADING COMPONENTS
// ============================================================================

export const LazyComponent: React.FC<{
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ importFunc, fallback, className }) => {
  const LazyComponent = lazy(importFunc);
  
  return (
    <Suspense fallback={fallback || <div className={cn("animate-pulse bg-gray-200 rounded", className)} />}>
      <LazyComponent />
    </Suspense>
  );
};

// ============================================================================
// 2. VIRTUAL SCROLLING
// ============================================================================

interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. MEMOIZED COMPONENTS
// ============================================================================

export const MemoizedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = memo(({ children, className }) => (
  <div className={cn("bg-card rounded-lg border p-4", className)}>
    {children}
  </div>
));

export const MemoizedButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}> = memo(({ children, onClick, disabled, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "px-4 py-2 rounded-md font-medium transition-colors",
      "bg-primary text-primary-foreground hover:bg-primary/90",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
));

// ============================================================================
// 4. DEBOUNCED INPUT
// ============================================================================

export const DebouncedInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}> = ({ value, onChange, placeholder, delay = 300, className }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, onChange, delay]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-3 py-2 border border-input rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    />
  );
};

// ============================================================================
// 5. IMAGE OPTIMIZATION
// ============================================================================

export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
}> = ({ src, alt, width, height, className, lazy = true }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Image failed to load</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

// ============================================================================
// 6. PERFORMANCE MONITOR
// ============================================================================

export const PerformanceMonitor: React.FC<{
  children: React.ReactNode;
  name: string;
}> = ({ children, name }) => {
  const [renderTime, setRenderTime] = useState<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      setRenderTime(duration);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component ${name} render time: ${duration.toFixed(2)}ms`);
      }
    };
  }, [name]);

  return (
    <div data-performance-monitor={name}>
      {children}
      {process.env.NODE_ENV === 'development' && renderTime && (
        <div className="text-xs text-gray-500 mt-1">
          Render: {renderTime.toFixed(2)}ms
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. BUNDLE SPLITTING HELPERS
// ============================================================================

export const createLazyRoute = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
  return lazy(importFunc);
};

export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 rounded" />}>
      <Component {...props} />
    </Suspense>
  );
};

// ============================================================================
// 8. MEMORY OPTIMIZATION
// ============================================================================

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

// ============================================================================
// 9. RENDER OPTIMIZATION
// ============================================================================

export const withRenderOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, areEqual);
};

// ============================================================================
// 10. PERFORMANCE PROVIDER
// ============================================================================

interface PerformanceContextType {
  measureRender: (name: string, fn: () => void) => void;
  measureAsync: (name: string, fn: () => Promise<any>) => Promise<any>;
}

const PerformanceContext = React.createContext<PerformanceContextType | null>(null);

export const PerformanceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const measureRender = useCallback((name: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`${name} render: ${(end - start).toFixed(2)}ms`);
    } else {
      fn();
    }
  }, []);

  const measureAsync = useCallback(async (name: string, fn: () => Promise<any>) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = await fn();
      const end = performance.now();
      console.log(`${name} async: ${(end - start).toFixed(2)}ms`);
      return result;
    } else {
      return await fn();
    }
  }, []);

  return (
    <PerformanceContext.Provider value={{ measureRender, measureAsync }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export default PerformanceProvider;
