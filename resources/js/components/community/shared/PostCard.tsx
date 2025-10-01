import { useState } from 'react';
import { CommunityPost } from '@/types/community';
import UserAvatar from './UserAvatar';
import PostInteractions from './PostInteractions';
import CommentSection from './CommentSection';

interface PostCardProps {
    post: CommunityPost;
    isAuthenticated?: boolean;
    onPostChange: (updatedPost: CommunityPost) => void;
}

export default function PostCard({ 
    post, 
    isAuthenticated = false, 
    onPostChange 
}: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const handleLikeChange = (postId: string | number, liked: boolean, likesCount: number) => {
        onPostChange({
            ...post,
            liked,
            likes: likesCount
        });
    };

    const handleShareChange = (postId: string | number, sharesCount: number) => {
        onPostChange({
            ...post,
            shares: sharesCount
        });
    };

    const handleToggleComments = async (postId: string | number) => {
        const isCurrentlyShowing = showComments;
        setShowComments(!isCurrentlyShowing);

        if (!isCurrentlyShowing && !commentsLoaded) {
            try {
                const response = await fetch(`/api/community/posts/${String(postId)}/comments`);
                const data = await response.json();
                if (data.success) {
                    setComments(data.comments);
                    setCommentsLoaded(true);
                }
            } catch (error) {
                console.error('Error loading comments:', error);
            }
        }
    };

    const handleCommentsChange = (postId: string | number, updatedComments: any[]) => {
        setComments(updatedComments);
    };

    const handleCommentCountChange = (postId: string | number, change: number) => {
        onPostChange({
            ...post,
            comments: Math.max(0, post.comments + change)
        });
    };

    // Determine if this is a shared post
    const isSharedPost = post.post_type === 'shared' && post.original_post;
    const displayPost = isSharedPost ? post.original_post! : post;
    const displayUserId = isSharedPost ? post.original_post!.user_id : post.user_id;
    const displayUserName = isSharedPost ? post.original_post!.userName : post.userName;
    const displayUserAvatar = isSharedPost ? post.original_post!.userAvatar : post.userAvatar;
    const displayLocation = isSharedPost ? post.original_post!.location : post.location;
    const displayContent = isSharedPost ? post.original_post!.content : post.content;

    return (
        <div className="border-b border-gray-100 pb-6 last:border-b-0">
            {/* Shared post header */}
            {isSharedPost && (
                <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                        </svg>
                        <button 
                            onClick={() => window.location.href = `/user/${post.user_id}`}
                            className="font-medium text-[#1A237E] hover:text-[#17B7C7] transition-colors cursor-pointer"
                        >
                            {post.userName}
                        </button>
                        <span>shared</span>
                        <span className="text-gray-500">{post.timestamp}</span>
                    </div>
                </div>
            )}
            
            <div className="flex items-start space-x-4">
                <UserAvatar 
                    userId={displayUserId}
                    userName={displayUserName}
                    avatar={displayUserAvatar}
                    size="large"
                />
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                        <button 
                            onClick={() => window.location.href = `/user/${displayUserId}`}
                            className="font-semibold text-[#1A237E] hover:text-[#17B7C7] transition-colors cursor-pointer"
                        >
                            {displayUserName}
                        </button>
                        <span className="text-sm text-gray-500">
                            {isSharedPost ? displayPost.timestamp : post.timestamp}
                        </span>
                        {displayLocation && (
                            <span className="text-xs bg-[#E0F7FA] text-[#1A237E] px-2 py-1 rounded-full">
                                📍 {displayLocation}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{displayContent}</p>
                    
                    {/* Post Interactions - always use the original post's interaction data for shared posts */}
                    <PostInteractions
                        postId={isSharedPost ? post.original_post!.id : post.id}
                        liked={post.liked || false}
                        likes={isSharedPost ? post.original_post!.likes : post.likes}
                        comments={isSharedPost ? post.original_post!.comments : post.comments}
                        shares={isSharedPost ? post.original_post!.shares : post.shares}
                        isAuthenticated={isAuthenticated}
                        onLikeChange={handleLikeChange}
                        onShareChange={handleShareChange}
                        onToggleComments={handleToggleComments}
                    />
                    
                    {/* Comments Section - always use the original post's comments for shared posts */}
                    <CommentSection
                        postId={isSharedPost ? post.original_post!.id : post.id}
                        isVisible={showComments}
                        comments={comments}
                        isAuthenticated={isAuthenticated}
                        onCommentsChange={handleCommentsChange}
                        onCommentCountChange={handleCommentCountChange}
                    />
                </div>
            </div>
        </div>
    );
}