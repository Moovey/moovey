import { useState, useCallback, useEffect, useMemo } from 'react';
import { CommunityPost, User } from '@/types/community';
import { router, Link } from '@inertiajs/react';
import { toast } from 'react-toastify';
import OptimizedPostCard from './shared/OptimizedPostCard';
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
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [showPostForm, setShowPostForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        if (files.length + selectedImages.length > 4) {
            toast.warn('You can only upload up to 4 images per post');
            return;
        }
        
        const maxSize = 2 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
            toast.error('Some images are too large. Please select images under 2MB each.', {
                position: 'top-right',
                autoClose: 5000,
            });
            return;
        }
        
        setSelectedImages(prev => [...prev, ...files]);
        setSelectedVideo(null);
        e.target.value = '';
    }, [selectedImages.length]);

    const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 7 * 1024 * 1024;
            
            if (file.size > maxSize) {
                toast.error('Video file is too large. Please select a video under 7MB.', {
                    position: 'top-right',
                    autoClose: 5000,
                });
                e.target.value = '';
                return;
            }
            
            setSelectedVideo(file);
            setSelectedImages([]);
        }
        e.target.value = '';
    }, []);

    const removeImage = useCallback((index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    const removeVideo = useCallback(() => {
        setSelectedVideo(null);
    }, []);

    const addEmoji = useCallback((emoji: string) => {
        setNewPostContent(prev => prev + emoji);
        setShowEmojiPicker(false);
    }, []);

    const handleCreatePost = useCallback(async () => {
        if (!isAuthenticated) {
            toast.info('🔐 Please log in to create posts', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (!newPostContent.trim()) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (newPostLocation) formData.append('location', newPostLocation);
            
            selectedImages.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });
            
            if (selectedVideo) {
                formData.append('video', selectedVideo);
            }

            const response = await fetch('/api/community/posts', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const textContent = await response.text();
                
                if (textContent.includes('Page Expired') || textContent.includes('419')) {
                    throw new Error('CSRF token expired. Please refresh the page and try again.');
                } else if (textContent.includes('Unauthenticated') || textContent.includes('401')) {
                    throw new Error('You need to be logged in to create posts.');
                } else {
                    throw new Error('Server returned an unexpected response. Please try again.');
                }
            }
            
            if (data.success) {
                const newPosts = [data.post, ...posts];
                onPostsChange(newPosts);
                
                // Clear form
                setNewPostContent('');
                setNewPostLocation('');
                setSelectedImages([]);
                setSelectedVideo(null);
                setShowPostForm(false);
                
                // Update pagination
                onPaginationChange({
                    ...pagination,
                    total: pagination.total + 1
                });
                
                // Invalidate cache
                postCache.invalidatePattern('posts-page-.*');
                postCache.set('community-posts', newPosts);
                
                toast.success('🎉 Your post has been shared with the community!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                throw new Error(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create post', {
                position: 'top-right',
                autoClose: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isAuthenticated,
        newPostContent,
        newPostLocation,
        selectedImages,
        selectedVideo,
        posts,
        pagination,
        onPostsChange,
        onPaginationChange
    ]);

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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex gap-8">
                    {/* Left Sidebar - Memoized to prevent re-renders */}
                    <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-lg">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#17B7C7] to-[#1A237E] rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8-9M7 13l-1.8-9m0 0h15.75M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6M9 9h6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Moovey Marketplace</h3>
                                <p className="text-gray-600 text-sm mb-4">Find great deals on items others are decluttering</p>
                                <Link
                                    href="/marketplace"
                                    className="w-full bg-gradient-to-r from-[#17B7C7] to-[#1A237E] text-white px-4 py-2 rounded-lg font-medium hover:from-[#139AAA] hover:to-[#0D1957] transition-all duration-200 transform hover:scale-105 shadow-md inline-block text-center"
                                >
                                    Browse Marketplace
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-lg">
                            <h4 className="font-semibold text-gray-900 mb-4">Community Stats</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Active Members</span>
                                    <span className="font-semibold text-[#17B7C7]">1,247+</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Posts Today</span>
                                    <span className="font-semibold text-[#17B7C7]">42</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Items Listed</span>
                                    <span className="font-semibold text-[#17B7C7]">156</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-lg">
                            <h4 className="font-semibold text-gray-900 mb-4">Quick Tools</h4>
                            <div className="space-y-2">
                                <button
                                    onClick={() => window.location.href = '/tools?tool=4'}
                                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Declutter List
                                </button>
                                <button
                                    onClick={() => window.location.href = '/tools?tool=0'}
                                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M12 3l9 9-3 3v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6l-3-3 9-9z"/>
                                    </svg>
                                    Mortgage Calculator
                                </button>
                                <button
                                    onClick={() => window.location.href = '/tools?tool=3'}
                                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-[#17B7C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                    </svg>
                                    Volume Calculator
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 max-w-4xl">
                        {/* User Profile Header */}
                        {isAuthenticated && currentUser && (
                            <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                                <button 
                                    onClick={() => window.location.href = `/user/${currentUser.id}`}
                                    className="w-full flex items-center space-x-4 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                    <UserAvatar 
                                        userId={currentUser.id}
                                        userName={currentUser.name}
                                        avatar={currentUser.avatar}
                                        size="large"
                                        clickable={false}
                                    />
                                    <div className="flex-1 text-left">
                                        <h3 className="text-xl font-semibold text-[#1A237E] group-hover:text-[#17B7C7] transition-colors">
                                            {currentUser.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Click to view your profile and posts
                                        </p>
                                    </div>
                                    <div className="text-[#17B7C7] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-[#1A237E] mb-2">Community Feed</h2>
                                    <p className="text-gray-600">Share your moving journey and connect with others</p>
                                </div>
                                {isAuthenticated ? (
                                    <button 
                                        onClick={() => setShowPostForm(!showPostForm)}
                                        className="bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors shadow-lg"
                                    >
                                        Create Post
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-2">Want to create posts?</p>
                                        <a 
                                            href="/login" 
                                            className="bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors shadow-lg text-sm inline-block"
                                        >
                                            Log In
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            {/* Post Creation Form */}
                            {showPostForm && (
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                                    <div className="p-4">
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="What's on your mind? Share your moving experience, ask questions, or offer advice to fellow movers..."
                                            className="w-full p-3 border-none resize-none focus:outline-none text-gray-900 text-lg placeholder-gray-500"
                                            rows={3}
                                            disabled={isSubmitting}
                                        />
                                        
                                        <input
                                            type="text"
                                            value={newPostLocation}
                                            onChange={(e) => setNewPostLocation(e.target.value)}
                                            placeholder="📍 Add location (optional)"
                                            className="w-full p-3 mt-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                                            disabled={isSubmitting}
                                        />
                                        
                                        {/* Media Preview */}
                                        {(selectedImages.length > 0 || selectedVideo) && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                {selectedImages.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {selectedImages.map((image, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    src={URL.createObjectURL(image)}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-32 object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    onClick={() => removeImage(index)}
                                                                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-90"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {selectedVideo && (
                                                    <div className="relative">
                                                        <video
                                                            src={URL.createObjectURL(selectedVideo)}
                                                            className="w-full h-48 object-cover rounded-lg"
                                                            controls
                                                        />
                                                        <button
                                                            onClick={removeVideo}
                                                            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-90"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Emoji Picker */}
                                    {showEmojiPicker && (
                                        <div className="px-4 pb-4">
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                                <div className="grid grid-cols-8 gap-2">
                                                    {['😀', '😂', '😊', '😍', '🤔', '😢', '😮', '👍', '👎', '❤️', '🎉', '🏠', '📦', '🚚', '✨', '💪'].map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => addEmoji(emoji)}
                                                            className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Action Bar */}
                                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <label className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium">Photo</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                    disabled={isSubmitting || selectedVideo !== null}
                                                />
                                            </label>
                                            
                                            <label className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                </svg>
                                                <span className="text-sm font-medium">Video</span>
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoSelect}
                                                    className="hidden"
                                                    disabled={isSubmitting || selectedImages.length > 0}
                                                />
                                            </label>
                                            
                                            <button
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                <span className="text-lg">😊</span>
                                                <span className="text-sm font-medium">Emoji</span>
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    setShowPostForm(false);
                                                    setSelectedImages([]);
                                                    setSelectedVideo(null);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreatePost}
                                                disabled={!newPostContent.trim() || isSubmitting}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Posting...' : 'Post'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Community Posts */}
                            <div className="space-y-8">
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
                                    <div className="border-b border-gray-100 pb-8">
                                        <div className="flex items-start space-x-4 animate-pulse">
                                            <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                                <div className="flex items-center space-x-8">
                                                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* End of posts message */}
                            {!pagination.hasMore && posts.length > 0 && (
                                <div className="text-center mt-8 py-6 border-t border-gray-200">
                                    <p className="text-gray-600 font-medium">🎉 You've seen all posts!</p>
                                    <p className="text-sm text-gray-500 mt-1">
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