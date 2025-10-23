import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
    toolSwitchTime: number;
    loadTime: number;
    toolName: string;
}

interface UsePerformanceMonitoringOptions {
    onMetric?: (metric: PerformanceMetrics) => void;
    enabled?: boolean;
}

export function usePerformanceMonitoring({ 
    onMetric, 
    enabled = true 
}: UsePerformanceMonitoringOptions = {}) {
    const startTimeRef = useRef<number | null>(null);
    const currentToolRef = useRef<string>('');

    const startMeasure = (toolName: string) => {
        if (!enabled) return;
        
        startTimeRef.current = performance.now();
        currentToolRef.current = toolName;
    };

    const endMeasure = () => {
        if (!enabled || !startTimeRef.current) return;
        
        const endTime = performance.now();
        const duration = endTime - startTimeRef.current;
        
        const metric: PerformanceMetrics = {
            toolSwitchTime: duration,
            loadTime: duration,
            toolName: currentToolRef.current,
        };

        // Call optional callback
        onMetric?.(metric);

        // Reset
        startTimeRef.current = null;
        currentToolRef.current = '';
    };

    const measureToolSwitch = (toolName: string, callback: () => void) => {
        if (!enabled) {
            callback();
            return;
        }

        startMeasure(toolName);
        
        // Use requestAnimationFrame to measure after the next render
        requestAnimationFrame(() => {
            callback();
            requestAnimationFrame(() => {
                endMeasure();
            });
        });
    };

    // Measure Web Vitals when available
    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        // Measure Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
                
                return () => observer.disconnect();
            } catch (error) {
                console.warn('Performance observer not supported:', error);
            }
        }
    }, [enabled]);

    return {
        startMeasure,
        endMeasure,
        measureToolSwitch,
    };
}