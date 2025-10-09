import { useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { postCache } from './useCache';

interface PartialReloadOptions {
    preserveState?: boolean;
    preserveScroll?: boolean;
    only?: string[];
    onSuccess?: (page: any) => void;
    onError?: (errors: any) => void;
}

export function usePartialReload() {
    const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const reloadPosts = useCallback(async (options: PartialReloadOptions = {}) => {
        try {
            // Clear relevant cache entries
            postCache.invalidatePattern('posts-page-.*');
            postCache.invalidate('community-posts');
            
            // Use Inertia's partial reload
            router.reload({
                only: ['initialPosts', 'pagination'],
                preserveState: true,
                preserveScroll: true,
                ...options
            });
        } catch (error) {
            console.error('Failed to reload posts:', error);
            if (options.onError) {
                options.onError(error);
            }
        }
    }, []);

    const reloadUserData = useCallback(async (userId: string | number, options: PartialReloadOptions = {}) => {
        try {
            // Clear user-related cache
            postCache.invalidate(`user-profile-${userId}`);
            
            // Fetch updated user data
            const response = await fetch(`/api/user/${userId}/profile`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const userData = await response.json();
                postCache.set(`user-profile-${userId}`, userData);
                
                if (options.onSuccess) {
                    options.onSuccess(userData);
                }
            }
        } catch (error) {
            console.error('Failed to reload user data:', error);
            if (options.onError) {
                options.onError(error);
            }
        }
    }, []);

    const debouncedReload = useCallback((callback: () => void, delay: number = 1000) => {
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }
        
        reloadTimeoutRef.current = setTimeout(callback, delay);
    }, []);

    const refreshPost = useCallback(async (postId: string | number): Promise<any> => {
        try {
            const response = await fetch(`/api/community/posts/${postId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const postData = await response.json();
                return postData.post;
            }
            
            throw new Error('Failed to fetch post');
        } catch (error) {
            console.error('Failed to refresh post:', error);
            throw error;
        }
    }, []);

    const refreshStats = useCallback(async (): Promise<any> => {
        try {
            const response = await fetch('/api/community/stats', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const statsData = await response.json();
                postCache.set('community-stats', statsData);
                return statsData;
            }
            
            throw new Error('Failed to fetch stats');
        } catch (error) {
            console.error('Failed to refresh stats:', error);
            throw error;
        }
    }, []);

    return {
        reloadPosts,
        reloadUserData,
        debouncedReload,
        refreshPost,
        refreshStats
    };
}