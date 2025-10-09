import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface SearchCacheOptions {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items in cache
    debounceMs?: number; // Debounce delay for search
}

interface SearchParams {
    query: string;
    location: string;
    service: string;
    rating: string;
    keywords: string;
    page?: number;
}

interface SearchResult {
    results: any[];
    total: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
}

export function useTradeDirectoryCache(options: SearchCacheOptions = {}) {
    const { ttl = 10 * 60 * 1000, maxSize = 50, debounceMs = 300 } = options; // 10 minutes TTL
    const cacheRef = useRef<Map<string, CacheItem<SearchResult>>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const generateCacheKey = useCallback((params: SearchParams): string => {
        return JSON.stringify({
            query: params.query?.toLowerCase().trim() || '',
            location: params.location !== 'Your Location' ? params.location : '',
            service: params.service !== "I'm looking for a..." ? params.service : '',
            rating: params.rating || '',
            keywords: params.keywords?.toLowerCase().trim() || '',
            page: params.page || 1
        });
    }, []);

    const get = useCallback((params: SearchParams): SearchResult | null => {
        const key = generateCacheKey(params);
        const cache = cacheRef.current;
        const item = cache.get(key);
        
        if (!item) return null;
        
        // Check if item has expired
        if (Date.now() > item.expiresAt) {
            cache.delete(key);
            return null;
        }
        
        return item.data;
    }, [generateCacheKey]);

    const set = useCallback((params: SearchParams, data: SearchResult): void => {
        const key = generateCacheKey(params);
        const cache = cacheRef.current;
        
        // Remove oldest items if cache is full
        if (cache.size >= maxSize) {
            const oldestKey = cache.keys().next().value;
            if (oldestKey) cache.delete(oldestKey);
        }
        
        const now = Date.now();
        cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl
        });
    }, [generateCacheKey, ttl, maxSize]);

    const invalidate = useCallback((params: SearchParams): void => {
        const key = generateCacheKey(params);
        cacheRef.current.delete(key);
    }, [generateCacheKey]);

    const invalidateAll = useCallback((): void => {
        cacheRef.current.clear();
    }, []);

    const search = useCallback(async (params: SearchParams, force = false): Promise<SearchResult> => {
        // Clear any existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        return new Promise((resolve, reject) => {
            const performSearch = async () => {
                try {
                    // Check cache first (unless forced)
                    if (!force) {
                        const cached = get(params);
                        if (cached) {
                            resolve(cached);
                            return;
                        }
                    }

                    setLoading(true);
                    setError(null);

                    const searchParams = new URLSearchParams();
                    if (params.query) searchParams.append('query', params.query);
                    if (params.location && params.location !== 'Your Location') {
                        searchParams.append('location', params.location);
                    }
                    if (params.service && params.service !== "I'm looking for a...") {
                        searchParams.append('service', params.service);
                    }
                    if (params.rating) searchParams.append('rating', params.rating);
                    if (params.keywords) searchParams.append('query', params.keywords);
                    
                    // Add pagination
                    const limit = 10;
                    const page = params.page || 1;
                    searchParams.append('limit', (limit + 1).toString()); // Get one extra to check if there are more
                    searchParams.append('offset', ((page - 1) * limit).toString());

                    const response = await fetch(`/api/business/search?${searchParams.toString()}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        credentials: 'same-origin',
                    });

                    if (!response.ok) {
                        throw new Error('Search failed');
                    }

                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.message || 'Search failed');
                    }

                    // Process results for pagination
                    const results = data.results || [];
                    const hasMore = results.length > limit;
                    const actualResults = hasMore ? results.slice(0, limit) : results;
                    const total = data.total || actualResults.length;
                    const totalPages = Math.ceil(total / limit);

                    const searchResult: SearchResult = {
                        results: actualResults,
                        total,
                        hasMore,
                        page,
                        totalPages
                    };

                    // Cache the result
                    set(params, searchResult);

                    resolve(searchResult);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Search failed';
                    setError(errorMessage);
                    reject(new Error(errorMessage));
                } finally {
                    setLoading(false);
                }
            };

            // Debounce the search
            debounceRef.current = setTimeout(performSearch, debounceMs);
        });
    }, [get, set, debounceMs]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        search,
        get,
        set,
        invalidate,
        invalidateAll,
        loading,
        error,
        setError
    };
}

// Global cache for service providers and other static data
class TradeDirectoryCache {
    private cache = new Map<string, CacheItem<any>>();
    private readonly ttl = 30 * 60 * 1000; // 30 minutes for static data
    private readonly maxSize = 100;

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    set<T>(key: string, data: T, customTtl?: number): void {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }
        
        const now = Date.now();
        const ttl = customTtl || this.ttl;
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl
        });
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    clear(): void {
        this.cache.clear();
    }

    has(key: string): boolean {
        const item = this.cache.get(key);
        if (!item) return false;
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        
        return true;
    }

    // Prefetch data for common searches
    async prefetch(keys: string[], fetcher: (key: string) => Promise<any>): Promise<void> {
        const promises = keys.map(async (key) => {
            if (!this.has(key)) {
                try {
                    const data = await fetcher(key);
                    this.set(key, data);
                } catch (error) {
                    console.warn(`Failed to prefetch data for key: ${key}`, error);
                }
            }
        });

        await Promise.allSettled(promises);
    }
}

export const tradeDirectoryCache = new TradeDirectoryCache();