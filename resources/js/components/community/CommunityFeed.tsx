import { useState } from 'react';
import { CommunityPost, User } from '@/types/community';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import PostCard from './shared/PostCard';
import UserAvatar from './shared/UserAvatar';

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

export default function CommunityFeed({ 
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
    const [isLoadingMore, setIsLoadingMore] = useState(false);




    const handleCreatePost = async () => {
        if (!isAuthenticated) {
            toast.info('🔐 Please log in to create posts', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        if (!newPostContent.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/community/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    content: newPostContent,
                    location: newPostLocation || null,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                onPostsChange([data.post, ...posts]);
                setNewPostContent('');
                setNewPostLocation('');
                setShowPostForm(false);
                // Update pagination total count
                onPaginationChange({
                    ...pagination,
                    total: pagination.total + 1
                });
                toast.success('🎉 Your post has been shared with the community!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.error('❌ Failed to create post. Please try again.', {
                    position: 'top-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('🚫 Network error. Please check your connection and try again.', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoadMorePosts = async () => {
        if (isLoadingMore || !pagination.hasMore) return;

        setIsLoadingMore(true);

        try {
            const response = await fetch(`/api/community/posts?page=${pagination.currentPage + 1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                onPostsChange([...posts, ...data.posts]);
                onPaginationChange(data.pagination);
            } else {
                toast.error('⚠️ Failed to load more posts. Please try again.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
            toast.error('🚫 Network error while loading posts. Please try again.', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsLoadingMore(false);
        }
    };



    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* User Profile Header - Clickable to go to own profile */}
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
                        <div className="bg-[#E0F7FA] rounded-xl p-6 mb-8 border-2 border-[#17B7C7]">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What's on your mind? Share your moving experience, ask questions, or offer advice to fellow movers..."
                                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] resize-none transition-colors text-gray-900"
                                rows={4}
                                disabled={isSubmitting}
                            />
                            <input
                                type="text"
                                value={newPostLocation}
                                onChange={(e) => setNewPostLocation(e.target.value)}
                                placeholder="Location (optional) - e.g., London, Manchester"
                                className="w-full p-3 mt-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] transition-colors text-gray-900"
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>💡 Tip: Share specific details to help others with similar moves</span>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowPostForm(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={!newPostContent.trim() || isSubmitting}
                                        className="bg-[#17B7C7] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        {isSubmitting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Community Posts */}
                    <div className="space-y-8">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                isAuthenticated={isAuthenticated}
                                onPostChange={(updatedPost) => {
                                    onPostsChange(posts.map(p => 
                                        String(p.id) === String(updatedPost.id) ? updatedPost : p
                                    ));
                                }}
                            />
                        ))}
                        
                        {/* Loading skeleton when loading more posts */}
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

                    {/* Load More */}
                    {pagination.hasMore && (
                        <div className="text-center mt-8">
                            <button 
                                onClick={handleLoadMorePosts}
                                disabled={isLoadingMore}
                                className="bg-[#17B7C7] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isLoadingMore ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    'Load More Posts'
                                )}
                            </button>
                            <p className="text-sm text-gray-500 mt-2">
                                Showing {posts.length} of {pagination.total} posts
                            </p>
                        </div>
                    )}
                    
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
        </section>
    );
}