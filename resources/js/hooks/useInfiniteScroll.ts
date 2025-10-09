import { useState, useEffect, useCallback } from 'react';

interface InfiniteScrollOptions {
    threshold?: number; // Distance from bottom to trigger load (in pixels)
    initialLoad?: boolean;
}

export function useInfiniteScroll(
    loadMore: () => Promise<void>,
    hasMore: boolean,
    options: InfiniteScrollOptions = {}
) {
    const { threshold = 1000, initialLoad = false } = options;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScroll = useCallback(async () => {
        if (isLoading || !hasMore) return;

        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            setIsLoading(true);
            setError(null);
            
            try {
                await loadMore();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load more content');
            } finally {
                setIsLoading(false);
            }
        }
    }, [loadMore, hasMore, isLoading, threshold]);

    useEffect(() => {
        if (initialLoad && hasMore && !isLoading) {
            setIsLoading(true);
            loadMore().finally(() => setIsLoading(false));
        }
    }, [initialLoad, hasMore, loadMore, isLoading]);

    useEffect(() => {
        const debouncedHandleScroll = debounce(handleScroll, 200);
        window.addEventListener('scroll', debouncedHandleScroll);
        
        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
        };
    }, [handleScroll]);

    return { isLoading, error };
}

function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}