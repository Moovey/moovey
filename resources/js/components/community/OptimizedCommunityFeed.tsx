import { useState, useCallback, useEffect, useMemo, memo } from 'react';
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

// Memoized components to prevent unnecessary re-renders
const MemoizedPostCard = memo(OptimizedPostCard);
const MemoizedCommunitySidebar = memo(CommunitySidebar);
const MemoizedPostCreationForm = memo(PostCreationForm);

// Extract sorting function outside component to avoid recreation
const sortPostsByDate = (posts: CommunityPost[]) => {
    return posts.slice().sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};

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

    // Optimize sorting with better memoization - use external function
    const sortedPosts = useMemo(() => {
        return sortPostsByDate(posts);
    }, [posts]);

    // Move cache operations to separate effect to avoid render blocking
    useEffect(() => {
        // Use requestIdleCallback for non-critical cache operations
        const idleCallback = (deadline: IdleDeadline) => {
            if (deadline.timeRemaining() > 0 && posts.length > 0) {
                postCache.set('community-posts', posts);
                postCache.set('community-pagination', pagination);
            }
        };
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(idleCallback);
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                if (posts.length > 0) {
                    postCache.set('community-posts', posts);
                    postCache.set('community-pagination', pagination);
                }
            }, 0);
        }
    }, [posts, pagination]);

    const handlePostCreated = useCallback((newPost: CommunityPost) => {
        // Ensure the new post has proper default values
        const sanitizedPost: CommunityPost = {
            ...newPost,
            likes: newPost.likes ?? 0,
            comments: newPost.comments ?? 0,
            shares: newPost.shares ?? 0,
            liked: newPost.liked ?? false,
            post_type: newPost.post_type ?? 'original',
        };
        
        const newPosts = [sanitizedPost, ...posts];
        onPostsChange(newPosts);
        
        // Update pagination
        onPaginationChange({
            ...pagination,
            total: pagination.total + 1
        });
        
        // Defer cache operations to avoid blocking render
        setTimeout(() => {
            postCache.invalidatePattern('posts-page-.*');
            postCache.set('community-posts', newPosts);
        }, 0);
    }, [posts, pagination, onPostsChange, onPaginationChange]);

    const loadMorePosts = useCallback(async () => {
        if (!pagination.hasMore) {
            return;
        }

        const nextPage = pagination.currentPage + 1;
        const cacheKey = `posts-page-${nextPage}`;
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
            const response = await fetch(`/api/community/posts?page=${nextPage}`, {
                method: 'GET',
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
            
            if (data.success && data.posts) {
                const newPosts = [...posts, ...data.posts];
                
                onPostsChange(newPosts);
                onPaginationChange(data.pagination);
                
                // Cache this page
                postCache.set(cacheKey, { posts: data.posts, pagination: data.pagination });
                markLoadEnd();
                
                // Show success message if posts were loaded (only in production to avoid spam during development)
                if (data.posts.length > 0 && process.env.NODE_ENV === 'production') {
                    toast.success(`Loaded ${data.posts.length} more posts!`, {
                        position: 'bottom-right',
                        autoClose: 2000,
                    });
                }
            } else {
                throw new Error(data.message || 'Failed to load posts');
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
            toast.error('Failed to load more posts. Please try again.', {
                position: 'top-right',
                autoClose: 5000,
            });
            throw error;
        }
    }, [posts, pagination, onPostsChange, onPaginationChange, recordCacheHit, recordCacheMiss, markLoadStart, markLoadEnd]);

    // Use infinite scroll hook with a smaller threshold
    const { isLoading: isLoadingMore } = useInfiniteScroll(
        loadMorePosts,
        pagination.hasMore,
        { threshold: 500 } // Reduced threshold for more sensitive detection
    );

    // Debounce utility function
    const debounceScrollHandler = useMemo(() => {
        let timeout: NodeJS.Timeout;
        return (func: Function) => {
            return (...args: any[]) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), 300);
            };
        };
    }, []);

    // Additional scroll detection as backup
    useEffect(() => {
        const handleScroll = () => {
            if (!pagination.hasMore || isLoadingMore) return;
            
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.offsetHeight;
            
            // Trigger when 80% through the page
            if (scrollPosition >= documentHeight * 0.8) {
                loadMorePosts();
            }
        };

        const debouncedHandleScroll = debounceScrollHandler(handleScroll);
        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
        };
    }, [pagination.hasMore, isLoadingMore, loadMorePosts, debounceScrollHandler]);

    // Optimize prefetch with better timing and idle callback
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
                    }
                }
            }
        };

        // Use requestIdleCallback for prefetch to avoid blocking main thread
        const idleCallback = () => {
            prefetchNextPage();
        };

        const timer = setTimeout(() => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(idleCallback);
            } else {
                idleCallback();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [posts.length, pagination]);

    // Memoize heavy UI computations
    const shouldShowLoadMoreButton = useMemo(() => {
        return pagination.hasMore && !isLoadingMore;
    }, [pagination.hasMore, isLoadingMore]);

    const postProgressText = useMemo(() => {
        return `Showing ${posts.length} of ${pagination.total} posts`;
    }, [posts.length, pagination.total]);

    // Memoize post change handler to prevent recreation
    const handlePostChange = useCallback((updatedPost: CommunityPost) => {
        const newPosts = posts.map(p => 
            String(p.id) === String(updatedPost.id) ? updatedPost : p
        );
        onPostsChange(newPosts);
        
        // Defer cache update
        setTimeout(() => {
            postCache.set('community-posts', newPosts);
        }, 0);
    }, [posts, onPostsChange]);

    // Handle post deletion
    const handlePostDelete = useCallback((deletedPostId: string | number) => {
        const newPosts = posts.filter(p => String(p.id) !== String(deletedPostId));
        onPostsChange(newPosts);
        
        // Update pagination count
        onPaginationChange({
            ...pagination,
            total: Math.max(0, pagination.total - 1)
        });
        
        // Defer cache update
        setTimeout(() => {
            postCache.set('community-posts', newPosts);
            postCache.invalidatePattern('posts-page-.*');
        }, 0);
    }, [posts, pagination, onPostsChange, onPaginationChange]);

    return (
        <section className="py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="lg:flex lg:gap-6 xl:gap-8 lg:items-start">
                    {/* Sidebar */}
                    <MemoizedCommunitySidebar />
                    
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
                            <MemoizedPostCreationForm
                                onPostCreated={handlePostCreated}
                                isAuthenticated={isAuthenticated}
                                className="mb-6 sm:mb-8"
                            />
                            
                            {/* Community Posts */}
                            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                {sortedPosts.length > 0 ? (
                                    sortedPosts.map((post) => (
                                        <MemoizedPostCard
                                            key={`${post.id}-${post.timestamp}`}
                                            post={post}
                                            isAuthenticated={isAuthenticated}
                                            onPostChange={handlePostChange}
                                            onPostDelete={handlePostDelete}
                                            currentUserId={currentUser?.id}
                                        />
                                    ))
                                ) : (
                                    /* Empty state */
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-2M3 4h6l4 4v8a2 2 0 01-2 2H7l-4 4V8a2 2 0 012-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                                        <p className="text-gray-500 mb-4">Be the first to share your moving journey!</p>
                                        {isAuthenticated && (
                                            <p className="text-sm text-gray-400">Use the form above to create your first post.</p>
                                        )}
                                    </div>
                                )}
                                
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

                            {/* Manual Load More Button - Always show when there are more posts */}
                            {shouldShowLoadMoreButton && (
                                <div className="text-center mt-6 sm:mt-8 py-4 sm:py-6">
                                    <button
                                        onClick={loadMorePosts}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1A237E] to-[#17B7C7] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                        Load More Posts
                                    </button>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                        {postProgressText}
                                    </p>
                                </div>
                            )}

                            {/* Debug: Show when button should be visible */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="text-center mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                    <p>Button visibility: hasMore={pagination.hasMore ? 'true' : 'false'}, 
                                    isLoading={isLoadingMore ? 'true' : 'false'}, 
                                    postsLength={posts.length}</p>
                                </div>
                            )}

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