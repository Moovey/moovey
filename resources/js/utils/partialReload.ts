import { router } from '@inertiajs/react';

interface PartialReloadOptions {
    only?: string[];
    preserveState?: boolean;
    preserveScroll?: boolean;
    replace?: boolean;
}

/**
 * Utility for partial reloads of specific page sections
 */
export class PartialReloader {
    /**
     * Reload featured lessons data only
     */
    static reloadFeaturedLessons(options: PartialReloadOptions = {}) {
        return router.reload({
            only: ['featured_lessons'],
            preserveState: true,
            preserveScroll: true,
            ...options,
        });
    }

    /**
     * Reload business network data only
     */
    static reloadBusinessNetwork(options: PartialReloadOptions = {}) {
        return router.reload({
            only: ['business_network'],
            preserveState: true,
            preserveScroll: true,
            ...options,
        });
    }

    /**
     * Reload basic stats only
     */
    static reloadStats(options: PartialReloadOptions = {}) {
        return router.reload({
            only: ['stats'],
            preserveState: true,
            preserveScroll: true,
            ...options,
        });
    }

    /**
     * Generic partial reload for specific properties
     */
    static reload(properties: string[], options: PartialReloadOptions = {}) {
        return router.reload({
            only: properties,
            preserveState: true,
            preserveScroll: true,
            ...options,
        });
    }
}

/**
 * Hook for using partial reloads in components
 */
export function usePartialReload() {
    return {
        reloadFeaturedLessons: PartialReloader.reloadFeaturedLessons,
        reloadBusinessNetwork: PartialReloader.reloadBusinessNetwork,
        reloadStats: PartialReloader.reloadStats,
        reload: PartialReloader.reload,
    };
}