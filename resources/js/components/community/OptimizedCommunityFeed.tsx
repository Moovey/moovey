import { useState, useCallback, useEffect, useMemo } from 'react';
import { CommunityPost, User } from '@/types/community';
import { router, Link } from '@inertiajs/react';
import { toast } from 'react-toastify';
import OptimizedPostCard from './shared/OptimizedPostCard';
import PostCreationForm from './shared/PostCreationForm';
import CommunitySidebar from './shared/CommunitySidebar';
import UserAvatar from './shared/UserAvatar';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { postCache } from '@/hooks/useCache';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PaginationInfo {
    hasMore: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
}

interface CommunityFeedProps {
    posts: CommunityPost[];
    onPostsChange: (posts: CommunityPost[]) => void;
    isAuthenticated?: boolean;
    pagination: PaginationInfo;
    onPaginationChange: (pagination: PaginationInfo) => void;
    currentUser?: User;
}

export default function OptimizedCommunityFeed({ 
    posts, 
    onPostsChange, 
    isAuthenticated = false, 
    pagination, 
    onPaginationChange,
    currentUser 
}: CommunityFeedProps) {
    // Performance monitoring
    const { recordCacheHit, recordCacheMiss, markLoadStart, markLoadEnd } = usePerformanceMonitor('CommunityFeed');

    // Memoize heavy computations
    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [posts]);

    // Cache posts data
    useEffect(() => {
        if (posts.length > 0) {
            postCache.set('community-posts', posts);
            postCache.set('community-pagination', pagination);
        }
    }, [posts, pagination]);

    const handlePostCreated = useCallback((newPost: CommunityPost) => {
        const newPosts = [newPost, ...posts];
        onPostsChange(newPosts);
        
        // Update pagination
        onPaginationChange({
            ...pagination,
            total: pagination.total + 1
        });
        
        // Invalidate cache
        postCache.invalidatePattern('posts-page-.*');
        postCache.set('community-posts', newPosts);
    }, [posts, pagination, onPostsChange, onPaginationChange]);

    const loadMorePosts = useCallback(async () => {
        if (!pagination.hasMore) return;

        const cacheKey = `posts-page-${pagination.currentPage + 1}`;
        const cachedPage = postCache.get<{ posts: CommunityPost[]; pagination: PaginationInfo }>(cacheKey);
        
        if (cachedPage) {
            recordCacheHit();
            onPostsChange([...posts, ...cachedPage.posts]);
            onPaginationChange(cachedPage.pagination);
            return;
        }

        recordCacheMiss();
        markLoadStart();

        try {
            const response = await fetch(`/api/community/posts?page=${pagination.currentPage + 1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            const data = await response.json();
            
            if (data.success) {
                const newPosts = [...posts, ...data.posts];
                onPostsChange(newPosts);
                onPaginationChange(data.pagination);
                
                // Cache this page
                postCache.set(cacheKey, { posts: data.posts, pagination: data.pagination });
                markLoadEnd();
            } else {
                throw new Error(data.message || 'Failed to load posts');
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
            toast.error('Failed to load more posts. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
            throw error;
        }
    }, [posts, pagination, onPostsChange, onPaginationChange]);

    // Use infinite scroll hook
    const { isLoading: isLoadingMore } = useInfiniteScroll(
        loadMorePosts,
        pagination.hasMore,
        { threshold: 1000 }
    );

    // Prefetch next page when user is near the end
    useEffect(() => {
        const prefetchNextPage = async () => {
            if (pagination.hasMore && posts.length > 5) {
                const nextPageKey = `posts-page-${pagination.currentPage + 1}`;
                if (!postCache.has(nextPageKey)) {
                    try {
                        const response = await fetch(`/api/community/posts?page=${pagination.currentPage + 1}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            credentials: 'same-origin',
                        });
                        const data = await response.json();
                        if (data.success) {
                            postCache.set(nextPageKey, { posts: data.posts, pagination: data.pagination });
                        }
                    } catch (error) {
                        // Silently fail prefetch
                        console.debug('Prefetch failed:', error);
                    }
                }
            }
        };

        const timer = setTimeout(prefetchNextPage, 2000);
        return () => clearTimeout(timer);
    }, [posts.length, pagination]);

    return (
        <section className="py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="lg:flex lg:gap-6 xl:gap-8 lg:items-start">
                    {/* Sidebar */}
                    <CommunitySidebar />
                    
                    {/* Main Content Area */}
                    <div className="flex-1 w-full lg:max-w-none">
                        {/* User Profile Header */}
                        {isAuthenticated && currentUser && (
                            <div className="bg-white rounded-2xl lg:rounded-3xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
                                <button 
                                    onClick={() => window.location.href = `/user/${currentUser.id}`}
                                    className="w-full flex items-center space-x-3 sm:space-x-4 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                    <UserAvatar 
                                        userId={currentUser.id}
                                        userName={currentUser.name}
                                        avatar={currentUser.avatar}
                                        size="large"
                                        clickable={false}
                                    />
                                    <div className="flex-1 text-left min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold text-[#1A237E] group-hover:text-[#17B7C7] transition-colors truncate">
                                            {currentUser.name}
                                        </h3>
                                        <p className="text-gray-600 text-xs sm:text-sm">
                                            Click to view your profile and posts
                                        </p>
                                    </div>
                                    <div className="text-[#17B7C7] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                                <div className="w-full sm:w-auto">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A237E] mb-1 sm:mb-2">Community Feed</h2>
                                    <p className="text-sm sm:text-base text-gray-600">Share your moving journey and connect with others</p>
                                </div>
                            </div>
                            
                            {/* Post Creation Form */}
                            <PostCreationForm
                                onPostCreated={handlePostCreated}
                                isAuthenticated={isAuthenticated}
                                className="mb-6 sm:mb-8"
                            />
                            
                            {/* Community Posts */}
                            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                {sortedPosts.map((post) => (
                                    <OptimizedPostCard
                                        key={`${post.id}-${post.timestamp}`}
                                        post={post}
                                        isAuthenticated={isAuthenticated}
                                        onPostChange={(updatedPost: CommunityPost) => {
                                            const newPosts = posts.map(p => 
                                                String(p.id) === String(updatedPost.id) ? updatedPost : p
                                            );
                                            onPostsChange(newPosts);
                                            postCache.set('community-posts', newPosts);
                                        }}
                                    />
                                ))}
                                
                                {/* Loading skeleton */}
                                {isLoadingMore && (
                                    <div className="border-b border-gray-100 pb-6 sm:pb-8">
                                        <div className="flex items-start space-x-3 sm:space-x-4 animate-pulse">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                                                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                                                    <div className="h-2 sm:h-3 bg-gray-200 rounded w-12 sm:w-16"></div>
                                                </div>
                                                <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                                    <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                                                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                                <div className="flex items-center space-x-4 sm:space-x-8">
                                                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-10 sm:w-12"></div>
                                                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-12 sm:w-16"></div>
                                                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-10 sm:w-12"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* End of posts message */}
                            {!pagination.hasMore && posts.length > 0 && (
                                <div className="text-center mt-6 sm:mt-8 py-4 sm:py-6 border-t border-gray-200">
                                    <p className="text-sm sm:text-base text-gray-600 font-medium">🎉 You've seen all posts!</p>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Total posts: {pagination.total}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}