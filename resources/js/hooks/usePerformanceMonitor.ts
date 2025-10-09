import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
    renderTime: number;
    loadTime: number;
    interactionTime: number;
    cacheHitRate: number;
}

export function usePerformanceMonitor(componentName: string) {
    const renderStartTime = useRef<number>(0);
    const loadStartTime = useRef<number>(0);
    const cacheHits = useRef<number>(0);
    const cacheMisses = useRef<number>(0);
    const metricsRef = useRef<PerformanceMetrics>({
        renderTime: 0,
        loadTime: 0,
        interactionTime: 0,
        cacheHitRate: 0
    });

    const markRenderStart = useCallback(() => {
        renderStartTime.current = performance.now();
    }, []);

    const markRenderEnd = useCallback(() => {
        if (renderStartTime.current > 0) {
            const renderTime = performance.now() - renderStartTime.current;
            metricsRef.current.renderTime = renderTime;
            
            // Log slow renders in development
            if (process.env.NODE_ENV === 'development' && renderTime > 16) {
                console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
            }
        }
    }, [componentName]);

    const markLoadStart = useCallback(() => {
        loadStartTime.current = performance.now();
    }, []);

    const markLoadEnd = useCallback(() => {
        if (loadStartTime.current > 0) {
            const loadTime = performance.now() - loadStartTime.current;
            metricsRef.current.loadTime = loadTime;
        }
    }, []);

    const recordCacheHit = useCallback(() => {
        cacheHits.current += 1;
        metricsRef.current.cacheHitRate = cacheHits.current / (cacheHits.current + cacheMisses.current);
    }, []);

    const recordCacheMiss = useCallback(() => {
        cacheMisses.current += 1;
        metricsRef.current.cacheHitRate = cacheHits.current / (cacheHits.current + cacheMisses.current);
    }, []);

    const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

    // Measure component mount time
    useEffect(() => {
        markRenderStart();
        
        // Use requestAnimationFrame to measure after render completion
        const rafId = requestAnimationFrame(() => {
            markRenderEnd();
        });

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, [markRenderStart, markRenderEnd]);

    // Report metrics periodically in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const interval = setInterval(() => {
                const metrics = getMetrics();
                console.debug(`Performance metrics for ${componentName}:`, {
                    renderTime: `${metrics.renderTime.toFixed(2)}ms`,
                    loadTime: `${metrics.loadTime.toFixed(2)}ms`,
                    cacheHitRate: `${(metrics.cacheHitRate * 100).toFixed(1)}%`,
                    cacheHits: cacheHits.current,
                    cacheMisses: cacheMisses.current
                });
            }, 30000); // Report every 30 seconds

            return () => clearInterval(interval);
        }
    }, [componentName, getMetrics]);

    return {
        markRenderStart,
        markRenderEnd,
        markLoadStart,
        markLoadEnd,
        recordCacheHit,
        recordCacheMiss,
        getMetrics
    };
}

// Hook for measuring Web Vitals
export function useWebVitals() {
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Monitor basic performance metrics
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry as PerformanceNavigationTiming;
                        console.debug('Navigation timing:', {
                            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                        });
                    }
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.debug('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                        const fidEntry = entry as any; // PerformanceEventTiming is not in standard types yet
                        console.debug('FID:', fidEntry.processingStart - entry.startTime);
                    }
                }
            });

            try {
                observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'] });
            } catch (error) {
                // Some entry types might not be supported
                console.debug('Performance observer not fully supported');
            }

            return () => observer.disconnect();
        }
    }, []);
}

// Hook for monitoring intersection (useful for lazy loading)
export function useIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
) {
    const observerRef = useRef<IntersectionObserver | null>(null);

    const observe = useCallback((element: Element) => {
        if (observerRef.current) {
            observerRef.current.observe(element);
        }
    }, []);

    const unobserve = useCallback((element: Element) => {
        if (observerRef.current) {
            observerRef.current.unobserve(element);
        }
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(callback, {
            threshold: 0.1,
            rootMargin: '50px',
            ...options
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [callback, options]);

    return { observe, unobserve };
}