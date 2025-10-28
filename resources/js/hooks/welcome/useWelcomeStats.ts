import { useState, useEffect } from 'react';
import type { CachedStats } from '@/types/welcome';

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useWelcomeStats = () => {
    const [cachedStats, setCachedStats] = useState<CachedStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadCachedStats = () => {
            try {
                const cached = localStorage.getItem('moovey_stats');
                if (cached) {
                    const parsedCache: CachedStats = JSON.parse(cached);
                    const now = Date.now();
                    
                    // Check if cache is still valid
                    if (now - parsedCache.lastUpdated < CACHE_DURATION) {
                        setCachedStats(parsedCache);
                        return;
                    }
                }
                
                // Fetch fresh data if no cache or cache expired
                fetchFreshStats();
            } catch (error) {
                console.warn('Error loading cached stats:', error);
                fetchFreshStats();
            }
        };

        const fetchFreshStats = async () => {
            setIsLoading(true);
            try {
                // Simulate API call - replace with actual API endpoint
                const response = await fetch('/api/stats', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const freshStats: CachedStats = {
                        activeMembers: data.activeMembers || '10,000+',
                        dailyPosts: data.dailyPosts || '2,500+',
                        helpRate: data.helpRate || '98%',
                        successfulMoves: data.successfulMoves || '10,000+',
                        moneySaved: data.moneySaved || '£2M+',
                        satisfactionRate: data.satisfactionRate || '98%',
                        averageRating: data.averageRating || '4.9★',
                        lastUpdated: Date.now()
                    };
                    
                    setCachedStats(freshStats);
                    localStorage.setItem('moovey_stats', JSON.stringify(freshStats));
                } else {
                    // Fallback to default values
                    setDefaultStats();
                }
            } catch (error) {
                console.warn('Error fetching fresh stats:', error);
                setDefaultStats();
            } finally {
                setIsLoading(false);
            }
        };

        const setDefaultStats = () => {
            const defaultStats: CachedStats = {
                activeMembers: '10,000+',
                dailyPosts: '2,500+',
                helpRate: '98%',
                successfulMoves: '10,000+',
                moneySaved: '£2M+',
                satisfactionRate: '98%',
                averageRating: '4.9★',
                lastUpdated: Date.now()
            };
            setCachedStats(defaultStats);
        };

        loadCachedStats();
    }, []);

    return { cachedStats, isLoading };
};