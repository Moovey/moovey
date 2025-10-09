import { useState, useEffect, useCallback, useRef } from 'react';
import { postCache } from './useCache';

interface UseFetchOptions {
    enabled?: boolean;
    cacheKey?: string;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
}

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useFetch<T>(
    url: string,
    options: UseFetchOptions = {}
): FetchState<T> & { refetch: () => Promise<void>; prefetch: () => Promise<void> } {
    const {
        enabled = true,
        cacheKey,
        refetchOnWindowFocus = false,
        staleTime = 5 * 60 * 1000 // 5 minutes
    } = options;

    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: false,
        error: null
    });

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastFetchTime = useRef<number>(0);

    const fetchData = useCallback(async (forceRefetch = false): Promise<void> => {
        if (!enabled || (!forceRefetch && Date.now() - lastFetchTime.current < staleTime)) {
            return;
        }

        // Check cache first
        if (cacheKey && !forceRefetch) {
            const cachedData = postCache.get<T>(cacheKey);
            if (cachedData) {
                setState(prev => ({ ...prev, data: cachedData, loading: false, error: null }));
                return;
            }
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await fetch(url, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the result
            if (cacheKey) {
                postCache.set(cacheKey, data);
            }

            setState({ data, loading: false, error: null });
            lastFetchTime.current = Date.now();
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return; // Request was cancelled
            }
            
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'An error occurred'
            }));
        }
    }, [url, enabled, cacheKey, staleTime]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);
    const prefetch = useCallback(() => fetchData(false), [fetchData]);

    // Initial fetch
    useEffect(() => {
        fetchData();
        
        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData]);

    // Refetch on window focus
    useEffect(() => {
        if (!refetchOnWindowFocus) return;

        const handleFocus = () => {
            if (Date.now() - lastFetchTime.current > staleTime) {
                fetchData();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refetchOnWindowFocus, fetchData, staleTime]);

    return {
        ...state,
        refetch,
        prefetch
    };
}