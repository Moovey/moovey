import { useState, useCallback, useRef } from 'react';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items in cache
}

export function useCache<T>(options: CacheOptions = {}) {
    const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
    const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map());
    const [, forceUpdate] = useState({});

    const get = useCallback((key: string): T | null => {
        const cache = cacheRef.current;
        const item = cache.get(key);
        
        if (!item) return null;
        
        // Check if item has expired
        if (Date.now() > item.expiresAt) {
            cache.delete(key);
            return null;
        }
        
        return item.data;
    }, []);

    const set = useCallback((key: string, data: T): void => {
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
        
        forceUpdate({});
    }, [ttl, maxSize]);

    const invalidate = useCallback((key: string): void => {
        cacheRef.current.delete(key);
        forceUpdate({});
    }, []);

    const clear = useCallback((): void => {
        cacheRef.current.clear();
        forceUpdate({});
    }, []);

    const has = useCallback((key: string): boolean => {
        const item = cacheRef.current.get(key);
        if (!item) return false;
        
        if (Date.now() > item.expiresAt) {
            cacheRef.current.delete(key);
            return false;
        }
        
        return true;
    }, []);

    return { get, set, invalidate, clear, has };
}

// Global cache instance for posts
class PostCache {
    private cache = new Map<string, CacheItem<any>>();
    private readonly ttl = 10 * 60 * 1000; // 10 minutes for posts
    private readonly maxSize = 200;

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    set<T>(key: string, data: T): void {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }
        
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + this.ttl
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
}

export const postCache = new PostCache();